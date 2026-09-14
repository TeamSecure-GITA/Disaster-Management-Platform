// ─────────────────────────────────────────────────────────────────────────────
// src/pages/DynamicEvacuationRouter.jsx
//
// Dynamic AI Evacuation Router
// Live traffic load distribution across multiple routes, congestion heatmap,
// per-user route assignment, and auto-rebalancing simulation.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from "react";

const ROUTES = [
  { id: "R1", name: "Highway NH-16 North",  color: "#34d399", capacity: 2000, nodes: [[5,2],[5,4],[5,6],[5,8],[3,9],[2,9]] },
  { id: "R2", name: "Ring Road East",       color: "#60a5fa", capacity: 1500, nodes: [[5,2],[7,3],[9,4],[10,6],[10,8],[10,9]] },
  { id: "R3", name: "Bypass Route West",    color: "#f97316", capacity: 1200, nodes: [[5,2],[3,3],[2,5],[2,7],[2,9]] },
  { id: "R4", name: "Mountain Corridor",    color: "#a78bfa", capacity: 800,  nodes: [[5,2],[6,4],[7,6],[6,8],[5,9]] },
];

const EVAC_CENTER = [5, 2];
const SAFE_ZONES  = [[2,9],[10,9],[5,9]];

const CONGESTION_COLOR = (pct) => {
  if (pct < 40)  return "#34d399";
  if (pct < 65)  return "#fbbf24";
  if (pct < 85)  return "#f97316";
  return "#ef4444";
};

const GRID_W = 13;
const GRID_H = 11;
const CELL   = 44;

export default function DynamicEvacuationRouter() {
  const [loads, setLoads]     = useState({ R1: 320, R2: 280, R3: 190, R4: 80 });
  const [running, setRunning] = useState(false);
  const [tick, setTick]       = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [reassignments, setReassignments] = useState(0);
  const [totalEvacuated, setTotalEvacuated] = useState(4280);
  const [log, setLog]         = useState([
    { id: 1, msg: "System initialised. Monitoring 4 evacuation corridors.", color: "#64748b" },
    { id: 2, msg: "Route R1 (NH-16) is primary — highest capacity.", color: "#34d399" },
  ]);

  const addLog = useCallback((msg, color = "#94a3b8") => {
    setLog(prev => [{ id: Date.now(), msg, color }, ...prev].slice(0, 30));
  }, []);

  // Auto-rebalancing AI
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTick(p => p + 1);
      setLoads(prev => {
        // Simulate incoming vehicles
        const incoming = Math.floor(Math.random() * 60) + 20;
        const capacities = ROUTES.map(r => r.capacity);
        const currentPcts = ROUTES.map(r => prev[r.id] / r.capacity);

        // AI: assign to least-loaded route proportionally
        let bestRoute = ROUTES[0];
        let minPct = currentPcts[0];
        ROUTES.forEach((r, i) => { if (currentPcts[i] < minPct) { minPct = currentPcts[i]; bestRoute = r; } });

        const newLoads = { ...prev };
        // Drain all routes slightly (vehicles reaching safe zone)
        ROUTES.forEach(r => { newLoads[r.id] = Math.max(0, newLoads[r.id] - Math.floor(Math.random() * 25 + 5)); });
        // Add new vehicles to best route
        newLoads[bestRoute.id] = Math.min(bestRoute.capacity, newLoads[bestRoute.id] + incoming);

        // Check if rebalancing needed
        const pcts = ROUTES.map(r => newLoads[r.id] / r.capacity);
        const maxPct = Math.max(...pcts);
        if (maxPct > 0.85) {
          const overloadedRoute = ROUTES[pcts.indexOf(maxPct)];
          const spillTo = ROUTES.find(r => r.id !== overloadedRoute.id && newLoads[r.id] / r.capacity < 0.6);
          if (spillTo) {
            const shift = Math.floor(newLoads[overloadedRoute.id] * 0.15);
            newLoads[overloadedRoute.id] -= shift;
            newLoads[spillTo.id] = Math.min(spillTo.capacity, newLoads[spillTo.id] + shift);
            setReassignments(p => p + 1);
            addLog(`🔀 AI: Rerouted ${shift} vehicles from ${overloadedRoute.name} → ${spillTo.name}`, "#fbbf24");
          }
        }

        setTotalEvacuated(p => p + Math.floor(Math.random() * 40 + 10));
        return newLoads;
      });

      // Generate animated vehicles
      setVehicles(prev => {
        const newVehicles = ROUTES.map(r => {
          const t = (Date.now() / 3000) % 1;
          const nodeIdx = Math.floor(t * (r.nodes.length - 1));
          const frac    = (t * (r.nodes.length - 1)) % 1;
          const n0 = r.nodes[nodeIdx];
          const n1 = r.nodes[Math.min(nodeIdx + 1, r.nodes.length - 1)];
          const x = n0[0] + (n1[0] - n0[0]) * frac;
          const y = n0[1] + (n1[1] - n0[1]) * frac;
          return { id: r.id, x, y, color: r.color };
        });
        return newVehicles;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [running, addLog]);

  const svgW = GRID_W * CELL;
  const svgH = GRID_H * CELL;

  const simulateHerdDispatch = () => {
    const r1Load = loads.R1 / ROUTES[0].capacity;
    let shiftMsg = "";
    if (r1Load > 0.45) {
      // Divert to R2 (300) and R3 (200) to avoid herd gridlock
      setLoads(prev => ({
        ...prev,
        R2: Math.min(ROUTES[1].capacity, prev.R2 + 300),
        R3: Math.min(ROUTES[2].capacity, prev.R3 + 200),
      }));
      setReassignments(p => p + 500);
      setTotalEvacuated(p => p + 500);
      shiftMsg = "🛡️ Anti-Herd Rebalancer: Route A (NH-16) at capacity threshold! Automatically routed 300 evacuees → Route B (Ring Road) & 200 evacuees → Route C (Bypass) to prevent highway gridlock.";
      addLog(shiftMsg, "#fbbf24");
    } else {
      setLoads(prev => ({
        ...prev,
        R1: Math.min(ROUTES[0].capacity, prev.R1 + 200),
        R2: Math.min(ROUTES[1].capacity, prev.R2 + 150),
        R3: Math.min(ROUTES[2].capacity, prev.R3 + 150),
      }));
      setTotalEvacuated(p => p + 500);
      shiftMsg = "⚡ Multi-Corridor Flow: Dispatched 500 citizens dynamically across parallel safe paths.";
      addLog(shiftMsg, "#34d399");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#020617,#0c1526,#071220)", color: "#e2e8f0", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "linear-gradient(135deg,#d97706,#92400e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: "0 4px 20px rgba(217,119,6,0.4)" }}>🚗</div>
        <div style={{ flex: 1, minWidth: "240px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", background: "linear-gradient(90deg,#fbbf24,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Dynamic AI Evacuation Router
            </h1>
            <span style={{ fontSize: "0.72rem", backgroundColor: "#0284c7", color: "#fff", padding: "2px 8px", borderRadius: "999px", fontWeight: "800" }}>
              ANTI-HERD AI
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>
            Live traffic balancing · Avoids Google Maps single-road herd gridlock · Multi-corridor quota rebalancing
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={simulateHerdDispatch}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1px solid #f59e0b",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "0.85rem",
              background: "rgba(245,158,11,0.15)",
              color: "#fbbf24",
              boxShadow: "0 4px 12px rgba(245,158,11,0.2)",
            }}
          >
            🔀 Simulate +500 Evacuees (Test Anti-Herd)
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(!running);
              if (!running) addLog("▶️ Live simulation started", "#34d399");
              else addLog("⏸️ Simulation paused", "#64748b");
            }}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "0.88rem",
              background: running ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#16a34a,#15803d)",
              color: "#fff",
              boxShadow: running ? "0 4px 14px rgba(220,38,38,0.35)" : "0 4px 14px rgba(22,163,74,0.35)",
            }}
          >
            {running ? "⏸ Pause" : "▶ Start Flow"}
          </button>
        </div>
      </div>

      {/* Anti-Herd Banner & Personal Assignment Card */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "14px", marginBottom: "20px" }}>
        {/* Anti-Herd Comparison */}
        <div style={{ backgroundColor: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "14px 18px" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            ⚖️ Google Maps vs Our Anti-Herd Dynamic Router
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.78rem" }}>
            <div style={{ padding: "8px", backgroundColor: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "8px" }}>
              <div style={{ color: "#ef4444", fontWeight: "700" }}>❌ Standard Google Maps:</div>
              <div style={{ color: "#cbd5e1", marginTop: "4px" }}>
                Routes 100% of evacuees down Highway NH-16. Causes a 4-hour deadlock &amp; catastrophic herd gridlock.
              </div>
            </div>
            <div style={{ padding: "8px", backgroundColor: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "8px" }}>
              <div style={{ color: "#34d399", fontWeight: "700" }}>✓ Our Dynamic AI Platform:</div>
              <div style={{ color: "#cbd5e1", marginTop: "4px" }}>
                Capped at safe thresholds. Automatically routes next 500 users across Route B &amp; C for steady multi-lane clearance.
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Assigned Route Badge */}
        <div style={{ backgroundColor: "rgba(15,23,42,0.7)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: "14px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ fontSize: "2.2rem" }}>🎯</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: "700", textTransform: "uppercase" }}>
              Your Personal AI Assigned Corridor
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#f8fafc", margin: "2px 0" }}>
              Route B: Ring Road East → Safe Shelter Point C
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Flow Speed: <strong style={{ color: "#34d399" }}>42 km/h</strong> &bull; Est. Exit Time: <strong style={{ color: "#38bdf8" }}>14 mins</strong> &bull; Zero Gridlock Risk
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Evacuated",   value: totalEvacuated.toLocaleString(), icon: "👥", color: "#34d399" },
          { label: "Anti-Herd Reroutes",value: reassignments,                    icon: "🔀", color: "#fbbf24" },
          { label: "Active Corridors",  value: ROUTES.length,                    icon: "🛣️", color: "#60a5fa" },
          { label: "Avg Load",          value: `${Math.round(Object.entries(loads).reduce((acc, [id, v]) => acc + v / (ROUTES.find(r=>r.id===id)?.capacity||1), 0) / ROUTES.length * 100)}%`, icon: "📊", color: "#f97316" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px", backdropFilter: "blur(10px)" }}>
            <div style={{ fontSize: "1.3rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>
        {/* MAP */}
        <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px", backdropFilter: "blur(10px)" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "0.85rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>🗺️ Live Route Map</h3>
          <div style={{ overflowX: "auto" }}>
            <svg width={svgW} height={svgH} style={{ display: "block" }}>
              {/* Grid */}
              {Array.from({ length: GRID_W }).map((_, x) =>
                Array.from({ length: GRID_H }).map((_, y) => (
                  <rect key={`${x}-${y}`} x={x*CELL} y={y*CELL} width={CELL} height={CELL}
                    fill={x%2===y%2 ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.15)"} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                ))
              )}

              {/* Routes */}
              {ROUTES.map(route => {
                const pct = loads[route.id] / route.capacity;
                const col = CONGESTION_COLOR(pct * 100);
                const pts = route.nodes.map(([cx,cy]) => `${cx*CELL+CELL/2},${cy*CELL+CELL/2}`).join(" ");
                return (
                  <polyline key={route.id} points={pts} fill="none" stroke={col}
                    strokeWidth={4 + pct * 4} strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray={running ? "8 4" : "none"}
                    style={{ filter: `drop-shadow(0 0 6px ${col}80)` }}
                  />
                );
              })}

              {/* Evacuation center */}
              <circle cx={EVAC_CENTER[0]*CELL+CELL/2} cy={EVAC_CENTER[1]*CELL+CELL/2} r={16} fill="#ef4444" opacity={0.9} style={{ filter: "drop-shadow(0 0 12px #ef4444)" }} />
              <text x={EVAC_CENTER[0]*CELL+CELL/2} y={EVAC_CENTER[1]*CELL+CELL/2+5} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">⚠️</text>

              {/* Safe zones */}
              {SAFE_ZONES.map(([cx,cy], i) => (
                <g key={i}>
                  <circle cx={cx*CELL+CELL/2} cy={cy*CELL+CELL/2} r={14} fill="#16a34a" opacity={0.9} style={{ filter: "drop-shadow(0 0 10px #16a34a)" }} />
                  <text x={cx*CELL+CELL/2} y={cy*CELL+CELL/2+4} textAnchor="middle" fill="#fff" fontSize="11">✓</text>
                </g>
              ))}

              {/* Animated vehicles */}
              {running && vehicles.map(v => (
                <circle key={v.id} cx={v.x*CELL+CELL/2} cy={v.y*CELL+CELL/2} r={6} fill={v.color} opacity={0.95}
                  style={{ filter: `drop-shadow(0 0 8px ${v.color})` }} />
              ))}

              {/* Legend labels */}
              <text x={EVAC_CENTER[0]*CELL+CELL/2} y={EVAC_CENTER[1]*CELL+CELL/2+30} textAnchor="middle" fill="#ef4444" fontSize="9">DISASTER</text>
              {SAFE_ZONES.map(([cx,cy], i) => (
                <text key={i} x={cx*CELL+CELL/2} y={cy*CELL+CELL/2+28} textAnchor="middle" fill="#34d399" fontSize="9">SAFE</text>
              ))}
            </svg>
          </div>

          {/* Route Legend */}
          <div style={{ display: "flex", gap: "12px", marginTop: "14px", flexWrap: "wrap" }}>
            {ROUTES.map(r => {
              const pct = Math.round((loads[r.id] / r.capacity) * 100);
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "24px", height: "4px", borderRadius: "2px", backgroundColor: CONGESTION_COLOR(pct) }} />
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{r.id}: {pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Route Cards */}
          <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px", backdropFilter: "blur(10px)" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "0.85rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>📊 Route Load</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {ROUTES.map(route => {
                const pct = Math.round((loads[route.id] / route.capacity) * 100);
                const col = CONGESTION_COLOR(pct);
                return (
                  <div key={route.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", fontWeight: "600", color: route.color }}>{route.id}</span>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginLeft: "6px" }}>{route.name}</span>
                      </div>
                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: col }}>{pct}%</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: "4px", transition: "width 0.8s" }} />
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: "3px" }}>
                      {loads[route.id].toLocaleString()} / {route.capacity.toLocaleString()} vehicles
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Log */}
          <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px", backdropFilter: "blur(10px)", flex: 1 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "0.85rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>🤖 AI Decision Log</h3>
            <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
              {log.map(e => (
                <div key={e.id} style={{ fontSize: "0.75rem", color: e.color, padding: "5px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>{e.msg}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
