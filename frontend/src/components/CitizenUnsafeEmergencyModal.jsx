import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { subscribeToCitizenUnsafeAlarms } from "../services/socketService";
import { startEmergencySiren, stopEmergencySiren } from "../utils/sirenAudio";

export default function CitizenUnsafeEmergencyModal() {
  const [alarm, setAlarm] = useState(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const vibrationIntervalRef = useRef(null);

  // Helper to trigger mobile vibration pattern
  const triggerMobileVibration = () => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([600, 200, 600, 200, 600, 200, 1200]);
      }
    } catch (_) {}
  };

  // Sound siren and start repeated phone vibration
  const activateSirenAndVibration = () => {
    try {
      startEmergencySiren();
      setSirenPlaying(true);
      triggerMobileVibration();

      // Repeat vibration pulse every 4 seconds while siren is active
      if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = setInterval(() => {
        triggerMobileVibration();
      }, 4000);
    } catch (e) {
      console.warn("Could not auto-start siren audio:", e);
    }
  };

  const deactivateSiren = () => {
    stopEmergencySiren();
    setSirenPlaying(false);
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
  };

  useEffect(() => {
    // Subscribe to real-time socket siren and unsafe citizen alarms
    const unsubscribe = subscribeToCitizenUnsafeAlarms((incomingAlarm) => {
      if (!incomingAlarm) return;
      setAlarm(incomingAlarm);
      setMinimized(false);

      // Immediately buzz phone siren & vibrate
      if (incomingAlarm.triggerSiren !== false) {
        activateSirenAndVibration();
      }

      // Trigger browser notification if supported
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            new Notification(`🚨 CRITICAL DANGER: EVACUATE IMMEDIATELY!`, {
              body: incomingAlarm.message || "You are in an unsafe disaster hazard zone. Head to nearest safe place.",
              icon: "/pwa-192x192.png",
              badge: "/pwa-192x192.png",
              vibrate: [500, 200, 500, 200, 500, 200, 1000],
              requireInteraction: true,
              tag: `unsafe-alarm-${Date.now()}`,
            });
          } catch (_) {}
        }
      }
    });

    return () => {
      unsubscribe();
      deactivateSiren();
    };
  }, []);

  if (!alarm) return null;

  const nearestShelter = alarm.nearestSafePlace || {
    name: "District Emergency Safe Refuge & Assembly Zone",
    address: "Central Collectorate & Relief Ground, Main Highway",
    distanceKm: 2.1,
    walkingMinutes: 28,
    drivingMinutes: 6,
    phone: "112",
  };

  const mapsUrl = alarm.mapRouteUrl || `https://www.google.com/maps/dir/?api=1&destination=${nearestShelter.latitude || 20.3015},${nearestShelter.longitude || 85.8312}&travelmode=walking`;

  // Minimized floating pill button at bottom
  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        style={{
          position: "fixed",
          bottom: "85px",
          right: "20px",
          zIndex: 999999,
          backgroundColor: "#dc2626",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: "30px",
          boxShadow: "0 0 25px rgba(239, 68, 68, 0.9), 0 4px 15px rgba(0,0,0,0.8)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: "800",
          fontSize: "0.88rem",
          border: "2px solid #fecaca",
          animation: "pulse 1.2s infinite",
        }}
      >
        <span style={{ fontSize: "1.3rem" }}>🚨</span>
        <span>
          {sirenPlaying ? "🔊 DANGER SIREN BUZZING" : "⚠️ CITIZEN IN DANGER"} (Click to Expand Route)
        </span>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="danger-alert-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(10, 10, 15, 0.88)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes dangerStrobe {
          0% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.2); }
          50% { box-shadow: 0 0 50px rgba(239, 68, 68, 0.9), inset 0 0 35px rgba(239, 68, 68, 0.4); }
          100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.2); }
        }
        @keyframes beaconSpin {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "620px",
          maxHeight: "92vh",
          overflowY: "auto",
          backgroundColor: "#1c0707",
          border: "3px solid #ef4444",
          borderRadius: "20px",
          padding: "24px 26px",
          color: "#ffffff",
          animation: "dangerStrobe 1.5s infinite",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                boxShadow: "0 0 25px rgba(239, 68, 68, 0.9)",
                animation: "beaconSpin 1s infinite",
                flexShrink: 0,
              }}
            >
              🚨
            </div>
            <div>
              <span
                style={{
                  backgroundColor: "#7f1d1d",
                  border: "1px solid #ef4444",
                  color: "#fecaca",
                  fontSize: "0.72rem",
                  fontWeight: "900",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                CRITICAL LIFE-SAFETY ADVISORY
              </span>
              <h2
                id="danger-alert-title"
                style={{
                  fontSize: "1.45rem",
                  fontWeight: "900",
                  color: "#fee2e2",
                  margin: "6px 0 0 0",
                  lineHeight: "1.25",
                }}
              >
                YOU ARE IN DANGER! EVACUATE NOW
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setMinimized(true)}
              title="Minimize alert to bottom corner"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                color: "#e2e8f0",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "0.8rem",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Minimize
            </button>
          </div>
        </div>

        {/* Warning Body */}
        <div
          style={{
            marginTop: "16px",
            backgroundColor: "rgba(127, 29, 29, 0.5)",
            border: "1.5px solid rgba(239, 68, 68, 0.7)",
            borderRadius: "12px",
            padding: "14px 16px",
            fontSize: "0.92rem",
            lineHeight: "1.45",
            color: "#fecaca",
          }}
        >
          <div style={{ fontWeight: "700", color: "#ffffff", marginBottom: "4px" }}>
            ⚠️ Emergency Condition: {alarm.hazardType || "Active Hazard Zone Detected"}
          </div>
          <div>{alarm.message}</div>
        </div>

        {/* Siren Sound Status & Controls */}
        <div
          style={{
            marginTop: "16px",
            backgroundColor: sirenPlaying ? "#450a0a" : "#1e293b",
            border: `1.5px solid ${sirenPlaying ? "#f87171" : "#475569"}`,
            borderRadius: "12px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.6rem", animation: sirenPlaying ? "beaconSpin 0.8s infinite" : "none" }}>
              {sirenPlaying ? "🔊" : "🔇"}
            </span>
            <div>
              <div style={{ fontWeight: "800", fontSize: "0.92rem", color: sirenPlaying ? "#fca5a5" : "#cbd5e1" }}>
                {sirenPlaying ? "🚨 Phone Emergency Siren is BUZZING" : "Audio Siren is Silenced"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                {sirenPlaying ? "Web Audio siren + physical phone vibration active" : "Tap button to resume alarm audio"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => {
                if (sirenPlaying) {
                  deactivateSiren();
                } else {
                  activateSirenAndVibration();
                }
              }}
              style={{
                backgroundColor: sirenPlaying ? "#991b1b" : "#dc2626",
                border: "1px solid #f87171",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {sirenPlaying ? "🔇 Silence Siren" : "🔊 Buzz Siren"}
            </button>
          </div>
        </div>

        {/* NEAREST SAFE PLACE CARD */}
        <div
          style={{
            marginTop: "18px",
            backgroundColor: "#064e3b",
            border: "2px solid #10b981",
            borderRadius: "14px",
            padding: "18px 20px",
            boxShadow: "0 0 25px rgba(16, 185, 129, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <span
              style={{
                backgroundColor: "#047857",
                color: "#a7f3d0",
                padding: "3px 10px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              🛡️ Designated Nearest Safe Place
            </span>

            {nearestShelter.distanceKm && (
              <span style={{ fontSize: "0.95rem", fontWeight: "900", color: "#6ee7b7" }}>
                📍 ~{nearestShelter.distanceKm} km away
              </span>
            )}
          </div>

          <h3 style={{ margin: "10px 0 4px 0", fontSize: "1.25rem", fontWeight: "800", color: "#f0fdf4" }}>
            {nearestShelter.name}
          </h3>

          <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "#d1fae5", lineHeight: "1.4" }}>
            {nearestShelter.address}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              fontSize: "0.82rem",
              color: "#a7f3d0",
              borderTop: "1px dashed rgba(16, 185, 129, 0.4)",
              paddingTop: "10px",
            }}
          >
            {nearestShelter.walkingMinutes && (
              <span>🚶 <strong>~{nearestShelter.walkingMinutes} min</strong> walking</span>
            )}
            {nearestShelter.drivingMinutes && (
              <span>🚗 <strong>~{nearestShelter.drivingMinutes} min</strong> drive</span>
            )}
            {nearestShelter.availableSpots && (
              <span>👥 <strong>{nearestShelter.availableSpots}</strong> spots available</span>
            )}
            <span>📞 Helpline: <strong>{nearestShelter.phone || "112"}</strong></span>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTON: OPEN MAP ROUTE */}
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              backgroundColor: "#22c55e",
              color: "#052e16",
              padding: "16px 22px",
              borderRadius: "12px",
              fontWeight: "900",
              fontSize: "1.05rem",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(34, 197, 94, 0.45)",
              transition: "transform 0.15s, background-color 0.15s",
              textAlign: "center",
            }}
          >
            <span>🗺️</span>
            <span>OPEN TURN-BY-TURN MAP ROUTE TO SAFE PLACE</span>
            <span>↗</span>
          </a>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
            <Link
              to="/evacuation-planner"
              onClick={() => setMinimized(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backgroundColor: "#0284c7",
                color: "#ffffff",
                padding: "12px 16px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "0.85rem",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              <span>🧭</span>
              <span>Evacuation Planner</span>
            </Link>

            {nearestShelter.phone && (
              <a
                href={`tel:${nearestShelter.phone}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: "#334155",
                  color: "#ffffff",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                <span>📞</span>
                <span>Call Shelter ({nearestShelter.phone})</span>
              </a>
            )}

            <a
              href="tel:112"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                padding: "12px 16px",
                borderRadius: "10px",
                fontWeight: "800",
                fontSize: "0.85rem",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              <span>🚨</span>
              <span>Call 112 National Helpline</span>
            </a>
          </div>

          <button
            onClick={() => {
              deactivateSiren();
              setAlarm(null);
            }}
            style={{
              marginTop: "8px",
              backgroundColor: "transparent",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#94a3b8",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ✅ I Have Reached Safety / Dismiss Alarm
          </button>
        </div>
      </div>
    </div>
  );
}
