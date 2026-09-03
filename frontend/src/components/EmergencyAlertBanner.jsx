import React, { useState, useEffect } from "react";
import { subscribeToDisasterAlerts } from "../services/socketService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EmergencyAlertBanner() {
  const [activeAlert, setActiveAlert] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Check for active critical/high official alert on mount
    async function loadLatestGovtAlert() {
      try {
        const res = await fetch(`${API_URL}/api/alerts/live-govt`);
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          const topAlert = list.find((a) => a.severity === "critical" || a.severity === "high") || list[0];
          if (topAlert) {
            setActiveAlert(topAlert);
          }
        }
      } catch (e) {
        // Non-fatal
      }
    }
    loadLatestGovtAlert();

    // 2. Subscribe to real-time live government & weather broadcasts
    const unsubscribe = subscribeToDisasterAlerts((newAlert) => {
      setActiveAlert(newAlert);
      setMinimized(false);
      setDismissed(false);
    });

    return () => unsubscribe();
  }, []);

  if (!activeAlert || dismissed) return null;

  const isCritical = activeAlert.severity === "critical";
  const bgColor = isCritical ? "linear-gradient(90deg, #7f1d1d, #991b1b, #7f1d1d)" : "linear-gradient(90deg, #78350f, #92400e, #78350f)";
  const borderColor = isCritical ? "#ef4444" : "#f59e0b";
  const officialUrl = activeAlert.sourceUrl || "https://sachet.ndma.gov.in/";

  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          backgroundColor: isCritical ? "#dc2626" : "#d97706",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: "30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.85rem",
          fontWeight: "bold",
          animation: "pulse 2s infinite",
        }}
      >
        <span>🚨</span>
        <span>Live Govt Alert Active (Click to expand)</span>
      </div>
    );
  }

  return (
    <aside
      aria-label="Emergency disaster broadcast"
      style={{
        background: bgColor,
        borderBottom: `2px solid ${borderColor}`,
        color: "#ffffff",
        padding: "10px 20px",
        boxShadow: "0 4px 25px rgba(0, 0, 0, 0.5)",
        position: "relative",
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* Left: Icon & Alert Agency Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 500px" }}>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              flexShrink: 0,
            }}
          >
            🚨
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  backgroundColor: "#ffffff",
                  color: isCritical ? "#b91c1c" : "#92400e",
                  fontSize: "0.7rem",
                  fontWeight: "800",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {activeAlert.sourceAgency || "OFFICIAL GOVT ALERT"}
              </span>
              <span
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  color: "#fef08a",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                {activeAlert.severity || "HIGH"} SEVERITY
              </span>
              <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                {activeAlert.affectedAreas?.[0] || activeAlert.country || "Active Region"}
              </span>
            </div>
            <div style={{ fontWeight: "600", fontSize: "0.92rem", marginTop: "3px", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
              {activeAlert.title}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#ffffff",
              color: "#0f172a",
              padding: "7px 14px",
              borderRadius: "6px",
              fontSize: "0.82rem",
              fontWeight: "700",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              transition: "transform 0.15s, background-color 0.15s",
            }}
          >
            <span>🏛️ Official Govt Advisory</span>
            <span style={{ fontSize: "0.95rem" }}>↗</span>
          </a>

          <button
            onClick={() => setMinimized(true)}
            title="Minimize"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Minimize
          </button>

          <button
            onClick={() => setDismissed(true)}
            title="Dismiss"
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.2rem",
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      </div>
    </aside>
  );
}
