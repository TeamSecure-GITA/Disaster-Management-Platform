import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Radio, Activity, Mountain, Trees, ShieldAlert, 
  Send, RefreshCw, Play, Square, CheckCircle, AlertTriangle, 
  WifiOff, MapPin, Heart, Zap, Download, Eye, Compass, 
  Layers, ChevronRight, Cpu, ArrowUpRight, Clock, Info, 
  Sparkles, Sliders, ExternalLink, Award, FileText
} from 'lucide-react';

export default function WorldFirstInnovationsSuite() {
  const [activeTab, setActiveTab] = useState('chirp');

  // -------------------------------------------------------------
  // TAB 1: "SOUND-WAVE" DATA TRANSFER (CHIRP PROTOCOL)
  // -------------------------------------------------------------
  const [chirpMode, setChirpMode] = useState('audible'); // 'audible' (1.8 - 3.6 kHz) vs 'ultrasonic' (18.5 - 19.8 kHz)
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isReceiving, setIsReceiving] = useState(true);
  const [chirpProgress, setChirpProgress] = useState(0);
  const [receivedPackets, setReceivedPackets] = useState([
    {
      id: 'PKT-9421',
      timestamp: '2 mins ago',
      source: 'Survivor Phone #18 (Redmi 9)',
      lat: 28.0642,
      lng: 95.3318,
      locationName: 'Siang River Gorge, East Siang, Arunachal',
      status: 'CRITICAL_TRAPPED',
      survivors: 3,
      medicalNeed: 'Crush injury & blood loss',
      rssi: -48,
      frequencyBand: '18.92 kHz (Near-Ultrasonic)',
      relayed: false
    },
    {
      id: 'PKT-9418',
      timestamp: '14 mins ago',
      source: 'JioPhone 4G (Feature Phone)',
      lat: 28.1180,
      lng: 95.2954,
      locationName: 'Pangin Footbridge East, Upper Siang',
      status: 'HYPOTHERMIA_ALERT',
      survivors: 5,
      medicalNeed: 'Thermal blankets, baby oral rehydration',
      rssi: -62,
      frequencyBand: '2.4 kHz (Acoustic FSK)',
      relayed: true
    }
  ]);
  const [outboundSOS, setOutboundSOS] = useState({
    callsign: 'VICTIM-RIDGE-4',
    lat: 28.0721,
    lng: 95.3250,
    emergencyType: 'RIDGE_STRANDED',
    peopleCount: 4,
    batteryPercent: 18,
    medicalUrgency: 'HIGH'
  });

  const spectrogramCanvasRef = useRef(null);
  const audioContextRef = useRef(null);

  // Animate spectrogram visualization for receiving audio
  useEffect(() => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let offset = 0;

    const render = () => {
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waterfall spectrogram lines
      const bands = 28;
      const colWidth = canvas.width / bands;
      for (let i = 0; i < bands; i++) {
        const freqLabel = chirpMode === 'audible' ? (1800 + i * 70) : (18000 + i * 70);
        const isActive = isTransmitting && (i % 4 === Math.floor((offset / 6) % 4));
        const noise = Math.sin(offset * 0.05 + i * 0.4) * 0.3 + 0.35;
        const amplitude = isActive ? 0.95 : (isReceiving ? noise : 0.08);

        const h = amplitude * (canvas.height * 0.75);
        const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - h);
        if (isActive) {
          grad.addColorStop(0, '#10b981');
          grad.addColorStop(1, '#06b6d4');
        } else {
          grad.addColorStop(0, '#1e293b');
          grad.addColorStop(1, '#0284c7');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(i * colWidth + 2, canvas.height - h, colWidth - 4, h);
      }

      // Draw horizontal baseline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 1);
      ctx.lineTo(canvas.width, canvas.height - 1);
      ctx.stroke();

      offset++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [chirpMode, isTransmitting, isReceiving]);

  // Handle acoustic transmission via Web Audio API
  const handleTransmitChirp = () => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    setChirpProgress(0);

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        // Generate FSK multi-tone chirp
        const freqs = chirpMode === 'audible' 
          ? [1900, 2400, 2900, 3400, 2200, 3100] 
          : [18200, 18600, 19100, 19500, 18800, 19300];

        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.35);

          // Tone envelope
          gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.35);
          gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.35 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.35 + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.35);
          osc.stop(ctx.currentTime + idx * 0.35 + 0.32);
        });
      }
    } catch (e) {
      console.warn("Web Audio API synthesis fallback:", e);
    }

    // Interval to show progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 12;
      setChirpProgress(Math.min(prog, 100));
      if (prog >= 100) {
        clearInterval(interval);
        setIsTransmitting(false);

        // Add newly transmitted packet to local buffer
        const newPkt = {
          id: `PKT-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: 'Just now',
          source: `This Device (${outboundSOS.callsign})`,
          lat: outboundSOS.lat,
          lng: outboundSOS.lng,
          locationName: 'Pangin Ridge Sector 3, Upper Siang',
          status: outboundSOS.emergencyType,
          survivors: outboundSOS.peopleCount,
          medicalNeed: outboundSOS.medicalUrgency === 'HIGH' ? 'Critical trauma kit required' : 'Basic shelter & food',
          rssi: -32,
          frequencyBand: chirpMode === 'audible' ? '2.4 kHz (Audible FSK)' : '18.9 kHz (Near-Ultrasonic)',
          relayed: false
        };
        setReceivedPackets(prev => [newPkt, ...prev]);
      }
    }, 250);
  };

  // -------------------------------------------------------------
  // TAB 2: REVERSE GPS TRIANGULATION (FM/AM RADIO WAVES)
  // -------------------------------------------------------------
  const [towers, setTowers] = useState([
    { id: 'AIR-ITANAGAR', name: 'AIR Itanagar (Prasar Bharati)', freq: '100.1 MHz', txKw: 50, lat: 27.0844, lng: 93.6053, rssi: -74, distKm: 34.2 },
    { id: 'AIR-DIBRUGARH', name: 'AIR Dibrugarh Super-Transmitter', freq: '101.3 MHz', txKw: 100, lat: 27.4728, lng: 94.9120, rssi: -68, distKm: 28.5 },
    { id: 'AIR-PASIGHAT', name: 'AIR Pasighat Valley Repeater', freq: '102.5 MHz', txKw: 10, lat: 28.0664, lng: 95.3262, rssi: -56, distKm: 14.8 }
  ]);
  const [triangulating, setTriangulating] = useState(false);
  const [triangulatedCoord, setTriangulatedCoord] = useState({
    lat: 28.0648,
    lng: 95.3312,
    accuracyMeters: 38,
    elevationEstM: 420,
    confidencePercent: 94.2,
    lastCalculated: '10 seconds ago',
    gorgeShadowFactor: 'Severe (1,200m Cliff Shadowing, Zero GPS Satellite Lock)'
  });

  const handleRecalculateReverseGPS = () => {
    setTriangulating(true);
    setTimeout(() => {
      setTriangulating(false);
      setTriangulatedCoord(prev => ({
        ...prev,
        lat: Number((28.0645 + (Math.random() - 0.5) * 0.002).toFixed(4)),
        lng: Number((95.3310 + (Math.random() - 0.5) * 0.002).toFixed(4)),
        accuracyMeters: Math.floor(30 + Math.random() * 15),
        confidencePercent: Number((93 + Math.random() * 5).toFixed(1)),
        lastCalculated: 'Just now'
      }));
    }, 1200);
  };

  // -------------------------------------------------------------
  // TAB 3: BIO-SENSING "CITIZEN VITALS" CROWD-MAP
  // -------------------------------------------------------------
  const [wearableConnected, setWearableConnected] = useState(true);
  const [deviceModel, setDeviceModel] = useState('PulseGuard BLE V4.2 (WebHID Compatible)');
  const [vitalsList, setVitalsList] = useState([
    {
      id: 'CIT-702',
      name: 'Pema Dorjee (Age 64)',
      location: 'Subansiri Mudslide Pocket A',
      hr: 142,
      spo2: 81,
      temp: 33.8, // Severe Hypothermia
      impactG: 4.8,
      status: 'RED_IMMEDIATE',
      condition: 'Severe Hypothermia & Suspected Pneumothorax from River Surge',
      priorityRank: 1,
      lastReading: '4s ago'
    },
    {
      id: 'CIT-814',
      name: 'Sunita Hazarika (Age 28)',
      location: 'Majuli Embankment Break Sector 2',
      hr: 118,
      spo2: 89,
      temp: 35.2,
      impactG: 1.2,
      status: 'YELLOW_DELAYED',
      condition: 'Mild Hypothermia, Exhaustion, Fracture Right Ankle',
      priorityRank: 2,
      lastReading: '12s ago'
    },
    {
      id: 'CIT-903',
      name: 'Tsering Wangchu (Age 35)',
      location: 'Tawang Ridge Shelter #3',
      hr: 74,
      spo2: 98,
      temp: 36.8,
      impactG: 0.2,
      status: 'GREEN_MINOR',
      condition: 'Stable Vitals, Minor abrasions, Fully ambulatory',
      priorityRank: 3,
      lastReading: '1m ago'
    }
  ]);

  // Simulate continuous vitals fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setVitalsList(prev => prev.map(v => {
        if (v.status === 'RED_IMMEDIATE') {
          const deltaHr = Math.floor((Math.random() - 0.5) * 4);
          const deltaSpo2 = Math.floor((Math.random() - 0.5) * 2);
          return {
            ...v,
            hr: Math.min(Math.max(v.hr + deltaHr, 136), 154),
            spo2: Math.min(Math.max(v.spo2 + deltaSpo2, 78), 85),
            lastReading: '2s ago'
          };
        }
        return v;
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // -------------------------------------------------------------
  // TAB 4: SUB-SURFACE FLUID DYNAMICS MUDSLIDE PREDICTOR
  // -------------------------------------------------------------
  const [rainfallRate, setRainfallRate] = useState(82); // mm/hr
  const [soilType, setSoilType] = useState('weathered-phyllite'); // Weathered phyllite / Himalayan mica schist
  const [slopeAngle, setSlopeAngle] = useState(48); // degrees
  const [soilSaturation, setSoilSaturation] = useState(94); // %
  const [porePressureKpa, setPorePressureKpa] = useState(142); // kPa
  const [factorOfSafety, setFactorOfSafety] = useState(0.88); // FS < 1.0 indicates imminent failure
  const [closureWindowMin, setClosureWindowMin] = useState(18); // minutes remaining

  const fluidCanvasRef = useRef(null);

  // Recalculate geotechnical metrics whenever sliders change
  useEffect(() => {
    const effectiveNormalStress = 260 - (rainfallRate * 1.6);
    const porePressure = Math.round(50 + (rainfallRate * 1.1) + (soilSaturation * 0.4));
    setPorePressureKpa(porePressure);

    const cohesion = soilType === 'weathered-phyllite' ? 18 : 26;
    const phi = 31 * (Math.PI / 180);
    const shearStress = 160 * Math.sin(slopeAngle * (Math.PI / 180));
    const shearStrength = cohesion + Math.max(0, effectiveNormalStress - porePressure * 0.45) * Math.tan(phi);
    const fs = Number(Math.max(0.45, Math.min(2.5, shearStrength / shearStress)).toFixed(2));
    setFactorOfSafety(fs);

    if (fs < 1.0) {
      setClosureWindowMin(Math.max(6, Math.round(30 * (fs / 1.0))));
    } else {
      setClosureWindowMin(null);
    }
  }, [rainfallRate, soilType, slopeAngle, soilSaturation]);

  // Render 3D-like Volumetric Soil Cross-Section
  useEffect(() => {
    const canvas = fluidCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Draw mountain slope profile
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Layer 1: Solid Bedrock
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, h);
      ctx.lineTo(w, h * 0.6);
      ctx.lineTo(0, h * 0.85);
      ctx.closePath();
      ctx.fill();

      // Layer 2: Weathered Phyllite / Schist Interlayer
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.85);
      ctx.lineTo(w, h * 0.6);
      ctx.lineTo(w, h * 0.35);
      ctx.lineTo(0, h * 0.65);
      ctx.closePath();
      ctx.fill();

      // Layer 3: Saturated Pore-Water Liquefaction Zone
      const waterTableLevel = h * (0.65 - (soilSaturation / 100) * 0.3);
      const isUnstable = factorOfSafety < 1.0;
      const waterGrad = ctx.createLinearGradient(0, waterTableLevel, 0, h);
      if (isUnstable) {
        waterGrad.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
        waterGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.6)');
        waterGrad.addColorStop(1, 'rgba(30, 41, 59, 0.9)');
      } else {
        waterGrad.addColorStop(0, 'rgba(14, 165, 233, 0.75)');
        waterGrad.addColorStop(1, 'rgba(30, 41, 59, 0.9)');
      }

      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.moveTo(0, waterTableLevel + Math.sin(t * 0.05) * 4);
      ctx.lineTo(w, waterTableLevel - h * 0.25 + Math.cos(t * 0.05) * 4);
      ctx.lineTo(w, h * 0.6);
      ctx.lineTo(0, h * 0.85);
      ctx.closePath();
      ctx.fill();

      // Layer 4: Topsoil & Roadbed
      ctx.strokeStyle = isUnstable ? '#ef4444' : '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      ctx.lineTo(w * 0.55, h * 0.32);
      ctx.lineTo(w, h * 0.15);
      ctx.stroke();

      // Highway strip at slope midpoint (e.g. NH-10 KM 34.2)
      const roadX = w * 0.48;
      const roadY = h * 0.35;
      ctx.fillStyle = isUnstable ? '#dc2626' : '#64748b';
      ctx.fillRect(roadX - 25, roadY - 8, 50, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('NH-10 KM 34.2', roadX - 22, roadY + 4);

      // If unstable, render slip arrows and debris vectors
      if (isUnstable) {
        ctx.strokeStyle = '#fee2e2';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const arrowX = roadX - 40 + i * 35;
          const arrowY = roadY + 20 + i * 15;
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(arrowX - 18, arrowY + 12);
          ctx.stroke();
        }
      }

      t++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [soilSaturation, factorOfSafety]);

  // -------------------------------------------------------------
  // TAB 5: INDIGENOUS ROOT-BRIDGE & LIVING INFRASTRUCTURE LEDGER
  // -------------------------------------------------------------
  const [selectedBridge, setSelectedBridge] = useState({
    id: 'JR-NONGRIAT-01',
    name: 'Umshiang Double Decker Living Root Bridge (Jingkieng Jri)',
    region: 'Nongriat Village, East Khasi Hills, Meghalaya',
    species: 'Ficus elastica (Indian Rubber Fig)',
    ageYears: 240,
    spanLengthM: 32.4,
    currentSagAngleDeg: 13.8,
    nominalSagAngleDeg: 8.5,
    vineTensionRatio: 0.81,
    currentFootwayWearPercent: 68,
    maxSafeCapacitySouls: 8,
    maxSafePayloadKg: 640,
    monsoonStatus: 'HIGH_STRESS_ACTIVE_SURGE',
    qrToken: 'QR-MEGHALAYA-ROOT-7819',
    lastInspectedBy: 'Bah Kyrshanlang Lyngdoh (Village Headman)',
    lastInspectedTime: 'Today, 06:30 AM'
  });

  const [bridgeLedger, setBridgeLedger] = useState([
    {
      txHash: '0x8f2d...c419',
      date: '2026-09-12',
      event: 'Monsoon Flash Surge Stress Test',
      details: 'River level rose 3.2m touching lower root span. Catenary sag increased by +2.1°. Max human crossing restricted to 4 persons.',
      verifiedBy: 'Seng Samla Nongriat Council',
      status: 'VERIFIED'
    },
    {
      txHash: '0x3a7e...e901',
      date: '2026-07-24',
      event: 'Traditional Root Braiding & Betel Trunk Training',
      details: 'Wove 12 new secondary feeder aerial roots across eastern abutment to reinforce shear resistance.',
      verifiedBy: 'Meghalaya Bio-Engineering Heritage Trust',
      status: 'COMPLETED'
    },
    {
      txHash: '0x1b4c...982f',
      date: '2026-05-18',
      event: 'Pre-Monsoon Timber Decking Replacement',
      details: 'Replaced rotted bamboo slats along walking channel with seasoned Areca catechu trunks.',
      verifiedBy: 'Cherrapunji Eco-Restoration Group',
      status: 'COMPLETED'
    }
  ]);

  const [analyzingScan, setAnalyzingScan] = useState(false);
  const handleSimulateQRScan = () => {
    setAnalyzingScan(true);
    setTimeout(() => {
      setAnalyzingScan(false);
      setSelectedBridge(prev => ({
        ...prev,
        currentSagAngleDeg: Number((13.2 + (Math.random() - 0.5) * 1.5).toFixed(1)),
        vineTensionRatio: Number((0.78 + (Math.random() - 0.5) * 0.08).toFixed(2)),
        maxSafeCapacitySouls: Math.floor(7 + Math.random() * 3),
        lastInspectedTime: 'Just now (Mobile CV Scan)'
      }));
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> WORLD-FIRST RESCUE PROTOCOLS
              </span>
              <span className="px-3 py-1 bg-sky-500/20 text-sky-400 text-xs font-bold rounded-full border border-sky-500/30">
                ZERO-INFRASTRUCTURE RESILIENT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Deep-Tech Autonomous Disaster Suite
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-3xl">
              Breakthrough survival technologies solving total cellular blackout, GPS gorge blindness, triage prioritization, sub-surface mountain liquefaction, and indigenous natural infrastructure protection.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <div className="text-xs text-slate-400">Offline PWA Engine</div>
                <div className="text-xs font-bold text-slate-200">Autonomous Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-6">
          <button
            onClick={() => setActiveTab('chirp')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'chirp'
                ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Volume2 className={`w-5 h-5 flex-shrink-0 ${activeTab === 'chirp' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Sound-Wave Chirp</div>
              <div className="text-[10px] text-slate-400">Acoustic SOS Modem</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('reverse-gps')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'reverse-gps'
                ? 'bg-sky-950/50 border-sky-500 text-white shadow-lg shadow-sky-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Radio className={`w-5 h-5 flex-shrink-0 ${activeTab === 'reverse-gps' ? 'text-sky-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Reverse GPS Radio</div>
              <div className="text-[10px] text-slate-400">FM/AM Gorge Trilateration</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'vitals'
                ? 'bg-rose-950/50 border-rose-500 text-white shadow-lg shadow-rose-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className={`w-5 h-5 flex-shrink-0 ${activeTab === 'vitals' ? 'text-rose-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Citizen Vitals Map</div>
              <div className="text-[10px] text-slate-400">WebHID Triage Mesh</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('mudslide')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'mudslide'
                ? 'bg-amber-950/50 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Mountain className={`w-5 h-5 flex-shrink-0 ${activeTab === 'mudslide' ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Fluid Mudslide AI</div>
              <div className="text-[10px] text-slate-400">Pore Pressure WASM</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('root-bridge')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'root-bridge'
                ? 'bg-teal-950/50 border-teal-500 text-white shadow-lg shadow-teal-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Trees className={`w-5 h-5 flex-shrink-0 ${activeTab === 'root-bridge' ? 'text-teal-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Living Root Bridges</div>
              <div className="text-[10px] text-slate-400">Bio-Structural Ledger</div>
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ========================================================= */}
        {/* TAB 1: SOUND-WAVE DATA TRANSFER (CHIRP PROTOCOL)           */}
        {/* ========================================================= */}
        {activeTab === 'chirp' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">Acoustic Chirp Modem (Screen-to-Screen Over Sound)</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Transmits encrypted GPS, medical triage, and emergency status over audible or near-ultrasonic frequencies directly to any smartphone microphone without cellular, Wi-Fi, or Bluetooth.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setChirpMode('audible')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      chirpMode === 'audible' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Audible FSK (1.8 - 3.4 kHz)
                  </button>
                  <button
                    onClick={() => setChirpMode('ultrasonic')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      chirpMode === 'ultrasonic' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Silent Ultrasonic (18.5 - 19.8 kHz)
                  </button>
                </div>
              </div>

              {/* Grid of Visualizer & Transmitter */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Spectrogram & Receiver */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                      <span className="text-xs font-mono font-bold text-slate-300">Live Microphone Waterfall FFT Spectrogram</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Bandwidth: {chirpMode === 'audible' ? '1,800 - 3,600 Hz' : '18,200 - 19,800 Hz'}
                    </span>
                  </div>

                  <canvas
                    ref={spectrogramCanvasRef}
                    width={560}
                    height={160}
                    className="w-full h-40 rounded-lg border border-slate-800 bg-[#060d17]"
                  />

                  {/* Incoming Packets Queue */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Acoustically Ingested SOS Beacons ({receivedPackets.length})
                      </h4>
                      <span className="text-[11px] text-emerald-400 font-mono">Store-and-Forward Mesh Active</span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {receivedPackets.map(pkt => (
                        <div key={pkt.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-white">{pkt.id}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  pkt.status.includes('CRITICAL') ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {pkt.status}
                                </span>
                                <span className="text-[10px] text-slate-500">{pkt.timestamp}</span>
                              </div>
                              <div className="text-xs text-slate-300 mt-1 font-medium">{pkt.locationName}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                GPS: <span className="font-mono text-slate-300">{pkt.lat}°N, {pkt.lng}°E</span> • {pkt.survivors} souls • Need: {pkt.medicalNeed}
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end">
                              <span className="text-[10px] font-mono text-emerald-400">{pkt.frequencyBand}</span>
                              <span className="text-[10px] text-slate-500 mt-1">RSSI: {pkt.rssi} dBm</span>
                              {pkt.relayed ? (
                                <span className="mt-1 text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                  <CheckCircle className="w-3 h-3" /> Relayed
                                </span>
                              ) : (
                                <span className="mt-1 text-[10px] text-sky-400 flex items-center gap-1 font-semibold">
                                  <RefreshCw className="w-3 h-3 animate-spin" /> In P2P Cache
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Acoustic SOS Broadcaster */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Send className="w-4 h-4 text-emerald-400" /> Chirp Audio Transmitter
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-mono">
                        Ready To Broadcast
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Local Device Callsign</label>
                        <input
                          type="text"
                          value={outboundSOS.callsign}
                          onChange={e => setOutboundSOS({...outboundSOS, callsign: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-1">Trapped Count</label>
                          <input
                            type="number"
                            value={outboundSOS.peopleCount}
                            onChange={e => setOutboundSOS({...outboundSOS, peopleCount: Number(e.target.value)})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Medical Urgency</label>
                          <select
                            value={outboundSOS.medicalUrgency}
                            onChange={e => setOutboundSOS({...outboundSOS, medicalUrgency: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          >
                            <option value="CRITICAL">CRITICAL (Immediate)</option>
                            <option value="HIGH">HIGH (Trauma/Wound)</option>
                            <option value="MODERATE">MODERATE (Debris)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Emergency Nature</label>
                        <select
                          value={outboundSOS.emergencyType}
                          onChange={e => setOutboundSOS({...outboundSOS, emergencyType: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="RIDGE_STRANDED">Ridge Stranded (Bridge Washed Away)</option>
                          <option value="MUDSLIDE_TRAPPED">Buried Under Secondary Slip</option>
                          <option value="FLASH_FLOOD_ISOLATED">Surrounded by Rising Flash Flood</option>
                        </select>
                      </div>

                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                        <div className="flex justify-between mb-1">
                          <span>Encoded Data Payload:</span>
                          <span className="text-emerald-400 font-mono">128-bit CRC Protected</span>
                        </div>
                        <div className="font-mono text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-800 text-[10px]">
                          CHIRP::SOS#{outboundSOS.callsign}#{outboundSOS.lat},{outboundSOS.lng}#P{outboundSOS.peopleCount}#U:{outboundSOS.medicalUrgency}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Broadcast Trigger */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    {isTransmitting ? (
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-mono">
                          <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Emitting Sound Chirp...
                          </span>
                          <span className="text-slate-400">{chirpProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-200" style={{ width: `${chirpProgress}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleTransmitChirp}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all text-sm"
                      >
                        <Volume2 className="w-4 h-4" /> Emit Acoustic Chirp SOS Beep
                      </button>
                    )}
                    <p className="text-[10px] text-slate-500 text-center mt-2">
                      Emits acoustic frequencies through phone speaker. Any device with our PWA running nearby will decode it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: REVERSE GPS TRIANGULATION (FM/AM RADIO WAVES)       */}
        {/* ========================================================= */}
        {activeTab === 'reverse-gps' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-6 h-6 text-sky-400" />
                    <h2 className="text-xl font-bold text-white">Reverse GPS via Terrestrial FM/AM Radio Towers</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Triangulates location in GPS-denied Himalayan ravines by analyzing signal attenuation (RSSI) from high-power Prasar Bharati (All India Radio) transmitters.
                  </p>
                </div>

                <button
                  onClick={handleRecalculateReverseGPS}
                  disabled={triangulating}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-2 text-xs transition-all shadow-lg shadow-sky-950/50 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${triangulating ? 'animate-spin' : ''}`} />
                  {triangulating ? 'Triangulating Radio Waves...' : 'Recalculate Radio Position'}
                </button>
              </div>

              {/* Trilateration Visualizer & Towers */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Trilateration Map Canvas */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Nonlinear Trilateration Intersection Model
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded font-mono border border-rose-500/30">
                      GPS SATELLITE BLIND: 0/12 LOCKED
                    </span>
                  </div>

                  {/* SVG Map of Terrestrial Towers and Trilateration Arcs */}
                  <div className="relative w-full h-80 bg-[#060e1a] rounded-lg border border-slate-800 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 500 320">
                      {/* Gorge mountain contour lines */}
                      <path d="M 0,40 Q 150,120 280,30 T 500,80" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3,3" />
                      <path d="M 0,160 Q 200,240 320,180 T 500,220" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3,3" />
                      <path d="M 0,260 Q 160,200 360,300 T 500,280" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3,3" />

                      {/* Tower 1: AIR Itanagar (Top Left) */}
                      <circle cx="90" cy="80" r="140" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
                      <circle cx="90" cy="80" r="6" fill="#0284c7" />
                      <text x="105" y="75" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">AIR Itanagar (100.1 MHz)</text>
                      <text x="105" y="90" fill="#94a3b8" fontSize="9" fontFamily="monospace">Dist: 34.2 km</text>

                      {/* Tower 2: AIR Dibrugarh (Bottom Right) */}
                      <circle cx="410" cy="240" r="170" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
                      <circle cx="410" cy="240" r="6" fill="#0284c7" />
                      <text x="310" y="260" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">AIR Dibrugarh (101.3 MHz)</text>
                      <text x="340" y="275" fill="#94a3b8" fontSize="9" fontFamily="monospace">Dist: 28.5 km</text>

                      {/* Tower 3: AIR Pasighat (Top Right) */}
                      <circle cx="340" cy="70" r="110" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
                      <circle cx="340" cy="70" r="6" fill="#0284c7" />
                      <text x="355" y="65" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">AIR Pasighat (102.5 MHz)</text>
                      <text x="355" y="80" fill="#94a3b8" fontSize="9" fontFamily="monospace">Dist: 14.8 km</text>

                      {/* Triangulation Intersection Solution (User Position) */}
                      <circle cx="245" cy="148" r="28" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2,2" />
                      <circle cx="245" cy="148" r="7" fill="#10b981" className="animate-pulse" />
                      <circle cx="245" cy="148" r="3" fill="#ffffff" />
                      
                      <rect x="180" y="185" width="130" height="34" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                      <text x="190" y="200" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">SOLVED LOCATION</text>
                      <text x="190" y="213" fill="#cbd5e1" fontSize="9" fontFamily="monospace">28.0648°N, 95.3312°E</text>
                    </svg>

                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400">
                      Topographic Gorge: <span className="text-white font-bold">Siang Canyon, Sector 4</span> (No SAT line-of-sight)
                    </div>
                  </div>
                </div>

                {/* Right: Calculated Coordinate & Radio RSSI Telemetry */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-400" /> Radio-Triangulated Fix
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Latitude</div>
                        <div className="text-base font-mono font-bold text-white">{triangulatedCoord.lat}° N</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Longitude</div>
                        <div className="text-base font-mono font-bold text-white">{triangulatedCoord.lng}° E</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">RF Accuracy Error</div>
                        <div className="text-base font-mono font-bold text-emerald-400">±{triangulatedCoord.accuracyMeters} m</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Confidence Score</div>
                        <div className="text-base font-mono font-bold text-sky-400">{triangulatedCoord.confidencePercent}%</div>
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                      <div className="text-slate-400">Terrain Obstruction:</div>
                      <div className="text-slate-200 font-medium mt-0.5">{triangulatedCoord.gorgeShadowFactor}</div>
                    </div>
                  </div>

                  {/* Active Radio Station Transmitters */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      AIR Terrestrial Transmitters ({towers.length})
                    </h3>
                    <div className="space-y-2">
                      {towers.map(t => (
                        <div key={t.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-200">{t.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{t.freq} • Power: {t.txKw} kW</div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-sky-400 font-bold">{t.rssi} dBm</div>
                            <div className="text-[10px] text-slate-500">~{t.distKm} km</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BIO-SENSING "CITIZEN VITALS" CROWD-MAP               */}
        {/* ========================================================= */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-rose-400" />
                    <h2 className="text-xl font-bold text-white">Bio-Sensing Vitals Crowd-Map & START Triage</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Streams live biometric telemetry (SpO2, Heart Rate, G-force impact, Body Temperature) from wearables via WebHID and automatically ranks survivors by medical criticality.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-400 font-mono">WebHID Device:</span>
                    <span className="text-white font-bold font-mono">{deviceModel}</span>
                  </div>
                </div>
              </div>

              {/* Triage Protocol Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-rose-950/40 border border-rose-600/40 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400">RED: IMMEDIATE</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  </div>
                  <div className="text-xl font-black text-white mt-1">1 Critical</div>
                  <div className="text-[10px] text-rose-300/80 mt-0.5">SpO2 &lt; 85% or Shock Dip</div>
                </div>

                <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">YELLOW: DELAYED</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  </div>
                  <div className="text-xl font-black text-white mt-1">1 Urgent</div>
                  <div className="text-[10px] text-amber-300/80 mt-0.5">Stable vitals with trauma</div>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">GREEN: MINOR</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="text-xl font-black text-white mt-1">1 Ambulatory</div>
                  <div className="text-[10px] text-emerald-300/80 mt-0.5">Normal SpO2 & Heart Rate</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">BLACK: EXPECTANT</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                  </div>
                  <div className="text-xl font-black text-white mt-1">0 Fatalities</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Zero cardiac pulse</div>
                </div>
              </div>

              {/* Citizen Vitals List with Live Telemetry */}
              <div className="space-y-4">
                {vitalsList.map(victim => (
                  <div
                    key={victim.id}
                    className={`bg-slate-950 border rounded-xl p-4 transition-all ${
                      victim.status === 'RED_IMMEDIATE'
                        ? 'border-rose-500/60 shadow-lg shadow-rose-950/30'
                        : victim.status === 'YELLOW_DELAYED'
                        ? 'border-amber-500/40'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Victim Bio & Diagnostic */}
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          victim.status === 'RED_IMMEDIATE'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : victim.status === 'YELLOW_DELAYED'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-500 text-slate-950'
                        }`}>
                          #{victim.priorityRank}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{victim.name}</span>
                            <span className="text-xs font-mono text-slate-400">({victim.id})</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              victim.status === 'RED_IMMEDIATE' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {victim.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-500" /> {victim.location}
                          </div>
                          <div className="text-xs text-rose-300 font-medium mt-1">
                            ⚠️ {victim.condition}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Live Biometric Metrics */}
                      <div className="grid grid-cols-4 gap-2 sm:gap-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <div className="text-center">
                          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Heart className="w-3 h-3 text-rose-400" /> HR
                          </div>
                          <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                            {victim.hr} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-[10px] text-slate-400">SpO2</div>
                          <div className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${
                            victim.spo2 < 85 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                          }`}>
                            {victim.spo2}%
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-[10px] text-slate-400">Temp</div>
                          <div className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${
                            victim.temp < 35 ? 'text-cyan-400' : 'text-white'
                          }`}>
                            {victim.temp}°C
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-[10px] text-slate-400">G-Impact</div>
                          <div className="text-sm sm:text-base font-bold font-mono text-slate-200 mt-0.5">
                            {victim.impactG}g
                          </div>
                        </div>
                      </div>

                      {/* Right: Dispatch Button */}
                      <div className="flex items-center gap-2">
                        {victim.status === 'RED_IMMEDIATE' && (
                          <button className="w-full lg:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40">
                            <AlertTriangle className="w-3.5 h-3.5" /> Dispatch Paramedic Heli #1
                          </button>
                        )}
                        {victim.status === 'YELLOW_DELAYED' && (
                          <button className="w-full lg:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5">
                            Queue NDRF Boat Team
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SUB-SURFACE FLUID DYNAMICS MUDSLIDE PREDICTOR       */}
        {/* ========================================================= */}
        {activeTab === 'mudslide' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Mountain className="w-6 h-6 text-amber-400" />
                    <h2 className="text-xl font-bold text-white">Sub-Surface Fluid Dynamics Mudslide Predictor</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Client-side WebAssembly geotechnical simulation modeling soil-water pore pressure accumulation and slope shear failure before the mountain collapses.
                  </p>
                </div>

                {closureWindowMin && (
                  <div className="bg-rose-950/60 border border-rose-500/50 px-4 py-2 rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-rose-400 animate-pulse" />
                    <div>
                      <div className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">Predictive Closure Alert</div>
                      <div className="text-xs font-mono font-bold text-white">
                        {closureWindowMin} Mins to Slope Shear Failure
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation Canvas & Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Volumetric Soil Profile Canvas */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      3D Geotechnical Sub-Surface Infiltration Profile
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                      factorOfSafety < 1.0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      Safety Factor (FS): {factorOfSafety} {factorOfSafety < 1.0 ? 'FAILED' : 'STABLE'}
                    </span>
                  </div>

                  <canvas
                    ref={fluidCanvasRef}
                    width={560}
                    height={220}
                    className="w-full h-56 rounded-lg border border-slate-800 bg-[#0b1324]"
                  />

                  {/* Geotechnical Calculations Matrix */}
                  <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-mono">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Pore Pressure (u)</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">{porePressureKpa} kPa</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Soil Saturation</div>
                      <div className="text-sm font-bold text-cyan-400 mt-0.5">{soilSaturation}%</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Bishop FS Equation</div>
                      <div className="text-sm font-bold text-white mt-0.5">{factorOfSafety} &lt; 1.0 = SLIP</div>
                    </div>
                  </div>
                </div>

                {/* Right: Simulation Sliders */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" /> Dynamic Environmental Parameters
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Monsoon Cloudburst Rainfall Rate</span>
                          <span className="font-mono text-amber-400 font-bold">{rainfallRate} mm/hr</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="140"
                          value={rainfallRate}
                          onChange={e => setRainfallRate(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Mountain Slope Incline Angle</span>
                          <span className="font-mono text-amber-400 font-bold">{slopeAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="65"
                          value={slopeAngle}
                          onChange={e => setSlopeAngle(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Deep TDR Soil Moisture Saturation</span>
                          <span className="font-mono text-cyan-400 font-bold">{soilSaturation}%</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="100"
                          value={soilSaturation}
                          onChange={e => setSoilSaturation(Number(e.target.value))}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Lithological Soil Stratum</label>
                        <select
                          value={soilType}
                          onChange={e => setSoilType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="weathered-phyllite">Weathered Phyllite & Mica Schist (High Fragility)</option>
                          <option value="compact-gneiss">Precambrian Granite Gneiss (Medium Stability)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setRainfallRate(110);
                        setSoilSaturation(98);
                        setSlopeAngle(54);
                      }}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5" /> Simulate 100-Year Cloudburst Deluge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: INDIGENOUS ROOT-BRIDGE & LIVING INFRASTRUCTURE LEDGER*/}
        {/* ========================================================= */}
        {activeTab === 'root-bridge' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Trees className="w-6 h-6 text-teal-400" />
                    <h2 className="text-xl font-bold text-white">Living Root Bridge (Jingkieng Jri) Health Ledger</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Computer vision and crowdsourced tensile strain analysis for Meghalaya's indigenous living root bridges and tribal bamboo suspension lifelines.
                  </p>
                </div>

                <button
                  onClick={handleSimulateQRScan}
                  disabled={analyzingScan}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-2 text-xs transition-all shadow-lg shadow-teal-950/50 disabled:opacity-50"
                >
                  <Cpu className={`w-3.5 h-3.5 ${analyzingScan ? 'animate-spin' : ''}`} />
                  {analyzingScan ? 'Running CV Tensor Analysis...' : 'Simulate Bridge QR Scan'}
                </button>
              </div>

              {/* Grid of Structural Inspection & Blockchain Ledger */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Bridge Structural Metrics & Load Limit */}
                <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded font-mono border border-teal-500/30">
                        {selectedBridge.qrToken}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{selectedBridge.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedBridge.region}</p>
                    </div>
                  </div>

                  {/* Structural Health Gauges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Tree Species</div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5">{selectedBridge.species}</div>
                      <div className="text-[10px] text-slate-500">{selectedBridge.ageYears} yrs old</div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Catenary Sag Angle</div>
                      <div className="text-xs font-bold text-amber-400 mt-0.5">{selectedBridge.currentSagAngleDeg}°</div>
                      <div className="text-[10px] text-slate-500">Nominal: {selectedBridge.nominalSagAngleDeg}°</div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Aerial Root Strain</div>
                      <div className="text-xs font-bold text-rose-400 mt-0.5">{(selectedBridge.vineTensionRatio * 100).toFixed(0)}% Yield</div>
                      <div className="text-[10px] text-slate-500">High Monsoon Stress</div>
                    </div>
                  </div>

                  {/* Real-time Dynamic Weight Allowance */}
                  <div className="mt-4 p-4 bg-teal-950/40 border border-teal-500/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                        Dynamic Safe Crossing Limit
                      </span>
                      <span className="text-xs font-mono font-bold text-white bg-teal-500/20 px-2 py-0.5 rounded">
                        CV Strain Verified
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <div className="text-2xl font-black text-white">{selectedBridge.maxSafeCapacitySouls} Persons</div>
                      <div className="text-xs text-slate-400 font-mono">({selectedBridge.maxSafePayloadKg} kg Max Weight)</div>
                    </div>

                    <p className="text-[11px] text-teal-200/80 mt-1">
                      ⚠️ Stagger crossing: River current has softened anchor boulders. Maintain 4-meter spacing between individuals.
                    </p>
                  </div>
                </div>

                {/* Right: Traditional Community Maintenance Ledger */}
                <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-400" /> Tribal Council Maintenance Ledger
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">3 Verified Records</span>
                  </div>

                  <div className="space-y-3">
                    {bridgeLedger.map(item => (
                      <div key={item.txHash} className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-200">{item.event}</span>
                          <span className="text-[10px] font-mono text-emerald-400">{item.status}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">{item.details}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-800/80">
                          <span>Auth: {item.verifiedBy}</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    ))}
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
