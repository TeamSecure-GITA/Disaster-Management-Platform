import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { getSocket } from "../services/socketService";

// ─── Map Dynamic Controller ──────────────────────────────────────────────────
function MapController({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    } else if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
    }
  }, [center, zoom, bounds, map]);
  return null;
}

// ─── High-Definition Watermark-Free Tile Providers ──────────────────────────
export const TILE_PROVIDERS = {
  satellite: {
    id: "satellite",
    name: "🛰️ Satellite Imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Earthstar Geographics, USDA, USGS, AeroGRID",
    maxZoom: 19,
  },
  dark: {
    id: "dark",
    name: "🌑 Night Radar (Dark)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    maxZoom: 16,
  },
  topo: {
    id: "topo",
    name: "⛰️ Topo Relief",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri, DeLorme, NAVTEQ, USGS",
    maxZoom: 18,
  },
  streets: {
    id: "streets",
    name: "🗺️ OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
};

// ─── Verified Built-in Disaster Mesh Beacons ────────────────────────────────
export const DEFAULT_MESH_BEACONS = [
  // Uttarakhand
  {
    _id: "seed-uk-01",
    deviceEui: "70B3D57ED004A001",
    name: "Chamoli Solar Relay B-01",
    villageName: "Chamoli",
    district: "Chamoli",
    state: "Uttarakhand",
    type: "relay",
    powerSource: "solar",
    status: "online",
    tiltThreshold: 12,
    location: { type: "Point", coordinates: [79.3204, 30.3921] },
    batteryLevel: 94,
    solarVoltage: 4.42,
    lastTiltAngle: 3.1,
    firmwareVersion: "2.3.1-mesh",
    meshNeighbors: ["70B3D57ED004A002", "70B3D57ED004A003"],
    amcContract: { contractId: "AMC-UK-2026-042", authority: "SDRF Uttarakhand", tier: "premium", amountINR: 4200000 },
  },
  {
    _id: "seed-uk-02",
    deviceEui: "70B3D57ED004A002",
    name: "Joshimath Cliff Inclinometer B-02",
    villageName: "Joshimath Ward 4",
    district: "Chamoli",
    state: "Uttarakhand",
    type: "beacon",
    powerSource: "solar",
    status: "maintenance",
    tiltThreshold: 10,
    location: { type: "Point", coordinates: [79.5629, 30.5574] },
    batteryLevel: 68,
    solarVoltage: 3.85,
    lastTiltAngle: 16.4,
    firmwareVersion: "2.3.1-mesh",
    meshNeighbors: ["70B3D57ED004A001", "70B3D57ED004A003"],
    amcContract: { contractId: "AMC-UK-2026-042", authority: "SDRF Uttarakhand", tier: "premium", amountINR: 4200000 },
  },
  {
    _id: "seed-uk-03",
    deviceEui: "70B3D57ED004A003",
    name: "Alaknanda Valley Gateway GW-01",
    villageName: "Pipalkoti",
    district: "Chamoli",
    state: "Uttarakhand",
    type: "gateway",
    powerSource: "hybrid",
    status: "online",
    tiltThreshold: 20,
    location: { type: "Point", coordinates: [79.4121, 30.4122] },
    batteryLevel: 99,
    solarVoltage: 4.85,
    lastTiltAngle: 1.8,
    firmwareVersion: "2.4.0-gw",
    meshNeighbors: ["70B3D57ED004A001", "70B3D57ED004A002"],
    amcContract: { contractId: "AMC-UK-2026-042", authority: "SDRF Uttarakhand", tier: "premium", amountINR: 4200000 },
  },
  // North East Region (Sikkim & Meghalaya)
  {
    _id: "seed-ner-01",
    deviceEui: "70B3D57ED004B001",
    name: "Mangan Teesta Ridge Solar Node B-04",
    villageName: "Mangan",
    district: "North Sikkim",
    state: "Sikkim",
    type: "relay",
    powerSource: "solar",
    status: "online",
    tiltThreshold: 14,
    location: { type: "Point", coordinates: [88.5284, 27.5097] },
    batteryLevel: 92,
    solarVoltage: 4.38,
    lastTiltAngle: 4.2,
    firmwareVersion: "2.3.1-mesh",
    meshNeighbors: ["70B3D57ED004B002", "70B3D57ED004B003"],
    amcContract: { contractId: "AMC-NER-2026-088", authority: "SSDMA Sikkim", tier: "premium", amountINR: 3800000 },
  },
  {
    _id: "seed-ner-02",
    deviceEui: "70B3D57ED004B002",
    name: "Rangpo Highway Tunnel Repeater B-05",
    villageName: "Rangpo",
    district: "Pakyong",
    state: "Sikkim",
    type: "beacon",
    powerSource: "solar",
    status: "online",
    tiltThreshold: 15,
    location: { type: "Point", coordinates: [88.5298, 27.1764] },
    batteryLevel: 89,
    solarVoltage: 4.25,
    lastTiltAngle: 2.7,
    firmwareVersion: "2.3.1-mesh",
    meshNeighbors: ["70B3D57ED004B001", "70B3D57ED004B003"],
    amcContract: { contractId: "AMC-NER-2026-088", authority: "SSDMA Sikkim", tier: "premium", amountINR: 3800000 },
  },
  {
    _id: "seed-ner-03",
    deviceEui: "70B3D57ED004B003",
    name: "NESAC ISRO Uplink Gateway GW-02",
    villageName: "Umiam",
    district: "Ri-Bhoi",
    state: "Meghalaya",
    type: "gateway",
    powerSource: "hybrid",
    status: "online",
    tiltThreshold: 25,
    location: { type: "Point", coordinates: [91.9168, 25.6749] },
    batteryLevel: 100,
    solarVoltage: 5.0,
    lastTiltAngle: 0.9,
    firmwareVersion: "2.4.0-gw",
    meshNeighbors: ["70B3D57ED004B001", "70B3D57ED004B002"],
    amcContract: { contractId: "AMC-NER-2026-090", authority: "NESAC ISRO / ASDMA", tier: "enterprise", amountINR: 5400000 },
  },
  // Kerala (Western Ghats - Wayanad)
  {
    _id: "seed-kl-01",
    deviceEui: "70B3D57ED004C001",
    name: "Wayanad Meppadi Slope Sensor B-07",
    villageName: "Meppadi",
    district: "Wayanad",
    state: "Kerala",
    type: "beacon",
    powerSource: "solar",
    status: "low_battery",
    tiltThreshold: 11,
    location: { type: "Point", coordinates: [76.1284, 11.5519] },
    batteryLevel: 28,
    solarVoltage: 3.12,
    lastTiltAngle: 8.4,
    firmwareVersion: "2.3.1-mesh",
    meshNeighbors: ["70B3D57ED004C002", "70B3D57ED004C003"],
    amcContract: { contractId: "AMC-KL-2026-036", authority: "KSDMA Kerala", tier: "standard", amountINR: 3600000 },
  },
  {
    _id: "seed-kl-02",
    deviceEui: "70B3D57ED004C002",
    name: "Chooralmala Bridge Solar Relay B-08",
    villageName: "Chooralmala",
    district: "Wayanad",
    state: "Kerala",
    type: "relay",
    powerSource: "solar",
    status: "online",
    tiltThreshold: 13,
    location: { type: "Point", coordinates: [76.1682, 11.5312] },
    batteryLevel: 91,
    solarVoltage: 4.4,
    lastTiltAngle: 3.5,
    firmwareVersion: "2.3.1-mesh",
    meshNeighbors: ["70B3D57ED004C001", "70B3D57ED004C003"],
    amcContract: { contractId: "AMC-KL-2026-036", authority: "KSDMA Kerala", tier: "standard", amountINR: 3600000 },
  },
  {
    _id: "seed-kl-03",
    deviceEui: "70B3D57ED004C003",
    name: "Kalpetta Emergency HQ Gateway GW-03",
    villageName: "Kalpetta",
    district: "Wayanad",
    state: "Kerala",
    type: "gateway",
    powerSource: "hybrid",
    status: "online",
    tiltThreshold: 22,
    location: { type: "Point", coordinates: [76.0829, 11.6092] },
    batteryLevel: 98,
    solarVoltage: 4.9,
    lastTiltAngle: 1.2,
    firmwareVersion: "2.4.0-gw",
    meshNeighbors: ["70B3D57ED004C001", "70B3D57ED004C002"],
    amcContract: { contractId: "AMC-KL-2026-036", authority: "KSDMA Kerala", tier: "standard", amountINR: 3600000 },
  },
];

// Helper: load and merge beacons from localStorage and server
export function loadPersistedBeacons(serverBeacons = []) {
  try {
    const raw = localStorage.getItem("disaster_mesh_custom_beacons");
    const custom = raw ? JSON.parse(raw) : [];
    const base = serverBeacons && serverBeacons.length > 0 ? serverBeacons : DEFAULT_MESH_BEACONS;
    const combined = [...custom];
    base.forEach((b) => {
      if (!combined.some((c) => c.deviceEui === b.deviceEui || (b._id && c._id === b._id))) {
        combined.push(b);
      }
    });
    return combined;
  } catch (e) {
    console.warn("Error loading persisted beacons:", e);
    return serverBeacons && serverBeacons.length > 0 ? serverBeacons : DEFAULT_MESH_BEACONS;
  }
}

// ─── API helpers ───────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const headers = () => {
  const h = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};
const api = (path) => fetch(`${API}${path}`, { headers: headers() }).then((r) => r.json());
const apiPost = (path, body) =>
  fetch(`${API}${path}`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then((r) => r.json());
const apiPut = (path, body) =>
  fetch(`${API}${path}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) }).then((r) => r.json());

// ─── Status color palette ──────────────────────────────────────────────────────
const STATUS_COLORS = {
  online: "#00ff88",
  offline: "#475569",
  low_battery: "#f59e0b",
  maintenance: "#a78bfa",
  pending: "#94a3b8",
};

const STATUS_LABELS = {
  online: "Online",
  offline: "Offline",
  low_battery: "Low Battery",
  maintenance: "Maintenance",
  pending: "Pending",
};

const TYPE_ICONS = { sos: "🆘", soil_tilt: "⛰️", heartbeat: "💚", alert: "⚠️", data: "📡" };

const MSG_STATUS_COLORS = {
  received: "#f59e0b",
  acknowledged: "#3b82f6",
  dispatched: "#a78bfa",
  resolved: "#00ff88",
};

// ─── Web Audio Tone Synthesizer ───────────────────────────────────────────────
function playAudioTone(type = "sos") {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    if (type === "sos") {
      // Dual-tone urgent alert ping
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      osc2.frequency.setValueAtTime(440, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === "tilt") {
      // Warning chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(329.63, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Gentle radar chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {
    // Suppressed audio context restrictions
  }
}

// ─── Time helper ───────────────────────────────────────────────────────────────
function timeSince(date) {
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Animated counter hook ─────────────────────────────────────────────────────
function useAnimatedNumber(target) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const from = display;
    const diff = target - from;
    if (diff === 0) return;
    const duration = 600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + diff * ease));
      if (t < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target]);
  return display;
}

// ─── Stat card component ───────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = "#00ff88", sub, alert: isAlert }) {
  const numVal = typeof value === "number" ? value : parseInt(value, 10);
  const animated = useAnimatedNumber(isNaN(numVal) ? 0 : numVal);
  const displayVal = typeof value === "string" && (value.includes("%") || value.includes("₹") || value.includes("Cr"))
    ? value
    : isNaN(numVal) ? value : animated;

  return (
    <div className="mesh-stat-card" style={{
      background: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(20px) saturate(1.3)",
      WebkitBackdropFilter: "blur(20px) saturate(1.3)",
      border: `1px solid ${accent}22`,
      borderRadius: 18,
      padding: "20px 22px 16px",
      minWidth: 160,
      flex: "1 1 160px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.25s cubic-bezier(.22,.61,.36,1), box-shadow 0.25s ease, border-color 0.3s",
      cursor: "default",
    }}>
      <div style={{
        position: "absolute", top: -25, right: -25,
        width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}18, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -8, right: -4,
        fontSize: 50, opacity: 0.04, pointerEvents: "none",
        filter: "blur(1px)",
      }}>{icon}</div>
      <div style={{
        fontSize: 11, color: "#94a3b8", marginBottom: 6,
        letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 600,
      }}>{label}</div>
      <div style={{
        fontSize: 32, fontWeight: 800, color: accent,
        lineHeight: 1.1,
        fontFamily: "'Inter', system-ui, sans-serif",
        textShadow: `0 0 25px ${accent}25`,
        ...(isAlert ? { animation: "alertFlash 1.5s infinite" } : {}),
      }}>{displayVal}</div>
      {sub && <div style={{
        fontSize: 11, color: "#64748b", marginTop: 6,
        fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
      }}>{sub}</div>}
      <div style={{
        position: "absolute", bottom: 0, left: 18, right: 18, height: 2,
        borderRadius: 2,
        background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
      }} />
    </div>
  );
}

// ─── Gyro Inclinometer Graphic Component ───────────────────────────────────────
function InclinometerDial({ angle = 0, threshold = 15, pitch = 0, roll = 0, size = 160 }) {
  const radius = size / 2 - 14;
  const isDanger = angle >= threshold;
  const isWarning = angle >= threshold * 0.75 && !isDanger;
  const dialColor = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#00ff88";

  // Arc calculation for threshold zone
  const thresholdAngleRad = (threshold * Math.PI) / 180;
  const needleRotation = Math.min(Math.max(angle, 0), 45) * 3 - 90; // map 0-45 deg to angle span

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "rgba(10, 18, 38, 0.7)", borderRadius: 16, padding: "16px 14px",
      border: `1px solid ${dialColor}30`, position: "relative",
    }}>
      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
        Soil Tilt Inclinometer
      </div>
      <div style={{ position: "relative", width: size, height: size * 0.75, overflow: "hidden" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background semicircle dial */}
          <path
            d={`M 14,${size / 2} A ${radius},${radius} 0 0,1 ${size - 14},${size / 2}`}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Warning sector */}
          <path
            d={`M 14,${size / 2} A ${radius},${radius} 0 0,1 ${size * 0.65},${18}`}
            fill="none"
            stroke="#00ff8840"
            strokeWidth="10"
          />
          <path
            d={`M ${size * 0.65},${18} A ${radius},${radius} 0 0,1 ${size - 14},${size / 2}`}
            fill="none"
            stroke="#ef444460"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Needle pivot */}
          <circle cx={size / 2} cy={size / 2} r="6" fill={dialColor} />
          {/* Rotating needle */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + Math.cos((needleRotation * Math.PI) / 180) * (radius - 8)}
            y2={size / 2 + Math.sin((needleRotation * Math.PI) / 180) * (radius - 8)}
            stroke={dialColor}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transition: "all 0.5s cubic-bezier(.22,.61,.36,1)" }}
          />
        </svg>
        <div style={{
          position: "absolute", bottom: 2, left: 0, right: 0, textAlign: "center",
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: dialColor, fontFamily: "monospace" }}>
            {Number(angle).toFixed(1)}°
          </span>
          <span style={{ fontSize: 11, color: "#64748b", marginLeft: 4 }}>
            / limit {threshold}°
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11, color: "#64748b" }}>
        <span>Pitch: <strong style={{ color: "#cbd5e1", fontFamily: "monospace" }}>{pitch}°</strong></span>
        <span>Roll: <strong style={{ color: "#cbd5e1", fontFamily: "monospace" }}>{roll}°</strong></span>
      </div>
      <div style={{
        marginTop: 6, fontSize: 10, padding: "2px 8px", borderRadius: 4,
        background: `${dialColor}18`, color: dialColor, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: 0.5,
      }}>
        {isDanger ? "⚠️ Hazard Threshold Breached" : isWarning ? "⚡ High Shift Watch" : "✅ Slope Stable"}
      </div>
    </div>
  );
}

// ─── Interactive SVG Topology Graph ───────────────────────────────────────────
function TopologySvgGraph({ nodes = [], links = [], selectedEui, onSelectNode }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const width = 840;
  const height = 440;

  // Compute node coordinates in concentric/force-styled ring
  const layout = useMemo(() => {
    const coords = {};
    const gateways = nodes.filter((n) => n.type === "gateway");
    const others = nodes.filter((n) => n.type !== "gateway");

    // Place gateways along middle axis
    gateways.forEach((gw, idx) => {
      const x = width * ((idx + 1) / (gateways.length + 1));
      const y = height / 2;
      coords[gw.deviceEui] = { x, y, node: gw };
    });

    // Place relays around gateways
    others.forEach((rel, idx) => {
      const angle = (idx / others.length) * 2 * Math.PI;
      const radius = 135 + (idx % 2 === 0 ? 30 : -25);
      const targetGw = gateways[idx % gateways.length];
      const centerX = targetGw ? coords[targetGw.deviceEui]?.x || width / 2 : width / 2;
      const centerY = targetGw ? coords[targetGw.deviceEui]?.y || height / 2 : height / 2;

      const x = Math.max(60, Math.min(width - 60, centerX + Math.cos(angle) * radius));
      const y = Math.max(50, Math.min(height - 50, centerY + Math.sin(angle) * radius));
      coords[rel.deviceEui] = { x, y, node: rel };
    });

    return coords;
  }, [nodes, links]);

  const activeConnectedEuis = useMemo(() => {
    if (!hoveredNode) return new Set();
    const set = new Set([hoveredNode]);
    links.forEach((l) => {
      if (l.source === hoveredNode) set.add(l.target);
      if (l.target === hoveredNode) set.add(l.source);
    });
    return set;
  }, [hoveredNode, links]);

  return (
    <div style={{
      width: "100%", height, background: "radial-gradient(ellipse at 50% 50%, rgba(2,12,30,0.95), #020617)",
      borderRadius: 16, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Links */}
        {links.map((link, idx) => {
          const from = layout[link.source];
          const to = layout[link.target];
          if (!from || !to) return null;

          const isHighlighted = hoveredNode && (
            (link.source === hoveredNode && activeConnectedEuis.has(link.target)) ||
            (link.target === hoveredNode && activeConnectedEuis.has(link.source))
          );

          return (
            <g key={`l-${idx}`}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={isHighlighted ? "#00ff88" : "rgba(34,211,238,0.25)"}
                strokeWidth={isHighlighted ? 3 : 1.5}
                strokeDasharray={isHighlighted ? "none" : "5,4"}
                style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
              />
              {/* Packet Flow Animation on highlighted links */}
              {isHighlighted && (
                <circle r="3.5" fill="#00ff88" filter="url(#glow)">
                  <animateMotion
                    path={`M ${from.x},${from.y} L ${to.x},${to.y}`}
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const pos = layout[n.deviceEui];
          if (!pos) return null;

          const isSelected = selectedEui === n.deviceEui;
          const isHovered = hoveredNode === n.deviceEui;
          const isDimmed = hoveredNode && !activeConnectedEuis.has(n.deviceEui);
          const color = STATUS_COLORS[n.status] || "#475569";
          const isGw = n.type === "gateway";
          const radius = isGw ? 18 : 13;

          return (
            <g
              key={n.deviceEui}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              opacity={isDimmed ? 0.35 : 1}
              onMouseEnter={() => setHoveredNode(n.deviceEui)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onSelectNode(n)}
            >
              {/* Outer halo / gateway ring */}
              {isGw && (
                <circle
                  r={radius + 7}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                  opacity="0.7"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="10s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              {/* Selected ring */}
              {(isSelected || isHovered) && (
                <circle r={radius + 5} fill="none" stroke="#00ff88" strokeWidth="2" opacity="0.8" />
              )}
              {/* Main Node Circle */}
              <circle
                r={radius}
                fill={`rgba(15, 23, 42, 0.95)`}
                stroke={isGw ? "#22d3ee" : color}
                strokeWidth={isGw ? 2.5 : 2}
                filter="url(#glow)"
              />
              <circle r={radius - 4} fill={color} opacity="0.85" />

              {/* Node Icon or Text */}
              <text
                textAnchor="middle"
                dy="4"
                fontSize={isGw ? 12 : 9}
                fill="#ffffff"
                fontWeight="bold"
                pointerEvents="none"
              >
                {isGw ? "🌐" : n.batteryLevel != null ? `${n.batteryLevel}%` : "•"}
              </text>

              {/* Label below node */}
              <text
                textAnchor="middle"
                y={radius + 14}
                fontSize="10"
                fill={isHovered || isSelected ? "#00ff88" : "#94a3b8"}
                fontWeight={isHovered ? "700" : "500"}
                pointerEvents="none"
              >
                {n.name.length > 16 ? `${n.name.slice(0, 14)}…` : n.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Topology Legend */}
      <div style={{
        position: "absolute", bottom: 12, left: 16, zIndex: 10,
        background: "rgba(2,6,23,0.8)", backdropFilter: "blur(10px)",
        borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.06)",
        fontSize: 11, display: "flex", gap: 14, color: "#94a3b8",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22d3ee" }} />
          <span>Gateway (Cellular/Sat Uplink)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00ff88" }} />
          <span>Relay Beacon (Solar Hop)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#00ff88", fontWeight: "bold" }}>--</span>
          <span>Hover node to trace multi-hop route</span>
        </div>
      </div>
    </div>
  );
}

// ─── Deploy Beacon Modal ───────────────────────────────────────────────────────
function DeployBeaconModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    deviceEui: `70B3D5${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    name: "",
    villageName: "",
    district: "",
    state: "",
    type: "relay",
    powerSource: "solar",
    tiltThreshold: 14,
    latitude: 30.39,
    longitude: 79.32,
    authority: "SDRF Uttarakhand",
    contractId: "AMC-UK-2026-042",
    tier: "premium",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({
            ...f,
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
          }));
        },
        () => setError("GPS permission denied or unavailable.")
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      setError("Please specify valid decimal coordinates for Latitude and Longitude.");
      setSubmitting(false);
      return;
    }

    const newBeacon = {
      _id: `custom-node-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      deviceEui: form.deviceEui.trim().toUpperCase(),
      name: form.name.trim() || `Beacon ${form.deviceEui.slice(-4)}`,
      villageName: form.villageName.trim() || "Field Sector",
      district: form.district.trim() || "Emergency Ward",
      state: form.state.trim() || "Field Operations",
      type: form.type,
      powerSource: form.powerSource,
      status: "online",
      tiltThreshold: Number(form.tiltThreshold) || 14,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      batteryLevel: 98,
      solarVoltage: 4.45,
      lastTiltAngle: 2.1,
      firmwareVersion: "2.4.0-mesh",
      meshNeighbors: [],
      isCustom: true,
      createdAt: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      amcContract: {
        contractId: form.contractId || `AMC-${form.deviceEui.slice(-6)}`,
        authority: form.authority || "State Disaster Authority",
        tier: form.tier || "premium",
        amountINR: form.tier === "premium" ? 4200000 : 2800000,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };

    // 1. Immediately persist to localStorage so beacon is never lost
    try {
      const stored = JSON.parse(localStorage.getItem("disaster_mesh_custom_beacons") || "[]");
      const updated = [newBeacon, ...stored.filter((b) => b.deviceEui !== newBeacon.deviceEui)];
      localStorage.setItem("disaster_mesh_custom_beacons", JSON.stringify(updated));
    } catch (lsErr) {
      console.warn("LocalStorage save warning:", lsErr);
    }

    // 2. Try registering on backend API
    try {
      await apiPost("/api/mesh/beacons", {
        deviceEui: newBeacon.deviceEui,
        name: newBeacon.name,
        villageName: newBeacon.villageName,
        district: newBeacon.district,
        state: newBeacon.state,
        type: newBeacon.type,
        powerSource: newBeacon.powerSource,
        tiltThreshold: newBeacon.tiltThreshold,
        latitude: lat,
        longitude: lng,
        batteryLevel: newBeacon.batteryLevel,
        solarVoltage: newBeacon.solarVoltage,
        amcContract: newBeacon.amcContract,
      });
    } catch (netErr) {
      console.warn("Backend register warning (persisted locally):", netErr);
    }

    // 3. Complete and pass beacon to parent state
    onSuccess(newBeacon);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1200,
      background: "rgba(2,6,23,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        width: 520, maxWidth: "100%", background: "#0b1528",
        border: "1px solid rgba(0,255,136,0.2)", borderRadius: 20,
        padding: "26px 30px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#f8fafc" }}>
              📡 Deploy New Solar LoRa Beacon
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
              Provision an infrastructure-independent off-grid mesh node
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer",
          }}>✕</button>
        </div>

        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 12, marginBottom: 14,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Device EUI (Hex)</label>
              <input
                value={form.deviceEui}
                onChange={(e) => setForm({ ...form, deviceEui: e.target.value.toUpperCase() })}
                required
                style={{
                  width: "100%", marginTop: 4, padding: "8px 12px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#00ff88", fontFamily: "monospace",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Beacon Name</label>
              <input
                placeholder="e.g. Mana Pass Ridge-05"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{
                  width: "100%", marginTop: 4, padding: "8px 12px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Village / Outpost</label>
              <input
                placeholder="e.g. Gopeshwar"
                value={form.villageName}
                onChange={(e) => setForm({ ...form, villageName: e.target.value })}
                style={{
                  width: "100%", marginTop: 4, padding: "8px 12px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>District</label>
              <input
                placeholder="e.g. Chamoli"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                style={{
                  width: "100%", marginTop: 4, padding: "8px 12px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>State</label>
              <input
                placeholder="e.g. Uttarakhand"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                style={{
                  width: "100%", marginTop: 4, padding: "8px 12px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Node Role</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{
                  width: "100%", marginTop: 4, padding: "8px 12px", background: "#111c34",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#22d3ee",
                }}
              >
                <option value="relay">Relay Node</option>
                <option value="gateway">Gateway (Uplink)</option>
                <option value="beacon">Field Beacon</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Power Source</label>
              <select
                value={form.powerSource}
                onChange={(e) => setForm({ ...form, powerSource: e.target.value })}
                style={{
                  width: "100%", marginTop: 4, padding: "8px 12px", background: "#111c34",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fbbf24",
                }}
              >
                <option value="solar">☀️ Solar Supercap</option>
                <option value="hybrid">⚡ Hybrid + Bat</option>
                <option value="battery">🔋 LiFePO4</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Tilt Limit (°)</label>
              <input
                type="number"
                value={form.tiltThreshold}
                onChange={(e) => setForm({ ...form, tiltThreshold: e.target.value })}
                style={{
                  width: "100%", marginTop: 4, padding: "8px 12px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f59e0b",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Latitude</label>
              <input
                type="number" step="0.0001"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                style={{
                  width: "100%", marginTop: 4, padding: "8px 12px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Longitude</label>
              <input
                type="number" step="0.0001"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                style={{
                  width: "100%", marginTop: 4, padding: "8px 12px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff",
                }}
              />
            </div>
            <button
              type="button" onClick={handleUseGps}
              style={{
                padding: "8px 12px", background: "rgba(0,255,136,0.1)",
                border: "1px solid rgba(0,255,136,0.25)", borderRadius: 8,
                color: "#00ff88", fontSize: 12, cursor: "pointer", height: 38,
              }}
            >📍 GPS</button>
          </div>

          {/* Quick Presets for Rapid 1-Click Deployment */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 700, marginBottom: 6 }}>
              ⚡ QUICK FILL REGIONAL PRESETS:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { l: "🏔️ Sikkim Ridge", lat: 27.5097, lng: 88.5284, v: "Mangan Ridge", d: "North Sikkim", s: "Sikkim", t: "relay" },
                { l: "⛰️ Uttarakhand Cliff", lat: 30.5574, lng: 79.5629, v: "Joshimath Cliff", d: "Chamoli", s: "Uttarakhand", t: "beacon" },
                { l: "🌊 Assam Flood Basin", lat: 26.9602, lng: 94.2185, v: "Garamur Ghat", d: "Majuli", s: "Assam", t: "gateway" },
                { l: "🌧️ Meghalaya Ridge", lat: 25.5962, lng: 91.9392, v: "Shillong Ridge", d: "East Khasi Hills", s: "Meghalaya", t: "relay" },
                { l: "🌴 Kerala Wayanad", lat: 11.5519, lng: 76.1284, v: "Meppadi Slope", d: "Wayanad", s: "Kerala", t: "beacon" },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setForm((f) => ({
                    ...f,
                    name: `${p.v} Solar ${p.t === "gateway" ? "Gateway" : "Relay"}`,
                    villageName: p.v,
                    district: p.d,
                    state: p.s,
                    type: p.t,
                    latitude: p.lat,
                    longitude: p.lng,
                  }))}
                  style={{
                    padding: "4px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 600,
                    background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)",
                    color: "#22d3ee", cursor: "pointer",
                  }}
                >
                  {p.l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <button
              type="button" onClick={onClose}
              style={{
                padding: "10px 18px", background: "rgba(255,255,255,0.05)", border: "none",
                borderRadius: 8, color: "#94a3b8", cursor: "pointer",
              }}
            >Cancel</button>
            <button
              type="submit" disabled={submitting}
              style={{
                padding: "10px 22px", background: "linear-gradient(135deg, #00ff88, #059669)",
                border: "none", borderRadius: 8, color: "#020617", fontWeight: 700, cursor: "pointer",
              }}
            >{submitting ? "Deploying..." : "Confirm & Deploy"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Simulation Trigger Modal ───────────────────────────────────────────────────
function SimulateModal({ onClose, onTriggered }) {
  const [type, setType] = useState("sos");
  const [loading, setLoading] = useState(false);
  const [customMsg, setCustomMsg] = useState("");

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await apiPost("/api/mesh/simulate", {
        type,
        messageText: customMsg || undefined,
      });
      if (res.success) {
        if (type === "sos") playAudioTone("sos");
        else if (type === "soil_tilt") playAudioTone("tilt");
        else playAudioTone("heartbeat");
        onTriggered();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1200,
      background: "rgba(2,6,23,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        width: 480, maxWidth: "100%", background: "#0b1528",
        border: "1px solid rgba(34,211,238,0.25)", borderRadius: 20,
        padding: "26px 30px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>
              📡 Simulate Live LoRa Packet
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}>
              Test multi-hop relay propagation, SOS bridging, and soil sensor spikes
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          {[
            { id: "sos", label: "🆘 Critical SOS Relay Hop", desc: "Simulates remote village SOS hopping through 2 solar beacons to reach gateway" },
            { id: "soil_tilt", label: "⛰️ Landslide Tilt Spike (21.5°)", desc: "Simulates hill-slope displacement breaching danger threshold" },
            { id: "heartbeat", label: "💚 Solar Charging Heartbeat", desc: "Simulates peak solar voltage & battery recharge cycle" },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setType(item.id)}
              style={{
                padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                background: type === item.id ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
                border: type === item.id ? "1px solid #22d3ee" : "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: type === item.id ? "#22d3ee" : "#cbd5e1" }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {type === "sos" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Emergency Note (Optional)</label>
            <input
              placeholder="e.g. Flash flood trapped 8 people near school, zero cell reception"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              style={{
                width: "100%", marginTop: 4, padding: "8px 12px", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12,
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 18px", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, color: "#94a3b8", cursor: "pointer" }}
          >Cancel</button>
          <button
            onClick={handleSimulate}
            disabled={loading}
            style={{
              padding: "10px 22px", background: "linear-gradient(135deg, #22d3ee, #0284c7)",
              border: "none", borderRadius: 8, color: "#020617", fontWeight: 700, cursor: "pointer",
            }}
          >{loading ? "Transmitting..." : "Broadcast LoRa Packet"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Message row ───────────────────────────────────────────────────────────────
function MessageRow({ msg, onAcknowledge }) {
  const beacon = msg.originBeacon || {};
  const age = msg.createdAt ? timeSince(new Date(msg.createdAt)) : "";
  const isSOS = msg.type === "sos";
  const statusColor = MSG_STATUS_COLORS[msg.status] || "#64748b";

  return (
    <div className="mesh-msg-row" style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 20px",
      background: isSOS ? "rgba(239,68,68,0.06)" : "transparent",
      borderBottom: "1px solid rgba(255,255,255,0.03)",
      transition: "background 0.2s ease",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 8, bottom: 8, width: 3,
        borderRadius: "0 3px 3px 0",
        background: isSOS
          ? "linear-gradient(180deg, #ef4444, #dc2626)"
          : `linear-gradient(180deg, ${statusColor}, ${statusColor}88)`,
      }} />
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: isSOS ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
        border: `1px solid ${isSOS ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
        ...(isSOS && msg.status === "received" ? { animation: "sosPulseIcon 2s infinite" } : {}),
      }}>{TYPE_ICONS[msg.type] || "📡"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: isSOS ? "#fca5a5" : "#e2e8f0",
            letterSpacing: isSOS ? 0.5 : 0,
          }}>
            {isSOS ? "SOS EMERGENCY" : msg.type === "soil_tilt" ? "Soil Tilt Reading" : msg.type === "heartbeat" ? "Heartbeat Ping" : msg.type.toUpperCase()}
          </span>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 6,
            background: `${statusColor}15`, color: statusColor,
            fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
            border: `1px solid ${statusColor}20`,
          }}>{msg.status}</span>
        </div>
        <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ color: "#94a3b8", fontWeight: 500 }}>{beacon.name || msg.originEui}</span>
          {beacon.villageName && <><span style={{ color: "#334155" }}>·</span><span>{beacon.villageName}</span></>}
          <span style={{ color: "#334155" }}>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1v14M1 8h14" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="4" r="2" fill="#475569"/><circle cx="8" cy="12" r="2" fill="#475569"/></svg>
            {msg.hopCount} hop{msg.hopCount !== 1 ? "s" : ""}
          </span>
          <span style={{ color: "#334155" }}>·</span>
          <span>{age}</span>
        </div>
      </div>
      {msg.rssi != null && (
        <div style={{
          textAlign: "right", whiteSpace: "nowrap",
          padding: "4px 10px", borderRadius: 8,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: msg.rssi > -70 ? "#00ff88" : msg.rssi > -100 ? "#f59e0b" : "#ef4444", fontFamily: "monospace" }}>
            {msg.rssi} dBm
          </div>
          {msg.snr != null && <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>SNR {msg.snr}</div>}
        </div>
      )}
      {isSOS && msg.status === "received" && onAcknowledge && (
        <button
          onClick={() => onAcknowledge(msg._id)}
          className="mesh-ack-btn"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            border: "none", borderRadius: 10,
            color: "#fff", fontSize: 12, fontWeight: 700,
            padding: "8px 18px", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
            textTransform: "uppercase",
          }}
        >Acknowledge</button>
      )}
    </div>
  );
}

// ─── Beacon detail slide-in panel ──────────────────────────────────────────────
function BeaconDetailPanel({ beacon, onClose, onSimulateTilt, onRemoveBeacon }) {
  if (!beacon) return null;
  const bat = beacon.batteryLevel;
  const batColor = bat == null ? "#475569" : bat > 60 ? "#00ff88" : bat > 20 ? "#f59e0b" : "#ef4444";
  const amc = beacon.amcContract || {};

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0,
      width: 420, maxWidth: "94vw",
      background: "rgba(8, 15, 35, 0.98)",
      backdropFilter: "blur(32px) saturate(1.4)",
      WebkitBackdropFilter: "blur(32px) saturate(1.4)",
      borderLeft: "1px solid rgba(0,255,136,0.15)",
      zIndex: 1100, overflowY: "auto",
      animation: "slideInRight 0.3s cubic-bezier(.22,.61,.36,1)",
      boxShadow: "-10px 0 50px rgba(0,0,0,0.6)",
    }}>
      <button onClick={onClose} style={{
        position: "sticky", top: 16, float: "right", marginRight: 16,
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, color: "#94a3b8", fontSize: 16, cursor: "pointer",
        width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10,
      }}>✕</button>

      <div style={{
        height: 110,
        background: `linear-gradient(135deg, ${STATUS_COLORS[beacon.status]}18, transparent 70%)`,
        padding: "26px 28px 0",
      }}>
        <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>OFF-GRID NODE TELEMETRY</div>
        <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{beacon.name}</h2>
        <div style={{ color: "#64748b", fontSize: 12, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: STATUS_COLORS[beacon.status],
            boxShadow: `0 0 8px ${STATUS_COLORS[beacon.status]}80`,
          }} />
          {beacon.deviceEui}
        </div>
      </div>

      <div style={{ padding: "20px 28px 30px" }}>
        {/* Inclinometer Widget */}
        <div style={{ marginBottom: 20 }}>
          <InclinometerDial
            angle={beacon.status === "maintenance" ? 18.2 : 4.5}
            threshold={beacon.tiltThreshold || 14}
            pitch={3.2}
            roll={2.1}
          />
        </div>

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { l: "Status", v: STATUS_LABELS[beacon.status] || beacon.status, c: STATUS_COLORS[beacon.status] },
            { l: "Role", v: beacon.type?.toUpperCase(), c: beacon.type === "gateway" ? "#22d3ee" : "#cbd5e1" },
            { l: "Village", v: beacon.villageName || "—" },
            { l: "District", v: beacon.district || "—" },
            { l: "State", v: beacon.state || "—" },
            { l: "Power", v: beacon.powerSource === "solar" ? "☀️ Solar Cells" : beacon.powerSource === "hybrid" ? "⚡ Hybrid + Bat" : "🔋 LiFePO4" },
            { l: "Firmware", v: beacon.firmwareVersion || "2.1.4-mesh" },
            { l: "Radio Freq", v: "865.2 MHz (IN865)" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.025)", borderRadius: 12, padding: "11px 13px",
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{item.l}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: item.c || "#e2e8f0", marginTop: 3 }}>{item.v}</div>
            </div>
          ))}
        </div>

        {/* Battery & Solar Gauge */}
        <div style={{
          background: "rgba(255,255,255,0.025)", borderRadius: 16, padding: "16px 18px", marginBottom: 20,
          border: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>🔋 Battery State</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: batColor, fontFamily: "monospace" }}>
              {bat != null ? `${bat}%` : "92%"}
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, height: 8, overflow: "hidden" }}>
            <div style={{
              width: `${bat ?? 92}%`, height: "100%",
              background: `linear-gradient(90deg, ${batColor}cc, ${batColor})`,
              borderRadius: 8, boxShadow: `0 0 10px ${batColor}40`,
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "#64748b" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "#fbbf24" }}>☀️</span> Solar Yield: <strong style={{ color: "#fbbf24", fontFamily: "monospace" }}>{beacon.solarVoltage || 4.4}V</strong>
            </span>
            <span style={{ color: "#00ff88", fontWeight: 600 }}>Charging Peak</span>
          </div>
        </div>

        {/* Mesh Neighbors */}
        <div style={{
          background: "rgba(255,255,255,0.025)", borderRadius: 16, padding: "16px 18px", marginBottom: 20,
          border: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
            Connected Mesh Neighbors ({beacon.meshNeighbors?.length || 0})
          </div>
          {beacon.meshNeighbors?.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {beacon.meshNeighbors.map((n) => (
                <div key={n} style={{
                  padding: "5px 10px", borderRadius: 8, background: "rgba(34,211,238,0.08)",
                  border: "1px solid rgba(34,211,238,0.2)", color: "#22d3ee",
                  fontFamily: "monospace", fontSize: 11,
                }}>
                  🔗 {n}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#64748b" }}>Direct star connection to gateway.</div>
          )}
        </div>

        {/* AMC Contract Banner */}
        {amc.contractId && (
          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))",
            borderRadius: 16, border: "1px solid rgba(99,102,241,0.18)",
            padding: "16px 18px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, letterSpacing: 1.5 }}>STATE DISASTER AMC</span>
              <span style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                background: "rgba(167,139,250,0.15)", color: "#c4b5fd", textTransform: "uppercase",
              }}>{amc.tier || "Premium"}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{amc.authority || "State Authority"}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>Contract: {amc.contractId}</div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#cbd5e1" }}>
              <span>Value: <strong style={{ color: "#00ff88" }}>₹{amc.amountINR ? `${(amc.amountINR / 100000).toFixed(1)} Lakhs` : "42.0 Lakhs"}</strong></span>
              <span style={{ color: "#34d399" }}>● SLA 99.8% Active</span>
            </div>
          </div>
        )}

        {/* Action Buttons & Navigation Links */}
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <Link
            to={`/map?lat=${beacon.location?.coordinates?.[1] || 26.5}&lng=${beacon.location?.coordinates?.[0] || 85.5}&name=${encodeURIComponent(beacon.name)}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 16px", borderRadius: 10,
              background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
              color: "#ffffff", fontWeight: 700, fontSize: 13, textDecoration: "none",
              boxShadow: "0 4px 14px rgba(37,99,235,0.4)", textAlign: "center",
            }}
          >
            🗺️ View on Live Disaster Response Map ↗
          </Link>

          <button
            type="button"
            onClick={() => onSimulateTilt(beacon)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 16px", borderRadius: 10,
              background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)",
              color: "#22d3ee", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}
          >
            📡 Trigger Node Transmission Drill
          </button>

          <button
            type="button"
            onClick={() => {
              const text = `${beacon.name} (${beacon.deviceEui}) - GPS: [${beacon.location?.coordinates?.[1]}, ${beacon.location?.coordinates?.[0]}]`;
              navigator.clipboard?.writeText(text);
              alert(`Copied Node Telemetry to Clipboard:\n${text}`);
            }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "9px 16px", borderRadius: 10,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#cbd5e1", fontWeight: 600, fontSize: 12, cursor: "pointer",
            }}
          >
            📋 Copy Node GPS Coordinates
          </button>

          {onRemoveBeacon && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to remove node "${beacon.name}" (${beacon.deviceEui})?`)) {
                  onRemoveBeacon(beacon.deviceEui);
                }
              }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "9px 16px", borderRadius: 10,
                background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", fontWeight: 600, fontSize: 12, cursor: "pointer",
              }}
            >
              🗑️ Deregister & Remove Beacon
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function MeshConsole() {
  const [health, setHealth] = useState(null);
  const [beacons, setBeacons] = useState(() => loadPersistedBeacons([]));
  const [messages, setMessages] = useState([]);
  const [topology, setTopology] = useState({ nodes: [], links: [] });
  const [amcData, setAmcData] = useState(null);
  const [selectedBeacon, setSelectedBeacon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("map");
  const [msgFilter, setMsgFilter] = useState("all");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [bannerNotice, setBannerNotice] = useState(null);

  // ── Dynamic Map Basemap & Viewport State ──────────────────────────────────
  const [mapTileStyle, setMapTileStyle] = useState("satellite"); // "satellite" | "dark" | "topo" | "streets"
  const [mapCenter, setMapCenter] = useState([24.5, 82.5]);
  const [mapZoom, setMapZoom] = useState(5);
  const [mapBounds, setMapBounds] = useState(null);

  // ── Fetch all data from backend, gracefully merging with offline storage ──
  const fetchAll = useCallback(async () => {
    try {
      const [hRes, bRes, mRes, tRes, aRes] = await Promise.all([
        api("/api/mesh/health").catch(() => null),
        api("/api/mesh/beacons").catch(() => null),
        api("/api/mesh/messages?limit=100").catch(() => null),
        api("/api/mesh/topology").catch(() => null),
        api("/api/mesh/amc").catch(() => null),
      ]);
      if (hRes && hRes.success) setHealth(hRes.data);
      const serverBeacons = bRes && bRes.success && Array.isArray(bRes.data) ? bRes.data : [];
      setBeacons(loadPersistedBeacons(serverBeacons));
      if (mRes && mRes.success) setMessages(mRes.data);
      if (tRes && tRes.success) setTopology(tRes.data);
      if (aRes && aRes.success) setAmcData(aRes.data);
    } catch (err) {
      console.warn("[MeshConsole] Fetch error (offline fallback):", err);
      setBeacons(loadPersistedBeacons([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 25000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Beacon Registration Handlers ──────────────────────────────────────────
  const handleBeaconCreated = (newBeacon) => {
    setBeacons((prev) => {
      const exists = prev.some((b) => b.deviceEui === newBeacon.deviceEui);
      if (exists) {
        return prev.map((b) => (b.deviceEui === newBeacon.deviceEui ? newBeacon : b));
      }
      return [newBeacon, ...prev];
    });

    const lat = newBeacon.location?.coordinates?.[1];
    const lng = newBeacon.location?.coordinates?.[0];
    if (lat && lng) {
      setMapCenter([lat, lng]);
      setMapZoom(11);
      setMapBounds(null);
    }
    setSelectedBeacon(newBeacon);
    if (audioEnabled) playAudioTone("heartbeat");

    setBannerNotice({
      type: "info",
      title: "BEACON DEPLOYED & SAVED PERMANENTLY",
      desc: `Node "${newBeacon.name}" (${newBeacon.deviceEui}) is now online in the LoRa mesh!`,
    });
  };

  const handleRemoveBeacon = (deviceEui) => {
    try {
      const stored = JSON.parse(localStorage.getItem("disaster_mesh_custom_beacons") || "[]");
      const updated = stored.filter((b) => b.deviceEui !== deviceEui);
      localStorage.setItem("disaster_mesh_custom_beacons", JSON.stringify(updated));
      setBeacons((prev) => prev.filter((b) => b.deviceEui !== deviceEui));
      if (selectedBeacon?.deviceEui === deviceEui) setSelectedBeacon(null);
      setBannerNotice({
        type: "info",
        title: "NODE DEREGISTERED",
        desc: `Beacon ${deviceEui} was removed from mesh storage.`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ── Real-time socket events ────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    const onMeshSOS = (data) => {
      setMessages((prev) => [data.meshMessage, ...prev].slice(0, 200));
      if (audioEnabled) playAudioTone("sos");
      setBannerNotice({
        type: "sos",
        title: "CRITICAL SOS RECEIVED VIA LORA RELAY",
        desc: data.meshMessage?.payload?.message || "Trapped residents requesting emergency evac!",
      });
      fetchAll();
    };

    const onTiltAlert = (data) => {
      setMessages((prev) => [data.meshMessage, ...prev].slice(0, 200));
      if (audioEnabled) playAudioTone("tilt");
      setBannerNotice({
        type: "tilt",
        title: "HILL-SLOPE TILT ALARM BREACHED",
        desc: `Beacon ${data.beacon?.name}: Soil shift ${data.tiltAngle}° exceeds limit (${data.threshold}°)!`,
      });
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
  }, [fetchAll, audioEnabled]);

  // ── Seed demo action ───────────────────────────────────────────────────────
  const handleSeedNetwork = async (force = false) => {
    setSeeding(true);
    try {
      if (force) {
        localStorage.removeItem("disaster_mesh_custom_beacons");
      }
      try {
        await apiPost(`/api/mesh/seed${force ? "?force=true" : ""}`, {});
      } catch (e) {
        console.warn("Backend seed endpoint unavailable, loading verified built-ins:", e);
      }
      if (audioEnabled) playAudioTone("heartbeat");
      setBeacons(loadPersistedBeacons([]));
      setBannerNotice({
        type: "info",
        title: "MESH NETWORK SEEDED",
        desc: "9 verified solar LoRa beacons operational across Uttarakhand, Sikkim / NER, and Kerala.",
      });
      await fetchAll();
    } catch (err) {
      console.error("Seed error:", err);
    } finally {
      setSeeding(false);
    }
  };

  // ── Acknowledge SOS ────────────────────────────────────────────────────────
  const handleAcknowledge = async (messageId) => {
    try {
      const res = await apiPut(`/api/mesh/messages/${messageId}/acknowledge`, { status: "acknowledged" });
      if (res && res.success) {
        setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, status: "acknowledged" } : m)));
      }
    } catch (err) {
      console.error("[MeshConsole] Acknowledge error:", err);
    }
  };

  // ── Derived data & LoRa topology links ──────────────────────────────────────
  const filteredMessages = msgFilter === "all" ? messages : messages.filter((m) => m.type === msgFilter);
  const validBeacons = beacons.filter((b) => b.location?.coordinates?.[1] && b.location?.coordinates?.[0]);

  const topoLines = [];
  const euiToCoords = {};
  for (const node of topology.nodes || []) {
    if (node.location?.coordinates) euiToCoords[node.deviceEui] = [node.location.coordinates[1], node.location.coordinates[0]];
  }
  for (const link of topology.links || []) {
    const from = euiToCoords[link.source], to = euiToCoords[link.target];
    if (from && to) topoLines.push([from, to]);
  }

  // Fallback links between beacons in the same regional cluster
  if (topoLines.length === 0 && validBeacons.length > 1) {
    for (let i = 0; i < validBeacons.length; i++) {
      for (let j = i + 1; j < validBeacons.length; j++) {
        const b1 = validBeacons[i];
        const b2 = validBeacons[j];
        if (b1.state && b2.state && b1.state.toLowerCase() === b2.state.toLowerCase()) {
          topoLines.push([
            [b1.location.coordinates[1], b1.location.coordinates[0]],
            [b2.location.coordinates[1], b2.location.coordinates[0]],
          ]);
        }
      }
    }
  }

  // Auto-seed if 0 beacons
  useEffect(() => {
    if (!loading && beacons.length === 0) {
      handleSeedNetwork(false);
    }
  }, [loading, beacons.length]);

  const tabs = [
    { id: "map", label: "Beacon Map", icon: "🗺️" },
    { id: "topology", label: "Network Topology", icon: "🕸️" },
    { id: "tilt", label: "Soil-Tilt Watch", icon: "⛰️" },
    { id: "messages", label: "Message Feed", icon: "📨" },
    { id: "amc", label: "AMC & Revenue", icon: "💼" },
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 0%, #0a1628 0%, #020617 60%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            border: "3px solid rgba(0,255,136,0.1)",
            borderTopColor: "#00ff88", borderRightColor: "#22d3ee",
            animation: "spin 0.9s linear infinite",
            margin: "0 auto 20px",
            boxShadow: "0 0 30px rgba(0,255,136,0.15)",
          }} />
          <div style={{ color: "#00ff88", fontSize: 15, letterSpacing: 2, fontWeight: 600, animation: "pulse 1.5s infinite" }}>
            INITIALIZING LORA MESH TELEMETRY
          </div>
          <div style={{ color: "#475569", fontSize: 12, marginTop: 8 }}>Connecting to solar beacon grid...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 30% -20%, #0a1628 0%, #020617 50%, #020617 100%)",
      color: "#e2e8f0",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      paddingBottom: 60,
      position: "relative",
    }}>
      {/* ── Global Styles ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
        @keyframes sosPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 14px rgba(239,68,68,0); } }
        @keyframes sosPulseIcon { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); transform: scale(1); } 50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); transform: scale(1.05); } }
        @keyframes alertFlash { 0%,100% { opacity:1; } 50% { opacity:0.65; } }
        @keyframes fadeInUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        .mesh-stat-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.3) !important; border-color: rgba(255,255,255,0.1) !important; }
        .mesh-msg-row:hover { background: rgba(255,255,255,0.03) !important; }
        .mesh-tab:hover { background: rgba(255,255,255,0.06) !important; color: #cbd5e1 !important; }
        .mesh-btn-action:hover { transform: translateY(-1px); filter: brightness(1.1); }
      `}</style>

      {/* ── RF Spectrum Telemetry Ribbon ──────────────────────────────────── */}
      <div style={{
        background: "rgba(4, 11, 24, 0.9)", borderBottom: "1px solid rgba(0,255,136,0.12)",
        padding: "6px 36px", fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 10, color: "#64748b",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#00ff88", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", animation: "pulse 1.5s infinite" }} />
            LORA SPECTRUM: IN865 BAND (865.0 - 867.0 MHz)
          </span>
          <span>SF: <strong>SF7 - SF12 Auto-Adaptive</strong></span>
          <span>BW: <strong>125 kHz</strong></span>
          <span>TX Power: <strong>20 dBm (100mW)</strong></span>
          <span>Encryption: <strong style={{ color: "#38bdf8" }}>AES-128 Hardware Encrypted</strong></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{
              background: audioEnabled ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${audioEnabled ? "rgba(0,255,136,0.25)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 6, padding: "2px 8px", fontSize: 11, color: audioEnabled ? "#00ff88" : "#94a3b8",
              cursor: "pointer",
            }}
          >{audioEnabled ? "🔊 Acoustic Sonar: ON" : "🔇 Audio Muted"}</button>
          <span>Duty Cycle: <strong style={{ color: "#a78bfa" }}>0.1% Compliant</strong></span>
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        padding: "26px 36px 20px", position: "relative", zIndex: 1,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "linear-gradient(135deg, #00ff88, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, boxShadow: "0 8px 32px rgba(0,255,136,0.2)",
              position: "relative",
            }}>
              📡
              <div style={{
                position: "absolute", inset: -4, border: "1.5px solid rgba(0,255,136,0.2)",
                borderTopColor: "#00ff88", borderRadius: "50%", animation: "spin 4s linear infinite",
              }} />
            </div>
            <div>
              <h1 style={{
                fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.1,
                background: "linear-gradient(135deg, #00ff88 0%, #22d3ee 50%, #818cf8 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Off-Grid SOS Mesh</h1>
              <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", fontWeight: 500 }}>
                Village-Installed Solar LoRaWAN Beacons · Zero-Cellular Failover · State Disaster AMC Network
              </p>
            </div>
          </div>

          {/* Action Quickbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => handleSeedNetwork(true)}
              disabled={seeding}
              className="mesh-btn-action"
              style={{
                background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)",
                color: "#00ff88", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}
            >⚡ {seeding ? "Populating..." : "Seed Demo Mesh"}</button>

            <button
              onClick={() => setShowSimulateModal(true)}
              className="mesh-btn-action"
              style={{
                background: "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(14,165,233,0.18))",
                border: "1px solid rgba(34,211,238,0.3)", color: "#38bdf8",
                borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}
            >📡 Simulate Packet</button>

            <button
              onClick={() => setShowDeployModal(true)}
              className="mesh-btn-action"
              style={{
                background: "linear-gradient(135deg, #00ff88, #059669)",
                border: "none", color: "#020617",
                borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 800,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                boxShadow: "0 4px 20px rgba(0,255,136,0.25)",
              }}
            >+ Deploy Beacon</button>
          </div>
        </div>
      </div>

      {/* ── Banner Notification for Real-Time Packet Alert ────────────────── */}
      {bannerNotice && (
        <div style={{
          margin: "14px 36px 0",
          background: bannerNotice.type === "sos" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
          border: `1px solid ${bannerNotice.type === "sos" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
          borderRadius: 14, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
          animation: "fadeInUp 0.3s ease-out",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>{bannerNotice.type === "sos" ? "🆘" : "⛰️"}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: bannerNotice.type === "sos" ? "#fca5a5" : "#fcd34d" }}>
                {bannerNotice.title}
              </div>
              <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}>{bannerNotice.desc}</div>
            </div>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}
          >✕</button>
        </div>
      )}

      {/* ── Health Stats Cards ────────────────────────────────────────────── */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 12,
        padding: "20px 36px",
        position: "relative", zIndex: 1,
        animation: "fadeInUp 0.4s ease-out",
      }}>
        <StatCard label="Mesh Nodes" value={health?.totalBeacons ?? 0} icon="📡" accent="#00ff88"
          sub={`${health?.online ?? 0} online · ${health?.gateways ?? 0} gateways`} />
        <StatCard label="Network Uptime" value={`${health?.onlinePercent ?? 0}%`} icon="✅"
          accent={health?.onlinePercent >= 80 ? "#00ff88" : "#f59e0b"} sub="Solar Grid SLA 99.8%" />
        <StatCard label="Active SOS" value={health?.activeSOS ?? 0} icon="🆘"
          accent={health?.activeSOS > 0 ? "#ef4444" : "#00ff88"} alert={health?.activeSOS > 0}
          sub={health?.activeSOS > 0 ? "Immediate Action Required" : "Zero active emergencies"} />
        <StatCard label="Soil Tilt Alerts" value={health?.recentTiltAlerts ?? 0} icon="⛰️"
          accent={health?.recentTiltAlerts > 0 ? "#f59e0b" : "#00ff88"} sub="Landslide monitoring" />
        <StatCard label="Avg Battery" value={`${health?.avgBattery ?? 0}%`} icon="🔋"
          accent={health?.avgBattery >= 60 ? "#00ff88" : "#f59e0b"} sub="Solar recharged" />
        <StatCard label="State AMC Revenue" value="₹1.06 Cr" icon="💼" accent="#a78bfa"
          sub="SDRF & SDMA Contracts" />
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 8, padding: "0 36px", marginBottom: 20,
        position: "relative", zIndex: 1,
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={isActive ? "" : "mesh-tab"}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(0,255,136,0.12), rgba(34,211,238,0.06))"
                  : "rgba(255,255,255,0.02)",
                border: isActive ? "1px solid rgba(0,255,136,0.25)" : "1px solid rgba(255,255,255,0.05)",
                borderRadius: 12, padding: "10px 20px",
                color: isActive ? "#00ff88" : "#64748b",
                fontSize: 13, fontWeight: isActive ? 700 : 600,
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Contents ──────────────────────────────────────────────────── */}
      <div style={{ padding: "0 36px", position: "relative", zIndex: 1 }}>

        {/* ──── MAP TAB ──── */}
        {activeTab === "map" && (
          <div style={{
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20, overflow: "hidden",
            position: "relative",
            boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
          }}>
            {/* On-Map Mission Controls Bar */}
            <div style={{
              padding: "12px 18px",
              background: "rgba(10, 22, 40, 0.92)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12,
              backdropFilter: "blur(12px)",
            }}>
              {/* Regional Jumps */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginRight: 4 }}>
                  Jump Region:
                </span>
                {[
                  { label: "🌐 All India", center: [23.5, 82.5], zoom: 5 },
                  { label: "🏔️ North East (NER)", center: [27.35, 88.6], zoom: 8 },
                  { label: "⛰️ Uttarakhand", center: [30.45, 79.45], zoom: 9 },
                  { label: "🌴 Kerala (Wayanad)", center: [11.58, 76.12], zoom: 10 },
                ].map((reg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMapCenter(reg.center);
                      setMapZoom(reg.zoom);
                      setMapBounds(null);
                    }}
                    style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, padding: "5px 10px", fontSize: 11.5, fontWeight: 600,
                      color: "#cbd5e1", cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00ff88"; e.currentTarget.style.color = "#00ff88"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#cbd5e1"; }}
                  >
                    {reg.label}
                  </button>
                ))}

                {validBeacons.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const lats = validBeacons.map((b) => b.location.coordinates[1]);
                      const lngs = validBeacons.map((b) => b.location.coordinates[0]);
                      const minLat = Math.min(...lats);
                      const maxLat = Math.max(...lats);
                      const minLng = Math.min(...lngs);
                      const maxLng = Math.max(...lngs);
                      setMapBounds([[minLat, minLng], [maxLat, maxLng]]);
                    }}
                    style={{
                      background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)",
                      borderRadius: 8, padding: "5px 12px", fontSize: 11.5, fontWeight: 700,
                      color: "#00ff88", cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    🎯 Fit All ({validBeacons.length})
                  </button>
                )}
              </div>

              {/* Basemap Switcher */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginRight: 4 }}>
                  Basemap:
                </span>
                {Object.values(TILE_PROVIDERS).map((tp) => {
                  const isActive = mapTileStyle === tp.id;
                  return (
                    <button
                      key={tp.id}
                      type="button"
                      onClick={() => setMapTileStyle(tp.id)}
                      style={{
                        background: isActive ? "linear-gradient(135deg, rgba(0,255,136,0.2), rgba(34,211,238,0.1))" : "rgba(255,255,255,0.03)",
                        border: isActive ? "1px solid #00ff88" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8, padding: "5px 10px", fontSize: 11.5, fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#00ff88" : "#94a3b8", cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {tp.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Leaflet Map Canvas */}
            <div style={{ height: 560, position: "relative" }}>
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: "100%", width: "100%", background: "#0a1628" }}
                scrollWheelZoom={true}
              >
                <MapController center={mapCenter} zoom={mapZoom} bounds={mapBounds} />

                <TileLayer
                  key={mapTileStyle}
                  url={TILE_PROVIDERS[mapTileStyle]?.url || TILE_PROVIDERS.satellite.url}
                  attribution={TILE_PROVIDERS[mapTileStyle]?.attribution || ""}
                  maxZoom={TILE_PROVIDERS[mapTileStyle]?.maxZoom || 19}
                />

                {topoLines.map((line, i) => (
                  <Polyline key={`topo-${i}`} positions={line} pathOptions={{
                    color: "#00ff88", weight: 2, opacity: 0.45, dashArray: "6 6",
                  }} />
                ))}

                {beacons.map((b) => {
                  const lat = b.location?.coordinates?.[1];
                  const lng = b.location?.coordinates?.[0];
                  if (!lat && !lng) return null;
                  const isActiveSOS = messages.some(
                    (m) => m.type === "sos" && m.status === "received" &&
                      (m.originBeacon?._id === b._id || m.originEui === b.deviceEui)
                  );
                  const isGateway = b.type === "gateway";
                  const color = isActiveSOS ? "#ef4444" : isGateway ? "#22d3ee" : STATUS_COLORS[b.status] || "#00ff88";

                  return (
                    <React.Fragment key={b.deviceEui || b._id}>
                      {/* Halo pulse ring */}
                      <CircleMarker
                        center={[lat, lng]}
                        radius={isActiveSOS ? 22 : isGateway ? 16 : 12}
                        pathOptions={{
                          fillColor: color,
                          fillOpacity: isActiveSOS ? 0.35 : 0.15,
                          color: color,
                          weight: 1,
                          opacity: 0.6,
                        }}
                      />

                      {/* Core marker */}
                      <CircleMarker
                        center={[lat, lng]}
                        radius={isActiveSOS ? 12 : isGateway ? 9 : 7}
                        pathOptions={{
                          fillColor: color,
                          fillOpacity: 0.95,
                          color: "#ffffff",
                          weight: 2,
                        }}
                        eventHandlers={{ click: () => setSelectedBeacon(b) }}
                      >
                        <Popup>
                          <div style={{ fontFamily: "Inter, sans-serif", minWidth: 230, padding: 6, color: "#0f172a" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                              <strong style={{ fontSize: 13, color: "#0f172a" }}>{b.name}</strong>
                              <span style={{
                                fontSize: 10, padding: "2px 7px", borderRadius: 6,
                                background: color, color: "#020617", fontWeight: 800, textTransform: "uppercase"
                              }}>
                                {b.type}
                              </span>
                            </div>

                            <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>
                              EUI: {b.deviceEui}
                            </div>

                            <div style={{ fontSize: 12, marginBottom: 4 }}>
                              📍 <strong>{b.villageName || "Field Site"}</strong>, {b.district || ""}{b.state ? ` (${b.state})` : ""}
                            </div>

                            <div style={{ fontSize: 11, color: "#475569", marginBottom: 8, background: "#f1f5f9", padding: "4px 8px", borderRadius: 6 }}>
                              🌐 GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
                            </div>

                            <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between", marginBottom: 10, borderTop: "1px solid #e2e8f0", paddingTop: 6 }}>
                              <span>🔋 <strong>{b.batteryLevel ?? 92}%</strong></span>
                              <span>☀️ <strong>{b.solarVoltage ? `${b.solarVoltage}V` : "4.4V"}</strong></span>
                              <span>⛰️ <strong>{b.lastTiltAngle ?? 2.1}°</strong></span>
                            </div>

                            <div style={{ display: "grid", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => setSelectedBeacon(b)}
                                style={{
                                  width: "100%", padding: "7px 0", background: "#059669",
                                  color: "#fff", border: "none", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                                }}
                              >
                                📡 Inspect Node Telemetry →
                              </button>

                              <Link
                                to={`/map?lat=${lat}&lng=${lng}&name=${encodeURIComponent(b.name)}`}
                                style={{
                                  display: "block", width: "100%", padding: "6px 0", background: "#2563eb",
                                  color: "#fff", borderRadius: 6, fontSize: 11.5, fontWeight: 700, textAlign: "center", textDecoration: "none",
                                }}
                              >
                                🗺️ View on Live Disaster Response Map ↗
                              </Link>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    </React.Fragment>
                  );
                })}
              </MapContainer>

              {/* Map Telemetry Floater */}
              <div style={{
                position: "absolute", bottom: 16, right: 16, zIndex: 500,
                background: "rgba(2,6,23,0.88)", backdropFilter: "blur(12px)",
                borderRadius: 12, padding: "10px 16px",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
              }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Nodes: <strong style={{ color: "#00ff88" }}>{beacons.length}</strong>
                </span>
                <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  LoRa Relays: <strong style={{ color: "#22d3ee" }}>{topoLines.length}</strong>
                </span>
                <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Gateways: <strong style={{ color: "#f59e0b" }}>{beacons.filter((b) => b.type === "gateway").length}</strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ──── TOPOLOGY TAB ──── */}
        {activeTab === "topology" && (
          <div style={{ display: "grid", gap: 20 }}>
            {/* Interactive SVG Node-Link Canvas */}
            <TopologySvgGraph
              nodes={topology.nodes}
              links={topology.links}
              selectedEui={selectedBeacon?.deviceEui}
              onSelectNode={(node) => {
                const fb = beacons.find((b) => b.deviceEui === node.deviceEui);
                if (fb) setSelectedBeacon(fb);
              }}
            />

            {/* Matrix Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: 12,
            }}>
              {topology.nodes.map((node) => (
                <div
                  key={node.deviceEui}
                  onClick={() => {
                    const fb = beacons.find((b) => b.deviceEui === node.deviceEui);
                    if (fb) setSelectedBeacon(fb);
                  }}
                  style={{
                    background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14, padding: 16, cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[node.status] }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{node.name}</span>
                    </div>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 4,
                      background: node.type === "gateway" ? "rgba(34,211,238,0.15)" : "rgba(0,255,136,0.12)",
                      color: node.type === "gateway" ? "#22d3ee" : "#00ff88", fontWeight: 700,
                    }}>{node.type?.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginBottom: 6 }}>{node.deviceEui}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                    <span>🔋 {node.batteryLevel ?? "N/A"}%</span>
                    <span>🔗 {node.meshNeighbors?.length || 0} neighbor hops</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──── SOIL-TILT TAB ──── */}
        {activeTab === "tilt" && (
          <div style={{
            display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20,
          }}>
            <div style={{
              background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>
                    ⛰️ Landslide Early Warning & Hill-Slope Tilt Grid
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                    Real-time triaxial inclinometer telemetry from Himalayan & Western Ghats hazard ridges
                  </p>
                </div>
                <button
                  onClick={() => setShowSimulateModal(true)}
                  style={{
                    background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
                    color: "#fbbf24", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700,
                    cursor: "pointer",
                  }}
                >Trigger Tilt Alert Spike</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InclinometerDial
                  angle={16.4}
                  threshold={12}
                  pitch={12.1}
                  roll={11.2}
                  size={190}
                />
                <InclinometerDial
                  angle={4.8}
                  threshold={14}
                  pitch={3.2}
                  roll={3.6}
                  size={190}
                />
              </div>

              <div style={{
                marginTop: 20, padding: "14px 18px", borderRadius: 12,
                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>
                  ⚠️ Automated Soil Creep Detection Algorithm
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.5 }}>
                  Solar LoRa nodes take dual-axis accelerometer readings every 3 minutes. If angular shift rate exceeds <strong>0.5° / hour</strong> or overall slope breaches the calibrated <strong>12° safety threshold</strong>, emergency packets are broadcast immediately over the mesh to notify SDRF authorities.
                </div>
              </div>
            </div>

            {/* Hill Station Risk Board */}
            <div style={{
              background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: 24, display: "grid", gap: 12, alignContent: "start",
            }}>
              <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
                High-Risk Slope Monitoring Outposts
              </h4>

              {[
                { name: "Joshimath Ward 4 Cliff-02", state: "Uttarakhand", angle: "16.4°", limit: "10°", risk: "CRITICAL", color: "#ef4444" },
                { name: "Upper Chamoli Ridge-01", state: "Uttarakhand", angle: "8.2°", limit: "12°", risk: "STABLE", color: "#00ff88" },
                { name: "Wayanad Chooramala Slopes", state: "Kerala", angle: "11.1°", limit: "14°", risk: "WATCH", color: "#f59e0b" },
                { name: "Pipalkoti Gorge Outpost", state: "Uttarakhand", angle: "4.5°", limit: "15°", risk: "STABLE", color: "#00ff88" },
              ].map((site) => (
                <div key={site.name} style={{
                  padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${site.color}25`, display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{site.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{site.state} · Safety Cap: {site.limit}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: site.color, fontFamily: "monospace" }}>{site.angle}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: site.color }}>{site.risk}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──── MESSAGES TAB ──── */}
        {activeTab === "messages" && (
          <div style={{
            background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", gap: 6, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",
              flexWrap: "wrap", alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginRight: 6 }}>FILTER:</span>
              {[
                { key: "all", label: "All", icon: "" },
                { key: "sos", label: "SOS", icon: "🆘" },
                { key: "soil_tilt", label: "Tilt", icon: "⛰️" },
                { key: "heartbeat", label: "Heartbeat", icon: "💚" },
              ].map((f) => (
                <button
                  key={f.key} onClick={() => setMsgFilter(f.key)}
                  style={{
                    background: msgFilter === f.key ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.03)",
                    border: msgFilter === f.key ? "1px solid rgba(0,255,136,0.25)" : "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 8, padding: "6px 14px", color: msgFilter === f.key ? "#00ff88" : "#94a3b8",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >{f.icon} {f.label}</button>
              ))}
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setShowSimulateModal(true)}
                style={{
                  background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)",
                  borderRadius: 8, padding: "5px 12px", color: "#38bdf8", fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}
              >+ Simulate Ingest</button>
            </div>

            <div style={{ maxHeight: 540, overflowY: "auto" }}>
              {filteredMessages.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center" }}>
                  <div style={{ fontSize: 44, marginBottom: 12, opacity: 0.6 }}>📭</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#94a3b8" }}>No Messages Received</div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Simulate or transmit a LoRa packet to view here</div>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <MessageRow key={msg._id} msg={msg} onAcknowledge={handleAcknowledge} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ──── AMC & REVENUE TAB ──── */}
        {activeTab === "amc" && (
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{
              background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(167,139,250,0.2)",
              borderRadius: 20, padding: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#f8fafc" }}>
                    💼 State Disaster Authority AMC Contracts & Revenue Model
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
                    Hardware sales + Annual Maintenance Contracts (AMC) with State Disaster Management Authorities (SDMA)
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#00ff88", fontFamily: "monospace" }}>₹1.06 Cr</div>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: 0.5 }}>ANNUAL RECURRING REVENUE (ARR)</div>
                  </div>
                </div>
              </div>

              {/* State Authority Contracts Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                {[
                  {
                    authority: "SDRF Uttarakhand",
                    title: "Himalayan Landslide & Flash Flood Mesh",
                    nodes: "4 Solar Nodes deployed",
                    amount: "₹42,00,000 / yr",
                    contractId: "AMC-UK-2026-042",
                    tier: "Premium (4hr MTTR)",
                    expiry: "31 Mar 2027",
                    status: "Active",
                  },
                  {
                    authority: "SDMA Assam",
                    title: "Brahmaputra Flood Island Cut-off Grid",
                    nodes: "3 Solar Nodes deployed",
                    amount: "₹28,00,000 / yr",
                    contractId: "AMC-AS-2026-018",
                    tier: "Standard (8hr MTTR)",
                    expiry: "31 Dec 2026",
                    status: "Active",
                  },
                  {
                    authority: "KSDMA Kerala",
                    title: "Western Ghats Debris Flow Rapid Network",
                    nodes: "2 Solar Nodes deployed",
                    amount: "₹36,00,000 / yr",
                    contractId: "AMC-KL-2026-009",
                    tier: "Premium (4hr MTTR)",
                    expiry: "30 Jun 2027",
                    status: "Active",
                  },
                ].map((c) => (
                  <div key={c.contractId} style={{
                    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(167,139,250,0.15)",
                    borderRadius: 16, padding: 20, position: "relative",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>{c.tier}</span>
                      <span style={{
                        padding: "2px 8px", borderRadius: 4, background: "rgba(0,255,136,0.12)",
                        color: "#00ff88", fontSize: 10, fontWeight: 800,
                      }}>{c.status}</span>
                    </div>
                    <h4 style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 800, color: "#f8fafc" }}>{c.authority}</h4>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>{c.title}</div>

                    <div style={{ display: "grid", gap: 6, fontSize: 12, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Contract Value:</span>
                        <strong style={{ color: "#00ff88", fontFamily: "monospace" }}>{c.amount}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Contract ID:</span>
                        <span style={{ color: "#cbd5e1", fontFamily: "monospace" }}>{c.contractId}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Installed Nodes:</span>
                        <span style={{ color: "#cbd5e1" }}>{c.nodes}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Warranty Renewal:</span>
                        <span style={{ color: "#a78bfa" }}>{c.expiry}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Level Agreement Guarantee */}
              <div style={{
                marginTop: 20, padding: "16px 20px", borderRadius: 14,
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#c7d2fe" }}>
                    🛡️ 99.5% Guaranteed Mesh Uptime SLA with 24/7 Field Replacement
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    Includes scheduled solar capacitor replacement, drone-based aerial firmware reflashing, and triaxial inclinometer recalibration.
                  </div>
                </div>
                <button style={{
                  padding: "8px 16px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)",
                  borderRadius: 8, color: "#c7d2fe", fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>Download State Authority SLA Audit →</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals & Drawers ──────────────────────────────────────────────── */}
      {showDeployModal && (
        <DeployBeaconModal
          onClose={() => setShowDeployModal(false)}
          onSuccess={handleBeaconCreated}
        />
      )}

      {showSimulateModal && (
        <SimulateModal
          onClose={() => setShowSimulateModal(false)}
          onTriggered={() => { fetchAll(); }}
        />
      )}

      {selectedBeacon && (
        <>
          <div
            onClick={() => setSelectedBeacon(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1050 }}
          />
          <BeaconDetailPanel
            beacon={selectedBeacon}
            onClose={() => setSelectedBeacon(null)}
            onSimulateTilt={() => setShowSimulateModal(true)}
            onRemoveBeacon={handleRemoveBeacon}
          />
        </>
      )}
    </div>
  );
}
