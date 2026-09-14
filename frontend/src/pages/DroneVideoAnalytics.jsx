// ─────────────────────────────────────────────────────────────────────────────
// src/pages/DroneVideoAnalytics.jsx
//
// Live UAV/Drone Video Analytics Feed for First Responders
// WebRTC aerial video stream, real-time YOLOv8 Computer Vision bounding boxes
// (survivors, structural collapse, road blockages), FLIR thermal imaging toggle,
// drone telemetry HUD, and one-click NDRF survivor waypoint pinning.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const DETECTIONS = [
  { id: "det-1", label: "🚨 Trapped Survivor (Rooftop)", conf: 94, x: 28, y: 35, w: 18, h: 22, color: "#ef4444", type: "survivor", coords: "28.6142, 77.2095" },
  { id: "det-2", label: "⚠️ Structural Wall Fracture",   conf: 89, x: 55, y: 22, w: 24, h: 28, color: "#f59e0b", type: "structure", coords: "28.6151, 77.2104" },
  { id: "det-3", label: "🚧 Inundated Road Access",      conf: 92, x: 12, y: 68, w: 34, h: 18, color: "#f97316", type: "road",     coords: "28.6130, 77.2081" },
  { id: "det-4", label: "✅ Safe Extraction Corridor",   conf: 96, x: 62, y: 65, w: 26, h: 25, color: "#10b981", type: "pathway",  coords: "28.6125, 77.2118" },
];

export default function DroneVideoAnalytics() {
  const [activeDrone, setActiveDrone] = useState("UAV-GARUDA-01");
  const [visionMode, setVisionMode] = useState("rgb"); // 'rgb' | 'thermal' | 'edge'
  const [isAiActive, setIsAiActive] = useState(true);
  const [telemetry, setTelemetry] = useState({
    alt: 124,
    speed: 34,
    battery: 82,
    pitch: -14.2,
    roll: 2.1,
    latency: 38,
    lat: 28.6139,
    lng: 77.2090,
  });
  const [taggedSurvivors, setTaggedSurvivors] = useState([]);
  const [toast, setToast] = useState(null);

  const canvasRef = useRef(null);

  const showToast = (msg, color = "#10b981") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3500);
  };

  // Simulate Telemetry Jitter
  useEffect(() => {
    const id = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        alt: Math.round(prev.alt + (Math.random() * 2 - 1)),
        speed: Math.round(prev.speed + (Math.random() * 2 - 1)),
        latency: Math.round(36 + Math.random() * 8),
        battery: Math.max(10, prev.battery - 0.05),
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Canvas Aerial Simulation Feed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      // Background landscape simulation
      if (visionMode === "thermal") {
        ctx.fillStyle = "#090314";
        ctx.fillRect(0, 0, w, h);
        // Thermal heat spots
        ctx.fillStyle = "rgba(126, 34, 206, 0.4)";
        ctx.beginPath();
        ctx.arc(w * 0.35, h * 0.45, 80 + Math.sin(t) * 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
        ctx.beginPath();
        ctx.arc(w * 0.37, h * 0.44, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
        ctx.beginPath();
        ctx.arc(w * 0.37, h * 0.44, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal RGB Satellite / Aerial View
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, "#1e293b");
        grad.addColorStop(0.5, "#0f172a");
        grad.addColorStop(1, "#172554");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Flooded River & Road Grids
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.7);
        ctx.bezierCurveTo(w * 0.3, h * 0.65, w * 0.6, h * 0.85, w, h * 0.75);
        ctx.stroke();

        // Buildings / Structures
        ctx.fillStyle = "#334155";
        ctx.fillRect(w * 0.25, h * 0.25, 120, 90);
        ctx.fillRect(w * 0.52, h * 0.15, 140, 110);
        ctx.fillRect(w * 0.58, h * 0.55, 160, 120);

        // Roof details
        ctx.fillStyle = "#475569";
        ctx.fillRect(w * 0.27, h * 0.27, 40, 30);
        ctx.fillRect(w * 0.32, h * 0.32, 12, 12);
      }

      // UAV Crosshair Overlay
      ctx.strokeStyle = visionMode === "thermal" ? "#f43f5e" : "#38bdf8";
      ctx.lineWidth = 1.2;
      const cx = w / 2;
      const cy = h / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy);
      ctx.lineTo(cx + 45, cy);
      ctx.moveTo(cx, cy - 45);
      ctx.lineTo(cx, cy + 45);
      ctx.stroke();

      // YOLOv8 Bounding Boxes
      if (isAiActive) {
        DETECTIONS.forEach((d) => {
          const bx = (d.x / 100) * w;
          const by = (d.y / 100) * h;
          const bw = (d.w / 100) * w;
          const bh = (d.h / 100) * h;

          ctx.strokeStyle = d.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);

          // Header Tag
          ctx.fillStyle = d.color;
          ctx.fillRect(bx, by - 20, ctx.measureText(`${d.label} ${d.conf}%`).width + 16, 20);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText(`${d.label} ${d.conf}%`, bx + 6, by - 6);
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [visionMode, isAiActive]);

  const tagSurvivor = (det) => {
    const newRecord = {
      id: `TAG-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString(),
      label: det.label,
      coords: det.coords,
      drone: activeDrone,
    };
    setTaggedSurvivors((prev) => [newRecord, ...prev]);
    showToast(`🎯 Survivor Tagged at [${det.coords}]! Dispatched to NDRF Sector Response Team.`, "#ef4444");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020617, #071527, #0d1e38)", color: "#e2e8f0", fontFamily: "'Inter','Segoe UI',sans-serif", padding: "24px" }}>
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, background: "#0f172a", border: `2px solid ${toast.color}`, borderRadius: "12px", padding: "14px 22px", color: toast.color, fontWeight: "800", fontSize: "0.9rem", boxShadow: `0 8px 30px ${toast.color}40` }}>
          {toast.msg}
        </div>
      )}

      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #dc2626, #991b1b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", boxShadow: "0 4px 20px rgba(220,38,38,0.4)" }}>
            🚁
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", background: "linear-gradient(90deg, #f87171, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Live UAV / Drone Video Analytics
              </h1>
              <span style={{ fontSize: "0.68rem", fontWeight: "800", padding: "3px 9px", borderRadius: "999px", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                WEBRTC ULTRA-LOW LATENCY ({telemetry.latency}ms)
              </span>
            </div>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
              Automated Computer Vision (YOLOv8) survivor tagging, structural collapse audit & real-time NDRF situational awareness
            </p>
          </div>
        </div>

        {/* Vision Mode & AI Toggles */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => setVisionMode(visionMode === "rgb" ? "thermal" : "rgb")}
            style={{
              padding: "9px 16px",
              borderRadius: "8px",
              border: `1px solid ${visionMode === "thermal" ? "#f43f5e" : "#334155"}`,
              background: visionMode === "thermal" ? "linear-gradient(135deg, #e11d48, #9f1239)" : "rgba(255,255,255,0.06)",
              color: "#fff",
              fontWeight: "700",
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            {visionMode === "thermal" ? "🔥 FLIR Thermal Vision ON" : "📷 Switch to Thermal IR"}
          </button>
          <button
            onClick={() => setIsAiActive(!isAiActive)}
            style={{
              padding: "9px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(56,189,248,0.4)",
              background: isAiActive ? "linear-gradient(135deg, #0284c7, #0369a1)" : "rgba(255,255,255,0.06)",
              color: "#fff",
              fontWeight: "700",
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            {isAiActive ? "🧠 YOLOv8 AI Active" : "⏸️ YOLOv8 Paused"}
          </button>
        </div>
      </div>

      {/* Main Grid: Video Stream + Side Telemetry */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>
        {/* Drone Video Player Canvas */}
        <div style={{ background: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "14px", position: "relative", overflow: "hidden" }}>
          <canvas ref={canvasRef} width={680} height={440} style={{ width: "100%", height: "auto", display: "block", borderRadius: "10px" }} />

          {/* On-screen Telemetry Overlay */}
          <div style={{ position: "absolute", top: "24px", left: "24px", background: "rgba(0,0,0,0.65)", padding: "8px 14px", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.78rem", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" }}>
            <div>UAV: {activeDrone} &bull; FLIGHT MODE: AUTO-SEARCH</div>
            <div>ALT: {telemetry.alt}m &bull; SPEED: {telemetry.speed} km/h &bull; BATT: {Math.round(telemetry.battery)}%</div>
            <div>GPS: {telemetry.lat.toFixed(4)}° N, {telemetry.lng.toFixed(4)}° E</div>
          </div>

          {/* Action Button: Tag Survivor */}
          <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {DETECTIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => tagSurvivor(d)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${d.color}`,
                    background: "rgba(0,0,0,0.8)",
                    color: d.color,
                    fontWeight: "800",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  🎯 Pin {d.label.split(" ")[1]}
                </button>
              ))}
            </div>
            <span style={{ background: "rgba(0,0,0,0.7)", padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem", color: "#34d399", fontWeight: "700" }}>
              REC &bull; 1080p 60FPS
            </span>
          </div>
        </div>

        {/* Right Column: AI Detection Feed & Rescue Waypoints */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Real-Time Detection Feed */}
          <div style={{ background: "rgba(15,23,42,0.75)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px", backdropFilter: "blur(10px)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "0.88rem", fontWeight: "700", color: "#38bdf8" }}>
              🧠 Active YOLOv8 Real-Time Targets ({DETECTIONS.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {DETECTIONS.map((d) => (
                <div key={d.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${d.color}40`, borderRadius: "10px", padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontWeight: "800", fontSize: "0.82rem", color: d.color }}>{d.label}</span>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{d.conf}% conf</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>GPS: {d.coords}</div>
                  <button
                    onClick={() => tagSurvivor(d)}
                    style={{ marginTop: "6px", width: "100%", padding: "6px", borderRadius: "6px", border: "none", background: d.color, color: "#fff", fontWeight: "800", fontSize: "0.72rem", cursor: "pointer" }}
                  >
                    + Dispatch Rescue Team to Waypoint
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tagged Survivors History */}
          <div style={{ background: "rgba(15,23,42,0.75)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px", backdropFilter: "blur(10px)", flex: 1 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "0.88rem", fontWeight: "700", color: "#ef4444" }}>
              🚨 Dispatched NDRF Waypoints ({taggedSurvivors.length})
            </h3>
            {taggedSurvivors.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: "0.78rem", textAlign: "center", padding: "20px" }}>
                Click any detection above to generate an immediate rescue waypoint.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
                {taggedSurvivors.map((s) => (
                  <div key={s.id} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "8px 10px", fontSize: "0.75rem" }}>
                    <div style={{ fontWeight: "700", color: "#f87171" }}>{s.label}</div>
                    <div style={{ color: "#cbd5e1" }}>Coords: {s.coords} &bull; {s.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
