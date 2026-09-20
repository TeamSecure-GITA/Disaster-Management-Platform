// ─────────────────────────────────────────────────────────────────────────────
// src/pages/DigitalTwinSimulation.jsx
//
// AI Digital Twin Simulation — 2D, 3D & 4D Multi-Dimensional Disaster Engine
// Supports:
//  - 2D Orthographic Tactical Grid with GIS layers & evacuation waypoints
//  - 3D Isometric Volumetric City with building heights, 3D lighting, & particles
//  - 4D Spatio-Temporal Simulator with 24-hour time scrubbing & decay forecasts
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

// ── City Dimensions ──────────────────────────────────────────────────────────
const COLS = 20;
const ROWS = 14;
const CELL_2D = 38;

// Cell types
const TYPE = {
  EMPTY: 0,
  RESIDENTIAL: 1,
  COMMERCIAL: 2,
  HOSPITAL: 3,
  POWER_PLANT: 4,
  ROAD: 5,
  BRIDGE: 6,
  WATER: 7,
  PARK: 8,
};

// Cell states
const STATE = {
  NORMAL: 0,
  AFFECTED: 1,
  DAMAGED: 2,
  DESTROYED: 3,
  FLOODED: 4,
  BURNING: 5,
  PROTECTED: 6,
};

// Disaster scenarios
const DISASTERS = [
  {
    id: "hurricane",
    label: "🌀 Hurricane / Cyclone",
    color: "#6366f1",
    accent: "#818cf8",
    maxCat: 5,
    catLabel: "Category",
    desc: "Violent cyclonic winds & storm surge stripping roofs and inundating coastlines.",
  },
  {
    id: "earthquake",
    label: "🏚️ Seismic Rupture",
    color: "#f97316",
    accent: "#fb923c",
    maxCat: 9,
    catLabel: "Magnitude (Mw)",
    desc: "P/S wave velocity shear causing resonant structural collapse & bridge buckling.",
  },
  {
    id: "flood",
    label: "🌊 Flash Flood & Dam Burst",
    color: "#38bdf8",
    accent: "#0284c7",
    maxCat: 5,
    catLabel: "Inundation Stage",
    desc: "Downslope gravitational water propagation overtopping rivers & submersion.",
  },
  {
    id: "wildfire",
    label: "🔥 Wildfire / Urban Inferno",
    color: "#ef4444",
    accent: "#f87171",
    maxCat: 5,
    catLabel: "Fire Severity",
    desc: "Wind-driven convective fire front consuming vegetation & flammable assets.",
  },
  {
    id: "chemical",
    label: "☣️ Toxic Chemical Plume",
    color: "#a855f7",
    accent: "#c084fc",
    maxCat: 5,
    catLabel: "Hazard Tier",
    desc: "Atmospheric aerosol dispersion with lethal vapor hazard concentration.",
  },
];

// Mitigation Tools
const MITIGATIONS = [
  { id: "sandbag", label: "🛡️ Sandbag Levees", cost: 15, desc: "Blocks flood water spreading across waterfront roads" },
  { id: "firebreak", label: "🚒 Firebreak Trench", cost: 20, desc: "Removes vegetation to halt wildfire propagation" },
  { id: "fortify", label: "🏥 Fortify Hospital", cost: 30, desc: "Hardens medical center against seismic & wind collapse" },
  { id: "siren", label: "🚨 Early Siren Evac", cost: 10, desc: "Evacuates high-density civilian complexes immediately" },
];

// ── City Generator ───────────────────────────────────────────────────────────
function generateCity() {
  const grid = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      // Default structure
      let type = TYPE.RESIDENTIAL;
      let height = 22 + Math.floor(Math.random() * 18);
      let occupants = 35 + Math.floor(Math.random() * 45);
      let elevation = 0.2 + Math.sin(r * 0.4) * 0.15 + Math.cos(c * 0.3) * 0.1;

      // Center commercial towers (taller)
      if (c >= 6 && c <= 13 && (r <= 4 || r >= 9)) {
        type = TYPE.COMMERCIAL;
        height = 42 + Math.floor(Math.random() * 26);
        occupants = 85 + Math.floor(Math.random() * 95);
      }

      return {
        type,
        state: STATE.NORMAL,
        height,
        elevation,
        occupants,
        initialOccupants: occupants,
        integrity: 100,
        isMitigated: false,
      };
    })
  );

  // Horizontal roads
  for (let r = 0; r < ROWS; r++) {
    if (r === 3 || r === 10) {
      for (let c = 0; c < COLS; c++) {
        grid[r][c] = {
          type: TYPE.ROAD,
          state: STATE.NORMAL,
          height: 3,
          elevation: 0.1,
          occupants: 0,
          initialOccupants: 0,
          integrity: 100,
          isMitigated: false,
        };
      }
    }
  }

  // Vertical roads
  for (let r = 0; r < ROWS; r++) {
    for (const c of [4, 9, 15]) {
      grid[r][c] = {
        type: TYPE.ROAD,
        state: STATE.NORMAL,
        height: 3,
        elevation: 0.1,
        occupants: 0,
        initialOccupants: 0,
        integrity: 100,
        isMitigated: false,
      };
    }
  }

  // River in the middle (rows 6 to 7)
  for (let r = 6; r <= 7; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = {
        type: TYPE.WATER,
        state: STATE.NORMAL,
        height: 0,
        elevation: 0,
        occupants: 0,
        initialOccupants: 0,
        integrity: 100,
        isMitigated: false,
      };
    }
  }

  // Bridges spanning the river
  for (const bc of [4, 9, 15]) {
    for (let r = 6; r <= 7; r++) {
      grid[r][bc] = {
        type: TYPE.BRIDGE,
        state: STATE.NORMAL,
        height: 8,
        elevation: 0.12,
        occupants: 15,
        initialOccupants: 15,
        integrity: 100,
        isMitigated: false,
      };
    }
  }

  // Strategic facilities
  // Hospital (Emergency Trauma Center)
  grid[2][2] = {
    type: TYPE.HOSPITAL,
    state: STATE.NORMAL,
    height: 36,
    elevation: 0.28,
    occupants: 140,
    initialOccupants: 140,
    integrity: 100,
    isMitigated: false,
  };
  grid[11][17] = {
    type: TYPE.HOSPITAL,
    state: STATE.NORMAL,
    height: 34,
    elevation: 0.25,
    occupants: 120,
    initialOccupants: 120,
    integrity: 100,
    isMitigated: false,
  };

  // Power Plant
  grid[12][2] = {
    type: TYPE.POWER_PLANT,
    state: STATE.NORMAL,
    height: 30,
    elevation: 0.18,
    occupants: 45,
    initialOccupants: 45,
    integrity: 100,
    isMitigated: false,
  };

  // Parks & Buffer vegetation
  [[0, 0], [0, 1], [1, 0], [0, COLS - 1], [1, COLS - 1], [ROWS - 1, 0], [ROWS - 1, 1], [ROWS - 1, COLS - 1]]
    .forEach(([r, c]) => {
      if (grid[r] && grid[r][c]) {
        grid[r][c] = {
          type: TYPE.PARK,
          state: STATE.NORMAL,
          height: 4,
          elevation: 0.32,
          occupants: 8,
          initialOccupants: 8,
          integrity: 100,
          isMitigated: false,
        };
      }
    });

  return grid;
}

// ── Physics Propagation Engine ───────────────────────────────────────────────
function stepSimulation(grid, disaster, intensity, step) {
  const next = grid.map((row) => row.map((c) => ({ ...c })));
  const cx = Math.floor(COLS / 2);
  const cy = Math.floor(ROWS / 2);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = next[r][c];
      if (cell.state === STATE.DESTROYED) continue;

      const dist = Math.sqrt((c - cx) ** 2 + (r - cy) ** 2);
      const rng = Math.random();

      // Mitigation protection check
      const mitigationFactor = cell.isMitigated ? 0.35 : 1.0;

      if (disaster === "hurricane") {
        const spiralRadius = 1.2 + step * intensity * 0.16;
        const swirlAngle = Math.atan2(r - cy, c - cx) + step * 0.45;
        const radiusMod = (Math.sin(swirlAngle * 2) * 0.35 + 0.9) * spiralRadius;

        if (dist <= radiusMod) {
          const windGustPressure = (intensity / 5) * (1 - dist / (radiusMod + 1)) * mitigationFactor;
          if (cell.type === TYPE.RESIDENTIAL || cell.type === TYPE.COMMERCIAL || cell.type === TYPE.BRIDGE) {
            cell.integrity = Math.max(0, cell.integrity - Math.round(windGustPressure * (18 + rng * 15)));
            if (cell.integrity <= 20) cell.state = STATE.DESTROYED;
            else if (cell.integrity <= 55) cell.state = STATE.DAMAGED;
            else if (cell.integrity <= 85) cell.state = STATE.AFFECTED;
          } else if (cell.type === TYPE.ROAD && rng < 0.18 * windGustPressure) {
            cell.state = STATE.AFFECTED;
          }
        }
      } else if (disaster === "earthquake") {
        const waveRadius = step * intensity * 0.32;
        const waveDiff = Math.abs(dist - waveRadius);

        if (waveDiff < 1.8 + intensity * 0.15) {
          const shearStress = (intensity / 8) * (1 - dist / 16) * mitigationFactor;
          if (cell.type === TYPE.RESIDENTIAL || cell.type === TYPE.COMMERCIAL || cell.type === TYPE.HOSPITAL || cell.type === TYPE.BRIDGE) {
            // High-rise resonance vulnerability
            const resonanceFactor = cell.height > 35 ? 1.3 : 1.0;
            cell.integrity = Math.max(0, cell.integrity - Math.round(shearStress * resonanceFactor * (22 + rng * 20)));
            if (cell.integrity <= 25) cell.state = STATE.DESTROYED;
            else if (cell.integrity <= 60) cell.state = STATE.DAMAGED;
            else if (cell.integrity <= 90) cell.state = STATE.AFFECTED;
          } else if (cell.type === TYPE.ROAD && rng < 0.28 * shearStress) {
            cell.state = STATE.DAMAGED;
          }
        }
      } else if (disaster === "flood") {
        const floodStageElevation = 0.08 + step * intensity * 0.038;
        if (cell.elevation <= floodStageElevation && cell.type !== TYPE.WATER) {
          if (!cell.isMitigated) {
            cell.state = STATE.FLOODED;
            cell.integrity = Math.max(10, cell.integrity - Math.round(12 + rng * 14));
            if (cell.integrity <= 20 && cell.type === TYPE.RESIDENTIAL) {
              cell.state = STATE.DESTROYED;
            }
          }
        }
        if (cell.type === TYPE.WATER) cell.state = STATE.FLOODED;
      } else if (disaster === "wildfire") {
        // Wind blows Eastward (c > cx with slight scatter)
        const windDist = Math.sqrt(((c - cx) * 0.5) ** 2 + (r - cy) ** 2);
        const fireFrontRadius = 1.0 + step * intensity * 0.2;

        if (windDist <= fireFrontRadius) {
          if (cell.type === TYPE.PARK || cell.type === TYPE.RESIDENTIAL || cell.type === TYPE.COMMERCIAL) {
            if (!cell.isMitigated && rng < 0.42 * (intensity / 5)) {
              cell.state = STATE.BURNING;
              cell.integrity = Math.max(0, cell.integrity - Math.round(25 + rng * 20));
              if (cell.integrity <= 15) cell.state = STATE.DESTROYED;
            }
          }
        }
      } else if (disaster === "chemical") {
        // Chemical toxic vapor drift Northeast
        const plumeX = cx + step * 0.45;
        const plumeY = cy - step * 0.35;
        const plumeDist = Math.sqrt((c - plumeX) ** 2 + (r - plumeY) ** 2);
        const dispersionRadius = 1.8 + step * 0.35;

        if (plumeDist <= dispersionRadius) {
          if (cell.state === STATE.NORMAL && rng < 0.48 * (intensity / 5)) {
            cell.state = STATE.AFFECTED;
            cell.integrity = Math.max(40, cell.integrity - Math.round(10 + rng * 10));
          }
        }
      }

      // Evacuate civilians if damaged
      if (cell.state === STATE.DESTROYED) {
        cell.occupants = Math.floor(cell.occupants * 0.2);
      } else if (cell.state === STATE.DAMAGED || cell.state === STATE.FLOODED || cell.state === STATE.BURNING) {
        cell.occupants = Math.floor(cell.occupants * 0.55);
      }
    }
  }

  return next;
}

// ── BFS Dynamic Evacuation Pathfinding ───────────────────────────────────────
function calculateEvacNetwork(grid) {
  const safeRoutes = new Set();
  const queue = [];
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));

  // Safe exits along border edges
  for (let c = 0; c < COLS; c++) {
    if (grid[0][c].type === TYPE.ROAD && grid[0][c].state === STATE.NORMAL) {
      queue.push([0, c]);
      visited[0][c] = true;
    }
    if (grid[ROWS - 1][c].type === TYPE.ROAD && grid[ROWS - 1][c].state === STATE.NORMAL) {
      queue.push([ROWS - 1, c]);
      visited[ROWS - 1][c] = true;
    }
  }

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  while (queue.length > 0) {
    const [r, c] = queue.shift();
    safeRoutes.add(`${r},${c}`);

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || visited[nr][nc]) continue;

      const cell = grid[nr][nc];
      // Cannot traverse destroyed, submerged, or actively burning pathways
      if (cell.state === STATE.DESTROYED || cell.state === STATE.FLOODED || cell.state === STATE.BURNING) continue;

      if (cell.type === TYPE.ROAD || cell.type === TYPE.BRIDGE) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
  }
  return safeRoutes;
}

// ── Aggregate Metrics ────────────────────────────────────────────────────────
function computeSimulationStats(grid) {
  let buildings = 0;
  let damaged = 0;
  let destroyed = 0;
  let roads = 0;
  let roadsBlocked = 0;
  let flooded = 0;
  let burning = 0;
  let initialPop = 0;
  let currentPop = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      initialPop += cell.initialOccupants || 0;
      currentPop += cell.occupants || 0;

      if (cell.type === TYPE.RESIDENTIAL || cell.type === TYPE.COMMERCIAL || cell.type === TYPE.HOSPITAL || cell.type === TYPE.POWER_PLANT) {
        buildings++;
        if (cell.state === STATE.DAMAGED || cell.state === STATE.AFFECTED) damaged++;
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

  const structuralDamagePct = buildings > 0 ? Math.round(((damaged * 0.5 + destroyed) / buildings) * 100) : 0;
  const estimatedCasualties = Math.max(0, Math.floor(destroyed * 14 + damaged * 4));
  const evacuatedCount = Math.max(0, initialPop - currentPop - estimatedCasualties);

  return {
    structuralDamagePct,
    estimatedCasualties,
    evacuatedCount,
    roadsBlocked,
    flooded,
    burning,
    destroyed,
    totalBuildings: buildings,
    totalRoads: roads,
  };
}

export default function DigitalTwinSimulation() {
  // ── Dimension Selection ──
  // "2d" = Orthographic Tactical View
  // "3d" = Isometric Volumetric 3D Twin
  // "4d" = Spatio-Temporal Predictive Time Scrubber
  const [dimensionMode, setDimensionMode] = useState("3d");

  // Simulation Controls
  const [grid, setGrid] = useState(() => generateCity());
  const [disaster, setDisaster] = useState("hurricane");
  const [intensity, setIntensity] = useState(3);
  const [running, setRunning] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 4D Timeline Data (0 to 24 Hours)
  const MAX_HOURS = 24;
  const [timeStep, setTimeStep] = useState(0);
  const [timelineSpeed, setTimelineSpeed] = useState(1);
  const [timelineHistory, setTimelineHistory] = useState([]);

  // Evacuation & Mitigation
  const [showEvacRoutes, setShowEvacRoutes] = useState(true);
  const [selectedMitigation, setSelectedMitigation] = useState(null);
  const [mitigationBudget, setMitigationBudget] = useState(100);

  // Inspector & Camera
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [cameraAngle, setCameraAngle] = useState(0); // 0, 45, 90, 180
  const [cameraPitch, setCameraPitch] = useState(32); // Isometric angle in deg
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [wireframeMode, setWireframeMode] = useState(false);

  const canvasRef = useRef(null);
  const animTimerRef = useRef(null);

  // Current Disaster config
  const activeDisaster = useMemo(() => DISASTERS.find((d) => d.id === disaster) || DISASTERS[0], [disaster]);

  // Compute stats and routes
  const stats = useMemo(() => computeSimulationStats(grid), [grid]);
  const evacRoutes = useMemo(() => calculateEvacNetwork(grid), [grid]);

  // Initialize Timeline Baseline on mount or disaster change
  const build4DTimeline = useCallback((baseGrid, chosenDisaster, chosenIntensity) => {
    const history = [];
    let stateGrid = baseGrid.map((row) => row.map((c) => ({ ...c })));

    for (let t = 0; t <= MAX_HOURS; t++) {
      if (t > 0) {
        stateGrid = stepSimulation(stateGrid, chosenDisaster, chosenIntensity, t);
      }
      const st = computeSimulationStats(stateGrid);
      history.push({
        hour: t,
        label: `T+${t}h`,
        damage: st.structuralDamagePct,
        casualties: st.estimatedCasualties,
        evacuated: st.evacuatedCount,
        gridSnapshot: stateGrid.map((row) => row.map((c) => ({ ...c }))),
      });
    }
    return history;
  }, []);

  // Pre-generate 4D timeline whenever grid or disaster settings change
  useEffect(() => {
    const history = build4DTimeline(grid, disaster, intensity);
    setTimelineHistory(history);
  }, [grid, disaster, intensity, build4DTimeline]);

  // ── Step Execution Loop ──
  const triggerStep = useCallback(() => {
    setGrid((prev) => {
      const next = stepSimulation(prev, disaster, intensity, currentStep + 1);
      return next;
    });
    setCurrentStep((s) => s + 1);
    setTimeStep((t) => Math.min(MAX_HOURS, t + 1));
  }, [disaster, intensity, currentStep]);

  useEffect(() => {
    if (!running) return;
    if (currentStep >= MAX_HOURS) {
      setRunning(false);
      setSimDone(true);
      return;
    }
    animTimerRef.current = setTimeout(triggerStep, 260 / timelineSpeed);
    return () => clearTimeout(animTimerRef.current);
  }, [running, currentStep, timelineSpeed, triggerStep]);

  // ── Handle Timeline Scrubber (4D Mode) ──
  const handleScrubTime = (hour) => {
    setTimeStep(hour);
    if (timelineHistory[hour]) {
      setGrid(timelineHistory[hour].gridSnapshot);
      setCurrentStep(hour);
    }
  };

  // Reset Engine
  const handleResetSimulation = () => {
    clearTimeout(animTimerRef.current);
    const fresh = generateCity();
    setGrid(fresh);
    setCurrentStep(0);
    setTimeStep(0);
    setRunning(false);
    setSimDone(false);
    setMitigationBudget(100);
    const history = build4DTimeline(fresh, disaster, intensity);
    setTimelineHistory(history);
  };

  // Apply Mitigation on Click
  const handleCellClick = (r, c) => {
    setSelectedCell({ r, c, ...grid[r][c] });
    if (!selectedMitigation) return;

    const tool = MITITGATIONS_TOOL_FINDER(selectedMitigation);
    if (!tool || mitigationBudget < tool.cost) return;

    setGrid((prev) => {
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      next[r][c].isMitigated = true;
      next[r][c].state = STATE.PROTECTED;
      return next;
    });
    setMitigationBudget((b) => b - tool.cost);
  };

  const MITITGATIONS_TOOL_FINDER = (id) => MITIGATIONS.find((m) => m.id === id);

  // ── RENDER ENGINE (2D & 3D & 4D Canvas Rendering) ──────────────────────────
  const renderSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dynamic background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "#080e1a");
    bgGradient.addColorStop(1, "#030712");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // ─────────────────────────────────────────────────────────────────────────
    // 2D ORTHOGRAPHIC TACTICAL GRID RENDERER
    // ─────────────────────────────────────────────────────────────────────────
    if (dimensionMode === "2d") {
      const offsetX = Math.floor((width - COLS * CELL_2D * zoomLevel) / 2);
      const offsetY = Math.floor((height - ROWS * CELL_2D * zoomLevel) / 2);

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(zoomLevel, zoomLevel);

      // Render cells
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = grid[r][c];
          const x = c * CELL_2D;
          const y = r * CELL_2D;
          const isEvac = showEvacRoutes && evacRoutes.has(`${r},${c}`);

          // Fill color based on cell type & state
          let fill = "#1e293b";
          if (cell.type === TYPE.ROAD) fill = isEvac ? "#15803d" : "#334155";
          else if (cell.type === TYPE.BRIDGE) fill = isEvac ? "#22c55e" : "#854d0e";
          else if (cell.type === TYPE.WATER) fill = "#0284c7";
          else if (cell.type === TYPE.PARK) fill = "#166534";
          else if (cell.type === TYPE.HOSPITAL) fill = "#047857";
          else if (cell.type === TYPE.POWER_PLANT) fill = "#475569";
          else if (cell.type === TYPE.COMMERCIAL) fill = "#1e3a8a";
          else if (cell.type === TYPE.RESIDENTIAL) fill = "#1e293b";

          // Damage State Overrides
          if (cell.state === STATE.BURNING) fill = "#dc2626";
          else if (cell.state === STATE.FLOODED) fill = "#1d4ed8";
          else if (cell.state === STATE.DESTROYED) fill = "#0f172a";
          else if (cell.state === STATE.DAMAGED) fill = "#991b1b";
          else if (cell.state === STATE.AFFECTED) fill = "#b45309";
          else if (cell.state === STATE.PROTECTED) fill = "#0d9488";

          ctx.fillStyle = fill;
          ctx.fillRect(x + 1, y + 1, CELL_2D - 2, CELL_2D - 2);

          // Grid borders
          ctx.strokeStyle = wireframeMode ? "rgba(56, 189, 248, 0.4)" : "rgba(30, 41, 59, 0.6)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, CELL_2D, CELL_2D);

          // Building Windows / Detail glyphs in 2D
          if (cell.type === TYPE.COMMERCIAL && cell.state === STATE.NORMAL) {
            ctx.fillStyle = "rgba(147, 197, 253, 0.4)";
            ctx.fillRect(x + 8, y + 8, 6, 6);
            ctx.fillRect(x + 22, y + 8, 6, 6);
            ctx.fillRect(x + 8, y + 22, 6, 6);
            ctx.fillRect(x + 22, y + 22, 6, 6);
          } else if (cell.type === TYPE.HOSPITAL) {
            // Medical Red Cross
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(x + 16, y + 8, 6, 20);
            ctx.fillRect(x + 9, y + 15, 20, 6);
          }

          // Active Fire / Thermal pulsing
          if (cell.state === STATE.BURNING) {
            ctx.shadowColor = "#ef4444";
            ctx.shadowBlur = 10;
            ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
            ctx.fillRect(x, y, CELL_2D, CELL_2D);
            ctx.shadowBlur = 0;
          }

          // Hover / Select Highlight
          if (hoveredCell && hoveredCell.r === r && hoveredCell.c === c) {
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, CELL_2D - 4, CELL_2D - 4);
          }
        }
      }

      // Epicenter indicator
      const ex = Math.floor(COLS / 2) * CELL_2D + CELL_2D / 2;
      const ey = Math.floor(ROWS / 2) * CELL_2D + CELL_2D / 2;
      ctx.beginPath();
      ctx.arc(ex, ey, 9, 0, Math.PI * 2);
      ctx.fillStyle = activeDisaster.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3D ISOMETRIC VOLUMETRIC DIGITAL TWIN RENDERER (Used in 3D and 4D)
    // ─────────────────────────────────────────────────────────────────────────
    if (dimensionMode === "3d" || dimensionMode === "4d") {
      const tileWidth = 36 * zoomLevel;
      const tileHeight = 18 * zoomLevel;
      const originX = width / 2;
      const originY = 110 * zoomLevel;

      ctx.save();

      // Sort cells back-to-front (isometric painter's algorithm)
      const renderList = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          renderList.push({ r, c, cell: grid[r][c] });
        }
      }
      renderList.sort((a, b) => a.r + a.c - (b.r + b.c));

      // Draw each isometric tile
      for (const { r, c, cell } of renderList) {
        // Isometric Projection Formula:
        // x = originX + (c - r) * (tileWidth / 2)
        // y = originY + (c + r) * (tileHeight / 2)
        const isoX = originX + (c - r) * (tileWidth / 2);
        const isoY = originY + (c + r) * (tileHeight / 2);
        const isEvac = showEvacRoutes && evacRoutes.has(`${r},${c}`);

        // Extrusion height for 3D buildings
        let extrudeHeight = 0;
        if (cell.type === TYPE.RESIDENTIAL) extrudeHeight = cell.height * 0.75 * zoomLevel;
        else if (cell.type === TYPE.COMMERCIAL) extrudeHeight = cell.height * 1.15 * zoomLevel;
        else if (cell.type === TYPE.HOSPITAL) extrudeHeight = cell.height * 0.95 * zoomLevel;
        else if (cell.type === TYPE.POWER_PLANT) extrudeHeight = 22 * zoomLevel;
        else if (cell.type === TYPE.BRIDGE) extrudeHeight = 8 * zoomLevel;

        // Damage reduces 3D height
        if (cell.state === STATE.DESTROYED) extrudeHeight = 3 * zoomLevel;
        else if (cell.state === STATE.DAMAGED) extrudeHeight *= 0.65;

        // Base Tile Coordinates
        const pTop = [isoX, isoY];
        const pRight = [isoX + tileWidth / 2, isoY + tileHeight / 2];
        const pBottom = [isoX, isoY + tileHeight];
        const pLeft = [isoX - tileWidth / 2, isoY + tileHeight / 2];

        // Roof Coordinates (Extruded upwards)
        const rTop = [pTop[0], pTop[1] - extrudeHeight];
        const rRight = [pRight[0], pRight[1] - extrudeHeight];
        const rBottom = [pBottom[0], pBottom[1] - extrudeHeight];
        const rLeft = [pLeft[0], pLeft[1] - extrudeHeight];

        // Color palette for 3D elements
        let roofColor = "#1e293b";
        let leftWallColor = "#0f172a";
        let rightWallColor = "#020617";

        if (cell.type === TYPE.ROAD) {
          roofColor = isEvac ? "#15803d" : "#334155";
        } else if (cell.type === TYPE.BRIDGE) {
          roofColor = isEvac ? "#22c55e" : "#854d0e";
          leftWallColor = "#713f12";
          rightWallColor = "#451a03";
        } else if (cell.type === TYPE.WATER) {
          roofColor = "#0284c7";
        } else if (cell.type === TYPE.PARK) {
          roofColor = "#166534";
        } else if (cell.type === TYPE.HOSPITAL) {
          roofColor = "#047857";
          leftWallColor = "#065f46";
          rightWallColor = "#064e3b";
        } else if (cell.type === TYPE.COMMERCIAL) {
          roofColor = "#1d4ed8";
          leftWallColor = "#1e3a8a";
          rightWallColor = "#172554";
        } else if (cell.type === TYPE.RESIDENTIAL) {
          roofColor = "#3b82f6";
          leftWallColor = "#1d4ed8";
          rightWallColor = "#1e3a8a";
        }

        // Damage State Colors in 3D
        if (cell.state === STATE.BURNING) {
          roofColor = "#ef4444";
          leftWallColor = "#b91c1c";
          rightWallColor = "#7f1d1d";
        } else if (cell.state === STATE.FLOODED) {
          roofColor = "#1d4ed8";
          leftWallColor = "#1e40af";
          rightWallColor = "#1e3a8a";
        } else if (cell.state === STATE.DESTROYED) {
          roofColor = "#18181b";
          leftWallColor = "#09090b";
          rightWallColor = "#000000";
        } else if (cell.state === STATE.DAMAGED) {
          roofColor = "#b45309";
          leftWallColor = "#78350f";
          rightWallColor = "#451a03";
        } else if (cell.state === STATE.PROTECTED) {
          roofColor = "#0d9488";
          leftWallColor = "#0f766e";
          rightWallColor = "#115e59";
        }

        // 1. Draw Left Wall Face
        if (extrudeHeight > 0) {
          ctx.beginPath();
          ctx.moveTo(pLeft[0], pLeft[1]);
          ctx.lineTo(pBottom[0], pBottom[1]);
          ctx.lineTo(rBottom[0], rBottom[1]);
          ctx.lineTo(rLeft[0], rLeft[1]);
          ctx.closePath();
          ctx.fillStyle = leftWallColor;
          ctx.fill();
          if (wireframeMode) {
            ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
            ctx.stroke();
          }

          // Left Wall Windows
          if (cell.type === TYPE.COMMERCIAL && cell.state === STATE.NORMAL && extrudeHeight > 20) {
            ctx.fillStyle = "rgba(147, 197, 253, 0.5)";
            ctx.fillRect(pLeft[0] + 4, rBottom[1] + 8, 4, 6);
            ctx.fillRect(pLeft[0] + 10, rBottom[1] + 12, 4, 6);
          }
        }

        // 2. Draw Right Wall Face
        if (extrudeHeight > 0) {
          ctx.beginPath();
          ctx.moveTo(pBottom[0], pBottom[1]);
          ctx.lineTo(pRight[0], pRight[1]);
          ctx.lineTo(rRight[0], rRight[1]);
          ctx.lineTo(rBottom[0], rBottom[1]);
          ctx.closePath();
          ctx.fillStyle = rightWallColor;
          ctx.fill();
          if (wireframeMode) {
            ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
            ctx.stroke();
          }

          // Right Wall Windows
          if (cell.type === TYPE.COMMERCIAL && cell.state === STATE.NORMAL && extrudeHeight > 20) {
            ctx.fillStyle = "rgba(147, 197, 253, 0.4)";
            ctx.fillRect(rBottom[0] + 4, rBottom[1] + 8, 4, 6);
            ctx.fillRect(rBottom[0] + 10, rBottom[1] + 12, 4, 6);
          }
        }

        // 3. Draw Roof Face
        ctx.beginPath();
        ctx.moveTo(rTop[0], rTop[1]);
        ctx.lineTo(rRight[0], rRight[1]);
        ctx.lineTo(rBottom[0], rBottom[1]);
        ctx.lineTo(rLeft[0], rLeft[1]);
        ctx.closePath();
        ctx.fillStyle = roofColor;
        ctx.fill();
        ctx.strokeStyle = wireframeMode ? "rgba(56, 189, 248, 0.8)" : "rgba(15, 23, 42, 0.5)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 3D Particles: Rising Fire Embers or Smoke
        if (cell.state === STATE.BURNING) {
          ctx.shadowColor = "#f97316";
          ctx.shadowBlur = 12;
          ctx.fillStyle = "#fdba74";
          ctx.beginPath();
          ctx.arc(rTop[0] + Math.sin(r + currentStep) * 4, rTop[1] - 8, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Evacuation neon route path mark
        if (isEvac && (cell.type === TYPE.ROAD || cell.type === TYPE.BRIDGE)) {
          ctx.fillStyle = "rgba(34, 197, 94, 0.7)";
          ctx.beginPath();
          ctx.arc(rBottom[0], rBottom[1] - 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Selected / Hovered marker in 3D
        if (hoveredCell && hoveredCell.r === r && hoveredCell.c === c) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }

      // 3D Seismic / Hurricane Shockwave Ring Overlay
      if (disaster === "earthquake" || disaster === "hurricane") {
        const centerIsoX = originX + (Math.floor(COLS / 2) - Math.floor(ROWS / 2)) * (tileWidth / 2);
        const centerIsoY = originY + (Math.floor(COLS / 2) + Math.floor(ROWS / 2)) * (tileHeight / 2);
        const waveRadiusX = (currentStep * intensity * 5 + 10) * zoomLevel;
        const waveRadiusY = waveRadiusX * 0.5;

        ctx.beginPath();
        ctx.ellipse(centerIsoX, centerIsoY, waveRadiusX, waveRadiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = activeDisaster.accent;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }
  }, [
    dimensionMode,
    grid,
    evacRoutes,
    showEvacRoutes,
    hoveredCell,
    wireframeMode,
    zoomLevel,
    disaster,
    intensity,
    currentStep,
    activeDisaster,
  ]);

  // Request Animation Frame trigger
  useEffect(() => {
    renderSimulation();
  }, [renderSimulation]);

  // Mouse move over canvas for interactive cell inspector
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (dimensionMode === "2d") {
      const offsetX = Math.floor((canvas.width - COLS * CELL_2D * zoomLevel) / 2);
      const offsetY = Math.floor((canvas.height - ROWS * CELL_2D * zoomLevel) / 2);
      const c = Math.floor((mx - offsetX) / (CELL_2D * zoomLevel));
      const r = Math.floor((my - offsetY) / (CELL_2D * zoomLevel));

      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        setHoveredCell({ r, c, ...grid[r][c] });
      } else {
        setHoveredCell(null);
      }
    } else {
      // Approximate 3D isometric hit test
      const tileWidth = 36 * zoomLevel;
      const tileHeight = 18 * zoomLevel;
      const originX = canvas.width / 2;
      const originY = 110 * zoomLevel;

      const dx = mx - originX;
      const dy = my - originY;
      const c = Math.round((dx / (tileWidth / 2) + dy / (tileHeight / 2)) / 2);
      const r = Math.round((dy / (tileHeight / 2) - dx / (tileWidth / 2)) / 2);

      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        setHoveredCell({ r, c, ...grid[r][c] });
      } else {
        setHoveredCell(null);
      }
    }
  };

  const getTypeName = (t) => {
    switch (t) {
      case TYPE.RESIDENTIAL: return "Residential Complex";
      case TYPE.COMMERCIAL: return "Commercial Tower";
      case TYPE.HOSPITAL: return "Emergency Hospital";
      case TYPE.POWER_PLANT: return "Grid Power Substation";
      case TYPE.ROAD: return "Evacuation Highway";
      case TYPE.BRIDGE: return "Strategic River Bridge";
      case TYPE.WATER: return "Hydrological Basin";
      case TYPE.PARK: return "Buffer Vegetation Zone";
      default: return "Civil Infrastructure";
    }
  };

  const getStateBadge = (s) => {
    switch (s) {
      case STATE.NORMAL: return { label: "INTACT", color: "#10b981" };
      case STATE.AFFECTED: return { label: "STRESSED", color: "#f59e0b" };
      case STATE.DAMAGED: return { label: "STRUCTURAL FAILURE", color: "#ea580c" };
      case STATE.DESTROYED: return { label: "COLLAPSED", color: "#dc2626" };
      case STATE.FLOODED: return { label: "SUBMERGED", color: "#2563eb" };
      case STATE.BURNING: return { label: "INFERNO", color: "#ef4444" };
      case STATE.PROTECTED: return { label: "HARDENED", color: "#0d9488" };
      default: return { label: "OPERATIONAL", color: "#64748b" };
    }
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #070d19 0%, #0b1329 100%)", minHeight: "100%", padding: "clamp(12px, 2.5vw, 24px)", color: "#f8fafc", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* ── TOP HEADER & DIMENSION SELECTOR (2D, 3D, 4D) ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.4)", borderRadius: "999px", padding: "3px 12px", fontSize: "0.74rem", color: "#c084fc", fontWeight: "700", marginBottom: "8px" }}>
              🌐 AUTONOMOUS AI DIGITAL TWIN · MULTI-DIMENSIONAL DISASTER LAB
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: "900", background: "linear-gradient(135deg, #c084fc, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              City-Scale Digital Twin Simulation
            </h1>
            <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.88rem" }}>
              Toggle between <strong>2D Tactical Grid</strong>, <strong>3D Volumetric Twin</strong>, and <strong>4D Spatio-Temporal Prediction</strong> to simulate impact &amp; optimize evacuation.
            </p>
          </div>

          {/* ── 2D / 3D / 4D Mode Switcher (User Choice) ── */}
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              padding: "5px",
              borderRadius: "14px",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            {[
              { id: "2d", label: "🗺️ 2D Tactical Grid", sub: "Planimetric GIS" },
              { id: "3d", label: "🏙️ 3D Isometric Twin", sub: "Volumetric Height" },
              { id: "4d", label: "⏳ 4D Spatio-Temporal", sub: "24h Time Machine" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setDimensionMode(m.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: dimensionMode === m.id ? "1px solid rgba(56, 189, 248, 0.6)" : "1px solid transparent",
                  backgroundColor: dimensionMode === m.id ? "rgba(2, 132, 199, 0.24)" : "transparent",
                  color: dimensionMode === m.id ? "#38bdf8" : "#94a3b8",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "0.84rem",
                  transition: "all 0.18s ease",
                  boxShadow: dimensionMode === m.id ? "0 4px 14px rgba(2, 132, 199, 0.3)" : "none",
                }}
              >
                <span>{m.label}</span>
                <span style={{ fontSize: "0.66rem", color: dimensionMode === m.id ? "#7dd3fc" : "#64748b", fontWeight: "600" }}>{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── COMMAND CONTROL STRIP ── */}
        <div style={{ background: "#111827", border: "1px solid #1f293d", borderRadius: "16px", padding: "18px", display: "flex", flexWrap: "wrap", gap: "18px", alignItems: "center", justifyContent: "space-between" }}>
          {/* Scenario Selector */}
          <div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
              Active Disaster Scenario
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {DISASTERS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => { if (!running) setDisaster(d.id); }}
                  style={{
                    backgroundColor: disaster === d.id ? d.color : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${disaster === d.id ? d.color : "#334155"}`,
                    color: "#fff",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: running ? "not-allowed" : "pointer",
                    fontSize: "0.82rem",
                    opacity: running ? 0.6 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div style={{ flex: "1 1 200px", maxWidth: "260px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#94a3b8", fontWeight: "700", marginBottom: "6px" }}>
              <span>{activeDisaster.catLabel}</span>
              <span style={{ color: activeDisaster.color, fontWeight: "900" }}>{intensity} / {activeDisaster.maxCat}</span>
            </div>
            <input
              type="range"
              min="1"
              max={activeDisaster.maxCat}
              value={intensity}
              onChange={(e) => { if (!running) setIntensity(Number(e.target.value)); }}
              disabled={running}
              style={{ width: "100%", accentColor: activeDisaster.color, cursor: running ? "not-allowed" : "pointer" }}
            />
          </div>

          {/* Simulation Run / Pause / Reset Actions */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {!running && !simDone && (
              <button
                type="button"
                onClick={() => setRunning(true)}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  boxShadow: "0 4px 15px rgba(124, 58, 237, 0.45)",
                }}
              >
                ▶ Run Simulation
              </button>
            )}

            {running && (
              <button
                type="button"
                onClick={() => setRunning(false)}
                style={{
                  backgroundColor: "#334155",
                  color: "#fff",
                  border: "1px solid #475569",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                ⏸ Pause
              </button>
            )}

            <button
              type="button"
              onClick={handleResetSimulation}
              style={{
                backgroundColor: "#0f172a",
                color: "#94a3b8",
                border: "1px solid #334155",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              ↺ Reset
            </button>

            {/* Camera Controls (for 3D & 4D) */}
            {(dimensionMode === "3d" || dimensionMode === "4d") && (
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                  title="Zoom In"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "#fff", borderRadius: "8px", padding: "7px 12px", cursor: "pointer" }}
                >
                  🔍+
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.1))}
                  title="Zoom Out"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "#fff", borderRadius: "8px", padding: "7px 12px", cursor: "pointer" }}
                >
                  🔍-
                </button>
                <button
                  type="button"
                  onClick={() => setWireframeMode(!wireframeMode)}
                  style={{ background: wireframeMode ? "rgba(56,189,248,0.2)" : "#1e293b", border: `1px solid ${wireframeMode ? "#38bdf8" : "#334155"}`, color: wireframeMode ? "#38bdf8" : "#94a3b8", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "700" }}
                >
                  {wireframeMode ? "Wireframe ON" : "Wireframe"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 4D SPATIO-TEMPORAL TIME MACHINE SCRUBBER (Displayed when 4D mode is active) ── */}
        {dimensionMode === "4d" && (
          <div style={{ background: "#0f172a", border: "1px solid rgba(168, 85, 247, 0.4)", borderRadius: "16px", padding: "18px 22px", boxShadow: "0 4px 24px rgba(168, 85, 247, 0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.4rem" }}>⏳</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "800", color: "#c084fc" }}>
                    4D Chronological Time Scrubber — Hour T+{timeStep} of {MAX_HOURS}h
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>
                    Drag time slider to inspect exact structural decay, casualty escalation, and breach timings.
                  </p>
                </div>
              </div>

              {/* Time Speed Multiplier */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[0.5, 1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setTimelineSpeed(spd)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: timelineSpeed === spd ? "1px solid #c084fc" : "1px solid #334155",
                      backgroundColor: timelineSpeed === spd ? "rgba(168, 85, 247, 0.25)" : "#1e293b",
                      color: timelineSpeed === spd ? "#c084fc" : "#94a3b8",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slider */}
            <input
              type="range"
              min="0"
              max={MAX_HOURS}
              value={timeStep}
              onChange={(e) => handleScrubTime(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#c084fc", cursor: "pointer", height: "8px" }}
            />

            {/* Time Jump Phase Milestones */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", flexWrap: "wrap", gap: "6px" }}>
              {[
                { h: 0, label: "T+0h Warning" },
                { h: 3, label: "T+3h Initial Breach" },
                { h: 6, label: "T+6h Peak Impact" },
                { h: 12, label: "T+12h Rescue Phase" },
                { h: 24, label: "T+24h Recovery" },
              ].map(({ h, label }) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleScrubTime(h)}
                  style={{
                    background: timeStep === h ? "rgba(168, 85, 247, 0.3)" : "rgba(255,255,255,0.03)",
                    border: timeStep === h ? "1px solid #c084fc" : "1px solid #334155",
                    color: timeStep === h ? "#f3e8ff" : "#94a3b8",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 4D Temporal Prediction Line Chart */}
            {timelineHistory.length > 0 && (
              <div style={{ marginTop: "18px", height: "130px" }}>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px", fontWeight: "700" }}>
                  📈 Spatio-Temporal Prediction Curves: Structural Damage (%) vs. Estimated Casualties
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineHistory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#1f293d" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "6px", fontSize: "0.75rem" }}
                    />
                    <Line type="monotone" dataKey="damage" name="Damage %" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="casualties" name="Casualties" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ── MAIN WORKSPACE (CANVAS + HUD METRICS & INSPECTOR) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>
          
          {/* Canvas Digital Twin Simulation Viewport */}
          <div style={{ background: "#0b1329", border: "1px solid #1f293d", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden" }}>
            {/* Viewport Status Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#38bdf8" }}>
                  {dimensionMode.toUpperCase()} SIMULATION CANVAS
                </span>
                <span style={{ fontSize: "0.7rem", backgroundColor: running ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)", color: running ? "#34d399" : "#fb7185", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
                  {running ? "● LIVE ENGINE RUNNING" : "⏸ STANDBY"}
                </span>
              </div>

              {/* Evacuation Route Toggle */}
              <button
                type="button"
                onClick={() => setShowEvacRoutes(!showEvacRoutes)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: showEvacRoutes ? "1px solid #10b981" : "1px solid #334155",
                  backgroundColor: showEvacRoutes ? "rgba(16, 185, 129, 0.2)" : "#1e293b",
                  color: showEvacRoutes ? "#34d399" : "#94a3b8",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {showEvacRoutes ? "🚶 Evac Routes: VISIBLE" : "🚶 Evac Routes: HIDDEN"}
              </button>
            </div>

            {/* The Unified HTML5 Canvas */}
            <div style={{ position: "relative", width: "100%", borderRadius: "12px", overflow: "hidden", backgroundColor: "#030712" }}>
              <canvas
                ref={canvasRef}
                width={860}
                height={520}
                onMouseMove={handleCanvasMouseMove}
                onClick={(e) => {
                  if (hoveredCell) handleCellClick(hoveredCell.r, hoveredCell.c);
                }}
                style={{ display: "block", width: "100%", height: "auto", cursor: selectedMitigation ? "crosshair" : "pointer" }}
              />

              {/* In-Canvas Mini HUD Overlay */}
              <div style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)", border: "1px solid #334155", borderRadius: "8px", padding: "6px 12px", fontSize: "0.72rem", color: "#94a3b8" }}>
                Hover to inspect cell · Click to deploy mitigation
              </div>
            </div>

            {/* Legend Indicators */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.74rem", color: "#94a3b8", paddingTop: "6px" }}>
              {[
                { color: "#3b82f6", label: "Residential" },
                { color: "#1d4ed8", label: "Commercial" },
                { color: "#047857", label: "Hospital" },
                { color: "#334155", label: "Roadways" },
                { color: "#854d0e", label: "Bridge" },
                { color: "#0284c7", label: "River Basin" },
                { color: "#166534", label: "Park Buffer" },
                { color: "#22c55e", label: "Evac Path" },
                { color: "#ef4444", label: "Inferno" },
                { color: "#1d4ed8", label: "Submerged" },
                { color: "#18181b", label: "Collapsed" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "10px", height: "10px", backgroundColor: color, borderRadius: "2px" }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Telemetry, Cell Inspector & Mitigation Sandbox */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Live Telemetry KPI Card */}
            <div style={{ background: "#111827", border: "1px solid #1f293d", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: "800", color: "#38bdf8" }}>
                📊 Real-Time Damage Telemetry
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span style={{ color: "#94a3b8" }}>Structural Destruction</span>
                    <strong style={{ color: stats.structuralDamagePct > 40 ? "#ef4444" : "#f59e0b" }}>
                      {stats.structuralDamagePct}%
                    </strong>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "#1e293b", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${stats.structuralDamagePct}%`, height: "100%", backgroundColor: stats.structuralDamagePct > 40 ? "#ef4444" : "#f59e0b", borderRadius: "999px", transition: "width 0.2s" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span style={{ color: "#94a3b8" }}>Evacuated Civilians</span>
                    <strong style={{ color: "#10b981" }}>{stats.evacuatedCount.toLocaleString()}</strong>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "#1e293b", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, (stats.evacuatedCount / 800) * 100)}%`, height: "100%", backgroundColor: "#10b981", borderRadius: "999px" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Casualties Est.", val: stats.estimatedCasualties, color: "#f43f5e" },
                  { label: "Roads Blocked", val: `${stats.roadsBlocked} / ${stats.totalRoads}`, color: "#f97316" },
                  { label: "Flooded Cells", val: stats.flooded, color: "#38bdf8" },
                  { label: "Active Fires", val: stats.burning, color: "#fb923c" },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ background: "#0f172a", padding: "10px", borderRadius: "10px", border: "1px solid #1f293d" }}>
                    <div style={{ fontSize: "0.68rem", color: "#64748b", marginBottom: "2px" }}>{label}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "900", color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cell Inspector Box */}
            <div style={{ background: "#111827", border: "1px solid #1f293d", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: "800", color: "#a78bfa" }}>
                🔍 Sector & Structure Inspector
              </h3>

              {hoveredCell ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1f293d", paddingBottom: "6px" }}>
                    <span style={{ color: "#94a3b8" }}>Coordinates:</span>
                    <strong style={{ color: "#f8fafc" }}>Sector [{hoveredCell.r}, {hoveredCell.c}]</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1f293d", paddingBottom: "6px" }}>
                    <span style={{ color: "#94a3b8" }}>Typology:</span>
                    <strong style={{ color: "#38bdf8" }}>{getTypeName(hoveredCell.type)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1f293d", paddingBottom: "6px" }}>
                    <span style={{ color: "#94a3b8" }}>Condition:</span>
                    <span style={{ color: getStateBadge(hoveredCell.state).color, fontWeight: "800" }}>
                      ● {getStateBadge(hoveredCell.state).label}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1f293d", paddingBottom: "6px" }}>
                    <span style={{ color: "#94a3b8" }}>Integrity:</span>
                    <strong style={{ color: hoveredCell.integrity < 50 ? "#ef4444" : "#10b981" }}>
                      {hoveredCell.integrity}%
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Occupants:</span>
                    <strong style={{ color: "#f8fafc" }}>{hoveredCell.occupants} citizens</strong>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontStyle: "italic" }}>
                  Hover over any sector in the simulation to inspect real-time structural health, population, and damage state.
                </p>
              )}
            </div>

            {/* Mitigation Sandbox ("What-If" Interventions) */}
            <div style={{ background: "#111827", border: "1px solid #1f293d", borderRadius: "16px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "#34d399" }}>
                  🛡️ Mitigation Sandbox
                </h3>
                <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "2px 8px", borderRadius: "999px", fontWeight: "800" }}>
                  Budget: {mitigationBudget} PTS
                </span>
              </div>
              <p style={{ margin: "0 0 12px 0", fontSize: "0.76rem", color: "#94a3b8" }}>
                Select an engineering mitigation and click any grid sector to fortify it against hazard progression.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {MITIGATIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMitigation(selectedMitigation === m.id ? null : m.id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: selectedMitigation === m.id ? "1.5px solid #10b981" : "1px solid #334155",
                      backgroundColor: selectedMitigation === m.id ? "rgba(16, 185, 129, 0.2)" : "#0f172a",
                      color: selectedMitigation === m.id ? "#34d399" : "#e2e8f0",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      textAlign: "left",
                    }}
                  >
                    <span>{m.label}</span>
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{m.cost} pts</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Engineering Footer Explainer ── */}
        <div style={{ background: "#111827", border: "1px solid #1f293d", borderRadius: "12px", padding: "14px 18px", fontSize: "0.82rem", color: "#64748b" }}>
          💡 <strong style={{ color: "#38bdf8" }}>Multi-Dimensional Architecture:</strong> In <strong>2D</strong>, the platform renders orthographic GIS layers with exact coordinate projections. In <strong>3D</strong>, isometric height extrusions model building aspect ratios and structural shear. In <strong>4D</strong>, time-series differential equations model progressive cascade failures over 24 hours.
        </div>
      </div>
    </div>
  );
}
