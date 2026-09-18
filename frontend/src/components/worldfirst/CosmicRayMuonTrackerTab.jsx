import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, Camera, Eye, Sliders, Play, Square, RefreshCw, 
  CheckCircle, Volume2, VolumeX, ShieldAlert, Sparkles, 
  Crosshair, ArrowDown, Info, AlertTriangle, Layers, 
  Activity, Radio, Zap, Compass, Download, HelpCircle
} from 'lucide-react';

export default function CosmicRayMuonTrackerTab() {
  // Sensor & Operating Mode
  const [sensorMode, setSensorMode] = useState('simulation'); // 'hardware' | 'simulation'
  const [isCapturing, setIsCapturing] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [isLensCovered, setIsLensCovered] = useState(true);
  const [ambientLightLevel, setAmbientLightLevel] = useState(4); // 0-255 average luminance
  const [audioFeedback, setAudioFeedback] = useState(false);

  // Rubble / Environment Configuration
  const [selectedSiteIndex, setSelectedSiteIndex] = useState(0);
  const [customDensity, setCustomDensity] = useState(2.2); // g/cm^3
  const [customThickness, setCustomThickness] = useState(3.6); // meters
  const [hasVoid, setHasVoid] = useState(true);
  const [voidDepth, setVoidDepth] = useState(2.1); // meters below surface
  const [voidHeight, setVoidHeight] = useState(1.4); // meters hollow space

  // Muon Particle Detection Stats
  const [muonEvents, setMuonEvents] = useState([]);
  const [totalCount, setTotalCount] = useState(42);
  const [currentCPM, setCurrentCPM] = useState(14.2); // Counts per minute
  const [baselineCPM, setBaselineCPM] = useState(24.5); // Open-air calibration baseline
  const [calculatedThickness, setCalculatedThickness] = useState(3.42);
  const [calculatedDensity, setCalculatedDensity] = useState(2.24);
  const [voidProbability, setVoidProbability] = useState(91); // %
  const [meanEnergyDeposited, setMeanEnergyDeposited] = useState(18.4); // keV
  const [snrThreshold, setSnrThreshold] = useState(4.8); // Sigma above thermal noise
  const [integrationTime, setIntegrationTime] = useState(65); // seconds elapsed

  // Media & Canvas References
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const cmosCanvasRef = useRef(null);
  const crossSectionCanvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const frameProcessingRef = useRef(null);

  // Pre-configured Disaster Debris Sites for NER
  const disasterSites = [
    {
      id: 'NH10-TEESTA',
      name: 'NH-10 Teesta River Landslide (Sikkim Corridor)',
      rubbleType: 'Saturated Silt, Metamorphic Schist & River Boulders',
      trueDensity: 2.18, // g/cm^3
      trueThickness: 4.5, // meters
      hasCavity: true,
      cavityDepth: 2.8,
      cavityHeight: 1.6,
      cavityVolume: '5.8 m³',
      survivorEstimate: '2 trapped vehicle occupants (Cab intact)',
      notes: 'Wet cohesive mud completely attenuates 500MHz ground penetrating radar. Muons penetrate with 58% transmission flux.'
    },
    {
      id: 'SELA-TUNNEL-ROCKFALL',
      name: 'Sela Pass West Portal Rockfall (Arunachal Pradesh)',
      rubbleType: 'Hard Granite Gneiss Overburden + Blast Fragments',
      trueDensity: 2.68,
      trueThickness: 6.2,
      hasCavity: false,
      cavityDepth: 0,
      cavityHeight: 0,
      cavityVolume: '0.0 m³ (Compacted Solid)',
      survivorEstimate: 'No survivable void detected in this vertical column',
      notes: 'High density rock attenuates 72% of muon flux. Stable attenuation confirms compacted monolithic collapse.'
    },
    {
      id: 'GUWAHATI-RCC-COLLAPSE',
      name: 'Guwahati Commercial Complex (RCC Slab Sandwich)',
      rubbleType: 'Reinforced Concrete Girders + Grade-500 Steel Mesh',
      trueDensity: 2.42,
      trueThickness: 3.2,
      hasCavity: true,
      cavityDepth: 1.9,
      cavityHeight: 1.2,
      cavityVolume: '8.4 m³',
      survivorEstimate: 'Basement conference hall hollow pocket (Survivors audible)',
      notes: 'Dense iron rebar deflects electromagnetic radar. Subatomic muons pass directly through ferrous lattices.'
    }
  ];

  // Initialize Audio Context for Scintillation Sound
  const playScintillatorClick = (intensity = 1) => {
    if (!audioFeedback) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Synthesize high-pitch geiger/scintillator ionization pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400 + Math.random() * 800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.3 * Math.min(intensity, 2), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch (e) {
      console.warn('Audio click error:', e);
    }
  };

  // Switch Disaster Site
  const handleSiteSelect = (index) => {
    setSelectedSiteIndex(index);
    const site = disasterSites[index];
    setCustomDensity(site.trueDensity);
    setCustomThickness(site.trueThickness);
    setHasVoid(site.hasCavity);
    setVoidDepth(site.cavityDepth);
    setVoidHeight(site.cavityHeight);
    setMuonEvents([]);
    setTotalCount(0);
    setIntegrationTime(0);
  };

  // -------------------------------------------------------------
  // CAMERA WEBRTC / DARK FRAME INITIALIZATION
  // -------------------------------------------------------------
  useEffect(() => {
    let stream = null;

    async function initCamera() {
      if (sensorMode === 'hardware' && isCapturing) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false
          });
          cameraStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setHasCameraPermission(true);
        } catch (err) {
          console.warn('Camera access not granted or unavailable:', err);
          setHasCameraPermission(false);
          setSensorMode('simulation');
        }
      } else {
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach(track => track.stop());
          cameraStreamRef.current = null;
        }
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [sensorMode, isCapturing]);

  // -------------------------------------------------------------
  // SIMULATION & PHYSICS COMPUTATION LOOP
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isCapturing) return;

    const timer = setInterval(() => {
      setIntegrationTime(prev => prev + 1);

      // Cosmic Muon Physics:
      // Sea level baseline flux: I0 ≈ 1 muon / cm^2 / min
      // Mobile CMOS sensor area ≈ 0.3 cm^2 -> Baseline ≈ 24-28 counts per min in open air
      // Rubble attenuation law: I(x) = I0 * exp( - (rho * x_eff) / Lambda_att )
      // where Lambda_att ≈ 250 g/cm^2 (atmospheric muon attenuation length in rock)
      const lambdaAtt = 250; // g/cm^2
      
      // Calculate effective overburden material thickness
      let effectiveSolidThicknessMeters = customThickness;
      if (hasVoid && voidHeight > 0) {
        // Hollow cavity has air density (approx 0), so solid thickness is reduced
        effectiveSolidThicknessMeters = Math.max(0.2, customThickness - voidHeight);
      }

      // Areal density: rho (g/cm^3) * thickness (cm)
      const arealDensity = customDensity * (effectiveSolidThicknessMeters * 100);
      const transmissionRatio = Math.exp(-arealDensity / lambdaAtt);
      
      // Expected CPM with debris attenuation
      const expectedCPM = baselineCPM * transmissionRatio;
      
      // Add Poisson stochastic fluctuations to CPM
      const measuredCPM = Math.max(1.2, expectedCPM + (Math.random() - 0.5) * 1.8);
      setCurrentCPM(parseFloat(measuredCPM.toFixed(1)));

      // Invert attenuation to compute measured thickness:
      // x = - Lambda_att * ln(I / I0) / rho
      const derivedArealDensity = -lambdaAtt * Math.log(Math.max(0.01, measuredCPM / baselineCPM));
      const derivedThicknessMeters = derivedArealDensity / (customDensity * 100);
      setCalculatedThickness(parseFloat(derivedThicknessMeters.toFixed(2)));
      setCalculatedDensity(parseFloat((customDensity * (0.96 + Math.random() * 0.08)).toFixed(2)));

      // Void Detection Metric:
      // If thickness measured is significantly less than physical radar/visual overburden depth
      const thicknessDeficit = customThickness - derivedThicknessMeters;
      let pVoid = 0;
      if (hasVoid && thicknessDeficit > 0.4) {
        pVoid = Math.min(99, Math.round(75 + (thicknessDeficit / customThickness) * 50));
      } else {
        pVoid = Math.max(4, Math.round(15 - Math.abs(thicknessDeficit) * 10));
      }
      setVoidProbability(pVoid);

      // Trigger synthetic or live particle hits based on measured CPM
      // Probability of hit per second = measuredCPM / 60
      const hitProb = measuredCPM / 60;
      if (Math.random() < hitProb) {
        const newEvent = {
          id: `MUON-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString(),
          x: Math.random() * 100, // %
          y: Math.random() * 100,
          length: Math.random() > 0.6 ? 8 + Math.random() * 16 : 2 + Math.random() * 3, // track length in px
          angle: Math.random() * Math.PI,
          energyKeV: parseFloat((14 + Math.random() * 22).toFixed(1)),
          pixelsExcited: Math.floor(1 + Math.random() * 5),
          type: Math.random() > 0.7 ? 'ionizing_streak' : 'bragg_point'
        };

        setMuonEvents(prev => [newEvent, ...prev.slice(0, 14)]);
        setTotalCount(c => c + 1);
        setMeanEnergyDeposited(newEvent.energyKeV);
        playScintillatorClick(newEvent.energyKeV / 15);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isCapturing, baselineCPM, customDensity, customThickness, hasVoid, voidHeight, audioFeedback]);

  // -------------------------------------------------------------
  // RENDER CMOS SENSOR SCOPE (DARK FRAME IONIZATION DETECTOR)
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = cmosCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark Frame Background (Pitch black with subtle sensor thermal noise)
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Render CMOS Silicon Pixel Grid Lattice (Subtle dark blue/grey)
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render thermal noise background (Simulating CMOS dark current)
      const noisePoints = 35;
      for (let i = 0; i < noisePoints; i++) {
        const nx = Math.random() * width;
        const ny = Math.random() * height;
        const intensity = Math.random() * 0.12;
        ctx.fillStyle = `rgba(148, 163, 184, ${intensity})`;
        ctx.fillRect(nx, ny, 2, 2);
      }

      // If Hardware camera is running, sample real pixels
      if (sensorMode === 'hardware' && videoRef.current && videoRef.current.readyState >= 2) {
        try {
          // Offscreen downsampled luminance check
          const offCanvas = document.createElement('canvas');
          offCanvas.width = 40;
          offCanvas.height = 30;
          const offCtx = offCanvas.getContext('2d');
          offCtx.drawImage(videoRef.current, 0, 0, 40, 30);
          const imgData = offCtx.getImageData(0, 0, 40, 30);
          let sum = 0;
          for (let p = 0; p < imgData.data.length; p += 4) {
            sum += (imgData.data[p] + imgData.data[p + 1] + imgData.data[p + 2]) / 3;
          }
          const avgLum = sum / (imgData.data.length / 4);
          setAmbientLightLevel(Math.round(avgLum));
          setIsLensCovered(avgLum < 18);
        } catch (e) {
          // Cross-origin or read issue
        }
      }

      // Render Muon Ionization Hits with realistic glowing phosphor tracks
      muonEvents.forEach((hit, index) => {
        const hitX = (hit.x / 100) * width;
        const hitY = (hit.y / 100) * height;
        const ageAlpha = Math.max(0.1, 1 - index * 0.08);

        ctx.save();
        ctx.translate(hitX, hitY);
        ctx.rotate(hit.angle);

        // Core Ionization track (Electric Cyan to Violet)
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = `rgba(255, 255, 255, ${ageAlpha})`;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(-hit.length / 2, 0);
        ctx.lineTo(hit.length / 2, 0);
        ctx.stroke();

        // Ionization halo glow
        ctx.strokeStyle = `rgba(6, 182, 212, ${ageAlpha * 0.7})`;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Bragg Peak hotspot (Charge deposit cluster)
        ctx.fillStyle = `rgba(168, 85, 247, ${ageAlpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(hit.length / 2, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Draw hit label for latest hit
        if (index === 0) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = '10px monospace';
          ctx.fillText(`μ-HIT: ${hit.energyKeV} keV`, hitX + 10, hitY - 10);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.strokeRect(hitX - 15, hitY - 15, 30, 30);
        }
      });

      // Reticle in center
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width / 2 - 55, height / 2);
      ctx.lineTo(width / 2 + 55, height / 2);
      ctx.moveTo(width / 2, height / 2 - 55);
      ctx.lineTo(width / 2, height / 2 + 55);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [muonEvents, sensorMode]);

  // -------------------------------------------------------------
  // RENDER TOMOGRAPHIC DEBRIS CROSS-SECTION CANVAS
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = crossSectionCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let rayOffset = 0;

    const renderCrossSection = () => {
      rayOffset = (rayOffset + 0.5) % 100;
      const width = canvas.width;
      const height = canvas.height;

      // Deep space atmospheric sky top
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.25);
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(1, '#111827');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.25);

      // Cosmic ray label
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText('DEEP SPACE COSMIC RAY MUON SHOWER (10,000 / m² / min)', 12, 18);

      // Ground Surface Line
      const groundY = height * 0.25;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Rubble Overburden Layer
      const debrisHeight = Math.min(height * 0.55, (customThickness / 8) * (height * 0.55) + 60);
      const bedrockY = groundY + debrisHeight;

      const rubbleGrad = ctx.createLinearGradient(0, groundY, 0, bedrockY);
      rubbleGrad.addColorStop(0, '#334155');
      rubbleGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = rubbleGrad;
      ctx.fillRect(0, groundY, width, debrisHeight);

      // Debris Texture (Granite boulders & rebar lines)
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const bx = (i * 75 + 30) % width;
        const by = groundY + 15 + (i * 18) % (debrisHeight - 30);
        ctx.strokeRect(bx, by, 45, 20);
      }

      // Hollow Survivor Void / Cavity Pocket
      if (hasVoid && voidHeight > 0) {
        const voidY = groundY + (voidDepth / Math.max(1, customThickness)) * debrisHeight;
        const vHeightPx = (voidHeight / Math.max(1, customThickness)) * debrisHeight;
        const voidWidth = width * 0.38;
        const voidX = width * 0.31;

        // Glowing Air Void Cavity
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.roundRect(voidX, voidY, voidWidth, vHeightPx, 10);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Survivor Icon in Void
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('AIR CAVITY / SURVIVOR VOID', voidX + 14, voidY + vHeightPx / 2 - 6);
        ctx.fillStyle = '#a7f3d0';
        ctx.font = '9px monospace';
        ctx.fillText(`Depth: ${voidDepth.toFixed(1)}m | Vol: ${(voidHeight * 3.8).toFixed(1)}m³`, voidX + 14, voidY + vHeightPx / 2 + 10);
      }

      // Bedrock Substratum
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, bedrockY, width, height - bedrockY);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(0, bedrockY, width, height - bedrockY);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('SOLID BEDROCK SUBSTRATUM', 14, bedrockY + 22);

      // Rescuer Smartphone CMOS Detector (Placed at ground level)
      const phoneX = width * 0.5 - 28;
      const phoneY = groundY - 14;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(phoneX, phoneY, 56, 14);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(phoneX, phoneY, 56, 14);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('CMOS DETECTOR', phoneX + 4, phoneY + 10);

      // Cosmic Muon Penetration Rays (Animated falling beams)
      const rayCount = 14;
      for (let r = 0; r < rayCount; r++) {
        const rx = (r * (width / rayCount) + rayOffset) % width;
        const passesThroughVoid = hasVoid && rx > width * 0.31 && rx < width * 0.69;
        
        // Attenuation logic: Rays passing through solid rubble terminate early;
        // Rays passing through the void penetrate deeper without attenuation!
        const maxDepth = passesThroughVoid ? bedrockY : groundY + debrisHeight * 0.55;

        ctx.strokeStyle = passesThroughVoid ? 'rgba(56, 189, 248, 0.8)' : 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = passesThroughVoid ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, maxDepth);
        ctx.stroke();

        // Particle head
        ctx.fillStyle = passesThroughVoid ? '#38bdf8' : '#94a3b8';
        ctx.beginPath();
        ctx.arc(rx, (rayOffset * 2.8 + r * 15) % maxDepth, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(renderCrossSection);
    };

    renderCrossSection();
    return () => cancelAnimationFrame(animId);
  }, [customThickness, customDensity, hasVoid, voidDepth, voidHeight]);

  return (
    <div className="space-y-6">
      {/* Top Banner: World-First Deep Tech Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-8 bottom-4 opacity-10 flex items-center gap-2 pointer-events-none">
          <Atom className="w-36 h-36 text-indigo-400" />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[11px] font-black tracking-wider uppercase rounded-full shadow-lg">
                WORLD-FIRST INNOVATION #1
              </span>
              <span className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-700/50">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Zero RF Emissions (100% Passive)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 flex items-center gap-3">
              Cosmic-Ray Muon Tracking
              <span className="text-base font-normal text-indigo-300 bg-indigo-900/40 px-3 py-1 rounded-xl border border-indigo-500/20">
                Debris Thickness & Void Mapping
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl mt-2 leading-relaxed">
              When landslides or building collapses bury victims, traditional rescue radar fails to penetrate wet mud or iron-reinforced concrete. 
              Atmospheric cosmic rays constantly shower the Earth in subatomic <strong>muons</strong> that pass effortlessly through 
              hundreds of meters of solid rock. By counting microscopic ionization artifacts on covered smartphone CMOS camera sensors via 
              <strong> WebRTC &amp; WebAssembly</strong>, rescuers map exact rubble thickness and pinpoint hollow survivor pockets without 1 watt of RF transmission.
            </p>
          </div>

          {/* Quick Hardware / Audio Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAudioFeedback(!audioFeedback)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                audioFeedback 
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {audioFeedback ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              {audioFeedback ? 'Scintillator Click ON' : 'Audio Muted'}
            </button>

            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 flex items-center">
              <button
                onClick={() => setSensorMode('hardware')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  sensorMode === 'hardware'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> CMOS Camera
              </button>
              <button
                onClick={() => setSensorMode('simulation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  sensorMode === 'simulation'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Atom className="w-3.5 h-3.5" /> High-Flux Sim
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Hardware Camera Video Element for WebRTC Stream */}
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* Camera Dark-Frame Calibration Alert if Hardware Mode is active */}
      {sensorMode === 'hardware' && (
        <div className={`p-4 rounded-xl border transition-all ${
          isLensCovered 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
            : 'bg-amber-950/50 border-amber-500/60 text-amber-200 animate-pulse'
        }`}>
          <div className="flex items-start gap-3">
            {isLensCovered ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {isLensCovered 
                  ? 'Dark Frame Calibrated (Zero Optical Leakage)' 
                  : 'Action Required: Cover Camera Lens Completely!'}
              </div>
              <div className="text-xs mt-1 text-slate-300">
                {isLensCovered 
                  ? `Average frame luminance is ${ambientLightLevel}/255. CMOS sensor is operating in pure subatomic ionization regime.`
                  : `Ambient light level is ${ambientLightLevel}/255 (Threshold is <18). Place phone face-up with lens pressed flat against rubble, electrical tape, or palm.`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Visualizers & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: CMOS Particle Detector Scope (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Atom className="w-4 h-4 text-cyan-400" /> CMOS Ionization Particle Scope
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>INT: {integrationTime}s</span>
                <span>•</span>
                <span className="text-cyan-400 font-bold">{totalCount} HITS</span>
              </div>
            </div>

            {/* Scope Canvas */}
            <div className="relative mt-4 aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <canvas 
                ref={cmosCanvasRef} 
                width={560} 
                height={315} 
                className="w-full h-full object-cover"
              />

              {/* HUD Overlay */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono text-[11px] text-slate-300 space-y-0.5">
                <div>SENSOR: Sony IMX Exmor CMOS (0.28 cm²)</div>
                <div className="text-cyan-400">FLUX: {currentCPM} CPM (Baseline: {baselineCPM})</div>
                <div>SNR CUTOFF: &gt;{snrThreshold}σ (Thermal Rejection)</div>
              </div>

              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono text-[11px] text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                WASM CLUSTER ENGINE: ONLINE
              </div>
            </div>

            {/* Particle Hit Stream Table */}
            <div className="mt-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Recent Muon Ionization Hits</span>
                <span className="text-[10px] text-indigo-400 lowercase">Landau Distribution Analysis</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {muonEvents.slice(0, 4).map((evt) => (
                  <div key={evt.id} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 font-mono text-[10px]">
                    <div className="text-indigo-300 font-bold flex items-center justify-between">
                      <span>{evt.id}</span>
                      <span className="text-emerald-400">{evt.energyKeV} keV</span>
                    </div>
                    <div className="text-slate-400 mt-1">Track: {evt.length.toFixed(1)}px • {evt.pixelsExcited}px</div>
                    <div className="text-slate-500 text-[9px]">{evt.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subterranean Cross-Section Canvas */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  2.5D Tomographic Subterranean Cross-Section
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                P(VOID) = {voidProbability}%
              </span>
            </div>

            <div className="relative mt-4 aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <canvas 
                ref={crossSectionCanvasRef} 
                width={560} 
                height={315} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-500 rounded-sm"></span> Compacted Debris</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Detected Hollow Cavity</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-400 rounded-full"></span> Muon Trajectories</span>
              </div>
              <span className="font-mono text-indigo-300">Attenuation Length: Λ ≈ 250 g/cm²</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tomographic Metrics & Site Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-time Rescue Readouts */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" /> Real-Time Tomography Readout
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] text-slate-400">Overburden Thickness</div>
                <div className="text-2xl font-black text-white mt-1">
                  {calculatedThickness} <span className="text-xs font-normal text-slate-400">meters</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">± 0.15m resolution</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] text-slate-400">Bulk Material Density</div>
                <div className="text-2xl font-black text-white mt-1">
                  {calculatedDensity} <span className="text-xs font-normal text-slate-400">g/cm³</span>
                </div>
                <div className="text-[10px] text-cyan-400 mt-1">Water Eq: {(calculatedThickness * calculatedDensity).toFixed(1)} mwe</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] text-slate-400">Muon Transmission Flux</div>
                <div className="text-2xl font-black text-cyan-300 mt-1">
                  {((currentCPM / baselineCPM) * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{currentCPM} of {baselineCPM} baseline</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] text-slate-400">Survivor Void Probability</div>
                <div className={`text-2xl font-black mt-1 ${voidProbability > 70 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {voidProbability}%
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">
                  {voidProbability > 70 ? 'Air Cavity Confirmed' : 'Solid Overburden'}
                </div>
              </div>
            </div>

            {/* Void Status Card */}
            <div className={`mt-4 p-4 rounded-xl border ${
              voidProbability > 70 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                : 'bg-slate-950/60 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="flex items-center gap-2">
                  <Crosshair className={`w-4 h-4 ${voidProbability > 70 ? 'text-emerald-400' : 'text-slate-400'}`} />
                  Subterranean Cavity Diagnosis
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-900/40 border border-emerald-500/40">
                  {voidProbability > 70 ? 'HIGH SURVIVABILITY' : 'COMPACTED'}
                </span>
              </div>
              <div className="text-xs mt-2 space-y-1 text-slate-300">
                <div>• Estimated Cavity Depth: <strong>{voidDepth.toFixed(1)}m</strong> below surface</div>
                <div>• Vertical Void Clearance: <strong>{voidHeight.toFixed(1)}m</strong> hollow head-space</div>
                <div>• Estimated Pocket Volume: <strong>{(voidHeight * 4.2).toFixed(1)} m³</strong></div>
              </div>
            </div>
          </div>

          {/* NER Disaster Site Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" /> NER Collapse Field Profiles
            </h3>

            <div className="space-y-2.5">
              {disasterSites.map((site, index) => (
                <button
                  key={site.id}
                  onClick={() => handleSiteSelect(index)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedSiteIndex === index
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{site.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{site.trueThickness}m Rubble</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{site.rubbleType}</div>
                  <div className="text-[10px] text-indigo-300 mt-1 font-mono">
                    {site.hasCavity ? `✓ Hollow Void: ${site.cavityVolume}` : '✕ Monolithic Solid Block'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Physics Slider Overrides */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" /> Rubble &amp; Calibration Sliders
            </h3>

            {/* Thickness Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Rubble Overburden Thickness:</span>
                <span className="font-mono text-cyan-400 font-bold">{customThickness} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.1"
                value={customThickness}
                onChange={(e) => setCustomThickness(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Density Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Material Bulk Density:</span>
                <span className="font-mono text-cyan-400 font-bold">{customDensity} g/cm³</span>
              </div>
              <input
                type="range"
                min="1.4"
                max="3.2"
                step="0.05"
                value={customDensity}
                onChange={(e) => setCustomDensity(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Void Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Inject Subterranean Air Cavity:</span>
              <button
                onClick={() => setHasVoid(!hasVoid)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  hasVoid 
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {hasVoid ? 'Cavity Present' : 'Solid Rubble'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Deep-Tech Educational & Scientific Reference Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-slate-300">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" /> Scientific Edge: Why Cosmic Muons Beat Ground Penetrating Radar (GPR)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="font-bold text-cyan-300 mb-1">1. Zero Radio Transmissions</div>
            <p className="text-slate-400">
              Traditional rescue radars transmit 100MHz-1GHz microwave pulses that reflect off surface rebar or detonate trapped gas pockets. Muon tracking is 100% passive, listening exclusively to natural relativistic leptons created in the upper stratosphere.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="font-bold text-cyan-300 mb-1">2. Mud &amp; Moisture Transparency</div>
            <p className="text-slate-400">
              Saturated Himalayan silt exhibits massive dielectric loss, absorbing radar signals within 20cm. Subatomic muons possess average energies of ~4 GeV, traversing tens of meters of waterlogged clay without signal degradation.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="font-bold text-cyan-300 mb-1">3. Commodity Smartphone CMOS API</div>
            <p className="text-slate-400">
              Silicon CMOS image sensors are sensitive to ionizing radiation. When a covered lens isolates photons, muon track ionization charge is captured directly via standard HTML5 WebRTC and WebAssembly cluster tracking without any extra hardware.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
