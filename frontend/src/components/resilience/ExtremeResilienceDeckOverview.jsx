import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap, Cpu, ShieldCheck, Network, Layers, Radio, Activity,
  Play, CheckCircle, AlertTriangle, Clock, RefreshCw,
  Search, Bell, ChevronRight, X, ExternalLink, HardDrive,
  Database, Server, Terminal, Waves, Eye, Compass,
  Sliders, ArrowUpRight, Share2, Filter, Sparkles, MapPin,
  Laptop, Smartphone, Wifi, WifiOff, Sun, Lock
} from 'lucide-react';

export default function ExtremeResilienceDeckOverview({ onSwitchToLab, onSelectLabTab }) {
  const navigate = useNavigate();

  // Navigation & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterPill, setActiveFilterPill] = useState('all');
  const [techStackTab, setTechStackTab] = useState('frontend');

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'digital-twin' | 'multi-disaster' | 'quantum' | 'rf-csi' | 'mesh' | 'sensors' | 'tech-stack' | 'architecture' | 'activity' | 'emergency-alert'
  
  // Real-time clock
  const [currentClock, setCurrentClock] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl+K to focus search
  const searchInputRef = useRef(null);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Web Audio chime generator for simulation feedback
  const playChime = (freq = 640, type = 'sine', duration = 0.25) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio policy restriction if unprompted
    }
  };

  // -------------------------------------------------------------
  // END-TO-END INNOVATION SIMULATION ENGINE
  // -------------------------------------------------------------
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState([
    'System ready. Autonomous grid-free computing stack initialized.'
  ]);

  const runEndToEndSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);
    playChime(520, 'sine', 0.2);
    setSimLogs(['[T+0.00s] Grid failure detected across Sector 4. Triggering offline edge fallback...']);

    setTimeout(() => {
      setSimStep(2);
      playChime(640, 'triangle', 0.2);
      setSimLogs(prev => ['[T+0.25s] LoRa ad-hoc mesh activated. 7 citizen nodes synchronizing...', ...prev]);
    }, 1200);

    setTimeout(() => {
      setSimStep(3);
      playChime(780, 'sine', 0.25);
      setSimLogs(prev => ['[T+0.50s] Digital twin topography calculating landslide slip zone via WebAssembly...', ...prev]);
    }, 2400);

    setTimeout(() => {
      setSimStep(4);
      playChime(880, 'sine', 0.3);
      setSimLogs(prev => ['[T+0.75s] Quantum annealing route optimization cleared Bypass 4B (Risk: 12%)...', ...prev]);
    }, 3600);

    setTimeout(() => {
      setSimStep(5);
      playChime(1040, 'sine', 0.4);
      setSimLogs(prev => ['[T+1.00s] Emergency broadcast disseminated via zero-power Web-NFC and E-Ink channels.', ...prev]);
      setIsSimulating(false);
    }, 4800);
  };

  // -------------------------------------------------------------
  // FEATURE SHOWCASE DATA (Segregated Operational vs Innovation Lab)
  // -------------------------------------------------------------
  const featureCards = [
    {
      id: 'digital-twin',
      title: 'Digital Twin 3D Topography',
      tier: 'operational',
      badge: 'DEPLOYED · 3D/4D',
      badgeColor: 'bg-emerald-600 text-white border-emerald-400',
      image: '/images/digital_twin_terrain.jpg',
      desc: 'Real-time disaster simulation and predictive modeling using geographic, climate, and infrastructure data.',
      buttonText: 'Open Digital Twin →',
      pillCategory: 'digital-twin',
      action: () => navigate('/digital-twin')
    },
    {
      id: 'zero-internet',
      title: 'Zero-Internet P2P Mesh',
      tier: 'operational',
      badge: 'DEPLOYED · OFF-GRID',
      badgeColor: 'bg-emerald-600 text-white border-emerald-400',
      image: '/images/zero_internet_mesh.jpg',
      desc: 'Ad-hoc mesh protocol and LoRa communications when cellular backbones and internet services collapse.',
      buttonText: 'Open Mesh Console →',
      pillCategory: 'offline-first',
      action: () => navigate('/zero-internet-mesh')
    },
    {
      id: 'sensors',
      title: 'Advanced IoT Sensor Network',
      tier: 'operational',
      badge: 'LIVE TELEMETRY',
      badgeColor: 'bg-emerald-600 text-white border-emerald-400',
      image: '/images/sensor_station.jpg',
      desc: 'Distributed sensor telemetry for soil moisture saturation, slope pore pressure, tilt, and flash floods.',
      buttonText: 'Inspect Live Sensors →',
      pillCategory: 'edge-computing',
      action: () => navigate('/smart-alerts')
    },
    {
      id: 'emergency-sos',
      title: 'Emergency SOS Center',
      tier: 'operational',
      badge: 'CRISIS DISPATCH',
      badgeColor: 'bg-red-600 text-white border-red-400',
      image: '/images/rf_csi_waveform.jpg',
      desc: 'Direct citizen SOS beacons, WhatsApp crisis dispatch, and unified coordinates for field rescue units.',
      buttonText: 'Open SOS Center →',
      pillCategory: 'offline-first',
      action: () => navigate('/emergency-sos')
    },
    {
      id: 'multi-disaster',
      title: 'Multi-Disaster Cascading Simulation',
      tier: 'innovation',
      badge: 'SIMULATION LAB',
      badgeColor: 'bg-purple-600 text-white border-purple-400',
      image: '/images/multi_disaster_sim.jpg',
      desc: 'Simulate cascading events (cyclone → flash flood → hill slope collapse) to plan multi-hazard response.',
      buttonText: 'Launch Simulator →',
      pillCategory: 'edge-computing',
      action: () => navigate('/ner-topography-suite')
    },
    {
      id: 'quantum',
      title: 'Quantum-Inspired Route Optimization',
      tier: 'innovation',
      badge: 'RESEARCH ENGINE',
      badgeColor: 'bg-indigo-600 text-white border-indigo-400',
      image: '/images/quantum_opt_network.jpg',
      desc: 'Simulated annealing and post-quantum route clearing algorithms for blocked evacuation corridors.',
      buttonText: 'Open Quantum Suite →',
      pillCategory: 'quantum',
      action: () => navigate('/world-first-innovations?tab=quantum-chaff')
    },
    {
      id: 'rf-csi',
      title: 'RF/CSI Rubble Survivor Detection',
      tier: 'innovation',
      badge: 'RESEARCH ENGINE',
      badgeColor: 'bg-sky-600 text-white border-sky-400',
      image: '/images/rf_csi_waveform.jpg',
      desc: 'Through-barrier human respiration and micro-movement detection using parasitic Wi-Fi CSI waveforms.',
      buttonText: 'Open Deep-Tech Suite →',
      pillCategory: 'offline-first',
      action: () => navigate('/world-first-innovations?tab=parasitic-rf')
    }
  ];

  // Filter cards by search or pill category
  const filteredCards = featureCards.filter(card => {
    const matchesSearch = searchQuery === '' || 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPill = activeFilterPill === 'all' || 
      card.pillCategory === activeFilterPill ||
      (activeFilterPill === 'digital-twin' && card.id === 'digital-twin') ||
      (activeFilterPill === 'edge-computing' && (card.id === 'multi-disaster' || card.id === 'sensors')) ||
      (activeFilterPill === 'offline-first' && (card.id === 'rf-csi' || card.id === 'zero-internet')) ||
      (activeFilterPill === 'quantum' && card.id === 'quantum');
    return matchesSearch && matchesPill;
  });

  return (
    <div className="min-h-screen bg-[#070e18] text-slate-100 font-sans pb-16 selection:bg-cyan-500/30">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER & NAVIGATION BAR                            */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-[#070e18]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left Brand / Search Bar */}
          <div className="flex items-center gap-4 w-full md:w-auto flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search features, modules, or resources..."
                className="w-full bg-[#0b1728] border border-slate-700/80 focus:border-cyan-500 focus:outline-none rounded-xl pl-9 pr-14 py-2 text-xs text-slate-200 placeholder-slate-400 transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                Ctrl+K
              </span>
            </div>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Active Emergency Alert Pill */}
            <button
              onClick={() => navigate('/alerts')}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/60 rounded-xl flex items-center gap-2 transition-all cursor-pointer group shadow-sm"
              title="View Live Alert Protocol"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-xs font-bold text-rose-200 group-hover:text-white">
                NER Landslide Risk - NH-10
              </span>
              <span className="text-[11px] font-black uppercase px-2 py-0.5 bg-rose-600 text-white rounded font-mono shadow-sm">
                CRITICAL
              </span>
            </button>

            {/* Date badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1728] border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/alerts?tab=notifications')}
              className="relative p-2 bg-[#0b1728] hover:bg-slate-800/80 border border-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
              title="Recent Activity Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400"></span>
            </button>

            {/* User Profile Pill */}
            <button
              onClick={() => navigate('/administrator')}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-[#0b1728] hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-colors cursor-pointer text-left"
              title="Go to Administrator Hub"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[11px] font-black text-white">
                CC
              </div>
              <span className="text-xs font-semibold text-slate-200">Command Center</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mode Switcher Banner: Command Overview Deck vs Deep-Tech Lab */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a1526] border border-slate-800/80 p-1.5 rounded-2xl">
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Extreme Resilience Overview Suite
            </button>

            <button
              onClick={onSwitchToLab}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors flex items-center gap-2"
            >
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              Deep-Tech Resilience Lab (WASM, E-Ink, NFC, Li-Fi)
            </button>
          </div>

          <div className="flex items-center gap-2 pr-2 text-xs text-slate-400 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Zero-Grid Resilience Engine Active
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. HERO SECTION & FEATURE STATUS BANNER                   */}
      {/* ========================================================= */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Operational Tactical Telemetry & Sector Matrix Card */}
          <div className="lg:col-span-8 bg-[#0a1526] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative shadow-lg">
            <div>
              {/* Tactical Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white text-xs font-black rounded-md tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                  CRISIS OPERATIONS ACTIVE
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950 text-cyan-300 text-xs font-bold rounded-md border border-cyan-500/40 font-mono">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  ZERO-GRID RESILIENCE ENGINE
                </span>
              </div>

              {/* Main Operational Headline */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug mb-2">
                Tactical Grid-Free Operations &amp; Telemetry Deck
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mb-4 leading-relaxed font-medium">
                Autonomous disaster compute operating independently of cellular networks, central servers, or power grids. Live telemetry, sensor mesh ingestion, and responder unit dispatch.
              </p>

              {/* Interactive Operational Incident Matrix (High-Density Real Estate) */}
              <div className="space-y-2.5 my-3">
                {/* Sector 1: Landslide Fracture */}
                <div className="p-3.5 bg-[#081220] border-l-4 border-l-red-500 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-black rounded uppercase">
                        CRITICAL SECTOR
                      </span>
                      <span className="text-xs font-bold text-white">
                        NH-10 Km 42 Fracture Zone (Kalimpong / Teesta Corridor)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex flex-wrap items-center gap-3 font-mono">
                      <span>Saturation: <strong className="text-red-400">88.4%</strong></span>
                      <span>Slope Tilt: <strong className="text-amber-400">14.2°</strong></span>
                      <span>Deployed: <strong className="text-cyan-400">4 NDRF Teams</strong></span>
                      <span>Access: <strong className="text-red-300">2 Roads Severed</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate('/alerts')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Alert Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate('/rescue-centers')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      Deploy
                    </button>
                  </div>
                </div>

                {/* Sector 2: Teesta River Basin Surge */}
                <div className="p-3.5 bg-[#081220] border-l-4 border-l-amber-500 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 bg-amber-600 text-white text-[11px] font-black rounded uppercase">
                        HIGH WARNING
                      </span>
                      <span className="text-xs font-bold text-white">
                        Teesta River Catchment Surge (Hydro Sensor Array #04)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex flex-wrap items-center gap-3 font-mono">
                      <span>Water Inundation: <strong className="text-amber-400">+1.85m</strong></span>
                      <span>Discharge: <strong className="text-slate-200">3,420 m³/s</strong></span>
                      <span>Shelter Alert: <strong className="text-emerald-400">3 Ready</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate('/smart-alerts')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Sensors</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate('/evacuation-planner')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      Evac Plan
                    </button>
                  </div>
                </div>

                {/* Sector 3: Off-Grid LoRa Mesh Backbone */}
                <div className="p-3.5 bg-[#081220] border-l-4 border-l-emerald-500 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-black rounded uppercase">
                        OPERATIONAL
                      </span>
                      <span className="text-xs font-bold text-white">
                        Zero-Internet LoRa Mesh Backbone (Pasighat &amp; Hill Relays)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex flex-wrap items-center gap-3 font-mono">
                      <span>Active Relays: <strong className="text-emerald-400">7 Hardware Nodes</strong></span>
                      <span>Packet Loss: <strong className="text-emerald-400">0.0%</strong></span>
                      <span>Devices Synced: <strong className="text-cyan-400">142 Citizen Terminals</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate('/zero-internet-mesh')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Mesh Console</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tactical Navigation Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/90 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => navigate('/digital-twin')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Launch Full 3D Digital Twin</span>
              </button>
              <button
                onClick={() => navigate('/map')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white font-bold text-xs rounded-xl border border-cyan-500/40 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Live Tactical Map</span>
              </button>
              <button
                onClick={() => navigate('/emergency-sos')}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Emergency SOS Center</span>
              </button>
            </div>
          </div>

          {/* Hero Right: High-Contrast Operational Readiness Card */}
          <div className="lg:col-span-4 bg-[#0a1526] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white tracking-wide">Operational Readiness</h2>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[11px] font-black rounded-md uppercase">
                  All Systems Deployed
                </span>
              </div>

              {/* Clickable Status List with Direct Route Navigation */}
              <div className="space-y-2">
                {[
                  { title: 'Digital Twin Topography', status: 'DEPLOYED', color: 'bg-emerald-600 text-white', icon: Layers, path: '/digital-twin' },
                  { title: 'Offline-First LoRa Mesh', status: 'DEPLOYED', color: 'bg-emerald-600 text-white', icon: HardDrive, path: '/zero-internet-mesh' },
                  { title: 'IoT Slope Sensors', status: 'LIVE TELEMETRY', color: 'bg-emerald-600 text-white', icon: Activity, path: '/smart-alerts' },
                  { title: 'Emergency SOS Dispatch', status: 'STANDBY READY', color: 'bg-red-600 text-white', icon: Radio, path: '/emergency-sos' },
                  { title: 'Multi-Disaster Sim Lab', status: 'SIM ENGINE', color: 'bg-purple-600 text-white', icon: Cpu, path: '/ner-topography-suite' },
                  { title: 'Quantum Route Clearing', status: 'RESEARCH LAB', color: 'bg-indigo-600 text-white', icon: Sparkles, path: '/world-first-innovations?tab=quantum-chaff' },
                ].map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(item.path)}
                      className="p-2.5 bg-[#0d1c32] hover:bg-[#132744] border border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center justify-between transition-all cursor-pointer group"
                      title={`Click to open ${item.title}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-100 group-hover:text-white">
                          {item.title}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hardware Lab Shortcut Callout */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="p-3 bg-[#081220] rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Hardware &amp; Supercomputer Lab</div>
                  <div className="text-[10px] text-slate-400">E-Ink Canvas, Web-NFC, Li-Fi &amp; WASM</div>
                </div>
                <button
                  onClick={onSwitchToLab}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Open Deep-Tech Lab"
                >
                  <span>Open Lab</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. 4 KEY KPI METRIC CARDS                                 */}
      {/* ========================================================= */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: 5 Core Technologies */}
          <div className="bg-[#0a1526] border border-slate-800/80 hover:border-purple-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all">
            <div className="w-13 h-13 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">5</div>
              <div className="text-xs font-bold text-slate-200">Core Technologies</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Transforming disaster response</div>
            </div>
          </div>

          {/* Card 2: 99.2% System Uptime */}
          <div className="bg-[#0a1526] border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">99.2%</div>
              <div className="text-xs font-bold text-slate-200">System Uptime</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Last 30 days</div>
            </div>
          </div>

          {/* Card 3: < 500ms Response Latency */}
          <div className="bg-[#0a1526] border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all">
            <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">&lt; 500ms</div>
              <div className="text-xs font-bold text-slate-200">Response Latency</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Edge Computing</div>
            </div>
          </div>

          {/* Card 4: 7 Active Nodes */}
          <div className="bg-[#0a1526] border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all">
            <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">7</div>
              <div className="text-xs font-bold text-slate-200">Active Nodes</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Mesh Network</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FEATURE SHOWCASE (STRICT SEPARATION: OPS VS INNOVATION) */}
      {/* ========================================================= */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* ── ZONE A: FIELD-DEPLOYED OPERATIONAL MODULES ── */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded uppercase tracking-wider">
                  Field-Verified &amp; Actionable
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Field-Deployed Operational Modules
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Mission-critical systems active and verified for immediate operational crisis response.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/map')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Live Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/emergency-sos')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>SOS Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Operational Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredCards.filter(c => c.tier === 'operational').map((card) => (
              <div
                key={card.id}
                className="bg-[#0a1526] border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-emerald-950/20 group"
              >
                <div>
                  <div className="p-3.5 pb-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {card.title}
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div className="relative h-36 overflow-hidden bg-slate-950">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1526] via-transparent to-transparent"></div>
                  </div>

                  <div className="p-3.5 pt-2.5">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <button
                    onClick={card.action}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{card.buttonText}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ZONE B: INNOVATION LAB & PREDICTIVE SIMULATIONS ── */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-purple-600 text-white text-[10px] font-black rounded uppercase tracking-wider">
                  Deep-Tech &amp; Research Lab
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Predictive Simulation &amp; Deep-Tech Lab
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Advanced cascading hazard simulators, post-quantum optimization, and experimental sensor telemetry.
              </p>
            </div>

            <button
              onClick={() => navigate('/world-first-innovations')}
              className="text-xs font-bold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 px-3.5 py-1.5 rounded-lg border border-purple-500/40 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Explore 22 Deep-Tech Breakthroughs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Innovation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredCards.filter(c => c.tier === 'innovation').map((card) => (
              <div
                key={card.id}
                className="bg-[#0a1526] border border-slate-800 hover:border-purple-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-purple-950/20 group"
              >
                <div>
                  <div className="p-3.5 pb-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {card.title}
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div className="relative h-36 overflow-hidden bg-slate-950">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1526] via-transparent to-transparent"></div>
                  </div>

                  <div className="p-3.5 pt-2.5">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <button
                    onClick={card.action}
                    className="w-full py-2 px-3 bg-[#111e38] hover:bg-purple-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-purple-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{card.buttonText}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. BOTTOM SECTION: TECH STACK, ARCHITECTURE, ACTIVITY     */}
      {/* ========================================================= */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Technology Stack Card */}
          <div className="lg:col-span-6 bg-[#0a1526] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Technology Stack</h3>
                </div>
                <button
                  onClick={() => setActiveModal('tech-stack')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {['frontend', 'backend', 'ai-ml', 'infrastructure', 'devices'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTechStackTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      techStackTab === tab
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-[#0d1c32] text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {tab.replace('-', '/')}
                  </button>
                ))}
              </div>

              {/* Active Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {techStackTab === 'frontend' && (
                  <>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-cyan-300">React</div>
                      <div className="text-[10px] text-slate-400">v18 Concurrent</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-sky-400">TypeScript</div>
                      <div className="text-[10px] text-slate-400">Strict Typing</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-teal-300">Tailwind CSS</div>
                      <div className="text-[10px] text-slate-400">Zero Runtime</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-purple-400">PWA</div>
                      <div className="text-[10px] text-slate-400">Service Workers</div>
                    </div>
                  </>
                )}

                {techStackTab === 'backend' && (
                  <>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-emerald-400">Node.js</div>
                      <div className="text-[10px] text-slate-400">LTS Runtime</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-slate-200">Express.js</div>
                      <div className="text-[10px] text-slate-400">Micro-routing</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-amber-300">Socket.IO</div>
                      <div className="text-[10px] text-slate-400">Mesh Sync</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-emerald-500">MongoDB</div>
                      <div className="text-[10px] text-slate-400">GeoJSON Index</div>
                    </div>
                  </>
                )}

                {techStackTab === 'ai-ml' && (
                  <>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-amber-400">Python 3.11</div>
                      <div className="text-[10px] text-slate-400">Inference Core</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-orange-400">TensorFlow</div>
                      <div className="text-[10px] text-slate-400">TF-Lite Edge</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-red-400">PyTorch</div>
                      <div className="text-[10px] text-slate-400">Finite Element</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-cyan-400">ONNX</div>
                      <div className="text-[10px] text-slate-400">WASM Runtime</div>
                    </div>
                  </>
                )}

                {techStackTab === 'infrastructure' && (
                  <>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-sky-400">Web Workers</div>
                      <div className="text-[10px] text-slate-400">Multi-threaded</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-indigo-400">IndexedDB</div>
                      <div className="text-[10px] text-slate-400">Offline Vault</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-purple-400">WASM</div>
                      <div className="text-[10px] text-slate-400">Near-Native C++</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-emerald-400">Web Audio</div>
                      <div className="text-[10px] text-slate-400">Acoustic Chirp</div>
                    </div>
                  </>
                )}

                {techStackTab === 'devices' && (
                  <>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-rose-400">ESP32</div>
                      <div className="text-[10px] text-slate-400">Solar Telemetry</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-cyan-400">LoRa SX1276</div>
                      <div className="text-[10px] text-slate-400">868/915 MHz</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-amber-300">BLE 5.2</div>
                      <div className="text-[10px] text-slate-400">Proximity Beacons</div>
                    </div>
                    <div className="p-2.5 bg-[#0d1c32] rounded-xl border border-slate-800 text-center">
                      <div className="text-xs font-bold text-emerald-400">Web-NFC</div>
                      <div className="text-[10px] text-slate-400">13.56 MHz RFID</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Optimized for low-bandwidth 2G/mesh or zero-connection field hardware.</span>
              <span className="text-cyan-400 font-mono">PWA Offline Capable</span>
            </div>
          </div>

          {/* System Architecture Flow Card */}
          <div className="lg:col-span-6 bg-[#0a1526] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">System Architecture</h3>
                </div>
                <button
                  onClick={() => setActiveModal('architecture')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View full architecture</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Architecture Pipeline Diagram */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-[#0d1c32] rounded-xl border border-slate-800 text-xs">
                
                {/* Inputs */}
                <div className="space-y-1.5 w-full sm:w-auto">
                  <div className="px-2.5 py-1.5 bg-[#12243e] rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] text-slate-300 font-medium">Sensors (IoT)</span>
                  </div>
                  <div className="px-2.5 py-1.5 bg-[#12243e] rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[11px] text-slate-300 font-medium">Drones</span>
                  </div>
                  <div className="px-2.5 py-1.5 bg-[#12243e] rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] text-slate-300 font-medium">Satellites</span>
                  </div>
                </div>

                <div className="text-slate-600 hidden sm:block">→</div>

                {/* Data Ingestion */}
                <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-center w-full sm:w-auto">
                  <HardDrive className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-white">Data Ingestion</div>
                  <div className="text-[10px] text-blue-300">(Edge / LoRa)</div>
                </div>

                <div className="text-slate-600 hidden sm:block">→</div>

                {/* Processing */}
                <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-center w-full sm:w-auto">
                  <Cpu className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-white">Processing</div>
                  <div className="text-[10px] text-purple-300">(ML + AI)</div>
                </div>

                <div className="text-slate-600 hidden sm:block">→</div>

                {/* Command Center */}
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-center w-full sm:w-auto">
                  <Layers className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-white">Command Center</div>
                  <div className="text-[10px] text-cyan-300">(Dashboard)</div>
                </div>

                <div className="text-slate-600 hidden sm:block">→</div>

                {/* Outputs */}
                <div className="space-y-1 w-full sm:w-auto text-[10px] font-semibold">
                  <div className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">Alerts</div>
                  <div className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">Evacuation</div>
                  <div className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">Rescue</div>
                  <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">Recovery</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Latency budget: &lt; 500ms end-to-end ingestion from sensor trigger to broadcast.</span>
              <span className="text-emerald-400 font-mono">Zero Single Point of Failure</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Recent Activity & Experience Simulation CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Recent Activity List */}
          <div className="lg:col-span-8 bg-[#0a1526] border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Recent Activity</h3>
              </div>
              <button
                onClick={() => setActiveModal('activity')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Activity Items Feed */}
            <div className="space-y-3">
              {[
                { title: 'System Simulation Started', desc: 'Run-104: NER Landslide Scenario', time: '21:40', icon: Play, iconColor: 'text-emerald-400 bg-emerald-500/10' },
                { title: 'Offline Sync', desc: '14 records synchronized (Zone B)', time: '21:34', icon: RefreshCw, iconColor: 'text-amber-400 bg-amber-500/10' },
                { title: 'New Edge Node Connected', desc: 'ESP32-Node-07 online (Bargarh)', time: '21:19', icon: Network, iconColor: 'text-cyan-400 bg-cyan-500/10' },
                { title: 'Rescue Unit Dispatched', desc: 'UNIT-4 to NH-10 Corridor', time: '21:10', icon: AlertTriangle, iconColor: 'text-rose-400 bg-rose-500/10' },
                { title: 'Network Restored', desc: 'LoRa gateway 2 connection verified', time: '20:47', icon: Radio, iconColor: 'text-blue-400 bg-blue-500/10' },
              ].map((activity, idx) => {
                const IconComponent = activity.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-[#0d1c32] hover:bg-[#122440] border border-slate-800/80 rounded-xl flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.iconColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{activity.title}</div>
                        <div className="text-[11px] text-slate-400">{activity.desc}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience the Power of Innovation Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-indigo-950 via-purple-950 to-[#0a1526] border border-purple-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-xl shadow-purple-950/30 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-black text-white tracking-tight mb-2">
                Experience the Power of Innovation
              </h3>

              <p className="text-xs text-purple-200/80 leading-relaxed mb-4">
                See how our next-gen technologies work together in a split-second to protect lives during catastrophic grid blackouts.
              </p>

              {/* Simulation logs ticker */}
              {isSimulating && (
                <div className="p-3 bg-black/50 border border-purple-500/40 rounded-xl mb-4 font-mono text-[10px] text-purple-200 space-y-1">
                  <div className="flex items-center justify-between text-cyan-400 font-bold">
                    <span>STEP {simStep} / 5</span>
                    <span className="animate-pulse">RUNNING...</span>
                  </div>
                  <div className="text-slate-300 truncate">{simLogs[0]}</div>
                </div>
              )}
            </div>

            <div className="relative z-10 mt-4">
              <button
                onClick={runEndToEndSimulation}
                disabled={isSimulating}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Executing Simulation...' : 'Start Simulation'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. WORKING INTERACTIVE MODALS                             */}
      {/* ========================================================= */}

      {/* MODAL 1: DIGITAL TWIN SIMULATOR */}
      {activeModal === 'digital-twin' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b172a] border border-cyan-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Digital Twin Terrain Simulator</h3>
                  <div className="text-xs text-slate-400">High-Fidelity 3D Geographic & Climate Modeling</div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-800">
                <img
                  src="/images/digital_twin_terrain.jpg"
                  alt="Digital Twin Terrain"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-4">
                  <div className="flex items-center justify-between w-full text-xs font-mono">
                    <span className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded">
                      Elevation Gradient: 120m – 7240m MSL
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded">
                      InSAR Coherence: γ = 0.94
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Slope Angle</div>
                  <div className="text-lg font-bold text-white mt-1">42.8° (Critical)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Pore Water Pressure</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">84.2 kPa</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Predicted Shear Failure</div>
                  <div className="text-lg font-bold text-rose-400 mt-1">18 Mins</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Autonomous Geo-Spatial Synthesis
                </h4>
                <p>
                  The Digital Twin ingests real-time Sentinel-1 radar passes, meteorological precipitation rates, and in-ground soil moisture telemetry to continuously compute finite-element slope factor of safety (FoS).
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    navigate('/digital-twin');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Launch Full 3D / 4D Digital Twin →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MULTI-DISASTER SIMULATION */}
      {activeModal === 'multi-disaster' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b172a] border border-amber-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Zap className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Multi-Disaster Cascading Simulation</h3>
                  <div className="text-xs text-slate-400">Compound Hazard Modeling: Cyclone → Storm Surge → Inundation → Landslide</div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-800">
                <img
                  src="/images/multi_disaster_sim.jpg"
                  alt="Multi-Disaster Simulation Radar"
                  className="w-full h-72 object-cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Peak Wind Speed</div>
                  <div className="text-base font-bold text-rose-400 mt-1">235 km/h (Cat 4)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Central Pressure</div>
                  <div className="text-base font-bold text-cyan-300 mt-1">935 hPa</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Peak Storm Surge</div>
                  <div className="text-base font-bold text-amber-400 mt-1">5.8 Meters</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Population Exposed</div>
                  <div className="text-base font-bold text-white mt-1">142,500</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                <h4 className="font-bold text-white mb-1.5">Cascading Event Timeline</h4>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="text-cyan-400">T-00h: Cyclone landfall triggers high storm surge across coastal flats.</div>
                  <div className="text-amber-400">T+06h: 210mm extreme rainfall saturates upstream mountain catchment basins.</div>
                  <div className="text-rose-400">T+12h: Soil liquefaction and debris flow block NH-10 arterial corridor.</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    navigate('/ner-topography-suite');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Multi-Disaster Simulation Suite →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QUANTUM OPTIMIZATION */}
      {activeModal === 'quantum' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b172a] border border-purple-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Quantum-Inspired Annealing Route Optimizer</h3>
                  <div className="text-xs text-slate-400">Simulated Bifurcation Machine for NP-Hard Fleet Allocation</div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-800">
                <img
                  src="/images/quantum_opt_network.jpg"
                  alt="Quantum Optimization Network"
                  className="w-full h-72 object-cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Optimal Evacuation Path</div>
                  <div className="text-base font-bold text-cyan-300 mt-1">Route Q-99 (Bypass B)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Bottleneck Reduction</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">-42.4% Congestion</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Clearance Efficiency Score</div>
                  <div className="text-base font-bold text-purple-400 mt-1">94.6% Optimal</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                <h4 className="font-bold text-white mb-1.5">How Quantum Annealing Outperforms Classical Dijkstra:</h4>
                <p>
                  Classical routing algorithms fail in disasters because roads are continuously collapsing in real time. Quantum-inspired quadratic unconstrained binary optimization (QUBO) evaluates all 1,024 combinatorial route combinations simultaneously in 38 milliseconds.
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    navigate('/world-first-innovations?tab=quantum-chaff');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Quantum Optimization Engine →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RF/CSI SURVIVOR DETECTION */}
      {activeModal === 'rf-csi' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b172a] border border-fuchsia-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Waves className="w-6 h-6 text-fuchsia-400" />
                <div>
                  <h3 className="text-base font-bold text-white">RF & Channel State Information (CSI) Survivor Detection</h3>
                  <div className="text-xs text-slate-400">Camera-Free Through-Rubble Breathing & Micro-Motion Doppler Telemetry</div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-800">
                <img
                  src="/images/rf_csi_waveform.jpg"
                  alt="RF CSI Doppler Spectrogram"
                  className="w-full h-72 object-cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Detection Status</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">OCCUPIED (HUMAN)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Estimated Depth / Distance</div>
                  <div className="text-base font-bold text-cyan-300 mt-1">2.1 Meters Under Debris</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Respiration Waveform</div>
                  <div className="text-base font-bold text-fuchsia-400 mt-1">16 BPM (Normal)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">CSI Link Quality</div>
                  <div className="text-base font-bold text-white mt-1">98.4% (Subcarrier 52)</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                <h4 className="font-bold text-white mb-1.5">Zero-Optical Search & Rescue Mechanism:</h4>
                <p>
                  Utilizes commercial Wi-Fi chipsets emitting orthogonal frequency-division multiplexing (OFDM) signals. Sub-millimeter chest wall movements alter multi-path reflection phases, allowing search teams to locate trapped survivors under 3 meters of concrete rubble without cameras.
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    navigate('/world-first-innovations?tab=parasitic-rf');
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open RF/CSI Radar Module →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ZERO-INTERNET MESH */}
      {activeModal === 'mesh' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b172a] border border-cyan-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Radio className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Decentralized LoRa & Ad-Hoc Mesh Console</h3>
                  <div className="text-xs text-slate-400">Peer-to-Peer Zero-Infrastructure Packet Hopping Network</div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-800">
                <img
                  src="/images/zero_internet_mesh.jpg"
                  alt="Decentralized Mesh Network"
                  className="w-full h-72 object-cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Active Mesh Nodes</div>
                  <div className="text-base font-bold text-cyan-300 mt-1">7 Field Nodes Synced</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Max Hop Distance</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">14.2 km Line-of-Sight</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Frequency & Band</div>
                  <div className="text-base font-bold text-white mt-1">868 MHz ISM (Zero SIM)</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                <h4 className="font-bold text-white mb-1.5">Offline Epidemic Gossip Protocol:</h4>
                <p>
                  Every citizen running the PWA becomes a cryptographic forwarding router. Even with all cell towers flattened, messages hop phone-to-phone via BLE and long-range LoRa until reaching an incident commander.
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    navigate('/zero-internet-mesh');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open P2P Mesh Console →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ADVANCED SENSOR NETWORK */}
      {activeModal === 'sensors' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b172a] border border-emerald-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sun className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Advanced Solar IoT Sensor Station Network</h3>
                  <div className="text-xs text-slate-400">Autonomous Weather, Seismic & Ground Slope Instrumentation</div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-800">
                <img
                  src="/images/sensor_station.jpg"
                  alt="Advanced IoT Sensor Station"
                  className="w-full h-72 object-cover"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Precipitation Rate</div>
                  <div className="text-base font-bold text-cyan-300 mt-1">42 mm/hr (Heavy)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Inclinometer Tilt</div>
                  <div className="text-base font-bold text-amber-400 mt-1">+1.82° Δ/24h</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Solar Battery Voltage</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">13.8 V (100%)</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Seismic Microwaves</div>
                  <div className="text-base font-bold text-rose-400 mt-1">0.14g (Pre-slip)</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                <h4 className="font-bold text-white mb-1.5">Self-Sustaining Remote Telemetry Architecture:</h4>
                <p>
                  Mounted with ultra-low-power ESP32 microcontrollers, MPPT solar controllers, and sub-surface piezometers, these stations broadcast telemetry every 5 seconds over LoRa without relying on external mains electrical grids.
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    navigate('/smart-alerts');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open IoT Sensor Telemetry Hub →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: TECH STACK DETAILS */}
      {activeModal === 'tech-stack' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b172a] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Full Technology Stack Specifications</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="font-bold text-cyan-300">Frontend Core:</span> React 18 Concurrent Mode, Vite, Vanilla CSS + Tailwind utility styling, Progressive Web App (PWA) Workbox service workers.
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400">Backend & WebSockets:</span> Node.js 20 LTS, Express.js microservices, Socket.IO real-time bi-directional packet streaming, MongoDB with 2dsphere indexing.
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">AI / Machine Learning:</span> Python 3.11, TensorFlow Lite, ONNX runtime, PyTorch finite-element modeling, WebAssembly (WASM) client-side inference.
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="font-bold text-purple-400">Hardware & Firmware:</span> ESP32-WROOM-32, LoRa SX1276 (868/915MHz), Web-NFC (13.56MHz RFID), Web Audio acoustic synthesis modem.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: ARCHITECTURE DETAILS */}
      {activeModal === 'architecture' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b172a] border border-cyan-500/40 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Full Microservices & Ingestion Blueprint</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-cyan-400 font-bold mb-1">STAGE 1: DISTRIBUTED INGESTION</div>
                <div className="text-slate-300 text-[11px]">Sub-50ms ingestion via LoRa gateways and peer-to-peer WebRTC data channels. Deduplicates packets across chaotic network hops.</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-purple-400 font-bold mb-1">STAGE 2: EDGE AI & WASM INFERENCE</div>
                <div className="text-slate-300 text-[11px]">Zero server reliance: Local phones execute finite-element slope deformation and CSI Doppler breathing matrices locally inside the client browser.</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-amber-400 font-bold mb-1">STAGE 3: MULTI-CHANNEL ADVISORY BROADCAST</div>
                <div className="text-slate-300 text-[11px]">Disseminates life-safety alerts simultaneously over E-Ink monochrome feeds, ultrasonic acoustic sound chirps, and Web-NFC relief tokens.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: RECENT ACTIVITY */}
      {activeModal === 'activity' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b172a] border border-slate-700 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Full Operational Activity Log</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              {[
                { time: '21:40', text: 'System Simulation Started - Run-104: NER Landslide Scenario' },
                { time: '21:34', text: 'Offline Sync - 14 records synchronized (Zone B)' },
                { time: '21:19', text: 'New Edge Node Connected - ESP32-Node-07 online (Bargarh)' },
                { time: '21:10', text: 'Rescue Unit Dispatched - UNIT-4 to NH-10 Corridor' },
                { time: '20:47', text: 'Network Restored - LoRa gateway 2 connection verified' },
                { time: '20:25', text: 'Precipitation Threshold Warning - Sensor Pole #12 (42 mm/hr)' },
                { time: '19:58', text: 'Web-NFC Locker Unlocked - CRATE-AIRDROP-NONGRIAT-04' },
                { time: '19:30', text: 'Li-Fi Optical Broadcast Synced - Pasighat Indoor Stadium Hub' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">{item.text}</span>
                  <span className="text-cyan-400 font-mono text-[11px] ml-3 flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: EMERGENCY ALERT DETAILS */}
      {activeModal === 'emergency-alert' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b172a] border border-rose-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Active Incident: NER Landslide Risk - NH-10</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-200">
                <div className="font-bold text-rose-300 mb-1">CRITICAL INCIDENT BULLETIN</div>
                Geotechnical sensors along NH-10 Milepost 32–36 indicate 84.2 kPa pore water pressure and high creep rate. Total road blockage expected within 18 minutes.
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Affected Sector:</div>
                  <div className="font-bold text-white">Bargarh & Pangin Corridor</div>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Recommended Action:</div>
                  <div className="font-bold text-emerald-400">Divert via Bypass 4B</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-3">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    navigate('/alerts');
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Inspect Full Alert Protocol →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
