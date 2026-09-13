import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getSocket } from "../services/socketService";

// ─── API helpers ───────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const headers = () => {
  const h = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};
const api = (path) => fetch(`${API}${path}`, { headers: headers() }).then((r) => r.json());
const apiPut = (path, body) =>
  fetch(`${API}${path}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) }).then((r) => r.json());

// ─── Status color palette ──────────────────────────────────────────────────────
const STATUS_COLORS = {
  online: "#00ff88",
  offline: "#64748b",
  low_battery: "#f59e0b",
  maintenance: "#8b5cf6",
  pending: "#94a3b8",
};

const TYPE_ICONS = {
  sos: "🆘",
  soil_tilt: "⛰️",
  heartbeat: "💚",
  alert: "⚠️",
  data: "📡",
};

const MSG_STATUS_COLORS = {
  received: "#f59e0b",
  acknowledged: "#3b82f6",
  dispatched: "#8b5cf6",
  resolved: "#22c55e",
};

// ─── Animated stat card ────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = "#00ff88", sub }) {
  return (
    <div style={{
      background: "rgba(15, 23, 42, 0.7)",
      backdropFilter: "blur(16px)",
      border: `1px solid ${accent}22`,
      borderRadius: 16,
      padding: "20px 22px",
      minWidth: 150,
      flex: "1 1 150px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -18, right: -12,
        fontSize: 60, opacity: 0.06, pointerEvents: "none",
      }}>{icon}</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4, letterSpacing: 0.4 }}>{label}</div>
      <div style={{
        fontSize: 32, fontWeight: 800, color: accent,
        lineHeight: 1.1, fontFamily: "'Inter', system-ui, sans-serif",
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Message row ───────────────────────────────────────────────────────────────
function MessageRow({ msg, onAcknowledge }) {
  const beacon = msg.originBeacon || {};
  const age = msg.createdAt ? timeSince(new Date(msg.createdAt)) : "";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px",
      background: msg.type === "sos" ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.02)",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      borderLeft: `3px solid ${MSG_STATUS_COLORS[msg.status] || "#64748b"}`,
      transition: "background 0.2s",
    }}>
      <span style={{ fontSize: 22 }}>{TYPE_ICONS[msg.type] || "📡"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: "#e2e8f0",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {msg.type === "sos" ? "SOS EMERGENCY" : msg.type === "soil_tilt" ? "Soil Tilt Reading" : msg.type === "heartbeat" ? "Heartbeat" : msg.type.toUpperCase()}
          <span style={{
            marginLeft: 8, fontSize: 11, padding: "2px 6px",
            borderRadius: 4, background: `${MSG_STATUS_COLORS[msg.status]}22`,
            color: MSG_STATUS_COLORS[msg.status],
          }}>{msg.status}</span>
        </div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
          {beacon.name || msg.originEui} · {beacon.villageName || ""} · {msg.hopCount} hop{msg.hopCount !== 1 ? "s" : ""} · {age}
        </div>
      </div>
      {msg.rssi != null && (
        <div style={{
          fontSize: 11, color: "#94a3b8", textAlign: "right",
          whiteSpace: "nowrap",
        }}>
          {msg.rssi} dBm
          {msg.snr != null && <div>SNR {msg.snr}</div>}
        </div>
      )}
      {msg.type === "sos" && msg.status === "received" && onAcknowledge && (
        <button
          onClick={() => onAcknowledge(msg._id)}
          style={{
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            border: "none", borderRadius: 8,
            color: "#fff", fontSize: 11, fontWeight: 700,
            padding: "6px 14px", cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
            boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
          }}
          onMouseEnter={(e) => { e.target.style.transform = "scale(1.05)"; }}
          onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
        >ACK</button>
      )}
    </div>
  );
}

// ─── Beacon detail panel ───────────────────────────────────────────────────────
function BeaconDetailPanel({ beacon, onClose }) {
  if (!beacon) return null;
  const bat = beacon.batteryLevel;
  const batColor = bat == null ? "#64748b" : bat > 60 ? "#22c55e" : bat > 20 ? "#f59e0b" : "#ef4444";
  const amc = beacon.amcContract || {};

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0,
      width: 380, maxWidth: "90vw",
      background: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(24px)",
      borderLeft: "1px solid rgba(0,255,136,0.1)",
      zIndex: 1000, overflowY: "auto",
      padding: 28,
      animation: "slideInRight 0.3s ease-out",
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 16,
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8, color: "#94a3b8", fontSize: 18, cursor: "pointer",
        width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
      }}>✕</button>

      <div style={{ fontSize: 11, color: "#00ff88", letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>BEACON DETAIL</div>
      <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{beacon.name}</h2>
      <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{beacon.deviceEui}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { l: "Status", v: beacon.status, c: STATUS_COLORS[beacon.status] },
          { l: "Type", v: beacon.type },
          { l: "Village", v: beacon.villageName || "—" },
          { l: "District", v: beacon.district || "—" },
          { l: "State", v: beacon.state || "—" },
          { l: "Power", v: beacon.powerSource },
          { l: "Firmware", v: beacon.firmwareVersion || "—" },
          { l: "Tilt Threshold", v: `${beacon.tiltThreshold || 15}°` },
        ].map((item, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8 }}>{item.l}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: item.c || "#e2e8f0", marginTop: 2 }}>{item.v}</div>
          </div>
        ))}
      </div>

      {/* Battery bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>🔋 Battery Level</div>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, height: 20, overflow: "hidden", position: "relative" }}>
          <div style={{
            width: `${bat ?? 0}%`, height: "100%",
            background: `linear-gradient(90deg, ${batColor}, ${batColor}aa)`,
            borderRadius: 6, transition: "width 0.5s ease",
          }} />
          <span style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 11, fontWeight: 700, color: "#fff",
          }}>{bat != null ? `${bat}%` : "N/A"}</span>
        </div>
        {beacon.solarVoltage != null && (
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>☀️ Solar: {beacon.solarVoltage}V</div>
        )}
      </div>

      {/* AMC Contract */}
      {amc.contractId && (
        <div style={{
          background: "rgba(99,102,241,0.08)", borderRadius: 12,
          border: "1px solid rgba(99,102,241,0.15)", padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>AMC CONTRACT</div>
          <div style={{ fontSize: 13, color: "#e2e8f0" }}>
            <div>ID: <span style={{ color: "#c7d2fe" }}>{amc.contractId}</span></div>
            <div>Authority: <span style={{ color: "#c7d2fe" }}>{amc.authority || "—"}</span></div>
            <div>Tier: <span style={{
              color: amc.tier === "premium" ? "#fbbf24" : amc.tier === "standard" ? "#60a5fa" : "#94a3b8",
              fontWeight: 700, textTransform: "uppercase",
            }}>{amc.tier || "—"}</span></div>
            {amc.expiresAt && (
              <div>Expires: <span style={{
                color: new Date(amc.expiresAt) < new Date() ? "#ef4444" : "#22c55e",
              }}>{new Date(amc.expiresAt).toLocaleDateString()}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Last heartbeat */}
      {beacon.lastHeartbeat && (
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Last heartbeat: {timeSince(new Date(beacon.lastHeartbeat))}
        </div>
      )}
    </div>
  );
}

// ─── Time helper ───────────────────────────────────────────────────────────────
function timeSince(date) {
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function MeshConsole() {
  const [health, setHealth] = useState(null);
  const [beacons, setBeacons] = useState([]);
  const [messages, setMessages] = useState([]);
  const [topology, setTopology] = useState({ nodes: [], links: [] });
  const [selectedBeacon, setSelectedBeacon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("map"); // map | messages | topology
  const [msgFilter, setMsgFilter] = useState("all");
  const feedRef = useRef(null);

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [hRes, bRes, mRes, tRes] = await Promise.all([
        api("/api/mesh/health"),
        api("/api/mesh/beacons"),
        api("/api/mesh/messages?limit=100"),
        api("/api/mesh/topology"),
      ]);
      if (hRes.success) setHealth(hRes.data);
      if (bRes.success) setBeacons(bRes.data);
      if (mRes.success) setMessages(mRes.data);
      if (tRes.success) setTopology(tRes.data);
    } catch (err) {
      console.warn("[MeshConsole] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Real-time socket events ────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();

    const onMeshSOS = (data) => {
      setMessages((prev) => [data.meshMessage, ...prev].slice(0, 200));
      fetchAll();
    };
    const onTiltAlert = (data) => {
      setMessages((prev) => [data.meshMessage, ...prev].slice(0, 200));
    };
    const onBeaconStatus = () => fetchAll();
    const onNetworkHealth = (data) => setHealth((prev) => ({ ...prev, ...data }));

    socket.on("meshSOS", onMeshSOS);
    socket.on("meshTiltAlert", onTiltAlert);
    socket.on("beaconStatus", onBeaconStatus);
    socket.on("meshNetworkHealth", onNetworkHealth);

    return () => {
      socket.off("meshSOS", onMeshSOS);
      socket.off("meshTiltAlert", onTiltAlert);
      socket.off("beaconStatus", onBeaconStatus);
      socket.off("meshNetworkHealth", onNetworkHealth);
    };
  }, [fetchAll]);

  // ── Acknowledge SOS ────────────────────────────────────────────────────────
  const handleAcknowledge = async (messageId) => {
    try {
      const res = await apiPut(`/api/mesh/messages/${messageId}/acknowledge`, { status: "acknowledged" });
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, status: "acknowledged" } : m))
        );
      }
    } catch (err) {
      console.error("[MeshConsole] Acknowledge error:", err);
    }
  };

  // ── Filtered messages ──────────────────────────────────────────────────────
  const filteredMessages = msgFilter === "all" ? messages : messages.filter((m) => m.type === msgFilter);

  // ── Map center (average of beacon locations, default to India center) ─────
  const validBeacons = beacons.filter(
    (b) => b.location?.coordinates?.[1] && b.location?.coordinates?.[0]
  );
  const mapCenter =
    validBeacons.length > 0
      ? [
          validBeacons.reduce((s, b) => s + b.location.coordinates[1], 0) / validBeacons.length,
          validBeacons.reduce((s, b) => s + b.location.coordinates[0], 0) / validBeacons.length,
        ]
      : [22.5, 82.5]; // India center

  // ── Build topology lines ──────────────────────────────────────────────────
  const topoLines = [];
  const euiToCoords = {};
  for (const node of topology.nodes || []) {
    if (node.location?.coordinates) {
      euiToCoords[node.deviceEui] = [node.location.coordinates[1], node.location.coordinates[0]];
    }
  }
  for (const link of topology.links || []) {
    const from = euiToCoords[link.source];
    const to = euiToCoords[link.target];
    if (from && to) topoLines.push([from, to]);
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#020617",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid rgba(0,255,136,0.2)",
            borderTopColor: "#00ff88",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <div style={{ color: "#00ff88", fontSize: 14, letterSpacing: 1 }}>Loading Mesh Network...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)",
      color: "#e2e8f0",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      paddingBottom: 40,
    }}>
      {/* ── Global Keyframes ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes sosPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        padding: "28px 32px 20px",
        borderBottom: "1px solid rgba(0,255,136,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "linear-gradient(135deg, #00ff88, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 16px rgba(0,255,136,0.25)",
          }}>📡</div>
          <div>
            <h1 style={{
              fontSize: 24, fontWeight: 800, margin: 0,
              background: "linear-gradient(90deg, #00ff88, #22d3ee)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Off-Grid SOS Mesh</h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Solar LoRaWAN Beacon Network · Infrastructure-Independent
            </p>
          </div>
        </div>
      </div>

      {/* ── Health Stats ──────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 14,
        padding: "20px 32px",
      }}>
        <StatCard label="Total Beacons" value={health?.totalBeacons ?? 0} icon="📡" accent="#00ff88" />
        <StatCard
          label="Network Online"
          value={`${health?.onlinePercent ?? 0}%`}
          icon="✅"
          accent={health?.onlinePercent >= 80 ? "#00ff88" : health?.onlinePercent >= 50 ? "#f59e0b" : "#ef4444"}
          sub={`${health?.online ?? 0} of ${health?.totalBeacons ?? 0}`}
        />
        <StatCard label="Active SOS" value={health?.activeSOS ?? 0} icon="🆘"
          accent={health?.activeSOS > 0 ? "#ef4444" : "#00ff88"} />
        <StatCard label="Tilt Alerts (24h)" value={health?.recentTiltAlerts ?? 0} icon="⛰️"
          accent={health?.recentTiltAlerts > 0 ? "#f59e0b" : "#00ff88"} />
        <StatCard label="Avg Battery" value={`${health?.avgBattery ?? 0}%`} icon="🔋"
          accent={health?.avgBattery >= 60 ? "#22c55e" : health?.avgBattery >= 30 ? "#f59e0b" : "#ef4444"} />
        <StatCard label="Gateways" value={health?.gateways ?? 0} icon="🌐" accent="#22d3ee" />
      </div>

      {/* ── Active SOS Banner ─────────────────────────────────────────────── */}
      {health?.activeSOS > 0 && (
        <div style={{
          margin: "0 32px 16px",
          background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 14, padding: "14px 22px",
          display: "flex", alignItems: "center", gap: 12,
          animation: "sosPulse 2s infinite",
        }}>
          <span style={{ fontSize: 28, animation: "pulse 1s infinite" }}>🆘</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fca5a5" }}>
              {health.activeSOS} Active Mesh SOS Alert{health.activeSOS > 1 ? "s" : ""}
            </div>
            <div style={{ fontSize: 12, color: "#f87171" }}>
              Received via off-grid LoRa relay — immediate attention required
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Bar ───────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 4, padding: "0 32px", marginBottom: 20,
      }}>
        {[
          { id: "map", label: "🗺️ Beacon Map", },
          { id: "messages", label: "📨 Message Feed" },
          { id: "topology", label: "🕸️ Network Topology" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id
                ? "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05))"
                : "rgba(255,255,255,0.03)",
              border: activeTab === tab.id
                ? "1px solid rgba(0,255,136,0.3)"
                : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10, padding: "10px 20px",
              color: activeTab === tab.id ? "#00ff88" : "#94a3b8",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────────── */}
      <div style={{ padding: "0 32px" }}>

        {/* ──── MAP TAB ──── */}
        {activeTab === "map" && (
          <div style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,255,136,0.08)",
            borderRadius: 16, overflow: "hidden",
            height: 520,
          }}>
            <MapContainer
              center={mapCenter}
              zoom={validBeacons.length > 0 ? 7 : 5}
              style={{ height: "100%", width: "100%", background: "#0f172a" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* Topology lines */}
              {topoLines.map((line, i) => (
                <Polyline
                  key={`topo-${i}`}
                  positions={line}
                  pathOptions={{
                    color: "#00ff88",
                    weight: 1.5,
                    opacity: 0.3,
                    dashArray: "6 4",
                  }}
                />
              ))}

              {/* Beacon markers */}
              {beacons.map((b) => {
                const lat = b.location?.coordinates?.[1];
                const lng = b.location?.coordinates?.[0];
                if (!lat && !lng) return null;

                const isActiveSOS = messages.some(
                  (m) => m.type === "sos" && m.status === "received" &&
                    (m.originBeacon?._id === b._id || m.originEui === b.deviceEui)
                );

                return (
                  <CircleMarker
                    key={b._id}
                    center={[lat, lng]}
                    radius={isActiveSOS ? 12 : b.type === "gateway" ? 10 : 7}
                    pathOptions={{
                      fillColor: isActiveSOS ? "#ef4444" : STATUS_COLORS[b.status] || "#64748b",
                      fillOpacity: 0.85,
                      color: isActiveSOS ? "#ef4444" : STATUS_COLORS[b.status] || "#64748b",
                      weight: isActiveSOS ? 3 : 2,
                      opacity: isActiveSOS ? 1 : 0.6,
                    }}
                    eventHandlers={{
                      click: () => setSelectedBeacon(b),
                    }}
                  >
                    <Popup>
                      <div style={{ fontFamily: "Inter, sans-serif", minWidth: 180 }}>
                        <strong style={{ fontSize: 14 }}>{b.name}</strong>
                        <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                          {b.deviceEui} · {b.type}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          <span style={{
                            display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                            background: STATUS_COLORS[b.status], marginRight: 6,
                          }} />
                          {b.status} · 🔋 {b.batteryLevel ?? "N/A"}%
                        </div>
                        {b.villageName && (
                          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                            📍 {b.villageName}{b.district ? `, ${b.district}` : ""}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        )}

        {/* ──── MESSAGES TAB ──── */}
        {activeTab === "messages" && (
          <div style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,255,136,0.08)",
            borderRadius: 16, overflow: "hidden",
          }}>
            {/* Filter bar */}
            <div style={{
              display: "flex", gap: 6, padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              flexWrap: "wrap",
            }}>
              {["all", "sos", "soil_tilt", "heartbeat", "alert"].map((f) => (
                <button
                  key={f}
                  onClick={() => setMsgFilter(f)}
                  style={{
                    background: msgFilter === f ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.04)",
                    border: msgFilter === f ? "1px solid rgba(0,255,136,0.3)" : "1px solid transparent",
                    borderRadius: 8, padding: "5px 14px",
                    color: msgFilter === f ? "#00ff88" : "#94a3b8",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >{f === "all" ? "All" : f === "sos" ? "🆘 SOS" : f === "soil_tilt" ? "⛰️ Tilt" : f === "heartbeat" ? "💚 Heartbeat" : "⚠️ Alert"}</button>
              ))}
            </div>

            {/* Message list */}
            <div ref={feedRef} style={{ maxHeight: 500, overflowY: "auto" }}>
              {filteredMessages.length === 0 ? (
                <div style={{
                  padding: 40, textAlign: "center", color: "#64748b",
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                  <div>No mesh messages yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Messages will appear here when beacons report data</div>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <MessageRow key={msg._id} msg={msg} onAcknowledge={handleAcknowledge} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ──── TOPOLOGY TAB ──── */}
        {activeTab === "topology" && (
          <div style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,255,136,0.08)",
            borderRadius: 16, padding: 28,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>
              🕸️ Mesh Network Topology
            </div>

            {topology.nodes.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📡</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No Beacons Registered</div>
                <div style={{ fontSize: 13 }}>Register beacons to see the mesh topology</div>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 14,
              }}>
                {topology.nodes.map((node) => {
                  const neighbors = node.meshNeighbors || [];
                  return (
                    <div
                      key={node.deviceEui}
                      onClick={() => {
                        const fullBeacon = beacons.find((b) => b.deviceEui === node.deviceEui);
                        if (fullBeacon) setSelectedBeacon(fullBeacon);
                      }}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${STATUS_COLORS[node.status]}33`,
                        borderRadius: 14, padding: 18,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0,255,136,0.05)";
                        e.currentTarget.style.borderColor = "rgba(0,255,136,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = `${STATUS_COLORS[node.status]}33`;
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: STATUS_COLORS[node.status],
                          boxShadow: `0 0 8px ${STATUS_COLORS[node.status]}80`,
                        }} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{node.name}</div>
                        {node.type === "gateway" && (
                          <span style={{
                            fontSize: 10, background: "rgba(34,211,238,0.15)",
                            color: "#22d3ee", padding: "2px 8px", borderRadius: 6, fontWeight: 700,
                          }}>GATEWAY</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                        {node.deviceEui} · {node.villageName || ""}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        🔋 {node.batteryLevel ?? "N/A"}% · 🔗 {neighbors.length} neighbor{neighbors.length !== 1 ? "s" : ""}
                      </div>
                      {neighbors.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {neighbors.map((n) => (
                            <span key={n} style={{
                              fontSize: 9, padding: "2px 6px", borderRadius: 4,
                              background: "rgba(0,255,136,0.08)", color: "#00ff88",
                              fontFamily: "monospace",
                            }}>{n.slice(-4)}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stats footer */}
            <div style={{
              marginTop: 20, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex", gap: 24, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                <span style={{ color: "#00ff88", fontWeight: 700 }}>{topology.nodes.length}</span> nodes
              </span>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                <span style={{ color: "#22d3ee", fontWeight: 700 }}>{topology.links.length}</span> links
              </span>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                  {topology.nodes.filter((n) => n.type === "gateway").length}
                </span> gateways
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Beacon Detail Slide-in Panel ──────────────────────────────────── */}
      {selectedBeacon && (
        <>
          <div
            onClick={() => setSelectedBeacon(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
              zIndex: 999,
            }}
          />
          <BeaconDetailPanel beacon={selectedBeacon} onClose={() => setSelectedBeacon(null)} />
        </>
      )}
    </div>
  );
}
