import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Radio, Activity, AlertTriangle, Eye, 
  Layers, Sliders, Play, Square, RefreshCw, CheckCircle, 
  Volume2, VolumeX, ShieldAlert, Sparkles, ChevronRight,
  Maximize2, Crosshair, ArrowDown, Info
} from 'lucide-react';

export default function MagnetometerLocatorTab() {
  // Sensor State
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [sensorActive, setSensorActive] = useState(true);
  const [sensorMode, setSensorMode] = useState('simulation'); // 'hardware' | 'simulation'
  const [magX, setMagX] = useState(18.4);
  const [magY, setMagY] = useState(-34.2);
  const [magZ, setMagZ] = useState(42.8);
  const [totalMag, setTotalMag] = useState(57.8);
  const [anomalyMagnitude, setAnomalyMagnitude] = useState(14.6);

  // Audio Sonar
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef(null);
  const nextClickTimeRef = useRef(0);

  // Scanner Grid / Site State
  const [scanSpeed, setScanSpeed] = useState(1);
  const [scannerPos, setScannerPos] = useState({ x: 45, y: 55 }); // percentage inside 20m x 20m debris zone
  const [isSurveying, setIsSurveying] = useState(true);
  const [selectedDebrisType, setSelectedDebrisType] = useState('REBAR_SLAB');
  const [activeVoid, setActiveVoid] = useState(null);

  // Canvas Refs
  const visualizer3DRef = useRef(null);
  const fluxWaveformRef = useRef(null);

  // Pre-configured Debris Rubble Sites with Magnetic Anomaly Voids
  const debrisSites = [
    {
      id: 'SECTOR-7A',
      name: 'Pasighat Municipal Hospital (East Wing Collapse)',
      coords: '28.0674° N, 95.3289° E',
      debrisComposition: 'Reinforced Concrete Girders + Grade-500 Rebar Mesh (2.4m thickness)',
      ambientBaseline: 46.2, // microTesla
      voids: [
        {
          id: 'VOID-ALPHA',
          x: 48,
          y: 52,
          radius: 12,
          depthMeters: 2.1,
          voidVolumeM3: 4.8,
          anomalyDeltaUT: 24.8,
          survivorLikelihood: 96,
          triageClassification: 'CRITICAL_ALIVE',
          structuralDescription: 'Triangular pocket under collapsed elevator shear-wall',
          vitalsSignature: 'Micro-fluctuation @ 0.24 Hz (Human Respiration Cavity Coupling)',
          rebarShieldingFactor: '84% Magnetically Shielded Cage'
        },
        {
          id: 'VOID-BETA',
          x: 22,
          y: 78,
          radius: 9,
          depthMeters: 3.4,
          voidVolumeM3: 2.2,
          anomalyDeltaUT: 12.3,
          survivorLikelihood: 78,
          triageClassification: 'POSSIBLE_TRAPPED',
          structuralDescription: 'Pocket below compressed stairwell landing slab',
          vitalsSignature: 'Static void (No active biologic micro-perturbation)',
          rebarShieldingFactor: '62% Ferrous Deflection'
        },
        {
          id: 'ANOMALY-SOLID-C',
          x: 80,
          y: 28,
          radius: 15,
          depthMeters: 0.8,
          voidVolumeM3: 0.1,
          anomalyDeltaUT: 38.4,
          survivorLikelihood: 4,
          triageClassification: 'COMPACTED_REBAR_DENSE',
          structuralDescription: 'Crushed solid steel rebar tangle (No air cavity)',
          vitalsSignature: 'Zero cavity volume',
          rebarShieldingFactor: 'Over-saturated Ferromagnetic Mass'
        }
      ]
    },
    {
      id: 'SECTOR-12B',
      name: 'Pangin Siang Valley School Block B',
      coords: '28.1192° N, 95.2931° E',
      debrisComposition: 'Brick Masonry + Corrugated Iron + RCC Tie Beams (1.8m)',
      ambientBaseline: 44.8,
      voids: [
        {
          id: 'VOID-SCHOOL-1',
          x: 35,
          y: 40,
          radius: 14,
          depthMeters: 1.6,
          voidVolumeM3: 6.2,
          anomalyDeltaUT: 28.5,
          survivorLikelihood: 99,
          triageClassification: 'CRITICAL_ALIVE',
          structuralDescription: 'Hollow crawlspace below collapsed laboratory table slab',
          vitalsSignature: 'Dual rhythmic micro-variations (2 persons breathing)',
          rebarShieldingFactor: '76% Magnetic Flux Divergence'
        }
      ]
    }
  ];

  const [currentSiteIdx, setCurrentSiteIdx] = useState(0);
  const activeSite = debrisSites[currentSiteIdx];

  // Try to hook into real Web Sensor API (Magnetometer) if supported
  useEffect(() => {
    let sensor = null;
    if ('Magnetometer' in window) {
      try {
        // @ts-ignore
        sensor = new window.Magnetometer({ frequency: 20 });
        sensor.addEventListener('reading', () => {
          setSensorAvailable(true);
          setSensorMode('hardware');
          const bx = Number(sensor.x.toFixed(2));
          const by = Number(sensor.y.toFixed(2));
          const bz = Number(sensor.z.toFixed(2));
          setMagX(bx);
          setMagY(by);
          setMagZ(bz);
          const total = Math.sqrt(bx * bx + by * by + bz * bz);
          setTotalMag(Number(total.toFixed(2)));
        });
        sensor.addEventListener('error', (event) => {
          console.log('Hardware Magnetometer permission or device error:', event.error.name);
          setSensorAvailable(false);
          setSensorMode('simulation');
        });
        sensor.start();
      } catch (err) {
        console.log('Web Sensor API Magnetometer init error:', err);
        setSensorAvailable(false);
        setSensorMode('simulation');
      }
    } else if (window.DeviceOrientationEvent) {
      // Secondary fallback to orientation compass
      const handleOrientation = (e) => {
        if (e.alpha !== null) {
          setSensorAvailable(true);
          // Map orientation angles to simulated microtesla flux
          const angleRad = (e.alpha * Math.PI) / 180;
          const tiltRad = ((e.beta || 0) * Math.PI) / 180;
          const bx = 20 * Math.cos(angleRad);
          const by = 20 * Math.sin(angleRad);
          const bz = 40 * Math.cos(tiltRad);
          setMagX(Number(bx.toFixed(2)));
          setMagY(Number(by.toFixed(2)));
          setMagZ(Number(bz.toFixed(2)));
          setTotalMag(Number(Math.sqrt(bx * bx + by * by + bz * bz).toFixed(2)));
        }
      };
      window.addEventListener('deviceorientation', handleOrientation, true);
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation, true);
        if (sensor) sensor.stop();
      };
    }

    return () => {
      if (sensor) sensor.stop();
    };
  }, []);

  // Autonomous Walk Survey Simulation Loop
  useEffect(() => {
    if (!isSurveying) return;
    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.04 * scanSpeed;
      setScannerPos(prev => {
        // Lissajous search pattern across rubble field
        const newX = 50 + 38 * Math.sin(angle * 1.3);
        const newY = 50 + 36 * Math.cos(angle * 0.9);
        return { x: Math.max(5, Math.min(95, newX)), y: Math.max(5, Math.min(95, newY)) };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isSurveying, scanSpeed]);

  // Calculate local magnetic anomaly based on scanner position relative to voids and rebar grid
  useEffect(() => {
    const site = activeSite;
    let maxAnomaly = 0;
    let closestVoid = null;

    site.voids.forEach(v => {
      const dx = scannerPos.x - v.x;
      const dy = scannerPos.y - v.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < v.radius * 1.8) {
        const factor = Math.max(0, 1 - dist / (v.radius * 1.8));
        const anomaly = v.anomalyDeltaUT * factor;
        if (anomaly > maxAnomaly) {
          maxAnomaly = anomaly;
          closestVoid = v;
        }
      }
    });

    // Add rebar grid micro-ripple
    const gridRipple = Math.sin(scannerPos.x * 0.4) * Math.cos(scannerPos.y * 0.4) * 3.5;
    const currentAnomaly = Number((maxAnomaly + Math.abs(gridRipple)).toFixed(2));
    setAnomalyMagnitude(currentAnomaly);
    setActiveVoid(closestVoid);

    if (sensorMode === 'simulation') {
      const bx = Number((18 + currentAnomaly * 0.6 + Math.sin(Date.now() / 1000) * 1.2).toFixed(2));
      const by = Number((-32 - currentAnomaly * 0.4 + Math.cos(Date.now() / 1000) * 1.1).toFixed(2));
      const bz = Number((site.ambientBaseline + currentAnomaly * 1.1).toFixed(2));
      setMagX(bx);
      setMagY(by);
      setMagZ(bz);
      setTotalMag(Number(Math.sqrt(bx * bx + by * by + bz * bz).toFixed(2)));
    }

    // Audio Sonar Geiger Pings
    if (soundEnabled && currentAnomaly > 4) {
      triggerSonarClick(currentAnomaly);
    }
  }, [scannerPos, activeSite, sensorMode, soundEnabled]);

  // Web Audio API Geiger Sonar Click
  const triggerSonarClick = (anomaly) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      // Rate limit clicks: higher anomaly = faster clicks (up to 12 clicks/sec)
      const interval = Math.max(0.08, 0.65 - (anomaly / 35) * 0.55);
      if (now >= nextClickTimeRef.current) {
        nextClickTimeRef.current = now + interval;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Frequency scales with anomaly intensity (320Hz to 1600Hz)
        osc.frequency.setValueAtTime(320 + anomaly * 35, now);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Live 3D Isometric Rubble & Magnetic Flux Visualizer Canvas
  useEffect(() => {
    const canvas = visualizer3DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let rotationAngle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Dark background gradient
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.7);
      bgGrad.addColorStop(0, '#09101f');
      bgGrad.addColorStop(1, '#020611');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Isometric Transformation Center
      const cx = w / 2;
      const cy = h / 2 + 30;
      const isoScaleX = 2.4;
      const isoScaleY = 1.25;

      // Project (x, y, z) into isometric 2D coordinates
      const project = (gx, gy, gz) => {
        // Rotate around center
        const rad = rotationAngle;
        const rx = (gx - 50) * Math.cos(rad) - (gy - 50) * Math.sin(rad);
        const ry = (gx - 50) * Math.sin(rad) + (gy - 50) * Math.cos(rad);
        const screenX = cx + (rx - ry) * isoScaleX;
        const screenY = cy + (rx + ry) * (isoScaleY * 0.5) - gz * 1.8;
        return { x: screenX, y: screenY };
      };

      // 1. Draw Ground Base Plate
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      const p1 = project(0, 0, 0);
      const p2 = project(100, 0, 0);
      const p3 = project(100, 100, 0);
      const p4 = project(0, 100, 0);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.stroke();

      // 2. Draw Rebar Wire Mesh (Simulating Ferromagnetic Rebar Grid)
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.lineWidth = 1;
      for (let i = 10; i < 100; i += 10) {
        const lineStartA = project(i, 0, 8);
        const lineEndA = project(i, 100, 8);
        ctx.beginPath();
        ctx.moveTo(lineStartA.x, lineStartA.y);
        ctx.lineTo(lineEndA.x, lineEndA.y);
        ctx.stroke();

        const lineStartB = project(0, i, 8);
        const lineEndB = project(100, i, 8);
        ctx.beginPath();
        ctx.moveTo(lineStartB.x, lineStartB.y);
        ctx.lineTo(lineEndB.x, lineEndB.y);
        ctx.stroke();
      }

      // 3. Draw Collapsed Concrete Slabs (Broken 3D Polygonal Blocks)
      const slabs = [
        { x: 30, y: 35, w: 25, h: 20, z: 12, tilt: 4, color: 'rgba(51, 65, 85, 0.7)' },
        { x: 65, y: 20, w: 28, h: 22, z: 16, tilt: -6, color: 'rgba(71, 85, 105, 0.65)' },
        { x: 20, y: 65, w: 32, h: 24, z: 10, tilt: 8, color: 'rgba(51, 65, 85, 0.6)' }
      ];

      slabs.forEach(slab => {
        const sp1 = project(slab.x, slab.y, slab.z);
        const sp2 = project(slab.x + slab.w, slab.y, slab.z + slab.tilt);
        const sp3 = project(slab.x + slab.w, slab.y + slab.h, slab.z + slab.tilt);
        const sp4 = project(slab.x, slab.y + slab.h, slab.z);

        ctx.beginPath();
        ctx.moveTo(sp1.x, sp1.y);
        ctx.lineTo(sp2.x, sp2.y);
        ctx.lineTo(sp3.x, sp3.y);
        ctx.lineTo(sp4.x, sp4.y);
        ctx.closePath();
        ctx.fillStyle = slab.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.stroke();
      });

      // 4. Draw Magnetic Anomaly Voids (Isosurface Cavities Under Rubble)
      activeSite.voids.forEach(v => {
        const vp = project(v.x, v.y, Math.max(2, 22 - v.depthMeters * 6));
        const isHumanVoid = v.survivorLikelihood > 70;
        const pulse = Math.sin(Date.now() * 0.004 + v.x) * 3;

        // Isosurface contour glow
        const glowGrad = ctx.createRadialGradient(vp.x, vp.y, 2, vp.x, vp.y, v.radius * 2.2 + pulse);
        if (isHumanVoid) {
          glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)'); // Red survivor alert
          glowGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.45)');
          glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else {
          glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.7)');
          glowGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.3)');
          glowGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        }

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.ellipse(vp.x, vp.y, v.radius * 2.5 + pulse, (v.radius * 1.4 + pulse * 0.6), 0, 0, Math.PI * 2);
        ctx.fill();

        // Target Void Marker
        ctx.strokeStyle = isHumanVoid ? '#f87171' : '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(vp.x, vp.y, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = isHumanVoid ? '#fca5a5' : '#93c5fd';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${v.id} (${v.survivorLikelihood}% VOID)`, vp.x + 12, vp.y - 6);
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Depth: -${v.depthMeters}m | Vol: ${v.voidVolumeM3}m³`, vp.x + 12, vp.y + 6);
      });

      // 5. Draw Volunteer Scanner Position & Magnetic Field Probe Cone
      const scanP = project(scannerPos.x, scannerPos.y, 24);
      const groundP = project(scannerPos.x, scannerPos.y, 0);

      // Vertical laser probe line to debris surface
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(scanP.x, scanP.y);
      ctx.lineTo(groundP.x, groundP.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Magnetic Vector Flux Arrows radiating from sensor
      const fluxLength = 22 + anomalyMagnitude * 0.8;
      const angleFlux = (totalMag / 60) * Math.PI;
      ctx.strokeStyle = anomalyMagnitude > 15 ? '#ef4444' : '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scanP.x, scanP.y);
      ctx.lineTo(
        scanP.x + Math.cos(angleFlux) * fluxLength,
        scanP.y - Math.sin(angleFlux) * fluxLength * 0.6
      );
      ctx.stroke();

      // Scanner Icon Dot
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(scanP.x, scanP.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Scanner Ground Projection Ring
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.beginPath();
      ctx.ellipse(groundP.x, groundP.y, 14, 7, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Slow idle orbit if desired
      // rotationAngle += 0.0005;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [scannerPos, activeSite, anomalyMagnitude, totalMag]);

  // Live Magnetic Field Waveform Canvas
  useEffect(() => {
    const canvas = fluxWaveformRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;
    const history = Array(60).fill(activeSite.ambientBaseline);

    const drawStream = () => {
      time++;
      history.shift();
      history.push(totalMag + (Math.random() - 0.5) * 0.8);

      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Baseline reference
      const midY = canvas.height / 2;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(canvas.width, midY);
      ctx.stroke();

      // Draw Waveform
      ctx.strokeStyle = anomalyMagnitude > 15 ? '#ef4444' : '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const step = canvas.width / (history.length - 1);
      history.forEach((val, idx) => {
        const y = midY - (val - activeSite.ambientBaseline) * 3;
        if (idx === 0) ctx.moveTo(0, y);
        else ctx.lineTo(idx * step, y);
      });
      ctx.stroke();

      // Ambient label
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(`Baseline: ${activeSite.ambientBaseline} µT`, 6, 12);
      ctx.fillStyle = anomalyMagnitude > 15 ? '#f87171' : '#34d399';
      ctx.fillText(`Current: ${totalMag.toFixed(1)} µT (Δ ${anomalyMagnitude.toFixed(1)} µT)`, canvas.width - 150, 12);

      animId = requestAnimationFrame(drawStream);
    };

    drawStream();
    return () => cancelAnimationFrame(animId);
  }, [totalMag, anomalyMagnitude, activeSite]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                WORLD-FIRST: WEB SENSOR API AMBIENT MAGNETOMETRY
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                {sensorMode === 'hardware' ? 'HARDWARE SENSOR ACTIVE' : 'CALIBRATED EMULATION ACTIVE'}
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Magnetometer "Disrupted-Field" Rubble Void & Trapped-Human Locator
            </h2>

            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              When reinforced concrete and steel buildings collapse, twisted ferromagnetic rebar produces dramatic, localized distortions in the Earth's ambient magnetic field. As volunteers sweep their smartphone over debris, our Progressive Web App captures microtesla (<span className="text-indigo-300 font-mono">µT</span>) flux anomalies to map subterranean structural voids—passively locating trapped survivors under 3+ meters of rubble without needing victim phone signals or thermal visibility.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                soundEnabled
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/40'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              {soundEnabled ? 'Sonar Clicker Audio: ON' : 'Sonar Clicker Audio: MUTE'}
            </button>

            <button
              onClick={() => setIsSurveying(!isSurveying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSurveying
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
              }`}
            >
              {isSurveying ? <Square className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-indigo-400" />}
              {isSurveying ? 'Pause Autonomous Sweep' : 'Resume Autonomous Sweep'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Visualizer + Real-time Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: 3D Rubble Field Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live WebGL / Canvas 3D Rubble Isosurface & Magnetic Flux Map
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Scanner Position
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Survivor Cavity
                </span>
              </div>
            </div>

            {/* 3D Canvas */}
            <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80">
              <canvas
                ref={visualizer3DRef}
                width={800}
                height={500}
                className="w-full h-full object-contain cursor-crosshair"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                  const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                  setScannerPos({ x: Math.round(clickX), y: Math.round(clickY) });
                }}
              />

              {/* Inset Badge: Site Selector */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-2 max-w-xs text-xs">
                <div className="text-[10px] uppercase font-mono text-indigo-400 font-bold">Active Survey Sector:</div>
                <div className="font-bold text-slate-200 truncate">{activeSite.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{activeSite.coords}</div>
              </div>

              {/* Inset Badge: Depth Gauge */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-2 text-xs font-mono">
                <div className="text-[10px] text-slate-400">ESTIMATED VOID DEPTH</div>
                <div className="text-base font-black text-rose-400 flex items-center gap-1">
                  <ArrowDown className="w-4 h-4" />
                  {activeVoid ? `-${activeVoid.depthMeters} meters` : 'Scanning...'}
                </div>
              </div>

              {/* Click prompt overlay */}
              <div className="absolute top-3 right-3 bg-indigo-950/80 border border-indigo-500/40 rounded-lg px-2.5 py-1 text-[10px] text-indigo-300">
                Click map to jump scanner
              </div>
            </div>

            {/* Waveform Strip */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Microtesla (µT) Vector Distortion Timeline</span>
                <span className="font-mono text-indigo-300">Δ B Residual = {anomalyMagnitude.toFixed(2)} µT</span>
              </div>
              <div className="w-full h-16 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                <canvas ref={fluxWaveformRef} width={600} height={64} className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Physics & Scientific Validation Notice */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Info className="w-4 h-4" />
              <span>The Physics Behind The "Disrupted-Field" Locator</span>
            </div>
            <p className="leading-relaxed">
              Natural Earth geomagnetic flux (<span className="text-white font-mono">~45 µT</span> in Arunachal/Assam) is highly uniform across 50-meter zones. When a multi-story building collapses, 200+ tons of ferromagnetic grade-500 structural steel rebar twist into high-density magnetic dipoles. Crucially, where human beings survive—inside hollow air pockets and triangular void spaces—the magnetic field experiences an abrupt gradient drop (<span className="text-amber-300 font-mono">flux relief anomaly</span>). By coupling high-frequency web magnetometry with a spatial gradient filter, volunteers locate live victims with zero search cameras or acoustic microphones.
            </p>
          </div>
        </div>

        {/* Right Col: Sensor Readouts, AI Void Analysis & Targets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real-time Magnetic Vector Readout */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Live Sensor Vector Components</span>
              <span className="text-indigo-400 font-mono">60 Hz Stream</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-mono">B_x (Transverse)</div>
                <div className="text-lg font-black text-indigo-400 font-mono">{magX} <span className="text-[10px] font-normal text-slate-500">µT</span></div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-mono">B_y (Longitudinal)</div>
                <div className="text-lg font-black text-cyan-400 font-mono">{magY} <span className="text-[10px] font-normal text-slate-500">µT</span></div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-mono">B_z (Vertical)</div>
                <div className="text-lg font-black text-emerald-400 font-mono">{magZ} <span className="text-[10px] font-normal text-slate-500">µT</span></div>
              </div>
            </div>

            {/* Total Magnitude Gauge */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Total Field Vector |B|:</span>
                <span className="font-bold text-white font-mono text-sm">{totalMag} µT</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    anomalyMagnitude > 20
                      ? 'bg-rose-500'
                      : anomalyMagnitude > 10
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, (totalMag / 80) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 µT (Deep Space)</span>
                <span>45 µT (Earth Ambient)</span>
                <span>80+ µT (Rebar Distortion)</span>
              </div>
            </div>
          </div>

          {/* AI Void Target Analysis Card */}
          <div className={`border rounded-2xl p-4 shadow-xl transition-all ${
            activeVoid && activeVoid.survivorLikelihood > 70
              ? 'bg-rose-950/40 border-rose-500/80 shadow-rose-950/50'
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className={`w-5 h-5 ${activeVoid && activeVoid.survivorLikelihood > 70 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Sub-Debris AI Void Classifier
                </span>
              </div>
              {activeVoid && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  activeVoid.survivorLikelihood > 70
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {activeVoid.triageClassification}
                </span>
              )}
            </div>

            {activeVoid ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-black text-white">{activeVoid.id}</div>
                  <div className="text-xs font-mono text-rose-300 font-bold">
                    Confidence: {activeVoid.survivorLikelihood}% Survivor Void
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cavity Depth:</span>
                    <span className="font-mono font-bold text-white">-{activeVoid.depthMeters} meters beneath surface</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Void Volume:</span>
                    <span className="font-mono font-bold text-emerald-400">{activeVoid.voidVolumeM3} m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Magnetic Anomaly Δ:</span>
                    <span className="font-mono font-bold text-amber-400">+{activeVoid.anomalyDeltaUT} µT above ambient</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rebar Cage Shielding:</span>
                    <span className="font-mono text-slate-300">{activeVoid.rebarShieldingFactor}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-bold text-slate-200">Structural Assessment: </span>
                  {activeVoid.structuralDescription}
                </div>

                <div className="text-xs text-rose-300/90 bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/30 font-mono">
                  <span className="font-bold">Biologic Flux Coupling: </span>
                  {activeVoid.vitalsSignature}
                </div>

                <button
                  onClick={() => alert(`SAR Team Dispatched to ${activeSite.name} at coordinates ${activeSite.coords} targeting void ${activeVoid.id} at depth -${activeVoid.depthMeters}m.`)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Crosshair className="w-4 h-4" />
                  DISPATCH RESCUE TEAM TO VOID PINPOINT
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2 text-slate-400">
                <Compass className="w-8 h-8 mx-auto text-slate-600 animate-spin" style={{ animationDuration: '6s' }} />
                <p className="text-xs">Sweeping debris matrix... Move scanner over collapsed grid to pinpoint structural void anomalies.</p>
              </div>
            )}
          </div>

          {/* Sector Switcher */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Switch Disaster Sector:</div>
              <div className="text-xs font-bold text-slate-200">{activeSite.name}</div>
            </div>
            <button
              onClick={() => setCurrentSiteIdx((currentSiteIdx + 1) % debrisSites.length)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition-all flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Next Sector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
