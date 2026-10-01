/**
 * landslideAlertService.js
 *
 * Responsibilities:
 *  1. Watch the risk engine and trigger Alert documents when landslide risk
 *     crosses severity thresholds.
 *  2. Resolve targeted recipients by district + role (DDMA, SDRF, village_fp).
 *  3. Dispatch per-recipient notifications with language chosen at send time.
 *  4. Persist the alert with full provenance (risk score, rainfall, zone).
 *
 * Thresholds (aligned with IMD / NDMA guidelines):
 *   riskScore >= 75  → CRITICAL  (all channels: push + email + SMS + in-app)
 *   riskScore >= 55  → HIGH      (push + in-app)
 *   riskScore >= 35  → MODERATE  (in-app only)
 *   < 35             → no alert
 */

"use strict";

const Alert    = require("../models/Alert");
const { createNotification } = require("./notificationService");
const { alertQueue } = require("./alertQueue");
const { buildLocalizedContent } = require("../utils/alertI18n");
const { emitNewAlert }          = require("../sockets/alertSocket");

// ---------------------------------------------------------------------------
// Role → districts mapping (which district officers belong to which roles)
// Pulled from DB at runtime; this is the default bootstrap set for NER.
// ---------------------------------------------------------------------------
const NER_DISTRICT_ROLE_MAP = {
  // Assam
  "Kamrup Metropolitan": ["ddma", "sdrf"],
  "Goalpara":            ["ddma", "sdrf", "village_fp"],
  "Cachar":              ["ddma", "sdrf", "village_fp"],
  "Sivasagar":           ["ddma"],
  // Meghalaya
  "East Khasi Hills":    ["ddma", "sdrf", "village_fp"],
  "West Khasi Hills":    ["ddma", "village_fp"],
  "Ri Bhoi":             ["ddma", "sdrf"],
  // Manipur
  "Imphal East":         ["ddma", "sdrf"],
  "Churachandpur":       ["ddma", "village_fp"],
  // Nagaland
  "Kohima":              ["ddma", "sdrf"],
  // Mizoram
  "Aizawl":              ["ddma", "sdrf"],
  // Tripura
  "West Tripura":        ["ddma", "sdrf"],
  // Sikkim
  "East Sikkim":         ["ddma", "sdrf", "village_fp"],
  // Arunachal Pradesh
  "Papum Pare":          ["ddma", "sdrf"],
};

// Severity thresholds
const THRESHOLDS = {
  CRITICAL: 75,
  HIGH:     55,
  MODERATE: 35,
};

// Channel strategy per severity
const CHANNEL_MAP = {
  CRITICAL: ["in-app", "push", "email", "sms"],
  HIGH:     ["in-app", "push"],
  MODERATE: ["in-app"],
};

// Roles that are always in scope for authority alerts
const AUTHORITY_ROLES = ["ddma", "sdrf", "village_fp", "operator", "admin"];

// ---------------------------------------------------------------------------
// Deduplication: avoid re-alerting the same zone within cooldown window
// ---------------------------------------------------------------------------
const _recentAlertCache = new Map();   // key: `${zoneId}:${level}`, value: timestamp

function _isOnCooldown(zoneId, level) {
  const cooldownMs = level === "CRITICAL" ? 20 * 60 * 1000  // 20 min
    : level === "HIGH"     ? 45 * 60 * 1000  // 45 min
    : 120 * 60 * 1000;                         // 2 h for MODERATE

  const key = `${zoneId}:${level}`;
  const last = _recentAlertCache.get(key);
  if (last && Date.now() - last < cooldownMs) return true;
  _recentAlertCache.set(key, Date.now());
  return false;
}

// ---------------------------------------------------------------------------
// Determine severity from riskScore
// ---------------------------------------------------------------------------
function _severityFromScore(score) {
  if (score >= THRESHOLDS.CRITICAL) return "CRITICAL";
  if (score >= THRESHOLDS.HIGH)     return "HIGH";
  if (score >= THRESHOLDS.MODERATE) return "MODERATE";
  return null;
}

// ---------------------------------------------------------------------------
// Build the MongoDB severity string (Alert schema uses lowercase)
// ---------------------------------------------------------------------------
function _mongoSeverity(level) {
  return level.toLowerCase();
}

// ---------------------------------------------------------------------------
// Resolve target districts from zone data
// ---------------------------------------------------------------------------
function _districtsForZone(zone) {
  // Use explicit district list if provided by risk engine
  if (Array.isArray(zone.districts) && zone.districts.length) return zone.districts;
  // Fallback: derive from zone name
  const zoneName = zone.name || "";
  return Object.keys(NER_DISTRICT_ROLE_MAP).filter((d) =>
    zoneName.toLowerCase().includes(d.toLowerCase())
  ) || [zoneName];
}

// ---------------------------------------------------------------------------
// Resolve target roles from districts
// ---------------------------------------------------------------------------
function _rolesForDistricts(districts) {
  const roleSet = new Set(["public"]);
  for (const d of districts) {
    const roles = NER_DISTRICT_ROLE_MAP[d] || [];
    roles.forEach((r) => roleSet.add(r));
  }
  return [...roleSet];
}

// ---------------------------------------------------------------------------
// Find users targeted by district + role, including public users in the area
// ---------------------------------------------------------------------------
async function _findTargetedUsers(districts, roles, zoneCenter, radiusKm) {
  const query = { isActive: true };
  const andConditions = [];

  // Authority users: match by role or district in their address/city field
  if (roles.some((r) => AUTHORITY_ROLES.includes(r))) {
    andConditions.push({
      $or: [
        { role: { $in: roles.filter((r) => r !== "public") } },
        {
          city: {
            $in: districts.map((d) => new RegExp(d.split(" ")[0], "i")),
          },
        },
      ],
    });
  }

  // Geographic geo-query for general public users
  if (zoneCenter && zoneCenter.coordinates) {
    const [lon, lat] = zoneCenter.coordinates;
    query.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [lon, lat] },
        $maxDistance: (radiusKm || 50) * 1000,
      },
    };
  }

  // Authority users (role-based, district-keyed)
  let authorityUsers = [];
  if (andConditions.length) {
    try {
      authorityUsers = await User.find({
        isActive: true,
        $or: andConditions[0].$or,
      })
        .select("_id name email phone role preferredLanguage fcmToken city state")
        .lean();
    } catch (e) {
      console.error("[LandslideAlert] authority user query error:", e.message);
    }
  }

  // Geo-located users
  let geoUsers = [];
  try {
    geoUsers = await User.find(query)
      .select("_id name email phone role preferredLanguage fcmToken city state")
      .limit(500)
      .lean();
  } catch (e) {
    // If geo query fails (no 2dsphere ready), fall back to broad query
    try {
      geoUsers = await User.find({ isActive: true })
        .select("_id name email phone role preferredLanguage fcmToken city state")
        .limit(500)
        .lean();
    } catch (e2) {
      console.error("[LandslideAlert] geo user query fallback error:", e2.message);
    }
  }

  // Merge and deduplicate
  const seen = new Set();
  const merged = [];
  for (const u of [...authorityUsers, ...geoUsers]) {
    const id = u._id.toString();
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(u);
    }
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Core: generate and dispatch a landslide alert for one risk zone
// ---------------------------------------------------------------------------
async function generateAlertForZone(zone) {
  const riskScore = zone.overallRiskScore || 0;
  const level = _severityFromScore(riskScore);
  if (!level) return null;   // below MODERATE threshold – no alert

  const zoneId = zone.id || zone.name;
  if (_isOnCooldown(zoneId, level)) return null;  // deduplicated

  const districts   = _districtsForZone(zone);
  const targetRoles = _rolesForDistricts(districts);
  const primaryDistrict = districts[0] || zone.name || "NER Region";

  // Build localised content for all 6 languages
  const ctx = {
    alertType: "landslide",
    severity: level,
    district: primaryDistrict,
    riskScore,
    rain24h: zone.rainfall?.rain24h ?? 0,
    rain72h: zone.rainfall?.rain72h ?? 0,
  };

  const localizedContent = buildLocalizedContent(ctx);
  const defaultLang = localizedContent.find((l) => l.lang === "en");

  // Construct geospatial centre from zone boundary centroid
  const boundary = zone.boundaryCoordinates || [];
  let centerLon = 91.88;
  let centerLat = 25.57;
  if (boundary.length) {
    centerLat = boundary.reduce((s, p) => s + p.lat, 0) / boundary.length;
    centerLon = boundary.reduce((s, p) => s + p.lng, 0) / boundary.length;
  }

  const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours

  // ── 1. Persist Alert document ─────────────────────────────────────────────
  let alert;
  try {
    alert = await Alert.create({
      title:          defaultLang.title,
      message:        defaultLang.message,
      localizedContent,
      type:           "landslide",
      severity:       _mongoSeverity(level),
      status:         "active",
      location: {
        type:        "Point",
        coordinates: [centerLon, centerLat],
      },
      radiusKm:        zone.radiusKm || 30,
      targetDistricts: districts,
      targetRoles,
      feedSource:      "LANDSLIDE_RISK_ENGINE",
      sourceAgency:    "NER Landslide Risk Engine",
      isGovtOfficial:  false,
      urgency:         level === "CRITICAL" ? "Immediate" : "Expected",
      certainty:       "Likely",
      expiresAt,
      instructions:    defaultLang.instructions,
      affectedAreas:   [zone.name, ...districts],
      landslideRiskScore: riskScore,
      landslideRiskLevel: level,
      rainfallTrigger: {
        rain24h:     zone.rainfall?.rain24h ?? null,
        rain72h:     zone.rainfall?.rain72h ?? null,
        imdCategory: zone.rainfall?.imdCategory ?? null,
      },
      ackSlaMinutes: level === "CRITICAL" ? 15 : 30,
      metadata: {
        zoneId,
        zoneName:    zone.name,
        state:       zone.state,
        activeSensorsCount: zone.activeSensorsCount,
        populationAtRisk:   zone.populationAtRisk,
      },
    });
  } catch (err) {
    console.error("[LandslideAlert] Failed to create Alert document:", err.message);
    return null;
  }

  // ── 2. Broadcast to Socket.IO "alerts" room ───────────────────────────────
  emitNewAlert(alert.toObject());

  // ── 3. Find targeted users and dispatch per-recipient notifications ────────
  const zoneCenter = { coordinates: [centerLon, centerLat] };
  const users = await _findTargetedUsers(districts, targetRoles, zoneCenter, zone.radiusKm || 30);

  const channels = CHANNEL_MAP[level];

  console.log(
    `[LandslideAlert] Zone: ${zone.name} | Level: ${level} | Score: ${riskScore} | Enqueueing fan-out to ${users.length} users`
  );

  // Enqueue to asynchronous alert fanout queue
  await alertQueue.enqueueFanout({
    alertId: alert._id,
    alertType: "disaster_alert",
    severity: level,
    users,
    localizedContent,
    channels,
    priority: level === "CRITICAL" ? "critical" : level === "HIGH" ? "high" : "normal",
  });

  return {
    alertId:      alert._id,
    zoneId,
    level,
    riskScore,
    targetedUsers: users.length,
    districts,
    roles: targetRoles,
  };
}

// ---------------------------------------------------------------------------
// Batch-run across all active risk zones from the risk engine
// ---------------------------------------------------------------------------
async function checkAndGenerateLandslideAlerts() {
  const riskEngineService = require("./riskEngineService");

  let zones;
  try {
    zones = await riskEngineService.getAllZones();
  } catch (err) {
    console.error("[LandslideAlert] Could not fetch risk zones:", err.message);
    return [];
  }

  const results = [];
  for (const zone of zones) {
    // Only process zones with landslide as primary hazard
    if (zone.primaryHazard !== "landslide") continue;

    const result = await generateAlertForZone(zone);
    if (result) results.push(result);
  }

  if (results.length) {
    console.log(
      `[LandslideAlert] Generated ${results.length} landslide alert(s): `,
      results.map((r) => `${r.zoneId}→${r.level}`).join(", ")
    );
  }

  return results;
}

module.exports = {
  checkAndGenerateLandslideAlerts,
  generateAlertForZone,
};
