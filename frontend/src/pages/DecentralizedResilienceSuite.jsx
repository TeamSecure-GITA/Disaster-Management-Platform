import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Radio, Activity, Globe, Eye, ShieldAlert, 
  Send, RefreshCw, Play, Square, CheckCircle, AlertTriangle, 
  MapPin, Heart, Zap, Sliders, ArrowUpRight, Clock, Sparkles, 
  Database, Network, Cpu, Layers, HardDrive, Share2, Compass, 
  Waves, Lock, Fingerprint, Users
} from 'lucide-react';

export default function DecentralizedResilienceSuite() {
  const [activeTab, setActiveTab] = useState('ultrasonic');

  // -------------------------------------------------------------
  // TAB 1: ULTRASONIC "CHIRP" MESH MULTI-HOP RELAY
  // -------------------------------------------------------------
  const [audioMode, setAudioMode] = useState('ultrasonic'); // 'ultrasonic' (19.2 kHz) vs 'diagnostic' (2.4 kHz)
  const [isRelaying, setIsRelaying] = useState(false);
  const [activeHop, setActiveHop] = useState(0); // 0 to 3
  const [hopNodes, setHopNodes] = useState([
    {
      id: 'NODE-0',
      role: 'Trapped Survivor (Originator)',
      device: 'Redmi 9 (Low-End Android)',
      lat: 28.0642,
      lng: 95.3318,
      location: 'Submerged Siang Gorge Pocket A',
      status: 'TRANSMITTING',
      hopIndex: 0,
      bloodGroup: 'O-Negative',
      triage: 'CRITICAL_BLEEDING',
      snrDb: '+22 dB'
    },
    {
      id: 'NODE-1',
      role: 'Valley Relay Repeater #1',
      device: 'Samsung M12 (Villager on Ridge)',
      lat: 28.0710,
      lng: 95.3340,
      location: 'Pangin Ridge Trail',
      status: 'REPEATER_ACTIVE',
      hopIndex: 1,
      bloodGroup: 'O-Negative',
      triage: 'RELAYED',
      snrDb: '+18 dB'
    },
    {
      id: 'NODE-2',
      role: 'Valley Relay Repeater #2',
      device: 'JioPhone 4G (High Mountain Pass)',
      lat: 28.0820,
      lng: 95.3385,
      location: 'Yembung Bamboo Outpost',
      status: 'REPEATER_ACTIVE',
      hopIndex: 2,
      bloodGroup: 'O-Negative',
      triage: 'RELAYED',
      snrDb: '+14 dB'
    },
    {
      id: 'NODE-3',
      role: 'Disaster Gateway Base (Uplink)',
      device: 'SDRF Central Solar Terminal',
      lat: 28.0950,
      lng: 95.3420,
      location: 'Pasighat Emergency HQ',
      status: 'INTERNET_SYNC_SUCCESS',
      hopIndex: 3,
      bloodGroup: 'O-Negative',
      triage: 'DISPATCHED_TO_NDRF',
      snrDb: '+26 dB'
    }
  ]);

  const audioCanvasRef = useRef(null);
  const audioContextRef = useRef(null);

  // Play synthetic acoustic audio chirp
  const handleStartHopRelay = () => {
    if (isRelaying) return;
    setIsRelaying(true);
    setActiveHop(0);

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        // Multi-hop tone burst frequencies
        const baseFreq = audioMode === 'ultrasonic' ? 19200 : 2400;
        const freqs = [baseFreq, baseFreq + 350, baseFreq - 200, baseFreq + 600];

        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.4);
          gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.4);
          gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + idx * 0.4 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.4 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.4);
          osc.stop(ctx.currentTime + idx * 0.4 + 0.38);
        });
      }
    } catch (e) {
      console.warn("Web Audio Synthesis fallback:", e);
    }

    // Step through the 3-hop acoustic repeaters
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setActiveHop(current);
      if (current >= 3) {
        clearInterval(interval);
        setTimeout(() => setIsRelaying(false), 800);
      }
    }, 1100);
  };

  // Waterfall canvas animation
  useEffect(() => {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const render = () => {
      ctx.fillStyle = '#060d19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bands = 32;
      const w = canvas.width / bands;
      for (let i = 0; i < bands; i++) {
        const isCarrier = (i > 12 && i < 20);
        const noise = Math.sin(t * 0.08 + i * 0.3) * 0.25 + 0.25;
        const amp = isRelaying ? (isCarrier ? 0.92 : noise * 0.4) : noise * 0.2;
        const h = amp * (canvas.height * 0.8);

        const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - h);
        if (isRelaying) {
          grad.addColorStop(0, '#10b981');
          grad.addColorStop(1, '#06b6d4');
        } else {
          grad.addColorStop(0, '#1e293b');
          grad.addColorStop(1, '#3b82f6');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(i * w + 1.5, canvas.height - h, w - 3, h);
      }

      t++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRelaying]);

  // -------------------------------------------------------------
  // TAB 2: TERRESTRIAL FM/AM RADIO WEB-TRIANGULATION
  // -------------------------------------------------------------
  const [radioTowers, setRadioTowers] = useState([
    { id: 'AIR-ITANAGAR', name: 'AIR Itanagar (Prasar Bharati)', freq: '100.1 MHz', powerKw: 50, lat: 27.0844, lng: 93.6053, rssi: -72, solvedDistKm: 34.2 },
    { id: 'AIR-DIBRUGARH', name: 'AIR Dibrugarh Super-Station', freq: '101.3 MHz', powerKw: 100, lat: 27.4728, lng: 94.9120, rssi: -66, solvedDistKm: 28.5 },
    { id: 'AIR-PASIGHAT', name: 'AIR Pasighat Valley Repeater', freq: '102.5 MHz', powerKw: 10, lat: 28.0664, lng: 95.3262, rssi: -54, solvedDistKm: 14.8 }
  ]);
  const [triangulating, setTriangulating] = useState(false);
  const [solvedRadioCoord, setSolvedRadioCoord] = useState({
    lat: 28.0645,
    lng: 95.3312,
    accuracyM: 32,
    confidence: 95.4,
    status: 'TRIANGULATED_OFFLINE',
    gorgeShadowDampening: '1,400m Vertical Canyon (0 GPS Satellites Reached)'
  });

  const handleRecalculateRadioGPS = () => {
    setTriangulating(true);
    setTimeout(() => {
      setTriangulating(false);
      setSolvedRadioCoord(prev => ({
        ...prev,
        lat: Number((28.0645 + (Math.random() - 0.5) * 0.0015).toFixed(4)),
        lng: Number((95.3312 + (Math.random() - 0.5) * 0.0015).toFixed(4)),
        accuracyM: Math.floor(28 + Math.random() * 10),
        confidence: Number((94 + Math.random() * 5).toFixed(1))
      }));
    }, 1100);
  };

  // -------------------------------------------------------------
  // TAB 3: WEBHID BIO-SENSING & CAMERA PPG TRIAGE HEATMAP
  // -------------------------------------------------------------
  const [ppgScanning, setPpgScanning] = useState(false);
  const [scannedHeartRate, setScannedHeartRate] = useState(138);
  const [scannedSpo2, setScannedSpo2] = useState(82);
  const [triageFilter, setTriageFilter] = useState('ALL'); // 'ALL', 'RED', 'YELLOW', 'GREEN'
  const [triagePatients, setTriagePatients] = useState([
    {
      id: 'PT-101',
      name: 'Rongsen Ao (Age 58)',
      location: 'Mawlynnong Sector 4 Debris',
      hr: 146,
      spo2: 79,
      shockG: 5.2,
      status: 'RED_CRITICAL',
      condition: 'Acute Crush Syndrome & River Surge Hypothermia',
      priorityRank: 1
    },
    {
      id: 'PT-102',
      name: 'Chinglen Meitei (Age 32)',
      location: 'Loktak Lake Perimeter Ridge',
      hr: 112,
      spo2: 91,
      shockG: 1.4,
      status: 'YELLOW_STABLE',
      condition: 'Compound Tibial Fracture, Conscious, Alert',
      priorityRank: 2
    },
    {
      id: 'PT-103',
      name: 'Grace Lalremruati (Age 24)',
      location: 'Aizawl Upper High School Camp',
      hr: 72,
      spo2: 98,
      shockG: 0.1,
      status: 'GREEN_SAFE',
      condition: 'Normal vitals, Minor laceration on right forearm',
      priorityRank: 3
    }
  ]);

  const handleSimulateCameraPPG = () => {
    setPpgScanning(true);
    setTimeout(() => {
      setPpgScanning(false);
      const newHr = Math.floor(74 + Math.random() * 65);
      const newSpo2 = Math.floor(82 + Math.random() * 16);
      setScannedHeartRate(newHr);
      setScannedSpo2(newSpo2);
    }, 1400);
  };

  // -------------------------------------------------------------
  // TAB 4: IPFS-BASED DECENTRALIZED DISASTER WEB-MIRRORING
  // -------------------------------------------------------------
  const [ipfsPeers, setIpfsPeers] = useState(42);
  const [resilienceScore, setResilienceScore] = useState(99.4);
  const [pinnedSizeMb, setPinnedSizeMb] = useState(18.4);
  const [simulatedSpike, setSimulatedSpike] = useState(false);
  const [ipfsCIDs, setIpfsCIDs] = useState([
    { name: 'Core Disaster App Bundle (JS/WASM)', cid: 'QmZtmD2qtQgR9z58YJ6vM3qX7Y9n8p4u1r6w5v3s2t1', size: '6.4 MB', peersHolding: 42 },
    { name: 'Offline Vector Terrain Map (Northeast India)', cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco', size: '9.2 MB', peersHolding: 38 },
    { name: 'Indigenous Language Translation Models', cid: 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR', size: '2.8 MB', peersHolding: 41 }
  ]);

  const handleTriggerPanicSpike = () => {
    setSimulatedSpike(true);
    setIpfsPeers(prev => prev + 128);
    setResilienceScore(99.99);
    setTimeout(() => {
      setSimulatedSpike(false);
    }, 3000);
  };

  // -------------------------------------------------------------
  // TAB 5: SYNTHETIC APERTURE RADAR (SAR) RAW DATA RENDER ENGINE
  // -------------------------------------------------------------
  const [radarThresholdDb, setRadarThresholdDb] = useState(-18); // dB
  const [polarization, setPolarization] = useState('VV'); // 'VV' vs 'VH'
  const [satelliteSource, setSatelliteSource] = useState('Sentinel-1 C-Band (5.405 GHz)');
  const [breachCount, setBreachCount] = useState(3);

  const sarCanvasRef = useRef(null);

  // Render WebGL / Canvas Microwave Radar Specular Bounce
  useEffect(() => {
    const canvas = sarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let sweep = 0;

    const render = () => {
      ctx.fillStyle = '#060f1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Draw simulated synthetic aperture radar raster scanlines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Brahmaputra River Basin Swelling (Specular Radar Bounce: Dark = Water, Bright = Rough Terrain)
      // Water absorbs/reflects microwave away from sensor -> low backscatter (-22 dB to -16 dB)
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      ctx.bezierCurveTo(w * 0.3, h * 0.25, w * 0.6, h * 0.65, w, h * 0.35);
      ctx.lineTo(w, h * 0.65);
      ctx.bezierCurveTo(w * 0.6, h * 0.85, w * 0.3, h * 0.55, 0, h * 0.7);
      ctx.closePath();
      ctx.fill();

      // Breached flood zones (expanding over sandbars & villages)
      ctx.fillStyle = 'rgba(14, 165, 233, 0.5)';
      ctx.beginPath();
      ctx.arc(w * 0.38, h * 0.42, 45, 0, Math.PI * 2); // Majuli Island breach
      ctx.arc(w * 0.68, h * 0.58, 38, 0, Math.PI * 2); // Kaziranga lowlands breach
      ctx.fill();

      // Breach alert markers
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(w * 0.38, h * 0.42, 6, 0, Math.PI * 2);
      ctx.arc(w * 0.68, h * 0.58, 6, 0, Math.PI * 2);
      ctx.fill();

      // SAR Radar Sweep Beam
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sweepX = (sweep % (w + 40)) - 20;
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, h);
      ctx.stroke();

      sweep += 3;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [radarThresholdDb, polarization]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-xs font-bold rounded-full border border-violet-500/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> DECENTRALIZED & ZERO-INFRASTRUCTURE RESILIENT
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                P2P MULTI-HOP ENABLED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Decentralized Resilience & SAR Radar Suite
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-3xl">
              World-first disaster technologies eliminating centralized single-points-of-failure: multi-hop sound-wave relays, satellite-free radio GPS, WebHID triage heatmaps, un-crashable IPFS web-mirroring, and raw WebGL SAR radar mapping.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse"></div>
              <div>
                <div className="text-xs text-slate-400">IPFS Mesh Swarm</div>
                <div className="text-xs font-bold text-violet-300">{ipfsPeers} Active Seeding Nodes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-6">
          <button
            onClick={() => setActiveTab('ultrasonic')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'ultrasonic'
                ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Volume2 className={`w-5 h-5 flex-shrink-0 ${activeTab === 'ultrasonic' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Ultrasonic Mesh</div>
              <div className="text-[10px] text-slate-400">Sound-Wave Multi-Hop</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('radio')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'radio'
                ? 'bg-sky-950/50 border-sky-500 text-white shadow-lg shadow-sky-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Radio className={`w-5 h-5 flex-shrink-0 ${activeTab === 'radio' ? 'text-sky-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Radio Web-GPS</div>
              <div className="text-[10px] text-slate-400">Terrestrial AIR Triangulation</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('triage')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'triage'
                ? 'bg-rose-950/50 border-rose-500 text-white shadow-lg shadow-rose-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className={`w-5 h-5 flex-shrink-0 ${activeTab === 'triage' ? 'text-rose-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">WebHID Triage Map</div>
              <div className="text-[10px] text-slate-400">Camera PPG Vitals</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('ipfs')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'ipfs'
                ? 'bg-violet-950/50 border-violet-500 text-white shadow-lg shadow-violet-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Network className={`w-5 h-5 flex-shrink-0 ${activeTab === 'ipfs' ? 'text-violet-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">IPFS Web-Mirror</div>
              <div className="text-[10px] text-slate-400">Un-Crashable P2P Swarm</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('sar')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'sar'
                ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Waves className={`w-5 h-5 flex-shrink-0 ${activeTab === 'sar' ? 'text-cyan-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">SAR Radar WebGL</div>
              <div className="text-[10px] text-slate-400">Cloud-Piercing Flood Engine</div>
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ========================================================= */}
        {/* TAB 1: ULTRASONIC "CHIRP" MESH MULTI-HOP RELAY            */}
        {/* ========================================================= */}
        {activeTab === 'ultrasonic' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">Ultrasonic "Chirp" Multi-Hop Sound-Wave Relay</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Bypasses dead Bluetooth and RF interference. Trapped victims emit an ultrasonic audio chirp; nearby phones act as physical audio repeaters, bouncing the beacon across the valley to an internet gateway.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setAudioMode('ultrasonic')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      audioMode === 'ultrasonic' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Silent Ultrasonic (19.2 kHz)
                  </button>
                  <button
                    onClick={() => setAudioMode('diagnostic')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      audioMode === 'diagnostic' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Audible FSK (2.4 kHz)
                  </button>
                </div>
              </div>

              {/* Multi-Hop Relay Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: 4-Node Valley Relay Chain */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Physical Sound-Wave Relay Chain (Valley Path)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      Carrier: {audioMode === 'ultrasonic' ? '19.2 kHz Inaudible' : '2.4 kHz FSK'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {hopNodes.map((node, idx) => (
                      <div
                        key={node.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          activeHop === idx
                            ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/40'
                            : activeHop > idx
                            ? 'bg-slate-900/90 border-slate-700'
                            : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              activeHop === idx ? 'bg-emerald-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-300'
                            }`}>
                              H#{node.hopIndex}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                {node.role}
                                <span className="text-[10px] font-mono text-slate-400 font-normal">({node.device})</span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{node.location}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              node.status.includes('SUCCESS') || node.status.includes('DISPATCHED')
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-sky-500/20 text-sky-400'
                            }`}>
                              {node.status}
                            </span>
                            <div className="text-[10px] font-mono text-slate-500 mt-1">SNR: {node.snrDb}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Waterfall Spectrogram */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                      <span>Live Microphone Acoustic Waterfall FFT</span>
                      <span className="text-emerald-400 font-mono">Store-and-Forward Mesh Active</span>
                    </div>
                    <canvas
                      ref={audioCanvasRef}
                      width={560}
                      height={90}
                      className="w-full h-24 rounded-lg border border-slate-800 bg-[#060d19]"
                    />
                  </div>
                </div>

                {/* Right: Trigger & Payload Architecture */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Acoustic SOS Packet Bitstream
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="text-slate-400 mb-1">Encoded Audio Token:</div>
                        <div className="font-mono text-emerald-400 font-bold break-all bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
                          CHIRP-SOS#BLOOD:O_NEG#GPS:28.064,95.331#TRIAGE:CRITICAL_BLEEDING#HOP:0
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-400">Victim Blood Group:</span>
                          <div className="font-bold text-rose-400 mt-0.5">O-Negative</div>
                        </div>
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-400">Medical Need:</span>
                          <div className="font-bold text-amber-400 mt-0.5">Hemostatic Trauma Kit</div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                        💡 <strong>Physical Sound Repeater Concept:</strong> When phones receive this sound packet, they save it locally, increment the hop counter, and automatically emit the audio forward to the next device.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button
                      onClick={handleStartHopRelay}
                      disabled={isRelaying}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
                    >
                      <Volume2 className="w-4 h-4" />
                      {isRelaying ? 'Bouncing Sound-Wave Across Valley...' : 'Simulate Ultrasonic 3-Hop Valley Relay'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TERRESTRIAL FM/AM RADIO WEB-TRIANGULATION           */}
        {/* ========================================================= */}
        {activeTab === 'radio' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-6 h-6 text-sky-400" />
                    <h2 className="text-xl font-bold text-white">Terrestrial FM/AM Radio Web-Triangulation (Satellite-Free GPS)</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Calculates exact geographic coordinates inside GPS-blind mountain canyons using hardware radio signal attenuation from pre-cached All India Radio (AIR) towers.
                  </p>
                </div>

                <button
                  onClick={handleRecalculateRadioGPS}
                  disabled={triangulating}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-950/50 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${triangulating ? 'animate-spin' : ''}`} />
                  {triangulating ? 'Solving Nonlinear Radio Arcs...' : 'Recalculate Radio Position'}
                </button>
              </div>

              {/* Trilateration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Pre-Cached Transmitter Registry */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Pre-Cached Regional Prasar Bharati Transmitters
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded font-mono border border-rose-500/30">
                      SATELLITE GPS BLIND (0/12 LOCKED)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {radioTowers.map(tower => (
                      <div key={tower.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-white flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-sky-400" /> {tower.name}
                          </span>
                          <span className="font-mono text-sky-400 font-bold">{tower.rssi} dBm</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span>Freq: {tower.freq} • Power: {tower.powerKw} kW</span>
                          <span className="font-mono text-slate-300">Solved Distance: ~{tower.solvedDistKm} km</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                    📐 <strong>Logarithmic Attenuation Model:</strong> Solves $PL(d) = PL(d_0) + 10n \log_{10}(d/d_0)$ using hardware RSSI feedback from the device's FM chip web receiver.
                  </div>
                </div>

                {/* Right: Solved Coordinate Card */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                      <span>Radio-Triangulated Fix</span>
                      <span className="text-emerald-400 font-mono">Confidence: {solvedRadioCoord.confidence}%</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Latitude</div>
                        <div className="text-base font-mono font-bold text-white">{solvedRadioCoord.lat}° N</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Longitude</div>
                        <div className="text-base font-mono font-bold text-white">{solvedRadioCoord.lng}° E</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">RF Uncertainty Margin</div>
                        <div className="text-base font-mono font-bold text-emerald-400">±{solvedRadioCoord.accuracyM} meters</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Environment</div>
                        <div className="text-xs font-bold text-slate-300 mt-1">Deep Siang Gorge</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                      <div>Terrain Shadowing:</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">{solvedRadioCoord.gorgeShadowDampening}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" /> Export Triangulated Fix to Offline Vector Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: WEBHID BIO-SENSING & CAMERA PPG TRIAGE HEATMAP      */}
        {/* ========================================================= */}
        {activeTab === 'triage' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-rose-400" />
                    <h2 className="text-xl font-bold text-white">WebHID Bio-Sensing & Camera PPG Triage Priority Heatmaps</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Direct WebHID wearable integration and phone camera photoplethysmography (PPG) pulse scanning to sort victims on command heatmaps by physiological urgency.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulateCameraPPG}
                    disabled={ppgScanning}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50"
                  >
                    <Fingerprint className={`w-4 h-4 ${ppgScanning ? 'animate-pulse' : ''}`} />
                    {ppgScanning ? 'Scanning Finger Pulse...' : 'Test Camera PPG Pulse Scan'}
                  </button>
                </div>
              </div>

              {/* Triage Protocol Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Triage List & Scanner Feedback */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Live Biometric Triage Queue (START Protocol)
                    </span>
                    <span className="text-[11px] font-mono text-rose-400">
                      Sorted by Physiological Risk
                    </span>
                  </div>

                  <div className="space-y-3">
                    {triagePatients.map(pt => (
                      <div
                        key={pt.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          pt.status === 'RED_CRITICAL'
                            ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/40'
                            : pt.status === 'YELLOW_STABLE'
                            ? 'bg-amber-950/40 border-amber-500/40'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{pt.name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                pt.status.includes('RED') ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {pt.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{pt.location}</div>
                            <div className="text-xs text-rose-300 font-medium mt-1">⚠️ {pt.condition}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center font-mono">
                            <div>
                              <div className="text-[9px] text-slate-400">HR</div>
                              <div className="text-xs font-bold text-white">{pt.hr} bpm</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-400">SpO2</div>
                              <div className={`text-xs font-bold ${pt.spo2 < 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {pt.spo2}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Camera PPG Optical Feedback */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                      <span>Camera Lens Photoplethysmography (PPG)</span>
                      <span className="text-emerald-400 font-mono">WebHID Ready</span>
                    </h3>

                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                      <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 mx-auto flex items-center justify-center mb-3">
                        <Heart className={`w-8 h-8 text-rose-500 ${ppgScanning ? 'animate-ping' : ''}`} />
                      </div>

                      <div className="text-xs text-slate-300 font-bold">
                        {ppgScanning ? 'Analyzing Capillary Absorption...' : 'Scanned Vital Telemetry'}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3 font-mono">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-400">Heart Rate</div>
                          <div className="text-base font-bold text-white">{scannedHeartRate} bpm</div>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-400">Oxygen (SpO2)</div>
                          <div className={`text-base font-bold ${scannedSpo2 < 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {scannedSpo2}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3">
                      💡 Measures micro-vascular blood volume changes using the device camera LED flash directly through the skin with zero external hardware.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Elevate Patient to Master Triage Map Top Priority
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: IPFS-BASED DECENTRALIZED DISASTER WEB-MIRRORING     */}
        {/* ========================================================= */}
        {activeTab === 'ipfs' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Network className="w-6 h-6 text-violet-400" />
                    <h2 className="text-xl font-bold text-white">IPFS Decentralized Disaster Web-Mirroring</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Peer-to-peer browser hosting on the InterPlanetary File System. Every citizen who opens the portal seeds it to nearby peers, making the website completely immune to server crashes during mass panic.
                  </p>
                </div>

                <button
                  onClick={handleTriggerPanicSpike}
                  disabled={simulatedSpike}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-violet-950/50 transition-all disabled:opacity-50"
                >
                  <Users className="w-3.5 h-3.5" />
                  {simulatedSpike ? 'Swarm Expanding...' : 'Simulate 10,000 Panicking Citizens'}
                </button>
              </div>

              {/* IPFS Node Swarm Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Swarm Stats & CID Registry */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Content-Addressed Disaster Assets (IPFS DHT)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      Seeding Active ({pinnedSizeMb} MB)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {ipfsCIDs.map(item => (
                      <div key={item.cid} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-white">{item.name}</span>
                          <span className="text-emerald-400 font-mono">{item.peersHolding} Seeders</span>
                        </div>
                        <div className="font-mono text-[10px] text-violet-400 break-all bg-slate-950 p-2 rounded border border-slate-800 mt-1.5">
                          {item.cid}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2">
                          <span>Size: {item.size}</span>
                          <span className="text-emerald-400">100% Pinned Locally</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Inverse Load Scaling Metrics */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Inverse Scaling Telemetry
                    </h3>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Connected P2P Peers:</span>
                        <span className="text-lg font-bold text-violet-400">{ipfsPeers}</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Uptime / Resilience Index:</span>
                        <span className="text-lg font-bold text-emerald-400">{resilienceScore}%</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Central Server Dependency:</span>
                        <span className="text-sm font-bold text-emerald-400">0.0% (Decentralized)</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-violet-950/40 border border-violet-500/30 rounded-lg text-[11px] text-violet-200">
                      ⚡ <strong>Inverse Load Scaling:</strong> Traditional central government websites crash under sudden high traffic. On IPFS, each new visitor acts as a seed node, making the network faster and more resilient.
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" /> Export Offline PWA Mirror Bundle to USB / SD Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SYNTHETIC APERTURE RADAR (SAR) RAW DATA RENDER      */}
        {/* ========================================================= */}
        {activeTab === 'sar' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Waves className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-xl font-bold text-white">Synthetic Aperture Radar (SAR) Raw Data Render Engine</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Client-side WebGL radar engine rendering raw microwave backscatter from Sentinel-1 and NISAR to reveal expanding river floodzones through impenetrable monsoon cloud cover.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setPolarization('VV')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      polarization === 'VV' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    VV Polarization (Water Boundary)
                  </button>
                  <button
                    onClick={() => setPolarization('VH')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      polarization === 'VH' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    VH Polarization (Urban Roughness)
                  </button>
                </div>
              </div>

              {/* WebGL Canvas & Backscatter Sliders */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: WebGL Radar Backscatter Canvas */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Live Microwave Specular Backscatter Scan (Brahmaputra Basin)
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded font-mono border border-cyan-500/30">
                      100% CLOUD-PIERCING RADAR
                    </span>
                  </div>

                  <canvas
                    ref={sarCanvasRef}
                    width={560}
                    height={220}
                    className="w-full h-56 rounded-lg border border-slate-800 bg-[#060f1e]"
                  />

                  {/* Embankment Breach Telemetry */}
                  <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-mono">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Water Backscatter</div>
                      <div className="text-sm font-bold text-cyan-400 mt-0.5">-22.4 dB (Specular)</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Identified Breaches</div>
                      <div className="text-sm font-bold text-rose-400 mt-0.5">{breachCount} Active Breaches</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">River Surge Level</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">+4.8m Above Danger</div>
                    </div>
                  </div>
                </div>

                {/* Right: Radar Controls */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" /> Radar Parameter Tuning
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Water Threshold Cutoff</span>
                          <span className="font-mono text-cyan-400 font-bold">{radarThresholdDb} dB</span>
                        </div>
                        <input
                          type="range"
                          min="-30"
                          max="-10"
                          value={radarThresholdDb}
                          onChange={e => setRadarThresholdDb(Number(e.target.value))}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Radar Satellite Constellation</label>
                        <select
                          value={satelliteSource}
                          onChange={e => setSatelliteSource(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="Sentinel-1 C-Band (5.405 GHz)">Sentinel-1 C-Band (5.405 GHz, ESA)</option>
                          <option value="ISRO-NASA NISAR L-Band (1.25 GHz)">ISRO-NASA NISAR L-Band (1.25 GHz)</option>
                        </select>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                        🛰️ <strong>Why SAR Succeeds When Google Maps Fails:</strong> Optical satellites capture visible light and are rendered 100% blind by heavy monsoon clouds. SAR emits its own microwave pulse that penetrates straight through clouds, rain, and darkness.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                      <Waves className="w-4 h-4" /> Overlay Radar Water Boundaries on Master Evacuation Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
