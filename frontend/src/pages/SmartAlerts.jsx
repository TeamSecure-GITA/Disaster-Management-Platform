// ─────────────────────────────────────────────────────────────────────────────
// src/pages/SmartAlerts.jsx
//
// Multi-Sensory Decentralized Alerts — Smart Home Ecosystem Integration
// Flash smart lights, trigger vibrating wearables, override TVs & audio systems
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from "react";

const ZONES = [
  { id: "A", name: "Zone A — City Center",    risk: "HIGH",   color: "#ef4444", bg: "rgba(239,68,68,0.15)"  },
  { id: "B", name: "Zone B — Riverside",      risk: "HIGH",   color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  { id: "C", name: "Zone C — North District", risk: "MEDIUM", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  { id: "D", name: "Zone D — East Quarter",   risk: "MEDIUM", color: "#f97316", bg: "rgba(249,115,22,0.10)" },
  { id: "E", name: "Zone E — Suburbs",        risk: "LOW",    color: "#eab308", bg: "rgba(234,179,8,0.10)"  },
  { id: "F", name: "Zone F — Hills",          risk: "LOW",    color: "#eab308", bg: "rgba(234,179,8,0.08)"  },
];

const ALERT_TYPES = [
  { id: "flood",     label: "🌊 Flash Flood",      severity: "CRITICAL", color: "#38bdf8" },
  { id: "quake",     label: "🏚️ Earthquake",        severity: "CRITICAL", color: "#f97316" },
  { id: "fire",      label: "🔥 Wildfire",          severity: "HIGH",     color: "#ef4444" },
  { id: "hurricane", label: "🌀 Hurricane Warning", severity: "HIGH",     color: "#a78bfa" },
  { id: "landslide", label: "⛰️ Landslide",         severity: "MEDIUM",   color: "#fbbf24" },
  { id: "tsunami",   label: "🌊 Tsunami",           severity: "CRITICAL", color: "#0ea5e9" },
];

const DEVICES = [
  { id: "lights",   icon: "💡", label: "Smart Lights",    action: "Flash RED + Strobe",       desc: "Philips Hue / LIFX ecosystem" },
  { id: "wearable", icon: "⌚", label: "Wearables",       action: "Vibrate SOS Pattern",      desc: "Fitbit / Apple Watch / Galaxy" },
  { id: "tv",       icon: "📺", label: "Smart TVs",       action: "Override with Alert",      desc: "Overrides all content" },
  { id: "speaker",  icon: "🔊", label: "Smart Speakers",  action: "Audio Alarm + Message",    desc: "Alexa / Google Home" },
  { id: "phone",    icon: "📱", label: "Mobile Phones",   action: "Push + Vibrate + Siren",   desc: "Direct OS-level alert" },
  { id: "display",  icon: "🖥️", label: "Digital Signage", action: "Evacuation Instructions", desc: "Public displays & billboards" },
];

const cardStyle = {
  background: "rgba(15,23,42,0.7)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "20px",
  backdropFilter: "blur(12px)",
};

function useInterval(fn, delay, active) {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; }, [fn]);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => ref.current(), delay);
    return () => clearInterval(id);
  }, [delay, active]);
}

export default function SmartAlerts() {
  const [alertType, setAlertType]       = useState(ALERT_TYPES[0]);
  const [selectedZones, setSelectedZones] = useState(["A", "B"]);
  const [enabledDevices, setEnabledDevices] = useState(
    Object.fromEntries(DEVICES.map(d => [d.id, true]))
  );
  const [broadcasting, setBroadcasting] = useState(false);
  const [flashOn, setFlashOn]           = useState(false);
  const [vibStep, setVibStep]           = useState(0);
  const [tvOverride, setTvOverride]     = useState(false);
  const [log, setLog]                   = useState([]);
  const [alertsSent, setAlertsSent]     = useState({ total: 0, devices: 0, people: 0 });

  const addLog = useCallback((msg, color = "#94a3b8") => {
    const time = new Date().toLocaleTimeString();
    setLog(prev => [{ time, msg, color, id: Date.now() + Math.random() }, ...prev].slice(0, 40));
  }, []);

  useInterval(() => setFlashOn(p => !p), 400, broadcasting && enabledDevices.lights);
  useInterval(() => setVibStep(p => (p + 1) % 9), 300, broadcasting && enabledDevices.wearable);
  useInterval(() => setTvOverride(p => !p), 2000, broadcasting && enabledDevices.tv);
  useInterval(() => {
    setAlertsSent(prev => ({
      total: prev.total + selectedZones.length * 3,
      devices: prev.devices + Object.values(enabledDevices).filter(Boolean).length,
      people: prev.people + Math.floor(Math.random() * 800 + 200),
    }));
    const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
    const zone = ZONES.find(z => selectedZones.includes(z.id));
    if (zone) addLog(`${device.icon} [${zone.id}] ${device.label}: ${device.action}`, "#60a5fa");
  }, 1500, broadcasting);

  const startBroadcast = () => {
    if (!selectedZones.length) return;
    setBroadcasting(true);
    setLog([]);
    setAlertsSent({ total: 0, devices: 0, people: 0 });
    addLog(`🚨 BROADCAST STARTED — ${alertType.label}`, "#ef4444");
    addLog(`📡 Targeting zones: ${selectedZones.join(", ")}`, "#f97316");
    Object.entries(enabledDevices).forEach(([id, on]) => {
      if (on) {
        const d = DEVICES.find(d => d.id === id);
        addLog(`✓ ${d.icon} ${d.label} → ${d.action}`, "#34d399");
      }
    });
  };

  const stopBroadcast = () => {
    setBroadcasting(false);
    setFlashOn(false);
    setTvOverride(false);
    addLog("⛔ Broadcast terminated by operator", "#94a3b8");
  };

  const toggleZone = (id) => {
    setSelectedZones(prev => prev.includes(id) ? prev.filter(z => z !== id) : [...prev, id]);
  };

  const vibrateActive = [1,1,1,0,1,1,1,1,1,0][vibStep] === 1;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0c1526 50%, #0b1629 100%)",
      color: "#e2e8f0",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      padding: "24px",
    }}>
      {/* Global Flash Overlay */}
      {broadcasting && enabledDevices.lights && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none",
          backgroundColor: flashOn ? "rgba(239,68,68,0.18)" : "transparent",
          transition: "background-color 0.12s",
        }} />
      )}

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px",
            background: "linear-gradient(135deg, #059669, #065f46)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", boxShadow: "0 4px 20px rgba(5,150,105,0.4)",
          }}>📡</div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", background: "linear-gradient(90deg,#34d399,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Multi-Sensory Alert System
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
              Smart Home Ecosystem Integration · Decentralized Emergency Broadcasting
            </p>
          </div>
          {broadcasting && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "20px", padding: "6px 14px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444", animation: "blink 1s infinite" }} />
              <span style={{ color: "#ef4444", fontSize: "0.8rem", fontWeight: "700" }}>LIVE BROADCAST</span>
            </div>
          )}
        </div>

        {broadcasting && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginTop: "16px" }}>
            {[
              { label: "Alerts Sent",      value: alertsSent.total.toLocaleString(),   icon: "📨", color: "#60a5fa" },
              { label: "Device Pings",     value: alertsSent.devices.toLocaleString(), icon: "📡", color: "#34d399" },
              { label: "People Notified",  value: alertsSent.people.toLocaleString(),  icon: "👥", color: "#f97316" },
            ].map(s => (
              <div key={s.label} style={{ ...cardStyle, textAlign: "center", padding: "14px" }}>
                <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Alert Type */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 14px", fontSize: "0.85rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>🚨 Alert Type</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {ALERT_TYPES.map(at => (
                <button key={at.id} onClick={() => setAlertType(at)} style={{
                  background: alertType.id === at.id ? at.color + "25" : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${alertType.id === at.id ? at.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "10px", padding: "10px 8px", cursor: "pointer",
                  color: alertType.id === at.id ? at.color : "#94a3b8",
                  fontSize: "0.78rem", fontWeight: alertType.id === at.id ? "700" : "500",
                  textAlign: "left", transition: "all 0.15s",
                }}>
                  <div>{at.label}</div>
                  <div style={{ fontSize: "0.62rem", opacity: 0.7, marginTop: "2px" }}>{at.severity}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Zone Selector */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 14px", fontSize: "0.85rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>🗺️ Target Zones</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {ZONES.map(zone => (
                <div key={zone.id} onClick={() => toggleZone(zone.id)} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                  background: selectedZones.includes(zone.id) ? zone.bg : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selectedZones.includes(zone.id) ? zone.color + "60" : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.15s",
                }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "5px",
                    border: `2px solid ${selectedZones.includes(zone.id) ? zone.color : "#374151"}`,
                    background: selectedZones.includes(zone.id) ? zone.color : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {selectedZones.includes(zone.id) && <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>}
                  </div>
                  <span style={{ flex: 1, fontSize: "0.83rem", color: selectedZones.includes(zone.id) ? "#e2e8f0" : "#64748b" }}>{zone.name}</span>
                  <span style={{ fontSize: "0.62rem", fontWeight: "700", padding: "2px 7px", borderRadius: "4px", backgroundColor: zone.color + "22", color: zone.color }}>{zone.risk}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={broadcasting ? stopBroadcast : startBroadcast} disabled={!selectedZones.length} style={{
            width: "100%", padding: "16px", borderRadius: "12px", border: "none",
            cursor: selectedZones.length ? "pointer" : "not-allowed",
            background: broadcasting ? "linear-gradient(135deg,#7f1d1d,#991b1b)" : selectedZones.length ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "rgba(255,255,255,0.05)",
            color: "#ffffff", fontSize: "1rem", fontWeight: "800",
            boxShadow: broadcasting ? "0 0 30px rgba(239,68,68,0.5)" : "none",
            transition: "all 0.2s",
          }}>
            {broadcasting ? "⛔  TERMINATE BROADCAST" : "🚨  BROADCAST ALERT NOW"}
          </button>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Devices */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 14px", fontSize: "0.85rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>📲 Device Ecosystem</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {DEVICES.map(device => {
                const isActive = broadcasting && enabledDevices[device.id];
                const isVibrating = device.id === "wearable" && isActive && vibrateActive;
                const isTvOn     = device.id === "tv" && isActive && tvOverride;
                const isFlashing = device.id === "lights" && isActive && flashOn;
                return (
                  <div key={device.id} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "11px 13px", borderRadius: "12px",
                    background: isActive ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"}`,
                    transition: "all 0.2s",
                  }}>
                    <div style={{
                      fontSize: "1.5rem",
                      filter: isFlashing ? "brightness(2.5) saturate(3)" : "none",
                      transform: isVibrating ? `translateX(${vibrateActive ? 2 : -2}px)` : "none",
                      textShadow: isTvOn ? "0 0 16px #ef4444" : "none",
                      transition: "transform 0.08s, filter 0.15s",
                    }}>{device.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.83rem", fontWeight: "600", color: isActive ? "#e2e8f0" : "#64748b" }}>{device.label}</div>
                      <div style={{ fontSize: "0.7rem", color: isActive ? "#f97316" : "#475569" }}>
                        {isActive ? device.action : device.desc}
                      </div>
                    </div>
                    <label style={{ cursor: "pointer" }} onClick={() => setEnabledDevices(prev => ({ ...prev, [device.id]: !prev[device.id] }))}>
                      <div style={{
                        width: "36px", height: "20px", borderRadius: "10px",
                        background: enabledDevices[device.id] ? "#16a34a" : "#374151",
                        position: "relative", transition: "background 0.2s",
                      }}>
                        <div style={{
                          position: "absolute", top: "2px",
                          left: enabledDevices[device.id] ? "18px" : "2px",
                          width: "16px", height: "16px", borderRadius: "50%",
                          background: "#ffffff", transition: "left 0.2s",
                        }} />
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Log */}
          <div style={{ ...cardStyle, flex: 1 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "0.85rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>📋 Broadcast Log</h3>
            <div style={{ maxHeight: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "5px" }}>
              {log.length === 0
                ? <div style={{ color: "#475569", fontSize: "0.82rem", textAlign: "center", padding: "20px 0" }}>No broadcast active. Configure and fire above.</div>
                : log.map(e => (
                  <div key={e.id} style={{ display: "flex", gap: "10px" }}>
                    <span style={{ color: "#475569", fontSize: "0.67rem", flexShrink: 0, marginTop: "2px" }}>{e.time}</span>
                    <span style={{ color: e.color, fontSize: "0.76rem" }}>{e.msg}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* TV Override Toast */}
      {broadcasting && enabledDevices.tv && tvOverride && (
        <div style={{
          position: "fixed", bottom: "20px", right: "20px", zIndex: 9998,
          background: "linear-gradient(135deg,#1a0000,#330000)",
          border: "3px solid #ef4444", borderRadius: "12px",
          padding: "16px 20px", maxWidth: "300px",
          boxShadow: "0 0 40px rgba(239,68,68,0.6)",
        }}>
          <div style={{ color: "#ef4444", fontWeight: "800", fontSize: "0.88rem", marginBottom: "6px" }}>📺 SMART TV OVERRIDE ACTIVE</div>
          <div style={{ color: "#fca5a5", fontSize: "0.77rem", lineHeight: 1.5 }}>
            ⚠️ Emergency: {alertType.label}<br />
            Zones: {selectedZones.join(", ")} — Evacuate immediately.
          </div>
        </div>
      )}

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
    </div>
  );
}
