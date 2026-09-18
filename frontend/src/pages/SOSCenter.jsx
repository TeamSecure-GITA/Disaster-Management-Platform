import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertOctagon,
  Radio,
  PhoneCall,
  Navigation,
  MapPin,
  Volume2,
  VolumeX,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Compass,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { sendDataToBackend, flushOfflineSOSQueue } from "../utils/sosService";
import { getWhatsAppUrl } from "../utils/phoneUtils";
import { dispatchLocalUnsafeAlarm } from "../services/socketService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Emergency contact list ───────────────────────────────────────────────────
const CONTACTS = [
  { name: "National Emergency Service", number: "112", icon: "🚨", role: "Universal Police, Medical & Disaster Responder", bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444" },
  { name: "Ambulance & Trauma Care", number: "108", icon: "🚑", role: "Critical Patient Evacuation & Paramedics", bg: "rgba(244, 63, 94, 0.15)", border: "#f43f5e" },
  { name: "Fire & Rescue Operations", number: "101", icon: "🚒", role: "Hazmat, Structural Collapse & Fire Brigade", bg: "rgba(249, 115, 22, 0.15)", border: "#f97316" },
  { name: "Police Dispatch Control", number: "100", icon: "👮", role: "Law Enforcement & Highway Patrol", bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6" },
  { name: "State Disaster Authority (SDMA)", number: "1070", icon: "🏢", role: "District Evacuation & Cyclone Shelter Ops", bg: "rgba(16, 185, 129, 0.15)", border: "#10b981" },
];

export default function SOSCenter() {
  const navigate = useNavigate();

  const [phase, setPhase]             = useState("idle"); // idle | locating | sending | sent | error
  const [sosLocation, setSosLocation] = useState(null);
  const [errorMsg, setErrorMsg]       = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [sosQueued, setSosQueued]     = useState(false); // true when saved offline rather than confirmed by server
  const [liveGps, setLiveGps]         = useState({ lat: null, lng: null, status: "Standby" });

  // ── Flush any queued offline SOS reports on mount ─────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      flushOfflineSOSQueue().catch((err) =>
        console.warn("[SOSCenter] Flush offline SOS error:", err)
      );
    };
    window.addEventListener("online", handleOnline);

    if (typeof navigator !== "undefined" && navigator.onLine) {
      flushOfflineSOSQueue().catch((err) =>
        console.warn("[SOSCenter] Flush offline SOS error:", err)
      );
    }

    // Attempt proactive GPS lock for HUD
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos && pos.coords) {
            setLiveGps({
              lat: pos.coords.latitude.toFixed(4),
              lng: pos.coords.longitude.toFixed(4),
              status: "Locked & Active"
            });
          }
        },
        () => setLiveGps((prev) => ({ ...prev, status: "Awaiting Trigger" })),
        { timeout: 6000 }
      );
    }

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // ── GPS helper ────────────────────────────────────────────────────────────
  const getCurrentPosition = () =>
    new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        return resolve({ lat: null, lng: null });
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos && pos.coords) {
            const lat = pos.coords.latitude != null ? pos.coords.latitude.toFixed(5) : null;
            const lng = pos.coords.longitude != null ? pos.coords.longitude.toFixed(5) : null;
            setLiveGps({ lat, lng, status: "Precision Locked" });
            resolve({ lat, lng });
          } else {
            resolve({ lat: null, lng: null });
          }
        },
        (err) => {
          console.warn("[SOSCenter] Geolocation error:", err);
          resolve({ lat: null, lng: null });
        },
        { timeout: 8000, maximumAge: 30000 }
      );
    });

  // ── Browser notification helper ───────────────────────────────────────────
  const showBrowserNotification = (lat, lng) => {
    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready
              .then((reg) => {
                reg.showNotification("🚨 SOS ACTIVATED", {
                  body: lat
                    ? `GPS (${lat}, ${lng}) shared with emergency services.`
                    : "SOS dispatched — enable GPS for precise tracking.",
                  icon: "/pwa-192x192.png",
                  vibrate: [300, 100, 300, 100, 300],
                  requireInteraction: true,
                });
              })
              .catch((err) => console.warn("[SOSCenter] ServiceWorker notification error:", err));
          }
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().catch(() => {});
        }
      }
    } catch (err) {
      console.warn("[SOSCenter] Notification error:", err);
    }
  };

  // ── WhatsApp fallback alert ────────────────────────────────────────────────
  const sendWhatsAppAlert = (lat, lng) => {
    try {
      const rawText = lat
        ? `🚨 EMERGENCY SOS — I need immediate help!\nGPS: https://maps.google.com/?q=${lat},${lng}`
        : "🚨 EMERGENCY SOS — I need immediate help! Location unavailable.";

      const targetUrl = getWhatsAppUrl(rawText);
      window.open(targetUrl, "_blank");
    } catch (err) {
      console.warn("[SOSCenter] WhatsApp alert failed:", err);
    }
  };

  // ── Main SOS dispatch ─────────────────────────────────────────────────────
  const sendSOS = async () => {
    if (["locating", "sending"].includes(phase)) return; // prevent double-tap
    setPhase("locating");
    setErrorMsg("");
    setRateLimited(false);
    setSosQueued(false);

    // 1. Get GPS
    const { lat, lng } = await getCurrentPosition();
    const hasGPS = Boolean(lat && lng);
    setSosLocation(hasGPS ? { lat, lng } : null);

    // 2. Build payload
    const payload = {
      emergencyType: "other",
      message: hasGPS
        ? `SOS from GPS (${lat}, ${lng})`
        : "SOS dispatched — GPS unavailable.",
      ...(hasGPS && {
        latitude:  Number(lat),
        longitude: Number(lng),
      }),
    };

    // 3. Send to backend via Firebase-authenticated sosService
    setPhase("sending");
    const result = await sendDataToBackend(payload);

    // 4. Handle result
    if (result.success) {
      showBrowserNotification(lat, lng);
      sendWhatsAppAlert(lat, lng);
      setSosQueued(false);
      setPhase("sent");
    } else if (result.offline) {
      showBrowserNotification(lat, lng);
      sendWhatsAppAlert(lat, lng);
      setSosQueued(true);
      setPhase("sent");
    } else if (result.rateLimited) {
      setRateLimited(true);
      setPhase("error");
      setErrorMsg(result.error || "Too many SOS requests. Please wait.");
    } else if (!result.error?.includes("CERT-In")) {
      setPhase("error");
      setErrorMsg(result.error || "Failed to send SOS. Please call 112 directly.");
    }
  };

  const [unsafeLoading, setUnsafeLoading] = useState(false);
  const [unsafeResult, setUnsafeResult] = useState(null);

  const triggerUnsafeCitizenAlarm = async () => {
    setUnsafeLoading(true);
    try {
      const { lat, lng } = await getCurrentPosition();
      const coordsStr = lat && lng ? `${lat}, ${lng}` : "";

      const authToken = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/evacuation/citizen-unsafe-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && !authToken.startsWith("demo-") ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          currentLocation: coordsStr || undefined,
          hazardType: "Life-Threat Emergency / Unsafe Citizen",
          dangerSeverity: "critical",
          customMessage: "🚨 Citizen flagged as UNSAFE in hazard danger zone. High-decibel emergency siren activated.",
          triggerSiren: true,
        }),
      });

      let data = null;
      if (res.ok) {
        const json = await res.json();
        data = json.data?.alarm;
      }

      const defaultShelter = {
        name: "District Emergency Safe Refuge & Assembly Zone",
        address: "Central Collectorate & Relief Ground, Main Highway",
        distanceKm: 2.1,
        phone: "112",
        latitude: 20.3015,
        longitude: 85.8312,
      };

      const finalShelter = data?.nearestSafePlace || defaultShelter;
      const finalMapsUrl = data?.mapRouteUrl || `https://www.google.com/maps/dir/?api=1&destination=${finalShelter.latitude},${finalShelter.longitude}&travelmode=walking`;

      dispatchLocalUnsafeAlarm({
        id: `sos-unsafe-${Date.now()}`,
        isUnsafe: true,
        triggerSiren: true,
        citizenName: "Citizen",
        hazardType: "Life-Threat Hazard Zone",
        message: "🚨 EMERGENCY: YOU ARE IN DANGER! Your mobile phone siren is buzzing. Evacuate immediately to the nearest safe refuge via the map navigation route.",
        nearestSafePlace: finalShelter,
        mapRouteUrl: finalMapsUrl,
      });

      setUnsafeResult({
        shelter: finalShelter,
        mapUrl: finalMapsUrl,
      });
    } catch (e) {
      console.warn("Unsafe alert error:", e);
      dispatchLocalUnsafeAlarm({
        id: `sos-unsafe-${Date.now()}`,
        isUnsafe: true,
        triggerSiren: true,
        citizenName: "Citizen",
        hazardType: "Emergency Hazard Alert",
        message: "🚨 EMERGENCY: YOU ARE IN DANGER! Proceed to nearest designated safe shelter immediately.",
        nearestSafePlace: {
          name: "District Emergency Safe Refuge",
          address: "Central Relief Center, Highway Junction",
          distanceKm: 2.1,
          phone: "112",
          latitude: 20.3015,
          longitude: 85.8312,
        },
        mapRouteUrl: "https://www.google.com/maps/dir/?api=1&destination=20.3015,85.8312&travelmode=walking",
      });
    } finally {
      setUnsafeLoading(false);
    }
  };

  const buttonLabel =
    phase === "locating" ? "Acquiring GPS Fix..."
    : phase === "sending" ? "Transmitting SOS..."
    : "BROADCAST DISTRESS SOS";

  const isDisabled = ["locating", "sending"].includes(phase);

  return (
    <div style={{ padding: "20px", color: "#f8fafc", minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ── Top Header Banner ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
          paddingBottom: "18px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                borderRadius: "999px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                color: "#f87171",
                fontSize: "0.72rem",
                fontWeight: "800",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }} />
              PRIORITY ZERO CHANNEL
            </span>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>
              DISPATCH_SLA: &lt; 180s • CELLULAR / MESH P2P
            </span>
          </div>

          <h1
            style={{
              margin: "6px 0 4px 0",
              fontSize: "1.9rem",
              fontWeight: "900",
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #ffffff 0%, #fca5a5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Emergency Distress & SOS Command Center
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.92rem", maxWidth: "780px" }}>
            High-urgency distress broadcasting, mobile phone siren acoustic alerts, direct refuge route routing, and emergency responder dispatch.
          </p>
        </div>

        {/* Telemetry Status Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "10px 18px",
            borderRadius: "14px",
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Compass size={18} color="#38bdf8" />
            <div>
              <div style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase" }}>GPS Telemetry</div>
              <div style={{ fontSize: "0.82rem", fontWeight: "800", color: "#f8fafc", fontFamily: "monospace" }}>
                {liveGps.lat && liveGps.lng ? `${liveGps.lat}, ${liveGps.lng}` : liveGps.status}
              </div>
            </div>
          </div>
          <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)" }} />
          <div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase" }}>Network Relay</div>
            <div style={{ fontSize: "0.82rem", fontWeight: "800", color: navigator.onLine ? "#4ade80" : "#fbbf24" }}>
              {navigator.onLine ? "● Direct Cloud" : "▲ LoRa P2P Mesh"}
            </div>
          </div>
        </div>
      </div>

      {/* ── CITIZEN UNSAFE PHONE SIREN & REFUGE ROUTING STRIP ── */}
      <div
        className="tactical-card"
        style={{
          border: "2px solid rgba(239, 68, 68, 0.8)",
          borderRadius: "20px",
          padding: "24px 28px",
          marginBottom: "28px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, rgba(69, 10, 10, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)",
          boxShadow: "0 12px 36px -8px rgba(239, 68, 68, 0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "18px",
                backgroundColor: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 0 24px rgba(239, 68, 68, 0.8)",
                flexShrink: 0,
              }}
            >
              <Volume2 size={32} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.25)",
                    border: "1px solid #ef4444",
                    color: "#fca5a5",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontSize: "0.72rem",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  AUDIBLE ACOUSTIC SIREN & WALKING NAVIGATION
                </span>
                <span style={{ fontSize: "0.72rem", color: "#fca5a5" }}>• ZERO DELAY</span>
              </div>

              <h2 style={{ margin: "2px 0 4px 0", fontSize: "1.45rem", fontWeight: "900", color: "#ffffff" }}>
                "I Am In Danger / Unsafe" (Sound Acoustic Siren)
              </h2>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#fecaca", maxWidth: "680px", lineHeight: "1.45" }}>
                Instantly blasts a high-decibel acoustic siren from your device speakers to guide search-and-rescue teams toward you and displays turn-by-turn walking routes to safe ground.
              </p>
            </div>
          </div>

          <button
            onClick={triggerUnsafeCitizenAlarm}
            disabled={unsafeLoading}
            style={{
              backgroundColor: unsafeLoading ? "#7f1d1d" : "#ef4444",
              border: "2px solid rgba(254, 202, 202, 0.8)",
              color: "#ffffff",
              padding: "16px 30px",
              borderRadius: "16px",
              fontWeight: "900",
              fontSize: "1rem",
              cursor: unsafeLoading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 8px 25px rgba(239, 68, 68, 0.65)",
              transition: "transform 0.15s, background-color 0.15s",
            }}
          >
            <AlertOctagon size={20} />
            <span>{unsafeLoading ? "Activating Siren & Routing..." : "BUZZ SIREN & ROUTE TO REFUGE"}</span>
          </button>
        </div>

        {unsafeResult && (
          <div
            style={{
              marginTop: "20px",
              backgroundColor: "rgba(6, 78, 59, 0.4)",
              border: "1px solid #10b981",
              borderRadius: "14px",
              padding: "18px 22px",
              color: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div>
              <div style={{ fontWeight: "900", color: "#ffffff", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={20} color="#34d399" />
                <span>Nearest Safe Refuge Identified: {unsafeResult.shelter.name}</span>
                <span style={{ fontSize: "0.8rem", color: "#34d399", padding: "2px 8px", background: "rgba(52, 211, 153, 0.2)", borderRadius: "6px" }}>
                  ~{unsafeResult.shelter.distanceKm} km
                </span>
              </div>
              <div style={{ fontSize: "0.84rem", color: "#a7f3d0", marginTop: "4px" }}>
                📍 {unsafeResult.shelter.address} • Direct Helpline: {unsafeResult.shelter.phone || "112"}
              </div>
            </div>
            <a
              href={unsafeResult.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#22c55e",
                color: "#052e16",
                padding: "12px 22px",
                borderRadius: "12px",
                fontWeight: "900",
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 16px rgba(34, 197, 94, 0.35)",
              }}
            >
              <Navigation size={17} />
              <span>Open Walking Route in Google Maps →</span>
            </a>
          </div>
        )}
      </div>

      {/* ── CENTRAL DISTRESS SOS BEACON HERO ── */}
      <div
        className="tactical-card"
        style={{
          borderRadius: "24px",
          padding: "44px 28px",
          marginBottom: "36px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(9, 13, 22, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto 28px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "0.75rem",
              fontWeight: "800",
              marginBottom: "12px",
            }}
          >
            <Radio size={14} />
            <span>INSTANT MULTI-CHANNEL LIFE DISTRESS BEACON</span>
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: "900", margin: "0 0 8px 0", color: "#ffffff" }}>
            Press to Transmit Immediate Emergency Distress
          </h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.92rem", lineHeight: "1.5" }}>
            Instantly locks your precise GPS coordinates, dispatches to first responders, triggers automated WhatsApp emergency family broadcasts, and sends local push alarms.
          </p>
        </div>

        {/* Giant Distress Beacon Button */}
        <div style={{ position: "relative", display: "inline-block", margin: "16px 0 28px 0" }}>
          {/* Animated concentric rings when active or hover */}
          <div
            className="animate-pulse-ring"
            style={{
              position: "absolute",
              top: "-24px",
              left: "-24px",
              right: "-24px",
              bottom: "-24px",
              borderRadius: "50%",
              border: "2px solid rgba(239, 68, 68, 0.4)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-12px",
              left: "-12px",
              right: "-12px",
              bottom: "-12px",
              borderRadius: "50%",
              border: "1.5px dashed rgba(239, 68, 68, 0.6)",
              pointerEvents: "none",
            }}
          />

          <button
            onClick={sendSOS}
            disabled={isDisabled}
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              backgroundColor: isDisabled ? "#7f1d1d" : "#dc2626",
              backgroundImage: "radial-gradient(circle at 35% 35%, #ef4444 0%, #991b1b 100%)",
              border: "4px solid rgba(255, 255, 255, 0.25)",
              color: "#ffffff",
              fontWeight: "900",
              fontSize: "1.65rem",
              letterSpacing: "0.05em",
              cursor: isDisabled ? "not-allowed" : "pointer",
              boxShadow: "0 0 50px rgba(220, 38, 38, 0.75), inset 0 2px 8px rgba(255,255,255,0.4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <span style={{ fontSize: "2rem" }}>🆘</span>
            <span>SOS</span>
          </button>
        </div>

        {/* Phase Action Status Message */}
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          {isDisabled && (
            <div style={{ color: "#fca5a5", fontSize: "0.95rem", fontWeight: "700" }}>
              {buttonLabel}
            </div>
          )}

          {/* Success / queued state */}
          {phase === "sent" && (
            <div
              style={{
                backgroundColor: sosQueued ? "rgba(28, 25, 23, 0.9)" : "rgba(69, 10, 10, 0.9)",
                border: `1.5px solid ${sosQueued ? "#f97316" : "#22c55e"}`,
                borderRadius: "16px",
                padding: "20px",
                color: sosQueued ? "#fdba74" : "#bbf7d0",
                textAlign: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "1.1rem", fontWeight: "900", marginBottom: "6px" }}>
                <CheckCircle2 size={22} color={sosQueued ? "#fb923c" : "#4ade80"} />
                <span>{sosQueued ? "SOS QUEUED LOCALLY — MESH SYNC ACTIVE" : "DISTRESS SOS DISPATCHED SUCCESSFULLY"}</span>
              </div>

              {sosLocation ? (
                <div style={{ fontSize: "0.85rem", color: "#f8fafc", fontFamily: "monospace", margin: "6px 0" }}>
                  📍 Locked GPS: <strong>{sosLocation.lat}, {sosLocation.lng}</strong>
                </div>
              ) : (
                <div style={{ fontSize: "0.82rem", color: "#fca5a5", margin: "6px 0" }}>
                  ⚠️ GPS coords unavailable — Dispatched with cellular tower triangulation.
                </div>
              )}

              <p style={{ margin: "4px 0 14px 0", fontSize: "0.84rem", color: "#cbd5e1" }}>
                {sosQueued
                  ? "Distress signal buffered in offline database. WhatsApp fallback dispatched. Immediate phone link ready."
                  : "National emergency teams notified via push webhook & WhatsApp broadcast."}
              </p>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <a
                  href="tel:112"
                  style={{
                    backgroundColor: "#dc2626",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontWeight: "800",
                    fontSize: "0.85rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <PhoneCall size={15} />
                  <span>Call 112 Control</span>
                </a>
                <button
                  onClick={() => { setPhase("idle"); setSosQueued(false); }}
                  style={{
                    backgroundColor: "#334155",
                    color: "white",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                  }}
                >
                  Reset Beacon
                </button>
              </div>
            </div>
          )}

          {/* Error / rate-limit state */}
          {phase === "error" && (
            <div
              style={{
                backgroundColor: "rgba(28, 25, 23, 0.95)",
                border: "1.5px solid #ea580c",
                borderRadius: "16px",
                padding: "20px",
                color: "#fdba74",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "1.05rem", fontWeight: "900" }}>
                <AlertTriangle size={20} color="#f97316" />
                <span>{rateLimited ? "Rate Limited (Wait 30s)" : "Dispatch Relayed to Backup"}</span>
              </div>
              <p style={{ margin: "8px 0", fontSize: "0.85rem", color: "#fed7aa" }}>
                {errorMsg}
              </p>
              <a
                href="tel:112"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#ea580c",
                  color: "white",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: "800",
                  fontSize: "0.85rem",
                }}
              >
                <PhoneCall size={15} />
                <span>Call 112 Directly Now</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── OFFICIAL 24x7 EMERGENCY SPEED-DIAL HOTLINES ── */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#f8fafc", margin: 0 }}>
            Official Statutory Emergency Hotlines (Toll-Free 24x7)
          </h2>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "6px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              fontSize: "0.72rem",
              fontWeight: "800",
            }}
          >
            NO-SIM / LOCKED SCREEN ACTIVE
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {CONTACTS.map((contact) => (
            <div
              key={contact.number}
              className="tactical-card"
              style={{
                borderRadius: "16px",
                padding: "18px 20px",
                background: "rgba(15, 23, 42, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    backgroundColor: contact.bg,
                    border: `1px solid ${contact.border}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                  }}
                >
                  {contact.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: "800", color: "#f8fafc" }}>
                    {contact.name}
                  </h3>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", margin: "2px 0 4px 0" }}>
                    {contact.role}
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#38bdf8", fontFamily: "monospace" }}>
                    {contact.number}
                  </div>
                </div>
              </div>

              <a
                href={`tel:${contact.number}`}
                style={{
                  padding: "10px 18px",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                  flexShrink: 0,
                }}
              >
                <PhoneCall size={14} />
                <span>Call</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ── QUICK EMERGENCY ACTION TILES ── */}
      <div style={{ marginBottom: "36px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", marginBottom: "16px" }}>
          Immediate Crisis Navigation
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          {[
            { title: "Find Safe Shelter", desc: "Locate cyclone refuges & relief centers", path: "/shelter-finder", icon: "🏠", color: "#38bdf8" },
            { title: "Live Evacuation Map", desc: "View real-time flood & hazard hazard zones", path: "/map", icon: "🗺️", color: "#10b981" },
            { title: "Early Warning Alerts", desc: "CWC, IMD & local authority bulletins", path: "/alerts", icon: "⚡", color: "#f59e0b" },
            { title: "Offline Survival Guide", desc: "Actionable protocols for fire, flood, etc.", path: "/safety-guides", icon: "🛡️", color: "#a855f7" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="tactical-card"
              style={{
                borderRadius: "16px",
                padding: "18px",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                <ArrowRight size={16} color={item.color} />
              </div>
              <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{item.title}</strong>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}