import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Radio, Activity, Mountain, ShieldAlert, 
  Send, RefreshCw, Play, Square, CheckCircle, AlertTriangle, 
  MapPin, Heart, Zap, Download, Eye, Compass, 
  Layers, ChevronRight, Cpu, ArrowUpRight, Clock, Info, 
  Sparkles, Sliders, ExternalLink, Award, FileText,
  Wifi, ShieldCheck, Bluetooth, QrCode, BatteryCharging,
  Waves, Lock, Network, Atom, Magnet, Thermometer, Droplet,
  Bell, User, Car, ArrowRight, X, ChevronDown, Check, Share2, Search,
  SlidersHorizontal, Radar, Smartphone, Satellite
} from 'lucide-react';

export default function WorldFirstDeckOverview({ onSwitchToLab, onSelectTab }) {
  // Navigation & View states
  const [heroSlide, setHeroSlide] = useState(0); // 0, 1, 2
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isCapabilityModalOpen, setIsCapabilityModalOpen] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState('ner-monitor');
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isTechStackModalOpen, setIsTechStackModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0); // 0 to 5
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [sarCoherence, setSarCoherence] = useState(0.92);
  const [currentClock, setCurrentClock] = useState('21:42');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Capability sub-states
  const [chirpFreqMode, setChirpFreqMode] = useState('ultrasonic');
  const [isChirping, setIsChirping] = useState(false);
  const [chirpSentLogs, setChirpSentLogs] = useState([
    { id: 'PKT-9421', time: '1 min ago', mode: '19.2 kHz (Near-Ultrasonic)', hops: '3 Nodes', status: 'RELAYED_TO_BASE_CAMP' }
  ]);
  const [quantumTarget, setQuantumTarget] = useState('Sector 4 Siang Valley');
  const [quantumEfficiency, setQuantumEfficiency] = useState(94.6);
  const [csiVitalRate, setCsiVitalRate] = useState(0.24); // 0.24 Hz = ~14.4 breaths/min
  const [isOptimizingQuantum, setIsOptimizingQuantum] = useState(false);

  const audioContextRef = useRef(null);

  const liveMetrics = {
    villagesAffected: 4,
    peopleExposed: 387,
    roadsBlocked: 2,
    evacuated: 387,
    etaMinutes: 6
  };

  // Clock timer
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setCurrentClock(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const timer = setInterval(updateClock, 5000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio chime helper
  const playSynthesizedTone = (freq = 880, duration = 0.25) => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration + 0.05);
      }
    } catch (e) {
      console.warn("Audio synth warning:", e);
    }
  };

  // Run multi-phase disaster simulation
  const handleStartSimulation = () => {
    if (isSimulationActive) return;
    setIsSimulationActive(true);
    setSimulationStep(0);
    setSimulationProgress(0);
    playSynthesizedTone(940, 0.4);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setSimulationProgress(Math.min(progress, 100));
      const stepIdx = Math.min(Math.floor((progress / 100) * 6), 5);
      setSimulationStep(stepIdx);

      if (progress % 20 === 0) {
        playSynthesizedTone(600 + progress * 5, 0.15);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsSimulationActive(false), 2500);
      }
    }, 180);
  };

  // Transmit acoustic chirp over sound waves
  const handleTriggerChirp = () => {
    if (isChirping) return;
    setIsChirping(true);
    const freq = chirpFreqMode === 'audible' ? 2400 : 19200;
    playSynthesizedTone(freq, 0.8);

    setTimeout(() => {
      setIsChirping(false);
      setChirpSentLogs(prev => [
        {
          id: `PKT-${Math.floor(1000 + Math.random() * 9000)}`,
          time: 'Just now',
          mode: chirpFreqMode === 'audible' ? '2.4 kHz (Audible FSK)' : '19.2 kHz (Near-Ultrasonic)',
          hops: '4 Repeater Nodes',
          status: 'RELAYED_TO_BASE_CAMP'
        },
        ...prev.slice(0, 4)
      ]);
    }, 1100);
  };

  // Quantum optimization trigger
  const handleQuantumOptimize = () => {
    setIsOptimizingQuantum(true);
    playSynthesizedTone(1080, 0.3);
    setTimeout(() => {
      setQuantumEfficiency(Number((92 + Math.random() * 6.5).toFixed(1)));
      setIsOptimizingQuantum(false);
    }, 800);
  };

  // Key Capabilities dataset with tags & categories
  const capabilities = [
    {
      id: 'ner-monitor',
      title: 'NER Landslide Monitor',
      category: 'early-warning',
      desc: 'Real-time slope acoustic micro-fracturing (20-300 kHz) & IoT incline telemetry.',
      icon: Mountain,
      status: 'LIVE',
      statusColor: 'emerald',
      metrics: '4 Pass Corridors Active'
    },
    {
      id: 'ai-risk',
      title: 'AI Geotechnical Risk',
      category: 'early-warning',
      desc: 'Edge-AI automated Landslide Susceptibility Index (LSI) & pore-pressure forecast.',
      icon: Cpu,
      status: 'AUTONOMOUS',
      statusColor: 'cyan',
      metrics: 'LSI 0.94 Critical Zone'
    },
    {
      id: 'emergency-sos',
      title: 'Decentralized SOS',
      category: 'search-rescue',
      desc: 'Single-tap distress beacon with GPS coordinate burst & nearest responder routing.',
      icon: ShieldAlert,
      status: 'EMERGENCY',
      statusColor: 'rose',
      metrics: 'Instant Mesh Broadcast'
    },
    {
      id: 'smart-sensors',
      title: 'Multi-Sensory IoT Sensors',
      category: 'early-warning',
      desc: 'Barometric flash-flood barometers, acoustic ground taps, and soil moisture probes.',
      icon: Wifi,
      status: 'LIVE',
      statusColor: 'emerald',
      metrics: '116 Active Field Probes'
    },
    {
      id: 'digital-twin',
      title: 'AI 3D Digital Twin',
      category: 'quantum-ai',
      desc: 'High-fidelity physics simulator for debris flow kinematics and structural failure.',
      icon: Layers,
      status: 'SIMULATOR',
      statusColor: 'amber',
      metrics: '60 FPS WebGL Engine'
    },
    {
      id: 'zero-internet',
      title: 'Zero-Internet Acoustic Mesh',
      category: 'resilient-mesh',
      desc: 'Offline sound-wave data transmission + parasitic RF backscatter across phones.',
      icon: Radio,
      status: 'ZERO-GRID',
      statusColor: 'purple',
      metrics: 'Air-Gapped P2P Mesh'
    },
    {
      id: 'drone-analytics',
      title: 'Drone Swarm Analytics',
      category: 'search-rescue',
      desc: 'Autonomous thermal camera feeds, survivor triage bounding, and 3D rubble mapping.',
      icon: Compass,
      status: 'LIVE',
      statusColor: 'emerald',
      metrics: '4 Swarm Drones Airborne'
    },
    {
      id: 'quantum-optimization',
      title: 'Quantum-Inspired Routing',
      category: 'quantum-ai',
      desc: 'Polynomial annealing evacuation routing and ML-KEM post-quantum encrypted logs.',
      icon: Atom,
      status: 'QUANTUM',
      statusColor: 'purple',
      metrics: '94.6% Flow Efficiency'
    },
    {
      id: 'rf-csi',
      title: 'Wi-Fi CSI Survivor Radar',
      category: 'search-rescue',
      desc: 'Through-rubble human breath & heartbeat detection via multipath RF Doppler shifts.',
      icon: Radar,
      status: 'PROTOTYPE',
      statusColor: 'cyan',
      metrics: '0.24 Hz Respiration Lock'
    }
  ];

  const filteredCapabilities = activeCategoryFilter === 'all'
    ? capabilities
    : capabilities.filter(c => c.category === activeCategoryFilter);

  return (
    <div className="w-full space-y-5 deeptech-grid-pattern pb-8">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 1. TACTICAL COMMAND BAR & TELEMETRY STATUS ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-slate-950/80 border border-cyan-500/25 rounded-2xl p-2.5 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs relative z-10">
          {/* Active Emergency Status Pill */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-rose-950/90 via-rose-900/60 to-rose-950/90 border border-rose-500/60 px-3.5 py-1.5 rounded-full text-rose-200 font-bold shadow-lg shadow-rose-950/50">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="tracking-wide">CRISIS ACTIVE</span>
            <span className="text-rose-400 font-mono text-[11px] font-black border-l border-rose-500/40 pl-2">
              NH-10 LANDSLIDE
            </span>
          </div>

          {/* Satellite Telemetry Sync */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-slate-300 font-mono text-[11px]">
            <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>InSAR Sentinel-1:</span>
            <span className="text-cyan-400 font-bold font-mono">0.92 Coherence</span>
          </div>

          {/* Mesh Network Health */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-slate-300 font-mono text-[11px]">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>P2P LoRa Mesh:</span>
            <span className="text-emerald-400 font-bold">114/116 Active</span>
          </div>
        </div>

        {/* Right Tools & Clock */}
        <div className="flex items-center gap-2.5 text-xs relative z-10">
          {/* Audio Synthesizer Tone Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 px-2.5 ${
              audioEnabled 
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-sm' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={audioEnabled ? "Tactical Audio On" : "Audio Muted"}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-bold font-mono">{audioEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          {/* Digital Chronometer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-white tracking-wider">{currentClock}</span>
            <span className="text-[10px] text-slate-500">IST</span>
          </div>

          {/* Active Alerts Bell */}
          <button 
            onClick={() => setIsIncidentModalOpen(true)}
            className="p-2 bg-rose-950/40 border border-rose-500/40 hover:border-rose-400 rounded-lg text-rose-300 relative transition-all cursor-pointer shadow-md"
            title="Active Incidents"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 2. MODE SWITCHER: OVERVIEW DECK vs 22 LAB PROTOCOLS ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 border border-slate-800/80 p-2 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-950/60 border border-cyan-400/40">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Autonomous Command Overview Deck</span>
          </div>

          <button
            onClick={onSwitchToLab}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:animate-spin" />
            <span>Deep-Tech Innovations Lab (22 Protocols)</span>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-mono font-black rounded-full border border-amber-500/30">
              22 NOVEL
            </span>
          </button>
        </div>

        <button
          onClick={onSwitchToLab}
          className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer px-3 py-1.5"
        >
          <span>Open Full Hardware Simulators</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 3. MAIN GRID (8 COLS LEFT, 4 COLS RIGHT) ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ── LEFT MAIN SECTION (8 COLS) ── */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 3.1 HERO COMMAND DECK & 360° SAR RADAR SCANNER */}
          <div className="deeptech-hero-card p-5 sm:p-7 relative">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Details & Interactive Triggers */}
              <div className="md:col-span-7 space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-cyan-950/80 border border-cyan-400/50 rounded-full text-cyan-300 text-[11px] font-black tracking-wider uppercase shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>
                    {heroSlide === 0 ? 'Autonomous Disaster Defense Architecture' : heroSlide === 1 ? 'Subatomic Cosmic Muon Tomography' : 'Zero-Grid Decentralized Survivability'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white leading-tight tracking-tight drop-shadow-md">
                  {heroSlide === 0 ? 'Deep-Tech Autonomous Disaster Suite' : heroSlide === 1 ? 'Subatomic Cosmic Muon Tomography' : 'Zero-Grid Decentralized Survivability'}
                </h1>

                <p className="text-cyan-400 font-bold text-xs sm:text-sm">
                  {heroSlide === 0 
                    ? 'AI-Driven · Sensor-Powered · Edge-First · Zero-Cloud Dependent' 
                    : heroSlide === 1 
                    ? 'Through-Rubble Human Void Tomography · Zero Optical Camera' 
                    : 'Acoustic Sound FSK Packets · Ambient Parasitic RF Backscatter'}
                </p>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                  {heroSlide === 0 
                    ? 'Unified military-grade disaster lifecycle platform — predicting slope fractures, deploying dynamic anti-herd evacuation, and orchestrating survivor rescue across blacked-out corridors.' 
                    : heroSlide === 1 
                    ? 'Measures naturally occurring cosmic ray muon flux absorption to detect breathing survivors trapped beneath 30 meters of collapsed earth and debris.' 
                    : 'Continuous self-healing mesh protocol operating without cellular signals, Internet gateways, or satellites using phone speakers, microphones, and screens.'}
                </p>

                {/* 3 Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsMapModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg shadow-cyan-900/40 transition-all cursor-pointer border border-cyan-400/30"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>View Live SAR Radar Map</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCapability('ner-monitor');
                      setIsCapabilityModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-200 border border-slate-700/80 hover:border-cyan-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Inspect 9 Deep-Tech Tools</span>
                  </button>

                  <button
                    onClick={handleStartSimulation}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer border border-emerald-400/40"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isSimulationActive ? `Simulating Stage ${simulationStep + 1}/6...` : 'Run 6-Stage Autonomous Demo'}</span>
                  </button>
                </div>

                {/* Slide Switcher Dots */}
                <div className="flex items-center gap-2 pt-2">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroSlide(idx)}
                      className={`transition-all rounded-full cursor-pointer ${
                        heroSlide === idx
                          ? 'w-7 h-2 bg-cyan-400 shadow-md shadow-cyan-400/50'
                          : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      title={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right: High-Tech Animated SAR Radar Display */}
              <div className="md:col-span-5 relative h-60 sm:h-72 rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-2xl group">
                <img
                  src="/images/mountain_corridor.jpg"
                  alt="Mountain Valley Highway Corridor"
                  className="w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent pointer-events-none" />

                {/* Cybernetic HUD Frame & Bearing Degrees */}
                <div className="absolute top-2 left-3 text-[10px] font-mono text-cyan-400/80 font-bold">
                  GRID: 28.0642° N · 95.3318° E
                </div>
                <div className="absolute top-2 right-3 text-[10px] font-mono text-emerald-400/80 font-bold">
                  RADAR: 360° IN-AIR
                </div>

                {/* Concentric Radar Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-cyan-400/20 pointer-events-none flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full border border-cyan-400/30 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-dashed border-cyan-400/40 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/80" />
                    </div>
                  </div>
                </div>

                {/* Rotating Conic Radar Sweep Beam */}
                <div 
                  className="absolute inset-0 rounded-full pointer-events-none animate-radar-sweep"
                  style={{
                    background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.45) 0deg, rgba(6, 182, 212, 0) 65deg)'
                  }}
                />

                {/* Critical Hazard Blip with Sonar Ping */}
                <div className="absolute top-1/3 right-8 z-10">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping" />
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/90 border border-rose-500 rounded-lg text-rose-200 text-[10px] font-bold shadow-xl shadow-rose-950/80 backdrop-blur-md">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <div>
                        <div>Landslide Danger</div>
                        <div className="text-[8px] text-rose-400 font-mono">SECTOR A · CRITICAL</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evacuation Safe Corridor Tag */}
                <div className="absolute bottom-16 left-6 z-10">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/90 border border-emerald-500/70 rounded-lg text-emerald-200 text-[10px] font-bold shadow-md backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Safe Corridor B</span>
                  </div>
                </div>

                {/* Rescue Vehicle Tracker */}
                <div className="absolute bottom-3 right-6 z-10">
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-950/90 border border-blue-500/70 rounded-lg text-blue-200 text-[10px] font-bold shadow-md backdrop-blur-md">
                    <Car className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <div>SDRF Fleet Unit #4</div>
                      <div className="text-[8px] text-blue-300/80 font-mono">2.4 km · ETA 06m</div>
                    </div>
                  </div>
                </div>

                {/* Expand Overlay Button */}
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className="absolute inset-0 z-20 flex items-center justify-center opacity-0 hover:opacity-100 bg-slate-950/75 backdrop-blur-xs transition-opacity text-white text-xs font-black gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Launch Full Tactical Radar</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3.2 6-STAGE AUTONOMOUS WORKFLOW SIMULATOR */}
          <div className="deeptech-hud-card p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <RefreshCw className={`w-4 h-4 ${isSimulationActive ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">Autonomous Crisis Execution Flow</h2>
                  <span className="text-[11px] text-slate-400">Integrated zero-human-bottleneck lifecycle</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isSimulationActive && (
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold rounded-full animate-pulse border border-cyan-500/40">
                    Stage {simulationStep + 1}/6 Active ({simulationProgress}%)
                  </span>
                )}
                <button
                  onClick={handleStartSimulation}
                  disabled={isSimulationActive}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isSimulationActive ? 'Running...' : 'Run Simulation'}</span>
                </button>
              </div>
            </div>

            {/* Glowing Pipeline Progress Track */}
            <div className="w-full bg-slate-900/90 h-2.5 rounded-full overflow-hidden mb-4 border border-slate-800 relative">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300 shadow-md shadow-cyan-400/50"
                style={{ width: `${simulationProgress}%` }}
              />
            </div>

            {/* 6 Interactive Step Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { step: 1, title: '1. Detect', desc: 'IoT Sensors & InSAR', icon: Wifi },
                { step: 2, title: '2. Predict', desc: 'Edge AI LSI Index', icon: Cpu },
                { step: 3, title: '3. Alert', desc: 'Multi-Sensory P2P', icon: Bell },
                { step: 4, title: '4. Evacuate', desc: 'Dynamic Anti-Herd', icon: MapPin },
                { step: 5, title: '5. Rescue', desc: 'Drones & SDRF Fleet', icon: Car },
                { step: 6, title: '6. Recover', desc: 'Blockchain Ledger', icon: ShieldCheck }
              ].map((st, idx) => {
                const IconC = st.icon;
                const isActive = simulationStep === idx;
                const isPassed = simulationStep > idx;

                return (
                  <div
                    key={st.step}
                    onClick={() => {
                      setSimulationStep(idx);
                      playSynthesizedTone(700 + idx * 85, 0.15);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-xl shadow-cyan-950/60 ring-2 ring-cyan-400/60'
                        : isPassed
                        ? 'bg-slate-950/90 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center border ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <IconC className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white leading-tight">{st.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-tight">{st.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3.3 LIVE HARDWARE TELEMETRY & SENSOR SIMULATION DECK */}
          <div className="deeptech-hud-card p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-black text-white tracking-tight">Live Hardware Telemetry & Sensor Labs</h2>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 font-bold">
                ON-DEVICE WASM ENGINES
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hardware 1: Ultrasonic & Audio Chirp Transmitter */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      <span>Acoustic Chirp Modem</span>
                    </span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-mono rounded font-bold">
                      ZERO-GRID
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Transmits emergency data packets through audio pulses between phones.
                  </p>

                  {/* Frequency Switcher */}
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 my-2.5">
                    <button
                      onClick={() => setChirpFreqMode('audible')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded cursor-pointer ${
                        chirpFreqMode === 'audible' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      2.4 kHz Audible
                    </button>
                    <button
                      onClick={() => setChirpFreqMode('ultrasonic')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded cursor-pointer ${
                        chirpFreqMode === 'ultrasonic' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      19.2 kHz Ultrasonic
                    </button>
                  </div>

                  {/* Equalizer Waveform Animation */}
                  <div className="flex items-end justify-center gap-1 h-8 bg-slate-900/90 rounded-lg p-1.5 border border-slate-800">
                    {[12, 24, 8, 16, 28, 10, 22, 14, 26, 6, 18, 20].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-cyan-400 rounded-full transition-all"
                        style={{
                          height: isChirping ? `${h}px` : '6px',
                          transitionDuration: '0.2s',
                          animation: isChirping ? `equalizer-dance ${0.4 + (i % 4) * 0.1}s infinite ease-in-out` : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleTriggerChirp}
                  disabled={isChirping}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isChirping ? 'Transmitting Audio Wave...' : 'Transmit Acoustic Burst'}</span>
                </button>
              </div>

              {/* Hardware 2: Wi-Fi CSI Survivor Vital Respiration Monitor */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
                      <span>CSI Survivor Doppler</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded font-bold">
                      1 LOCATED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Detects chest micro-movements of buried survivors via RF multipath distortion.
                  </p>

                  {/* Real-time Respiration Waveform Visualizer */}
                  <div className="my-2.5 bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex flex-col justify-between h-20 relative overflow-hidden">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Respiration Frequency:</span>
                      <span className="text-rose-400 font-bold">14.4 breaths/min</span>
                    </div>

                    {/* Animated SVG Sine Wave */}
                    <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path
                        d="M 0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    </svg>

                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span>Signal: -62 dBm</span>
                      <span className="text-emerald-400 font-bold">Vitals Stable</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCapability('rf-csi');
                    setIsCapabilityModalOpen(true);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Radar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect Doppler CSI Console</span>
                </button>
              </div>

              {/* Hardware 3: Quantum-Gossip Mesh Optimizer */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Atom className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>Quantum Mesh Router</span>
                    </span>
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-mono rounded font-bold">
                      ANNEALING
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Calculates congestion-free evacuation flow and post-quantum encrypted packets.
                  </p>

                  <div className="my-2.5 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Flow Efficiency:</span>
                      <span className="text-emerald-400 font-bold font-mono text-xs">{quantumEfficiency}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${quantumEfficiency}%` }} 
                      />
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                      <span>Latency: 8.4ms</span>
                      <span>Hops: 3 Nodes</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleQuantumOptimize}
                  disabled={isOptimizingQuantum}
                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isOptimizingQuantum ? 'animate-spin' : ''}`} />
                  <span>{isOptimizingQuantum ? 'Optimizing...' : 'Recalculate Mesh Routes'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3.4 KEY CAPABILITIES MATRIX (WITH CATEGORY FILTERS) */}
          <div className="deeptech-hud-card p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">Key Autonomous Capabilities</h2>
                  <span className="text-[11px] text-slate-400">Pioneering zero-infrastructure disaster modules</span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'all', label: 'All (9)' },
                  { id: 'early-warning', label: 'Early Warning' },
                  { id: 'resilient-mesh', label: 'Zero-Grid Comms' },
                  { id: 'search-rescue', label: 'SAR & Vitals' },
                  { id: 'quantum-ai', label: 'Quantum & AI' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveCategoryFilter(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeCategoryFilter === f.id
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3x3 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCapabilities.map((cap) => {
                const IconComp = cap.icon;
                return (
                  <div
                    key={cap.id}
                    onClick={() => {
                      setSelectedCapability(cap.id);
                      setIsCapabilityModalOpen(true);
                      playSynthesizedTone(800, 0.15);
                    }}
                    className="bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/50 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-xl hover:shadow-cyan-950/40 hover:-translate-y-1 relative"
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${
                        cap.statusColor === 'rose'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : cap.statusColor === 'emerald'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : cap.statusColor === 'cyan'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : cap.statusColor === 'purple'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {cap.status}
                      </span>
                    </div>

                    <h3 className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {cap.desc}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="text-cyan-400/80 font-bold">{cap.metrics}</span>
                      <span className="text-slate-400 group-hover:text-white flex items-center gap-0.5 font-sans font-bold">
                        Inspect →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT RAIL COLUMN (4 COLS) ── */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* 1. ACTIVE EMERGENCY CARD */}
          <div className="deeptech-hud-card p-5 shadow-2xl relative overflow-hidden border-rose-500/40">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                <h2 className="text-base font-black text-white tracking-tight">Active Emergency Incident</h2>
              </div>
              <span className="px-2 py-0.5 bg-rose-500 text-slate-950 font-black text-[10px] rounded uppercase">
                DEFCON 1
              </span>
            </div>

            {/* Crimson Incident Card */}
            <div className="bg-gradient-to-br from-rose-950/80 via-slate-950 to-slate-900 border border-rose-500/60 rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Landslide Rupture - NH-10</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>km 34.2 Siang Valley Highway</span>
                  </p>
                </div>
              </div>

              {/* 3 Metrics Box */}
              <div className="grid grid-cols-3 gap-2 my-3.5 pt-3 border-t border-rose-500/20 text-center">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <div className="text-base font-black text-rose-400">{liveMetrics.peopleExposed}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Exposed</div>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <div className="text-base font-black text-amber-400">{liveMetrics.villagesAffected}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Villages</div>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <div className="text-base font-black text-orange-400">{liveMetrics.roadsBlocked}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Blocked</div>
                </div>
              </div>

              {/* ETA Bar */}
              <div className="flex items-center justify-between text-xs px-3 py-2 bg-rose-950/50 rounded-lg border border-rose-500/40 mb-3 font-mono">
                <span className="text-slate-300">Rescue Unit ETA:</span>
                <span className="font-bold text-rose-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>06 min (SDRF)</span>
                </span>
              </div>

              <button
                onClick={() => setIsIncidentModalOpen(true)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Incident Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. RECENT DISASTER ALERTS */}
          <div className="deeptech-hud-card p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-black text-white tracking-tight">Recent Threat Feed</h2>
              </div>
              <button
                onClick={() => setIsIncidentModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2">
              {[
                { id: 'ALT-01', title: 'Landslide Risk - NH-10', severity: 'Critical', time: '21:42', dot: 'bg-rose-500', text: 'text-rose-400' },
                { id: 'ALT-02', title: 'Heavy Infiltration Monsoon', severity: 'High', time: '20:17', dot: 'bg-orange-500', text: 'text-orange-400' },
                { id: 'ALT-03', title: 'Slope Creep Slip - Zone B', severity: 'Medium', time: '19:32', dot: 'bg-amber-500', text: 'text-amber-400' },
                { id: 'ALT-04', title: 'River Surge - Sector 4', severity: 'Medium', time: '18:45', dot: 'bg-amber-500', text: 'text-amber-400' },
                { id: 'ALT-05', title: 'Atmospheric Bending Update', severity: 'Info', time: '16:20', dot: 'bg-blue-500', text: 'text-blue-400' }
              ].map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => setSelectedAlert(alt)}
                  className="p-2.5 bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${alt.dot} mt-1.5 flex-shrink-0 animate-pulse`} />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{alt.title}</div>
                      <div className={`text-[10px] font-mono font-bold ${alt.text}`}>{alt.severity}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{alt.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. SYSTEM HEALTH & EDGE NETWORK DIAGNOSTICS */}
          <div className="deeptech-hud-card p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Edge System Health</h3>
              </div>
              <button 
                onClick={() => setIsHealthModalOpen(true)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
              >
                Diagnostics →
              </button>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Gateway WebSocket API', status: 'Online', val: '14ms', color: 'text-emerald-400' },
                { name: 'P2P LoRa Mesh Stack', status: '114/116 Active', val: '99.8%', color: 'text-emerald-400' },
                { name: 'Sentinel-1 SAR Feed', status: 'Orbit Sync', val: '0.92 InSAR', color: 'text-cyan-400' },
                { name: 'Subatomic Muon Sensor', status: 'Calibrated', val: '28 CPM', color: 'text-emerald-400' }
              ].map((srv) => (
                <div key={srv.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-950/60 border border-slate-900">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{srv.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[10px] text-slate-500">{srv.val}</span>
                    <span className={`text-[11px] font-bold ${srv.color}`}>{srv.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>99.98% Autonomous Uptime</span>
              <span className="text-cyan-400 font-bold">Zero Cloud Lock-in</span>
            </div>
          </div>

          {/* 4. TECH ARCHITECTURE CHIP */}
          <div className="deeptech-hud-card p-4 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">Full Deep-Tech Architecture</div>
                <div className="text-[10px] text-slate-400 font-mono">React 18 · WASM · ML-KEM · P2P</div>
              </div>
            </div>
            <button
              onClick={() => setIsTechStackModalOpen(true)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-bold rounded-lg border border-slate-700 cursor-pointer"
            >
              View →
            </button>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MODALS (SAR RADAR, CAPABILITIES, INCIDENT, STACK, HEALTH) ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* 1. LIVE SAR RADAR & SATELLITE MAP MODAL */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-cyan-500/50 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                  <Radar className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Live Synthetic Aperture Radar (SAR) Telemetry</h3>
                  <p className="text-xs text-slate-400">Sentinel-1 InSAR Interferometry & Coherence Ground Slip Scanner</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 min-h-[320px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              <img src="/images/mountain_corridor.jpg" alt="Aerial SAR Overlay" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-cyan-950/30" />

              {/* Concentric radar rings */}
              <div className="absolute w-80 h-80 rounded-full border border-cyan-400/30 pointer-events-none" />
              <div className="absolute w-52 h-52 rounded-full border border-cyan-400/40 pointer-events-none" />
              <div className="absolute w-28 h-28 rounded-full border border-cyan-400/60 pointer-events-none" />
              <div 
                className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.45) 0deg, rgba(6, 182, 212, 0) 90deg)'
                }}
              />

              {/* Pins */}
              <div className="absolute top-1/3 left-1/3 p-2 bg-rose-950/90 border border-rose-500 rounded-lg text-rose-200 text-xs font-mono font-bold z-10 shadow-lg">
                ⚠️ Slump Zone A: 28.0642° N, 95.3318° E
              </div>
              <div className="absolute bottom-1/4 right-1/3 p-2 bg-emerald-950/90 border border-emerald-500 rounded-lg text-emerald-200 text-xs font-mono font-bold z-10 shadow-lg">
                🟢 Evacuation Corridor: Siang Bridge West
              </div>
            </div>

            {/* InSAR Controls */}
            <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">InSAR Coherence Filter (γ): {sarCoherence}</span>
                <input 
                  type="range" min="0.5" max="0.99" step="0.01" 
                  value={sarCoherence} 
                  onChange={(e) => setSarCoherence(parseFloat(e.target.value))}
                  className="w-48 accent-cyan-400 block cursor-pointer"
                />
              </div>
              <div>
                <span className="text-slate-400 block">Ground Displacement Velocity:</span>
                <span className="text-rose-400 font-mono font-bold text-sm">-14.2 mm/hr (High Deformation)</span>
              </div>
              <button
                onClick={() => {
                  playSynthesizedTone(1200, 0.3);
                  alert("SAR Phase interferogram refreshed from ESA Copernicus Hub.");
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all cursor-pointer"
              >
                Sync ESA Copernicus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CAPABILITY INSPECTOR MODAL */}
      {isCapabilityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white capitalize">
                  {selectedCapability.replace('-', ' ')} Deep-Dive Console
                </h3>
              </div>
              <button 
                onClick={() => setIsCapabilityModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Capability Tab 1: NER Monitor & AI Risk */}
            {(selectedCapability === 'ner-monitor' || selectedCapability === 'ai-risk') && (
              <div className="space-y-4">
                <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">Geotechnical LSI Predictor</h4>
                  <p className="text-xs text-slate-300">
                    Calculates real-time Landslide Susceptibility Index based on rainfall intensity, slope degree, and pore-water pressure.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Rainfall (24h)</div>
                    <div className="text-lg font-bold text-white mt-1">112 mm</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Soil Saturation</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">92.4%</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Predicted LSI</div>
                    <div className="text-lg font-bold text-rose-400 mt-1">0.94 (Critical)</div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setIsCapabilityModalOpen(false);
                      onSelectTab('mudslide');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Open Full Mudslide Fluidics Lab →
                  </button>
                </div>
              </div>
            )}

            {/* Capability Tab 2: Zero-Internet Mode & Ultrasonic Chirp */}
            {selectedCapability === 'zero-internet' && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">Acoustic Sound-Wave Mesh Relay</h4>
                  <p className="text-xs text-slate-300">
                    Transmits distress packets and encrypted GPS coordinates across devices using audio chirps without Internet, cellular towers, or satellite link.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Frequency Profile:</span>
                  <button
                    onClick={() => setChirpFreqMode('audible')}
                    className={`px-3 py-1 text-xs rounded-lg font-bold ${chirpFreqMode === 'audible' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                  >
                    Audible (2.4 kHz)
                  </button>
                  <button
                    onClick={() => setChirpFreqMode('ultrasonic')}
                    className={`px-3 py-1 text-xs rounded-lg font-bold ${chirpFreqMode === 'ultrasonic' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                  >
                    Silent Ultrasonic (19.2 kHz)
                  </button>
                </div>

                <button
                  onClick={handleTriggerChirp}
                  disabled={isChirping}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isChirping ? 'Broadcasting Acoustic Tone Packet...' : 'Broadcast Emergency Audio Chirp'}</span>
                </button>

                {chirpSentLogs.length > 0 && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-[11px] font-mono text-slate-400">Transmission History:</div>
                    {chirpSentLogs.map(l => (
                      <div key={l.id} className="flex items-center justify-between text-xs text-slate-300 font-mono border-b border-slate-900 pb-1">
                        <span>{l.id} ({l.mode})</span>
                        <span className="text-emerald-400">{l.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Capability Tab 3: Quantum Optimization */}
            {selectedCapability === 'quantum-optimization' && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">Quantum-Inspired Annealing Router</h4>
                  <p className="text-xs text-slate-300">
                    Solves multi-vehicle evacuation and bottleneck reduction in polynomial time across rugged Himalayan routes.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Corridor Clearance Efficiency:</span>
                    <span className="text-emerald-400 font-bold font-mono">{quantumEfficiency}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full" style={{ width: `${quantumEfficiency}%` }} />
                  </div>
                </div>
                <button
                  onClick={handleQuantumOptimize}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Recalculate Optimal Quantum Flow Bypass
                </button>
              </div>
            )}

            {/* Capability Tab 4: RF / CSI & Survivor Detection */}
            {selectedCapability === 'rf-csi' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Wi-Fi CSI Doppler Breathing Locator</h4>
                  <p className="text-xs text-slate-300">
                    Analyzes ambient multipath distortion of radio signals to locate breathing human survivors buried beneath concrete or mud without optical cameras.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Target Micro-Movement Frequency:</div>
                    <div className="text-base font-bold text-amber-400 font-mono mt-0.5">{csiVitalRate} Hz (14.4 Breaths/min)</div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-full animate-pulse">
                    Living Human Detected
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setIsCapabilityModalOpen(false);
                      onSelectTab('wifi-bending');
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Open Wi-Fi CSI Bending Lab →
                  </button>
                </div>
              </div>
            )}

            {/* Capability Tab 5: Fallback */}
            {selectedCapability !== 'ner-monitor' && selectedCapability !== 'ai-risk' && selectedCapability !== 'zero-internet' && selectedCapability !== 'quantum-optimization' && selectedCapability !== 'rf-csi' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  This capability connects live telemetry with the deep-tech algorithms operating directly on-device.
                </p>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Node Status:</span>
                    <span className="text-emerald-400 font-bold">Operational (Zero Cloud Dependency)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Architecture:</span>
                    <span className="text-cyan-400 font-mono">P2P CRDT Ledger</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsCapabilityModalOpen(false);
                    onSwitchToLab();
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Explore All 22 Breakthroughs in Innovations Lab →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ACTIVE INCIDENT MODAL (LANDSLIDE NH-10) */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Incident Command: Landslide NH-10</h3>
              </div>
              <button 
                onClick={() => setIsIncidentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-200 leading-relaxed">
                Severe mud liquefaction detected at NH-10 km 34.2 (Siang Valley Corridor). 4 villages isolated, 387 citizens identified in immediate perimeter. Road clearance unit en route (ETA 06 min).
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Primary Evacuation Destination:</span>
                  <span className="text-white font-bold block mt-1">Pangin East High Ground Camp</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Bypass Clearance Status:</span>
                  <span className="text-amber-400 font-bold block mt-1">Ridge Old Mule Path Activated</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    playSynthesizedTone(1100, 0.3);
                    alert("Emergency Broadcast dispatched to local mesh radios and SMS gateway.");
                    setIsIncidentModalOpen(false);
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Broadcast Evacuation Sirens & Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TECHNOLOGY STACK MODAL */}
      {isTechStackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Autonomous Technology Architecture</h3>
              </div>
              <button 
                onClick={() => setIsTechStackModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-cyan-400 mb-1">Frontend & Client Runtime:</div>
                <p className="text-slate-300">React 19, Vite, Progressive Web App (PWA) with Service Workers, Web Audio API, WebHID, Web Bluetooth, and WebAssembly (WASM).</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-emerald-400 mb-1">Real-Time Telemetry & Mesh:</div>
                <p className="text-slate-300">Socket.IO real-time websockets, BLE Micro-Bursting, Ultrasonic FSK Chirp Modem, ESP32 IoT Nodes.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-purple-400 mb-1">Deep-Tech & Post-Quantum Cryptography:</div>
                <p className="text-slate-300">ML-KEM Kyber-1024, ML-DSA Dilithium-5 signatures, InSAR Sentinel-1 displacement tensors, and Quantum-inspired Simulated Annealing.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SYSTEM HEALTH DIAGNOSTICS MODAL */}
      {isHealthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">System Diagnostics & Telemetry</h3>
              </div>
              <button 
                onClick={() => setIsHealthModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Gateway WebSocket Latency', val: '14 ms', status: 'Optimal' },
                { name: 'Sensor Telemetry Ingestion', val: '1,420 pkts/sec', status: 'Optimal' },
                { name: 'Sentinel-1 Orbit Sync', val: 'UTC 12:45 PASS', status: 'Current' },
                { name: 'Local IndexedDB Offline Cache', val: '42.8 MB (Clean)', status: 'Active' },
                { name: 'Acoustic Audio Pipeline', val: '48.0 kHz 32-bit Float', status: 'Ready' }
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-300">{s.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-400">{s.val}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
