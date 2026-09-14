import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Eye, Volume2, Globe, Clock, ShieldAlert, 
  Send, RefreshCw, Play, Square, CheckCircle, AlertTriangle, 
  MapPin, Heart, Radio, Crosshair, Compass, Layers, 
  ChevronRight, Cpu, ArrowUpRight, Sparkles, Sliders, 
  ExternalLink, Award, FileText, Satellite, Navigation, 
  Camera, Flame, AlertCircle, PlayCircle
} from 'lucide-react';

export default function HyperSpeedRescueSuite() {
  const [activeTab, setActiveTab] = useState('swarm');

  // -------------------------------------------------------------
  // TAB 1: AUTONOMOUS DRONE SWARM DISPATCH (ZERO-HUMAN DELAY)
  // -------------------------------------------------------------
  const [swarmTriggered, setSwarmTriggered] = useState(false);
  const [launchTimer, setLaunchTimer] = useState(0);
  const [swarmTelemetry, setSwarmTelemetry] = useState({
    activeDrones: 3,
    baseStation: 'Pasighat Automated Aerial Depot #2',
    targetCoord: { lat: 28.0682, lng: 95.3341 },
    targetLocation: 'Siang River Ghat, Flash Flood Surge Boulder',
    victimDescription: '2 children clinging to submerged boulder, water rising 15cm/min',
    flightDistanceKm: 4.8,
    etaSeconds: 142, // ~2.3 mins!
    flightSpeedKmh: 76,
    altitudeM: 110,
    formation: 'V-Escort Rapid Insertion',
    payloads: [
      { id: 'DR-01', role: 'Scout/Thermal Relay', status: 'Airborne (En Route)', battery: 94, payload: 'FLIR Duo Pro R + 4K Laser Rangefinder' },
      { id: 'DR-02', role: 'Life Safety Cargo', status: 'Airborne (En Route)', battery: 91, payload: '2x Hydrostatic Self-Inflating Life Vests' },
      { id: 'DR-03', role: 'Trauma Delivery', status: 'Airborne (En Route)', battery: 89, payload: 'Hemostatic Gauze, Epinephrine, Hypothermia Blankets' }
    ]
  });

  const handleTriggerSwarm = () => {
    setSwarmTriggered(true);
    setLaunchTimer(0);
    const interval = setInterval(() => {
      setLaunchTimer(prev => {
        if (prev >= 142) {
          clearInterval(interval);
          return 142;
        }
        return prev + 6;
      });
    }, 400);
  };

  // -------------------------------------------------------------
  // TAB 2: WEB3 SPATIAL COMPUTING & AR "RESCUE HUD"
  // -------------------------------------------------------------
  const [arMode, setArMode] = useState('synthetic'); // 'synthetic' vs 'thermal'
  const [hudBearing, setHudBearing] = useState(48); // North-East
  const [hudDistanceM, setHudDistanceM] = useState(38);
  const [detectedVictimDepthM, setDetectedVictimDepthM] = useState(2.4);

  // Animate bearing / telemetry in HUD
  useEffect(() => {
    const t = setInterval(() => {
      setHudBearing(prev => (prev + (Math.random() - 0.5) * 1.5).toFixed(0));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // -------------------------------------------------------------
  // TAB 3: EDGE-AI ACOUSTIC "SCREAM & THUMP" LOCATION TRIANGULATION
  // -------------------------------------------------------------
  const [filterActive, setFilterActive] = useState(true);
  const [analyzingAcoustics, setAnalyzingAcoustics] = useState(false);
  const [acousticFix, setAcousticFix] = useState({
    confidenceScore: 96.8,
    classification: 'HUMAN_VOCAL_DISTRESS & RHYTHMIC_CONCRETE_THUMP',
    dominantFreqHz: 1840,
    monsoonRainNoiseDampedDb: -28,
    deltaT12_ms: 14.2, // Node 1 to Node 2 arrival delta
    deltaT13_ms: -8.7, // Node 1 to Node 3 arrival delta
    solvedDepthM: -1.85, // Subterranean depth under rubble
    surfaceX_m: 18.4,
    surfaceY_m: 24.1,
    nodes: [
      { id: 'NODE-01', name: 'Smart Solar Pole #14', lat: 28.0645, lng: 95.3310, gain: '34 dB' },
      { id: 'NODE-02', name: 'Search Drone Hover Mic #2', lat: 28.0652, lng: 95.3325, gain: '42 dB' },
      { id: 'NODE-03', name: 'Ground Geophone Spike #7', lat: 28.0638, lng: 95.3322, gain: '48 dB' }
    ]
  });

  const acousticCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = acousticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let tick = 0;

    const render = () => {
      ctx.fillStyle = '#070f1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      // Draw background raw monsoon pink noise if filter inactive
      if (!filterActive) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < w; x += 3) {
          const noise = (Math.random() - 0.5) * (h * 0.7);
          ctx.lineTo(x, midY + noise);
        }
        ctx.stroke();
      }

      // Draw isolated human scream waveform spike
      ctx.strokeStyle = filterActive ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < w; x += 2) {
        const pulse = Math.sin((x + tick * 4) * 0.08) * Math.cos(x * 0.02);
        const screamResonance = Math.sin((x + tick * 8) * 0.25) * Math.exp(-Math.pow((x - w * 0.5) / 60, 2));
        const amp = (pulse * 12 + screamResonance * 45);
        ctx.lineTo(x, midY + amp);
      }
      ctx.stroke();

      // Bandpass overlay lines (800Hz - 2500Hz)
      if (filterActive) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.fillRect(w * 0.25, 0, w * 0.5, h);
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(w * 0.25, 0, w * 0.5, h);
        ctx.setLineDash([]);
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [filterActive]);

  // -------------------------------------------------------------
  // TAB 4: LOW-EARTH ORBIT (LEO) DIRECT-TO-CELLULAR MICRO-DATA BRIDGE
  // -------------------------------------------------------------
  const [leoOrbiting, setLeoOrbiting] = useState(true);
  const [leoPassCountdownSec, setLeoPassCountdownSec] = useState(254); // 4m 14s
  const [uplinkSuccess, setUplinkSuccess] = useState(false);
  const [satelliteConstellation, setSatelliteConstellation] = useState({
    name: 'AST SpaceMobile BlueBird-1 & Starlink D2C-309',
    altitudeKm: 520,
    frequencyBand: 'Band 28 (700 MHz LTE Uplink)',
    dopplerShiftKhz: '+4.8 kHz',
    overheadDurationMin: '06m:12s',
    compressionProtocol: '12-Byte Binary Bitfield (Direct-to-LEO)',
    encodedHexPacket: '0x3F82C94A0E17BD9901C4'
  });

  const handleTransmitLEOPacket = () => {
    setUplinkSuccess(false);
    setTimeout(() => {
      setUplinkSuccess(true);
    }, 1200);
  };

  // -------------------------------------------------------------
  // TAB 5: PREDICTIVE "PRE-DEPLOYMENT" RELOCATION ENGINE
  // -------------------------------------------------------------
  const [predictiveTimeHours, setPredictiveTimeHours] = useState(2);
  const [isolationRiskPercent, setIsolationRiskPercent] = useState(91.4);
  const [preDeployedAssets, setPreDeployedAssets] = useState([
    {
      unit: 'NDRF 12th Battalion Swift Water Boat Unit #3',
      stagingPoint: 'Mawkdok Gorge Bridge Outer Perimeter',
      etaStagingMin: 14,
      status: 'STAGED_AT_PERIMETER',
      action: 'Ready to deploy before river level surges +3.4m'
    },
    {
      unit: 'Border Roads Organisation (BRO) Excavator Task Force #2',
      stagingPoint: 'NH-10 Milepost 32 North Abutment',
      etaStagingMin: 22,
      status: 'PRE_POSITIONED',
      action: 'Pre-positioned to clear debris within 10 minutes of initial slip'
    },
    {
      unit: 'Air Force Medical Evac ALH Dhruv #4',
      stagingPoint: 'Chabua Airbase Standby Helipad',
      etaStagingMin: 8,
      status: 'ENGINES_WARMING',
      action: 'Cleared for immediate aerial insertion upon road severance'
    }
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-full border border-rose-500/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> ZERO-HUMAN DELAY RESCUE PROTOCOLS
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/30">
                FUTURE-SCOPE AUTONOMY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Hyper-Speed Autonomous Rescue Suite
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-3xl">
              World-first disaster technologies slashing response times from hours to under 3 minutes via autonomous drone swarms, WebXR Spatial HUDs, acoustic scream depth triangulation, and Direct-to-LEO space packets.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
              <div>
                <div className="text-xs text-slate-400">Response Speed Target</div>
                <div className="text-xs font-bold text-rose-400">&lt; 3.0 Minutes (Automated)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-6">
          <button
            onClick={() => setActiveTab('swarm')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'swarm'
                ? 'bg-rose-950/50 border-rose-500 text-white shadow-lg shadow-rose-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Zap className={`w-5 h-5 flex-shrink-0 ${activeTab === 'swarm' ? 'text-rose-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Drone Swarms</div>
              <div className="text-[10px] text-slate-400">Zero-Human Latency</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('hud')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'hud'
                ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Eye className={`w-5 h-5 flex-shrink-0 ${activeTab === 'hud' ? 'text-cyan-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">WebXR Rescue HUD</div>
              <div className="text-[10px] text-slate-400">Spatial AR Vision</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('acoustic')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'acoustic'
                ? 'bg-amber-950/50 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Volume2 className={`w-5 h-5 flex-shrink-0 ${activeTab === 'acoustic' ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Acoustic Triangulation</div>
              <div className="text-[10px] text-slate-400">Scream & Thump TDOA</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('leo')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'leo'
                ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Satellite className={`w-5 h-5 flex-shrink-0 ${activeTab === 'leo' ? 'text-indigo-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">LEO Direct-to-Cell</div>
              <div className="text-[10px] text-slate-400">12-Byte Space Bridge</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('pre-deploy')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'pre-deploy'
                ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Clock className={`w-5 h-5 flex-shrink-0 ${activeTab === 'pre-deploy' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Pre-Deployment</div>
              <div className="text-[10px] text-slate-400">2-Hour Advance Staging</div>
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ========================================================= */}
        {/* TAB 1: AUTONOMOUS DRONE SWARM DISPATCH                     */}
        {/* ========================================================= */}
        {activeTab === 'swarm' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-rose-400" />
                    <h2 className="text-xl font-bold text-white">Autonomous Drone Swarm Dispatch Protocol (Zero-Human Latency)</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Direct server-event trigger auto-launches localized multi-rotor drone swarms from automated drone nests within 2.8 seconds of validated critical SOS.
                  </p>
                </div>

                {!swarmTriggered ? (
                  <button
                    onClick={handleTriggerSwarm}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all"
                  >
                    <Zap className="w-4 h-4" /> Simulate High-Priority SOS Ingestion
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-rose-950/60 border border-rose-500/40 px-4 py-2 rounded-xl">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
                    <span className="text-xs font-mono font-bold text-rose-300">
                      AUTONOMOUS SWARM AIRBORNE: T+{launchTimer}s
                    </span>
                  </div>
                )}
              </div>

              {/* Swarm Telemetry Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Swarm Mission Map & Flight Corridor */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Autonomous 3D Airspace Vectoring (V-Escort)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      Groundspeed: {swarmTelemetry.flightSpeedKmh} km/h • Alt: {swarmTelemetry.altitudeM}m AGL
                    </span>
                  </div>

                  {/* SVG Aerial Flight Path */}
                  <div className="relative w-full h-80 bg-[#070e1a] rounded-lg border border-slate-800 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 500 320">
                      {/* River gorge topography */}
                      <path d="M 40,320 Q 140,240 250,200 T 460,20" fill="none" stroke="#0369a1" strokeWidth="42" opacity="0.25" />
                      <path d="M 40,320 Q 140,240 250,200 T 460,20" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />

                      {/* Launch Nest: Pasighat Depot */}
                      <circle cx="70" cy="270" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
                      <circle cx="70" cy="270" r="4" fill="#38bdf8" />
                      <text x="90" y="270" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">Pasighat Automated Nest #2</text>

                      {/* Target Coordinates */}
                      <circle cx="420" cy="60" r="20" fill="rgba(244, 63, 94, 0.2)" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
                      <circle cx="420" cy="60" r="6" fill="#f43f5e" className="animate-ping" />
                      <text x="320" y="45" fill="#fda4af" fontSize="10" fontFamily="monospace" fontWeight="bold">TARGET: 28.0682°N, 95.3341°E</text>
                      <text x="340" y="60" fill="#94a3b8" fontSize="9" fontFamily="monospace">Submerged Boulder Zone</text>

                      {/* Swarm Flight Trajectory Line */}
                      <line x1="70" y1="270" x2="420" y2="60" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="6,4" />

                      {/* Swarm Positions along line */}
                      {swarmTriggered && (
                        <g transform={`translate(${70 + (420 - 70) * (launchTimer / 142)}, ${270 + (60 - 270) * (launchTimer / 142)})`}>
                          {/* Drone 1 Lead */}
                          <circle cx="0" cy="0" r="6" fill="#38bdf8" />
                          <polygon points="0,-12 4,0 -4,0" fill="#38bdf8" />
                          {/* Drone 2 Left Wing */}
                          <circle cx="-16" cy="12" r="5" fill="#f59e0b" />
                          {/* Drone 3 Right Wing */}
                          <circle cx="16" cy="12" r="5" fill="#10b981" />
                          <circle cx="0" cy="0" r="28" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
                        </g>
                      )}
                    </svg>

                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-300">
                      ETA to Drop-Point: <span className="text-rose-400 font-mono font-bold">{Math.max(0, swarmTelemetry.etaSeconds - launchTimer)} seconds</span>
                    </div>
                  </div>
                </div>

                {/* Right: Swarm Formation Roster & Payload Manifest */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                      <span>Airborne Swarm Manifest (3 Units)</span>
                      <span className="text-rose-400 font-mono">Zero-Human Auth</span>
                    </h3>

                    <div className="space-y-3">
                      {swarmTelemetry.payloads.map(drone => (
                        <div key={drone.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              {drone.id} • {drone.role}
                            </span>
                            <span className="text-emerald-400 font-mono">{drone.battery}% Wh</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Payload: <span className="text-slate-200">{drone.payload}</span>
                          </div>
                          <div className="text-[10px] text-rose-400 font-mono mt-1">
                            {drone.status}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                      <div className="text-slate-400 font-semibold mb-1">Triggering SOS Context:</div>
                      <div className="text-rose-300 font-medium text-[11px]">{swarmTelemetry.victimDescription}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Dispatched automatically via WebRTC Mesh / Audio FSK packet verification.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300">
                      ⚡ <strong>Human Latency Elimination:</strong> Traditional manual SAR dispatch time is 45–180 minutes. Automated swarm dispatch reached 100% velocity in <strong>2.8 seconds</strong>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: WEB3 SPATIAL COMPUTING & AR "RESCUE HUD"            */}
        {/* ========================================================= */}
        {activeTab === 'hud' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-xl font-bold text-white">WebXR Spatial Computing & AR "Rescue HUD"</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Mobile browser WebXR heads-up display overlaying safe navigation corridors, buried victim depth markers, and high-voltage hazard cones over physical disaster terrain.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setArMode('synthetic')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      arMode === 'synthetic' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Synthetic Terrain Mode
                  </button>
                  <button
                    onClick={() => setArMode('thermal')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      arMode === 'thermal' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    FLIR Thermal Overlay
                  </button>
                </div>
              </div>

              {/* Spatial AR Camera Feed Simulation */}
              <div className="relative w-full h-[420px] bg-slate-950 rounded-2xl border border-cyan-500/40 overflow-hidden shadow-2xl shadow-cyan-950/40">
                {/* Background Terrain Simulation (Night/Storm Debris) */}
                <div className={`w-full h-full transition-all duration-500 ${
                  arMode === 'thermal' ? 'bg-[#180424]' : 'bg-[#081220]'
                }`}>
                  {/* Digital Spatial Grid Lines */}
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:32px_32px]"></div>

                  {/* Synthetic HUD Reticle & Horizon Line */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-cyan-500/30 flex items-center justify-between px-6 pointer-events-none">
                    <span className="text-[10px] font-mono text-cyan-400">-10°</span>
                    <div className="w-16 h-16 border-2 border-cyan-400/40 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400">+10°</span>
                  </div>

                  {/* AR Spatial Element 1: Glowing Green Safe Traversal Path */}
                  <div className="absolute bottom-4 left-1/4 w-1/2 h-44 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 300 160">
                      <polygon points="120,160 180,160 160,20 140,20" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
                      <path d="M 150,160 L 150,30" stroke="#34d399" strokeWidth="2" strokeDasharray="6,4" />
                      <text x="100" y="80" fill="#a7f3d0" fontSize="10" fontFamily="monospace" fontWeight="bold">SAFE FOOTPATH (ZERO MUD LIQUEFACTION)</text>
                    </svg>
                  </div>

                  {/* AR Spatial Element 2: Buried Survivor X-Ray Cone */}
                  <div className="absolute top-24 right-1/4 flex flex-col items-center">
                    <div className="px-3 py-1.5 bg-rose-950/80 border border-rose-500 rounded-lg text-center backdrop-blur shadow-lg shadow-rose-950/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                        <Heart className="w-3.5 h-3.5 animate-pulse text-rose-500" /> BURIED SURVIVOR LOCATED
                      </div>
                      <div className="text-[10px] font-mono text-white mt-0.5">
                        Depth: <strong className="text-rose-300">-{detectedVictimDepthM}m under collapsed slab</strong>
                      </div>
                      <div className="text-[9px] text-slate-400">Heart Rate: 82 bpm • Temp: 34.8°C</div>
                    </div>
                    <div className="w-0.5 h-14 bg-gradient-to-b from-rose-500 to-transparent"></div>
                    <div className="w-8 h-8 rounded-full border border-rose-500 animate-ping"></div>
                  </div>

                  {/* AR Spatial Element 3: 11kV Hazard Warning */}
                  <div className="absolute top-16 left-12">
                    <div className="px-3 py-1.5 bg-amber-950/80 border border-amber-500 rounded-lg backdrop-blur flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                      <div>
                        <div className="text-[10px] font-bold text-amber-400">HAZARD: 11kV LIVE HANGING CABLE</div>
                        <div className="text-[9px] font-mono text-slate-300">Distance: 12.4m • High Arc Risk</div>
                      </div>
                    </div>
                  </div>

                  {/* HUD Top Status Bar */}
                  <div className="absolute top-4 inset-x-6 flex items-center justify-between text-xs font-mono text-cyan-300 pointer-events-none">
                    <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded border border-cyan-500/30">
                      <Compass className="w-4 h-4 text-cyan-400" /> BEARING: {hudBearing}° NE
                    </div>
                    <div className="bg-slate-900/90 px-3 py-1 rounded border border-cyan-500/30 text-white font-bold">
                      NDRF RESCUE WORKER HUD #04
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded border border-cyan-500/30">
                      <Radio className="w-4 h-4 text-emerald-400" /> SPATIAL ANCHOR: LOCKED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EDGE-AI ACOUSTIC "SCREAM & THUMP" TRIANGULATION     */}
        {/* ========================================================= */}
        {activeTab === 'acoustic' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-6 h-6 text-amber-400" />
                    <h2 className="text-xl font-bold text-white">Edge-AI Acoustic "Scream & Thump" Subterranean Triangulation</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Deep learning acoustic model separating human vocal screams (800–2500 Hz) and concrete pipe thumps from heavy monsoon pink noise, computing 3D depth coordinates via TDOA.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterActive(!filterActive)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      filterActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    {filterActive ? 'Neural Bandpass Active (800-2500Hz)' : 'Raw Noise Pass-Through'}
                  </button>
                </div>
              </div>

              {/* Acoustic Waveform & 3D Debris Cross-Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Waveform Canvas */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Multi-Node Geophone Acoustic Isolation Waveform
                    </span>
                    <span className="text-[11px] font-mono text-amber-400">
                      {filterActive ? 'Damping Monsoon Noise by -28 dB' : 'Raw 120mm/hr Rain Interference'}
                    </span>
                  </div>

                  <canvas
                    ref={acousticCanvasRef}
                    width={560}
                    height={160}
                    className="w-full h-40 rounded-lg border border-slate-800 bg-[#070f1e]"
                  />

                  {/* Geophone Nodes Telemetry */}
                  <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-mono">
                    {acousticFix.nodes.map(node => (
                      <div key={node.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-slate-400 text-[10px]">{node.name}</div>
                        <div className="text-white font-bold mt-1">Gain: {node.gain}</div>
                        <div className="text-[10px] text-emerald-400">Arrival Sync: ±0.4μs</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Solved 3D Subterranean Depth */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                      <span>Solved Subterranean Triangulation</span>
                      <span className="text-emerald-400 font-mono">Confidence: {acousticFix.confidenceScore}%</span>
                    </h3>

                    <div className="space-y-3">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Detected Acoustic Pattern</div>
                        <div className="text-xs font-bold text-amber-300 mt-0.5">{acousticFix.classification}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">Resonant Peak: {acousticFix.dominantFreqHz} Hz</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-400">Subterranean Depth (Z)</div>
                          <div className="text-lg font-mono font-bold text-rose-400">{acousticFix.solvedDepthM} m</div>
                          <div className="text-[9px] text-slate-500">Under compacted schist/mud</div>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-400">Surface Offset (X, Y)</div>
                          <div className="text-sm font-mono font-bold text-white mt-1">
                            +{acousticFix.surfaceX_m}m, +{acousticFix.surfaceY_m}m
                          </div>
                          <div className="text-[9px] text-slate-500">From Smart Pole #14 Base</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" /> Beam Exact Digging Coordinates to Excavator Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LOW-EARTH ORBIT (LEO) DIRECT-TO-CELLULAR BRIDGE      */}
        {/* ========================================================= */}
        {activeTab === 'leo' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Satellite className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-xl font-bold text-white">Low-Earth Orbit (LEO) Direct-to-Cellular Micro-Data Bridge</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Bypasses dead terrestrial cell grids by transmitting an ultra-compact 12-byte binary packet directly from consumer LTE antennas to overhead LEO satellites.
                  </p>
                </div>

                <button
                  onClick={handleTransmitLEOPacket}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-950/50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Push 12-Byte Emergency Packet to LEO Orbit
                </button>
              </div>

              {/* Satellite Pass Tracker & Bitfield Structure */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Orbit Pass Status */}
                <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      LEO Satellite Constellation Line-of-Sight
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded font-mono border border-indigo-500/30">
                      ORBITING 520 KM AGL
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Constellation:</span>
                      <span className="font-bold text-white">{satelliteConstellation.name}</span>
                    </div>

                    <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Carrier Bandwidth:</span>
                      <span className="font-mono text-indigo-400">{satelliteConstellation.frequencyBand}</span>
                    </div>

                    <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Doppler Compensation:</span>
                      <span className="font-mono text-emerald-400">{satelliteConstellation.dopplerShiftKhz}</span>
                    </div>

                    <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Overhead Pass Window Remaining:</span>
                      <span className="font-mono font-bold text-amber-400">{satelliteConstellation.overheadDurationMin}</span>
                    </div>
                  </div>

                  {uplinkSuccess && (
                    <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <div className="text-xs text-emerald-300 font-medium">
                        Direct-to-LEO uplink verified by Space Station Ground Node #8. Elevated to Tier-1 Rescue Priority.
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: 12-Byte Binary Packet Architecture */}
                <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    12-Byte Ultra-Dense Bitfield Structure
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px]">
                      <div className="text-slate-400 mb-1">Encoded Hex Micro-Packet:</div>
                      <div className="text-indigo-400 font-bold break-all bg-slate-950 p-2 rounded border border-slate-800">
                        {satelliteConstellation.encodedHexPacket}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-300">
                        Bits 0–23: Latitude (24-bit fixed point)
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-300">
                        Bits 24–47: Longitude (24-bit fixed point)
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-300">
                        Bits 48–51: Triage Code (4-bit START)
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-300">
                        Bits 52–55: Device Battery (4-bit quant)
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2">
                      💡 Designed to be received by low-SNR phased array satellite antennas even during heavy monsoon rain fade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PREDICTIVE "PRE-DEPLOYMENT" RELOCATION ENGINE         */}
        {/* ========================================================= */}
        {activeTab === 'pre-deploy' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">Predictive "Pre-Deployment" Relocation Engine</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Fuses Doppler radar, soil saturation metrics, and road bottleneck graphs to predict community isolation 2 hours in advance, auto-dispatching evacuation orders and staging rescue fleets prior to catastrophe.
                  </p>
                </div>

                <div className="bg-emerald-950/60 border border-emerald-500/40 px-4 py-2 rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-white">
                    Isolation Probability: {isolationRiskPercent}% in {predictiveTimeHours}h
                  </span>
                </div>
              </div>

              {/* Pre-Deployed Assets Manifest */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pre-Emptively Positioned Rescue Units (Zero Waiting Time)
                </h3>

                {preDeployedAssets.map(asset => (
                  <div key={asset.unit} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{asset.unit}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-mono font-bold border border-emerald-500/30">
                            {asset.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {asset.stagingPoint}
                        </div>
                        <div className="text-xs text-emerald-300/90 font-medium mt-1">
                          Action: {asset.action}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono text-slate-400">Staging Arrival:</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">{asset.etaStagingMin} mins prior to road cutoff</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
