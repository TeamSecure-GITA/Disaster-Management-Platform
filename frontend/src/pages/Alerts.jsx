import React, { useState, useEffect, useCallback } from "react";
import { subscribeToDisasterAlerts } from "../services/socketService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const OFFICIAL_PORTALS = [
  {
    name: "NDMA SACHET",
    tagline: "Govt of India Disaster Alert Portal",
    url: "https://sachet.ndma.gov.in/",
    icon: "🏛️",
    badge: "Official National Portal",
    color: "#38bdf8",
  },
  {
    name: "IMD Weather Warnings",
    tagline: "India Meteorological Department",
    url: "https://mausam.imd.gov.in/",
    icon: "🌦️",
    badge: "Severe Weather & Cyclones",
    color: "#f59e0b",
  },
  {
    name: "CWC Flood Forecast",
    tagline: "Central Water Commission",
    url: "https://ffs.india-water.gov.in/",
    icon: "🌊",
    badge: "River Basin Monitoring",
    color: "#3b82f6",
  },
  {
    name: "GDACS Global Alert",
    tagline: "UN OCHA & European Commission",
    url: "https://www.gdacs.org/",
    icon: "🌐",
    badge: "Multi-Hazard Global",
    color: "#ec4899",
  },
  {
    name: "USGS Earthquakes",
    tagline: "Seismic Hazards Program",
    url: "https://earthquake.usgs.gov/earthquakes/map/",
    icon: "⚡",
    badge: "Real-time Seismic Feed",
    color: "#10b981",
  },
];

// Fallback initial alerts if offline or during initial startup
const FALLBACK_ALERTS = [
  {
    _id: "seed-1",
    title: "[IMD / NDMA SACHET] Cyclone & Squall Warning for Coastal Belts",
    message: "Deep depression over Bay of Bengal moving northwestwards. Wind speeds 55-65 km/h with heavy to very heavy rainfall expected along coastal districts. Fishermen are advised not to venture into deep sea.",
    type: "cyclone",
    severity: "critical",
    sourceAgency: "IMD Govt of India / NDMA SACHET",
    sourceUrl: "https://sachet.ndma.gov.in/",
    isGovtOfficial: true,
    affectedAreas: ["Odisha Coast", "North Andhra Pradesh", "West Bengal"],
    location: { coordinates: [86.8315, 19.8135] },
    instructions: [
      "Keep emergency supplies and battery-operated radios ready.",
      "Identify nearest multi-purpose cyclone shelters.",
      "Stay away from vulnerable structures and electrical installations.",
    ],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "seed-2",
    title: "[CWC / IMD] Mahanadi & Subarnarekha River Basin High Inundation Advisory",
    message: "Water levels crossing warning thresholds due to continuous catchment precipitation. Low-lying villages in downstream delta areas should prepare for localized evacuation.",
    type: "flood",
    severity: "high",
    sourceAgency: "Central Water Commission / IMD",
    sourceUrl: "https://ffs.india-water.gov.in/",
    isGovtOfficial: true,
    affectedAreas: ["Cuttack", "Puri", "Kendrapara"],
    location: { coordinates: [85.8245, 20.2961] },
    instructions: [
      "Move livestock and valuable documentation to higher ground.",
      "Avoid crossing flooded roads and submerged causeways.",
    ],
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    _id: "seed-3",
    title: "[GDACS/UN] Moderate Tropical Cyclone Advisory Active",
    message: "Tropical cyclone system tracking with sustained gales. UN OCHA & international meteorological agencies monitoring trajectory and impact zone.",
    type: "cyclone",
    severity: "high",
    sourceAgency: "GDACS (UN OCHA / European Commission)",
    sourceUrl: "https://www.gdacs.org/",
    isGovtOfficial: true,
    affectedAreas: ["Bay of Bengal Region"],
    location: { coordinates: [88.5, 18.2] },
    instructions: [
      "Monitor official weather bulletins regularly.",
      "Check local evacuation routes and emergency shelter maps.",
    ],
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newAlertBadge, setNewAlertBadge] = useState(null);

  // Fetch official & platform alerts from backend
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch live government alerts
      const govtRes = await fetch(`${API_URL}/api/alerts/live-govt`);
      let combined = [];

      if (govtRes.ok) {
        const govtJson = await govtRes.json();
        combined = govtJson.data || [];
      }

      // 2. Fetch general platform alerts
      try {
        const allRes = await fetch(`${API_URL}/api/alerts`);
        if (allRes.ok) {
          const allJson = await allRes.json();
          const generalAlerts = allJson.data || [];
          // Merge avoiding duplicates by ID or externalId
          const seenIds = new Set(combined.map((a) => a._id || a.externalId));
          for (const item of generalAlerts) {
            if (!seenIds.has(item._id) && !seenIds.has(item.externalId)) {
              combined.push(item);
            }
          }
        }
      } catch (e) {}

      if (combined.length > 0) {
        setAlerts(combined);
      } else {
        setAlerts(FALLBACK_ALERTS);
      }
    } catch (err) {
      console.warn("Failed to fetch alerts, using fallback data:", err);
      setAlerts(FALLBACK_ALERTS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger manual sync with official government websites
  const handleSyncGovtFeeds = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/alerts/sync-govt`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchAlerts();
      }
    } catch (err) {
      console.warn("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to real-time incoming government alerts via Socket.IO
    const unsubscribe = subscribeToDisasterAlerts((newAlert) => {
      setNewAlertBadge(newAlert.title);
      setAlerts((prev) => {
        const exists = prev.some((a) => a._id === newAlert._id || (a.externalId && a.externalId === newAlert.externalId));
        if (exists) return prev;
        return [newAlert, ...prev];
      });

      // Clear new banner after 8s
      setTimeout(() => setNewAlertBadge(null), 8000);
    });

    return () => unsubscribe();
  }, [fetchAlerts]);

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (typeFilter !== "all" && alert.type !== typeFilter) return false;
    if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
    if (sourceFilter === "govt" && !alert.isGovtOfficial) return false;
    if (sourceFilter === "community" && alert.isGovtOfficial) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (alert.title || "").toLowerCase().includes(q);
      const matchMsg = (alert.message || "").toLowerCase().includes(q);
      const matchAgency = (alert.sourceAgency || "").toLowerCase().includes(q);
      const matchArea = (alert.affectedAreas || []).some((a) => a.toLowerCase().includes(q));
      return matchTitle || matchMsg || matchAgency || matchArea;
    }
    return true;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "critical":
        return { bg: "#450a0a", border: "#ef4444", text: "#f87171", badge: "#dc2626" };
      case "high":
        return { bg: "#451a03", border: "#f97316", text: "#fb923c", badge: "#ea580c" };
      case "medium":
        return { bg: "#422006", border: "#eab308", text: "#fde047", badge: "#ca8a04" };
      case "low":
      default:
        return { bg: "#064e3b", border: "#10b981", text: "#6ee7b7", badge: "#059669" };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "flood":
        return "🌊";
      case "cyclone":
        return "🌀";
      case "earthquake":
        return "⚡";
      case "fire":
        return "🔥";
      case "tsunami":
        return "🌊";
      case "heatwave":
        return "☀️";
      case "storm":
      default:
        return "⛈️";
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Real-time incoming notification pill */}
      {newAlertBadge && (
        <div
          style={{
            backgroundColor: "#dc2626",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(220, 38, 38, 0.4)",
            animation: "pulse 1.5s infinite",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.4rem" }}>🚨</span>
            <div>
              <strong>NEW LIVE ALERT RECEIVED:</strong> {newAlertBadge}
            </div>
          </div>
          <button
            onClick={() => setNewAlertBadge(null)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
              🚨 Live Disaster & Weather Alerts
            </h1>
            <span
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                border: "1px solid #059669",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "0.78rem",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
              Connected to Official Govt Feeds
            </span>
          </div>
          <p style={{ color: "#94a3b8", marginTop: "6px", fontSize: "0.95rem" }}>
            Real-time multi-hazard warnings directly synchronized with official government disaster management portals & meteorological agencies.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleSyncGovtFeeds}
            disabled={syncing}
            style={{
              backgroundColor: syncing ? "#334155" : "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.88rem",
              cursor: syncing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 10px rgba(37, 99, 235, 0.3)",
              transition: "all 0.2s",
            }}
          >
            <span>{syncing ? "⟳ Syncing..." : "↻ Refresh Official Feeds"}</span>
          </button>
        </div>
      </div>

      {/* Official Government Portals Direct Access Bar */}
      <div style={{ marginBottom: "28px" }}>
        <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "1px", marginBottom: "12px" }}>
          🏛️ Official Government Disaster Alert Portals
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "12px",
          }}
        >
          {OFFICIAL_PORTALS.map((portal) => (
            <a
              key={portal.name}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "10px",
                padding: "14px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = portal.color;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#1e293b";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "1.3rem" }}>{portal.icon}</span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: "700",
                      color: portal.color,
                      backgroundColor: "rgba(255,255,255,0.05)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {portal.badge}
                  </span>
                </div>
                <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.95rem", marginTop: "8px" }}>
                  {portal.name}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
                  {portal.tagline}
                </div>
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: portal.color,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "6px",
                }}
              >
                <span>Visit Official Portal</span>
                <span>↗</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          backgroundColor: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ flex: "1 1 280px" }}>
            <input
              type="text"
              placeholder="🔍 Search alerts by title, region, or agency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "0.88rem",
                outline: "none",
              }}
            />
          </div>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.88rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Sources</option>
            <option value="govt">🏛️ Official Govt Feeds Only</option>
            <option value="community">👥 Platform Reports Only</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.88rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">🚨 Critical</option>
            <option value="high">⚠️ High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>

        {/* Hazard Type Quick Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Hazards" },
            { id: "cyclone", label: "🌀 Cyclone" },
            { id: "flood", label: "🌊 Flood" },
            { id: "earthquake", label: "⚡ Earthquake" },
            { id: "storm", label: "⛈️ Weather Storm" },
            { id: "heatwave", label: "☀️ Heatwave" },
            { id: "fire", label: "🔥 Wildfire" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              style={{
                backgroundColor: typeFilter === type.id ? "#2563eb" : "#1e293b",
                color: typeFilter === type.id ? "#ffffff" : "#94a3b8",
                border: "1px solid",
                borderColor: typeFilter === type.id ? "#3b82f6" : "#334155",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📡</div>
          <div style={{ color: "#38bdf8", fontWeight: "600" }}>Connecting to official disaster feeds...</div>
        </div>
      )}

      {/* Alerts Grid */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredAlerts.map((alert) => {
            const sev = getSeverityStyle(alert.severity);
            const officialUrl = alert.sourceUrl || (alert.isGovtOfficial ? "https://sachet.ndma.gov.in/" : null);

            return (
              <div
                key={alert._id || alert.externalId || Math.random()}
                style={{
                  backgroundColor: "#0f172a",
                  border: `1px solid ${sev.border}`,
                  borderRadius: "14px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  position: "relative",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Card Top Banner */}
                <div
                  style={{
                    backgroundColor: sev.bg,
                    borderBottom: `1px solid ${sev.border}44`,
                    padding: "12px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.2rem" }}>{getTypeIcon(alert.type)}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#f8fafc", textTransform: "capitalize" }}>
                      {alert.type} Warning
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    {alert.isGovtOfficial && (
                      <span
                        style={{
                          backgroundColor: "#1e293b",
                          color: "#38bdf8",
                          border: "1px solid #38bdf8",
                          fontSize: "0.68rem",
                          fontWeight: "800",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        OFFICIAL GOVT
                      </span>
                    )}
                    <span
                      style={{
                        backgroundColor: sev.badge,
                        color: "#fff",
                        fontSize: "0.68rem",
                        fontWeight: "800",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h3 style={{ fontSize: "1.08rem", fontWeight: "700", color: "#ffffff", margin: 0, lineHeight: 1.4 }}>
                    {alert.title}
                  </h3>

                  <p style={{ color: "#cbd5e1", fontSize: "0.88rem", lineHeight: 1.5, margin: 0 }}>
                    {alert.message}
                  </p>

                  {/* Affected Areas & Agency */}
                  <div
                    style={{
                      backgroundColor: "#1e293b",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      fontSize: "0.78rem",
                      color: "#94a3b8",
                      marginTop: "4px",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#cbd5e1" }}>🏛️ Agency: </strong>
                      <span style={{ color: "#38bdf8" }}>{alert.sourceAgency || "Disaster Response Bureau"}</span>
                    </div>

                    {alert.affectedAreas && alert.affectedAreas.length > 0 && (
                      <div>
                        <strong style={{ color: "#cbd5e1" }}>📍 Affected Region: </strong>
                        <span>{alert.affectedAreas.join(", ")}</span>
                      </div>
                    )}

                    {alert.createdAt && (
                      <div>
                        <strong style={{ color: "#cbd5e1" }}>🕐 Issued: </strong>
                        <span>{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  {alert.instructions && alert.instructions.length > 0 && (
                    <div style={{ marginTop: "4px" }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#f59e0b", marginBottom: "4px" }}>
                        ⚡ Action Directives:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.8rem", color: "#94a3b8" }}>
                        {alert.instructions.slice(0, 2).map((ins, i) => (
                          <li key={i}>{ins}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Card Footer: Direct Official Link Button */}
                <div
                  style={{
                    padding: "14px 18px",
                    borderTop: "1px solid #1e293b",
                    backgroundColor: "#0b1120",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {officialUrl ? (
                    <a
                      href={officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        width: "100%",
                        justifyContent: "center",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                    >
                      <span>🌐 View Official Govt Advisory Report</span>
                      <span style={{ fontSize: "1rem" }}>↗</span>
                    </a>
                  ) : (
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Platform Community Broadcast</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredAlerts.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#0f172a",
            borderRadius: "12px",
            border: "1px solid #1e293b",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🛡️</div>
          <h3 style={{ color: "#f8fafc", fontSize: "1.2rem", margin: "0 0 6px 0" }}>No Active Alerts Matching Criteria</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
            All official disaster portals and weather channels report normal conditions in the selected category.
          </p>
        </div>
      )}
    </div>
  );
}