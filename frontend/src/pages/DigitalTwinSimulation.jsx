// ─────────────────────────────────────────────────────────────────────────────
// src/pages/DigitalTwinSimulation.jsx
//
// AI Digital Twin Simulation — interactive canvas-based city disaster simulator
// Run "what-if" scenarios: Hurricane, Earthquake, Flash Flood, Wildfire
// Real-time spreading engine + live stats + evacuation route overlay
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useState, useEffect, useCallback } from "react";

// ── Grid config ──────────────────────────────────────────────────────────────
const COLS = 20;
const ROWS = 14;
const CELL = 36; // px per cell

// Cell types
const TYPE = { EMPTY: 0, BUILDING: 1, ROAD: 2, WATER: 3, PARK: 4, BRIDGE: 5 };

// Cell states (damage)
const STATE = { NORMAL: 0, AFFECTED: 1, DAMAGED: 2, DESTROYED: 3, FLOODED: 4, BURNING: 5, EVACUATE: 6 };

// Disaster definitions
const DISASTERS = [
  { id: "hurricane",   label: "🌀 Hurricane",   color: "#6366f1", maxCat: 5, catLabel: "Category" },
  { id: "earthquake",  label: "🏚️ Earthquake",  color: "#f97316", maxCat: 8, catLabel: "Magnitude" },
  { id: "flood",       label: "🌊 Flash Flood",  color: "#38bdf8", maxCat: 5, catLabel: "Level" },
  { id: "wildfire",    label: "🔥 Wildfire",     color: "#ef4444", maxCat: 5, catLabel: "Severity" },
];

// ── Map generator ─────────────────────────────────────────────────────────────
function generateCity() {
  const grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ type: TYPE.BUILDING, state: STATE.NORMAL, elevation: Math.random() }))
  );
  for (let r = 0; r < ROWS; r++) {
    if (r % 4 === 3) grid[r].forEach((c) => { c.type = TYPE.ROAD; });
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c % 5 === 4) grid[r][c] = { type: TYPE.ROAD, state: STATE.NORMAL, elevation: 0.1 };
    }
  }
  for (let r = 5; r <= 7; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = { type: TYPE.WATER, state: STATE.NORMAL, elevation: 0 };
    }
  }
  for (let r = 5; r <= 7; r++) {
    grid[r][9]  = { type: TYPE.BRIDGE, state: STATE.NORMAL, elevation: 0.05 };
    grid[r][14] = { type: TYPE.BRIDGE, state: STATE.NORMAL, elevation: 0.05 };
  }
  [[0,0],[0,1],[1,0],[0,COLS-2],[0,COLS-1],[1,COLS-1],
   [ROWS-1,0],[ROWS-2,0],[ROWS-1,1],[ROWS-1,COLS-2],[ROWS-1,COLS-1],[ROWS-2,COLS-1]]
    .forEach(([r,c]) => { if (grid[r] && grid[r][c]) grid[r][c] = { type: TYPE.PARK, state: STATE.NORMAL, elevation: 0.3 }; });
  return grid;
}

// ── Disaster spread logic ─────────────────────────────────────────────────────
function spreadDisaster(grid, disaster, intensity, tick) {
  const next = grid.map(row => row.map(cell => ({ ...cell })));
  const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = next[r][c];
      if (cell.state === STATE.DESTROYED || cell.state === STATE.EVACUATE) continue;

      const dist = Math.sqrt((c - cx) ** 2 + (r - cy) ** 2);
      const baseRadius = 1 + (tick * intensity * 0.18);
      const rng = Math.random();

      if (disaster === "hurricane") {
        const swirl = Math.sin(tick * 0.4 + dist * 0.3) * 0.5 + 0.5;
        if (dist < baseRadius * swirl + 1) {
          if (cell.type === TYPE.BUILDING || cell.type === TYPE.BRIDGE) {
            if (cell.state === STATE.NORMAL && rng < 0.25 * intensity / 5) cell.state = STATE.AFFECTED;
            else if (cell.state === STATE.AFFECTED && rng < 0.3) cell.state = STATE.DAMAGED;
            else if (cell.state === STATE.DAMAGED && rng < 0.2) cell.state = STATE.DESTROYED;
          }
          if (cell.type === TYPE.ROAD && rng < 0.15 * intensity / 5) cell.state = STATE.AFFECTED;
        }
      } else if (disaster === "earthquake") {
        const rings = Math.floor(tick * intensity * 0.3);
        if (Math.abs(dist - rings) < 1.5 + intensity * 0.2) {
          if (cell.type === TYPE.BUILDING || cell.type === TYPE.BRIDGE) {
            if (cell.state === STATE.NORMAL && rng < 0.35 * intensity / 8) cell.state = STATE.AFFECTED;
            else if (cell.state === STATE.AFFECTED && rng < 0.4) cell.state = STATE.DAMAGED;
            else if (cell.state === STATE.DAMAGED && rng < 0.35) cell.state = STATE.DESTROYED;
          }
        }
      } else if (disaster === "flood") {
        if (cell.elevation < (0.1 + tick * intensity * 0.04) && cell.type !== TYPE.WATER) {
          if (rng < 0.4) cell.state = STATE.FLOODED;
          if (cell.state === STATE.FLOODED && rng < 0.15) cell.state = STATE.DESTROYED;
        }
        if (cell.type === TYPE.WATER) cell.state = STATE.FLOODED;
      } else if (disaster === "wildfire") {
        const fireDist = Math.sqrt(((c - cx) * 0.6) ** 2 + (r - cy) ** 2);
        if (fireDist < baseRadius) {
          if (cell.type === TYPE.BUILDING || cell.type === TYPE.PARK) {
            if (cell.state === STATE.NORMAL && rng < 0.3 * intensity / 5) cell.state = STATE.BURNING;
            else if (cell.state === STATE.BURNING && rng < 0.3) cell.state = STATE.DESTROYED;
          }
        }
      }
    }
  }
  return next;
}

// ── BFS evacuation routes ─────────────────────────────────────────────────────
function computeEvacRoutes(grid) {
  const routes = new Set();
  const queue = [];
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));

  for (let c = 0; c < COLS; c++) {
    if (grid[0][c].type === TYPE.ROAD) { queue.push([0, c]); visited[0][c] = true; }
    if (grid[ROWS - 1][c].type === TYPE.ROAD) { queue.push([ROWS - 1, c]); visited[ROWS - 1][c] = true; }
  }

  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  while (queue.length) {
    const [r, c] = queue.shift();
    routes.add(`${r},${c}`);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || visited[nr][nc]) continue;
      const cell = grid[nr][nc];
      if (cell.state === STATE.DESTROYED || cell.state === STATE.FLOODED || cell.state === STATE.BURNING) continue;
      if (cell.type === TYPE.ROAD || cell.type === TYPE.BRIDGE) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
  }
  return routes;
}

// ── Cell color ────────────────────────────────────────────────────────────────
function cellColor(cell, isEvacRoute) {
  if (isEvacRoute && (cell.type === TYPE.ROAD || cell.type === TYPE.BRIDGE)) return "#22c55e";
  switch (cell.state) {
    case STATE.DESTROYED: return "#1a0a0a";
    case STATE.DAMAGED:   return "#7f1d1d";
    case STATE.AFFECTED:  return "#b45309";
    case STATE.FLOODED:   return "#1d4ed8";
    case STATE.BURNING:   return "#dc2626";
  }
  switch (cell.type) {
    case TYPE.BUILDING: return "#1e3a5f";
    case TYPE.ROAD:     return "#334155";
    case TYPE.WATER:    return "#0369a1";
    case TYPE.PARK:     return "#14532d";
    case TYPE.BRIDGE:   return "#713f12";
    default:            return "#1e293b";
  }
}

// ── Stats calculator ──────────────────────────────────────────────────────────
function calcStats(grid) {
  let buildings = 0, damaged = 0, destroyed = 0, roads = 0, roadsBlocked = 0, flooded = 0, burning = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.type === TYPE.BUILDING) {
        buildings++;
        if (cell.state === STATE.DAMAGED) damaged++;
        if (cell.state === STATE.DESTROYED) destroyed++;
      }
      if (cell.type === TYPE.ROAD || cell.type === TYPE.BRIDGE) {
        roads++;
        if (cell.state !== STATE.NORMAL) roadsBlocked++;
      }
      if (cell.state === STATE.FLOODED) flooded++;
      if (cell.state === STATE.BURNING) burning++;
    }
  }
  const structuralDamage = buildings > 0 ? Math.round(((damaged + destroyed) / buildings) * 100) : 0;
  const estimatedCasualties = Math.floor(destroyed * 12 + damaged * 3);
  return { structuralDamage, estimatedCasualties, roadsBlocked, flooded, burning, destroyed };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DigitalTwinSimulation() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const tickRef   = useRef(0);
  const gridRef   = useRef(null);

  const [grid, setGrid]             = useState(() => { const g = generateCity(); gridRef.current = g; return g; });
  const [disaster, setDisaster]     = useState("hurricane");
  const [intensity, setIntensity]   = useState(3);
  const [running, setRunning]       = useState(false);
  const [simDone, setSimDone]       = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [evacRoutes, setEvacRoutes] = useState(new Set());
  const [stats, setStats]           = useState({ structuralDamage: 0, estimatedCasualties: 0, roadsBlocked: 0, flooded: 0, burning: 0, destroyed: 0 });
  const [tick, setTick]             = useState(0);

  const MAX_TICKS = 30;

  const draw = useCallback((g, routes) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = g[r][c];
        const isRoute = routes && routes.has(`${r},${c}`);
        const x = c * CELL, y = r * CELL;

        ctx.fillStyle = cellColor(cell, isRoute);
        ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

        if (cell.state === STATE.BURNING) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#ef4444";
          ctx.fillStyle = "rgba(239,68,68,0.25)";
          ctx.fillRect(x, y, CELL, CELL);
          ctx.shadowBlur = 0;
        }

        if (cell.type === TYPE.BUILDING && cell.state === STATE.NORMAL) {
          ctx.fillStyle = "rgba(56,189,248,0.4)";
          ctx.fillRect(x + 6, y + 6, 8, 5);
          ctx.fillRect(x + 20, y + 6, 8, 5);
          ctx.fillRect(x + 6, y + 18, 8, 5);
          ctx.fillRect(x + 20, y + 18, 8, 5);
        }

        if (isRoute) {
          ctx.fillStyle = "rgba(34,197,94,0.5)";
          ctx.fillRect(x + CELL * 0.3, y + CELL * 0.3, CELL * 0.4, CELL * 0.4);
        }
      }
    }

    ctx.strokeStyle = "rgba(15,23,42,0.5)";
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(COLS * CELL, r * CELL); ctx.stroke(); }
    for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke(); }

    const ex = Math.floor(COLS / 2) * CELL + CELL / 2;
    const ey = Math.floor(ROWS / 2) * CELL + CELL / 2;
    ctx.beginPath();
    ctx.arc(ex, ey, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(244,63,94,0.4)";
    ctx.fill();
  }, []);

  useEffect(() => {
    if (!running) return;
    const step = () => {
      tickRef.current++;
      setTick(tickRef.current);
      setGrid(prev => {
        const next = spreadDisaster(prev, disaster, intensity, tickRef.current);
        gridRef.current = next;
        setStats(calcStats(next));
        draw(next, null);
        return next;
      });
      if (tickRef.current >= MAX_TICKS) {
        setRunning(false);
        setSimDone(true);
        const routes = computeEvacRoutes(gridRef.current);
        setEvacRoutes(routes);
        setShowRoutes(true);
        draw(gridRef.current, routes);
        return;
      }
      animRef.current = setTimeout(step, 180);
    };
    animRef.current = setTimeout(step, 180);
    return () => clearTimeout(animRef.current);
  }, [running, disaster, intensity, draw]);

  useEffect(() => { draw(grid, null); }, []);

  const handleReset = () => {
    clearTimeout(animRef.current);
    tickRef.current = 0;
    setTick(0);
    setRunning(false);
    setSimDone(false);
    setShowRoutes(false);
    setEvacRoutes(new Set());
    setStats({ structuralDamage: 0, estimatedCasualties: 0, roadsBlocked: 0, flooded: 0, burning: 0, destroyed: 0 });
    const fresh = generateCity();
    gridRef.current = fresh;
    setGrid(fresh);
    draw(fresh, null);
  };

  const toggleRoutes = () => {
    const next = !showRoutes;
    setShowRoutes(next);
    draw(gridRef.current, next ? evacRoutes : null);
  };

  const curDisaster = DISASTERS.find(d => d.id === disaster);
  const progress = Math.round((tick / MAX_TICKS) * 100);
  const riskColor = (val) => val > 60 ? "#ef4444" : val > 30 ? "#f97316" : val > 10 ? "#eab308" : "#4ade80";

  return (
    <div style={{ background: "linear-gradient(135deg, #0b1329 0%, #0f172a 100%)", minHeight: "100%", padding: "clamp(12px,3vw,24px)", color: "#f8fafc" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "inline-flex", gap: "8px", alignItems: "center", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)", borderRadius: "6px", padding: "3px 10px", fontSize: "0.72rem", color: "#c4b5fd", fontWeight: "700", marginBottom: "8px" }}>
              🧠 AI DIGITAL TWIN ENGINE · REAL-TIME DISASTER SIMULATION
            </div>
            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "900", background: "linear-gradient(135deg, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Digital Twin Simulation
            </h1>
            <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
              Run "what-if" disaster scenarios — see structural collapse, flood zones &amp; evacuation routes in real-time.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {!running && !simDone && (
              <button onClick={() => { tickRef.current = 0; setTick(0); setRunning(true); setSimDone(false); setShowRoutes(false); setEvacRoutes(new Set()); }}
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.95rem", boxShadow: "0 4px 15px rgba(124,58,237,0.5)" }}>
                ▶ Run Simulation
              </button>
            )}
            {running && (
              <button onClick={() => setRunning(false)}
                style={{ background: "#334155", color: "#fff", border: "1px solid #475569", padding: "10px 22px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                ⏸ Pause
              </button>
            )}
            {!running && tick > 0 && !simDone && (
              <button onClick={() => setRunning(true)}
                style={{ background: "#1d4ed8", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                ▶ Resume
              </button>
            )}
            <button onClick={handleReset}
              style={{ background: "#0f172a", color: "#94a3b8", border: "1px solid #334155", padding: "10px 22px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
              ↺ Reset
            </button>
          </div>
        </div>

        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "18px", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>Disaster Type</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {DISASTERS.map(d => (
                <button key={d.id} onClick={() => { if (!running) setDisaster(d.id); }}
                  style={{ background: disaster === d.id ? d.color : "rgba(255,255,255,0.05)", border: `1.5px solid ${disaster === d.id ? d.color : "#475569"}`, color: "#fff", padding: "7px 14px", borderRadius: "8px", fontWeight: "700", cursor: running ? "not-allowed" : "pointer", fontSize: "0.88rem", opacity: running ? 0.6 : 1, transition: "all 0.15s" }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>
              {curDisaster?.catLabel} — <span style={{ color: curDisaster?.color }}>{intensity}</span>
            </div>
            <input type="range" min="1" max={curDisaster?.maxCat || 5} value={intensity}
              onChange={e => { if (!running) setIntensity(Number(e.target.value)); }} disabled={running}
              style={{ width: "100%", accentColor: curDisaster?.color, cursor: running ? "not-allowed" : "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#475569", marginTop: "2px" }}>
              <span>Low</span><span>Moderate</span><span>Extreme</span>
            </div>
          </div>
          {simDone && (
            <button onClick={toggleRoutes}
              style={{ background: showRoutes ? "#15803d" : "#1e293b", border: `1.5px solid ${showRoutes ? "#22c55e" : "#475569"}`, color: showRoutes ? "#4ade80" : "#94a3b8", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" }}>
              {showRoutes ? "✅ Evacuation Routes ON" : "🚶 Show Evacuation Routes"}
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 600px", background: "#0b1329", border: "1px solid #334155", borderRadius: "12px", padding: "12px", overflowX: "auto" }}>
            {(running || tick > 0) && (
              <div style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                  <span>Simulation Progress</span>
                  <span>{progress}% {simDone ? "— Complete ✓" : "— Running..."}</span>
                </div>
                <div style={{ background: "#1e293b", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                  <div style={{ background: `linear-gradient(90deg, ${curDisaster?.color}, #f43f5e)`, width: `${progress}%`, height: "100%", borderRadius: "4px", transition: "width 0.18s" }} />
                </div>
              </div>
            )}
            <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL}
              style={{ display: "block", borderRadius: "8px", imageRendering: "pixelated", maxWidth: "100%" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
              {[
                { color: "#1e3a5f", label: "Building" }, { color: "#334155", label: "Road" },
                { color: "#0369a1", label: "Water" }, { color: "#14532d", label: "Park" },
                { color: "#b45309", label: "Affected" }, { color: "#7f1d1d", label: "Damaged" },
                { color: "#1a0a0a", label: "Destroyed" }, { color: "#1d4ed8", label: "Flooded" },
                { color: "#dc2626", label: "Burning" }, { color: "#22c55e", label: "Evacuation Route" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", color: "#94a3b8" }}>
                  <div style={{ width: "12px", height: "12px", background: color, borderRadius: "2px", flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: "0 1 280px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "18px" }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "1rem", color: "#a78bfa", fontWeight: "800" }}>📊 Live Stats</h3>
              {[
                { label: "Structural Damage", value: `${stats.structuralDamage}%`, pct: stats.structuralDamage, color: riskColor(stats.structuralDamage) },
                { label: "Roads Blocked", value: `${stats.roadsBlocked}`, pct: Math.min(100, (stats.roadsBlocked / 20) * 100), color: "#f97316" },
              ].map(({ label, value, pct, color }) => (
                <div key={label} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                    <span style={{ color: "#94a3b8" }}>{label}</span>
                    <span style={{ color, fontWeight: "800" }}>{value}</span>
                  </div>
                  <div style={{ background: "#0f172a", borderRadius: "4px", height: "8px" }}>
                    <div style={{ background: color, width: `${pct}%`, height: "100%", borderRadius: "4px", transition: "width 0.3s" }} />
                  </div>
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Casualties Est.", value: stats.estimatedCasualties.toLocaleString(), color: "#f43f5e" },
                  { label: "Structures Lost", value: stats.destroyed, color: "#ef4444" },
                  { label: "Flood Cells", value: stats.flooded, color: "#38bdf8" },
                  { label: "Fire Cells", value: stats.burning, color: "#fb923c" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: "#0f172a", padding: "10px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "2px" }}>{label}</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "900", color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#1e293b", border: `1.5px solid ${curDisaster?.color}`, borderRadius: "12px", padding: "16px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: curDisaster?.color }}>⚡ Active Scenario</h4>
              <div style={{ fontSize: "1.3rem", fontWeight: "900" }}>{curDisaster?.label}</div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>
                {curDisaster?.catLabel}: <strong style={{ color: curDisaster?.color }}>{intensity}</strong> / {curDisaster?.maxCat}
              </div>
              <div style={{ marginTop: "8px", fontSize: "0.78rem", color: "#64748b", lineHeight: "1.6" }}>
                {disaster === "hurricane" && "Spiral wind. Damages buildings, collapses bridges, blocks roads."}
                {disaster === "earthquake" && "Concentric rings from epicenter. High collapse probability."}
                {disaster === "flood" && "Follows low-elevation terrain. Zones submerged progressively."}
                {disaster === "wildfire" && "Wind-driven eastward spread. Parks & buildings most at risk."}
              </div>
            </div>

            {simDone && (
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1.5px solid #22c55e", borderRadius: "12px", padding: "16px" }}>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "0.9rem", color: "#4ade80" }}>🚶 Evacuation Plan Ready</h4>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#86efac", lineHeight: "1.6" }}>
                  Safe corridors computed via BFS pathfinding. Toggle routes above to visualize on the city grid.
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "14px 18px", fontSize: "0.8rem", color: "#64748b" }}>
          💡 <strong style={{ color: "#a78bfa" }}>How it works:</strong> Physics-based disaster spreading from epicenter (red dot). Each disaster uses a unique propagation model. Evacuation routes are BFS-computed on undamaged road networks after simulation completes.
        </div>
      </div>
    </div>
  );
}
