import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, BatteryCharging, Radio, Lightbulb, Zap, ShieldAlert, 
  RefreshCw, Play, Square, CheckCircle, AlertTriangle, 
  MapPin, Heart, Lock, Unlock, Sliders, ArrowUpRight, 
  Clock, Sparkles, Database, Network, Layers, HardDrive, 
  Share2, Compass, Waves, Fingerprint, Eye, EyeOff, 
  Sun, Battery, Key, QrCode
} from 'lucide-react';

export default function ExtremeResilienceSuite() {
  const [activeTab, setActiveTab] = useState('wasm');

  // -------------------------------------------------------------
  // TAB 1: WEB-WASM DISTRIBUTED SUPERCOMPUTER
  // -------------------------------------------------------------
  const [computing, setComputing] = useState(false);
  const [computeProgress, setComputeProgress] = useState(64); // %
  const [peerCount, setPeerCount] = useState(1420);
  const [tflops, setTflops] = useState(2.84);
  const [shardsSolved, setShardsSolved] = useState(7680);
  const [totalShards, setTotalShards] = useState(12000);
  const [ruptureConfidence, setRuptureConfidence] = useState(94.8);

  const wasmCanvasRef = useRef(null);

  // Render finite element mesh deformation
  useEffect(() => {
    const canvas = wasmCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let tick = 0;

    const render = () => {
      ctx.fillStyle = '#060d19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Draw finite-element triangular grid representing mountain slope
      const rows = 9;
      const cols = 14;
      const dx = w / cols;
      const dy = h / rows;

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * dx + (r % 2 === 0 ? 0 : dx * 0.5);
          const y = r * dy;

          // Displacement vector based on compute convergence
          const isSlipZone = (r > 3 && r < 7 && c > 4 && c < 10);
          const deformX = isSlipZone && computing ? Math.sin(tick * 0.08 + c) * 3.5 : 0;
          const deformY = isSlipZone && computing ? Math.cos(tick * 0.08 + r) * 4.2 : 0;

          ctx.beginPath();
          ctx.arc(x + deformX, y + deformY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = isSlipZone ? '#ef4444' : '#38bdf8';
          ctx.fill();

          // Connect triangles
          if (c < cols - 1) {
            ctx.beginPath();
            ctx.moveTo(x + deformX, y + deformY);
            ctx.lineTo((c + 1) * dx + deformX, y + deformY);
            ctx.stroke();
          }
          if (r < rows - 1) {
            ctx.beginPath();
            ctx.moveTo(x + deformX, y + deformY);
            ctx.lineTo(x + deformX, (r + 1) * dy + deformY);
            ctx.stroke();
          }
        }
      }

      // Draw active shear rupture slip line solved by browser swarm
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h * 0.75);
      ctx.quadraticCurveTo(w * 0.5, h * 0.45 + (computing ? Math.sin(tick * 0.1) * 4 : 0), w * 0.8, h * 0.3);
      ctx.stroke();
      ctx.setLineDash([]);

      tick++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [computing]);

  const handleToggleCompute = () => {
    setComputing(!computing);
    if (!computing) {
      const interval = setInterval(() => {
        setShardsSolved(prev => {
          if (prev >= totalShards) {
            clearInterval(interval);
            return totalShards;
          }
          return prev + 120;
        });
        setComputeProgress(prev => Math.min(100, prev + 1));
      }, 500);
    }
  };

  // -------------------------------------------------------------
  // TAB 2: E-INK / ULTRA-LOW REFRESH 0.033 HZ BROWSER CANVAS
  // -------------------------------------------------------------
  const [eInkMode, setEInkMode] = useState(false);
  const [eInkSecondsCounter, setEInkSecondsCounter] = useState(30);
  const [devicePowerMw, setDevicePowerMw] = useState(340); // 340mW standard vs 48mW in E-Ink
  const [simulatedBatteryHours, setSimulatedBatteryHours] = useState(2.8);

  const eInkCanvasRef = useRef(null);

  // Toggle E-Ink state
  const handleToggleEInk = () => {
    const next = !eInkMode;
    setEInkMode(next);
    if (next) {
      setDevicePowerMw(48); // 85% energy cut
      setSimulatedBatteryHours(18.5); // Extends dying battery from 2.8h to 18.5h
    } else {
      setDevicePowerMw(340);
      setSimulatedBatteryHours(2.8);
    }
  };

  // Render E-Ink binary canvas
  useEffect(() => {
    const canvas = eInkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      // Pure black background (0 power on OLED pixels)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // High-contrast sharp white vector lines
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      // Outer border
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Header
      ctx.font = 'bold 16px monospace';
      ctx.fillText('EMERGENCY E-INK CANVAS [0.033 HZ]', 25, 42);
      ctx.font = '12px monospace';
      ctx.fillText('REFRESH RATE: ONCE EVERY 30 SECONDS | 0 ANIMATIONS', 25, 62);

      // Divider line
      ctx.beginPath();
      ctx.moveTo(25, 75);
      ctx.lineTo(canvas.width - 25, 75);
      ctx.stroke();

      // Critical Status Box
      ctx.strokeRect(25, 90, 240, 70);
      ctx.font = 'bold 13px monospace';
      ctx.fillText('NEAREST SHELTER:', 35, 112);
      ctx.font = '12px monospace';
      ctx.fillText('Pangin High School (1.4 km)', 35, 130);
      ctx.fillText('CAPACITY: 420 / 600 (OPEN)', 35, 146);

      // Evacuation Corridor Box
      ctx.strokeRect(280, 90, 245, 70);
      ctx.font = 'bold 13px monospace';
      ctx.fillText('SAFE EXIT CORRIDOR:', 290, 112);
      ctx.font = '12px monospace';
      ctx.fillText('NH-10 Milepost 32 Bypass', 290, 130);
      ctx.fillText('STATUS: CLEAR OF MUDSLIDE', 290, 146);

      // Radio & SOS Frequency
      ctx.strokeRect(25, 175, 500, 50);
      ctx.font = 'bold 12px monospace';
      ctx.fillText('EMERGENCY HAM RADIO: 144.800 MHz VHF | AIR ITANAGAR: 100.1 MHz', 35, 196);
      ctx.fillText('BATTERY ESTIMATE: 18.5 HOURS REMAINING @ 48 mW OLED DRAW', 35, 214);
    };

    render();
  }, [eInkMode]);

  // E-Ink refresh countdown
  useEffect(() => {
    if (!eInkMode) return;
    const interval = setInterval(() => {
      setEInkSecondsCounter(prev => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [eInkMode]);

  // -------------------------------------------------------------
  // TAB 3: WEB-NFC "DEAD-DROP" DIGITAL RELIEF LOCKER
  // -------------------------------------------------------------
  const [nfcScanning, setNfcScanning] = useState(false);
  const [lockerUnlocked, setLockerUnlocked] = useState(false);
  const [lockerData, setLockerData] = useState({
    crateId: 'CRATE-AIRDROP-NONGRIAT-04',
    dropTime: 'Today, 04:15 AM (Drone Winch Drop)',
    location: 'Bamboo Clearing near Root Bridge #2',
    contents: '12x Water Purification Units, 6x Trauma Hemostatic Gauze, 24x High-Calorie Rations',
    authorizedCitizenId: 'NDMA-ID-MEGH-7741',
    tamperStatus: 'UNBROKEN_SEAL',
    unlockCode: '8492'
  });

  const handleSimulateNfcTap = () => {
    setNfcScanning(true);
    setTimeout(() => {
      setNfcScanning(false);
      setLockerUnlocked(true);
    }, 1200);
  };

  // -------------------------------------------------------------
  // TAB 4: LIGHT-FIDELITY (LI-FI) OPTICAL WEB RECEIVER
  // -------------------------------------------------------------
  const [lifiActive, setLifiActive] = useState(true);
  const [opticalLux, setOpticalLux] = useState(840); // Lux from overhead emergency LED
  const [receivedShelterPacket, setReceivedShelterPacket] = useState({
    shelterName: 'Pasighat Indoor Stadium Emergency Relief Hub #1',
    doctorSchedule: 'Dr. T. Jamir (Orthopedic) on duty Ward B until 18:00',
    rationDistribution: 'Meal Packet #2 (Rice, Dal, ORS) starts at 13:00 at Gate 3',
    evacuationBuses: 'Bus #04 departing for Itanagar General Hospital at 14:30',
    missingPersonsAlert: 'Baby boy (Age 3, Red Sweater) reunited at Desk 2',
    opticalBps: '115,200 baud (Zero-RF Optical Modulated)',
    rfStatus: 'Wi-Fi/LTE Bands Congested (0% Interference via Light)'
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> GRID-FREE EXTREME RESILIENCE
              </span>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full border border-cyan-500/30">
                ZERO-SERVER & ZERO-BATTERY EXTENSION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Extreme Resilience & Grid-Free Computing Suite
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-3xl">
              World-first disaster technologies surviving total regional power grid collapses, severed server farms, dying phone batteries, looted relief boxes, and jammed shelter radio bands.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
              <div>
                <div className="text-xs text-slate-400">Battery Saver Mode</div>
                <div className="text-xs font-bold text-amber-300">{eInkMode ? 'E-Ink Active (-85% Draw)' : 'Standard Display'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
          <button
            onClick={() => setActiveTab('wasm')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'wasm'
                ? 'bg-amber-950/50 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Cpu className={`w-5 h-5 flex-shrink-0 ${activeTab === 'wasm' ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">WASM Supercomputer</div>
              <div className="text-[10px] text-slate-400">Crowdsourced Grid AI</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('e-ink')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'e-ink'
                ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Battery className={`w-5 h-5 flex-shrink-0 ${activeTab === 'e-ink' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">E-Ink Canvas (0.03Hz)</div>
              <div className="text-[10px] text-slate-400">85% Battery Preserver</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('nfc')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'nfc'
                ? 'bg-sky-950/50 border-sky-500 text-white shadow-lg shadow-sky-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Key className={`w-5 h-5 flex-shrink-0 ${activeTab === 'nfc' ? 'text-sky-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Web-NFC Dead-Drop</div>
              <div className="text-[10px] text-slate-400">Fraud-Proof Relief Lockers</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('lifi')}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'lifi'
                ? 'bg-violet-950/50 border-violet-500 text-white shadow-lg shadow-violet-950/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Lightbulb className={`w-5 h-5 flex-shrink-0 ${activeTab === 'lifi' ? 'text-violet-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold leading-tight">Li-Fi Optical Web</div>
              <div className="text-[10px] text-slate-400">Zero-RF Light Receiver</div>
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ========================================================= */}
        {/* TAB 1: WEB-WASM DISTRIBUTED SUPERCOMPUTER                  */}
        {/* ========================================================= */}
        {activeTab === 'wasm' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-6 h-6 text-amber-400" />
                    <h2 className="text-xl font-bold text-white">Web-WASM Distributed "Supercomputer" Swarm</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Transforms thousands of regional citizens' idle smartphones into a decentralized virtual supercomputer solving finite-element slope liquefaction models without external server farms.
                  </p>
                </div>

                <button
                  onClick={handleToggleCompute}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                    computing
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                      : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-950/50'
                  }`}
                >
                  <Cpu className={`w-4 h-4 ${computing ? 'animate-spin' : ''}`} />
                  {computing ? 'Pause WebAssembly Compute Worker' : 'Join Volunteer Compute Swarm'}
                </button>
              </div>

              {/* Grid of Finite Element Mesh & Swarm Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Finite Element Deformation Canvas */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Finite-Element Soil Displacement Shard Matrix
                    </span>
                    <span className="text-[11px] font-mono text-amber-400">
                      Rupture Surface Solved ({ruptureConfidence}% Conf)
                    </span>
                  </div>

                  <canvas
                    ref={wasmCanvasRef}
                    width={560}
                    height={200}
                    className="w-full h-52 rounded-lg border border-slate-800 bg-[#060d19]"
                  />

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>Matrix Shards Solved: {shardsSolved} / {totalShards}</span>
                      <span className="text-amber-400 font-bold">{computeProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${computeProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Right: Swarm Compute Telemetry */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Virtual Supercomputer Telemetry
                    </h3>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Active Mobile Nodes:</span>
                        <span className="text-lg font-bold text-amber-400">{peerCount} Phones</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Aggregate Swarm Compute:</span>
                        <span className="text-lg font-bold text-emerald-400">{tflops} TFLOPS</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Local CPU Allocation:</span>
                        <span className="text-sm font-bold text-white">2 Web Workers (Idle Core)</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                        ⚡ <strong>Zero Server Dependency:</strong> When national fiber lines snap, regional phones calculate differential soil equations locally using WebAssembly, predicting slope collapse autonomously.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-lg text-[11px] text-amber-300">
                      Predicted Shear Zone: <strong>NH-10 Milepost 34.8</strong> (Failure probability 94.8% in 18 minutes).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: E-INK / ULTRA-LOW REFRESH 0.033 HZ BROWSER CANVAS   */}
        {/* ========================================================= */}
        {activeTab === 'e-ink' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Battery className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">E-Ink / Low-Refresh (0.033 Hz) Ultra-Low Energy Browser Canvas</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Forces the browser into a high-contrast binary monochrome canvas throttled to once every 30 seconds, turning off OLED pixels to cut power draw by 85% and extend dying batteries for days.
                  </p>
                </div>

                <button
                  onClick={handleToggleEInk}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                    eInkMode
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-950/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {eInkMode ? 'E-Ink 0.033Hz Mode Active (-85% Draw)' : 'Toggle E-Ink Binary Mode'}
                </button>
              </div>

              {/* Energy Metric Comparison Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 font-mono text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Screen Power Draw</div>
                  <div className={`text-base font-bold mt-1 ${eInkMode ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {devicePowerMw} mW
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Battery Life Remaining</div>
                  <div className={`text-base font-bold mt-1 ${eInkMode ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {simulatedBatteryHours} Hours
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Canvas Refresh Throttle</div>
                  <div className="text-base font-bold text-white mt-1">
                    {eInkMode ? '0.033 Hz (30s)' : '60.0 Hz (Smooth)'}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">OLED Pixels Powered Off</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    {eInkMode ? '92.4% (Pure Black)' : '18.2%'}
                  </div>
                </div>
              </div>

              {/* The E-Ink High Contrast Canvas */}
              <div className="bg-black p-4 rounded-xl border-2 border-white/20">
                <div className="flex items-center justify-between text-xs font-mono text-white mb-2">
                  <span>BINARY HIGH-CONTRAST KINDLE-CANVAS</span>
                  <span>NEXT REFRESH IN: {eInkSecondsCounter}s</span>
                </div>

                <canvas
                  ref={eInkCanvasRef}
                  width={560}
                  height={240}
                  className="w-full h-64 rounded bg-black"
                />

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2">
                  <span>TOUCH ANYWHERE TO FORCE INSTANT TICK REFRESH</span>
                  <span>CPU THREADS IDLED • ZERO GPU GRADIENTS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: WEB-NFC "DEAD-DROP" DIGITAL RELIEF LOCKER           */}
        {/* ========================================================= */}
        {activeTab === 'nfc' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Key className="w-6 h-6 text-sky-400" />
                    <h2 className="text-xl font-bold text-white">Web-NFC "Dead-Drop" Digital Relief Lockers</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Cryptographic offline token verification for airdropped physical relief crates. Survivors tap their phone to sign their identity locally and unlock supplies without internet access or risk of looting.
                  </p>
                </div>

                <button
                  onClick={handleSimulateNfcTap}
                  disabled={nfcScanning}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-950/50 transition-all disabled:opacity-50"
                >
                  <Fingerprint className={`w-4 h-4 ${nfcScanning ? 'animate-pulse' : ''}`} />
                  {nfcScanning ? 'Reading Physical NFC Tag...' : 'Simulate Phone-to-Crate NFC Tap'}
                </button>
              </div>

              {/* Physical Crate Information & Lock Mechanism */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Crate Telemetry & Contents */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-sky-400">
                      {lockerData.crateId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-mono font-bold border border-emerald-500/30">
                      {lockerData.tamperStatus}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-slate-400 mb-1">Airdrop GPS Drop Location:</div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" /> {lockerData.location}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{lockerData.dropTime}</div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-slate-400 mb-1">Physical Supply Payload:</div>
                      <div className="font-bold text-emerald-300">{lockerData.contents}</div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                      🛡️ <strong>Anti-Hoarding Cryptography:</strong> When tapped, the PWA signs a local RSA key pair verifying the citizen has not claimed rations from any other drop-box in the past 24 hours.
                    </div>
                  </div>
                </div>

                {/* Right: Electronic Lock & Access Code */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between text-center">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                      Physical Crate Latch Status
                    </h3>

                    <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3 transition-all duration-300 bg-slate-900 border-2 border-slate-700">
                      {lockerUnlocked ? (
                        <Unlock className="w-10 h-10 text-emerald-400 animate-bounce" />
                      ) : (
                        <Lock className="w-10 h-10 text-amber-400" />
                      )}
                    </div>

                    <div className="text-base font-bold text-white">
                      {lockerUnlocked ? 'LOCKER VAULT UNLOCKED' : 'SECURE ELECTRONIC LOCK ENGAGED'}
                    </div>

                    {lockerUnlocked && (
                      <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
                        <div className="text-[11px] text-emerald-300 uppercase tracking-wider font-bold">
                          One-Time Mechanical Code
                        </div>
                        <div className="text-3xl font-black font-mono text-white tracking-widest mt-1">
                          {lockerData.unlockCode}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Enter on mechanical dial to open supply chamber.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                    CRYPTOGRAPHIC RECORD SIGNED TO OFFLINE LEDGER
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LIGHT-FIDELITY (LI-FI) OPTICAL WEB RECEIVER         */}
        {/* ========================================================= */}
        {activeTab === 'lifi' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-violet-400" />
                    <h2 className="text-xl font-bold text-white">Light-Fidelity (Li-Fi) Optical Web Interfacing</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Bypasses completely jammed Wi-Fi and cellular frequencies in crowded relief shelters by receiving high-speed data transmitted through overhead emergency LED bulb pulses.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-violet-950/50 border border-violet-500/30 px-4 py-2 rounded-xl">
                  <Sun className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-xs font-mono text-white font-bold">
                    Ambient Lux: {opticalLux} lx (Modulated LED Active)
                  </span>
                </div>
              </div>

              {/* Optical Data Reception Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Decoded Shelter Broadcast Stream */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Optical LED Demodulated Feed ({receivedShelterPacket.opticalBps})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-mono font-bold border border-emerald-500/30">
                      0% RF CONGESTION
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Shelter Node</div>
                      <div className="text-white font-bold mt-0.5">{receivedShelterPacket.shelterName}</div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-amber-400 font-bold text-[10px]">RATION & MEAL SCHEDULE:</div>
                      <div className="text-slate-200 mt-0.5">{receivedShelterPacket.rationDistribution}</div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-cyan-400 font-bold text-[10px]">ON-DUTY MEDICAL TEAM:</div>
                      <div className="text-slate-200 mt-0.5">{receivedShelterPacket.doctorSchedule}</div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-emerald-400 font-bold text-[10px]">EVACUATION TRANSPORT:</div>
                      <div className="text-slate-200 mt-0.5">{receivedShelterPacket.evacuationBuses}</div>
                    </div>
                  </div>
                </div>

                {/* Right: How It Works & Optical Sensor Status */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Optical Wave Demodulation Concept
                    </h3>

                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center mb-3">
                      <Lightbulb className="w-12 h-12 text-amber-300 mx-auto animate-pulse mb-2" />
                      <div className="text-xs font-bold text-white">Overhead LED Array Transmitting</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        High-frequency pulses captured by front camera sensor.
                      </div>
                    </div>

                    <div className="p-3 bg-violet-950/40 border border-violet-500/30 rounded-lg text-[11px] text-violet-200">
                      📶 <strong>Why Li-Fi Outperforms Wi-Fi in Crowded Camps:</strong> Standard 2.4/5GHz Wi-Fi routers crash when 5,000 refugees attempt to connect simultaneously. Li-Fi transmits via ambient light waves, providing infinite optical bandwidth with zero radio packet collisions.
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center">
                    COMPLIANT WITH IEEE 802.11bb OPTICAL WIRELESS STANDARD
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
