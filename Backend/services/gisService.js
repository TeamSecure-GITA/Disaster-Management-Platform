/**
 * gisService.js – GIS data aggregation and heatmap generation service.
 *
 * Responsibilities:
 *  1. Serve live risk heatmap GeoJSON derived from riskEngineService zones + incidents
 *  2. Serve road segment status (from RoadSegment model, seeded with NER corridor data)
 *  3. Serve GIS layer features (villages, infrastructure, landslide inventory)
 *  4. Sync road status from NER corridors / nerLandslideService
 *  5. Seed baseline NER road corridors and infrastructure on first boot
 *
 * GeoJSON format everywhere → plug directly into Leaflet GeoJSON layer.
 */
"use strict";

const mongoose     = require("mongoose");
const RoadSegment  = require("../models/RoadSegment");
const GisLayer     = require("../models/GisLayer");
const riskEngine   = require("./riskEngineService");

// ---------------------------------------------------------------------------
// NER road corridor seed data
// Each entry represents a significant highway segment prone to landslides.
// ---------------------------------------------------------------------------
const NER_CORRIDOR_SEED = [
  {
    name: "NH-40 Shillong–Dawki (East Khasi Hills escarpment)",
    highwayCode: "NH-40", state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "LineString", coordinates: [
      [91.8800, 25.5700], [91.9000, 25.5900], [91.9300, 25.6100],
      [91.9500, 25.6300], [91.9700, 25.6500],
    ]},
    riskScore: 84, hazardType: "landslide", status: "restricted",
    isEvacuationRoute: true, statusSource: "model",
    statusNote: "Active debris flow risk km 38–52 during monsoon",
  },
  {
    name: "NH-27 Guwahati–Shillong (Meghalaya border section)",
    highwayCode: "NH-27", state: "Assam", district: "Kamrup Metro",
    geometry: { type: "LineString", coordinates: [
      [91.7400, 26.1500], [91.7800, 26.0800], [91.8200, 26.0200],
      [91.8800, 25.9500], [91.9100, 25.8800],
    ]},
    riskScore: 68, hazardType: "landslide", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    statusNote: "Single-lane restriction during heavy rain",
  },
  {
    name: "NH-54 Silchar–Aizawl corridor",
    highwayCode: "NH-54", state: "Mizoram", district: "Aizawl",
    geometry: { type: "LineString", coordinates: [
      [92.5900, 23.8300], [92.6300, 23.7800], [92.7100, 23.6800],
      [92.7800, 23.5800], [92.8400, 23.4700],
    ]},
    riskScore: 76, hazardType: "landslide", status: "restricted",
    isEvacuationRoute: false, statusSource: "model",
    statusNote: "High-cut slope zone – speed limit 20 km/h",
  },
  {
    name: "NH-2 Tezpur–Tawang lifeline (Arunachal Pradesh)",
    highwayCode: "NH-2", state: "Arunachal Pradesh", district: "West Kameng",
    geometry: { type: "LineString", coordinates: [
      [92.8000, 27.0000], [92.6500, 27.2000], [92.4500, 27.4500],
      [92.3000, 27.6500], [91.9000, 27.8500],
    ]},
    riskScore: 91, hazardType: "landslide", status: "blocked",
    isEvacuationRoute: false, statusSource: "field_report",
    statusNote: "Debris blocking carriageway at Km 145 (BRO clearing)",
  },
  {
    name: "NH-39 Dimapur–Imphal (Nagaland section)",
    highwayCode: "NH-39", state: "Nagaland", district: "Peren",
    geometry: { type: "LineString", coordinates: [
      [93.7800, 25.9000], [93.8200, 25.7500], [93.8900, 25.6000],
      [93.9400, 25.4500], [93.9900, 25.3000],
    ]},
    riskScore: 72, hazardType: "landslide", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    statusNote: "Slippery surface – truck restriction after 2200h",
  },
  {
    name: "Brahmaputra Floodplain Embankment Road (Assam)",
    highwayCode: "SH-15", state: "Assam", district: "Bongaigaon",
    geometry: { type: "LineString", coordinates: [
      [90.5600, 26.4700], [90.7000, 26.4300], [90.8400, 26.4000],
      [91.0000, 26.3700], [91.1500, 26.3400],
    ]},
    riskScore: 79, hazardType: "flood", status: "blocked",
    isEvacuationRoute: true, statusSource: "field_report",
    statusNote: "Overtopped at Km 22 – SDRF rescue boats deployed",
  },
];

// ---------------------------------------------------------------------------
// GIS infrastructure seed (hospitals, shelters, control rooms already in Map.jsx
// are also stored in DB so the map loads them from backend)
// ---------------------------------------------------------------------------
const INFRA_SEED = [
  { name: "Gauhati Medical College & Hospital", state: "Assam", district: "Kamrup Metro",
    geometry: { type: "Point", coordinates: [91.7712, 26.1584] },
    properties: { type: "hospital", capacity: "2200 beds", phone: "+91 361 2529457", status: "Open 24/7" },
    source: "ndma" },
  { name: "AIIMS Guwahati", state: "Assam", district: "Kamrup",
    geometry: { type: "Point", coordinates: [91.6881, 26.2758] },
    properties: { type: "hospital", capacity: "750 beds", phone: "+91 361 2912001", status: "Open 24/7" },
    source: "ndma" },
  { name: "Civil Hospital Shillong", state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.8887, 25.5788] },
    properties: { type: "hospital", capacity: "600 beds", phone: "0364-2220153", status: "Open 24/7" },
    source: "ndma" },
  { name: "NDRF 14th Battalion (Guwahati)", state: "Assam", district: "Kamrup Metro",
    geometry: { type: "Point", coordinates: [91.7665, 26.1730] },
    properties: { type: "control_room", phone: "0361-2731101", status: "Active" },
    source: "ndma" },
  { name: "Meghalaya SDMA State EOC", state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.9009, 25.5788] },
    properties: { type: "control_room", phone: "0364-2224405", status: "Active" },
    source: "state_gis" },
  { name: "Guwahati Central Flood Relief Shelter", state: "Assam", district: "Kamrup Metro",
    geometry: { type: "Point", coordinates: [91.7362, 26.1850] },
    properties: { type: "shelter", capacity: "800 persons", status: "Open" },
    source: "ndma" },
  { name: "Shillong Emergency Multi-Purpose Shelter", state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.8823, 25.5742] },
    properties: { type: "shelter", capacity: "400 persons", status: "Standby" },
    source: "state_gis" },
  { name: "Imphal Flood Relief Center", state: "Manipur", district: "Imphal West",
    geometry: { type: "Point", coordinates: [93.9368, 24.8170] },
    properties: { type: "shelter", capacity: "600 persons", status: "Open" },
    source: "ndma" },
];

// ---------------------------------------------------------------------------
// Village layer seed (sample – real data from Census / Bhuvan via OGC WFS)
// ---------------------------------------------------------------------------
const VILLAGE_SEED = [
  { name: "Mawsynram Village", state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.5833, 25.2997] },
    properties: { population: 4800, altitude_m: 1400, riskLevel: "HIGH" }, source: "census" },
  { name: "Cherrapunji (Sohra)", state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.7014, 25.2800] },
    properties: { population: 12000, altitude_m: 1484, riskLevel: "HIGH" }, source: "census" },
  { name: "Haflong", state: "Assam", district: "Dima Hasao",
    geometry: { type: "Point", coordinates: [93.0152, 25.1648] },
    properties: { population: 18000, altitude_m: 680, riskLevel: "MODERATE" }, source: "census" },
  { name: "Mokokchung", state: "Nagaland", district: "Mokokchung",
    geometry: { type: "Point", coordinates: [94.5127, 26.3247] },
    properties: { population: 32000, altitude_m: 1325, riskLevel: "MODERATE" }, source: "census" },
  { name: "Aizawl", state: "Mizoram", district: "Aizawl",
    geometry: { type: "Point", coordinates: [92.7176, 23.7271] },
    properties: { population: 293416, altitude_m: 1132, riskLevel: "HIGH" }, source: "census" },
  { name: "Kohima", state: "Nagaland", district: "Kohima",
    geometry: { type: "Point", coordinates: [94.1086, 25.6701] },
    properties: { population: 99039, altitude_m: 1444, riskLevel: "MODERATE" }, source: "census" },
  { name: "Itanagar", state: "Arunachal Pradesh", district: "Papum Pare",
    geometry: { type: "Point", coordinates: [93.6053, 27.0844] },
    properties: { population: 44971, altitude_m: 320, riskLevel: "HIGH" }, source: "census" },
];

// ---------------------------------------------------------------------------
// Seed helper (idempotent)
// ---------------------------------------------------------------------------
async function _seedIfEmpty(Model, seedData, layerType, name) {
  const count = await Model.countDocuments(layerType ? { layerType } : {});
  if (count === 0) {
    console.log(`[GIS] Seeding ${seedData.length} ${name} records…`);
    const docs = layerType
      ? seedData.map((d) => ({ ...d, layerType }))
      : seedData;
    await Model.insertMany(docs, { ordered: false }).catch(() => {});
  }
}

async function seedAll() {
  if (mongoose.connection.readyState !== 1) return;
  await _seedIfEmpty(RoadSegment, NER_CORRIDOR_SEED, null, "NER road corridors");
  await _seedIfEmpty(GisLayer, INFRA_SEED, "infrastructure", "infrastructure features");
  await _seedIfEmpty(GisLayer, VILLAGE_SEED, "village", "village features");
}

// ---------------------------------------------------------------------------
// 1. Risk Heatmap GeoJSON
//    Merges: riskEngine zones + active incidents (from Incident model)
// ---------------------------------------------------------------------------
async function getRiskHeatmapGeoJSON({ state, hazard, minScore } = {}) {
  const Incident = require("../models/Incident");

  // ── Risk engine zones ────────────────────────────────────────────────────
  const zones = await riskEngine.getAllZones();

  const zoneFeatures = zones
    .filter((z) => (!state || z.state === state))
    .filter((z) => (!minScore || z.overallRiskScore >= Number(minScore)))
    .filter((z) => (!hazard || z.primaryHazard === hazard))
    .map((z) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        // Close the polygon by repeating first coordinate
        coordinates: [
          [
            ...z.boundaryCoordinates.map((c) => [c.lng, c.lat]),
            [z.boundaryCoordinates[0].lng, z.boundaryCoordinates[0].lat],
          ],
        ],
      },
      properties: {
        id:                  z.id,
        name:                z.name,
        state:               z.state,
        riskScore:           z.overallRiskScore,
        riskLevel:           z.level,
        hazardType:          z.primaryHazard,
        populationAtRisk:    z.populationAtRisk,
        rain24h:             z.rainfall?.rain24h,
        imdCategory:         z.rainfall?.imdCategory,
        infra:               z.criticalInfrastructureImpacted,
        featureType:         "risk_zone",
        lastUpdated:         z.lastUpdated,
      },
    }));

  // ── Active incidents (from field reports) ───────────────────────────────
  let incidentFeatures = [];
  try {
    const filter = { status: { $in: ["reported", "verified", "active"] } };
    if (hazard) filter.incidentType = hazard;
    if (state)  filter.state = state;

    const incidents = await Incident.find(filter)
      .select("title incidentType severity location state district status reportedAt")
      .limit(500)
      .lean();

    incidentFeatures = incidents
      .filter((i) => i.location?.coordinates?.length === 2)
      .map((i) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: i.location.coordinates,
        },
        properties: {
          id:           i._id,
          name:         i.title,
          incidentType: i.incidentType,
          severity:     i.severity,
          state:        i.state,
          district:     i.district,
          status:       i.status,
          featureType:  "incident",
          reportedAt:   i.reportedAt,
          // Map severity to riskScore for uniform heatmap colour logic
          riskScore:    (i.severity || 3) * 18,
        },
      }));
  } catch (_e) {
    // Incident model may not be populated in all environments
  }

  // ── DB-stored risk heatmap features ─────────────────────────────────────
  let dbFeatures = [];
  try {
    const dbFilter = { layerType: "risk_heatmap", isActive: true };
    if (state)    dbFilter.state = state;
    if (hazard)   dbFilter.hazardType = hazard;
    if (minScore) dbFilter.riskScore = { $gte: Number(minScore) };

    const dbRecords = await GisLayer.find(dbFilter).lean();
    dbFeatures = dbRecords.map((r) => ({
      type: "Feature",
      geometry: r.geometry,
      properties: { ...r.properties, id: r._id, name: r.name, featureType: "risk_heatmap", riskScore: r.riskScore, lastUpdated: r.updatedAt },
    }));
  } catch (_e) {}

  return {
    type: "FeatureCollection",
    features: [...zoneFeatures, ...incidentFeatures, ...dbFeatures],
    generatedAt: new Date().toISOString(),
    summary: {
      totalFeatures: zoneFeatures.length + incidentFeatures.length + dbFeatures.length,
      zones:     zoneFeatures.length,
      incidents: incidentFeatures.length,
      stored:    dbFeatures.length,
    },
  };
}

// ---------------------------------------------------------------------------
// 2. Road Segment GeoJSON
// ---------------------------------------------------------------------------
async function getRoadSegmentsGeoJSON({ state, status, hazard, evacuationOnly } = {}) {
  const filter = {};
  if (state)          filter.state = state;
  if (status)         filter.status = status;
  if (hazard)         filter.hazardType = hazard;
  if (evacuationOnly === "true") filter.isEvacuationRoute = true;

  const segments = await RoadSegment.find(filter).lean();

  return {
    type: "FeatureCollection",
    features: segments.map((s) => ({
      type: "Feature",
      geometry: s.geometry,
      properties: {
        id:               s._id,
        name:             s.name,
        highwayCode:      s.highwayCode,
        state:            s.state,
        district:         s.district,
        status:           s.status,
        riskScore:        s.riskScore,
        hazardType:       s.hazardType,
        statusNote:       s.statusNote,
        statusSource:     s.statusSource,
        isEvacuationRoute: s.isEvacuationRoute,
        authority:        s.authority,
        statusUpdatedAt:  s.statusUpdatedAt,
      },
    })),
    generatedAt: new Date().toISOString(),
    totalSegments: segments.length,
  };
}

// ---------------------------------------------------------------------------
// 3. GIS Layer GeoJSON (villages, infrastructure, landslide_zone, etc.)
// ---------------------------------------------------------------------------
async function getLayerGeoJSON({ layerType, state, district, minScore } = {}) {
  const filter = { isActive: true };
  if (layerType) filter.layerType = layerType;
  if (state)     filter.state = state;
  if (district)  filter.district = district;
  if (minScore)  filter.riskScore = { $gte: Number(minScore) };

  const features = await GisLayer.find(filter).limit(2000).lean();

  return {
    type: "FeatureCollection",
    features: features.map((f) => ({
      type: "Feature",
      geometry: f.geometry,
      properties: {
        id:         f._id,
        name:       f.name,
        layerType:  f.layerType,
        state:      f.state,
        district:   f.district,
        riskScore:  f.riskScore,
        hazardType: f.hazardType,
        source:     f.source,
        ...f.properties,
      },
    })),
    generatedAt: new Date().toISOString(),
    totalFeatures: features.length,
    layerType,
  };
}

// ---------------------------------------------------------------------------
// 4. Sync road status from nerLandslideService corridors
//    Called on boot and by a cron job to update road status from live data.
// ---------------------------------------------------------------------------
async function syncRoadStatusFromNer() {
  if (mongoose.connection.readyState !== 1) return { synced: 0 };

  let nerService;
  try { nerService = require("./nerLandslideService"); } catch (_e) { return { synced: 0 }; }

  let corridors = [];
  try { corridors = await nerService.getCorridors?.() || []; } catch (_e) {}
  if (!corridors.length) return { synced: 0 };

  let synced = 0;
  for (const corridor of corridors) {
    if (!corridor.name) continue;
    const statusMap = {
      "Clear":    "open",
      "Restricted": "restricted",
      "Blocked":  "blocked",
    };
    const status = statusMap[corridor.currentStatus] || "unknown";
    const risk = corridor.blockageRisk === "CRITICAL" ? 90
               : corridor.blockageRisk === "HIGH"     ? 70
               : corridor.blockageRisk === "MODERATE" ? 50
               : 30;

    await RoadSegment.findOneAndUpdate(
      { name: { $regex: corridor.name.slice(0, 20), $options: "i" } },
      {
        $set: {
          status,
          riskScore:       risk,
          statusUpdatedAt: new Date(),
          statusSource:    "model",
          statusNote:      corridor.notes || null,
        },
      },
      { upsert: false }
    ).catch(() => {});
    synced++;
  }
  return { synced };
}

// ---------------------------------------------------------------------------
// 5. Upsert a risk heatmap feature from model output (called by ML pipeline)
// ---------------------------------------------------------------------------
async function upsertRiskHeatmapFeature({ id, name, lat, lng, riskScore, hazardType, state, district, properties = {} }) {
  if (!lat || !lng) return null;
  return GisLayer.findOneAndUpdate(
    { layerType: "risk_heatmap", "geometry.coordinates": [lng, lat] },
    {
      $set: {
        layerType: "risk_heatmap",
        name:      name || `Risk zone ${lat.toFixed(3)},${lng.toFixed(3)}`,
        state,
        district,
        geometry:  { type: "Point", coordinates: [lng, lat] },
        riskScore,
        hazardType,
        properties,
        isActive:  true,
      },
    },
    { upsert: true, new: true }
  );
}

module.exports = {
  seedAll,
  getRiskHeatmapGeoJSON,
  getRoadSegmentsGeoJSON,
  getLayerGeoJSON,
  syncRoadStatusFromNer,
  upsertRiskHeatmapFeature,
};
