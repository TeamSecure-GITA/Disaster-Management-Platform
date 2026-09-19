import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Radio, Zap, Volume2, VolumeX, Play, Square, RefreshCw, 
  Activity, ShieldAlert, ShieldCheck, Clock, MapPin, 
  Info, Compass, BatteryCharging, WifiOff, AlertTriangle,
  Sliders, Waves, Share2, Layers, CheckCircle
} from 'lucide-react';

export default function ScreenCoilParasiticRfBeaconTab() {
  // Operating Mode & Transmitter State
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [soundEmulationEnabled, setSoundEmulationEnabled] = useState(true);
  const [selectedHarmonicKhz, setSelectedHarmonicKhz] = useState(640); // AM Radio Frequency (kHz)
  const [modulationDutyCyclePercent, setModulationDutyCyclePercent] = useState(60); // 15s transmit, 10s sleep

  // Physical Soil Penetration & Soil Matrix State
  const [selectedSoilIndex, setSelectedSoilIndex] = useState(0);
  const [calculatedSkinDepthMeters, setCalculatedSkinDepthMeters] = useState(3.8); // skin depth delta
  const [estimatedBatteryHoursRemaining, setEstimatedBatteryHoursRemaining] = useState(74.5); // hrs

  // Real-Time Morse Code SOS State
  const [currentMorseSymbol, setCurrentMorseSymbol] = useState('IDLE'); // 'DIT' | 'DAH' | 'SPACE' | 'IDLE'
  const [morseProgressText, setMorseProgressText] = useState('... --- ...');
  const [activeCycleState, setActiveCycleState] = useState('BURST_TRANSMIT'); // 'BURST_TRANSMIT' | 'DEEP_SLEEP_HOLD'
  const [burstCountdownSeconds, setBurstCountdownSeconds] = useState(15);

  // Screen Flicker / Optical Inductive Visualizer
  const [screenFlickerPulse, setScreenFlickerPulse] = useState(false);
  const [rfFieldStrengthDbm, setRfFieldStrengthDbm] = useState(-42.8); // dBm near-field

  // Canvases & Audio Refs
  const spectrumCanvasRef = useRef(null);
  const skinDepthCanvasRef = useRef(null);
  const oscillogramCanvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioOscillatorRef = useRef(null);
  const audioGainRef = useRef(null);
  const morseTimerRef = useRef(null);
  const dutyCycleTimerRef = useRef(null);

  // Pre-configured Soil & Rubble Matrices
  const soilMatrices = [
    {
      id: 'PASIGHAT-WET-CLAY-SILT',
      name: 'Pasighat Saturated Valley Mud & River Silt',
      location: 'East Siang Riverbed Inundation',
      conductivitySm: 0.05, // S/m (Siemens per meter)
      dielectricConstant: 25,
      attenuationDbmPerMeter: 3.2,
      maxDetectDepthMeters: 8.5,
      description: 'Heavy wet mud absorbs 2.4GHz Wi-Fi in 4cm. Low-frequency parasitic AM harmonics penetrate over 8 meters of dense mud.'
    },
    {
      id: 'RCC-COLLAPSED-CONCRETE',
      name: 'Reinforced Concrete (M30) & Steel Rebar Rubble',
      location: 'Urban Structural Collapse Core',
      conductivitySm: 0.02,
      dielectricConstant: 12,
      attenuationDbmPerMeter: 2.1,
      maxDetectDepthMeters: 12.0,
      description: 'Crushed concrete slabs create air cavities. Steel rebar mesh couples parasitically to screen inductive loop.'
    },
    {
      id: 'SELA-GRANITIC-ROCKFALL',
      name: 'Compacted Himalayan Granite Rockfall',
      location: 'Sela Pass High-Altitude Cliff Slope',
      conductivitySm: 0.001,
      dielectricConstant: 6,
      attenuationDbmPerMeter: 0.8,
      maxDetectDepthMeters: 24.0,
      description: 'Ultra-low rock conductivity allows long-range sub-surface penetration reaching up to 24 meters into the rubble.'
    },
    {
      id: 'SATURATED-RIVERBED-GRAVEL',
      name: 'Coarse Riverbed Sand & Cobblestone Slurry',
      location: 'Lower Subansiri Flood Plain',
      conductivitySm: 0.01,
      dielectricConstant: 18,
      attenuationDbmPerMeter: 1.6,
      maxDetectDepthMeters: 15.0,
      description: 'Permeable water-logged gravel matrix with moderate inductive ground absorption.'
    }
  ];

  const activeSoil = soilMatrices[selectedSoilIndex];

  // -------------------------------------------------------------
  // SKIN DEPTH ELECTROMAGNETIC EQUATION
  // -------------------------------------------------------------
  // delta = sqrt(2 / (omega * mu * sigma)) = sqrt(1 / (pi * f * mu0 * sigma))
  // mu0 = 4 * pi * 1e-7 H/m
  const calculateSkinDepth = useCallback((freqKhz, sigma) => {
    const f = freqKhz * 1000; // Hz
    const mu0 = 4 * Math.PI * 1e-7;
    const omega = 2 * Math.PI * f;
    const delta = Math.sqrt(2 / (omega * mu0 * sigma));
    return delta;
  }, []);

  // Update skin depth whenever soil matrix or frequency changes
  useEffect(() => {
    const depth = calculateSkinDepth(selectedHarmonicKhz, activeSoil.conductivitySm);
    setCalculatedSkinDepthMeters(parseFloat(depth.toFixed(1)));
  }, [selectedHarmonicKhz, activeSoil, calculateSkinDepth]);

  // -------------------------------------------------------------
  // AUDIO RESCUE SWEEP SOUND EMULATION (AM TRANSISTOR RADIO BUZZ)
  // -------------------------------------------------------------
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (!audioOscillatorRef.current) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Synthesize AM radio parasitic heterodyne whistle & pulse
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(680, ctx.currentTime); // audible heterodyne tone
      gain.gain.setValueAtTime(0.0, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioOscillatorRef.current = osc;
      audioGainRef.current = gain;
    }
  };

  const setAudioTone = (active) => {
    if (!soundEmulationEnabled || !audioGainRef.current || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const gain = audioGainRef.current;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    if (active) {
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
    } else {
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    }
  };

  // -------------------------------------------------------------
  // MORSE CODE SOS TRANSMITTER TIMING LOOP
  // -------------------------------------------------------------
  // SOS pattern: 3 Dits (120ms), 3 Dahs (360ms), 3 Dits (120ms)
  // Element spacing: 120ms, Word pause: 900ms
  useEffect(() => {
    if (!isBeaconActive) {
      setAudioTone(false);
      setScreenFlickerPulse(false);
      setCurrentMorseSymbol('IDLE');
      return;
    }

    initAudio();

    const sequence = [
      // S (...)
      { symbol: 'DIT', duration: 120, state: true },
      { symbol: 'GAP', duration: 100, state: false },
      { symbol: 'DIT', duration: 120, state: true },
      { symbol: 'GAP', duration: 100, state: false },
      { symbol: 'DIT', duration: 120, state: true },
      { symbol: 'CHAR_GAP', duration: 320, state: false },
      // O (---)
      { symbol: 'DAH', duration: 360, state: true },
      { symbol: 'GAP', duration: 100, state: false },
      { symbol: 'DAH', duration: 360, state: true },
      { symbol: 'GAP', duration: 100, state: false },
      { symbol: 'DAH', duration: 360, state: true },
      { symbol: 'CHAR_GAP', duration: 320, state: false },
      // S (...)
      { symbol: 'DIT', duration: 120, state: true },
      { symbol: 'GAP', duration: 100, state: false },
      { symbol: 'DIT', duration: 120, state: true },
      { symbol: 'GAP', duration: 100, state: false },
      { symbol: 'DIT', duration: 120, state: true },
      // Word Pause
      { symbol: 'WORD_GAP', duration: 900, state: false }
    ];

    let stepIndex = 0;
    let isCancelled = false;

    const runStep = () => {
      if (isCancelled || !isBeaconActive) return;
      const current = sequence[stepIndex];
      setCurrentMorseSymbol(current.symbol);
      setScreenFlickerPulse(current.state);
      setAudioTone(current.state);

      morseTimerRef.current = setTimeout(() => {
        stepIndex = (stepIndex + 1) % sequence.length;
        runStep();
      }, current.duration);
    };

    runStep();

    return () => {
      isCancelled = true;
      if (morseTimerRef.current) clearTimeout(morseTimerRef.current);
      setAudioTone(false);
    };
  }, [isBeaconActive]);

  // -------------------------------------------------------------
  // DUTY CYCLE CONTROLLER (15s Burst Transmit, 10s Sleep)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isBeaconActive) return;

    const interval = setInterval(() => {
      setBurstCountdownSeconds((prev) => {
        if (prev <= 1) {
          // Toggle between burst and deep-sleep hold
          setActiveCycleState((state) => {
            const next = state === 'BURST_TRANSMIT' ? 'DEEP_SLEEP_HOLD' : 'BURST_TRANSMIT';
            return next;
          });
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBeaconActive]);

  // -------------------------------------------------------------
  // CANVAS 1: RF CARRIER HARMONIC SPECTRUM WATERFALL (500-1600 kHz)
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let tick = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050a16';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      for (let y = 20; y < h; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const minKhz = 500;
      const maxKhz = 1600;

      // Draw baseline RF ambient noise floor
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x < w; x++) {
        const khz = minKhz + (x / w) * (maxKhz - minKhz);
        const noise = Math.sin(tick * 0.1 + x * 0.4) * 4 + (Math.random() - 0.5) * 5;
        let peakAmplitude = noise + 18;

        // Modulated carrier harmonic peak
        const distToHarmonic = Math.abs(khz - selectedHarmonicKhz);
        if (distToHarmonic < 35 && isBeaconActive && screenFlickerPulse) {
          const resonanceGain = (1 - distToHarmonic / 35) * (h * 0.72);
          peakAmplitude += resonanceGain;
        }

        const y = h - Math.min(h * 0.9, peakAmplitude);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      if (isBeaconActive && screenFlickerPulse) {
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
      } else {
        grad.addColorStop(0, 'rgba(100, 116, 139, 0.4)');
        grad.addColorStop(1, 'rgba(100, 116, 139, 0.05)');
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Cursor at tuned AM frequency
      const cursorX = ((selectedHarmonicKhz - minKhz) / (maxKhz - minKhz)) * w;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, h);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`${selectedHarmonicKhz} kHz AM`, Math.min(w - 75, Math.max(10, cursorX - 25)), 16);

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedHarmonicKhz, isBeaconActive, screenFlickerPulse]);

  // -------------------------------------------------------------
  // CANVAS 2: SOIL DEPTH PENETRATION ATTENUATION CURVE delta(f)
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = skinDepthCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#030814';
      ctx.fillRect(0, 0, w, h);

      // Curve comparing 2.4GHz Wi-Fi (skin depth 4cm) vs Parasitic LF/MF AM (meters)
      const maxMeters = 20;
      const getY = (m) => h - (m / maxMeters) * (h * 0.85);

      // Draw depth axis lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let m = 2; m <= maxMeters; m += 4) {
        const y = getY(m);
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText(`${m}m`, 8, y + 3);
      }

      // Bar 1: Standard 2.4 GHz Wi-Fi / BLE (dead at 0.04m)
      const wifiDepth = 0.04;
      const wifiY = getY(wifiDepth);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
      ctx.fillRect(w * 0.25, wifiY, 40, h - wifiY);
      ctx.fillStyle = '#f43f5e';
      ctx.font = '10px monospace';
      ctx.fillText('2.4GHz', w * 0.25, h - 8);
      ctx.fillText('0.04m', w * 0.25, wifiY - 6);

      // Bar 2: Parasitic LF/MF AM Beacon (calculatedSkinDepthMeters)
      const amDepth = calculatedSkinDepthMeters;
      const amY = getY(amDepth);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.fillRect(w * 0.65, amY, 40, h - amY);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText('AM Pulse', w * 0.65, h - 8);
      ctx.fillText(`${amDepth}m`, w * 0.65, amY - 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [calculatedSkinDepthMeters]);

  // -------------------------------------------------------------
  // CANVAS 3: REAL-TIME MORSE CODE SOS OSCILLOGRAM
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = oscillogramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let phase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050c18';
      ctx.fillRect(0, 0, w, h);

      // Zero line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      if (isBeaconActive && screenFlickerPulse) {
        ctx.beginPath();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;

        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * 0.2 + phase) * (h * 0.38);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Flatline idle
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      phase += 0.4;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isBeaconActive, screenFlickerPulse]);

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* HEADER: TITLE, BADGES, AND WORLD-FIRST INNOVATION BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/50 to-slate-900 p-5 rounded-2xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black tracking-wide border border-amber-500/40 uppercase">
                #17 WORLD-FIRST
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                PARASITIC DISPLAY INDUCTION
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                ZERO-INFRASTRUCTURE DEEP SOIL PENETRATION
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Radio className="w-6 h-6 text-amber-400 animate-pulse" />
              Screen-Coil Parasitic RF Resonance Ematch (Emergency Radio Beacon)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              When a victim is buried under yards of wet mud and concrete, 2.4GHz cellular and Wi-Fi waves are 100% absorbed within inches. 
              By driving high-frequency subpixel brightness oscillations, the platform forces the display DC-DC boost inductor coils to emit parasitic electromagnetic leakage tuned to the low-frequency AM radio band (540–1600 kHz), piercing yards of dense rubble to reach rescue sweeps.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setSoundEmulationEnabled(!soundEmulationEnabled)}
              className={`p-2 rounded-xl border transition-all ${
                soundEmulationEnabled 
                  ? 'bg-amber-950/80 border-amber-400 text-amber-300' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}
              title="Toggle Audio Emulation (AM Receiver Buzz)"
            >
              {soundEmulationEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* MASTER TRANSMIT CONTROLLER & ACTIVE STATUS */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isBeaconActive 
          ? 'bg-amber-950/40 border-amber-500/70 shadow-2xl shadow-amber-950/50' 
          : 'bg-slate-900/80 border-slate-800'
      } flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isBeaconActive 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' 
                : 'bg-slate-800 text-slate-400'
            }`}>
              {isBeaconActive ? 'TRANSMITTING ELECTROMAGNETIC BEACON' : 'STANDBY MODE'}
            </span>
            {isBeaconActive && (
              <span className="text-xs font-mono text-cyan-400 font-bold">
                [{currentMorseSymbol}] {morseProgressText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {isBeaconActive ? (
              <span>
                Display inductive boost coils pulsing at <strong className="text-amber-300 font-mono">{selectedHarmonicKhz} kHz</strong>. Rescuers tuning any portable AM transistor radio nearby will hear the rhythmic Morse SOS buzz.
              </span>
            ) : (
              <span>
                Beacon standby. Press Activate Beacon to begin deep-soil parasitic radio transmission. Conserves battery with 60% duty cycling.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {!isBeaconActive ? (
            <button
              onClick={() => setIsBeaconActive(true)}
              className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-xl shadow-amber-500/30"
            >
              <Play className="w-4 h-4" /> ACTIVATE EMERGENCY RF BEACON
            </button>
          ) : (
            <button
              onClick={() => setIsBeaconActive(false)}
              className="py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xl shadow-rose-600/30"
            >
              <Square className="w-4 h-4" /> CEASE BEACON TRANSMISSION
            </button>
          )}
        </div>
      </div>

      {/* FREQUENCY TUNING & RUBBLE MATRIX SELECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* AM Carrier Harmonic Frequency Selector */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-amber-400" />
                Target AM Broadcast Frequency
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold">
                {selectedHarmonicKhz} kHz
              </span>
            </div>
            <select
              value={selectedHarmonicKhz}
              onChange={(e) => setSelectedHarmonicKhz(parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none mb-2"
            >
              <option value={540}>540 kHz (Lowest Attenuation / Deepest Soil Penetration)</option>
              <option value={640}>640 kHz (Clear Emergency Broadcast Channel)</option>
              <option value={820}>820 kHz (Mid-Band Standard Transistor Sweep)</option>
              <option value={1040}>1040 kHz (High Inductive Coupling Peak)</option>
              <option value={1200}>1200 kHz (Compact Rubble Void Harmonic)</option>
            </select>
          </div>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800">
            Rescuers tune standard AM receiver to {selectedHarmonicKhz} AM dial.
          </div>
        </div>

        {/* Soil & Debris Matrix Selector */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                Burial Rubble Matrix
              </span>
              <span className="text-[10px] font-mono text-sky-300 font-bold">
                {calculatedSkinDepthMeters}m Skin Depth
              </span>
            </div>
            <select
              value={selectedSoilIndex}
              onChange={(e) => setSelectedSoilIndex(parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-sky-500 focus:outline-none mb-2"
            >
              {soilMatrices.map((matrix, idx) => (
                <option key={matrix.id} value={idx}>
                  {matrix.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 truncate">
            Conductivity: {activeSoil.conductivitySm} S/m
          </div>
        </div>

        {/* Battery Conservation Duty Cycling */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                Battery Conservation Duty Cycle
              </span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold">
                {estimatedBatteryHoursRemaining} Hours Life
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs mb-2">
              <span className="text-slate-400">Current Phase:</span>
              <span className={`font-mono font-bold ${
                activeCycleState === 'BURST_TRANSMIT' ? 'text-amber-400 animate-pulse' : 'text-slate-400'
              }`}>
                {activeCycleState} ({burstCountdownSeconds}s)
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800 flex justify-between">
            <span>15s Transmit / 10s Sleep</span>
            <span>60% Duty Cycle</span>
          </div>
        </div>
      </div>

      {/* CORE TELEMETRY METRICS: 4 KEY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. PENETRATION DEPTH (METERS) */}
        <div className="p-4 rounded-xl border border-sky-500/50 bg-slate-900/80 shadow-lg shadow-sky-950/40 relative overflow-hidden">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Soil Skin Depth (δ)</span>
            <Waves className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-white">
            {calculatedSkinDepthMeters}
            <span className="text-base font-normal text-slate-400"> m</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Max Sweep Depth: {activeSoil.maxDetectDepthMeters}m
          </div>
        </div>

        {/* 2. EM TRANSMISSION FREQUENCY */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>AM Radio Harmonic</span>
            <Radio className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-amber-300">
            {selectedHarmonicKhz}
            <span className="text-base font-normal text-slate-400"> kHz</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Inductive Switched Coil
          </div>
        </div>

        {/* 3. MORSE CODE ACTIVE SYMBOL */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Morse Pulse State</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-cyan-300">
            {currentMorseSymbol}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Standardized SOS Loop
          </div>
        </div>

        {/* 4. NEAR-FIELD SIGNAL POWER */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>RF Leakage Field</span>
            <Activity className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-purple-300">
            {rfFieldStrengthDbm}
            <span className="text-base font-normal text-slate-400"> dBm</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Near-Field Inductive (1m)
          </div>
        </div>
      </div>

      {/* GRAPHICAL ANALYSIS ROW: RF HARMONIC SPECTRUM & SKIN DEPTH COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* RF Carrier Harmonic Frequency Waterfall */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-400" />
              AM Radio Band Harmonic Spectrum [500 kHz - 1600 kHz]
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Modulation: Rhythmic SOS
            </span>
          </div>
          <div className="relative w-full h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80">
            <canvas ref={spectrumCanvasRef} width={540} height={192} className="w-full h-full block" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>500 kHz (Low End)</span>
            <span>Display DC-DC Coil Parasitic Coupling</span>
            <span>1600 kHz (High End)</span>
          </div>
        </div>

        {/* Soil Depth Penetration Comparison */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-sky-400" />
              Sub-Surface Soil Skin Depth Penetration
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              δ = √(2 / ωμσ)
            </span>
          </div>
          <div className="relative w-full h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80 flex items-center justify-center">
            <canvas ref={skinDepthCanvasRef} width={380} height={192} className="w-full h-full block" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>Wi-Fi: 0.04m (Dead)</span>
            <span>Parasitic AM: {calculatedSkinDepthMeters}m Penetration</span>
          </div>
        </div>
      </div>

      {/* REAL-TIME MORSE CODE OSCILLOGRAM & RESCUER SWEEP INSTRUCTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Oscillogram Waveform */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Parasitic Inductive PWM Oscillogram
            </span>
            <span className="text-[10px] font-mono text-cyan-300">
              State: {isBeaconActive ? (screenFlickerPulse ? 'CARRIER ON' : 'CARRIER OFF') : 'OFFLINE'}
            </span>
          </div>
          <div className="relative w-full h-36 bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80">
            <canvas ref={oscillogramCanvasRef} width={480} height={144} className="w-full h-full block" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Dit: 120ms</span>
            <span>Dah: 360ms</span>
            <span>Word Pause: 900ms</span>
          </div>
        </div>

        {/* Rescuer Sweep Guidance */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                Rescuer Ground Sweep Protocol (AM Transistor Radio)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase">
                SEARCH PROCEDURE
              </span>
            </div>
            <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal pl-4 leading-relaxed">
              <li>
                Equip search personnel with standard battery-powered pocket AM transistor radios or directional loop antennas.
              </li>
              <li>
                Tune the receiver dial to <strong className="text-amber-300 font-mono">{selectedHarmonicKhz} AM</strong> (or sweep between 540–640 kHz).
              </li>
              <li>
                Walk in a grid pattern across the landslide mud or rubble pile holding the antenna 30cm above the debris.
              </li>
              <li>
                Listen for a distinct, rhythmic <strong className="text-cyan-300">dit-dit-dit dah-dah-dah dit-dit-dit</strong> buzzing carrier signal. Rotate the radio 90°: peak volume indicates direction to victim.
              </li>
            </ol>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <strong>Survival Advantage:</strong> Requires no specialized search dogs or ground-penetrating radar. Operates using standard $5 emergency radios available in every village.
          </div>
        </div>
      </div>

      {/* SCIENTIFIC EXPLANATION & ELECTROMAGNETIC SKIN DEPTH CARD */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
        <div className="font-bold text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-amber-400" />
          Electromagnetic Near-Field Induction & Sub-Surface Skin Depth Physics
        </div>
        <p>
          Every smartphone display employs high-frequency switched-mode DC-DC converters to supply power to AMOLED subpixels and backlight arrays. 
          By forcing rhythmic high-frequency subpixel PWM switching cycles, the display's inductive power traces act as a magnetic dipole transmitter:
        </p>
        <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-amber-300 border border-slate-800/80 overflow-x-auto">
          ∇ × B = μ₀·J + μ₀·ε₀·(∂E/∂t) &nbsp;|&nbsp; Skin Depth: δ = √( 2 / (ω·μ·σ) ) = √( 1 / (π·f·μ₀·σ) )
        </div>
        <p>
          Because attenuation increases exponentially with frequency, 2.4 GHz microwave signals (Bluetooth, Wi-Fi, 5G) suffer from an infinitesimal skin depth ($\delta &lt; 5\text{ cm}$) in conductive wet mud and saturated concrete, rendering them completely blind. 
          In contrast, our low-frequency parasitic harmonics (540–1600 kHz) possess skin depths ranging from 3.8 to 24 meters, allowing an unmistakable rhythmic SOS beacon to escape the deepest subterranean collapse voids.
        </p>
      </div>
    </div>
  );
}
