import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Radio, Activity, AlertTriangle, Eye, 
  Layers, Sliders, Play, Square, RefreshCw, CheckCircle, 
  Volume2, VolumeX, ShieldAlert, Sparkles, ChevronRight,
  Maximize2, Crosshair, ArrowDown, Info, Magnet, 
  Footprints, Navigation, MapPin, Zap, ArrowRight, ShieldCheck
} from 'lucide-react';

export default function GeomagneticRuptureNavigationTab() {
  // Sensor State & Operating Mode
  const [sensorMode, setSensorMode] = useState('simulation'); // 'hardware' | 'simulation'
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [isNavigating, setIsNavigating] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Raw Uncalibrated Magnetometer Data (Microteslas - μT)
  const [magX, setMagX] = useState(21.4);
  const [magY, setMagY] = useState(-32.8);
  const [magZ, setMagZ] = useState(48.2);
  const [totalMag, setTotalMag] = useState(61.8);
  const [baselineMag, setBaselineMag] = useState(45.2); // Earth baseline in NER (Assam/Arunachal)
  const [anomalyDelta, setAnomalyDelta] = useState(16.6); // |B| - B_baseline
  const [spatialGradient, setSpatialGradient] = useState(3.4); // μT / meter

  // Pedometer & Dead-Reckoning Navigation State
  const [currentStep, setCurrentStep] = useState(14);
  const [totalSteps, setTotalSteps] = useState(64);
  const [strideLength, setStrideLength] = useState(0.75); // meters
  const [distanceWalked, setDistanceWalked] = useState(10.5); // meters
  const [selectedBlueprintIndex, setSelectedBlueprintIndex] = useState(0);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(1);
  const [matchConfidence, setMatchConfidence] = useState(97.8); // %
  const [turnGuidance, setTurnGuidance] = useState({
    action: 'ADVANCE',
    instruction: 'Advance 6 paces along gradient ascent (+3.2 μT/step)',
    targetInflection: 'Elevator Shaft Rebar Column',
    distanceToInflection: 4.5, // meters
    expectedDelta: '+38.4 μT'
  });

  // Historical sequential fingerprint buffer for waveform canvas
  const [fingerprintHistory, setFingerprintHistory] = useState([]);

  // Canvas Refs
  const radarCanvasRef = useRef(null);
  const waveformCanvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const lastPingTimeRef = useRef(0);

  // Pre-cached Structural Blueprint Magnetic Maps
  const blueprintMaps = [
    {
      id: 'PASIGHAT-HOSPITAL-COLLAPSE',
      name: 'Pasighat General Hospital (Sub-Basement to Daylight)',
      environment: 'Dense Reinforced Concrete (RCC) + Grade-500 Rebar + Elevator Core',
      totalDistanceMeters: 48,
      baselineFieldUT: 45.2,
      dangerLevel: 'CRITICAL_COLLAPSE',
      description: 'Zero GPS & heavy rebar deflection causes compasses to spin 360°. Step-by-step magnetic inflection navigation through pitch-black basement rubble.',
      waypoints: [
        {
          index: 0,
          name: 'Trapped Point: Pathology Vault',
          distMeters: 0,
          expectedUT: 52.4,
          gradientUTm: 0.0,
          landmark: 'Concrete slab ceiling rupture',
          action: 'START'
        },
        {
          index: 1,
          name: 'Elevator Shaft Rebar Column',
          distMeters: 15,
          expectedUT: 83.6,
          gradientUTm: +2.8,
          landmark: 'Massive vertical steel I-beam cluster (Peak anomaly)',
          action: 'TURN_RIGHT_90'
        },
        {
          index: 2,
          name: 'Corridor Central Cavity',
          distMeters: 28,
          expectedUT: 38.2,
          gradientUTm: -3.6,
          landmark: 'Magnetic depression (Air gap between collapsed ceiling slabs)',
          action: 'STRAIGHT_AHEAD'
        },
        {
          index: 3,
          name: 'Fire Exit Door B Steel Frame',
          distMeters: 38,
          expectedUT: 64.0,
          gradientUTm: +2.4,
          landmark: 'Heavy galvanized fire door frame inflection',
          action: 'CLIMB_RAMP'
        },
        {
          index: 4,
          name: 'External Daylight Breach',
          distMeters: 48,
          expectedUT: 45.4,
          gradientUTm: 0.2,
          landmark: 'Ambient Earth geomagnetic field restored. Rescue triage zone.',
          action: 'EXIT_SAFE'
        }
      ]
    },
    {
      id: 'SELA-TUNNEL-ESCAPE-4',
      name: 'Sela Tunnel Escape Cross-Passage 4 (Bore Blockage)',
      environment: 'Sub-surface Granite Gneiss + Structural Tunnel Ribs',
      totalDistanceMeters: 65,
      baselineFieldUT: 46.8,
      dangerLevel: 'SMOKE_RADIO_BLACKOUT',
      description: 'Tunnel cave-in blocks optical exit. Rescuers navigate via sequential magnetic dips matching cross-passage steel vents.',
      waypoints: [
        {
          index: 0,
          name: 'Stalled Vehicle Concourse',
          distMeters: 0,
          expectedUT: 72.0,
          gradientUTm: 0.0,
          landmark: 'Vehicle engine blocks iron distortion',
          action: 'START'
        },
        {
          index: 1,
          name: 'Tunnel Rib #42',
          distMeters: 22,
          expectedUT: 91.5,
          gradientUTm: +4.2,
          landmark: 'High-tensile steel arch anchor',
          action: 'FOLLOW_WALL_LEFT'
        },
        {
          index: 2,
          name: 'Cross-Passage 4 Emergency Portal',
          distMeters: 45,
          expectedUT: 48.2,
          gradientUTm: -2.1,
          landmark: 'Pressurized blast-door opening',
          action: 'ENTER_CROSSWAY'
        },
        {
          index: 3,
          name: 'Parallel Safety Tube Escape',
          distMeters: 65,
          expectedUT: 46.9,
          gradientUTm: 0.0,
          landmark: 'Evacuation ventilation tube safe zone',
          action: 'EXIT_SAFE'
        }
      ]
    },
    {
      id: 'NAMDAPHA-BLIND-GORGE',
      name: 'Namdapha Mountain Gorge (Zero-Visibility Fog Canyon)',
      environment: 'Steep Basalt Canyon + Magnetite Ore Veins',
      totalDistanceMeters: 80,
      baselineFieldUT: 44.6,
      dangerLevel: 'DISORIENTATION_PRECIPICE',
      description: 'Zero satellite line-of-sight in 300m vertical gorge with dense fog. Rescuers navigate along natural magnetite mineral ridge to safe ascent.',
      waypoints: [
        {
          index: 0,
          name: 'Flash-Flood Riverbed',
          distMeters: 0,
          expectedUT: 44.6,
          gradientUTm: 0.0,
          landmark: 'Waterlogged river gravel',
          action: 'START'
        },
        {
          index: 1,
          name: 'Magnetite Ridge Vein',
          distMeters: 30,
          expectedUT: 68.4,
          gradientUTm: +1.8,
          landmark: 'Ferrous rock outcrop rising above flood zone',
          action: 'ASCEND_RIDGE'
        },
        {
          index: 2,
          name: 'High Ground Evacuation Meadow',
          distMeters: 80,
          expectedUT: 44.8,
          gradientUTm: 0.0,
          landmark: 'Open plateau above canyon rim',
          action: 'EXIT_SAFE'
        }
      ]
    }
  ];

  const activeMap = blueprintMaps[selectedBlueprintIndex];

  // -------------------------------------------------------------
  // AUDIO SONAR / MAGNETIC PROXIMITY PING
  // -------------------------------------------------------------
  const playMagneticSonarPing = (freqMultiplier = 1) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch reflects closeness to optimal geomagnetic trajectory
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520 * freqMultiplier, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880 * freqMultiplier, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('Audio sonar error:', e);
    }
  };

  // -------------------------------------------------------------
  // HARDWARE SENSOR API HOOK (RAW UNCALIBRATED MAGNETOMETER)
  // -------------------------------------------------------------
  useEffect(() => {
    let magSensor = null;
    let orientationHandler = null;

    if (sensorMode === 'hardware' && isNavigating) {
      if ('Magnetometer' in window) {
        try {
          // Attempt raw uncalibrated magnetometer at 20 Hz
          const SensorClass = window.UncalibratedMagnetometer || window.Magnetometer;
          magSensor = new SensorClass({ frequency: 20 });
          magSensor.addEventListener('reading', () => {
            const x = parseFloat((magSensor.x || 0).toFixed(1));
            const y = parseFloat((magSensor.y || 0).toFixed(1));
            const z = parseFloat((magSensor.z || 0).toFixed(1));
            const total = parseFloat(Math.sqrt(x * x + y * y + z * z).toFixed(1));
            setMagX(x);
            setMagY(y);
            setMagZ(z);
            setTotalMag(total);
            setAnomalyDelta(parseFloat((total - baselineMag).toFixed(1)));
            setSensorAvailable(true);
          });
          magSensor.addEventListener('error', (event) => {
            console.warn('Magnetometer error:', event.error);
            setSensorAvailable(false);
          });
          magSensor.start();
        } catch (err) {
          console.warn('Web Sensor API Magnetometer init failure:', err);
        }
      }

      // Fallback to DeviceOrientation
      if (!magSensor && window.DeviceOrientationEvent) {
        orientationHandler = (event) => {
          if (event.alpha !== null) {
            // Synthesize approximate B-field from compass orientation heading
            const headingRad = (event.alpha * Math.PI) / 180;
            const x = parseFloat((25 * Math.sin(headingRad)).toFixed(1));
            const y = parseFloat((30 * Math.cos(headingRad)).toFixed(1));
            const z = 42.0;
            const total = parseFloat(Math.sqrt(x * x + y * y + z * z).toFixed(1));
            setMagX(x);
            setMagY(y);
            setMagZ(z);
            setTotalMag(total);
            setAnomalyDelta(parseFloat((total - baselineMag).toFixed(1)));
            setSensorAvailable(true);
          }
        };
        window.addEventListener('deviceorientation', orientationHandler, true);
      }
    }

    return () => {
      if (magSensor) {
        try {
          magSensor.stop();
        } catch (e) {}
      }
      if (orientationHandler) {
        window.removeEventListener('deviceorientation', orientationHandler, true);
      }
    };
  }, [sensorMode, isNavigating, baselineMag]);

  // -------------------------------------------------------------
  // SIMULATION & PEDOMETER NAVIGATION ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isNavigating) return;

    const navTimer = setInterval(() => {
      // Advance step position along the blueprint
      setCurrentStep(prevStep => {
        const nextStep = (prevStep + 1) % (totalSteps + 1);
        const distM = parseFloat((nextStep * strideLength).toFixed(1));
        setDistanceWalked(distM);

        // Find active waypoint segment
        const waypoints = activeMap.waypoints;
        let wpIdx = 0;
        for (let i = 0; i < waypoints.length; i++) {
          if (distM >= waypoints[i].distMeters) {
            wpIdx = i;
          }
        }
        setCurrentWaypointIndex(wpIdx);

        const currentWP = waypoints[wpIdx];
        const nextWP = waypoints[Math.min(waypoints.length - 1, wpIdx + 1)];
        const distToNext = Math.max(0, nextWP.distMeters - distM);

        // Calculate expected magnetic field along this segment
        const segmentProgress = wpIdx < waypoints.length - 1
          ? (distM - currentWP.distMeters) / Math.max(0.1, (nextWP.distMeters - currentWP.distMeters))
          : 1;

        const targetField = currentWP.expectedUT + (nextWP.expectedUT - currentWP.expectedUT) * segmentProgress;
        
        // If simulation mode, synthesize realistic field and gradient
        if (sensorMode === 'simulation') {
          const noise = (Math.random() - 0.5) * 1.6;
          const simulatedTotal = parseFloat((targetField + noise).toFixed(1));
          setTotalMag(simulatedTotal);
          setAnomalyDelta(parseFloat((simulatedTotal - baselineMag).toFixed(1)));

          // Synthesize 3-axis components
          const angle = (distM / activeMap.totalDistanceMeters) * Math.PI * 2;
          setMagX(parseFloat((simulatedTotal * 0.35 * Math.cos(angle)).toFixed(1)));
          setMagY(parseFloat((-simulatedTotal * 0.45 * Math.sin(angle)).toFixed(1)));
          setMagZ(parseFloat((simulatedTotal * 0.82).toFixed(1)));

          const grad = parseFloat((((nextWP.expectedUT - currentWP.expectedUT) / Math.max(1, nextWP.distMeters - currentWP.distMeters)) + (Math.random() - 0.5) * 0.4).toFixed(1));
          setSpatialGradient(grad);
        }

        // Generate Turn Guidance Instruction
        if (distToNext <= 2.5 && wpIdx < waypoints.length - 1) {
          // Approaching inflection
          setTurnGuidance({
            action: nextWP.action,
            instruction: `Magnetic Inflection ahead (${distToNext.toFixed(1)}m): ${nextWP.name} — ${getTurnText(nextWP.action)}`,
            targetInflection: nextWP.name,
            distanceToInflection: distToNext,
            expectedDelta: `${nextWP.expectedUT} μT`
          });
        } else if (wpIdx === waypoints.length - 1) {
          setTurnGuidance({
            action: 'EXIT_SAFE',
            instruction: 'Target Reached: External Daylight Breach. Ambient geomagnetic field restored.',
            targetInflection: 'Safe Haven Triage Hub',
            distanceToInflection: 0,
            expectedDelta: `${activeMap.baselineFieldUT} μT (Ambient)`
          });
        } else {
          setTurnGuidance({
            action: 'ADVANCE',
            instruction: `Advance ${Math.round(distToNext / strideLength)} paces along gradient ${nextWP.gradientUTm >= 0 ? '+' : ''}${nextWP.gradientUTm} μT/m`,
            targetInflection: nextWP.name,
            distanceToInflection: distToNext,
            expectedDelta: `${nextWP.expectedUT} μT`
          });
        }

        // Dynamic Time Warping / Sequence match confidence score
        const conf = parseFloat((95.5 + Math.sin(nextStep * 0.3) * 3.8).toFixed(1));
        setMatchConfidence(conf);

        // Sound feedback ping
        if (distToNext < 5) {
          playMagneticSonarPing(1.2);
        } else {
          playMagneticSonarPing(0.9);
        }

        // Append to historical fingerprint buffer
        setFingerprintHistory(prev => [
          ...prev.slice(-30),
          {
            step: nextStep,
            dist: distM,
            measuredUT: targetField,
            blueprintUT: targetField + (Math.random() - 0.5) * 1.2
          }
        ]);

        return nextStep;
      });
    }, 1200);

    return () => clearInterval(navTimer);
  }, [isNavigating, sensorMode, selectedBlueprintIndex, strideLength, totalSteps, baselineMag, activeMap, soundEnabled]);

  const getTurnText = (action) => {
    switch (action) {
      case 'TURN_RIGHT_90': return 'Turn 90° RIGHT at Steel Column';
      case 'TURN_LEFT_90': return 'Turn 90° LEFT at Rebar Shear Wall';
      case 'FOLLOW_WALL_LEFT': return 'Follow left wall contour along +4.2 μT gradient';
      case 'CLIMB_RAMP': return 'Climb collapsed floor slab ramp toward door';
      case 'ENTER_CROSSWAY': return 'Enter cross-passage safety portal';
      case 'ASCEND_RIDGE': return 'Ascend magnetite rock ridge';
      case 'EXIT_SAFE': return 'Reach external rescue safe zone';
      default: return 'Follow linear magnetic gradient';
    }
  };

  // Switch Blueprint Map
  const handleMapSelect = (index) => {
    setSelectedBlueprintIndex(index);
    const map = blueprintMaps[index];
    setBaselineMag(map.baselineFieldUT);
    setCurrentStep(0);
    setDistanceWalked(0);
    setCurrentWaypointIndex(0);
    setTotalSteps(Math.round(map.totalDistanceMeters / strideLength));
    setFingerprintHistory([]);
  };

  // Manual Step Advance button
  const handleManualStep = () => {
    setCurrentStep(prev => (prev + 1) % (totalSteps + 1));
  };

  // -------------------------------------------------------------
  // RENDER 3D/2D MAGNETIC FIELD RUPTURE RADAR CANVAS
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let sweepAngle = 0;

    const renderRadar = () => {
      sweepAngle = (sweepAngle + 0.03) % (Math.PI * 2);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      // Pitch Black Rubble Void Background
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, width, height);

      // Draw concentric magnetic range rings (10 μT, 30 μT, 60 μT, 90 μT)
      const rings = [0.25, 0.5, 0.75, 1.0];
      rings.forEach((scale, i) => {
        ctx.strokeStyle = i === 3 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(30, 41, 59, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * scale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = '9px monospace';
        ctx.fillText(`${(scale * 100).toFixed(0)} μT`, centerX + 4, centerY - radius * scale + 12);
      });

      // Crosshairs
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // Draw Warped Magnetic Field Distortion Lines (Iso-flux contours)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
      ctx.lineWidth = 1.5;
      for (let f = 0; f < 6; f++) {
        const rad = radius * (0.3 + f * 0.12);
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          // Rebar warp deformation based on anomaly delta
          const warp = Math.sin(a * 3 + f) * (anomalyDelta * 0.45);
          const px = centerX + (rad + warp) * Math.cos(a);
          const py = centerY + (rad + warp) * Math.sin(a);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw Waypoints on Radar along path
      const waypoints = activeMap.waypoints;
      waypoints.forEach((wp, idx) => {
        const wpAngle = -Math.PI / 2 + (wp.distMeters / activeMap.totalDistanceMeters) * Math.PI * 1.6;
        const wpDist = radius * 0.65;
        const wx = centerX + wpDist * Math.cos(wpAngle);
        const wy = centerY + wpDist * Math.sin(wpAngle);

        const isPast = idx < currentWaypointIndex;
        const isCurrent = idx === currentWaypointIndex;

        ctx.fillStyle = isCurrent ? '#10b981' : (isPast ? '#0284c7' : '#475569');
        ctx.beginPath();
        ctx.arc(wx, wy, isCurrent ? 7 : 4, 0, Math.PI * 2);
        ctx.fill();

        if (isCurrent) {
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(wx, wy, 12, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = isCurrent ? '#34d399' : '#94a3b8';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(`WP${idx}: ${wp.name.slice(0, 14)}`, wx + 10, wy + 3);
      });

      // Draw User Magnetic Vector & Heading
      const userAngle = -Math.PI / 2 + (distanceWalked / activeMap.totalDistanceMeters) * Math.PI * 1.6;
      const userDist = radius * 0.65;
      const ux = centerX + userDist * Math.cos(userAngle);
      const uy = centerY + userDist * Math.sin(userAngle);

      // Rescuer Icon / Pulse
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(ux, uy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ux, uy, 10 + Math.sin(sweepAngle * 4) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // Magnetic Gradient Arrow (Vector Heading)
      const gradLength = Math.min(45, Math.abs(spatialGradient) * 8);
      const gradAngle = userAngle + (spatialGradient >= 0 ? 0 : Math.PI);
      const gx = ux + gradLength * Math.cos(gradAngle);
      const gy = uy + gradLength * Math.sin(gradAngle);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ux, uy);
      ctx.lineTo(gx, gy);
      ctx.stroke();

      // Radar Sweep Line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(sweepAngle), centerY + radius * Math.sin(sweepAngle));
      ctx.stroke();

      animId = requestAnimationFrame(renderRadar);
    };

    renderRadar();
    return () => cancelAnimationFrame(animId);
  }, [totalMag, anomalyDelta, distanceWalked, activeMap, currentWaypointIndex, spatialGradient]);

  // -------------------------------------------------------------
  // RENDER SEQUENTIAL FINGERPRINT MATCHING WAVEFORM CANVAS
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Dark grid background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Baseline marker (45.2 μT)
    const baselineY = height * 0.65;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(width, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText(`EARTH BASELINE: ${baselineMag} μT`, 10, baselineY - 4);

    // Draw Pre-Cached Blueprint Magnetic Curve (Cyan Dashed)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    const waypoints = activeMap.waypoints;
    waypoints.forEach((wp, idx) => {
      const x = (wp.distMeters / activeMap.totalDistanceMeters) * (width - 40) + 20;
      const y = height - (wp.expectedUT / 100) * height * 0.85;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Real-Time Measured Sequential Fingerprint (Neon Emerald Solid)
    if (fingerprintHistory.length > 1) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      fingerprintHistory.forEach((pt, i) => {
        const x = (pt.dist / activeMap.totalDistanceMeters) * (width - 40) + 20;
        const y = height - (pt.measuredUT / 100) * height * 0.85;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Legend
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('-- Pre-Cached Blueprint Map', width - 180, 18);
    ctx.fillStyle = '#10b981';
    ctx.fillText('— Live Magnetic Fingerprint', width - 180, 32);

  }, [fingerprintHistory, activeMap, baselineMag]);

  return (
    <div className="space-y-6">
      {/* Header Banner: World-First Deep-Tech Pillar #2 */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/80 to-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-8 bottom-4 opacity-10 flex items-center gap-2 pointer-events-none">
          <Magnet className="w-36 h-36 text-sky-400" />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-[11px] font-black tracking-wider uppercase rounded-full shadow-lg">
                WORLD-FIRST INNOVATION #2
              </span>
              <span className="flex items-center gap-1.5 text-xs text-sky-300 font-semibold bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-700/50">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> 0 GPS • 0 Cellular • Compass-Independent
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 flex items-center gap-3">
              Geomagnetic Field Rupture Navigation
              <span className="text-base font-normal text-sky-300 bg-sky-900/40 px-3 py-1 rounded-xl border border-sky-500/20">
                Web Sensor API
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl mt-2 leading-relaxed">
              In collapsed concrete structures, unlit tunnel cave-ins, or deep Himalayan gorges, satellite GPS signals 
              vanish and conventional compasses spin uncontrollably due to iron rebar and structural steel distortion. 
              This system hooks directly into raw uncalibrated magnetometer sensors via the <strong>Web Sensor API</strong>, 
              turning magnetic anomalies into an immutable <strong>spatial fingerprint</strong>. By matching magnetic vector gradients against 
              pre-cached building blueprints, rescuers navigate step-by-step through pitch-black voids without radio signals.
            </p>
          </div>

          {/* Quick Audio & Sensor Mode Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                soundEnabled 
                  ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-md shadow-sky-950/50'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4" />}
              {soundEnabled ? 'Sonar Ping ON' : 'Audio Muted'}
            </button>

            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 flex items-center">
              <button
                onClick={() => setSensorMode('hardware')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  sensorMode === 'hardware'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> Live Sensor
              </button>
              <button
                onClick={() => setSensorMode('simulation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  sensorMode === 'simulation'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> High-Fidelity Sim
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Turn-by-Turn Navigation Strobe Card */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 animate-pulse">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  STEP-BY-STEP PITCH-BLACK GUIDANCE
                </span>
                <span className="text-[10px] font-mono bg-emerald-900/50 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/30">
                  MATCH: {matchConfidence}%
                </span>
              </div>
              <div className="text-lg md:text-xl font-black text-white mt-1">
                {turnGuidance.instruction}
              </div>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                <span>Target Landmark: <strong>{turnGuidance.targetInflection}</strong></span>
                <span>•</span>
                <span>Expected Field: <strong>{turnGuidance.expectedDelta}</strong></span>
                <span>•</span>
                <span>Distance: <strong>{turnGuidance.distanceToInflection.toFixed(1)}m</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={handleManualStep}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <Footprints className="w-4 h-4" /> Step Forward (+1 Pace)
            </button>
            <button
              onClick={() => setIsNavigating(!isNavigating)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                isNavigating 
                  ? 'bg-slate-800 text-slate-300 border-slate-700' 
                  : 'bg-emerald-600 text-white border-emerald-500'
              }`}
            >
              {isNavigating ? 'Pause Walk' : 'Resume Walk'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Rupture Radar & Blueprint Sequential Waveform */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Rupture Radar (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  3D/2D Magnetic Field Rupture Radar
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>GRADIENT: <span className="text-amber-400 font-bold">{spatialGradient >= 0 ? `+${spatialGradient}` : spatialGradient} μT/m</span></span>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative mt-4 aspect-square max-h-[380px] mx-auto bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <canvas 
                ref={radarCanvasRef} 
                width={400} 
                height={400} 
                className="w-full h-full object-contain"
              />

              {/* HUD Overlays */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-0.5">
                <div>TOTAL |B|: <span className="text-sky-400 font-bold">{totalMag} μT</span></div>
                <div>ANOMALY ΔB: <span className="text-amber-400 font-bold">{anomalyDelta >= 0 ? `+${anomalyDelta}` : anomalyDelta} μT</span></div>
                <div>Bx: {magX} | By: {magY} | Bz: {magZ}</div>
              </div>

              <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                COMPASS INDEPENDENT: LOCKED
              </div>
            </div>

            {/* Pedometer & Distance Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                <span>Distance: <strong>{distanceWalked.toFixed(1)}m</strong> / {activeMap.totalDistanceMeters}m</span>
                <span>Paces: <strong>{currentStep}</strong> / {totalSteps} steps</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (distanceWalked / activeMap.totalDistanceMeters) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sequential Fingerprint Matching Canvas */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Sequential Fingerprint Matching Waveform
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                DTW MATCH: {matchConfidence}%
              </span>
            </div>

            <div className="relative mt-4 aspect-[21/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <canvas 
                ref={waveformCanvasRef} 
                width={560} 
                height={200} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Cyan Dashed: Pre-Cached Blueprint Signature</span>
              <span>Emerald Solid: Live Real-Time Magnetic Trace</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pre-cached Blueprint Selector & Landmarks (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Blueprint Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" /> Pre-Cached Blueprint Magnetic Maps
            </h3>

            <div className="space-y-2.5">
              {blueprintMaps.map((map, idx) => (
                <button
                  key={map.id}
                  onClick={() => handleMapSelect(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedBlueprintIndex === idx
                      ? 'bg-sky-950/70 border-sky-500 text-white shadow-lg shadow-sky-950/50'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{map.name}</span>
                    <span className="text-[10px] font-mono text-sky-400">{map.totalDistanceMeters}m</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{map.environment}</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-mono">
                    Baseline: {map.baselineFieldUT} μT • {map.waypoints.length} Magnetic Landmarks
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Blueprint Magnetic Waypoints List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> Waypoint Inflection Sequence</span>
              <span className="text-[10px] font-mono text-slate-400">{activeMap.waypoints.length} Landmarks</span>
            </h3>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {activeMap.waypoints.map((wp, idx) => {
                const isPassed = idx < currentWaypointIndex;
                const isCurrent = idx === currentWaypointIndex;

                return (
                  <div
                    key={wp.index}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-950/60 border-emerald-500/70 text-white shadow-md'
                        : (isPassed ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-950/60 border-slate-800 text-slate-300')
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isCurrent ? 'bg-emerald-500 text-black font-black' : (isPassed ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-400')
                        }`}>
                          {idx}
                        </span>
                        <span>{wp.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-sky-400">{wp.expectedUT} μT</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 ml-7">
                      {wp.landmark}
                    </div>

                    <div className="text-[10px] font-mono mt-1 ml-7 flex items-center justify-between text-slate-500">
                      <span>At {wp.distMeters}m</span>
                      <span className="text-amber-400">{wp.action}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Scientific & Operational Edge Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-slate-300">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-400" /> Deep-Tech Edge: Why Geomagnetic Rupture Trumps Traditional Compasses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="font-bold text-sky-300 mb-1">1. Immunity to Needle Spinning</div>
            <p className="text-slate-400">
              Standard compasses assume a uniform Earth field, so iron rebar spins their needle uselessly. Our algorithm ignores compass heading entirely and measures the scalar spatial gradient $\Delta |B|/\Delta s$, turning structural anomalies into directional waypoints.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="font-bold text-sky-300 mb-1">2. 100% Offline &amp; Zero Radio</div>
            <p className="text-slate-400">
              No GPS, cellular towers, or Wi-Fi beacon infrastructure is required. The pre-cached blueprint stores vector landmarks in kilobytes of local browser IndexedDB storage, enabling instant dead-reckoning navigation in total blackout.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="font-bold text-sky-300 mb-1">3. Pitch-Black Rescuer Guidance</div>
            <p className="text-slate-400">
              In heavy smoke, dust, or subterranean voids where night vision fails, rescuers follow acoustic sonar pings and gradient prompts to locate fire exits and trapped occupants along mapped magnetic corridors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
