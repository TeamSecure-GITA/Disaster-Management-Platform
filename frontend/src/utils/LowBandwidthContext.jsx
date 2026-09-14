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
  toggleLowBandwidth: () => {},
  enableLowBandwidth: () => {},
  disableLowBandwidth: () => {},
});

export function LowBandwidthProvider({ children }) {
  const [isLowBandwidth, setIsLowBandwidth] = useState(() => {
    try {
      return localStorage.getItem("ultra_low_bandwidth") === "true";
    } catch {
      return false;
    }
  });

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
