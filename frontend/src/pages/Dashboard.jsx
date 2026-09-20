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
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  X,
  Droplets,
  Thermometer,
  Wind,
  Radio,
  Eye,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Crosshair,
  Navigation,
  Move,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import {
  INDIA_MAP_OUTLINE_PATH,
  INDIA_REGION_PATHS,
  REGION_VIEWPORTS,
  INDIA_RISK_ZONES
} from "../Data/indiaRiskZones";

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

  // ─── MAP REGION, VIEWPORT & INTERACTIVE CAMERA STATE ────────────────────
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [activeZone, setActiveZone] = useState(() => INDIA_RISK_ZONES[0]); // NH-10 baseline
  const [inspectedZone, setInspectedZone] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0, didDrag: false });
  const touchStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0, pinchDist: 0 });
  const mapContainerRef = useRef(null);

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

  // ─── MAP MOUSE WHEEL SCROLL-TO-ZOOM LISTENER ──────────────────────────────
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const onWheel = (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.18 : -0.18;
      setZoomLevel((prev) => {
        const next = Math.max(0.8, Math.min(6.0, Number((prev + zoomDelta).toFixed(2))));
        if (next <= 1.05 && selectedRegion !== "all") {
          setSelectedRegion("all");
        }
        return next;
      });
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [selectedRegion]);

  // ─── DYNAMIC MAP VIEWPORT & CAMERA COMPUTATION ────────────────────────────
  const currentViewport = REGION_VIEWPORTS[selectedRegion] || REGION_VIEWPORTS.all;

  const getActiveViewBox = () => {
    const parts = (currentViewport.viewBox || "0 0 1000 680").split(" ").map(Number);
    const [x, y, w, h] = parts;
    const factor = Math.max(0.7, zoomLevel);
    const newW = w / factor;
    const newH = h / factor;
    const newX = x + (w - newW) / 2 + panOffset.x;
    const newY = y + (h - newH) / 2 + panOffset.y;
    return `${newX} ${newY} ${newW} ${newH}`;
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.35).toFixed(2)), 6.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(Number((prev - 0.35).toFixed(2)), 0.8);
      if (next <= 1.05 && selectedRegion !== "all") {
        setSelectedRegion("all");
      }
      return next;
    });
  };

  const handlePan = (dx, dy) => {
    setPanOffset((prev) => ({
      x: Math.max(-950, Math.min(950, prev.x + dx)),
      y: Math.max(-750, Math.min(750, prev.y + dy)),
    }));
  };

  const handleResetView = () => {
    setSelectedRegion("all");
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveZone(INDIA_RISK_ZONES[0]);
    setInspectedZone(null);
  };

  // Region blur determination: When a region is selected, blur and dim all other regions
  const isZoneBlurred = (zoneRegion) => {
    if (selectedRegion === "all") return false;
    return zoneRegion !== selectedRegion;
  };

  const isPathBlurred = (pathId) => {
    if (selectedRegion === "all") return false;
    if (selectedRegion === "ner") {
      return !["siliguri_corridor", "brahmaputra_river", "teesta_river", "ner_backbone"].includes(pathId);
    }
    if (selectedRegion === "himalayas") {
      return !["himalayan_arc", "ganga_river"].includes(pathId);
    }
    if (selectedRegion === "south") {
      return !["western_ghats"].includes(pathId);
    }
    if (selectedRegion === "east") {
      return !["ganga_river", "brahmaputra_river"].includes(pathId);
    }
    return false;
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest("label") ||
      e.target.closest(".no-pan")
    ) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
      didDrag: false,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const baseViewBox = (REGION_VIEWPORTS[selectedRegion] || REGION_VIEWPORTS.all).viewBox || "0 0 1000 680";
    const [, , w] = baseViewBox.split(" ").map(Number);
    const currentSvgW = w / zoomLevel;
    const scaleRatio = currentSvgW / rect.width;

    const dx = (e.clientX - dragStartRef.current.x) * scaleRatio;
    const dy = (e.clientY - dragStartRef.current.y) * scaleRatio;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragStartRef.current.didDrag = true;
    }

    setPanOffset({
      x: Math.max(-1000, Math.min(1000, dragStartRef.current.initialPanX - dx)),
      y: Math.max(-800, Math.min(800, dragStartRef.current.initialPanY - dy)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
        pinchDist: 0,
      };
      dragStartRef.current.didDrag = false;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current.pinchDist = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e) => {
    if (!mapContainerRef.current) return;
    if (e.touches.length === 1) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const baseViewBox = (REGION_VIEWPORTS[selectedRegion] || REGION_VIEWPORTS.all).viewBox || "0 0 1000 680";
      const [, , w] = baseViewBox.split(" ").map(Number);
      const scaleRatio = (w / zoomLevel) / rect.width;

      const dx = (e.touches[0].clientX - touchStartRef.current.x) * scaleRatio;
      const dy = (e.touches[0].clientY - touchStartRef.current.y) * scaleRatio;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragStartRef.current.didDrag = true;
      }

      setPanOffset({
        x: Math.max(-1000, Math.min(1000, touchStartRef.current.initialPanX - dx)),
        y: Math.max(-800, Math.min(800, touchStartRef.current.initialPanY - dy)),
      });
    } else if (e.touches.length === 2 && touchStartRef.current.pinchDist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const factor = newDist / touchStartRef.current.pinchDist;
      if (Math.abs(factor - 1) > 0.04) {
        setZoomLevel((prev) => {
          const next = Math.max(0.8, Math.min(6.0, Number((prev * (factor > 1 ? 1.05 : 0.95)).toFixed(2))));
          if (next <= 1.05 && selectedRegion !== "all") {
            setSelectedRegion("all");
          }
          return next;
        });
        touchStartRef.current.pinchDist = newDist;
      }
    }
  };

  const handleSelectZone = (zone) => {
    if (dragStartRef.current?.didDrag) return;
    setActiveZone(zone);
    setInspectedZone(zone);
    if (zone.region) {
      setSelectedRegion(zone.region);
      setPanOffset({ x: 0, y: 0 });
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
      <div className="dashboard-main-grid">
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
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.96rem", fontWeight: "800", color: "#f8fafc" }}>
                Live Disaster Map — India & NER Risk Command
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
              <span
                style={{
                  backgroundColor: selectedRegion === "ner" ? "rgba(239, 68, 68, 0.15)" : "rgba(56, 189, 248, 0.15)",
                  color: selectedRegion === "ner" ? "#f87171" : "#38bdf8",
                  border: `1px solid ${selectedRegion === "ner" ? "rgba(239, 68, 68, 0.35)" : "rgba(56, 189, 248, 0.35)"}`,
                  borderRadius: "6px",
                  fontSize: "0.62rem",
                  fontWeight: "800",
                  padding: "2px 6px",
                }}
              >
                {currentViewport.badge}
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "var(--font-mono, monospace)" }}>
              Last updated: {currentTime}
            </div>
          </div>

          {/* ── REGION QUICK-JUMP TOOLBAR ── */}
          <div
            style={{
              padding: "7px 14px",
              backgroundColor: "rgba(8, 14, 28, 0.85)",
              borderBottom: "1px solid rgba(56, 189, 248, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.66rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "4px" }}>
                Regions:
              </span>
              {Object.entries(REGION_VIEWPORTS).map(([key, v]) => {
                const isActive = selectedRegion === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedRegion(key);
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                      if (key === "ner") {
                        setActiveZone(INDIA_RISK_ZONES[0]); // NH-10
                      }
                    }}
                    style={{
                      background: isActive
                        ? key === "ner"
                          ? "linear-gradient(135deg, rgba(225, 29, 72, 0.35) 0%, rgba(15, 23, 42, 0.8) 100%)"
                          : "linear-gradient(135deg, rgba(2, 132, 199, 0.35) 0%, rgba(15, 23, 42, 0.8) 100%)"
                        : "rgba(15, 23, 42, 0.6)",
                      border: `1px solid ${isActive ? (key === "ner" ? "#ef4444" : "#38bdf8") : "rgba(255, 255, 255, 0.1)"}`,
                      borderRadius: "6px",
                      color: isActive ? "#ffffff" : "#94a3b8",
                      fontSize: "0.68rem",
                      fontWeight: isActive ? "800" : "600",
                      padding: "3px 9px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: isActive ? (key === "ner" ? "0 0 12px rgba(239, 68, 68, 0.4)" : "0 0 12px rgba(56, 189, 248, 0.3)") : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={handleResetView}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "5px",
                  color: "#94a3b8",
                  fontSize: "0.64rem",
                  padding: "2px 7px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                }}
                title="Reset View to Full India"
              >
                <RefreshCw size={10} />
                <span>Reset View</span>
              </button>
            </div>
          </div>

          {/* ── ACTIVE CORRIDOR STATUS INTEL RIBBON ── */}
          <div
            style={{
              padding: "4px 14px",
              backgroundColor: "rgba(6, 12, 24, 0.9)",
              borderBottom: "1px solid rgba(56, 189, 248, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.66rem",
              color: "#cbd5e1",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#ef4444", fontWeight: "800" }}>⚠️ Active Corridor:</span>
              <span style={{ fontWeight: "700", color: "#ffffff" }}>{activeZone?.name}</span>
              <span style={{ color: "#64748b" }}>·</span>
              <span style={{ color: "#38bdf8" }}>{activeZone?.highway} ({activeZone?.state})</span>
              <span style={{ color: "#64748b" }}>·</span>
              <span style={{ color: activeZone?.levelColor, fontWeight: "800" }}>{activeZone?.lsi}</span>
            </div>
            <span style={{ color: "#94a3b8", fontSize: "0.62rem" }}>
              {selectedRegion === "ner" ? "🏔️ 8 NER Critical Corridors Active" : "🌐 Click any Risk Zone Pin to inspect telemetry"}
            </span>
          </div>

          {/* ── MAP VIEWPORT CANVAS (INDIA VECTOR & HAZARD OVERLAYS) ── */}
          <div
            ref={mapContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
            style={{
              position: "relative",
              height: "540px",
              width: "100%",
              overflow: "hidden",
              backgroundColor: "#050e18",
              backgroundImage: `
                radial-gradient(ellipse at 72% 36%, rgba(225, 29, 72, 0.24) 0%, transparent 45%),
                radial-gradient(ellipse at 38% 18%, rgba(245, 158, 11, 0.18) 0%, transparent 40%),
                radial-gradient(circle at 35% 76%, rgba(16, 185, 129, 0.14) 0%, transparent 35%),
                linear-gradient(135deg, #071524 0%, #05101c 40%, #030a12 100%)
              `,
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              touchAction: "none",
            }}
          >
            {/* Floating Region Focus Banner with Reset/Back to Full India Button */}
            {selectedRegion !== "all" && (
              <div
                className="dashboard-region-focus-banner"
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "14px",
                  zIndex: 30,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(10, 18, 36, 0.94)",
                  border: "1px solid rgba(56, 189, 248, 0.6)",
                  padding: "6px 14px",
                  borderRadius: "10px",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.75), 0 0 15px rgba(56, 189, 248, 0.25)",
                  backdropFilter: "blur(14px)",
                  pointerEvents: "auto",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: "900", color: "#38bdf8", letterSpacing: "0.02em" }}>
                    REGION FOCUS: {REGION_VIEWPORTS[selectedRegion]?.label || selectedRegion}
                  </span>
                  <span style={{ fontSize: "0.62rem", color: "#94a3b8" }}>
                    Other regions blurred · Click back or zoom out to reset
                  </span>
                </div>
                <button
                  onClick={handleResetView}
                  style={{
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.35)",
                    borderRadius: "7px",
                    padding: "4px 10px",
                    fontSize: "0.7rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    boxShadow: "0 2px 8px rgba(2, 132, 199, 0.5)",
                    transition: "all 0.15s ease",
                  }}
                  title="Unblur & return to Full India view"
                >
                  <RefreshCw size={11} />
                  <span>← Back to Full India</span>
                </button>
              </div>
            )}

            {/* Topographic Elevation Contours Simulation & Geographic India Base */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                transition: isDragging ? "none" : "viewBox 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              viewBox={getActiveViewBox()}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="contourGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1" />
                </pattern>
                {/* Glowing hazard pulse filter */}
                <filter id="hazardGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Region Blur Filter for Unselected Regional Elements */}
                <filter id="regionBlurFilter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.8" result="blur" />
                  <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.18 0" />
                </filter>
              </defs>

              {/* Background Grid */}
              <rect x="0" y="0" width="1000" height="680" fill="url(#contourGrid)" />

              {/* ── GEOGRAPHIC LABELS & OCEANIC WATERMARKS (ENHANCED CLARITY) ── */}
              <text x="120" y="520" fill="rgba(56, 189, 248, 0.28)" fontSize="13" fontWeight="900" letterSpacing="5" fontFamily="monospace" opacity={selectedRegion === "all" ? 1 : 0.15} style={{ pointerEvents: "none", transition: "opacity 0.4s ease" }}>
                ARABIAN SEA
              </text>
              <text x="590" y="520" fill="rgba(56, 189, 248, 0.28)" fontSize="13" fontWeight="900" letterSpacing="5" fontFamily="monospace" opacity={selectedRegion === "all" ? 1 : 0.15} style={{ pointerEvents: "none", transition: "opacity 0.4s ease" }}>
                BAY OF BENGAL
              </text>
              <text x="320" y="668" fill="rgba(56, 189, 248, 0.24)" fontSize="11" fontWeight="900" letterSpacing="6" fontFamily="monospace" opacity={selectedRegion === "all" ? 1 : 0.15} style={{ pointerEvents: "none", transition: "opacity 0.4s ease" }}>
                INDIAN OCEAN
              </text>
              <text x="270" y="45" fill="rgba(34, 197, 94, 0.45)" fontSize="9.5" fontWeight="900" letterSpacing="4" fontFamily="monospace" opacity={selectedRegion === "all" || selectedRegion === "himalayas" ? 1 : 0.15} style={{ pointerEvents: "none", transition: "opacity 0.4s ease" }}>
                ▲ HIMALAYAN TECTONIC ARC (SEISMIC ZONE IV & V)
              </text>

              {/* ── INDIA GEOGRAPHIC LANDMASS SILHOUETTE (HIGH CLARITY VECTOR) ── */}
              {/* Vibrant Outer Neon Glow Stroke */}
              <path
                d={INDIA_MAP_OUTLINE_PATH}
                fill="none"
                stroke="rgba(56, 189, 248, 0.45)"
                strokeWidth="4.5"
                filter={selectedRegion === "all" ? "url(#cyanGlow)" : "url(#regionBlurFilter)"}
                opacity={selectedRegion === "all" ? 1 : 0.25}
                style={{ transition: "opacity 0.4s ease, filter 0.4s ease" }}
              />
              {/* Sharp Navy Landmass with Crisp Sky-Blue Border */}
              <path
                d={INDIA_MAP_OUTLINE_PATH}
                fill="#08182b"
                stroke="#38bdf8"
                strokeWidth={selectedRegion === "all" ? 1.8 : 1.4}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={selectedRegion === "all" ? 1 : 0.35}
                filter={selectedRegion === "all" ? undefined : "url(#regionBlurFilter)"}
                style={{ transition: "opacity 0.4s ease, filter 0.4s ease" }}
              />

              {/* ── GEOGRAPHIC CORRIDORS & RIVERS (BRAHMAPUTRA, TEESTA, GANGA) ── */}
              {INDIA_REGION_PATHS.map((item) => {
                const isBlurred = isPathBlurred(item.id);
                return (
                  <path
                    key={item.id}
                    d={item.d}
                    fill="none"
                    stroke={item.stroke}
                    strokeWidth={item.width || "1.5"}
                    strokeDasharray={item.dash !== "none" ? item.dash : undefined}
                    strokeLinecap="round"
                    filter={isBlurred ? "url(#regionBlurFilter)" : undefined}
                    opacity={isBlurred ? 0.12 : 1}
                    style={{ transition: "opacity 0.4s ease, filter 0.4s ease" }}
                  />
                );
              })}

              {/* ── INTERACTIVE REGION BOUNDARIES (CLICK ANY TO FOCUS THAT REGION) ── */}
              {/* 1. North Eastern Region (NER) */}
              <polygon
                points="575,200 660,140 880,140 880,330 790,450 690,400 575,280"
                fill={selectedRegion === "ner" ? "rgba(225, 29, 72, 0.1)" : selectedRegion === "all" ? "rgba(56, 189, 248, 0.04)" : "transparent"}
                stroke={selectedRegion === "ner" ? "#ef4444" : selectedRegion === "all" ? "rgba(56, 189, 248, 0.35)" : "rgba(56, 189, 248, 0.1)"}
                strokeWidth={selectedRegion === "ner" ? "2.5" : "1.2"}
                strokeDasharray={selectedRegion === "ner" ? "none" : "4,4"}
                filter={selectedRegion !== "all" && selectedRegion !== "ner" ? "url(#regionBlurFilter)" : undefined}
                opacity={selectedRegion !== "all" && selectedRegion !== "ner" ? 0.12 : 1}
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={() => {
                  setSelectedRegion("ner");
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                  setActiveZone(INDIA_RISK_ZONES[0]);
                }}
              >
                <title>Click to focus North Eastern Region (NER)</title>
              </polygon>

              {/* 2. North Himalayas */}
              <polygon
                points="260,30 460,30 520,180 380,190 260,140"
                fill={selectedRegion === "himalayas" ? "rgba(56, 189, 248, 0.12)" : selectedRegion === "all" ? "rgba(56, 189, 248, 0.03)" : "transparent"}
                stroke={selectedRegion === "himalayas" ? "#38bdf8" : selectedRegion === "all" ? "rgba(56, 189, 248, 0.25)" : "rgba(56, 189, 248, 0.1)"}
                strokeWidth={selectedRegion === "himalayas" ? "2.5" : "1"}
                strokeDasharray={selectedRegion === "himalayas" ? "none" : "4,4"}
                filter={selectedRegion !== "all" && selectedRegion !== "himalayas" ? "url(#regionBlurFilter)" : undefined}
                opacity={selectedRegion !== "all" && selectedRegion !== "himalayas" ? 0.12 : 1}
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={() => {
                  setSelectedRegion("himalayas");
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                  const z = INDIA_RISK_ZONES.find((item) => item.region === "himalayas");
                  if (z) setActiveZone(z);
                }}
              >
                <title>Click to focus North Himalayas</title>
              </polygon>

              {/* 3. Western Ghats / South */}
              <polygon
                points="250,470 340,470 380,660 300,660 250,540"
                fill={selectedRegion === "south" ? "rgba(16, 185, 129, 0.12)" : selectedRegion === "all" ? "rgba(16, 185, 129, 0.03)" : "transparent"}
                stroke={selectedRegion === "south" ? "#10b981" : selectedRegion === "all" ? "rgba(16, 185, 129, 0.25)" : "rgba(16, 185, 129, 0.1)"}
                strokeWidth={selectedRegion === "south" ? "2.5" : "1"}
                strokeDasharray={selectedRegion === "south" ? "none" : "4,4"}
                filter={selectedRegion !== "all" && selectedRegion !== "south" ? "url(#regionBlurFilter)" : undefined}
                opacity={selectedRegion !== "all" && selectedRegion !== "south" ? 0.12 : 1}
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={() => {
                  setSelectedRegion("south");
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                  const z = INDIA_RISK_ZONES.find((item) => item.region === "south");
                  if (z) setActiveZone(z);
                }}
              >
                <title>Click to focus Western Ghats (South)</title>
              </polygon>

              {/* 4. East Coast & Delta */}
              <polygon
                points="430,320 570,320 620,490 480,490"
                fill={selectedRegion === "east" ? "rgba(245, 158, 11, 0.12)" : selectedRegion === "all" ? "rgba(245, 158, 11, 0.03)" : "transparent"}
                stroke={selectedRegion === "east" ? "#f59e0b" : selectedRegion === "all" ? "rgba(245, 158, 11, 0.25)" : "rgba(245, 158, 11, 0.1)"}
                strokeWidth={selectedRegion === "east" ? "2.5" : "1"}
                strokeDasharray={selectedRegion === "east" ? "none" : "4,4"}
                filter={selectedRegion !== "all" && selectedRegion !== "east" ? "url(#regionBlurFilter)" : undefined}
                opacity={selectedRegion !== "all" && selectedRegion !== "east" ? 0.12 : 1}
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={() => {
                  setSelectedRegion("east");
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                  const z = INDIA_RISK_ZONES.find((item) => item.region === "east");
                  if (z) setActiveZone(z);
                }}
              >
                <title>Click to focus East Coast & Delta</title>
              </polygon>

              {/* ── 1. LAYER: DISASTER RISK ZONES (POLYGONS LIKE NH-10) ── */}
              {mapLayers.disasterRisk && (
                <>
                  {INDIA_RISK_ZONES.map((zone) => {
                    const isCurrent = activeZone?.id === zone.id;
                    const isBlurred = isZoneBlurred(zone.region);
                    return (
                      <g 
                        key={`zone-poly-${zone.id}`}
                        filter={isBlurred ? "url(#regionBlurFilter)" : undefined}
                        opacity={isBlurred ? 0.12 : 1}
                        style={{ pointerEvents: isBlurred ? "none" : "auto", transition: "opacity 0.4s ease, filter 0.4s ease" }}
                      >
                        {/* Warning Amber Perimeter */}
                        {zone.polygons?.warning && (
                          <polygon
                            points={zone.polygons.warning}
                            fill="rgba(245, 158, 11, 0.18)"
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            strokeDasharray="4,4"
                          />
                        )}
                        {/* Critical Risk Red Hazard Zone with Pulsing Glow */}
                        {zone.polygons?.critical && (
                          <polygon
                            points={zone.polygons.critical}
                            fill={zone.level === "CRITICAL" ? "rgba(239, 68, 68, 0.36)" : "rgba(249, 115, 22, 0.28)"}
                            stroke={zone.levelColor}
                            strokeWidth={isCurrent ? "3" : "1.8"}
                            filter="url(#hazardGlow)"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleSelectZone(zone)}
                          />
                        )}
                      </g>
                    );
                  })}
                </>
              )}

              {/* ── 2. LAYER: ROADS & EVACUATION HIGHWAYS (LIKE NH-10) ── */}
              {mapLayers.roads && (
                <>
                  {INDIA_RISK_ZONES.map((zone) => {
                    const isBlurred = isZoneBlurred(zone.region);
                    return (
                      <g 
                        key={`roads-${zone.id}`}
                        filter={isBlurred ? "url(#regionBlurFilter)" : undefined}
                        opacity={isBlurred ? 0.12 : 1}
                        style={{ pointerEvents: isBlurred ? "none" : "auto", transition: "opacity 0.4s ease, filter 0.4s ease" }}
                      >
                        {/* Underlying Road Bed */}
                        {zone.evacuationRoad && (
                          <path
                            d={zone.evacuationRoad}
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="5"
                            strokeLinecap="round"
                          />
                        )}
                        {/* Evacuation Route (Cyan Glowing Dashed Line) */}
                        {zone.evacuationRoad && (
                          <path
                            d={zone.evacuationRoad}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2.8"
                            strokeDasharray="7,5"
                            strokeLinecap="round"
                            filter="url(#cyanGlow)"
                          />
                        )}
                        {/* Secondary Alternate Route (Green Dashed Line) */}
                        {zone.secondaryRoad && (
                          <path
                            d={zone.secondaryRoad}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2"
                            strokeDasharray="5,4"
                          />
                        )}
                      </g>
                    );
                  })}
                </>
              )}

              {/* ── 3. LAYER: INTERACTIVE RISK ZONE CALLOUT MARKERS (LIKE NH-10) ── */}
              {mapLayers.disasterRisk && (
                <>
                  {INDIA_RISK_ZONES.map((zone) => {
                    const isCurrent = activeZone?.id === zone.id;
                    const isBlurred = isZoneBlurred(zone.region);
                    // Scale badges in zoomed modes vs Pan-India
                    const boxW = selectedRegion === "all" ? 170 : 130;
                    const boxH = selectedRegion === "all" ? 44 : 36;
                    const fontSize = selectedRegion === "all" ? "10px" : "8px";
                    const iconSize = selectedRegion === "all" ? 13 : 10;

                    return (
                      <foreignObject
                        key={`pin-${zone.id}`}
                        x={zone.center.x - boxW / 2}
                        y={zone.center.y - boxH}
                        width={boxW}
                        height={boxH + 10}
                        filter={isBlurred ? "url(#regionBlurFilter)" : undefined}
                        opacity={isBlurred ? 0.12 : 1}
                        style={{ overflow: "visible", pointerEvents: isBlurred ? "none" : "auto", transition: "opacity 0.4s ease, filter 0.4s ease" }}
                      >
                        <div
                          onClick={() => handleSelectZone(zone)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: "pointer",
                            transform: isCurrent ? "scale(1.12)" : "scale(1)",
                            transition: "transform 0.18s ease",
                          }}
                          title={`${zone.name} — ${zone.subtitle} (${zone.level})`}
                        >
                          <div
                            style={{
                              backgroundColor: zone.level === "CRITICAL" ? "rgba(225, 29, 72, 0.95)" : "rgba(217, 119, 6, 0.95)",
                              color: "#ffffff",
                              padding: selectedRegion === "all" ? "4px 8px" : "2px 6px",
                              borderRadius: "7px",
                              fontSize: fontSize,
                              fontWeight: "800",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              boxShadow: isCurrent ? "0 0 20px rgba(225, 29, 72, 0.95)" : "0 2px 10px rgba(0,0,0,0.6)",
                              border: isCurrent ? "1.5px solid #ffffff" : "1px solid rgba(255, 255, 255, 0.6)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <AlertTriangle size={iconSize} color="#ffffff" />
                            <span>{zone.name}</span>
                          </div>
                          {/* Triangle Pointer */}
                          <div
                            style={{
                              width: selectedRegion === "all" ? "9px" : "7px",
                              height: selectedRegion === "all" ? "9px" : "7px",
                              backgroundColor: zone.levelColor,
                              transform: "rotate(45deg) translateY(-4px)",
                            }}
                          />
                        </div>
                      </foreignObject>
                    );
                  })}
                </>
              )}

              {/* ── 4. LAYER: AFFECTED POPULATION & VILLAGE BADGES (LIKE NH-10) ── */}
              {mapLayers.affectedPopulation && (
                <>
                  {INDIA_RISK_ZONES.map((zone) => {
                    const isBlurred = isZoneBlurred(zone.region);
                    return zone.villages?.map((village, vIdx) => {
                      const vW = selectedRegion === "all" ? 140 : 110;
                      const vH = selectedRegion === "all" ? 28 : 22;
                      const vFontSize = selectedRegion === "all" ? "9.5px" : "7px";

                      return (
                        <foreignObject
                          key={`v-${zone.id}-${vIdx}`}
                          x={village.x - vW / 2}
                          y={village.y - vH / 2}
                          width={vW}
                          height={vH}
                          filter={isBlurred ? "url(#regionBlurFilter)" : undefined}
                          opacity={isBlurred ? 0.12 : 1}
                          style={{ overflow: "visible", pointerEvents: "none", transition: "opacity 0.4s ease, filter 0.4s ease" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              backgroundColor: "rgba(15, 23, 42, 0.9)",
                              border: `1px solid ${village.color}88`,
                              borderRadius: "14px",
                              padding: "2px 6px",
                              fontSize: vFontSize,
                              color: "#f8fafc",
                              fontWeight: "700",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                              whiteSpace: "nowrap",
                              width: "max-content",
                            }}
                          >
                            <span>🏘️</span>
                            <span>
                              {village.name} <strong style={{ color: village.color }}>{village.pop}</strong>
                            </span>
                          </div>
                        </foreignObject>
                      );
                    });
                  })}
                </>
              )}

              {/* ── 5. LAYER: RESCUE UNITS (BLUE VEHICLES LIKE NH-10) ── */}
              {mapLayers.rescueUnits && (
                <>
                  {INDIA_RISK_ZONES.map((zone) => {
                    const isBlurred = isZoneBlurred(zone.region);
                    return zone.rescueUnits?.map((unit) => {
                      const uSize = selectedRegion === "all" ? 24 : 18;
                      const iconSize = selectedRegion === "all" ? 12 : 9;
                      return (
                        <foreignObject
                          key={`ru-${unit.id}`}
                          x={unit.x - uSize / 2}
                          y={unit.y - uSize / 2}
                          width={uSize}
                          height={uSize}
                          filter={isBlurred ? "url(#regionBlurFilter)" : undefined}
                          opacity={isBlurred ? 0.12 : 1}
                          style={{ overflow: "visible", pointerEvents: isBlurred ? "none" : "auto", transition: "opacity 0.4s ease, filter 0.4s ease" }}
                        >
                          <div
                            onClick={() => handleSelectZone(zone)}
                            style={{
                              width: `${uSize}px`,
                              height: `${uSize}px`,
                              borderRadius: "50%",
                              backgroundColor: "#0284c7",
                              border: "1.8px solid #ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 0 12px rgba(2, 132, 199, 0.9)",
                              color: "#ffffff",
                              cursor: "pointer",
                            }}
                            title={`${unit.name} (${unit.status}) — ETA: ${unit.eta}`}
                          >
                            <Truck size={iconSize} />
                          </div>
                        </foreignObject>
                      );
                    });
                  })}
                </>
              )}

              {/* ── 6. LAYER: SAFE SHELTERS (GREEN HOUSES LIKE NH-10) ── */}
              {mapLayers.shelters && (
                <>
                  {INDIA_RISK_ZONES.map((zone) => {
                    const isBlurred = isZoneBlurred(zone.region);
                    return zone.shelters?.map((shelter) => {
                      const sSize = selectedRegion === "all" ? 22 : 16;
                      const iconSize = selectedRegion === "all" ? 11 : 8;
                      return (
                        <foreignObject
                          key={`sh-${shelter.id}`}
                          x={shelter.x - sSize / 2}
                          y={shelter.y - sSize / 2}
                          width={sSize}
                          height={sSize}
                          filter={isBlurred ? "url(#regionBlurFilter)" : undefined}
                          opacity={isBlurred ? 0.12 : 1}
                          style={{ overflow: "visible", pointerEvents: isBlurred ? "none" : "auto", transition: "opacity 0.4s ease, filter 0.4s ease" }}
                        >
                          <div
                            onClick={() => handleSelectZone(zone)}
                            style={{
                              width: `${sSize}px`,
                              height: `${sSize}px`,
                              borderRadius: "50%",
                              backgroundColor: "#16a34a",
                              border: "1.8px solid #ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              boxShadow: "0 0 10px rgba(22, 163, 74, 0.9)",
                              cursor: "pointer",
                            }}
                            title={`${shelter.name} — Capacity: ${shelter.capacity}`}
                          >
                            <Home size={iconSize} />
                          </div>
                        </foreignObject>
                      );
                    });
                  })}
                </>
              )}

              {/* ── 7. LAYER: ROAD BLOCKS (RED BADGES LIKE NH-10) ── */}
              {mapLayers.roads && (
                <>
                  {INDIA_RISK_ZONES.map((zone) => {
                    const isBlurred = isZoneBlurred(zone.region);
                    return zone.blockedPoints?.map((bp) => {
                      const bSize = selectedRegion === "all" ? 20 : 15;
                      const bFontSize = selectedRegion === "all" ? "10px" : "7.5px";
                      return (
                        <foreignObject
                          key={`bp-${bp.id}`}
                          x={bp.x - bSize / 2}
                          y={bp.y - bSize / 2}
                          width={bSize}
                          height={bSize}
                          filter={isBlurred ? "url(#regionBlurFilter)" : undefined}
                          opacity={isBlurred ? 0.12 : 1}
                          style={{ overflow: "visible", pointerEvents: isBlurred ? "none" : "auto", transition: "opacity 0.4s ease, filter 0.4s ease" }}
                        >
                          <div
                            style={{
                              width: `${bSize}px`,
                              height: `${bSize}px`,
                              borderRadius: "50%",
                              backgroundColor: "#dc2626",
                              border: "1.5px solid #ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              fontSize: bFontSize,
                              boxShadow: "0 0 12px rgba(220, 38, 38, 0.9)",
                              cursor: "pointer",
                            }}
                            title={`Road Blocked: ${bp.name} (${bp.road})`}
                          >
                            ⛔
                          </div>
                        </foreignObject>
                      );
                    });
                  })}
                </>
              )}

              {/* ── 8. LAYER: IOT SENSORS (PURPLE NODES) ── */}
              {mapLayers.iotSensors && (
                <>
                  {INDIA_RISK_ZONES.map((zone) => {
                    const isBlurred = isZoneBlurred(zone.region);
                    return zone.iotSensors?.map((sensor) => {
                      const sensSize = selectedRegion === "all" ? 22 : 16;
                      const iconSize = selectedRegion === "all" ? 11 : 8;
                      return (
                        <foreignObject
                          key={`iot-${sensor.id}`}
                          x={sensor.x - sensSize / 2}
                          y={sensor.y - sensSize / 2}
                          width={sensSize}
                          height={sensSize}
                          filter={isBlurred ? "url(#regionBlurFilter)" : undefined}
                          opacity={isBlurred ? 0.12 : 1}
                          style={{ overflow: "visible", pointerEvents: isBlurred ? "none" : "auto", transition: "opacity 0.4s ease, filter 0.4s ease" }}
                        >
                          <div
                            style={{
                              width: `${sensSize}px`,
                              height: `${sensSize}px`,
                              borderRadius: "50%",
                              backgroundColor: "#8b5cf6",
                              border: "1.8px solid #ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              boxShadow: "0 0 12px rgba(139, 92, 246, 0.9)",
                              cursor: "pointer",
                            }}
                            title={`IoT Node: ${sensor.name} | Saturation: ${sensor.sat} | Tilt: ${sensor.tilt}`}
                          >
                            <Radio size={iconSize} />
                          </div>
                        </foreignObject>
                      );
                    });
                  })}
                </>
              )}
            </svg>

            {/* ── FLOATING TACTICAL HUD DRAWER (SELECTED RISK ZONE INTELLIGENCE) ── */}
            {inspectedZone && (
              <div
                className="dashboard-tactical-hud"
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "115px",
                  right: "175px",
                  backgroundColor: "rgba(9, 17, 34, 0.95)",
                  backdropFilter: "blur(14px)",
                  border: `1.5px solid ${inspectedZone.levelColor}`,
                  borderRadius: "12px",
                  padding: "12px 16px",
                  boxShadow: `0 8px 30px rgba(0, 0, 0, 0.8), 0 0 18px ${inspectedZone.levelColor}44`,
                  zIndex: 25,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  animation: "fadeIn 0.2s ease",
                }}
              >
                {/* HUD Top Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        backgroundColor: inspectedZone.levelColor,
                        color: "#ffffff",
                        fontSize: "0.62rem",
                        fontWeight: "900",
                        padding: "2px 7px",
                        borderRadius: "4px",
                      }}
                    >
                      {inspectedZone.level}
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: "900", color: "#ffffff" }}>
                      {inspectedZone.name}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: "700" }}>
                      {inspectedZone.subtitle}
                    </span>
                    <span
                      style={{
                        backgroundColor: "rgba(56, 189, 248, 0.15)",
                        color: "#38bdf8",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        fontSize: "0.62rem",
                        fontWeight: "800",
                      }}
                    >
                      {inspectedZone.lsi}
                    </span>
                  </div>

                  <button
                    onClick={() => setInspectedZone(null)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "2px",
                    }}
                    title="Dismiss Zone HUD"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* HUD 3-Column Metrics Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: "10px",
                    fontSize: "0.68rem",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  {/* Col 1: Population & Settlements */}
                  <div>
                    <div style={{ color: "#94a3b8", fontWeight: "700", marginBottom: "2px" }}>
                      👥 Population at Risk ({inspectedZone.details?.exposed} exposed):
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                      {inspectedZone.villages?.map((v, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: "rgba(245, 158, 11, 0.15)",
                            color: "#fbbf24",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            fontSize: "0.62rem",
                            fontWeight: "700",
                          }}
                        >
                          {v.name} ({v.pop})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Col 2: Highway & Road Breach */}
                  <div>
                    <div style={{ color: "#94a3b8", fontWeight: "700", marginBottom: "2px" }}>
                      🛣️ Corridor Status ({inspectedZone.highway}):
                    </div>
                    <div style={{ color: "#f87171", fontWeight: "800", marginTop: "2px" }}>
                      ⛔ {inspectedZone.blockedPoints?.[0]?.name || "Road block alert active"}
                    </div>
                    <div style={{ color: "#38bdf8", fontSize: "0.62rem", marginTop: "2px" }}>
                      ✅ Cyan Dashed Evacuation Corridor open
                    </div>
                  </div>

                  {/* Col 3: Sensor & Environmental Intel */}
                  <div>
                    <div style={{ color: "#94a3b8", fontWeight: "700", marginBottom: "2px" }}>
                      🌧️ Environmental & Sensor Readings:
                    </div>
                    <div style={{ color: "#cbd5e1" }}>
                      Rainfall: <strong style={{ color: "#38bdf8" }}>{inspectedZone.details?.rainfall}</strong> · Soil: <strong style={{ color: "#f87171" }}>{inspectedZone.details?.soilSaturation}</strong>
                    </div>
                    <div style={{ color: "#a78bfa", fontSize: "0.62rem", marginTop: "2px" }}>
                      📡 {inspectedZone.iotSensors?.[0]?.name}
                    </div>
                  </div>
                </div>

                {/* HUD Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      onClick={() => setSosModalOpen(true)}
                      style={{
                        backgroundColor: "#e11d48",
                        border: "none",
                        borderRadius: "6px",
                        color: "#ffffff",
                        padding: "5px 12px",
                        fontSize: "0.68rem",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        cursor: "pointer",
                      }}
                    >
                      <AlertTriangle size={12} />
                      <span>Issue Evacuation Broadcast</span>
                    </button>
                    <Link
                      to={`/map?zone=${inspectedZone.id}`}
                      style={{
                        backgroundColor: "rgba(2, 132, 199, 0.25)",
                        border: "1px solid rgba(56, 189, 248, 0.5)",
                        borderRadius: "6px",
                        color: "#38bdf8",
                        padding: "5px 12px",
                        fontSize: "0.68rem",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        textDecoration: "none",
                      }}
                    >
                      <Navigation size={12} />
                      <span>Open in In-App GIS</span>
                    </Link>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.64rem" }}>
                    Response ETA: <strong style={{ color: "#38bdf8" }}>{inspectedZone.details?.clearingEta}</strong>
                  </div>
                </div>
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
                    { key: "roads", label: "Roads & Evac" },
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
              className="dashboard-map-minimap"
              style={{
                position: "absolute",
                bottom: "14px",
                left: "14px",
                width: "90px",
                height: "68px",
                backgroundColor: "rgba(8, 14, 28, 0.92)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "8px",
                padding: "4px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 20,
              }}
            >
              <svg viewBox="0 0 100 70" width="100%" height="52">
                {/* Mini India silhouette */}
                <path
                  d="M 32,2 L 40,8 L 47,18 L 58,23 L 60,20 L 68,16 L 85,16 L 87,22 L 82,33 L 78,42 L 72,40 L 65,33 L 57,36 L 52,40 L 46,48 L 40,57 L 36,65 L 34,60 L 29,50 L 25,38 L 17,37 L 16,33 L 21,21 L 26,12 Z"
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="#0284c7"
                  strokeWidth="1.2"
                />
                {/* Dynamic Real-time Red Target bounding box indicating active viewport */}
                {(() => {
                  const parts = getActiveViewBox().split(" ").map(Number);
                  const [vx, vy, vw, vh] = parts;
                  const rectX = Math.max(0, Math.min(95, (vx / 1000) * 100));
                  const rectY = Math.max(0, Math.min(65, (vy / 680) * 70));
                  const rectW = Math.max(6, Math.min(100 - rectX, (vw / 1000) * 100));
                  const rectH = Math.max(6, Math.min(70 - rectY, (vh / 680) * 70));
                  return (
                    <rect
                      x={rectX}
                      y={rectY}
                      width={rectW}
                      height={rectH}
                      fill="rgba(239, 68, 68, 0.35)"
                      stroke="#ef4444"
                      strokeWidth="1.2"
                      rx="2"
                    />
                  );
                })()}
              </svg>
              <span style={{ fontSize: "0.52rem", color: "#38bdf8", fontWeight: "800", textTransform: "uppercase" }}>
                {selectedRegion}
              </span>
            </div>

            {/* ── FLOATING OVERLAY: LEGEND (BOTTOM RIGHT) ── */}
            <div
              className="dashboard-map-legend"
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
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444", boxShadow: "0 0 6px #ef4444" }} />
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
                <span style={{ color: "#38bdf8" }}>🚑</span>
                <span>Rescue Unit</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#22c55e" }}>🏠</span>
                <span>Safe Shelter</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "12px", height: "2px", backgroundColor: "#38bdf8", display: "inline-block" }} />
                <span>Evacuation Route</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#ef4444" }}>⛔</span>
                <span>Blocked Road</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#8b5cf6" }}>📡</span>
                <span>IoT Sensor</span>
              </div>
            </div>

            {/* ── INTERACTIVE CAMERA CONTROLS & HUD (TOP RIGHT) ── */}
            <div
              className="no-pan"
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "5px",
                zIndex: 25,
                backgroundColor: "rgba(10, 16, 32, 0.92)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                borderRadius: "10px",
                padding: "6px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.6)",
              }}
            >
              {/* Zoom % Readout */}
              <div
                style={{
                  fontSize: "0.62rem",
                  fontWeight: "900",
                  color: "#38bdf8",
                  fontFamily: "monospace",
                  backgroundColor: "rgba(2, 132, 199, 0.18)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  textAlign: "center",
                  width: "100%",
                }}
                title="Active Zoom Scale"
              >
                {Math.round(zoomLevel * 100)}%
              </div>

              {/* Zoom In & Out */}
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={handleZoomIn}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Zoom In (Scroll wheel up)"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={handleZoomOut}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Zoom Out (Scroll wheel down)"
                >
                  <ZoomOut size={14} />
                </button>
              </div>

              {/* D-Pad Pan Navigation Controls */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 22px)",
                  gridTemplateRows: "repeat(3, 22px)",
                  gap: "2px",
                  marginTop: "2px",
                }}
              >
                <div />
                <button
                  onClick={() => handlePan(0, -70)}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#94a3b8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                  title="Pan Up"
                >
                  <ChevronUp size={13} />
                </button>
                <div />

                <button
                  onClick={() => handlePan(-70, 0)}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#94a3b8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                  title="Pan Left"
                >
                  <ChevronLeft size={13} />
                </button>

                <button
                  onClick={handleResetView}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(2, 132, 199, 0.25)",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    color: "#38bdf8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                  title="Reset View & Pan (Centering)"
                >
                  <RefreshCw size={11} />
                </button>

                <button
                  onClick={() => handlePan(70, 0)}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#94a3b8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                  title="Pan Right"
                >
                  <ChevronRight size={13} />
                </button>

                <div />
                <button
                  onClick={() => handlePan(0, 70)}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#94a3b8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                  title="Pan Down"
                >
                  <ChevronDown size={13} />
                </button>
                <div />
              </div>
            </div>

            {/* ── FLOATING BOTTOM CONTROLS HINT PILL ── */}
            <div
              className="no-pan"
              style={{
                position: "absolute",
                bottom: "14px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(9, 17, 34, 0.88)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(56, 189, 248, 0.28)",
                borderRadius: "20px",
                padding: "4px 14px",
                fontSize: "0.66rem",
                color: "#cbd5e1",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                zIndex: 20,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              <span>🖱️ <strong>Drag</strong> to Pan</span>
              <span style={{ color: "#475569" }}>•</span>
              <span>📜 <strong>Scroll Wheel</strong> to Zoom</span>
              <span style={{ color: "#475569" }}>•</span>
              <span>🔍 <strong>{Math.round(zoomLevel * 100)}%</strong> Zoom</span>
              <span style={{ color: "#475569" }}>•</span>
              <span>📍 <strong>Click Pins</strong> for Telemetry</span>
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
              {/* Incident 1: Landslide NH-10 (Sikkim / Teesta) */}
              <div
                onClick={() => {
                  setSelectedIncident(1);
                  const z = INDIA_RISK_ZONES.find((x) => x.id === "nh10_sikkim");
                  if (z) {
                    setSelectedRegion("ner");
                    setActiveZone(z);
                    setInspectedZone(z);
                  }
                }}
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
                    <span style={{ fontSize: "0.88rem", fontWeight: "800", color: "#ffffff" }}>
                      Landslide — NH-10
                    </span>
                    <span
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                        fontSize: "0.72rem",
                        fontWeight: "900",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        letterSpacing: "0.06em",
                        boxShadow: "0 0 10px rgba(220, 38, 38, 0.45)",
                      }}
                    >
                      CRITICAL
                    </span>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>

                <div style={{ fontSize: "0.74rem", color: "#e2e8f0", marginTop: "4px", fontWeight: "500" }}>
                  📍 Teesta Basin, Sikkim / North Bengal
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    fontSize: "0.74rem",
                    color: "#f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>👥 <strong>781</strong> exposed</span>
                    <span style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>🏘️ <strong>4</strong> villages</span>
                    <span style={{ backgroundColor: "rgba(220, 38, 38, 0.25)", color: "#fca5a5", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(239, 68, 68, 0.4)", fontWeight: "700" }}>🛣️ NH-10 Blocked</span>
                  </div>
                  <div style={{ color: "#ef4444", fontWeight: "900", fontSize: "0.76rem" }}>
                    ⏱️ ETA 08 min
                  </div>
                </div>
              </div>

              {/* Incident 2: Flood Brahmaputra Kaziranga (Assam) */}
              <div
                onClick={() => {
                  setSelectedIncident(2);
                  const z = INDIA_RISK_ZONES.find((x) => x.id === "brahmaputra_assam");
                  if (z) {
                    setSelectedRegion("ner");
                    setActiveZone(z);
                    setInspectedZone(z);
                  }
                }}
                style={{
                  backgroundColor: "rgba(225, 29, 72, 0.08)",
                  border: `1.5px solid ${selectedIncident === 2 ? "#ef4444" : "rgba(239, 68, 68, 0.35)"}`,
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer",
                  boxShadow: selectedIncident === 2 ? "0 0 16px rgba(225, 29, 72, 0.25)" : "none",
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
                      2
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: "800", color: "#ffffff" }}>
                      Flood — Brahmaputra Basin
                    </span>
                    <span
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                        fontSize: "0.72rem",
                        fontWeight: "900",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        letterSpacing: "0.06em",
                        boxShadow: "0 0 10px rgba(220, 38, 38, 0.45)",
                      }}
                    >
                      CRITICAL
                    </span>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>

                <div style={{ fontSize: "0.74rem", color: "#e2e8f0", marginTop: "4px", fontWeight: "500" }}>
                  📍 Kaziranga & Majuli, Assam
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    fontSize: "0.74rem",
                    color: "#f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>👥 <strong>1,395</strong> exposed</span>
                    <span style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>🏠 <strong>2</strong> shelters</span>
                    <span style={{ backgroundColor: "rgba(220, 38, 38, 0.25)", color: "#fca5a5", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(239, 68, 68, 0.4)", fontWeight: "700" }}>🛣️ NH-715 Submerged</span>
                  </div>
                  <div style={{ color: "#ef4444", fontWeight: "900", fontSize: "0.76rem" }}>
                    ⏱️ ETA 15 min
                  </div>
                </div>
              </div>

              {/* Incident 3: Tawang-Sela Pass Landslide (Arunachal) */}
              <div
                onClick={() => {
                  setSelectedIncident(3);
                  const z = INDIA_RISK_ZONES.find((x) => x.id === "nh13_tawang");
                  if (z) {
                    setSelectedRegion("ner");
                    setActiveZone(z);
                    setInspectedZone(z);
                  }
                }}
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  border: `1.5px solid ${selectedIncident === 3 ? "#f59e0b" : "rgba(245, 158, 11, 0.35)"}`,
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer",
                  boxShadow: selectedIncident === 3 ? "0 0 16px rgba(245, 158, 11, 0.25)" : "none",
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
                      3
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: "800", color: "#ffffff" }}>
                      Debris Avalanche — NH-13
                    </span>
                    <span
                      style={{
                        backgroundColor: "#d97706",
                        color: "#ffffff",
                        fontSize: "0.72rem",
                        fontWeight: "900",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        letterSpacing: "0.06em",
                        boxShadow: "0 0 10px rgba(217, 119, 6, 0.45)",
                      }}
                    >
                      HIGH
                    </span>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>

                <div style={{ fontSize: "0.74rem", color: "#e2e8f0", marginTop: "4px", fontWeight: "500" }}>
                  📍 Tawang-Sela Pass, Arunachal Pradesh
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    fontSize: "0.74rem",
                    color: "#f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>👥 <strong>480</strong> exposed</span>
                    <span style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>🏠 <strong>1</strong> base shelter</span>
                    <span style={{ backgroundColor: "rgba(217, 119, 6, 0.25)", color: "#fde68a", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(245, 158, 11, 0.4)", fontWeight: "700" }}>🛣️ NH-13 Blocked</span>
                  </div>
                  <div style={{ color: "#f59e0b", fontWeight: "900", fontSize: "0.76rem" }}>
                    ⏱️ ETA 22 min
                  </div>
                </div>
              </div>

              {/* Incident 4: Wayanad Debris Flow (Kerala) */}
              <div
                onClick={() => {
                  setSelectedIncident(4);
                  const z = INDIA_RISK_ZONES.find((x) => x.id === "nh766_wayanad");
                  if (z) {
                    setSelectedRegion("south");
                    setActiveZone(z);
                    setInspectedZone(z);
                  }
                }}
                style={{
                  backgroundColor: "rgba(225, 29, 72, 0.08)",
                  border: `1.5px solid ${selectedIncident === 4 ? "#ef4444" : "rgba(239, 68, 68, 0.35)"}`,
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer",
                  boxShadow: selectedIncident === 4 ? "0 0 16px rgba(225, 29, 72, 0.25)" : "none",
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
                      4
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: "800", color: "#ffffff" }}>
                      Debris Flow — NH-766
                    </span>
                    <span
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                        fontSize: "0.72rem",
                        fontWeight: "900",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        letterSpacing: "0.06em",
                        boxShadow: "0 0 10px rgba(220, 38, 38, 0.45)",
                      }}
                    >
                      CRITICAL
                    </span>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>

                <div style={{ fontSize: "0.74rem", color: "#e2e8f0", marginTop: "4px", fontWeight: "500" }}>
                  📍 Chooralmala-Meppadi, Kerala
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    fontSize: "0.74rem",
                    color: "#f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>👥 <strong>1,350</strong> exposed</span>
                    <span style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>🏠 <strong>1</strong> hub</span>
                    <span style={{ backgroundColor: "rgba(14, 165, 233, 0.25)", color: "#7dd3fc", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(56, 189, 248, 0.4)", fontWeight: "700" }}>🛣️ Bailey Bridge Ops</span>
                  </div>
                  <div style={{ color: "#ef4444", fontWeight: "900", fontSize: "0.76rem" }}>
                    ⏱️ ETA 06 min
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
              <div style={{ fontSize: "0.72rem", color: "#cbd5e1", marginTop: "4px", fontWeight: "600" }}>Landslide Risk</div>
              <div
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: "0.74rem",
                  fontWeight: "900",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  marginTop: "4px",
                  letterSpacing: "0.06em",
                  boxShadow: "0 0 10px rgba(220, 38, 38, 0.5)",
                  display: "inline-block",
                }}
              >
                CRITICAL
              </div>
              <div style={{ fontSize: "0.62rem", color: "#94a3b8", marginTop: "3px", fontWeight: "600" }}>High Confidence</div>
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