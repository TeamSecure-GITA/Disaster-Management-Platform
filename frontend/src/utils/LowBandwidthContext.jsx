// ─────────────────────────────────────────────────────────────────────────────
// src/utils/LowBandwidthContext.jsx
//
// Global Ultra-Low Bandwidth Context (2G / Damaged Grid Mode)
// Strips animations, images, shadows, heavy styles, and scripts.
// Provides pure-text, high-contrast black-and-white/amber interface.
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect } from "react";

const LowBandwidthContext = createContext({
  isLowBandwidth: false,
  networkTelemetry: { effectiveType: "unknown", rtt: 0, downlink: 0, autoDetected: false },
  toggleLowBandwidth: () => {},
  enableLowBandwidth: () => {},
  disableLowBandwidth: () => {},
});

export function LowBandwidthProvider({ children }) {
  const [networkTelemetry, setNetworkTelemetry] = useState({
    effectiveType: "unknown",
    rtt: 0,
    downlink: 0,
    autoDetected: false,
  });

  const [isLowBandwidth, setIsLowBandwidth] = useState(() => {
    try {
      return localStorage.getItem("ultra_low_bandwidth") === "true";
    } catch {
      return false;
    }
  });

  // Auto-detect weak 2G / edge or high RTT connection
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.connection) {
      const conn = navigator.connection;
      const inspectConnection = () => {
        const type = conn.effectiveType || "unknown";
        const rtt = conn.rtt || 0;
        const downlink = conn.downlink || 0;
        const is2G = type === "2g" || type === "slow-2g" || conn.saveData || (rtt > 1200);

        setNetworkTelemetry({
          effectiveType: type,
          rtt,
          downlink,
          autoDetected: is2G,
        });

        if (is2G) {
          console.warn(`[Network Engine] 2G/Weak connection detected (${type}, ${rtt}ms RTT). Engaging sub-50KB Emergency Mode.`);
          setIsLowBandwidth(true);
        }
      };

      inspectConnection();
      conn.addEventListener?.("change", inspectConnection);
      return () => conn.removeEventListener?.("change", inspectConnection);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ultra_low_bandwidth", isLowBandwidth ? "true" : "false");
    } catch {}

    if (isLowBandwidth) {
      document.documentElement.setAttribute("data-low-bandwidth", "true");
      document.body.classList.add("ultra-low-bandwidth-active");
    } else {
      document.documentElement.removeAttribute("data-low-bandwidth");
      document.body.classList.remove("ultra-low-bandwidth-active");
    }
  }, [isLowBandwidth]);

  const toggleLowBandwidth = () => setIsLowBandwidth((prev) => !prev);
  const enableLowBandwidth = () => setIsLowBandwidth(true);
  const disableLowBandwidth = () => setIsLowBandwidth(false);

  return (
    <LowBandwidthContext.Provider
      value={{
        isLowBandwidth,
        networkTelemetry,
        toggleLowBandwidth,
        enableLowBandwidth,
        disableLowBandwidth,
      }}
    >
      {children}
    </LowBandwidthContext.Provider>
  );
}

export function useLowBandwidth() {
  return useContext(LowBandwidthContext);
}
