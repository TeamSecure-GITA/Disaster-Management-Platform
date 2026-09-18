import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AlertTriangle,
  Users,
  Truck,
  Home,
  CloudRain,
  Compass,
  FileText,
  Bot,
  Zap,
  CheckCircle2,
  ExternalLink,
  Info,
  Layers,
  MapPin,
  Clock,
  Shield,
  PhoneCall,
  Activity,
  ChevronRight,
  X,
  Droplets,
  Thermometer,
  Wind,
  Radio,
  Eye,
  ArrowRight,
  Maximize2
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  // ─── LIVE CLOCK & TIMESTAMPS ───────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── MAP LAYERS TOGGLE STATE ──────────────────────────────────────────────
  const [mapLayers, setMapLayers] = useState({
    disasterRisk: true,
    affectedPopulation: true,
    rescueUnits: true,
    shelters: true,
    roads: true,
    iotSensors: false,
    satellite: true,
    weather: false,
  });
  const [layersOpen, setLayersOpen] = useState(true);

  // ─── MODALS & OVERLAYS ───────────────────────────────────────────────────
  const [whyCriticalOpen, setWhyCriticalOpen] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(1);

  // ─── SOS 3-SECOND HOLD INTERACTION ────────────────────────────────────────
  const [sosProgress, setSosProgress] = useState(0);
  const [isHoldingSos, setIsHoldingSos] = useState(false);
  const holdTimerRef = useRef(null);

  const startSosHold = () => {
    setIsHoldingSos(true);
    let current = 0;
    holdTimerRef.current = setInterval(() => {
      current += 4;
      if (current >= 100) {
        clearInterval(holdTimerRef.current);
        setIsHoldingSos(false);
        setSosProgress(0);
        setSosModalOpen(true);
      } else {
        setSosProgress(current);
      }
    }, 100);
  };

  const cancelSosHold = () => {
    setIsHoldingSos(false);
    setSosProgress(0);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", minHeight: "100%" }}>

      {/* ── 1. TOP METRIC CARDS (5 KPI CARDS) ─────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
        }}
      >
        {/* Card 1: Active Incidents */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "14px",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.22)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f87171",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "600", textTransform: "capitalize" }}>
              Active Incidents
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.2" }}>
              3
            </div>
            <div style={{ fontSize: "0.68rem", marginTop: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#ef4444", fontWeight: "800" }}>1 Critical</span>
              <span style={{ color: "#64748b" }}>·</span>
              <span style={{ color: "#f59e0b", fontWeight: "800" }}>2 High</span>
            </div>
          </div>
        </div>

        {/* Card 2: People Affected */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "14px",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              border: "1px solid rgba(245, 158, 11, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fbbf24",
              flexShrink: 0,
            }}
          >
            <Users size={22} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "600" }}>
              People Affected
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.2" }}>
              1,240
            </div>
            <div style={{ fontSize: "0.68rem", color: "#cbd5e1", marginTop: "3px" }}>
              <span style={{ color: "#fde047", fontWeight: "700" }}>387</span> Exposed
            </div>
          </div>
        </div>

        {/* Card 3: Response Units */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "14px",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            background: "linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "rgba(56, 189, 248, 0.2)",
              border: "1px solid rgba(56, 189, 248, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38bdf8",
              flexShrink: 0,
            }}
          >
            <Truck size={22} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "600" }}>
              Response Units
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.2" }}>
              14
            </div>
            <div style={{ fontSize: "0.68rem", marginTop: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#60a5fa", fontWeight: "800" }}>3 En Route</span>
              <span style={{ color: "#64748b" }}>·</span>
              <span style={{ color: "#38bdf8", fontWeight: "800" }}>11 On Site</span>
            </div>
          </div>
        </div>

        {/* Card 4: Shelter Capacity */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "14px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#34d399",
              flexShrink: 0,
            }}
          >
            <Home size={22} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "600" }}>
              Shelter Capacity
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.2" }}>
              72%
            </div>
            <div style={{ fontSize: "0.68rem", color: "#cbd5e1", marginTop: "3px" }}>
              <span style={{ color: "#34d399", fontWeight: "700" }}>1,182</span> / 1,650 Occupied
            </div>
          </div>
        </div>

        {/* Card 5: Weather */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "14px",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "rgba(168, 85, 247, 0.2)",
              border: "1px solid rgba(168, 85, 247, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c084fc",
              flexShrink: 0,
            }}
          >
            <CloudRain size={22} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "600" }}>
              Weather
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.2" }}>
              27°C
            </div>
            <div style={{ fontSize: "0.68rem", color: "#cbd5e1", marginTop: "3px" }}>
              Heavy Rain (42 mm)
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MAIN MIDDLE SECTION (MAP 2/3 + ACTIVE INCIDENTS & TIMELINE 1/3) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
          gap: "16px",
        }}
      >
        {/* ────────────── LEFT: LIVE DISASTER MAP ────────────── */}
        <div
          style={{
            backgroundColor: "#070e1c",
            borderRadius: "16px",
            border: "1px solid rgba(56, 189, 248, 0.22)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Map Header */}
          <div
            style={{
              padding: "12px 18px",
              borderBottom: "1px solid rgba(56, 189, 248, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(10, 18, 36, 0.7)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.96rem", fontWeight: "800", color: "#f8fafc" }}>
                Live Disaster Map
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  color: "#f87171",
                  border: "1px solid rgba(239, 68, 68, 0.45)",
                  borderRadius: "999px",
                  fontSize: "0.62rem",
                  fontWeight: "900",
                  padding: "2px 8px",
                  letterSpacing: "0.05em",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#ef4444",
                    boxShadow: "0 0 8px #ef4444",
                  }}
                />
                LIVE
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "var(--font-mono, monospace)" }}>
              Last updated: {currentTime}
            </div>
          </div>

          {/* Map Viewport Canvas with Topo Imagery & SVG Interactive Overlays */}
          <div
            style={{
              position: "relative",
              height: "440px",
              width: "100%",
              overflow: "hidden",
              backgroundColor: "#0a1917",
              backgroundImage: `
                radial-gradient(ellipse at 48% 42%, rgba(225, 29, 72, 0.28) 0%, transparent 45%),
                radial-gradient(ellipse at 60% 65%, rgba(245, 158, 11, 0.22) 0%, transparent 40%),
                radial-gradient(circle at 35% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 35%),
                linear-gradient(135deg, #0d2818 0%, #041f1e 40%, #081a24 100%)
              `,
            }}
          >
            {/* Topographic Elevation Contours Simulation */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                opacity: 0.65,
              }}
              viewBox="0 0 800 440"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id="contourGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1" />
                </pattern>
                {/* Glowing hazard pulse filter */}
                <filter id="hazardGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="800" height="440" fill="url(#contourGrid)" />

              {/* Mountain ridge elevation lines */}
              <path d="M 50,180 Q 200,60 400,120 T 750,90" fill="none" stroke="rgba(34, 197, 94, 0.18)" strokeWidth="1.5" />
              <path d="M 30,220 Q 250,110 450,170 T 780,160" fill="none" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="1.5" />
              <path d="M 80,310 Q 320,240 520,290 T 790,260" fill="none" stroke="rgba(34, 197, 94, 0.16)" strokeWidth="1.5" />

              {/* ── 1. LAYER: DISASTER RISK ZONES ── */}
              {mapLayers.disasterRisk && (
                <>
                  {/* Medium Risk Amber Area */}
                  <polygon
                    points="260,180 380,140 470,190 410,260 280,240"
                    fill="rgba(245, 158, 11, 0.22)"
                    stroke="#f59e0b"
                    strokeWidth="1.8"
                    strokeDasharray="4,4"
                  />

                  {/* Critical Risk Red Hazard Zone */}
                  <polygon
                    points="320,110 440,90 480,160 370,185 300,150"
                    fill="rgba(239, 68, 68, 0.38)"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    filter="url(#hazardGlow)"
                  />
                </>
              )}

              {/* ── 2. LAYER: ROADS & EVACUATION ROUTE ── */}
              {mapLayers.roads && (
                <>
                  {/* Background road network */}
                  <path
                    d="M 120,380 Q 260,340 380,270 T 560,190 T 720,130"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Evacuation Route NH-10 (glowing dashed line) */}
                  <path
                    d="M 120,380 Q 260,340 380,270 T 560,190 T 720,130"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeDasharray="8,6"
                    strokeLinecap="round"
                  />
                  {/* Secondary route */}
                  <path
                    d="M 280,140 Q 350,220 440,310 T 620,360"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray="6,4"
                  />
                </>
              )}
            </svg>

            {/* ── INTERACTIVE PINS & LABELS OVER MAP ── */}
            {/* 1. Critical Landslide Alert Marker */}
            {mapLayers.disasterRisk && (
              <div
                style={{
                  position: "absolute",
                  top: "24%",
                  left: "44%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(225, 29, 72, 0.95)",
                    color: "#ffffff",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 0 20px rgba(225, 29, 72, 0.8)",
                    border: "1.5px solid #fecdd3",
                  }}
                >
                  <AlertTriangle size={15} color="#ffffff" />
                  <span>Landslide Risk Zone NH-10</span>
                </div>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#ef4444",
                    transform: "rotate(45deg) translateY(-5px)",
                  }}
                />
              </div>
            )}

            {/* 2. Villages & Population Pins */}
            {mapLayers.affectedPopulation && (
              <>
                {/* Towang Village */}
                <div
                  style={{
                    position: "absolute",
                    top: "33%",
                    left: "30%",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "rgba(15, 23, 42, 0.88)",
                    border: "1px solid rgba(245, 158, 11, 0.5)",
                    borderRadius: "20px",
                    padding: "3px 9px",
                    fontSize: "0.66rem",
                    color: "#f8fafc",
                    fontWeight: "700",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  <span style={{ color: "#f59e0b" }}>🏘️</span>
                  <span>Towang village <strong style={{ color: "#fbbf24" }}>98 people</strong></span>
                </div>

                {/* Khero Village */}
                <div
                  style={{
                    position: "absolute",
                    top: "56%",
                    left: "42%",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "rgba(15, 23, 42, 0.88)",
                    border: "1px solid rgba(245, 158, 11, 0.5)",
                    borderRadius: "20px",
                    padding: "3px 9px",
                    fontSize: "0.66rem",
                    color: "#f8fafc",
                    fontWeight: "700",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  <span style={{ color: "#f59e0b" }}>🏘️</span>
                  <span>Khero village <strong style={{ color: "#fbbf24" }}>212 people</strong></span>
                </div>

                {/* Ranipur Village */}
                <div
                  style={{
                    position: "absolute",
                    top: "68%",
                    left: "55%",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "rgba(15, 23, 42, 0.88)",
                    border: "1px solid rgba(34, 197, 94, 0.5)",
                    borderRadius: "20px",
                    padding: "3px 9px",
                    fontSize: "0.66rem",
                    color: "#f8fafc",
                    fontWeight: "700",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  <span style={{ color: "#22c55e" }}>🏘️</span>
                  <span>Ranipur village <strong style={{ color: "#4ade80" }}>161 people</strong></span>
                </div>
              </>
            )}

            {/* 3. Rescue Units (Blue vehicles) */}
            {mapLayers.rescueUnits && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: "28%",
                    left: "24%",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#0284c7",
                    border: "2px solid #ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 14px rgba(2, 132, 199, 0.8)",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                  title="Rescue Unit 07 (En Route)"
                >
                  <Truck size={14} />
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "43%",
                    left: "58%",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#0284c7",
                    border: "2px solid #ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 14px rgba(2, 132, 199, 0.8)",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                  title="Rescue Unit 12 (On Site)"
                >
                  <Truck size={14} />
                </div>
              </>
            )}

            {/* 4. Safe Shelters (Green pins) */}
            {mapLayers.shelters && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: "38%",
                    left: "45%",
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    backgroundColor: "#16a34a",
                    border: "2px solid #ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    boxShadow: "0 0 12px rgba(22, 163, 74, 0.8)",
                  }}
                  title="Safe Shelter Alpha (Capacity: 450)"
                >
                  <Home size={13} />
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "58%",
                    left: "33%",
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    backgroundColor: "#16a34a",
                    border: "2px solid #ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    boxShadow: "0 0 12px rgba(22, 163, 74, 0.8)",
                  }}
                  title="Safe Shelter Beta"
                >
                  <Home size={13} />
                </div>
              </>
            )}

            {/* 5. Blocked Road Indicator */}
            {mapLayers.roads && (
              <div
                style={{
                  position: "absolute",
                  top: "48%",
                  left: "58%",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "#dc2626",
                  border: "2px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: "900",
                  boxShadow: "0 0 10px rgba(220, 38, 38, 0.8)",
                }}
                title="Road Blocked (Debris on NH-10)"
              >
                ⛔
              </div>
            )}

            {/* ── FLOATING OVERLAY: MAP LAYERS PANEL (TOP LEFT) ── */}
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                width: "154px",
                backgroundColor: "rgba(10, 16, 32, 0.92)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: "10px",
                padding: "10px 12px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.5)",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  color: "#e2e8f0",
                  marginBottom: "8px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingBottom: "5px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers size={13} color="#38bdf8" />
                  <span>Map Layers</span>
                </div>
                <button
                  onClick={() => setLayersOpen(!layersOpen)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.7rem" }}
                >
                  {layersOpen ? "▴" : "▾"}
                </button>
              </div>

              {layersOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "0.68rem" }}>
                  {[
                    { key: "disasterRisk", label: "Disaster Risk" },
                    { key: "affectedPopulation", label: "Affected Population" },
                    { key: "rescueUnits", label: "Rescue Units" },
                    { key: "shelters", label: "Shelters" },
                    { key: "roads", label: "Roads" },
                    { key: "iotSensors", label: "IoT Sensors" },
                    { key: "satellite", label: "Satellite" },
                    { key: "weather", label: "Weather" },
                  ].map((layer) => (
                    <label
                      key={layer.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: mapLayers[layer.key] ? "#ffffff" : "#94a3b8",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={mapLayers[layer.key]}
                        onChange={() => setMapLayers({ ...mapLayers, [layer.key]: !mapLayers[layer.key] })}
                        style={{ accentColor: "#0284c7", cursor: "pointer" }}
                      />
                      <span>{layer.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* ── FLOATING OVERLAY: INSET MINIMAP (BOTTOM LEFT) ── */}
            <div
              style={{
                position: "absolute",
                bottom: "14px",
                left: "14px",
                width: "90px",
                height: "65px",
                backgroundColor: "rgba(8, 14, 28, 0.92)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "8px",
                padding: "4px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 100 70" width="100%" height="100%">
                <path
                  d="M 15,20 L 45,10 L 80,18 L 88,48 L 65,62 L 25,58 Z"
                  fill="rgba(56, 189, 248, 0.12)"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                />
                {/* Red Target bounding box */}
                <rect
                  x="42"
                  y="26"
                  width="18"
                  height="14"
                  fill="rgba(239, 68, 68, 0.35)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* ── FLOATING OVERLAY: LEGEND (BOTTOM RIGHT) ── */}
            <div
              style={{
                position: "absolute",
                bottom: "14px",
                right: "14px",
                backgroundColor: "rgba(10, 16, 32, 0.92)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "0.64rem",
                color: "#cbd5e1",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                zIndex: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span>Critical Risk</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f97316" }} />
                <span>High Risk</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                <span>Medium Risk</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                <span>Safe Zone</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#38bdf8" }}>🚑</span>
                <span>Rescue Unit</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#22c55e" }}>🏠</span>
                <span>Shelter</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "12px", height: "2px", backgroundColor: "#38bdf8" }} />
                <span>Evacuation Route</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#ef4444" }}>⛔</span>
                <span>Blocked Road</span>
              </div>
            </div>

            {/* Zoom Controls (Top Right) */}
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                zIndex: 20,
              }}
            >
              <button
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                +
              </button>
              <button
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                -
              </button>
            </div>
          </div>
        </div>

        {/* ────────────── RIGHT: ACTIVE INCIDENTS & TIMELINE ────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Active Incidents Container */}
          <div
            style={{
              backgroundColor: "#0b1222",
              borderRadius: "16px",
              border: "1px solid rgba(56, 189, 248, 0.18)",
              padding: "16px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "#ffffff" }}>
                Active Incidents
              </span>
              <Link
                to="/alerts"
                style={{
                  fontSize: "0.72rem",
                  color: "#38bdf8",
                  textDecoration: "none",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                View All <ExternalLink size={12} />
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Incident 1: Landslide NH-10 */}
              <div
                onClick={() => setSelectedIncident(1)}
                style={{
                  backgroundColor: "rgba(225, 29, 72, 0.08)",
                  border: `1.5px solid ${selectedIncident === 1 ? "#ef4444" : "rgba(239, 68, 68, 0.4)"}`,
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer",
                  boxShadow: selectedIncident === 1 ? "0 0 16px rgba(225, 29, 72, 0.25)" : "none",
                  transition: "all 0.18s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        fontSize: "0.68rem",
                        fontWeight: "900",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      1
                    </span>
                    <span style={{ fontSize: "0.86rem", fontWeight: "800", color: "#ffffff" }}>
                      Landslide — NH-10
                    </span>
                    <span
                      style={{
                        backgroundColor: "#e11d48",
                        color: "#ffffff",
                        fontSize: "0.58rem",
                        fontWeight: "900",
                        padding: "1px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      CRITICAL
                    </span>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>

                <div style={{ fontSize: "0.7rem", color: "#cbd5e1", marginTop: "4px" }}>
                  📍 Bargarh, Odisha
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    fontSize: "0.68rem",
                    color: "#94a3b8",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span>👥 387 exposed</span>
                    <span>🏘️ 4 villages</span>
                    <span>🛣️ 2 roads</span>
                  </div>
                  <div style={{ color: "#f87171", fontWeight: "800" }}>
                    ⏱️ ETA 08 min
                  </div>
                </div>
              </div>

              {/* Incident 2: Flood Sector 4 */}
              <div
                onClick={() => setSelectedIncident(2)}
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  border: `1.5px solid ${selectedIncident === 2 ? "#f59e0b" : "rgba(245, 158, 11, 0.35)"}`,
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer",
                  boxShadow: selectedIncident === 2 ? "0 0 16px rgba(245, 158, 11, 0.25)" : "none",
                  transition: "all 0.18s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#f59e0b",
                        color: "#0f172a",
                        fontSize: "0.68rem",
                        fontWeight: "900",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      2
                    </span>
                    <span style={{ fontSize: "0.86rem", fontWeight: "800", color: "#ffffff" }}>
                      Flood — Sector 4
                    </span>
                    <span
                      style={{
                        backgroundColor: "#f59e0b",
                        color: "#0f172a",
                        fontSize: "0.58rem",
                        fontWeight: "900",
                        padding: "1px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      HIGH
                    </span>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>

                <div style={{ fontSize: "0.7rem", color: "#cbd5e1", marginTop: "4px" }}>
                  📍 Jagatsinghpur, Odisha
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    fontSize: "0.68rem",
                    color: "#94a3b8",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span>👥 240 affected</span>
                    <span>🏠 2 shelters</span>
                    <span>🛣️ 1 road</span>
                  </div>
                  <div style={{ color: "#f59e0b", fontWeight: "800" }}>
                    ⏱️ ETA 20 min
                  </div>
                </div>
              </div>

              {/* Incident 3: Road Blockage Zone B */}
              <div
                onClick={() => setSelectedIncident(3)}
                style={{
                  backgroundColor: "rgba(234, 179, 8, 0.08)",
                  border: `1.5px solid ${selectedIncident === 3 ? "#eab308" : "rgba(234, 179, 8, 0.3)"}`,
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer",
                  boxShadow: selectedIncident === 3 ? "0 0 16px rgba(234, 179, 8, 0.25)" : "none",
                  transition: "all 0.18s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#eab308",
                        color: "#0f172a",
                        fontSize: "0.68rem",
                        fontWeight: "900",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      3
                    </span>
                    <span style={{ fontSize: "0.86rem", fontWeight: "800", color: "#ffffff" }}>
                      Road Blockage — Zone B
                    </span>
                    <span
                      style={{
                        backgroundColor: "#eab308",
                        color: "#0f172a",
                        fontSize: "0.58rem",
                        fontWeight: "900",
                        padding: "1px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      MEDIUM
                    </span>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>

                <div style={{ fontSize: "0.7rem", color: "#cbd5e1", marginTop: "4px" }}>
                  📍 Rayagada, Odisha
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    fontSize: "0.68rem",
                    color: "#94a3b8",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span>👥 56 affected</span>
                    <span>🏠 0 shelters</span>
                    <span>🛣️ 1 road</span>
                  </div>
                  <div style={{ color: "#eab308", fontWeight: "800" }}>
                    ⏱️ ETA 45 min
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Timeline */}
          <div
            style={{
              backgroundColor: "#0b1222",
              borderRadius: "16px",
              border: "1px solid rgba(56, 189, 248, 0.18)",
              padding: "16px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "#ffffff" }}>
                  Incident Timeline
                </div>
                <div style={{ fontSize: "0.68rem", color: "#38bdf8", fontWeight: "700" }}>
                  Landslide — NH-10
                </div>
              </div>
              <Link
                to="/alerts"
                style={{
                  fontSize: "0.7rem",
                  color: "#38bdf8",
                  textDecoration: "none",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                View details <ExternalLink size={11} />
              </Link>
            </div>

            {/* Vertical timeline items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
              {[
                { time: "21:12", text: "Sensor anomaly detected", color: "#f97316" },
                { time: "21:15", text: "Rainfall threshold exceeded", color: "#f97316" },
                { time: "21:19", text: "Risk increased to HIGH", color: "#f97316" },
                { time: "21:23", text: "Risk increased to CRITICAL", color: "#ef4444" },
                { time: "21:24", text: "Public alert issued", color: "#22c55e" },
                { time: "21:26", text: "Evacuation initiated", color: "#38bdf8" },
                { time: "21:28", text: "Rescue Unit 07 dispatched", color: "#38bdf8" },
                { time: "21:34", text: "Unit arrived at location", color: "#22c55e" },
              ].map((ev, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: ev.color,
                      boxShadow: `0 0 8px ${ev.color}`,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono, monospace)", color: "#94a3b8", width: "36px" }}>
                    {ev.time}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#e2e8f0" }}>
                    {ev.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. MIDDLE ROW (AI RISK ANALYSIS, WEATHER & ENV, SHELTER AVAILABILITY) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Card 1: AI Risk Analysis */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "16px",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            padding: "18px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "#ffffff" }}>
              AI Risk Analysis
            </span>
            <button
              onClick={() => setWhyCriticalOpen(true)}
              style={{
                backgroundColor: "rgba(14, 165, 233, 0.15)",
                color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "0.68rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(14, 165, 233, 0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(14, 165, 233, 0.15)")}
            >
              Why this is Critical?
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Radial Gauge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ position: "relative", width: "100px", height: "100px" }}>
                <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3.2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeDasharray="87, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "1.3rem", fontWeight: "900", color: "#ffffff", lineHeight: "1" }}>87%</span>
                </div>
              </div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>Landslide Risk</div>
              <div
                style={{
                  backgroundColor: "#e11d48",
                  color: "#ffffff",
                  fontSize: "0.58rem",
                  fontWeight: "900",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  marginTop: "3px",
                }}
              >
                CRITICAL
              </div>
              <div style={{ fontSize: "0.6rem", color: "#64748b", marginTop: "2px" }}>Confidence level</div>
            </div>

            {/* Key Factors Progress Bars */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#e2e8f0" }}>Key Factors</div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.66rem", color: "#cbd5e1" }}>
                  <span>Rainfall Excess</span>
                  <span style={{ fontWeight: "700", color: "#f87171" }}>92%</span>
                </div>
                <div style={{ height: "5px", backgroundColor: "#1e293b", borderRadius: "3px", overflow: "hidden", marginTop: "3px" }}>
                  <div style={{ width: "92%", height: "100%", backgroundColor: "#ef4444", borderRadius: "3px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.66rem", color: "#cbd5e1" }}>
                  <span>Soil Saturation</span>
                  <span style={{ fontWeight: "700", color: "#fb923c" }}>86%</span>
                </div>
                <div style={{ height: "5px", backgroundColor: "#1e293b", borderRadius: "3px", overflow: "hidden", marginTop: "3px" }}>
                  <div style={{ width: "86%", height: "100%", backgroundColor: "#f97316", borderRadius: "3px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.66rem", color: "#cbd5e1" }}>
                  <span>Slope Angle</span>
                  <span style={{ fontWeight: "700", color: "#facc15" }}>78%</span>
                </div>
                <div style={{ height: "5px", backgroundColor: "#1e293b", borderRadius: "3px", overflow: "hidden", marginTop: "3px" }}>
                  <div style={{ width: "78%", height: "100%", backgroundColor: "#eab308", borderRadius: "3px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.66rem", color: "#cbd5e1" }}>
                  <span>Historical Activity</span>
                  <span style={{ fontWeight: "700", color: "#38bdf8" }}>61%</span>
                </div>
                <div style={{ height: "5px", backgroundColor: "#1e293b", borderRadius: "3px", overflow: "hidden", marginTop: "3px" }}>
                  <div style={{ width: "61%", height: "100%", backgroundColor: "#0284c7", borderRadius: "3px" }} />
                </div>
              </div>

              <div style={{ fontSize: "0.62rem", color: "#94a3b8", marginTop: "2px" }}>
                Estimated FoS: <strong style={{ color: "#ef4444" }}>0.91</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Weather & Environmental Data */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "16px",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            padding: "18px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "#ffffff" }}>
              Weather & Environmental Data
            </span>
            <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontFamily: "var(--font-mono, monospace)" }}>
              Updated 21:42
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {/* Tile 1: Rainfall */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                borderRadius: "10px",
                padding: "10px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#60a5fa", fontSize: "0.72rem" }}>
                <CloudRain size={14} />
                <span>Rainfall</span>
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#ffffff", marginTop: "3px" }}>
                42 mm <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "normal" }}>/ 3h</span>
              </div>
              <div style={{ fontSize: "0.6rem", color: "#64748b", marginTop: "2px" }}>
                ● Source: Open-Meteo
              </div>
            </div>

            {/* Tile 2: Soil Moisture */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                borderRadius: "10px",
                padding: "10px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#38bdf8", fontSize: "0.72rem" }}>
                <Droplets size={14} />
                <span>Soil Moisture</span>
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#ffffff", marginTop: "3px" }}>
                89%
              </div>
              <div style={{ fontSize: "0.6rem", color: "#64748b", marginTop: "2px" }}>
                ● Source: ESP32 Sensor
              </div>
            </div>

            {/* Tile 3: Temperature */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                borderRadius: "10px",
                padding: "10px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fb7185", fontSize: "0.72rem" }}>
                <Thermometer size={14} />
                <span>Temperature</span>
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#ffffff", marginTop: "3px" }}>
                27°C
              </div>
              <div style={{ fontSize: "0.6rem", color: "#64748b", marginTop: "2px" }}>
                ● Source: OpenWeatherMap
              </div>
            </div>

            {/* Tile 4: Wind Speed */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                borderRadius: "10px",
                padding: "10px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2dd4bf", fontSize: "0.72rem" }}>
                <Wind size={14} />
                <span>Wind Speed</span>
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#ffffff", marginTop: "3px" }}>
                13 km/h
              </div>
              <div style={{ fontSize: "0.6rem", color: "#64748b", marginTop: "2px" }}>
                ● Source: Open-Meteo
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Shelter Availability */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "16px",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            padding: "18px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "#ffffff" }}>
              Shelter Availability
            </span>
            <Link
              to="/shelter-finder"
              style={{
                fontSize: "0.7rem",
                color: "#38bdf8",
                textDecoration: "none",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              View All <ExternalLink size={11} />
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Donut Chart */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ position: "relative", width: "95px", height: "95px" }}>
                <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3.2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#0284c7"
                    strokeDasharray="72, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "1.2rem", fontWeight: "900", color: "#ffffff", lineHeight: "1" }}>72%</span>
                  <span style={{ fontSize: "0.58rem", color: "#94a3b8" }}>Occupied</span>
                </div>
              </div>
              <div style={{ fontSize: "0.64rem", color: "#cbd5e1", marginTop: "4px" }}>
                1,182 / 1,650
              </div>
            </div>

            {/* Legend Stats */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.72rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cbd5e1" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                  <span>Available</span>
                </div>
                <span style={{ fontWeight: "800", color: "#34d399" }}>468</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cbd5e1" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#0284c7" }} />
                  <span>Occupied</span>
                </div>
                <span style={{ fontWeight: "800", color: "#38bdf8" }}>1,182</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cbd5e1" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                  <span>Full</span>
                </div>
                <span style={{ fontWeight: "800", color: "#f87171" }}>3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. BOTTOM OPERATIONAL PANELS (4 COLUMNS) ─────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Panel 1: Quick Actions */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "16px",
            border: "1px solid rgba(56, 189, 248, 0.18)",
            padding: "16px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "#ffffff", marginBottom: "12px" }}>
            Quick Actions
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
            {/* Red: Send SOS with 3-sec hold */}
            <button
              onMouseDown={startSosHold}
              onMouseUp={cancelSosHold}
              onMouseLeave={cancelSosHold}
              onTouchStart={startSosHold}
              onTouchEnd={cancelSosHold}
              style={{
                backgroundColor: "#e11d48",
                border: "none",
                borderRadius: "10px",
                padding: "12px 8px",
                color: "#ffffff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(225, 29, 72, 0.4)",
                userSelect: "none",
              }}
            >
              {isHoldingSos && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "4px",
                    width: `${sosProgress}%`,
                    backgroundColor: "#ffffff",
                    transition: "width 0.1s linear",
                  }}
                />
              )}
              <span style={{ fontSize: "1.1rem" }}>🚨</span>
              <span style={{ fontSize: "0.76rem", fontWeight: "900" }}>
                {isHoldingSos ? `Hold (${Math.round((100 - sosProgress) / 33)}s)...` : "Send SOS"}
              </span>
              <span style={{ fontSize: "0.58rem", opacity: 0.85 }}>Hold 3 seconds</span>
            </button>

            {/* Blue: Evacuation Planner */}
            <button
              onClick={() => navigate("/evacuation-planner")}
              style={{
                backgroundColor: "#2563eb",
                border: "none",
                borderRadius: "10px",
                padding: "12px 8px",
                color: "#ffffff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.35)",
              }}
            >
              <Compass size={18} />
              <span style={{ fontSize: "0.74rem", fontWeight: "800" }}>Evacuation Planner</span>
              <span style={{ fontSize: "0.58rem", opacity: 0.85 }}>Find safe route</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
            {/* Teal: Report Disaster */}
            <button
              onClick={() => navigate("/incident-report")}
              style={{
                backgroundColor: "#0d9488",
                border: "none",
                borderRadius: "10px",
                padding: "10px 12px",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(13, 148, 136, 0.35)",
              }}
            >
              <FileText size={16} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.74rem", fontWeight: "800" }}>Report Disaster</div>
                <div style={{ fontSize: "0.58rem", opacity: 0.85 }}>Submit field report</div>
              </div>
            </button>

            {/* Purple: AI Assistant */}
            <button
              onClick={() => navigate("/ai-assistant")}
              style={{
                backgroundColor: "#7c3aed",
                border: "none",
                borderRadius: "10px",
                padding: "10px 12px",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(124, 58, 237, 0.35)",
              }}
            >
              <Bot size={17} />
              <div style={{ textAlign: "left" }}>
                <span style={{ fontSize: "0.76rem", fontWeight: "800" }}>AI Assistant </span>
                <span style={{ fontSize: "0.62rem", opacity: 0.85 }}>Ask anything</span>
              </div>
            </button>
          </div>
        </div>

        {/* Panel 2: Recent Alerts */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "16px",
            border: "1px solid rgba(56, 189, 248, 0.18)",
            padding: "16px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "#ffffff" }}>Recent Alerts</span>
            <Link to="/alerts" style={{ fontSize: "0.7rem", color: "#38bdf8", textDecoration: "none", fontWeight: "700" }}>
              View All ↗
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {[
              { color: "#ef4444", title: "Landslide Alert — NH-10", desc: "High risk in 3 sites", time: "21:24" },
              { color: "#f97316", title: "Heavy Rainfall Warning", desc: "Next 6 hours — 65mm+", time: "20:17" },
              { color: "#eab308", title: "Road Blockage Update", desc: "NH-10 partially closed", time: "19:32" },
              { color: "#22c55e", title: "Shelter Capacity Update", desc: "Shelter B — 92% full", time: "18:45" },
            ].map((al, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: al.color, marginTop: "4px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "#ffffff" }}>{al.title}</div>
                    <div style={{ fontSize: "0.62rem", color: "#94a3b8" }}>{al.desc}</div>
                  </div>
                </div>
                <span style={{ fontSize: "0.62rem", color: "#64748b", fontFamily: "var(--font-mono, monospace)" }}>
                  {al.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: System Health */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "16px",
            border: "1px solid rgba(56, 189, 248, 0.18)",
            padding: "16px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>
            System Health
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.68rem", color: "#34d399", fontWeight: "700", marginBottom: "10px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            <span>All Systems operational</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.68rem" }}>
            {[
              { name: "API Services", status: "ONLINE", ok: true },
              { name: "Database", status: "ONLINE", ok: true },
              { name: "Socket IO", status: "ONLINE", ok: true },
              { name: "Weather API", status: "ONLINE", ok: true },
              { name: "Satellite Feed", status: "ONLINE", ok: true },
              { name: "Sensor Network", status: "14/16 online", ok: true },
            ].map((sys, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#cbd5e1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                  <span>{sys.name}</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.64rem", color: "#34d399", fontWeight: "700" }}>
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 4: Emergency Mode */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(225, 29, 72, 0.22) 0%, rgba(15, 23, 42, 0.7) 100%)",
            borderRadius: "16px",
            border: "1.5px solid rgba(244, 63, 94, 0.4)",
            padding: "16px",
            boxShadow: "0 6px 20px rgba(225, 29, 72, 0.25)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(225, 29, 72, 0.35)",
                  border: "1px solid rgba(244, 63, 94, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <Zap size={15} />
              </div>
              <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "#ffffff" }}>
                Emergency Mode
              </span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "#cbd5e1", lineHeight: "1.4", margin: "6px 0 14px" }}>
              Switch to Emergency Mode for simplified, large-screen view.
            </p>
          </div>

          <button
            onClick={() => setEmergencyMode(true)}
            style={{
              backgroundColor: "#e11d48",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#ffffff",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "0.78rem",
              fontWeight: "900",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(225, 29, 72, 0.5)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Activate Emergency Mode
          </button>
        </div>
      </div>

      {/* ── MODAL 1: "WHY IS THIS CRITICAL?" (AI EXPLAINABILITY) ──────────────── */}
      {whyCriticalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setWhyCriticalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "500px",
              maxWidth: "95vw",
              backgroundColor: "#0b1222",
              border: "1.5px solid rgba(56, 189, 248, 0.4)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.2)",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.2rem" }}>🧠</span>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ffffff" }}>
                    Why is this Critical?
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#38bdf8" }}>
                    SHAP Factor Decomposition · Landslide Risk: 87%
                  </div>
                </div>
              </div>
              <button
                onClick={() => setWhyCriticalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.82rem" }}>
              <div style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", borderRadius: "10px", padding: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#cbd5e1" }}>Rainfall (Last 24h)</span>
                  <strong style={{ color: "#ef4444" }}>163 mm · 92% impact</strong>
                </div>
                <div style={{ fontSize: "0.68rem", color: "#64748b" }}>● Open-Meteo Radar Feed (Updated 21:42)</div>
              </div>

              <div style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", borderRadius: "10px", padding: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#cbd5e1" }}>Soil Saturation</span>
                  <strong style={{ color: "#f97316" }}>89% · 86% impact</strong>
                </div>
                <div style={{ fontSize: "0.68rem", color: "#64748b" }}>● ESP32 Sensor #14 (Telemetry live)</div>
              </div>

              <div style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", borderRadius: "10px", padding: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#cbd5e1" }}>Slope Incline</span>
                  <strong style={{ color: "#eab308" }}>38.4° · 78% impact</strong>
                </div>
                <div style={{ fontSize: "0.68rem", color: "#64748b" }}>● SRTM 30m Digital Elevation Model</div>
              </div>

              <div style={{ backgroundColor: "rgba(225, 29, 72, 0.15)", borderRadius: "10px", padding: "12px", border: "1px solid rgba(244, 63, 94, 0.35)" }}>
                <div style={{ fontWeight: "800", color: "#fca5a5", marginBottom: "4px" }}>
                  Main Contributing Factor
                </div>
                <div style={{ fontSize: "0.78rem", color: "#ffffff" }}>
                  ➔ <strong>Soil saturation exceeding critical threshold</strong> with estimated <strong>FoS: 0.91</strong> (Factor of Safety &lt; 1.0 indicates active slope failure).
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => {
                    setWhyCriticalOpen(false);
                    navigate("/evacuation-planner");
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  View Evacuation Route
                </button>
                <button
                  onClick={() => setWhyCriticalOpen(false)}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "#cbd5e1",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SOS ACTIVATED CONFIRMATION ──────────────────────────────── */}
      {sosModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setSosModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "440px",
              maxWidth: "95vw",
              backgroundColor: "#0f172a",
              border: "2px solid #ef4444",
              borderRadius: "18px",
              padding: "24px",
              textAlign: "center",
              boxShadow: "0 0 50px rgba(239, 68, 68, 0.6)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🚨</div>
            <div style={{ fontSize: "1.3rem", fontWeight: "900", color: "#ffffff", letterSpacing: "0.04em" }}>
              EMERGENCY SOS BROADCAST
            </div>
            <p style={{ fontSize: "0.82rem", color: "#cbd5e1", margin: "10px 0 16px" }}>
              Are you trapped or in immediate danger? Your high-accuracy GPS coordinates have been locked.
            </p>

            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "12px", textAlign: "left", marginBottom: "16px" }}>
              <div style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>✓</span> GPS Location Detected (21.3418° N, 83.6192° E)
              </div>
              <div style={{ fontSize: "0.76rem", color: "#ffffff", fontWeight: "700", marginTop: "4px" }}>
                Nearest Rescue Unit: <span style={{ color: "#38bdf8" }}>Unit 07 (2.4 km • ETA 07 min)</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  setSosModalOpen(false);
                  navigate("/emergency-sos");
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: "900",
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(220, 38, 38, 0.7)",
                }}
              >
                DISPATCH RESCUE NOW
              </button>
              <button
                onClick={() => setSosModalOpen(false)}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  color: "#cbd5e1",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: FULL EMERGENCY MODE OVERLAY ──────────────────────────────── */}
      {emergencyMode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#020617",
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(239, 68, 68, 0.4)", paddingBottom: "14px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.8rem" }}>🚨</span>
              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: "900", color: "#f87171" }}>
                  EMERGENCY MODE ACTIVE
                </div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  High-contrast simplified tactical interface for active emergency response
                </div>
              </div>
            </div>
            <button
              onClick={() => setEmergencyMode(false)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Exit Emergency Mode ✕
            </button>
          </div>

          <div style={{ maxWidth: "700px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "2px solid #ef4444", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "0.84rem", color: "#fca5a5", fontWeight: "800" }}>ACTIVE INCIDENT</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#ffffff", margin: "6px 0" }}>LANDSLIDE — CRITICAL (NH-10)</div>
              <div style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>Nearest safe shelter: <strong>Shelter Alpha (1.8 km)</strong> · Safe route: <strong>12 min</strong></div>
            </div>

            <button
              onClick={() => navigate("/evacuation-planner")}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "18px",
                borderRadius: "14px",
                fontSize: "1.1rem",
                fontWeight: "900",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 25px rgba(37, 99, 235, 0.5)",
              }}
            >
              🧭 NAVIGATE TO NEAREST SHELTER
            </button>

            <button
              onClick={() => setSosModalOpen(true)}
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                padding: "18px",
                borderRadius: "14px",
                fontSize: "1.1rem",
                fontWeight: "900",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 25px rgba(220, 38, 38, 0.5)",
              }}
            >
              🚨 SEND EMERGENCY SOS
            </button>

            <button
              onClick={() => navigate("/incident-report")}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                padding: "14px",
                borderRadius: "14px",
                fontSize: "0.95rem",
                fontWeight: "800",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
              }}
            >
              📋 REPORT A HAZARD
            </button>
          </div>
        </div>
      )}

    </div>
  );
}