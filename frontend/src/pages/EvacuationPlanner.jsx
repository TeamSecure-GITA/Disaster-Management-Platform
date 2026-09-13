import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createEvacuationPlan, fetchShelters } from "../services/disasterService";
import { startEmergencySiren, stopEmergencySiren } from "../utils/sirenAudio";
import OfflineCompassWidget, { calculateBearing, getCardinalDirection } from "../components/OfflineCompassWidget";

// Marker Icons
const userPinIcon = L.divIcon({
  className: "user-leaflet-marker",
  html: `<div style="
    background-color: #ef4444;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #ffffff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    font-size: 15px;
  ">🔴</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const shelterPinIcon = L.divIcon({
  className: "shelter-leaflet-marker",
  html: `<div style="
    background-color: #10b981;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #ffffff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    font-size: 16px;
  ">🏠</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

export default function EvacuationPlanner() {
  const [searchParams] = useSearchParams();
  const initialShelterName = searchParams.get("name") || "";

  const [disasterType, setDisasterType] = useState("Flood");
  const [transportMode, setTransportMode] = useState("driving");
  const [location, setLocation] = useState("");
  const [userCoords, setUserCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [plan, setPlan] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [sirenActive, setSirenActive] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  // Auto-stop siren if component unmounts
  useEffect(() => {
    return () => {
      stopEmergencySiren();
    };
  }, []);

  // Auto detect location on initial mount if available
  useEffect(() => {
    if (navigator.geolocation && !location) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          setLocation(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        },
        () => {
          // Fallback default city
          setLocation("Patia, Bhubaneswar, Odisha");
          setUserCoords({ lat: 20.3522, lng: 85.8193 });
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Detect GPS on button click
  const detectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocation(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        setGpsLoading(false);
      },
      () => {
        alert("Unable to fetch GPS position. Please enter your location manually.");
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Toggle Acoustic Emergency Siren
  const toggleSiren = () => {
    if (sirenActive) {
      stopEmergencySiren();
      setSirenActive(false);
    } else {
      startEmergencySiren();
      setSirenActive(true);
    }
  };

  // Dispatch Dual Online & Offline Notification
  const triggerDualNotification = async () => {
    const title = `🚨 CRITICAL PRE-DISASTER WARNING: You are in an UNSAFE ZONE!`;
    const body = `Immediate evacuation required for ${disasterType}. Proceed towards safe shelter: ${plan?.destination?.name || "Designated Relief Hub"}!`;

    if ("Notification" in window) {
      let permission = Notification.permission;
      if (permission !== "granted") {
        try {
          permission = await Notification.requestPermission();
        } catch {}
      }

      if (permission === "granted") {
        try {
          new Notification(title, {
            body,
            icon: "/pwa-192x192.png",
            badge: "/favicon.ico",
            tag: "unsafe-zone-evac",
            requireInteraction: true,
          });
          if (navigator.vibrate) {
            navigator.vibrate([500, 200, 500, 200, 500]);
          }
        } catch (e) {
          console.warn("Notification trigger error:", e);
        }
      }
    }

    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 5000);
  };

  // Generate Evacuation Plan
  const handleGeneratePlan = async (e) => {
    if (e) e.preventDefault();
    if (!location.trim()) {
      alert("Please enter your current location or click '📍 GPS'.");
      return;
    }

    setLoadingPlan(true);
    try {
      const generated = await createEvacuationPlan({
        currentLocation: location,
        disasterType,
        transportMode,
      });
      setPlan(generated);
      setCheckedItems({});

      // Trigger automatic dual pre-disaster notification on high-threat generation
      triggerDualNotification();
    } catch (err) {
      console.error("Error creating plan:", err);
      alert("Unable to generate plan. Please try again.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const toggleChecklist = (idx) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Share via WhatsApp
  const sharePlanOnWhatsApp = () => {
    if (!plan) return;
    const text = encodeURIComponent(
      `🚨 EMERGENCY EVACUATION PLAN:\n` +
      `Disaster: ${plan.disasterType}\n` +
      `Current Location: ${location}\n` +
      `Evacuating to: ${plan.destination.name}\n` +
      `Shelter Address: ${plan.destination.address}\n` +
      `Shelter Phone: ${plan.destination.contactNumber}\n` +
      `Distance: ${plan.estimatedTime.distanceKm} km (~${transportMode === "driving" ? plan.estimatedTime.drivingMinutes : plan.estimatedTime.walkingMinutes} mins)\n` +
      `Google Maps Route: ${plan.mapsUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // User coordinates for map
  const originLat = userCoords?.lat || 20.3522;
  const originLng = userCoords?.lng || 85.8193;

  const destLat = plan?.destination?.latitude || 20.2961;
  const destLng = plan?.destination?.longitude || 85.8245;

  const centerLat = (originLat + destLat) / 2;
  const centerLng = (originLng + destLng) / 2;

  const initialBearing = calculateBearing(originLat, originLng, destLat, destLng);
  const cardinalDir = getCardinalDirection(initialBearing);

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "10px 0" }}>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "2.2rem" }}>🧭</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "1.9rem", fontWeight: "800", margin: 0, color: "#f8fafc" }}>
                Smart Evacuation Planner & Unsafe Zone Radar
              </h1>
              <span
                style={{
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                }}
              >
                ● Pre-Disaster Early Warning
              </span>
            </div>
            <p style={{ color: "#94a3b8", marginTop: "4px", fontSize: "0.95rem" }}>
              Pre-disaster unsafe zone alerts, dual online/offline notifications, acoustic siren, and 100% offline gyro vector compass navigation.
            </p>
          </div>
        </div>
      </div>

      {/* ── CONTROLS & SETUP CARD ────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "24px",
          borderRadius: "14px",
          border: "1px solid #334155",
          marginBottom: "28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <form onSubmit={handleGeneratePlan}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "18px" }}>
            {/* Disaster Type */}
            <div>
              <label style={{ fontSize: "0.82rem", color: "#94a3b8", display: "block", marginBottom: "6px", fontWeight: "600" }}>
                🚨 Active Disaster Threat
              </label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "0.92rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value="Flood">🌊 Flood / Inundation</option>
                <option value="Cyclone">🌀 Cyclone / Gale Storm</option>
                <option value="Earthquake">🌍 Earthquake / Tremor</option>
                <option value="Fire">🔥 Urban / Industrial Fire</option>
                <option value="Tsunami">🌊 Coastal Tsunami Threat</option>
              </select>
            </div>

            {/* Transport Mode */}
            <div>
              <label style={{ fontSize: "0.82rem", color: "#94a3b8", display: "block", marginBottom: "6px", fontWeight: "600" }}>
                🚗 Evacuation Mode
              </label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "0.92rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value="driving">🚗 Vehicle / Car / Ambulance</option>
                <option value="walking">🚶 On Foot / Walking</option>
              </select>
            </div>

            {/* Current Location */}
            <div style={{ gridColumn: "span 1" }}>
              <label style={{ fontSize: "0.82rem", color: "#94a3b8", display: "block", marginBottom: "6px", fontWeight: "600" }}>
                📍 Your Current Location / GPS
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Enter address, district, or GPS"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: "11px 14px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.92rem",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={detectGPS}
                  disabled={gpsLoading}
                  style={{
                    padding: "11px 16px",
                    backgroundColor: "#0284c7",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: gpsLoading ? "wait" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {gpsLoading ? "📡..." : "📍 GPS"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick location chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "18px" }}>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Quick Odisha Locations:</span>
            {[
              "Patia, Bhubaneswar",
              "Cantonment Road, Cuttack",
              "Marine Drive, Puri",
              "Station Road, Balasore",
              "Ambapua, Berhampur",
            ].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                style={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  color: "#38bdf8",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {loc}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loadingPlan}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: loadingPlan ? "wait" : "pointer",
              boxShadow: "0 4px 15px rgba(37,99,235,0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🧭</span>
            <span>{loadingPlan ? "Calculating Safe Evacuation Route..." : "Check Unsafe Zone & Generate Route"}</span>
          </button>
        </form>
      </div>

      {/* ── PLAN RESULTS ────────────────────────────────────────────────── */}
      {plan && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* CRITICAL PRE-DISASTER UNSAFE ZONE ALERT CARD */}
          <div
            style={{
              background: "linear-gradient(135deg, #7f1d1d, #991b1b)",
              border: "2px solid #ef4444",
              borderRadius: "14px",
              padding: "22px 26px",
              boxShadow: "0 10px 30px rgba(239, 68, 68, 0.35)",
              color: "#fff",
              animation: "pulse 2s infinite",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.6rem" }}>🚨</span>
                  <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "900", color: "#fecaca" }}>
                    CRITICAL PRE-DISASTER WARNING: YOU ARE IN AN UNSAFE ZONE!
                  </h2>
                </div>
                <p style={{ margin: "8px 0 0 0", color: "#fee2e2", fontSize: "0.92rem", lineHeight: "1.5" }}>
                  Your current location (<strong>{location}</strong>) is situated directly within the high-impact hazard perimeter for <strong>{disasterType}</strong>. Immediate relocation to <strong>{plan.destination.name}</strong> is strongly advised before conditions deteriorate.
                </p>
              </div>

              {/* Siren & Notification Controls */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {/* Acoustic Emergency Siren Button */}
                <button
                  type="button"
                  onClick={toggleSiren}
                  style={{
                    backgroundColor: sirenActive ? "#ffffff" : "#dc2626",
                    color: sirenActive ? "#dc2626" : "#ffffff",
                    border: "2px solid #ffffff",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontWeight: "800",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: sirenActive ? "0 0 20px #ffffff" : "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <span>{sirenActive ? "⏹️" : "🔊"}</span>
                  <span>{sirenActive ? "SILENCE SIREN" : "SOUND EMERGENCY SIREN"}</span>
                </button>

                {/* Dual Online/Offline Notification Button */}
                <button
                  type="button"
                  onClick={triggerDualNotification}
                  style={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #f87171",
                    color: "#fecaca",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{notificationSent ? "✅" : "📲"}</span>
                  <span>{notificationSent ? "Notification Dispatched" : "Dual Push Notification"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Primary Destination & ETA Banner */}
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "14px",
              border: "2px solid #22c55e",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(34,197,94,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span
                  style={{
                    backgroundColor: "#166534",
                    color: "#86efac",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  🟢 PRIMARY RECOMMENDED SHELTER
                </span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#f8fafc", margin: "10px 0 4px 0" }}>
                  🏠 {plan.destination.name}
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "4px 0" }}>
                  📍 {plan.destination.address}{plan.destination.city ? `, ${plan.destination.city}` : ""}
                </p>
                <p style={{ color: "#38bdf8", fontSize: "0.85rem", margin: "4px 0" }}>
                  📞 Emergency Desk: <strong>{plan.destination.contactNumber}</strong> | 👥 Available Capacity:{" "}
                  <strong style={{ color: "#4ade80" }}>{plan.destination.availableSpots} spots free</strong>
                </p>
              </div>

              {/* Time & Distance Badge */}
              <div
                style={{
                  backgroundColor: "#0f172a",
                  padding: "16px 22px",
                  borderRadius: "12px",
                  border: "1px solid #334155",
                  textAlign: "center",
                  minWidth: "160px",
                }}
              >
                <span style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>
                  Estimated Travel Time
                </span>
                <div style={{ fontSize: "2rem", fontWeight: "900", color: "#38bdf8", marginTop: "4px" }}>
                  ~{transportMode === "driving" ? plan.estimatedTime.drivingMinutes : plan.estimatedTime.walkingMinutes}{" "}
                  <span style={{ fontSize: "1rem" }}>mins</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#4ade80", fontWeight: "600", marginTop: "2px" }}>
                  📏 {plan.estimatedTime.distanceKm} km ({transportMode})
                </div>
              </div>
            </div>

            {/* Hazard Alert Notice */}
            <div
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "10px",
                padding: "14px 18px",
                marginTop: "18px",
                color: "#fecaca",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>⚠️</span>
              <div style={{ fontSize: "0.88rem", lineHeight: "1.5" }}>
                <strong>Critical Hazard Directive:</strong> {plan.hazardWarning}
                <div style={{ marginTop: "4px", color: "#fef08a" }}>
                  <strong>Evacuation Route Priority:</strong> {plan.routePriority}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
              <a
                href={plan.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  padding: "11px 22px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.92rem",
                  textDecoration: "none",
                }}
              >
                <span>🗺️</span>
                <span>Open Google Maps Turn-by-Turn</span>
              </a>

              <button
                onClick={sharePlanOnWhatsApp}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#25d366",
                  color: "#000",
                  padding: "11px 18px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span>💬</span>
                <span>Share Route with Family (WhatsApp)</span>
              </button>

              <button
                onClick={() => window.print()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#334155",
                  color: "#fff",
                  padding: "11px 18px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span>🖨️</span>
                <span>Print / Save Plan</span>
              </button>
            </div>
          </div>

          {/* ── OFFLINE HARDWARE COMPASS & VECTOR ROUTING SECTION ─────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
            {/* 100% Offline Compass Widget */}
            <OfflineCompassWidget
              userLat={originLat}
              userLng={originLng}
              shelterLat={destLat}
              shelterLng={destLng}
              shelterName={plan.destination.name}
              distanceKm={plan.estimatedTime.distanceKm}
            />

            {/* Offline Turn-by-Turn Cardinal Waypoints */}
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                border: "1px solid #334155",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <span style={{ fontSize: "1.4rem" }}>📍</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#f8fafc" }}>
                      Offline Cardinal Corridor Waypoints
                    </h3>
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      Follow without internet or map tiles
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ backgroundColor: "#0f172a", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
                    <strong style={{ fontSize: "0.85rem", color: "#f87171" }}>Step 1: Immediate Egress (Origin)</strong>
                    <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginTop: "2px" }}>
                      Depart current structure at {location}. Secure ID & emergency go-bag.
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#0f172a", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #38bdf8" }}>
                    <strong style={{ fontSize: "0.85rem", color: "#38bdf8" }}>
                      Step 2: Vector Corridor ({cardinalDir} - {Math.round(initialBearing)}°)
                    </strong>
                    <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginTop: "2px" }}>
                      Move {cardinalDir} along highest-elevation spinal roadways away from rivers, drainage channels, or downed power cables.
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#0f172a", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #f59e0b" }}>
                    <strong style={{ fontSize: "0.85rem", color: "#fbbf24" }}>Step 3: Midway Checkpoint (~{(plan.estimatedTime.distanceKm / 2).toFixed(1)} km)</strong>
                    <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginTop: "2px" }}>
                      Verify magnetic azimuth with offline compass. Maintain distance from low-lying underpasses.
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#0f172a", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #22c55e" }}>
                    <strong style={{ fontSize: "0.85rem", color: "#4ade80" }}>Step 4: Shelter Check-in ({plan.destination.name})</strong>
                    <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginTop: "2px" }}>
                      Arrive at {plan.destination.address}. Report to shelter administration desk for medical triage and family registration.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "14px", fontSize: "0.75rem", color: "#94a3b8", textAlign: "center" }}>
                ⚡ Cached in local device storage. Operates during complete cellular tower outage.
              </div>
            </div>
          </div>

          {/* Interactive Map Section */}
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "14px",
              border: "1px solid #334155",
              padding: "20px",
              overflow: "hidden",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 12px 0", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🗺️</span>
              <span>Live Evacuation Route Corridor</span>
            </h3>

            <div style={{ height: "350px", width: "100%", borderRadius: "10px", overflow: "hidden" }}>
              <MapContainer
                center={[centerLat, centerLng]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User origin */}
                <Marker position={[originLat, originLng]} icon={userPinIcon}>
                  <Popup>
                    <strong>🔴 Your Evacuation Origin:</strong>
                    <br />
                    {location}
                  </Popup>
                </Marker>

                {/* Destination shelter */}
                <Marker position={[destLat, destLng]} icon={shelterPinIcon}>
                  <Popup>
                    <strong>🟢 Designated Safe Shelter:</strong>
                    <br />
                    {plan.destination.name}
                    <br />
                    📞 {plan.destination.contactNumber}
                  </Popup>
                </Marker>

                {/* Connecting Route Corridor */}
                <Polyline
                  positions={[
                    [originLat, originLng],
                    [destLat, destLng],
                  ]}
                  color="#2563eb"
                  dashArray="6, 8"
                  weight={4}
                />
              </MapContainer>
            </div>
          </div>

          {/* Evacuation Phases (Timeline) */}
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "14px",
              border: "1px solid #334155",
              padding: "24px",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", margin: "0 0 18px 0", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⏱️</span>
              <span>Step-by-Step Evacuation Phases</span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {(plan.evacuationPhases || []).map((phase) => (
                <div
                  key={phase.phase}
                  style={{
                    backgroundColor: "#0f172a",
                    borderRadius: "10px",
                    border: "1px solid #334155",
                    padding: "16px 20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span
                      style={{
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "800",
                        fontSize: "0.85rem",
                      }}
                    >
                      {phase.phase}
                    </span>
                    <strong style={{ fontSize: "1.05rem", color: "#e2e8f0" }}>{phase.title}</strong>
                  </div>

                  <ul style={{ margin: "6px 0 0 0", paddingLeft: "36px", color: "#94a3b8", fontSize: "0.88rem", lineHeight: "1.6" }}>
                    {(phase.actions || []).map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Survival Checklist & Alternate Shelters Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {/* Checklist */}
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "14px",
                border: "1px solid #334155",
                padding: "22px",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 14px 0", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🎒</span>
                <span>Emergency Kit Checklist</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(plan.checklist || []).map((item, idx) => {
                  const isDone = Boolean(checkedItems[idx]);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleChecklist(idx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        backgroundColor: isDone ? "#064e3b" : "#0f172a",
                        border: `1px solid ${isDone ? "#10b981" : "#334155"}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        style={{ cursor: "pointer" }}
                      />
                      <span
                        style={{
                          fontSize: "0.88rem",
                          color: isDone ? "#6ee7b7" : "#e2e8f0",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alternate Shelters */}
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "14px",
                border: "1px solid #334155",
                padding: "22px",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 14px 0", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🛡️</span>
                <span>Alternate Safety Centers</span>
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: "-6px", marginBottom: "14px" }}>
                If the primary corridor is blocked by flooding or debris, divert to:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(plan.alternateShelters || []).map((alt) => (
                  <div
                    key={alt.id}
                    style={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <div style={{ fontWeight: "700", fontSize: "0.92rem", color: "#f8fafc" }}>
                      {alt.name}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "2px" }}>
                      📍 {alt.address}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "0.8rem" }}>
                      <span style={{ color: "#38bdf8" }}>📏 {alt.distanceKm} km away</span>
                      <Link
                        to={`/map?lat=${alt.latitude}&lng=${alt.longitude}&name=${encodeURIComponent(alt.name)}`}
                        style={{ color: "#60a5fa", textDecoration: "underline", fontWeight: "600" }}
                      >
                        Disaster Map ↗
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Hotlines Footer */}
          <div
            style={{
              backgroundColor: "#0f172a",
              borderRadius: "12px",
              border: "1px solid #334155",
              padding: "18px 22px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div>
              <strong style={{ color: "#f8fafc", fontSize: "0.92rem" }}>🚨 24/7 Official Emergency Helplines:</strong>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "6px", fontSize: "0.85rem", color: "#94a3b8" }}>
                <span>National Emergency: <strong style={{ color: "#ef4444" }}>112</strong></span>
                <span>Ambulance: <strong style={{ color: "#38bdf8" }}>108</strong></span>
                <span>State Disaster Authority: <strong style={{ color: "#f59e0b" }}>1070</strong></span>
                <span>District Disaster Control: <strong style={{ color: "#4ade80" }}>1077</strong></span>
              </div>
            </div>

            <a
              href="tel:112"
              style={{
                backgroundColor: "#dc2626",
                color: "#fff",
                padding: "8px 18px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "0.85rem",
                textDecoration: "none",
              }}
            >
              📞 Call 112 Now
            </a>
          </div>
        </div>
      )}
    </div>
  );
}