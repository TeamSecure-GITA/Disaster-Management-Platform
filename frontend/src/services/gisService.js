// ─────────────────────────────────────────────────────────────────────────────
// src/services/gisService.js
// GIS / mapping data service – fetches live GeoJSON from backend.
// Falls back to empty FeatureCollections so the map always renders.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const GIS_BASE = `${API_BASE}/api/gis`;

// Auth header helper (reads JWT from localStorage if present)
function _authHeaders() {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function _emptyFC(extra = {}) {
  return { type: "FeatureCollection", features: [], ...extra };
}

// ── Risk heatmap ─────────────────────────────────────────────────────────────

/**
 * Fetch risk heatmap GeoJSON.
 * @param {Object} params  { state, hazard, minScore }
 * @returns {Promise<GeoJSON.FeatureCollection>}
 */
export async function fetchRiskHeatmap({ state, hazard, minScore } = {}) {
  const qs = new URLSearchParams();
  if (state)    qs.set("state",    state);
  if (hazard)   qs.set("hazard",   hazard);
  if (minScore) qs.set("minScore", minScore);

  try {
    const res = await fetch(`${GIS_BASE}/heatmap?${qs}`, {
      headers: { ..._authHeaders() },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[GIS] fetchRiskHeatmap failed:", err.message);
    return _emptyFC();
  }
}

// ── Road segments ────────────────────────────────────────────────────────────

/**
 * Fetch road segment status GeoJSON.
 * @param {Object} params  { state, status, hazard, evacuationOnly }
 * @returns {Promise<GeoJSON.FeatureCollection>}
 */
export async function fetchRoadSegments({ state, status, hazard, evacuationOnly } = {}) {
  const qs = new URLSearchParams();
  if (state)          qs.set("state", state);
  if (status)         qs.set("status", status);
  if (hazard)         qs.set("hazard", hazard);
  if (evacuationOnly) qs.set("evacuationOnly", "true");

  try {
    const res = await fetch(`${GIS_BASE}/roads?${qs}`, {
      headers: { ..._authHeaders() },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[GIS] fetchRoadSegments failed:", err.message);
    return _emptyFC();
  }
}

// ── GIS layers (villages, infrastructure, landslide_zone) ───────────────────

/**
 * Fetch a GIS feature layer.
 * @param {string} layerType  "infrastructure" | "village" | "landslide_zone" | etc.
 * @param {Object} params     { state, district, minScore }
 * @returns {Promise<GeoJSON.FeatureCollection>}
 */
export async function fetchGisLayer(layerType, { state, district, minScore } = {}) {
  const qs = new URLSearchParams();
  if (state)    qs.set("state",    state);
  if (district) qs.set("district", district);
  if (minScore) qs.set("minScore", minScore);

  try {
    const res = await fetch(`${GIS_BASE}/layers/${layerType}?${qs}`, {
      headers: { ..._authHeaders() },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[GIS] fetchGisLayer(${layerType}) failed:`, err.message);
    return _emptyFC();
  }
}

// ── GIS summary stats ────────────────────────────────────────────────────────

/**
 * Fetch GIS summary (zone counts, road status counts).
 * @returns {Promise<Object>}
 */
export async function fetchGisSummary() {
  try {
    const res = await fetch(`${GIS_BASE}/summary`, {
      headers: { ..._authHeaders() },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || {};
  } catch (err) {
    console.warn("[GIS] fetchGisSummary failed:", err.message);
    return {};
  }
}

// ── Vulnerability reports (for VulnerabilityMap) ────────────────────────────

/**
 * Fetch infrastructure vulnerability reports from the backend incident layer.
 * Falls back to incident heatmap if no dedicated vulnerability layer exists.
 * @returns {Promise<GeoJSON.FeatureCollection>}
 */
export async function fetchVulnerabilityReports() {
  try {
    // Try dedicated infrastructure layer first
    const infraFC = await fetchGisLayer("infrastructure");
    if (infraFC.features.length > 0) return infraFC;

    // Fallback: incident heatmap restricted to infrastructure types
    const heatFC = await fetchRiskHeatmap();
    return heatFC;
  } catch (err) {
    console.warn("[GIS] fetchVulnerabilityReports failed:", err.message);
    return _emptyFC();
  }
}

// ── Colour helpers (shared by Map.jsx and VulnerabilityMap.jsx) ──────────────

export function riskScoreToColor(score) {
  if (!score || score < 20) return "#4ade80"; // green – low
  if (score < 40)           return "#a3e635"; // lime
  if (score < 55)           return "#eab308"; // yellow
  if (score < 70)           return "#f97316"; // orange
  if (score < 85)           return "#ef4444"; // red
  return "#9333ea";                            // purple – extreme
}

export function riskScoreToLevel(score) {
  if (!score || score < 35) return "LOW";
  if (score < 55)           return "MODERATE";
  if (score < 75)           return "HIGH";
  return "CRITICAL";
}

export function roadStatusToColor(status) {
  switch (status) {
    case "open":       return "#4ade80";
    case "restricted": return "#eab308";
    case "blocked":    return "#ef4444";
    default:           return "#94a3b8";
  }
}

// ── Live Incident Reports & Operator Verification ───────────────────────────

/**
 * Fetch live incidents GeoJSON FeatureCollection from /api/incidents/heatmap
 */
export async function fetchIncidentHeatmap({ incidentType, severity, from, to } = {}) {
  const qs = new URLSearchParams();
  if (incidentType) qs.set("incidentType", incidentType);
  if (severity)     qs.set("severity", severity);
  if (from)         qs.set("from", from);
  if (to)           qs.set("to", to);

  try {
    const res = await fetch(`${API_BASE}/api/incidents/heatmap?${qs}`, {
      headers: { ..._authHeaders() },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || data;
  } catch (err) {
    console.warn("[GIS] fetchIncidentHeatmap failed:", err.message);
    return _emptyFC();
  }
}

/**
 * Fetch all incidents with pagination and filtering (for operator verification screen)
 */
export async function fetchIncidents(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") qs.set(k, v);
  });
  const res = await fetch(`${API_BASE}/api/incidents?${qs}`, {
    headers: { ..._authHeaders() },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Update incident status (verify, escalate, resolve, reject)
 */
export async function updateIncidentStatus(id, { status, remarks } = {}) {
  const res = await fetch(`${API_BASE}/api/incidents/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ..._authHeaders(),
    },
    body: JSON.stringify({ status, remarks }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
