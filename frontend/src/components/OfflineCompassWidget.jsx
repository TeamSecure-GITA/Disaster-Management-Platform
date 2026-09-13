import React, { useState, useEffect, useCallback } from "react";

// Calculate Great Circle forward azimuth bearing in degrees (0° to 360°)
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
}

export function getCardinalDirection(deg) {
  const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return cardinals[index];
}

export default function OfflineCompassWidget({
  userLat,
  userLng,
  shelterLat,
  shelterLng,
  shelterName = "Safe Evacuation Shelter",
  distanceKm = 0,
}) {
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [hasGyro, setHasGyro] = useState(false);
  const [permissionState, setPermissionState] = useState("prompt");

  // Calculate target bearing
  const targetBearing = userLat && userLng && shelterLat && shelterLng
    ? calculateBearing(userLat, userLng, shelterLat, shelterLng)
    : 0;

  const relativeNeedleAngle = (targetBearing - deviceHeading + 360) % 360;
  const cardinal = getCardinalDirection(targetBearing);

  const handleOrientation = useCallback((e) => {
    let heading = null;

    if (e.webkitCompassHeading) {
      // iOS Safari (True magnetic heading)
      heading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
      // Android / standard (alpha increases counter-clockwise)
      heading = (360 - e.alpha) % 360;
    }

    if (heading !== null) {
      setDeviceHeading(Math.round(heading));
      setHasGyro(true);
    }
  }, []);

  const requestGyroPermission = async () => {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        setPermissionState(response);
        if (response === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
        }
      } catch (err) {
        console.warn("DeviceOrientation permission error:", err);
      }
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }
  };

  useEffect(() => {
    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [handleOrientation]);

  return (
    <div
      style={{
        backgroundColor: "#0b1329",
        border: "2px solid #38bdf8",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 10px 35px rgba(56, 189, 248, 0.15)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.4rem" }}>🧭</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#38bdf8" }}>
              100% Offline Evacuation Vector Compass
            </h3>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              Zero-Network Great-Circle Azimuth Navigation
            </span>
          </div>
        </div>

        <span
          style={{
            backgroundColor: "#064e3b",
            color: "#6ee7b7",
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "0.72rem",
            fontWeight: "700",
          }}
        >
          {hasGyro ? "● Hardware Gyro Live" : "Vector Heading"}
        </span>
      </div>

      {/* Target summary banner */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#1e293b",
          borderRadius: "8px",
          padding: "10px 14px",
          marginBottom: "16px",
          fontSize: "0.85rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <span style={{ color: "#94a3b8" }}>Shelter: </span>
          <strong style={{ color: "#4ade80" }}>{shelterName}</strong>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <span>
            Target Bearing: <strong style={{ color: "#38bdf8" }}>{Math.round(targetBearing)}° ({cardinal})</strong>
          </span>
          {distanceKm > 0 && (
            <span>
              Distance: <strong style={{ color: "#f59e0b" }}>{distanceKm} km</strong>
            </span>
          )}
        </div>
      </div>

      {/* Compass Dial Visualizer */}
      <div
        style={{
          position: "relative",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          backgroundColor: "#020617",
          border: "4px solid #1e293b",
          boxShadow: "inset 0 0 25px rgba(0,0,0,0.8), 0 0 15px rgba(56, 189, 248, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "8px 0",
        }}
      >
        {/* Cardinal Markers */}
        <span style={{ position: "absolute", top: "8px", fontWeight: "900", color: "#ef4444", fontSize: "0.9rem" }}>N</span>
        <span style={{ position: "absolute", right: "10px", fontWeight: "700", color: "#94a3b8", fontSize: "0.85rem" }}>E</span>
        <span style={{ position: "absolute", bottom: "8px", fontWeight: "700", color: "#94a3b8", fontSize: "0.85rem" }}>S</span>
        <span style={{ position: "absolute", left: "10px", fontWeight: "700", color: "#94a3b8", fontSize: "0.85rem" }}>W</span>

        {/* Degree ticks ring */}
        <div
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            border: "1px dashed #334155",
          }}
        />

        {/* Rotating Needle */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: `rotate(${relativeNeedleAngle}deg)`,
            transition: "transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)",
            pointerEvents: "none",
          }}
        >
          {/* North/Shelter pointing red arrow */}
          <div
            style={{
              position: "absolute",
              top: "22px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "65px solid #ef4444",
              filter: "drop-shadow(0 0 8px rgba(239,68,68,0.7))",
            }}
          />

          {/* Opposite pointer */}
          <div
            style={{
              position: "absolute",
              bottom: "22px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "65px solid #64748b",
            }}
          />
        </div>

        {/* Center Hub */}
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#38bdf8",
            border: "3px solid #ffffff",
            boxShadow: "0 0 12px rgba(56, 189, 248, 0.8)",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            color: "#0f172a",
            fontWeight: "900",
          }}
        >
          ●
        </div>
      </div>

      {/* Dynamic guidance readout */}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc" }}>
          Head <strong style={{ color: "#38bdf8" }}>{cardinal} ({Math.round(targetBearing)}°)</strong> towards Safety
        </div>
        <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px" }}>
          Align your phone until the RED needle points directly straight forward to reach shelter.
        </div>
      </div>

      {/* Mobile Gyro permission helper button if on iOS and not yet granted */}
      {typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function" &&
        permissionState !== "granted" && (
          <button
            type="button"
            onClick={requestGyroPermission}
            style={{
              marginTop: "12px",
              padding: "6px 14px",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Enable Device Motion Sensors
          </button>
        )}
    </div>
  );
}
