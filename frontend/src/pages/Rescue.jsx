import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Shield,
  Home,
  Users,
  CheckCircle2,
  Truck,
  MapPin,
  Compass,
  Layers,
  Search,
  PhoneCall,
  Navigation,
  ExternalLink,
  AlertTriangle,
  Radio,
  Crosshair,
  RefreshCw,
  X,
  Activity,
  Filter,
  ChevronRight,
  Droplets,
  Zap,
  Clock
} from "lucide-react";
import { fetchShelters } from "../services/disasterService";
import {
  INDIA_MAP_OUTLINE_PATH,
  INDIA_REGION_PATHS,
  REGION_VIEWPORTS
} from "../Data/indiaRiskZones";

// Helper: Calculate distance in km between two lat/lng coordinates (Haversine)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

// Convert real geographic GPS coordinates (Lat/Lng) to SVG coordinate space (0 0 1000 680)
function geoToSvgCoords(lat, lng) {
  if (!lat || !lng) return { x: 500, y: 340 };
  // Longitude range: 68.0°E (West Gujarat) to 97.5°E (East Arunachal) -> 175 to 870
  // Latitude range: 37.0°N (North Kashmir) to 8.0°N (South Kanyakumari) -> 35 to 650
  const x = 175 + ((lng - 68.0) / (97.5 - 68.0)) * 695;
  const y = 35 + ((37.0 - lat) / (37.0 - 8.0)) * 615;

  return {
    x: Math.max(60, Math.min(940, Math.round(x))),
    y: Math.max(40, Math.min(650, Math.round(y)))
  };
}

export default function Rescue() {
  const navigate = useNavigate();

  // ─── DATA STATE ──────────────────────────────────────────────────────────
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // ─── FILTER STATE ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFacility, setSelectedFacility] = useState("All");

  // ─── MAP INTERACTION STATE ───────────────────────────────────────────────
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapLayers, setMapLayers] = useState({
    openShelters: true,
    hospitals: true,
    evacRoutes: true,
    capacityBadges: true,
    satellite: true,
  });
  const [layersOpen, setLayersOpen] = useState(false);

  // Ref for auto-scrolling the right-hand list when a pin is clicked
  const rightListRef = useRef(null);

  // Load shelter/rescue center dataset on mount
  useEffect(() => {
    loadData(userCoords);
  }, []);

  const loadData = async (coords = null) => {
    setLoading(true);
    try {
      const data = await fetchShelters(coords);
      setShelters(data || []);
      if (data && data.length > 0 && !selectedCenter) {
        setSelectedCenter(data[0]);
      }
    } catch (err) {
      console.error("Error loading rescue centers:", err);
    } finally {
      setLoading(false);
    }
  };

  // GPS Geolocation Detection
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        loadData(coords);
        setGpsLoading(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        alert("Location access denied or unavailable.");
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Extract unique shelter types and facilities dynamically
  const shelterTypes = ["All", "Cyclone Shelter", "Hospital", "Relief Camp", "Evacuation Center", "Community Shelter"];

  // Filtered List
  const filteredShelters = useMemo(() => {
    return shelters.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(q) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.state && s.state.toLowerCase().includes(q));

      const matchType =
        selectedType === "All" ||
        (s.type && s.type.toLowerCase().includes(selectedType.toLowerCase())) ||
        s.name.toLowerCase().includes(selectedType.toLowerCase());

      const matchStatus =
        selectedStatus === "All" ||
        (s.status && s.status.toLowerCase() === selectedStatus.toLowerCase());

      const matchFacility =
        selectedFacility === "All" ||
        (s.facilities &&
          s.facilities.some((f) =>
            f.toLowerCase().includes(selectedFacility.toLowerCase())
          ));

      return matchSearch && matchType && matchStatus && matchFacility;
    });
  }, [shelters, search, selectedType, selectedStatus, selectedFacility]);

  // Aggregate Metrics for Top KPI Cards
  const totalCapacity = useMemo(() => shelters.reduce((acc, s) => acc + (s.capacity || 0), 0), [shelters]);
  const totalOccupancy = useMemo(() => shelters.reduce((acc, s) => acc + (s.currentOccupancy || 0), 0), [shelters]);
  const availableBeds = Math.max(0, totalCapacity - totalOccupancy);
  const occupancyPercent = totalCapacity > 0 ? ((totalOccupancy / totalCapacity) * 100).toFixed(0) : 0;
  const openCentersCount = shelters.filter((s) => (s.status || "open").toLowerCase() === "open").length;

  const nearestDistance = useMemo(() => {
    if (!userCoords || shelters.length === 0) return null;
    let min = Infinity;
    shelters.forEach((s) => {
      const d = s.distanceKm != null ? s.distanceKm : getDistanceKm(userCoords.lat, userCoords.lng, s.lat, s.lng);
      if (d != null && d < min) min = d;
    });
    return min !== Infinity ? min : null;
  }, [userCoords, shelters]);

  // ─── DYNAMIC MAP VIEWPORT & CAMERA COMPUTATION ────────────────────────────
  const currentViewport = REGION_VIEWPORTS[selectedRegion] || REGION_VIEWPORTS.all;

  const getActiveViewBox = () => {
    if (selectedRegion === "all" && zoomLevel === 1) return "0 0 1000 680";
    if (selectedRegion === "ner" && zoomLevel === 1) return "540 120 360 360";
    if (selectedRegion === "himalayas" && zoomLevel === 1) return "260 30 260 190";
    if (selectedRegion === "south" && zoomLevel === 1) return "260 480 180 200";
    if (selectedRegion === "east" && zoomLevel === 1) return "440 330 190 160";

    const parts = (currentViewport.viewBox || "0 0 1000 680").split(" ").map(Number);
    const [x, y, w, h] = parts;
    const factor = zoomLevel;
    const newW = w / factor;
    const newH = h / factor;
    const newX = x + (w - newW) / 2;
    const newY = y + (h - newH) / 2;
    return `${newX} ${newY} ${newW} ${newH}`;
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 3.2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 1));

  const handleResetView = () => {
    setSelectedRegion("all");
    setZoomLevel(1);
    if (shelters.length > 0) setSelectedCenter(shelters[0]);
  };

  // Center Selection Handler (syncs Left Map with Right List)
  const handleSelectCenter = (center) => {
    setSelectedCenter(center);
    // If shelter belongs to NER, switch to NER view if not in all view
    if (center.region === "ner" && selectedRegion !== "ner" && selectedRegion !== "all") {
      setSelectedRegion("ner");
    }
    // Scroll right list to item
    const el = document.getElementById(`center-card-${center.id || center._id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", minHeight: "100%", paddingBottom: "30px" }}>

      {/* ── 1. HEADER & LIVE SYNC RIBBON ────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "900", margin: 0, color: "#f8fafc", letterSpacing: "-0.02em" }}>
              📍 Rescue Center & Emergency Shelters
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                backgroundColor: "rgba(16, 185, 129, 0.18)",
                color: "#4ade80",
                border: "1px solid rgba(16, 185, 129, 0.45)",
                borderRadius: "999px",
                fontSize: "0.62rem",
                fontWeight: "900",
                padding: "2px 8px",
                letterSpacing: "0.05em",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
              {shelters.length} SITES ACTIVE
            </span>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: "4px 0 0 0" }}>
            Unified real-time evacuation locator, shelter bed occupancy tracker & emergency medical dispatch.
          </p>
        </div>

        {/* Action button: GPS Detect */}
        <button
          onClick={detectLocation}
          disabled={gpsLoading}
          style={{
            padding: "8px 15px",
            backgroundColor: userCoords ? "rgba(2, 132, 199, 0.25)" : "#0f172a",
            border: `1.5px solid ${userCoords ? "#38bdf8" : "rgba(56, 189, 248, 0.3)"}`,
            borderRadius: "8px",
            color: userCoords ? "#38bdf8" : "#94a3b8",
            fontWeight: "700",
            fontSize: "0.76rem",
            cursor: gpsLoading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            boxShadow: userCoords ? "0 0 16px rgba(56, 189, 248, 0.25)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          <MapPin size={14} color={userCoords ? "#38bdf8" : "#94a3b8"} />
          <span>{gpsLoading ? "Triangulating GPS..." : userCoords ? `GPS Locked (${userCoords.lat.toFixed(2)}°, ${userCoords.lng.toFixed(2)}°)` : "Detect My Location"}</span>
        </button>
      </div>

      {/* ── 2. TOP METRIC KPI CARDS (5 KPI CARDS AS LIKE DASHBOARD) ─────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
        }}
      >
        {/* Card 1: Active Centers */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "14px",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            background: "linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)",
            padding: "15px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(2, 132, 199, 0.2)",
              border: "1px solid rgba(56, 189, 248, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38bdf8",
              flexShrink: 0,
            }}
          >
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600" }}>Total Rescue Centers</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.2" }}>
              {shelters.length}
            </div>
            <div style={{ fontSize: "0.64rem", color: "#4ade80", fontWeight: "700", marginTop: "2px" }}>
              {openCentersCount} Open Facilities
            </div>
          </div>
        </div>

        {/* Card 2: Total Bed Capacity */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "14px",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)",
            padding: "15px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
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
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600" }}>Total Bed Capacity</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.2" }}>
              {totalCapacity.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.64rem", color: "#fde047", fontWeight: "700", marginTop: "2px" }}>
              {totalOccupancy.toLocaleString()} Occupied
            </div>
          </div>
        </div>

        {/* Card 3: Available Beds */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "14px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)",
            padding: "15px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4ade80",
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600" }}>Available Free Beds</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#4ade80", lineHeight: "1.2" }}>
              {availableBeds.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.64rem", color: "#94a3b8", marginTop: "2px" }}>
              {occupancyPercent}% Overall Occupancy
            </div>
          </div>
        </div>

        {/* Card 4: Medical / Rescue Pods */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "14px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)",
            padding: "15px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f87171",
              flexShrink: 0,
            }}
          >
            <Truck size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600" }}>Response Vehicles</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.2" }}>
              24 Units
            </div>
            <div style={{ fontSize: "0.64rem", color: "#38bdf8", fontWeight: "700", marginTop: "2px" }}>
              14 Ambulances · 10 Boats
            </div>
          </div>
        </div>

        {/* Card 5: GPS Proximity */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "14px",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)",
            padding: "15px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              border: "1px solid rgba(139, 92, 246, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c084fc",
              flexShrink: 0,
            }}
          >
            <Compass size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600" }}>Nearest Center</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.2" }}>
              {nearestDistance != null ? `${nearestDistance} km` : "GPS Idle"}
            </div>
            <div style={{ fontSize: "0.64rem", color: userCoords ? "#38bdf8" : "#94a3b8", marginTop: "2px" }}>
              {userCoords ? "Real-Time Proximity" : "Click Detect GPS"}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN SECTION: MAP ON LEFT & INFO SCROLLBAR ON RIGHT ───────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(370px, 1fr)",
          gap: "16px",
          alignItems: "start",
        }}
      >
        {/* ────────────── LEFT: LIVE RESCUE CENTERS MAP (DASHBOARD FRAME) ────────────── */}
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
              backgroundColor: "rgba(10, 18, 36, 0.75)",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.96rem", fontWeight: "800", color: "#f8fafc" }}>
                Live Rescue Centers & Shelters Map
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  color: "#4ade80",
                  border: "1px solid rgba(16, 185, 129, 0.45)",
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
                    backgroundColor: "#22c55e",
                    boxShadow: "0 0 8px #22c55e",
                  }}
                />
                LIVE GIS
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
              Plotted: <strong style={{ color: "#38bdf8" }}>{filteredShelters.length} Facilities</strong>
            </div>
          </div>

          {/* Region Quick-Jump Toolbar (Same as Dashboard) */}
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
                      boxShadow: isActive ? "0 0 12px rgba(56, 189, 248, 0.3)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>

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
              title="Reset View to Pan-India"
            >
              <RefreshCw size={10} />
              <span>Reset</span>
            </button>
          </div>

          {/* Active Center Intel Ribbon */}
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
              <span style={{ color: "#38bdf8", fontWeight: "800" }}>📍 Selected Facility:</span>
              <span style={{ fontWeight: "700", color: "#ffffff" }}>
                {selectedCenter?.name || "Click any pin on map or card on right to inspect"}
              </span>
              {selectedCenter && (
                <>
                  <span style={{ color: "#64748b" }}>·</span>
                  <span style={{ color: "#4ade80", fontWeight: "700" }}>
                    {selectedCenter.capacity - selectedCenter.currentOccupancy} Beds Free
                  </span>
                  <span style={{ color: "#64748b" }}>·</span>
                  <span style={{ color: "#38bdf8" }}>{selectedCenter.city}, {selectedCenter.state}</span>
                </>
              )}
            </div>
            <span style={{ color: "#94a3b8", fontSize: "0.62rem" }}>
              Interactive Telemetry & Real-Time Bed Availability
            </span>
          </div>

          {/* Map Viewport Canvas with Topo Imagery & Vector SVG Pins */}
          <div
            style={{
              position: "relative",
              height: "580px",
              width: "100%",
              overflow: "hidden",
              backgroundColor: "#061019",
              backgroundImage: `
                radial-gradient(ellipse at 70% 35%, rgba(2, 132, 199, 0.2) 0%, transparent 45%),
                radial-gradient(ellipse at 35% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 35% 75%, rgba(245, 158, 11, 0.12) 0%, transparent 35%),
                linear-gradient(135deg, #07151e 0%, #05131b 40%, #030b14 100%)
              `,
            }}
          >
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                transition: "viewBox 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              viewBox={getActiveViewBox()}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="rescueGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(56, 189, 248, 0.04)" strokeWidth="1" />
                </pattern>
                {/* Glow Filter for Selected Shelter */}
                <filter id="shelterGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Background */}
              <rect x="0" y="0" width="1000" height="680" fill="url(#rescueGrid)" />

              {/* India Geographical Landmass */}
              <path
                d={INDIA_MAP_OUTLINE_PATH}
                fill="rgba(11, 23, 38, 0.88)"
                stroke={selectedRegion === "ner" ? "rgba(56, 189, 248, 0.3)" : "rgba(56, 189, 248, 0.55)"}
                strokeWidth={selectedRegion === "all" ? 1.6 : 1}
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* River and Mountain System Lines */}
              {INDIA_REGION_PATHS.map((item) => (
                <path
                  key={item.id}
                  d={item.d}
                  fill="none"
                  stroke={item.stroke}
                  strokeWidth={item.width || "1.5"}
                  strokeDasharray={item.dash !== "none" ? item.dash : undefined}
                  strokeLinecap="round"
                />
              ))}

              {/* Prominent NER Region Boundary Highlight */}
              <polygon
                points="575,200 660,140 880,140 880,330 790,450 690,400 575,280"
                fill={selectedRegion === "ner" ? "rgba(2, 132, 199, 0.08)" : "rgba(56, 189, 248, 0.03)"}
                stroke={selectedRegion === "ner" ? "rgba(56, 189, 248, 0.5)" : "rgba(56, 189, 248, 0.2)"}
                strokeWidth="1.2"
                strokeDasharray="4,4"
              />

              {/* Evacuation Route Vectors linking centers to roads */}
              {mapLayers.evacRoutes && filteredShelters.map((s, idx) => {
                const coords = geoToSvgCoords(s.lat, s.lng);
                return (
                  <line
                    key={`route-${idx}`}
                    x1={coords.x}
                    y1={coords.y}
                    x2={coords.x + (coords.x > 600 ? -25 : 25)}
                    y2={coords.y + 18}
                    stroke="rgba(56, 189, 248, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                );
              })}

              {/* ── PLOTTED RESCUE CENTERS & SHELTERS (PINS LIKE DASHBOARD) ── */}
              {filteredShelters.map((s) => {
                const coords = geoToSvgCoords(s.lat, s.lng);
                const isSelected = selectedCenter?.id === s.id || selectedCenter?._id === s._id;
                const isHospital = s.type?.toLowerCase().includes("hospital") || s.name.toLowerCase().includes("hospital");
                const isFull = s.currentOccupancy >= s.capacity;
                const isNearFull = !isFull && (s.currentOccupancy / s.capacity) >= 0.75;

                const pinColor = isFull ? "#ef4444" : isNearFull ? "#f59e0b" : isHospital ? "#38bdf8" : "#22c55e";
                const pinBg = isFull ? "rgba(239, 68, 68, 0.95)" : isNearFull ? "rgba(245, 158, 11, 0.95)" : isHospital ? "rgba(2, 132, 199, 0.95)" : "rgba(22, 163, 74, 0.95)";
                const freeBeds = Math.max(0, (s.capacity || 0) - (s.currentOccupancy || 0));

                const boxW = selectedRegion === "all" ? 140 : 110;
                const boxH = selectedRegion === "all" ? 36 : 28;
                const fontSize = selectedRegion === "all" ? "9.5px" : "7px";

                return (
                  <g key={`shelter-marker-${s.id || s._id}`}>
                    {/* Selected Pulsing Radar Halo */}
                    {isSelected && (
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={selectedRegion === "all" ? 22 : 16}
                        fill="none"
                        stroke={pinColor}
                        strokeWidth="2.5"
                        filter="url(#shelterGlow)"
                      />
                    )}

                    {/* Interactive Pin Element */}
                    <foreignObject
                      x={coords.x - boxW / 2}
                      y={coords.y - boxH - (selectedRegion === "all" ? 8 : 4)}
                      width={boxW}
                      height={boxH + 14}
                      style={{ overflow: "visible", pointerEvents: "auto" }}
                    >
                      <div
                        onClick={() => handleSelectCenter(s)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          transform: isSelected ? "scale(1.15)" : "scale(1)",
                          transition: "transform 0.18s ease",
                        }}
                        title={`${s.name} (${freeBeds} beds available)`}
                      >
                        <div
                          style={{
                            backgroundColor: pinBg,
                            color: "#ffffff",
                            padding: selectedRegion === "all" ? "3px 8px" : "2px 6px",
                            borderRadius: "7px",
                            fontSize: fontSize,
                            fontWeight: "800",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            boxShadow: isSelected ? `0 0 20px ${pinColor}` : "0 2px 8px rgba(0,0,0,0.7)",
                            border: isSelected ? "1.8px solid #ffffff" : "1px solid rgba(255,255,255,0.6)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span>{isHospital ? "🏥" : "⛺"}</span>
                          <span>{s.city || s.name.substring(0, 14)}</span>
                          <strong style={{ color: "#ffffff", backgroundColor: "rgba(0,0,0,0.25)", padding: "1px 4px", borderRadius: "3px" }}>
                            {freeBeds}
                          </strong>
                        </div>

                        {/* Triangle Pointer */}
                        <div
                          style={{
                            width: selectedRegion === "all" ? "8px" : "6px",
                            height: selectedRegion === "all" ? "8px" : "6px",
                            backgroundColor: pinColor,
                            transform: "rotate(45deg) translateY(-3px)",
                          }}
                        />
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* User Current GPS Location Marker */}
              {userCoords && (
                (() => {
                  const uCoords = geoToSvgCoords(userCoords.lat, userCoords.lng);
                  return (
                    <g key="user-gps-marker">
                      <circle cx={uCoords.x} cy={uCoords.y} r="18" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
                      <circle cx={uCoords.x} cy={uCoords.y} r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                      <foreignObject x={uCoords.x - 45} y={uCoords.y - 30} width="90" height="22" style={{ overflow: "visible", pointerEvents: "none" }}>
                        <div style={{ backgroundColor: "#0284c7", color: "#ffffff", fontSize: "8px", fontWeight: "900", padding: "1px 6px", borderRadius: "4px", textAlign: "center", whiteSpace: "nowrap" }}>
                          📍 YOU ARE HERE
                        </div>
                      </foreignObject>
                    </g>
                  );
                })()
              )}
            </svg>

            {/* ── FLOATING TACTICAL HUD DRAWER (SELECTED RESCUE CENTER) ── */}
            {selectedCenter && (
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "115px",
                  right: "175px",
                  backgroundColor: "rgba(9, 17, 34, 0.95)",
                  backdropFilter: "blur(14px)",
                  border: "1.5px solid rgba(56, 189, 248, 0.4)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(56, 189, 248, 0.25)",
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
                        backgroundColor: selectedCenter.status === "open" ? "#16a34a" : "#ea580c",
                        color: "#ffffff",
                        fontSize: "0.62rem",
                        fontWeight: "900",
                        padding: "2px 7px",
                        borderRadius: "4px",
                      }}
                    >
                      {selectedCenter.status ? selectedCenter.status.toUpperCase() : "OPEN"}
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: "900", color: "#ffffff" }}>
                      {selectedCenter.name}
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
                      {selectedCenter.type || "Rescue Shelter"}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedCenter(null)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Dismiss HUD"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* HUD Metrics & Capacity Bar */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "10px",
                    fontSize: "0.68rem",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  {/* Col 1: Location & Coordinates */}
                  <div>
                    <div style={{ color: "#94a3b8", fontWeight: "700" }}>📍 Location & Address:</div>
                    <div style={{ color: "#cbd5e1", marginTop: "2px" }}>
                      {selectedCenter.address || `${selectedCenter.city}, ${selectedCenter.state}`}
                    </div>
                    {userCoords && (
                      <div style={{ color: "#38bdf8", fontWeight: "800", marginTop: "3px" }}>
                        Distance: {getDistanceKm(userCoords.lat, userCoords.lng, selectedCenter.lat, selectedCenter.lng)} km away
                      </div>
                    )}
                  </div>

                  {/* Col 2: Bed Capacity & Occupancy Bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontWeight: "700" }}>
                      <span>Bed Availability:</span>
                      <span style={{ color: "#4ade80", fontWeight: "800" }}>
                        {selectedCenter.capacity - selectedCenter.currentOccupancy} free
                      </span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: "999px",
                        overflow: "hidden",
                        marginTop: "5px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(100, ((selectedCenter.currentOccupancy || 0) / (selectedCenter.capacity || 1)) * 100)}%`,
                          backgroundColor:
                            selectedCenter.currentOccupancy >= selectedCenter.capacity ? "#ef4444" : "#22c55e",
                          borderRadius: "999px",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "#64748b", marginTop: "2px" }}>
                      <span>{selectedCenter.currentOccupancy} Occupied</span>
                      <span>Total: {selectedCenter.capacity}</span>
                    </div>
                  </div>

                  {/* Col 3: Key Facilities Available */}
                  <div>
                    <div style={{ color: "#94a3b8", fontWeight: "700", marginBottom: "3px" }}>Equipped Facilities:</div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {selectedCenter.facilities?.slice(0, 3).map((f, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: "rgba(2, 132, 199, 0.2)",
                            color: "#38bdf8",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            fontSize: "0.62rem",
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* HUD Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {selectedCenter.phone && (
                      <a
                        href={`tel:${selectedCenter.phone}`}
                        style={{
                          backgroundColor: "#16a34a",
                          color: "#ffffff",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          fontSize: "0.68rem",
                          fontWeight: "800",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          textDecoration: "none",
                        }}
                      >
                        <PhoneCall size={12} />
                        <span>Call {selectedCenter.phone}</span>
                      </a>
                    )}
                    <Link
                      to={`/map?lat=${selectedCenter.lat}&lng=${selectedCenter.lng}&name=${encodeURIComponent(selectedCenter.name)}`}
                      style={{
                        backgroundColor: "rgba(2, 132, 199, 0.25)",
                        border: "1px solid rgba(56, 189, 248, 0.5)",
                        color: "#38bdf8",
                        padding: "5px 12px",
                        borderRadius: "6px",
                        fontSize: "0.68rem",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        textDecoration: "none",
                      }}
                    >
                      <Navigation size={12} />
                      <span>Navigate Route in GIS Map</span>
                    </Link>
                  </div>
                  <span style={{ fontSize: "0.64rem", color: "#94a3b8" }}>
                    ID: {selectedCenter.id || selectedCenter._id}
                  </span>
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
                    { key: "openShelters", label: "Open Shelters" },
                    { key: "hospitals", label: "Hospitals & Trauma" },
                    { key: "evacRoutes", label: "Evacuation Lines" },
                    { key: "capacityBadges", label: "Capacity Badges" },
                    { key: "satellite", label: "Satellite Base" },
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
                <path
                  d="M 32,2 L 40,8 L 47,18 L 58,23 L 60,20 L 68,16 L 85,16 L 87,22 L 82,33 L 78,42 L 72,40 L 65,33 L 57,36 L 52,40 L 46,48 L 40,57 L 36,65 L 34,60 L 29,50 L 25,38 L 17,37 L 16,33 L 21,21 L 26,12 Z"
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="#0284c7"
                  strokeWidth="1.2"
                />
                <rect
                  x={selectedRegion === "ner" ? 58 : selectedRegion === "himalayas" ? 28 : selectedRegion === "south" ? 28 : selectedRegion === "east" ? 48 : 18}
                  y={selectedRegion === "ner" ? 14 : selectedRegion === "himalayas" ? 4 : selectedRegion === "south" ? 48 : selectedRegion === "east" ? 33 : 4}
                  width={selectedRegion === "all" ? 68 : 30}
                  height={selectedRegion === "all" ? 60 : 26}
                  fill="rgba(56, 189, 248, 0.35)"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  rx="2"
                />
              </svg>
              <span style={{ fontSize: "0.52rem", color: "#38bdf8", fontWeight: "800", textTransform: "uppercase" }}>
                {selectedRegion}
              </span>
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
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
                <span>Open Shelter (Beds Free)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
                <span>Hospital & Trauma Wing</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                <span>Near Capacity ({">"}75%)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span>Full / Restricted</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "12px", height: "2px", backgroundColor: "#38bdf8", display: "inline-block" }} />
                <span>Evacuation Link</span>
              </div>
              {userCoords && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#38bdf8" }}>📍</span>
                  <span>Your GPS Location</span>
                </div>
              )}
            </div>

            {/* ── ZOOM CONTROLS (TOP RIGHT) ── */}
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
                onClick={handleZoomIn}
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
                title="Zoom In"
              >
                +
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
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={handleResetView}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  color: "#38bdf8",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Reset Map to Pan-India"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* ────────────── RIGHT: INFO BAR WITH SCROLLING OPTION ────────────── */}
        <div
          style={{
            backgroundColor: "#0b1222",
            borderRadius: "16px",
            border: "1px solid rgba(56, 189, 248, 0.18)",
            padding: "16px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(56, 189, 248, 0.12)", paddingBottom: "10px" }}>
            <div>
              <div style={{ fontSize: "0.94rem", fontWeight: "800", color: "#ffffff" }}>
                Facilities Directory
              </div>
              <div style={{ fontSize: "0.68rem", color: "#38bdf8", fontWeight: "700" }}>
                {filteredShelters.length} Facilities Operational
              </div>
            </div>

            <span
              style={{
                fontSize: "0.64rem",
                color: "#94a3b8",
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              Scroll for all sites ↕
            </span>
          </div>

          {/* Search Input */}
          <div style={{ position: "relative" }}>
            <Search size={14} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by facility name, city, state..."
              style={{
                width: "100%",
                padding: "8px 10px 8px 32px",
                backgroundColor: "#070e1c",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.75rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Filter Chips (Facility Types) */}
          <div style={{ display: "flex", gap: "5px", overflowX: "auto", paddingBottom: "3px" }}>
            {shelterTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                style={{
                  backgroundColor: selectedType === t ? "rgba(2, 132, 199, 0.35)" : "rgba(15, 23, 42, 0.8)",
                  border: `1px solid ${selectedType === t ? "#38bdf8" : "rgba(255, 255, 255, 0.1)"}`,
                  color: selectedType === t ? "#38bdf8" : "#94a3b8",
                  padding: "3px 9px",
                  borderRadius: "6px",
                  fontSize: "0.66rem",
                  fontWeight: selectedType === t ? "800" : "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* SCROLLABLE CARDS CONTAINER */}
          <div
            ref={rightListRef}
            style={{
              maxHeight: "560px",
              overflowY: "auto",
              paddingRight: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: "0.8rem" }}>
                <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "8px" }} />
                <div>Synchronizing Emergency Facilities...</div>
              </div>
            ) : filteredShelters.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: "0.8rem" }}>
                No rescue facilities matched your criteria.
              </div>
            ) : (
              filteredShelters.map((s) => {
                const isSelected = selectedCenter?.id === s.id || selectedCenter?._id === s._id;
                const freeBeds = Math.max(0, (s.capacity || 0) - (s.currentOccupancy || 0));
                const isFull = s.currentOccupancy >= s.capacity;
                const isNearFull = !isFull && (s.currentOccupancy / s.capacity) >= 0.75;
                const isHospital = s.type?.toLowerCase().includes("hospital") || s.name.toLowerCase().includes("hospital");

                const statusColor = isFull ? "#ef4444" : isNearFull ? "#f59e0b" : "#22c55e";
                const statusText = isFull ? "FULL" : isNearFull ? "NEAR CAPACITY" : "OPEN";

                const dist = userCoords ? getDistanceKm(userCoords.lat, userCoords.lng, s.lat, s.lng) : s.distanceKm;

                return (
                  <div
                    key={s.id || s._id}
                    id={`center-card-${s.id || s._id}`}
                    onClick={() => handleSelectCenter(s)}
                    style={{
                      backgroundColor: isSelected ? "rgba(2, 132, 199, 0.14)" : "rgba(15, 23, 42, 0.8)",
                      border: `1.5px solid ${isSelected ? "#38bdf8" : "rgba(56, 189, 248, 0.16)"}`,
                      borderRadius: "12px",
                      padding: "12px",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 0 16px rgba(56, 189, 248, 0.25)" : "none",
                      transition: "all 0.16s ease",
                    }}
                  >
                    {/* Card Top Row: Name, Type, Status */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.86rem", fontWeight: "800", color: "#ffffff" }}>
                            {s.name}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: "2px" }}>
                          📍 {s.address ? s.address : `${s.city}, ${s.state}`}
                        </div>
                      </div>

                      <span
                        style={{
                          backgroundColor: `${statusColor}22`,
                          color: statusColor,
                          border: `1px solid ${statusColor}55`,
                          fontSize: "0.58rem",
                          fontWeight: "900",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {statusText}
                      </span>
                    </div>

                    {/* Occupancy & Free Beds Bar */}
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.66rem" }}>
                        <span style={{ color: "#94a3b8" }}>Capacity:</span>
                        <span style={{ color: "#4ade80", fontWeight: "800" }}>
                          {freeBeds} Free Beds ({s.currentOccupancy}/{s.capacity})
                        </span>
                      </div>
                      <div
                        style={{
                          height: "5px",
                          backgroundColor: "rgba(255,255,255,0.08)",
                          borderRadius: "999px",
                          overflow: "hidden",
                          marginTop: "4px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(100, ((s.currentOccupancy || 0) / (s.capacity || 1)) * 100)}%`,
                            backgroundColor: statusColor,
                            borderRadius: "999px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Key Facilities Badges */}
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                      {s.facilities?.slice(0, 3).map((f, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            color: "#cbd5e1",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            fontSize: "0.6rem",
                          }}
                        >
                          {f}
                        </span>
                      ))}
                      {s.facilities && s.facilities.length > 3 && (
                        <span style={{ color: "#64748b", fontSize: "0.6rem", alignSelf: "center" }}>
                          +{s.facilities.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "10px",
                        paddingTop: "8px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                        fontSize: "0.68rem",
                      }}
                    >
                      <div style={{ color: "#38bdf8", fontWeight: "800" }}>
                        {dist != null ? `📍 ${dist} km away` : "📍 India Grid"}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {s.phone && (
                          <a
                            href={`tel:${s.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              backgroundColor: "rgba(22, 163, 74, 0.2)",
                              color: "#4ade80",
                              border: "1px solid rgba(34, 197, 94, 0.4)",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              fontWeight: "700",
                            }}
                          >
                            <PhoneCall size={10} />
                            <span>Call</span>
                          </a>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCenter(s);
                          }}
                          style={{
                            backgroundColor: isSelected ? "#0284c7" : "rgba(2, 132, 199, 0.25)",
                            color: "#ffffff",
                            border: "1px solid rgba(56, 189, 248, 0.5)",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <Crosshair size={10} />
                          <span>Locate</span>
                        </button>

                        <Link
                          to={`/map?lat=${s.lat}&lng=${s.lng}&name=${encodeURIComponent(s.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.06)",
                            color: "#94a3b8",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <Navigation size={10} />
                          <span>Route</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}