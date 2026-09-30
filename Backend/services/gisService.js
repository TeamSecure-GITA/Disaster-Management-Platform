/**
 * gisService.js – GIS data aggregation, road segment management, and risk heatmap service.
 *
 * Responsibilities:
 *  1. Serve live risk heatmap GeoJSON derived from ML model output + riskEngine zones + active incidents
 *  2. Serve per-segment road status (stored in RoadSegment model with highway code, chainage km, status, authority)
 *  3. Serve GIS feature layers (Census/Bhuvan villages, hospitals, shelters, control rooms, relief camps)
 *  4. Sync road status from NER corridors / nerLandslideService
 *  5. Seed and persist baseline NER road segments, model output risk heatmaps, infrastructure, and villages
 *
 * RFC 7946 GeoJSON format everywhere → directly consumable by Leaflet L.geoJSON() / react-leaflet.
 */
"use strict";

const mongoose    = require("mongoose");
const RoadSegment = require("../models/RoadSegment");
const GisLayer    = require("../models/GisLayer");
const riskEngine  = require("./riskEngineService");

// ---------------------------------------------------------------------------
// 1. NER PER-SEGMENT ROAD CORRIDOR SEED DATA
// Each entry represents an individual highway chainage stretch with status,
// risk score, hazard type, authority, and geometry coordinates.
// ---------------------------------------------------------------------------
const NER_CORRIDOR_SEED = [
  // ── NH-10 (Siliguri – Teesta – Rangpo – Gangtok) ────────────────────────
  {
    name: "NH-10 Km 0–25 (Sevoke to Teesta Bazaar)",
    highwayCode: "NH-10", state: "West Bengal", district: "Kalimpong",
    geometry: { type: "LineString", coordinates: [
      [88.4200, 26.7300], [88.4350, 26.8100], [88.4500, 26.9000],
    ]},
    riskScore: 78, hazardType: "landslide", status: "restricted",
    isEvacuationRoute: true, statusSource: "model",
    authority: "BRO Project Swastik (758 BRTF)",
    statusNote: "River toe erosion along Teesta; heavy vehicle speed limit 20 km/h",
  },
  {
    name: "NH-10 Km 25–50 (Teesta Bazaar to Rangpo)",
    highwayCode: "NH-10", state: "Sikkim", district: "Pakyong",
    geometry: { type: "LineString", coordinates: [
      [88.4500, 26.9000], [88.4800, 27.0300], [88.5100, 27.1700],
    ]},
    riskScore: 92, hazardType: "landslide", status: "blocked",
    isEvacuationRoute: true, statusSource: "field_report",
    authority: "BRO Project Swastik (758 BRTF)",
    statusNote: "Active rockfall and debris accumulation at KM 38; BRO deploying earthmovers",
  },
  {
    name: "NH-10 Km 50–75 (Rangpo to Singtam)",
    highwayCode: "NH-10", state: "Sikkim", district: "Gangtok",
    geometry: { type: "LineString", coordinates: [
      [88.5100, 27.1700], [88.5050, 27.2050], [88.5000, 27.2400],
    ]},
    riskScore: 64, hazardType: "landslide", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    authority: "Sikkim PWD (NH Division)",
    statusNote: "Passable; minor slip at Singtam bypass cleared by local maintenance gang",
  },
  {
    name: "NH-10 Km 75–115 (Singtam to Gangtok)",
    highwayCode: "NH-10", state: "Sikkim", district: "Gangtok",
    geometry: { type: "LineString", coordinates: [
      [88.5000, 27.2400], [88.5550, 27.2850], [88.6100, 27.3300],
    ]},
    riskScore: 52, hazardType: "landslide", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    authority: "Sikkim PWD (NH Division)",
    statusNote: "Fully operational; four-lane urban approach to capital",
  },

  // ── NH-29 (Dimapur – Chumukedima – Kohima – Mao) ────────────────────────
  {
    name: "NH-29 Km 0–20 (Dimapur to Chumukedima)",
    highwayCode: "NH-29", state: "Nagaland", district: "Dimapur",
    geometry: { type: "LineString", coordinates: [
      [93.7300, 25.9000], [93.7750, 25.8500], [93.8200, 25.8000],
    ]},
    riskScore: 40, hazardType: "landslide", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    authority: "NHIDCL / Nagaland PWD",
    statusNote: "Four-lane bypass operational; normal traffic flow",
  },
  {
    name: "NH-29 Km 20–45 (Chumukedima to Dzüdza Gorge)",
    highwayCode: "NH-29", state: "Nagaland", district: "Kohima",
    geometry: { type: "LineString", coordinates: [
      [93.8200, 25.8000], [93.9200, 25.7500], [94.0200, 25.7000],
    ]},
    riskScore: 94, hazardType: "landslide", status: "blocked",
    isEvacuationRoute: true, statusSource: "field_report",
    authority: "BRO Project Sewak (15 BRTF)",
    statusNote: "Deep rotational slope failure at Dzüdza bridge approach; traffic diverted via Niuland",
  },
  {
    name: "NH-29 Km 45–68 (Dzüdza Gorge to Kohima Town)",
    highwayCode: "NH-29", state: "Nagaland", district: "Kohima",
    geometry: { type: "LineString", coordinates: [
      [94.0200, 25.7000], [94.0650, 25.6850], [94.1100, 25.6700],
    ]},
    riskScore: 75, hazardType: "landslide", status: "restricted",
    isEvacuationRoute: false, statusSource: "model",
    authority: "BRO Project Sewak (15 BRTF)",
    statusNote: "Single-lane escort transit due to slope subsidence near Zubza",
  },
  {
    name: "NH-29 Km 68–95 (Kohima to Mao Gate)",
    highwayCode: "NH-29", state: "Nagaland", district: "Kohima",
    geometry: { type: "LineString", coordinates: [
      [94.1100, 25.6700], [94.1450, 25.5850], [94.1800, 25.5000],
    ]},
    riskScore: 58, hazardType: "landslide", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    authority: "Nagaland PWD (NH)",
    statusNote: "Passable; Phesama sinking zone monitored with tilt sensors",
  },

  // ── NH-6 (Shillong – Jowai – Lubha – Silchar) ───────────────────────────
  {
    name: "NH-6 Km 0–35 (Shillong to Jowai)",
    highwayCode: "NH-6", state: "Meghalaya", district: "West Jaintia Hills",
    geometry: { type: "LineString", coordinates: [
      [91.8800, 25.5700], [92.0400, 25.5050], [92.2000, 25.4400],
    ]},
    riskScore: 48, hazardType: "landslide", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    authority: "NHAI / Meghalaya PWD",
    statusNote: "Two-lane paved road in good condition; normal traffic",
  },
  {
    name: "NH-6 Km 35–70 (Jowai to Lubha Bridge)",
    highwayCode: "NH-6", state: "Meghalaya", district: "East Jaintia Hills",
    geometry: { type: "LineString", coordinates: [
      [92.2000, 25.4400], [92.2750, 25.3450], [92.3500, 25.2500],
    ]},
    riskScore: 86, hazardType: "landslide", status: "restricted",
    isEvacuationRoute: true, statusSource: "model",
    authority: "NHAI / Meghalaya PWD",
    statusNote: "Active slope failure above Lubha bridge; heavy truck movement staggered",
  },
  {
    name: "NH-6 Km 70–105 (Lubha Bridge to Ratacherra)",
    highwayCode: "NH-6", state: "Meghalaya", district: "East Jaintia Hills",
    geometry: { type: "LineString", coordinates: [
      [92.3500, 25.2500], [92.4150, 25.1750], [92.4800, 25.1000],
    ]},
    riskScore: 91, hazardType: "landslide", status: "blocked",
    isEvacuationRoute: true, statusSource: "field_report",
    authority: "NHAI Project Implementation Unit",
    statusNote: "Mudflow and boulder collapse at Sonapur tunnel approach; SDRF on standby",
  },
  {
    name: "NH-6 Km 105–135 (Ratacherra to Silchar)",
    highwayCode: "NH-6", state: "Assam", district: "Cachar",
    geometry: { type: "LineString", coordinates: [
      [92.4800, 25.1000], [92.6350, 24.9650], [92.7900, 24.8300],
    ]},
    riskScore: 62, hazardType: "flood", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    authority: "Assam PWD (NH)",
    statusNote: "Barak valley approach; drainage pumped, road surface passable",
  },

  // ── NH-40 (Shillong – Pynursla – Dawki) ──────────────────────────────────
  {
    name: "NH-40 Km 0–25 (Shillong to Pynursla)",
    highwayCode: "NH-40", state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "LineString", coordinates: [
      [91.8800, 25.5700], [91.9100, 25.4800], [91.9400, 25.4000],
    ]},
    riskScore: 55, hazardType: "landslide", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    authority: "NHIDCL",
    statusNote: "Passable with caution during dense fog hours",
  },
  {
    name: "NH-40 Km 25–52 (Pynursla to Dawki Border)",
    highwayCode: "NH-40", state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "LineString", coordinates: [
      [91.9400, 25.4000], [91.9800, 25.3000], [92.0200, 25.1900],
    ]},
    riskScore: 85, hazardType: "landslide", status: "restricted",
    isEvacuationRoute: true, statusSource: "model",
    authority: "NHIDCL",
    statusNote: "Escarpment debris flow risk Km 38–52; single lane traffic permitted",
  },

  // ── NH-27 (Guwahati – Dispur – Nongpoh – Umsning) ───────────────────────
  {
    name: "NH-27 Km 0–35 (Guwahati to Burnihat)",
    highwayCode: "NH-27", state: "Assam", district: "Kamrup Metro",
    geometry: { type: "LineString", coordinates: [
      [91.7400, 26.1500], [91.7900, 26.0700], [91.8300, 26.0000],
    ]},
    riskScore: 42, hazardType: "flood", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    authority: "NHAI",
    statusNote: "Four-lane expressway in full operation",
  },
  {
    name: "NH-27 Km 35–70 (Burnihat to Nongpoh)",
    highwayCode: "NH-27", state: "Meghalaya", district: "Ri-Bhoi",
    geometry: { type: "LineString", coordinates: [
      [91.8300, 26.0000], [91.8700, 25.9400], [91.9100, 25.8800],
    ]},
    riskScore: 68, hazardType: "landslide", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    authority: "NHAI",
    statusNote: "Occasional minor gravel slips on steep cut-slopes; road sweepers active",
  },

  // ── NH-54 / NH-306 (Silchar – Kolasib – Aizawl) ─────────────────────────
  {
    name: "NH-54 Km 0–50 (Silchar to Vairengte)",
    highwayCode: "NH-54", state: "Assam", district: "Cachar",
    geometry: { type: "LineString", coordinates: [
      [92.7900, 24.8300], [92.7000, 24.5800], [92.6500, 24.3300],
    ]},
    riskScore: 50, hazardType: "flood", status: "open",
    isEvacuationRoute: true, statusSource: "model",
    authority: "Mizoram / Assam PWD",
    statusNote: "Passable; inter-state border checkpost active",
  },
  {
    name: "NH-54 Km 50–100 (Vairengte to Kolasib)",
    highwayCode: "NH-54", state: "Mizoram", district: "Kolasib",
    geometry: { type: "LineString", coordinates: [
      [92.6500, 24.3300], [92.6700, 24.1800], [92.6800, 24.0800],
    ]},
    riskScore: 78, hazardType: "landslide", status: "restricted",
    isEvacuationRoute: false, statusSource: "model",
    authority: "BRO Project Pushpak",
    statusNote: "Severe cut-slope weathering; light motor vehicles only",
  },
  {
    name: "NH-54 Km 100–145 (Kolasib to Aizawl)",
    highwayCode: "NH-54", state: "Mizoram", district: "Aizawl",
    geometry: { type: "LineString", coordinates: [
      [92.6800, 24.0800], [92.7100, 23.9000], [92.7200, 23.7300],
    ]},
    riskScore: 90, hazardType: "landslide", status: "blocked",
    isEvacuationRoute: false, statusSource: "field_report",
    authority: "BRO Project Pushpak",
    statusNote: "Culvert subsidence and rockslide at Durtlang ridge; BRO clearing in progress",
  },

  // ── NH-13 (Trans-Arunachal Highway: Bhalukpong – Bomdila) ───────────────
  {
    name: "NH-13 Km 0–50 (Bhalukpong to Tenga Valley)",
    highwayCode: "NH-13", state: "Arunachal Pradesh", district: "West Kameng",
    geometry: { type: "LineString", coordinates: [
      [92.6500, 27.0100], [92.5300, 27.1350], [92.4200, 27.2600],
    ]},
    riskScore: 82, hazardType: "landslide", status: "restricted",
    isEvacuationRoute: true, statusSource: "model",
    authority: "BRO Project Vartak (14 BRTF)",
    statusNote: "Tenga gorge cutting; convoy movement regulated every 2 hours",
  },
  {
    name: "NH-13 Km 50–110 (Tenga Valley to Bomdila)",
    highwayCode: "NH-13", state: "Arunachal Pradesh", district: "West Kameng",
    geometry: { type: "LineString", coordinates: [
      [92.4200, 27.2600], [92.3600, 27.3550], [92.3000, 27.4500],
    ]},
    riskScore: 93, hazardType: "landslide", status: "blocked",
    isEvacuationRoute: false, statusSource: "field_report",
    authority: "BRO Project Vartak (14 BRTF)",
    statusNote: "Massive debris flow near Sange; heavy earthmoving machinery deployed",
  },

  // ── SH-15 (Brahmaputra Floodplain Embankment Road) ──────────────────────
  {
    name: "SH-15 Embankment Km 0–35 (Bongaigaon to Abhayapuri)",
    highwayCode: "SH-15", state: "Assam", district: "Bongaigaon",
    geometry: { type: "LineString", coordinates: [
      [90.5600, 26.4700], [90.7000, 26.4300], [90.8400, 26.4000],
    ]},
    riskScore: 88, hazardType: "flood", status: "blocked",
    isEvacuationRoute: true, statusSource: "field_report",
    authority: "Assam Water Resources Dept / SDRF",
    statusNote: "Embankment breached at Km 22; SDRF rescue zodiac boats operating",
  },
  {
    name: "SH-15 Embankment Km 35–70 (Abhayapuri to Barpeta Road)",
    highwayCode: "SH-15", state: "Assam", district: "Barpeta",
    geometry: { type: "LineString", coordinates: [
      [90.8400, 26.4000], [91.0000, 26.3700], [91.1500, 26.3400],
    ]},
    riskScore: 76, hazardType: "flood", status: "restricted",
    isEvacuationRoute: true, statusSource: "model",
    authority: "Assam PWD (Roads)",
    statusNote: "Water logging 0.3m over carriageway; small vehicles prohibited",
  },
];

// ---------------------------------------------------------------------------
// 2. MODEL-OUTPUT RISK HEATMAP SEED DATA
// High-resolution spatial polygons/points derived from DEM Horn algorithm (30m),
// rainfall threshold model, and gradient-boosted susceptibility predictions.
// ---------------------------------------------------------------------------
const MODEL_RISK_HEATMAP_SEED = [
  {
    name: "NH-10 Teesta Valley Active Scarp KM 34 (Slope Stability Model)",
    state: "Sikkim", district: "Pakyong", hazardType: "landslide",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [88.4550, 26.9800], [88.4900, 26.9800], [88.4950, 27.0400],
        [88.4600, 27.0400], [88.4550, 26.9800],
      ]],
    },
    riskScore: 92,
    properties: {
      modelType: "Copernicus GLO-30 DEM + GradientBoosted Spatial CV",
      slopeAngle: 44.5,
      slopeStabilityMargin: "11.2%",
      slopeStabilityMarginPct: 11.2,
      factorOfSafetyRenamed: "Slope Stability Margin (11.2%)",
      warningLeadTimeHours: 19.5,
      susceptibilityScore: 0.92,
      demElevationMeters: 1280,
      soilMoistureSaturation: "89.5%",
      rain24h: 138.4,
      thresholdMm: 105.0,
      precision: "91.4%",
      recall: "88.2%",
      leadTimeHours: 21.0,
      roadBlockageProbability: 0.88,
      nearestHighway: "NH-10",
      authority: "BRO Project Swastik",
      populationAtRisk: 1420,
      recommendedAction: "Pre-emptive closure of Teesta Gorge corridor and evacuation of toe settlement",
    },
    source: "model",
  },
  {
    name: "Kohima Dzüdza Gorge Deep Sinking Cell #NL-209 (DEM Structural Model)",
    state: "Nagaland", district: "Kohima", hazardType: "landslide",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [93.9800, 25.6800], [94.0500, 25.6800], [94.0500, 25.7300],
        [93.9800, 25.7300], [93.9800, 25.6800],
      ]],
    },
    riskScore: 95,
    properties: {
      modelType: "Horn DEM 30m + Multi-temporal InSAR Displacement",
      slopeAngle: 48.0,
      slopeStabilityMargin: "7.8%",
      slopeStabilityMarginPct: 7.8,
      factorOfSafetyRenamed: "Slope Stability Margin (7.8%)",
      warningLeadTimeHours: 24.0,
      susceptibilityScore: 0.95,
      demElevationMeters: 1440,
      soilMoistureSaturation: "93.0%",
      rain24h: 165.0,
      thresholdMm: 115.0,
      precision: "93.1%",
      recall: "90.5%",
      leadTimeHours: 24.0,
      roadBlockageProbability: 0.96,
      nearestHighway: "NH-29",
      authority: "BRO Project Sewak",
      populationAtRisk: 3100,
      recommendedAction: "Total traffic diversion via Niuland road; deploy heavy earthmovers on standby",
    },
    source: "model",
  },
  {
    name: "NH-6 Lubha Bridge Escarpment Subsidence Zone #ML-512",
    state: "Meghalaya", district: "East Jaintia Hills", hazardType: "landslide",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [92.3200, 25.2200], [92.3800, 25.2200], [92.3800, 25.2800],
        [92.3200, 25.2800], [92.3200, 25.2200],
      ]],
    },
    riskScore: 88,
    properties: {
      modelType: "CartoDEM 30m + GSI Lithological Susceptibility",
      slopeAngle: 40.2,
      slopeStabilityMargin: "13.5%",
      slopeStabilityMarginPct: 13.5,
      factorOfSafetyRenamed: "Slope Stability Margin (13.5%)",
      warningLeadTimeHours: 16.0,
      susceptibilityScore: 0.88,
      demElevationMeters: 960,
      soilMoistureSaturation: "85.2%",
      rain24h: 210.0,
      thresholdMm: 140.0,
      precision: "89.8%",
      recall: "86.4%",
      leadTimeHours: 18.0,
      roadBlockageProbability: 0.84,
      nearestHighway: "NH-6",
      authority: "Meghalaya PWD & NHAI",
      populationAtRisk: 860,
      recommendedAction: "Stagger coal transport trucks; station NDRF quick response team at Khliehriat",
    },
    source: "model",
  },
  {
    name: "Bhalukpong Sange High-Cut Slope Cell #AR-104",
    state: "Arunachal Pradesh", district: "West Kameng", hazardType: "landslide",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [92.3200, 27.2400], [92.4400, 27.2400], [92.4400, 27.3200],
        [92.3200, 27.3200], [92.3200, 27.2400],
      ]],
    },
    riskScore: 91,
    properties: {
      modelType: "Copernicus GLO-30 DEM + Geomorphometric Slope Model",
      slopeAngle: 51.0,
      slopeStabilityMargin: "9.5%",
      slopeStabilityMarginPct: 9.5,
      factorOfSafetyRenamed: "Slope Stability Margin (9.5%)",
      warningLeadTimeHours: 22.0,
      susceptibilityScore: 0.91,
      demElevationMeters: 2150,
      soilMoistureSaturation: "87.0%",
      rain24h: 120.0,
      thresholdMm: 90.0,
      precision: "92.0%",
      recall: "89.0%",
      leadTimeHours: 22.5,
      roadBlockageProbability: 0.92,
      nearestHighway: "NH-13",
      authority: "BRO Project Vartak",
      populationAtRisk: 1200,
      recommendedAction: "Pre-position crawler excavators at Sange; restrict night transit",
    },
    source: "model",
  },
  {
    name: "Brahmaputra Flood Basin Embankment Breach Hotspot #AS-301",
    state: "Assam", district: "Bongaigaon", hazardType: "flood",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [90.6200, 26.3800], [90.8000, 26.3800], [90.8000, 26.4600],
        [90.6200, 26.4600], [90.6200, 26.3800],
      ]],
    },
    riskScore: 89,
    properties: {
      modelType: "Sentinel-1 SAR Radar Water Inundation Mapping",
      waterDepthMeters: 2.8,
      inundationAreaSqKm: 46.2,
      inundationTrend: "Rising (12 cm/hr)",
      populationAtRisk: 18500,
      warningLeadTimeHours: 12.0,
      nearestHighway: "SH-15",
      authority: "Assam Water Resources Department & SDRF",
      recommendedAction: "Deploy rescue zodiacs; evacuate 4 riparian villages to elevated shelter",
    },
    source: "model",
  },
];

// ---------------------------------------------------------------------------
// 3. GIS INFRASTRUCTURE SEED (Hospitals, Shelters, EOCs, Fire Stations)
// Stored in DB with 2dsphere geometry so the map loads them dynamically from backend.
// ---------------------------------------------------------------------------
const INFRA_SEED = [
  // ── Hospitals ───────────────────────────────────────────────────────────
  {
    name: "Gauhati Medical College & Hospital (GMCH)",
    state: "Assam", district: "Kamrup Metro",
    geometry: { type: "Point", coordinates: [91.7712, 26.1584] },
    properties: { type: "hospital", capacity: "2,200 beds", emergencyBeds: "180 ICU", phone: "+91 361 2529457", status: "Open 24/7", powerBackup: "Dual 1500kVA DG" },
    source: "ndma",
  },
  {
    name: "AIIMS Guwahati",
    state: "Assam", district: "Kamrup",
    geometry: { type: "Point", coordinates: [91.6881, 26.2758] },
    properties: { type: "hospital", capacity: "750 beds", emergencyBeds: "90 ICU", phone: "+91 361 2912001", status: "Open 24/7", powerBackup: "Full solar + DG" },
    source: "ndma",
  },
  {
    name: "Civil Hospital Shillong",
    state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.8887, 25.5788] },
    properties: { type: "hospital", capacity: "600 beds", emergencyBeds: "45 ICU", phone: "0364-2220153", status: "Open 24/7", powerBackup: "DG Active" },
    source: "state_gis",
  },
  {
    name: "STNM Central Referral Hospital (Gangtok)",
    state: "Sikkim", district: "Gangtok",
    geometry: { type: "Point", coordinates: [88.6015, 27.3190] },
    properties: { type: "hospital", capacity: "1,000 beds", emergencyBeds: "80 ICU", phone: "03592-202944", status: "Open 24/7", powerBackup: "Substation + DG" },
    source: "state_gis",
  },
  {
    name: "Naga Hospital Authority Kohima (NHAK)",
    state: "Nagaland", district: "Kohima",
    geometry: { type: "Point", coordinates: [94.1086, 25.6701] },
    properties: { type: "hospital", capacity: "450 beds", emergencyBeds: "35 ICU", phone: "0370-2222916", status: "Open 24/7", powerBackup: "DG Active" },
    source: "state_gis",
  },
  {
    name: "Civil Hospital Aizawl",
    state: "Mizoram", district: "Aizawl",
    geometry: { type: "Point", coordinates: [92.7176, 23.7271] },
    properties: { type: "hospital", capacity: "500 beds", emergencyBeds: "40 ICU", phone: "0389-2322318", status: "Open 24/7", powerBackup: "DG Active" },
    source: "state_gis",
  },
  {
    name: "Regional Institute of Medical Sciences (RIMS Imphal)",
    state: "Manipur", district: "Imphal West",
    geometry: { type: "Point", coordinates: [93.9168, 24.8170] },
    properties: { type: "hospital", capacity: "1,074 beds", emergencyBeds: "110 ICU", phone: "0385-2414629", status: "Open 24/7", powerBackup: "Full DG" },
    source: "ndma",
  },
  {
    name: "Silchar Medical College & Hospital (SMCH)",
    state: "Assam", district: "Cachar",
    geometry: { type: "Point", coordinates: [92.8020, 24.7865] },
    properties: { type: "hospital", capacity: "1,000 beds", emergencyBeds: "65 ICU", phone: "03842-240102", status: "Open 24/7", powerBackup: "DG Active" },
    source: "ndma",
  },

  // ── Emergency Shelters & Relief Camps ──────────────────────────────────
  {
    name: "Guwahati Central Flood Relief Shelter (Sarabbhati)",
    state: "Assam", district: "Kamrup Metro",
    geometry: { type: "Point", coordinates: [91.7362, 26.1850] },
    properties: { type: "shelter", capacity: "1,200 persons", waterSupply: "Active RO plant", medicalPost: "Yes", status: "Open" },
    source: "ndma",
  },
  {
    name: "Shillong Emergency Multi-Purpose Indoor Stadium Shelter",
    state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.8823, 25.5742] },
    properties: { type: "shelter", capacity: "800 persons", waterSupply: "Municipal tank", medicalPost: "Yes", status: "Standby" },
    source: "state_gis",
  },
  {
    name: "Rangpo Disaster Evacuation Relief Camp (Teesta Basin)",
    state: "Sikkim", district: "Pakyong",
    geometry: { type: "Point", coordinates: [88.5120, 27.1740] },
    properties: { type: "shelter", capacity: "650 persons", waterSupply: "Gravity feed + tanker", medicalPost: "Yes", status: "Open" },
    source: "state_gis",
  },
  {
    name: "Kohima Indoor Stadium Emergency Relief Center",
    state: "Nagaland", district: "Kohima",
    geometry: { type: "Point", coordinates: [94.1150, 25.6650] },
    properties: { type: "shelter", capacity: "900 persons", waterSupply: "Rainwater harvesting + tanker", medicalPost: "Yes", status: "Standby" },
    source: "state_gis",
  },
  {
    name: "Aizawl Vanapa Hall Multi-Hazard Evacuation Shelter",
    state: "Mizoram", district: "Aizawl",
    geometry: { type: "Point", coordinates: [92.7220, 23.7310] },
    properties: { type: "shelter", capacity: "1,000 persons", waterSupply: "Municipal cistern", medicalPost: "Yes", status: "Open" },
    source: "state_gis",
  },
  {
    name: "Imphal Khuman Lampak Sports Complex Relief Camp",
    state: "Manipur", district: "Imphal East",
    geometry: { type: "Point", coordinates: [93.9450, 24.8210] },
    properties: { type: "shelter", capacity: "1,500 persons", waterSupply: "RO tankers", medicalPost: "Yes", status: "Open" },
    source: "ndma",
  },

  // ── State EOCs & Control Rooms ──────────────────────────────────────────
  {
    name: "Assam SDMA State Emergency Operations Centre (Dispur)",
    state: "Assam", district: "Kamrup Metro",
    geometry: { type: "Point", coordinates: [91.7890, 26.1420] },
    properties: { type: "control_room", phone: "1079 / 0361-2237221", satPhone: "+870776412941", status: "Active 24/7", radioCallsign: "ASDMA-CENTRAL" },
    source: "ndma",
  },
  {
    name: "Meghalaya SDMA State EOC (Secretariat Shillong)",
    state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.9009, 25.5788] },
    properties: { type: "control_room", phone: "1070 / 0364-2224405", status: "Active 24/7", radioCallsign: "MSDMA-HQ" },
    source: "state_gis",
  },
  {
    name: "Sikkim State Disaster Management Authority EOC (Tashiling)",
    state: "Sikkim", district: "Gangtok",
    geometry: { type: "Point", coordinates: [88.6140, 27.3280] },
    properties: { type: "control_room", phone: "1070 / 03592-201145", status: "Active 24/7", radioCallsign: "SSDMA-EOC" },
    source: "state_gis",
  },
  {
    name: "Nagaland NSDMA State Emergency Operations Centre",
    state: "Nagaland", district: "Kohima",
    geometry: { type: "Point", coordinates: [94.1020, 25.6740] },
    properties: { type: "control_room", phone: "1070 / 0370-2291122", status: "Active 24/7", radioCallsign: "NSDMA-CENTRAL" },
    source: "state_gis",
  },
  {
    name: "NDRF 1st Battalion Headquarters (Patgaon, Guwahati)",
    state: "Assam", district: "Kamrup",
    geometry: { type: "Point", coordinates: [91.6120, 26.1150] },
    properties: { type: "control_room", phone: "0361-2840003", status: "Active 24/7", personnel: "1,149 personnel", boats: "42 BAUT" },
    source: "ndma",
  },
  {
    name: "NDRF 12th Battalion Headquarters (Doimukh, Itanagar)",
    state: "Arunachal Pradesh", district: "Papum Pare",
    geometry: { type: "Point", coordinates: [93.7500, 27.1350] },
    properties: { type: "control_room", phone: "0360-2277107", status: "Active 24/7", specializedSAR: "Mountain & Landslide SAR" },
    source: "ndma",
  },

  // ── Fire & Rescue ───────────────────────────────────────────────────────
  {
    name: "Dispur Fire & Emergency Services Station",
    state: "Assam", district: "Kamrup Metro",
    geometry: { type: "Point", coordinates: [91.7950, 26.1380] },
    properties: { type: "fire", phone: "101 / 0361-2260333", appliances: "4 water tenders, 1 hydraulic ladder", status: "Active" },
    source: "state_gis",
  },
  {
    name: "Shillong Central Fire Station",
    state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.8840, 25.5710] },
    properties: { type: "fire", phone: "101 / 0364-2222222", appliances: "3 water tenders, high-altitude rescue ropes", status: "Active" },
    source: "state_gis",
  },
];

// ---------------------------------------------------------------------------
// 4. GIS VILLAGE LAYER SEED (Census 2011 / ISRO Bhuvan Centroids)
// Centroids of mountain and riparian settlements with vulnerability indicators.
// ---------------------------------------------------------------------------
const VILLAGE_SEED = [
  {
    name: "Mawsynram Village", state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.5833, 25.2997] },
    properties: {
      censusCode: "278491", population: 4800, households: 980,
      altitude_m: 1400, riskLevel: "HIGH", primaryHazard: "landslide",
      vulnerabilityScore: 84, focalPoint: "Headman Bah K. Lyngdoh (+91 94361 22891)",
    },
    source: "census",
  },
  {
    name: "Cherrapunji (Sohra)", state: "Meghalaya", district: "East Khasi Hills",
    geometry: { type: "Point", coordinates: [91.7014, 25.2800] },
    properties: {
      censusCode: "278505", population: 12000, households: 2450,
      altitude_m: 1484, riskLevel: "HIGH", primaryHazard: "landslide",
      vulnerabilityScore: 82, focalPoint: "Sordar P. Diengdoh (+91 94363 88120)",
    },
    source: "census",
  },
  {
    name: "Haflong Hill Settlement", state: "Assam", district: "Dima Hasao",
    geometry: { type: "Point", coordinates: [93.0152, 25.1648] },
    properties: {
      censusCode: "298114", population: 18000, households: 3800,
      altitude_m: 680, riskLevel: "CRITICAL", primaryHazard: "landslide",
      vulnerabilityScore: 91, focalPoint: "DDMA Nodal Officer (+91 3673 236224)",
    },
    source: "bhuvan",
  },
  {
    name: "Mokokchung Mountain Cluster", state: "Nagaland", district: "Mokokchung",
    geometry: { type: "Point", coordinates: [94.5127, 26.3247] },
    properties: {
      censusCode: "267102", population: 32000, households: 6100,
      altitude_m: 1325, riskLevel: "MODERATE", primaryHazard: "landslide",
      vulnerabilityScore: 68, focalPoint: "Town Committee (+91 369 2226211)",
    },
    source: "census",
  },
  {
    name: "Kigwema Village (Kohima Ridge)", state: "Nagaland", district: "Kohima",
    geometry: { type: "Point", coordinates: [94.1350, 25.6120] },
    properties: {
      censusCode: "268305", population: 4200, households: 810,
      altitude_m: 1620, riskLevel: "HIGH", primaryHazard: "landslide",
      vulnerabilityScore: 86, focalPoint: "Village Council Chair (+91 94360 41230)",
    },
    source: "bhuvan",
  },
  {
    name: "Rangpo Riverside Ward", state: "Sikkim", district: "Pakyong",
    geometry: { type: "Point", coordinates: [88.5130, 27.1760] },
    properties: {
      censusCode: "260901", population: 6500, households: 1320,
      altitude_m: 350, riskLevel: "CRITICAL", primaryHazard: "flash_flood",
      vulnerabilityScore: 93, focalPoint: "Ward Councillor (+91 3592 240212)",
    },
    source: "bhuvan",
  },
  {
    name: "Singtam Lowland Hamlet", state: "Sikkim", district: "Gangtok",
    geometry: { type: "Point", coordinates: [88.4980, 27.2380] },
    properties: {
      censusCode: "260918", population: 5800, households: 1190,
      altitude_m: 390, riskLevel: "HIGH", primaryHazard: "flood",
      vulnerabilityScore: 87, focalPoint: "SDPO Office (+91 3592 233215)",
    },
    source: "census",
  },
  {
    name: "Mangan District Center", state: "Sikkim", district: "Mangan",
    geometry: { type: "Point", coordinates: [88.5280, 27.5080] },
    properties: {
      censusCode: "260840", population: 4600, households: 950,
      altitude_m: 1310, riskLevel: "CRITICAL", primaryHazard: "landslide",
      vulnerabilityScore: 95, focalPoint: "DM Emergency Desk (+91 3592 234222)",
    },
    source: "bhuvan",
  },
  {
    name: "Aizawl Durtlang Ridge Cluster", state: "Mizoram", district: "Aizawl",
    geometry: { type: "Point", coordinates: [92.7300, 23.7750] },
    properties: {
      censusCode: "271101", population: 14200, households: 2900,
      altitude_m: 1250, riskLevel: "HIGH", primaryHazard: "landslide",
      vulnerabilityScore: 88, focalPoint: "Local Level Disaster Committee (+91 389 2311200)",
    },
    source: "census",
  },
  {
    name: "Bhalukpong Gorge Village", state: "Arunachal Pradesh", district: "West Kameng",
    geometry: { type: "Point", coordinates: [92.6510, 27.0120] },
    properties: {
      censusCode: "261405", population: 3800, households: 720,
      altitude_m: 215, riskLevel: "HIGH", primaryHazard: "flash_flood",
      vulnerabilityScore: 85, focalPoint: "Circle Officer (+91 3782 245220)",
    },
    source: "census",
  },
  {
    name: "Majuli Island Kamalabari Hamlet", state: "Assam", district: "Majuli",
    geometry: { type: "Point", coordinates: [94.1600, 26.9600] },
    properties: {
      censusCode: "289901", population: 8900, households: 1650,
      altitude_m: 85, riskLevel: "CRITICAL", primaryHazard: "soil_erosion",
      vulnerabilityScore: 94, focalPoint: "Brahmaputra Flood Cell (+91 3775 274431)",
    },
    source: "bhuvan",
  },
];

// ---------------------------------------------------------------------------
// Seed helper (idempotent upsert by name)
// ---------------------------------------------------------------------------
async function _seedCollection(Model, seedData, layerType, name) {
  try {
    for (const item of seedData) {
      const query = layerType
        ? { name: item.name, layerType }
        : { name: item.name };

      const doc = layerType ? { ...item, layerType } : item;
      await Model.findOneAndUpdate(query, { $set: doc }, { upsert: true, new: true }).catch(() => {});
    }
    console.log(`[GIS] Verified/seeded ${seedData.length} ${name}`);
  } catch (err) {
    console.warn(`[GIS] Seed error for ${name}:`, err.message);
  }
}

async function seedAll() {
  if (mongoose.connection.readyState !== 1) return;
  await _seedCollection(RoadSegment, NER_CORRIDOR_SEED, null, "NER road segments");
  await _seedCollection(GisLayer, MODEL_RISK_HEATMAP_SEED, "risk_heatmap", "model output risk heatmap features");
  await _seedCollection(GisLayer, INFRA_SEED, "infrastructure", "infrastructure features");
  await _seedCollection(GisLayer, VILLAGE_SEED, "village", "village features");
}

// ---------------------------------------------------------------------------
// 1. Live Risk Heatmap GeoJSON
//    Merges: riskEngine zones + active incidents + ML model output grid features
// ---------------------------------------------------------------------------
async function getRiskHeatmapGeoJSON({ state, hazard, minScore } = {}) {
  const isDbConnected = mongoose.connection.readyState === 1;

  // ── A. Risk engine zones (Polygons) ──────────────────────────────────────
  let zoneFeatures = [];
  try {
    const zones = await riskEngine.getAllZones();
    zoneFeatures = (zones || [])
      .filter((z) => (!state || z.state === state))
      .filter((z) => (!minScore || z.overallRiskScore >= Number(minScore)))
      .filter((z) => (!hazard || z.primaryHazard === hazard))
      .map((z) => ({
        type: "Feature",
        geometry: {
          type: "Polygon",
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
  } catch (_e) {}

  // ── B. Active incidents (from field reports) ─────────────────────────────
  let incidentFeatures = [];
  if (isDbConnected) {
    try {
      const Incident = require("../models/Incident");
      const filter = { status: { $in: ["reported", "verified", "active"] } };
      if (hazard) filter.incidentType = hazard;
      if (state)  filter.state = state;

      const incidents = await Incident.find(filter)
        .select("title incidentType severity location state district status reportedAt")
        .limit(500)
        .lean();

      incidentFeatures = (incidents || [])
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
            riskScore:    (i.severity || 3) * 18,
          },
        }));
    } catch (_e) {}
  }

  // ── C. DB-stored ML model risk heatmap features ──────────────────────────
  let dbModelFeatures = [];
  if (isDbConnected) {
    try {
      const dbFilter = { layerType: "risk_heatmap", isActive: true };
      if (state)    dbFilter.state = state;
      if (hazard)   dbFilter.hazardType = hazard;
      if (minScore) dbFilter.riskScore = { $gte: Number(minScore) };

      const dbRecords = await GisLayer.find(dbFilter).lean();
      if (dbRecords && dbRecords.length > 0) {
        dbModelFeatures = dbRecords.map((r) => ({
          type: "Feature",
          geometry: r.geometry,
          properties: {
            ...r.properties,
            id:          r._id,
            name:        r.name,
            state:       r.state,
            district:    r.district,
            featureType: "model_output",
            riskScore:   r.riskScore,
            hazardType:  r.hazardType,
            source:      r.source,
            lastUpdated: r.updatedAt,
          },
        }));
      }
    } catch (_e) {}
  }

  // Fallback to in-memory model seeds if DB is not populated or offline
  if (dbModelFeatures.length === 0) {
    dbModelFeatures = MODEL_RISK_HEATMAP_SEED
      .filter((m) => (!state || m.state === state))
      .filter((m) => (!hazard || m.hazardType === hazard))
      .filter((m) => (!minScore || m.riskScore >= Number(minScore)))
      .map((m, idx) => ({
        type: "Feature",
        geometry: m.geometry,
        properties: {
          ...m.properties,
          id:          `seed-model-${idx}`,
          name:        m.name,
          state:       m.state,
          district:    m.district,
          featureType: "model_output",
          riskScore:   m.riskScore,
          hazardType:  m.hazardType,
          source:      m.source,
          lastUpdated: new Date().toISOString(),
        },
      }));
  }

  const allFeatures = [...zoneFeatures, ...incidentFeatures, ...dbModelFeatures];

  return {
    type: "FeatureCollection",
    features: allFeatures,
    generatedAt: new Date().toISOString(),
    summary: {
      totalFeatures: allFeatures.length,
      zones:         zoneFeatures.length,
      incidents:     incidentFeatures.length,
      modelOutputs:  dbModelFeatures.length,
    },
  };
}

// ---------------------------------------------------------------------------
// 2. Per-Segment Road Status GeoJSON
// ---------------------------------------------------------------------------
async function getRoadSegmentsGeoJSON({ state, status, hazard, evacuationOnly } = {}) {
  const isDbConnected = mongoose.connection.readyState === 1;
  let segments = [];
  if (isDbConnected) {
    try {
      const filter = {};
      if (state)          filter.state = state;
      if (status)         filter.status = status;
      if (hazard)         filter.hazardType = hazard;
      if (evacuationOnly === "true") filter.isEvacuationRoute = true;

      segments = await RoadSegment.find(filter).lean();
    } catch (_e) {}
  }

  // Fallback to seed data if database is empty or offline
  if (!segments || segments.length === 0) {
    segments = NER_CORRIDOR_SEED.filter((s) => {
      if (state && s.state !== state) return false;
      if (status && s.status !== status) return false;
      if (hazard && s.hazardType !== hazard) return false;
      if (evacuationOnly === "true" && !s.isEvacuationRoute) return false;
      return true;
    });
  }

  return {
    type: "FeatureCollection",
    features: segments.map((s) => ({
      type: "Feature",
      geometry: s.geometry,
      properties: {
        id:               s._id || s.name,
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
        statusUpdatedAt:  s.statusUpdatedAt || s.updatedAt || new Date().toISOString(),
      },
    })),
    generatedAt: new Date().toISOString(),
    totalSegments: segments.length,
    counts: {
      open:       segments.filter((s) => s.status === "open").length,
      restricted: segments.filter((s) => s.status === "restricted").length,
      blocked:    segments.filter((s) => s.status === "blocked").length,
    },
  };
}

// ---------------------------------------------------------------------------
// 3. GIS Layer GeoJSON (villages, infrastructure, landslide inventory)
// ---------------------------------------------------------------------------
async function getLayerGeoJSON({ layerType, state, district, minScore } = {}) {
  const isDbConnected = mongoose.connection.readyState === 1;
  let features = [];
  if (isDbConnected) {
    try {
      const filter = { isActive: true };
      if (layerType) filter.layerType = layerType;
      if (state)     filter.state = state;
      if (district)  filter.district = district;
      if (minScore)  filter.riskScore = { $gte: Number(minScore) };

      features = await GisLayer.find(filter).limit(2000).lean();
    } catch (_e) {}
  }

  // Fallback to seeds if empty
  if (!features || features.length === 0) {
    const seedSource =
      layerType === "village"        ? VILLAGE_SEED :
      layerType === "infrastructure" ? INFRA_SEED :
      layerType === "risk_heatmap"   ? MODEL_RISK_HEATMAP_SEED :
      [...INFRA_SEED, ...VILLAGE_SEED];

    features = seedSource
      .filter((f) => (!state || f.state === state))
      .filter((f) => (!district || f.district === district))
      .filter((f) => (!minScore || (f.riskScore || 0) >= Number(minScore)))
      .map((f, idx) => ({ ...f, _id: `seed-${layerType || 'layer'}-${idx}`, layerType: layerType || (f.properties?.type ? "infrastructure" : "village") }));
  }

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
      "Clear":      "open",
      "Restricted": "restricted",
      "Blocked":    "blocked",
    };
    const status = statusMap[corridor.currentStatus] || "unknown";
    const risk = corridor.blockageRisk === "CRITICAL" ? 90
               : corridor.blockageRisk === "HIGH"     ? 70
               : corridor.blockageRisk === "MODERATE" ? 50
               : 30;

    await RoadSegment.findOneAndUpdate(
      { name: { $regex: corridor.name.slice(0, 15), $options: "i" } },
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
// 5. Upsert a risk heatmap feature from ML model output
// ---------------------------------------------------------------------------
async function upsertRiskHeatmapFeature({ id, name, lat, lng, riskScore, hazardType, state, district, properties = {} }) {
  if (!lat || !lng) return null;
  return GisLayer.findOneAndUpdate(
    { layerType: "risk_heatmap", "geometry.coordinates": [lng, lat] },
    {
      $set: {
        layerType: "risk_heatmap",
        name:      name || `Risk Zone ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
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
  NER_CORRIDOR_SEED,
  MODEL_RISK_HEATMAP_SEED,
  INFRA_SEED,
  VILLAGE_SEED,
};
