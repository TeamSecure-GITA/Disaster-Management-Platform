import React, { useState, useEffect } from "react";
import { subscribeToDisasterAlerts, playEmergencyAlertSound } from "../services/socketService";

const severityColors = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#38bdf8",
};

export default function LiveNotificationToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // 1. Subscribe to real-time live disaster & government notifications
    const unsubscribe = subscribeToDisasterAlerts((newAlert) => {
      if (!newAlert) return;
      setToast(newAlert);
      try {
        playEmergencyAlertSound();
      } catch (_) {}
    });

    return () => unsubscribe();
  }, []);

  // Auto-dismiss toast after 10 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const sev = (toast.severity || "high").toLowerCase();
  const borderColor = severityColors[sev] || "#f97316";
  const officialUrl = toast.sourceUrl || "https://sachet.ndma.gov.in/";

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: "70px",
        right: "16px",
        zIndex: 99999,
        maxWidth: "min(420px, calc(100vw - 32px))",
        width: "100%",
        backgroundColor: "#0f172a",
        border: `2px solid ${borderColor}`,
        borderRadius: "14px",
        padding: "16px 18px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(249, 115, 22, 0.2)",
        color: "#ffffff",
        animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.3rem" }}>🚨</span>
          <span
            style={{
              backgroundColor: borderColor,
              color: "#000",
              fontWeight: "900",
              fontSize: "0.68rem",
              padding: "2px 8px",
              borderRadius: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {toast.severity || "LIVE ALERT"}
          </span>
          {toast.sourceAgency && (
            <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: "700" }}>
              {toast.sourceAgency}
            </span>
          )}
        </div>

        <button
          onClick={() => setToast(null)}
          title="Dismiss alert"
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: "1.4rem",
            lineHeight: "1",
            cursor: "pointer",
            padding: "0 4px",
          }}
        >
          ×
        </button>
      </div>

      {/* Title & Message */}
      <div style={{ marginTop: "8px", fontWeight: "700", fontSize: "0.92rem", color: "#f8fafc", lineHeight: "1.35" }}>
        {toast.title}
      </div>
      {toast.message && (
        <div style={{ marginTop: "4px", fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4" }}>
          {toast.message.length > 150 ? `${toast.message.slice(0, 150)}…` : toast.message}
        </div>
      )}

      {/* Footer / Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", gap: "8px" }}>
        <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
          📍 {toast.location || toast.country || "National Alert Network"}
        </span>
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "0.75rem",
            fontWeight: "700",
            padding: "5px 12px",
            borderRadius: "6px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>Official Advisory</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  );
}
