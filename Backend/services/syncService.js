const SyncOperation = require("../models/SyncOperation");
const Incident = require("../models/Incident");
const familyService = require("./familyService");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAP_INCIDENT_TYPES = {
  flood: "flooding",
  flooding: "flooding",
  landslide: "slope_movement",
  landslide_crack: "landslide_crack",
  slope_movement: "slope_movement",
  crack: "landslide_crack",
  blocked_road: "blocked_road",
  road_blocked: "blocked_road",
  soil_erosion: "soil_erosion",
  bridge_damage: "bridge_damage",
  bridge: "bridge_damage",
  cyclone: "other",
  earthquake: "other",
  fire: "other",
  other: "other",
};

function normalizeIncidentType(rawType) {
  if (!rawType) return "other";
  const key = String(rawType).trim().toLowerCase().replace(/[\s-]+/g, "_");
  return MAP_INCIDENT_TYPES[key] || "other";
}

function parseGeoLocation(rawLoc) {
  if (!rawLoc) {
    // Default NER coordinate fallback (Guwahati)
    return { type: "Point", coordinates: [91.7362, 26.1445] };
  }

  // If already GeoJSON
  if (rawLoc.type === "Point" && Array.isArray(rawLoc.coordinates)) {
    return rawLoc;
  }

  // If array [lng, lat]
  if (Array.isArray(rawLoc) && rawLoc.length === 2) {
    const [lng, lat] = rawLoc.map(Number);
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return { type: "Point", coordinates: [lng, lat] };
    }
  }

  // If object { latitude, longitude } or { lat, lng }
  if (typeof rawLoc === "object") {
    const lat = Number(rawLoc.latitude ?? rawLoc.lat);
    const lng = Number(rawLoc.longitude ?? rawLoc.lng ?? rawLoc.lon);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { type: "Point", coordinates: [lng, lat] };
    }
  }

  // If string "lat, lng"
  if (typeof rawLoc === "string") {
    const parts = rawLoc.split(",").map((s) => Number(s.trim()));
    if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      // User entered "lat, lng" in text box
      return { type: "Point", coordinates: [parts[1], parts[0]] };
    }
  }

  return { type: "Point", coordinates: [91.7362, 26.1445] };
}

// ─── Resource Handlers ────────────────────────────────────────────────────────

const applyFamilyOperation = async (userId, operation) => {
  const payload = operation.payload || {};

  switch (operation.action) {
    case "upsert":
      return familyService.createOrUpdateFamily(userId, payload.members);
    case "add_member":
      return familyService.addFamilyMember(userId, payload);
    case "update_member":
      return familyService.updateFamilyMember(userId, payload.memberId, payload.member);
    case "delete_member":
      return familyService.deleteFamilyMember(userId, payload.memberId);
    case "update_safety":
      return familyService.updateSafetyStatus(userId, payload.memberId, payload.isSafe);
    default:
      throw new Error(`Unsupported family synchronization action: ${operation.action}`);
  }
};

const applyIncidentOperation = async (userId, operation) => {
  const payload = operation.payload || {};

  if (operation.action === "create") {
    // 1. Check deduplication via offlineId/operationId
    const opId = operation.operationId;
    const existing = await Incident.findOne({
      $or: [{ offlineId: opId }, { "media.filename": opId }],
    });
    if (existing) {
      return {
        _id: existing._id,
        isDuplicate: true,
        incident: existing,
      };
    }

    // 2. Normalise location and incident type
    const location = parseGeoLocation(payload.location || payload.coords);
    const incidentType = normalizeIncidentType(payload.incidentType || payload.type);

    // 3. Normalise media (supports canvas-compressed base64 dataUrls stored offline)
    const media = [];
    if (Array.isArray(payload.media)) {
      for (const m of payload.media) {
        if (typeof m === "string") {
          media.push({ url: m, filename: `offline-${Date.now()}.jpg`, provider: "local", resourceType: "image" });
        } else if (m && typeof m === "object") {
          media.push({
            url: m.dataUrl || m.url || "",
            filename: m.name || `offline-${Date.now()}.jpg`,
            provider: "local",
            resourceType: m.type?.startsWith("video") ? "video" : "image",
          });
        }
      }
    }

    const created = await Incident.create({
      reportedBy: userId,
      incidentType,
      severity: (payload.severity || "medium").toLowerCase(),
      description: payload.description || payload.desc || "Field report submitted offline",
      location,
      locationMeta: payload.locationMeta || {
        address: typeof payload.location === "string" ? payload.location : "",
        district: payload.district || "",
        state: payload.state || "",
      },
      witnessCount: Number(payload.witnessCount || payload.affectedPeople) || 1,
      isRoadBlocked: Boolean(payload.isRoadBlocked || payload.roadStatus === "Completely Blocked"),
      roadStatus: payload.roadStatus || (payload.isRoadBlocked ? "Completely Blocked" : "Clear"),
      crackWidth: payload.crackWidth != null ? Number(payload.crackWidth) : null,
      crackLength: payload.crackLength != null ? Number(payload.crackLength) : null,
      slopeTrend: payload.slopeTrend || "Stationary",
      demDerived: Boolean(payload.demDerived),
      demSource: payload.demSource || null,
      demElevationMeters: payload.demElevationMeters != null ? Number(payload.demElevationMeters) : null,
      lithology: payload.lithology || null,
      affectedVillages: Array.isArray(payload.affectedVillages)
        ? payload.affectedVillages
        : payload.affectedVillages
        ? [payload.affectedVillages]
        : [],
      media,
      offlineId: opId,
      syncedAt: new Date(),
    });

    return created;
  }

  if (operation.action === "update") {
    const incId = payload.incidentId || payload._id || payload.id;
    const incident = await Incident.findById(incId);
    if (!incident) {
      throw new Error(`Incident not found: ${incId}`);
    }

    // ── CONFLICT DETECTION ──
    const clientTime = operation.clientCreatedAt ? new Date(operation.clientCreatedAt) : null;
    let conflictResolution = "none";
    let conflictDetails = null;

    if (clientTime && incident.updatedAt && incident.updatedAt > clientTime) {
      // Server version is newer than the client snapshot!
      // If server already resolved or escalated by an authorized operator, server status wins
      if (["resolved", "escalated", "verified"].includes(incident.status)) {
        conflictResolution = "server_wins";
        conflictDetails = {
          reason: `Server has priority status: ${incident.status}`,
          serverUpdatedAt: incident.updatedAt,
          clientTime,
        };
        // Merge only non-status fields (e.g. notes or extra witnesses)
        if (payload.remarks) incident.remarks = `${incident.remarks || ""}\n[Offline Note]: ${payload.remarks}`.trim();
        await incident.save();
        return { ...incident.toObject(), conflictResolution, conflictDetails };
      } else {
        // Last-Write-Wins: Client edit applies, but conflict recorded
        conflictResolution = "client_wins";
        conflictDetails = {
          reason: "Client timestamp accepted via LWW conflict strategy",
          serverUpdatedAt: incident.updatedAt,
          clientTime,
        };
      }
    }

    if (payload.description) incident.description = payload.description;
    if (payload.severity) incident.severity = payload.severity.toLowerCase();
    if (payload.remarks) incident.remarks = payload.remarks;
    if (payload.isRoadBlocked !== undefined) incident.isRoadBlocked = Boolean(payload.isRoadBlocked);

    await incident.save();
    return { ...incident.toObject(), conflictResolution, conflictDetails };
  }

  if (operation.action === "resolve") {
    const incId = payload.incidentId || payload._id;
    const incident = await Incident.findById(incId);
    if (!incident) throw new Error(`Incident not found: ${incId}`);

    incident.status = "resolved";
    incident.remarks = payload.remarks || incident.remarks;
    incident.verifiedAt = new Date();
    await incident.save();
    return incident;
  }

  throw new Error(`Unsupported incident action: ${operation.action}`);
};

// ─── Core Process Operation ───────────────────────────────────────────────────

const processOperation = async (userId, deviceId, operation) => {
  const existing = await SyncOperation.findOne({
    user: userId,
    operationId: operation.operationId,
  });

  if (existing) {
    return {
      operationId: operation.operationId,
      status: "duplicate",
      resourceId: existing.resourceId,
      error: existing.error,
    };
  }

  try {
    let result;
    if (operation.resource === "family") {
      result = await applyFamilyOperation(userId, operation);
    } else if (operation.resource === "incident") {
      result = await applyIncidentOperation(userId, operation);
    } else {
      throw new Error(`Unsupported synchronization resource: ${operation.resource}`);
    }

    const conflictResolution = result?.conflictResolution || "none";
    const conflictDetails = result?.conflictDetails || null;

    const record = await SyncOperation.create({
      user: userId,
      deviceId,
      operationId: operation.operationId,
      resource: operation.resource,
      action: operation.action,
      payload: operation.payload || {},
      status: conflictResolution === "server_wins" ? "conflict" : "applied",
      conflictResolution,
      conflictDetails,
      resourceId: result?._id || null,
      result,
      clientCreatedAt: operation.clientCreatedAt || null,
    });

    return {
      operationId: operation.operationId,
      status: record.status,
      resourceId: record.resourceId,
      conflictResolution,
      conflictDetails,
    };
  } catch (error) {
    try {
      await SyncOperation.create({
        user: userId,
        deviceId,
        operationId: operation.operationId,
        resource: operation.resource,
        action: operation.action,
        payload: operation.payload || {},
        status: "rejected",
        error: error.message,
        clientCreatedAt: operation.clientCreatedAt || null,
      });
    } catch (recordError) {
      if (recordError.code !== 11000) throw recordError;
    }

    return {
      operationId: operation.operationId,
      status: "rejected",
      error: error.message,
    };
  }
};

const processBatch = async (userId, deviceId, operations) => {
  const accepted = [];
  const rejected = [];

  for (const operation of operations) {
    const result = await processOperation(userId, deviceId, operation);
    if (["applied", "duplicate", "conflict"].includes(result.status)) {
      accepted.push(result);
    } else {
      rejected.push(result);
    }
  }

  return {
    accepted,
    rejected,
    serverTime: new Date().toISOString(),
  };
};

/**
 * Get updates since a client timestamp to support 2-way sync and conflict detection
 */
const getChangesSince = async (userId, sinceDate, resource) => {
  const since = sinceDate ? new Date(sinceDate) : new Date(0);
  const result = {};

  if (!resource || resource === "incident") {
    result.incidents = await Incident.find({
      $or: [{ reportedBy: userId }, { status: { $in: ["verified", "escalated"] } }],
      updatedAt: { $gt: since },
    })
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();
  }

  if (!resource || resource === "family") {
    try {
      const family = await familyService.getFamilyByUser(userId);
      result.family = family;
    } catch {
      result.family = null;
    }
  }

  result.serverTime = new Date().toISOString();
  return result;
};

module.exports = { processBatch, getChangesSince };