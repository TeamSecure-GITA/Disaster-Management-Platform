import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Radio, Activity, Mountain, ShieldAlert, 
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
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');

  // Capability sub-states
  const [chirpFreqMode, setChirpFreqMode] = useState('ultrasonic');
  const [isChirping, setIsChirping] = useState(false);
  const [chirpSentLogs, setChirpSentLogs] = useState([]);
  const [quantumTarget, setQuantumTarget] = useState('Sector 4 Siang Valley');
  const [quantumEfficiency, setQuantumEfficiency] = useState(94.6);
  const [csiVitalRate, setCsiVitalRate] = useState(0.24); // 0.24 Hz = ~14.4 breaths/min

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
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio chime helper
  const playSynthesizedTone = (freq = 880, duration = 0.25) => {
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
    }, 200);
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
        ...prev
      ]);
    }, 1200);
  };

  return (
    <div className="w-full space-y-5">
      {/* ── TOP ACTIVE EMERGENCY MARQUEE BAR ── */}
      <div className="w-full bg-slate-950/90 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          {/* Active Emergency Pill */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-rose-950/90 via-rose-900/60 to-rose-950/90 border border-rose-500/50 px-3 py-1.5 rounded-full text-rose-200 font-bold shadow-sm shadow-rose-950/50">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="tracking-wide uppercase text-[11px]">Active Emergency</span>
          </div>

          {/* Quick Metrics Chips */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 font-medium">
            <Mountain className="w-3.5 h-3.5 text-rose-400" />
            <span>{liveMetrics.villagesAffected} Villages Affected</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 font-medium">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>{liveMetrics.peopleExposed} People Exposed</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 font-medium">
            <Car className="w-3.5 h-3.5 text-orange-400" />
            <span>{liveMetrics.roadsBlocked} Roads Blocked</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-400 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated ({currentClock})</span>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2.5 text-xs ml-auto">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-full text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Services Operational</span>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg font-bold transition-all cursor-pointer"
            >
              <span>{currentLang}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50">
                {['EN', 'HI', 'BN', 'AS', 'OD', 'MR'].map(l => (
                  <button
                    key={l}
                    onClick={() => { setCurrentLang(l); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${currentLang === l ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    {l} - {l === 'EN' ? 'English' : l === 'HI' ? 'हिन्दी' : l === 'BN' ? 'বাংলা' : l === 'AS' ? 'অসমীয়া' : l === 'OD' ? 'ଓଡ଼ିଆ' : 'मराठी'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button 
            onClick={() => setIsIncidentModalOpen(true)}
            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 relative transition-all cursor-pointer"
            title="Active Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </button>

          {/* Command Center Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden lg:inline text-xs font-bold text-slate-300">Command Center</span>
          </div>
        </div>
      </div>

      {/* ── MODE SWITCHER (OVERVIEW DECK vs 22 PROTOCOLS LAB) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-950/40">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Command Overview Deck</span>
          </div>

          <button
            onClick={onSwitchToLab}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Deep-Tech Innovations Lab (22 Breakthroughs)</span>
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-mono rounded">NOVEL</span>
          </button>
        </div>

        <button
          onClick={onSwitchToLab}
          className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <span>Explore All 22 Innovations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── MAIN GRID LAYOUT (8 COLS LEFT, 4 COLS RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── LEFT MAIN SECTION (8 COLS) ── */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. HERO BANNER CARD */}
          <div className="bg-gradient-to-br from-slate-900/95 via-[#0c1626]/90 to-slate-950/95 border border-slate-800/90 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-2xl">
            {/* Ambient backdrop glow */}
            <div className="absolute top-0 right-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Text & CTAs */}
              <div className="md:col-span-7 space-y-3.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/60 border border-cyan-500/40 rounded-full text-cyan-300 text-[11px] font-bold tracking-wider uppercase">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {heroSlide === 0 ? 'Next-Gen Disaster Response' : heroSlide === 1 ? 'Quantum & Subatomic Sensing' : 'Zero-Grid Resilience Mesh'}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white leading-tight tracking-tight">
                  {heroSlide === 0 ? 'Deep-Tech Autonomous Disaster Suite' : heroSlide === 1 ? 'Subatomic Cosmic Muon Tomography' : 'Zero-Grid Decentralized Survivability'}
                </h1>

                <p className="text-cyan-400/90 font-medium text-xs sm:text-sm">
                  {heroSlide === 0 ? 'AI-driven. Sensor-powered. Community-focused.' : heroSlide === 1 ? 'Sub-surface void tomography. Zero-satellite localization.' : 'Screen-to-screen data over sound. Ambient radio echoes.'}
                </p>

                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
                  {heroSlide === 0 
                    ? 'From early warning to rescue — one integrated platform.' 
                    : heroSlide === 1 
                    ? 'Detect trapped human survivors under 30 meters of landslide debris without cameras, wires, or cell towers.' 
                    : 'Self-healing acoustic & RF mesh ensuring continuous telemetry across blacked-out Himalayan corridors.'}
                </p>

                {/* 3 Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsMapModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>View Live Map</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCapability('ner-monitor');
                      setIsCapabilityModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-200 border border-slate-700/80 hover:border-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Explore Features</span>
                  </button>

                  <button
                    onClick={handleStartSimulation}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isSimulationActive ? `Simulating Stage ${simulationStep + 1}...` : 'Start Demo'}</span>
                  </button>
                </div>

                {/* Carousel Dots */}
                <div className="flex items-center gap-2 pt-3">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroSlide(idx)}
                      className={`transition-all rounded-full cursor-pointer ${
                        heroSlide === idx
                          ? 'w-6 h-2 bg-cyan-400'
                          : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      title={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Aerial Mountain Terrain Graphic */}
              <div className="md:col-span-5 relative h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-700/60 group shadow-inner">
                <img
                  src="/images/mountain_corridor.jpg"
                  alt="Mountain Valley Highway Corridor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

                {/* 360 Degree Radar Sweep Beam */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-cyan-500/30 pointer-events-none">
                  <div className="w-full h-full rounded-full border border-dashed border-cyan-400/20 animate-spin" style={{ animationDuration: '8s' }} />
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.35) 0deg, rgba(6, 182, 212, 0) 60deg)',
                      animation: 'spin 4s linear infinite'
                    }}
                  />
                </div>

                {/* Landslide Risk Critical Target Marker */}
                <div className="absolute top-8 right-6 z-10">
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-950/90 border border-rose-500/80 rounded-lg text-rose-200 text-[11px] font-bold shadow-lg shadow-rose-950/60 backdrop-blur-md">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                    <div>
                      <div>Landslide Risk</div>
                      <div className="text-[9px] text-rose-400 font-mono">CRITICAL</div>
                    </div>
                  </div>
                </div>

                {/* Evacuation Route Tag */}
                <div className="absolute bottom-16 left-6 z-10">
                  <div className="flex items-center gap-1.5 px-2 py-0.8 bg-emerald-950/80 border border-emerald-500/60 rounded-md text-emerald-300 text-[10px] font-bold shadow-md backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Evacuation Route</span>
                  </div>
                </div>

                {/* Rescue Unit Tag */}
                <div className="absolute bottom-4 right-6 z-10">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-950/90 border border-blue-500/80 rounded-lg text-blue-200 text-[10px] font-bold shadow-md backdrop-blur-sm">
                    <Car className="w-3 h-3 text-blue-400" />
                    <div>
                      <div>Rescue Unit</div>
                      <div className="text-[9px] text-blue-300/80 font-mono">2.4 km away</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Trigger Overlay */}
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className="absolute inset-0 z-20 flex items-center justify-center opacity-0 hover:opacity-100 bg-slate-950/60 backdrop-blur-xs transition-opacity text-white text-xs font-bold gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Expand Real-Time SAR Radar</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. KEY CAPABILITIES (3x3 GRID) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Key Capabilities</h2>
              </div>
              <button
                onClick={onSwitchToLab}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-all cursor-pointer"
              >
                <span>View All Features</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3x3 Grid of 9 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* 1. NER Monitor */}
              <div 
                onClick={() => { setSelectedCapability('ner-monitor'); setIsCapabilityModalOpen(true); }}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/50 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-lg hover:shadow-cyan-950/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                    LIVE
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">NER Monitor</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Real-time landslide & hazard monitoring for NER region.
                </p>
              </div>

              {/* 2. AI Risk Prediction */}
              <div 
                onClick={() => { setSelectedCapability('ai-risk'); setIsCapabilityModalOpen(true); }}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/50 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-lg hover:shadow-cyan-950/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                    LIVE
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">AI Risk Prediction</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  ML-powered early warning and risk assessment.
                </p>
              </div>

              {/* 3. Emergency SOS */}
              <div 
                onClick={() => { setSelectedCapability('emergency-sos'); setIsCapabilityModalOpen(true); }}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-rose-500/50 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-lg hover:shadow-rose-950/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                    LIVE
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">Emergency SOS</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  One-tap distress signal with GPS & nearest responder.
                </p>
              </div>

              {/* 4. Smart Sensors */}
              <div 
                onClick={() => { setSelectedCapability('smart-sensors'); setIsCapabilityModalOpen(true); }}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/50 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-lg hover:shadow-cyan-950/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                    LIVE
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Smart Sensors</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  IoT based environmental & structural monitoring.
                </p>
              </div>

              {/* 5. Digital Twin */}
              <div 
                onClick={() => { setSelectedCapability('digital-twin'); setIsCapabilityModalOpen(true); }}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/50 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-lg hover:shadow-amber-950/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/30">
                    PROTOTYPE
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Digital Twin</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Simulate disasters & test response strategies.
                </p>
              </div>

              {/* 6. Zero-Internet Mode */}
              <div 
                onClick={() => { setSelectedCapability('zero-internet'); setIsCapabilityModalOpen(true); }}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-purple-500/50 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-lg hover:shadow-purple-950/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-full border border-purple-500/30">
                    RESEARCH
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Zero-Internet Mode</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Mesh + offline communication for no-network zones.
                </p>
              </div>

              {/* 7. Drone Analytics */}
              <div 
                onClick={() => { setSelectedCapability('drone-analytics'); setIsCapabilityModalOpen(true); }}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/50 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-lg hover:shadow-cyan-950/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                    LIVE
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Drone Analytics</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Aerial surveillance & real-time assessment.
                </p>
              </div>

              {/* 8. Quantum Optimization */}
              <div 
                onClick={() => { setSelectedCapability('quantum-optimization'); setIsCapabilityModalOpen(true); }}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-purple-500/50 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-lg hover:shadow-purple-950/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Atom className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-full border border-purple-500/30">
                    RESEARCH
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Quantum Optimization</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Optimized resource & evacuation planning using quantum algorithms.
                </p>
              </div>

              {/* 9. RF/SOS & Survivor Detection */}
              <div 
                onClick={() => { setSelectedCapability('rf-csi'); setIsCapabilityModalOpen(true); }}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/50 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-lg hover:shadow-amber-950/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Radar className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/30">
                    PROTOTYPE
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">RF/SOS & Survivor Detection</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Camera-free detection using RF/CSI signals.
                </p>
              </div>
            </div>
          </div>

          {/* 3. OPERATIONAL FLOW (FROM ALERT TO RECOVERY) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-cyan-400 ${isSimulationActive ? 'animate-spin' : ''}`} />
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Operational Flow</h2>
                  <span className="text-[11px] text-slate-400">From Alert to Recovery</span>
                </div>
              </div>
              {isSimulationActive && (
                <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold rounded-full animate-pulse border border-cyan-500/40">
                  Stage {simulationStep + 1}/6 Active ({simulationProgress}%)
                </span>
              )}
            </div>

            {/* 6 Sequential Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { step: 1, title: '1. Detect', desc: 'Sensors & Satellite Data', icon: Wifi },
                { step: 2, title: '2. Predict', desc: 'AI Risk Analysis & LSI', icon: Cpu },
                { step: 3, title: '3. Alert', desc: 'Multi-Channel Notifications', icon: Bell },
                { step: 4, title: '4. Evacuate', desc: 'Safe Routes & Shelters', icon: MapPin },
                { step: 5, title: '5. Rescue', desc: 'Dispatch & On-ground Teams', icon: Car },
                { step: 6, title: '6. Recover', desc: 'Assessment & Rebuild', icon: ShieldCheck }
              ].map((st, idx) => {
                const IconC = st.icon;
                const isActive = simulationStep === idx;
                const isPassed = simulationStep > idx;

                return (
                  <div
                    key={st.step}
                    onClick={() => {
                      setSimulationStep(idx);
                      playSynthesizedTone(700 + idx * 80, 0.15);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400'
                        : isPassed
                        ? 'bg-slate-950/90 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center bg-slate-900 border border-slate-700 text-cyan-400">
                      <IconC className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white">{st.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{st.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. BOTTOM 3 CARDS: TECH STACK, DEMO SCENARIO, SYSTEM HEALTH */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Technology Stack */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Technology Stack</h3>
                  </div>
                  <button 
                    onClick={() => setIsTechStackModalOpen(true)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'Node.js', 'MongoDB', 'Socket.io', 'Python', 'TensorFlow', 'PostgreSQL', 'Leaflet (Maps)', 'Open-Meteo', 'Sentinel', 'ESP32 (IoT)', 'PWA'].map((tech) => (
                    <span
                      key={tech}
                      onClick={() => setIsTechStackModalOpen(true)}
                      className="px-2 py-0.8 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 text-[10px] font-mono rounded cursor-pointer transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                Autonomous Edge & Microservices
              </div>
            </div>

            {/* Card 2: Demo Scenario */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Play className="w-4 h-4 text-emerald-400 fill-current" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Demo Scenario</h3>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Simulate a real-world disaster scenario and see the platform in action.
                </p>

                <div className="relative h-20 rounded-lg overflow-hidden border border-slate-800 mb-3 group">
                  <img src="/images/mountain_corridor.jpg" alt="Simulation Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-white">NER Landslide Simulation</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Rainfall → Risk → Alert → Evacuation → Rescue
                </div>
              </div>

              <button
                onClick={handleStartSimulation}
                className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSimulationActive ? 'Simulation Running...' : 'Start Simulation'}</span>
              </button>
            </div>

            {/* Card 3: System Health */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Health</h3>
                  </div>
                  <button 
                    onClick={() => setIsHealthModalOpen(true)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                  >
                    View Details →
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { name: 'API Services', status: 'Online', color: 'text-emerald-400' },
                    { name: 'Database', status: 'Online', color: 'text-emerald-400' },
                    { name: 'Socket.IO', status: 'Online', color: 'text-emerald-400' },
                    { name: 'Satellite Feed', status: 'Online', color: 'text-emerald-400' },
                    { name: 'Sensor Network', status: '114/116 Online', color: 'text-emerald-400' }
                  ].map((srv) => (
                    <div key={srv.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{srv.name}</span>
                      </div>
                      <span className={`text-[11px] font-mono font-bold ${srv.color}`}>{srv.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>99.98% Uptime</span>
                <span>Latency: 14ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT RAIL COLUMN (4 COLS) ── */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. ACTIVE EMERGENCY CARD */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                <h2 className="text-base font-bold text-white tracking-tight">Active Emergency</h2>
              </div>
              <button
                onClick={() => setIsIncidentModalOpen(true)}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
              >
                View All →
              </button>
            </div>

            {/* Large Crimson Incident Card */}
            <div className="bg-gradient-to-br from-rose-950/70 via-slate-950 to-slate-900 border border-rose-500/50 rounded-xl p-4 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shadow-inner">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Landslide - NH-10</h3>
                      <span className="px-2 py-0.2 bg-rose-500 text-slate-950 font-black text-[9px] rounded uppercase">
                        CRITICAL
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>Bargarh, Odisha / Sikkim Highway</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Metrics Box */}
              <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-rose-500/20 text-center">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-base font-black text-rose-400">{liveMetrics.peopleExposed}</div>
                  <div className="text-[10px] text-slate-400">Exposed</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-base font-black text-amber-400">{liveMetrics.villagesAffected}</div>
                  <div className="text-[10px] text-slate-400">Villages</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-base font-black text-orange-400">{liveMetrics.roadsBlocked}</div>
                  <div className="text-[10px] text-slate-400">Roads</div>
                </div>
              </div>

              {/* ETA */}
              <div className="flex items-center justify-between text-xs px-3 py-2 bg-rose-950/40 rounded-lg border border-rose-500/30 mb-3">
                <span className="text-slate-300 font-medium">ETA (Rescue Units)</span>
                <span className="font-mono font-bold text-rose-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>06 min</span>
                </span>
              </div>

              <button
                onClick={() => setIsIncidentModalOpen(true)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Incident Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. RECENT ALERTS CARD */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white tracking-tight">Recent Alerts</h2>
              </div>
              <button
                onClick={() => setIsIncidentModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
              >
                View All →
              </button>
            </div>

            {/* Alert Feed List */}
            <div className="space-y-2.5">
              {[
                { id: 'ALT-01', title: 'Landslide Risk - NH-10', severity: 'Critical', time: '21:42', dot: 'bg-rose-500', text: 'text-rose-400' },
                { id: 'ALT-02', title: 'Heavy Rainfall Warning', severity: 'High', time: '20:17', dot: 'bg-orange-500', text: 'text-orange-400' },
                { id: 'ALT-03', title: 'Road Blockage - Zone B', severity: 'Medium', time: '19:32', dot: 'bg-amber-500', text: 'text-amber-400' },
                { id: 'ALT-04', title: 'Flood Alert - Sector 4', severity: 'Medium', time: '18:45', dot: 'bg-amber-500', text: 'text-amber-400' },
                { id: 'ALT-05', title: 'Weather Update', severity: 'Low', time: '16:20', dot: 'bg-blue-500', text: 'text-blue-400' }
              ].map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => setSelectedAlert(alt)}
                  className="p-3 bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${alt.dot} mt-1.5 flex-shrink-0`} />
                    <div>
                      <div className="text-xs font-bold text-white">{alt.title}</div>
                      <div className={`text-[10px] font-semibold ${alt.text}`}>{alt.severity}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{alt.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MODALS (SAR RADAR, CAPABILITIES, INCIDENT, STACK, HEALTH) ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* 1. LIVE SAR RADAR & SATELLITE MAP MODAL */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Radar className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Live Synthetic Aperture Radar (SAR) Telemetry</h3>
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

            <div className="relative flex-1 min-h-[300px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              <img src="/images/mountain_corridor.jpg" alt="Aerial SAR Overlay" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-cyan-950/30" />

              {/* Concentric radar rings */}
              <div className="absolute w-72 h-72 rounded-full border border-cyan-400/30 pointer-events-none" />
              <div className="absolute w-48 h-48 rounded-full border border-cyan-400/40 pointer-events-none" />
              <div className="absolute w-24 h-24 rounded-full border border-cyan-400/60 pointer-events-none" />
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.4) 0deg, rgba(6, 182, 212, 0) 90deg)',
                  animation: 'spin 3s linear infinite'
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
                  onClick={() => {
                    playSynthesizedTone(1050, 0.3);
                    setQuantumEfficiency(Number((92 + Math.random() * 6).toFixed(1)));
                  }}
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

            {/* Capability Tab 5: Drone Analytics / Emergency SOS / General fallback */}
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
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
                <p className="text-slate-300">React 18, Vite, Progressive Web App (PWA) with Service Workers, Web Audio API, WebHID, Web Bluetooth, and WebAssembly (WASM).</p>
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
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
