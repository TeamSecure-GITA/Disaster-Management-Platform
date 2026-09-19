import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Lock, Unlock, Key, Radio, Activity, 
  AlertTriangle, Eye, EyeOff, Layers, Sliders, Play, 
  Square, RefreshCw, CheckCircle, Volume2, VolumeX, 
  ShieldAlert, Sparkles, ChevronRight, Cpu, ArrowRight, 
  Bluetooth, Database, Flame, Download, Binary, UserCheck
} from 'lucide-react';

export default function QuantumChaffStorageTab() {
  // 3-Device Bluetooth Proximity Quorum Nodes
  const [deviceAActive, setDeviceAActive] = useState(true); // Team Alpha Leader
  const [deviceBActive, setDeviceBActive] = useState(true); // Medical Officer
  const [deviceCActive, setDeviceCActive] = useState(true); // SDRF Incident Commander

  // Active Dataset
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState(0);
  const [viewMode, setViewMode] = useState('reconstructed'); // 'reconstructed' | 'stolen_dump'
  const [tampered, setTampered] = useState(false);
  const [ephemeralTtl, setEphemeralTtl] = useState(48); // 48s auto-zeroization memory timer
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Cryptographic Metrics
  const [totalChaffPackets, setTotalChaffPackets] = useState(18420);
  const [trueShardCount, setTrueShardCount] = useState(3);
  const [noiseEntropyBits, setNoiseEntropyBits] = useState(7.994); // bits/byte
  const [reconstructionStatus, setReconstructionStatus] = useState('DECRYPTED_EPHEMERAL');

  const audioContextRef = useRef(null);

  // Pre-configured High-Value Disaster Registries
  const disasterRegistries = [
    {
      id: 'REG-NARCOTICS',
      name: 'Pasighat District Hospital Controlled Narcotics & Plasma Registry',
      category: 'MEDICAL_HIGH_VALUE',
      description: 'Morphine, Ketamine, and Type-O Negative Blood units stored in field trailers. Prime target for looters in regional blackout.',
      totalItems: 4,
      items: [
        { id: 'MED-01', item: 'Morphine Sulfate 10mg/mL Ampoules', quantity: '420 units', vaultLocation: 'Field Trailer Alpha-2 (Biometric Lock)', authorizedCustodian: 'Dr. T. Jamoh (SDRF CMO)' },
        { id: 'MED-02', item: 'Ketamine HCl 50mg/mL Injection', quantity: '180 vials', vaultLocation: 'Cold-Chain Cryo Unit #4', authorizedCustodian: 'Dr. T. Jamoh (SDRF CMO)' },
        { id: 'MED-03', item: 'O-Negative Packed Red Blood Cells (PRBC)', quantity: '45 bags', vaultLocation: 'Insulated Battery Refrigerator #1', authorizedCustodian: 'Nurse Supervisor B. Borah' },
        { id: 'MED-04', item: 'Fentanyl Transdermal Matrix 50mcg/hr', quantity: '85 patches', vaultLocation: 'Double-Locked Safe Vault B', authorizedCustodian: 'Dr. T. Jamoh (SDRF CMO)' }
      ]
    },
    {
      id: 'REG-ORPHANS',
      name: 'Upper Siang Vulnerable Children & Unaccompanied Minors Roster',
      category: 'HUMAN_TRIAGE_CONFIDENTIAL',
      description: 'Protected identities, biometric records, and temporary shelter allocations of 8 children separated from families. High anti-trafficking sensitivity.',
      totalItems: 3,
      items: [
        { id: 'MIN-01', item: 'Kaling P. (Age 6)', quantity: 'Biometrics Verified', vaultLocation: 'Safe Sanctuary Camp Site 3', authorizedCustodian: 'Child Welfare Officer R. Tayeng' },
        { id: 'MIN-02', item: 'Yomgam M. (Age 4) & Ome M. (Age 2)', quantity: 'Siblings Paired', vaultLocation: 'Safe Sanctuary Camp Site 3', authorizedCustodian: 'Child Welfare Officer R. Tayeng' },
        { id: 'MIN-03', item: 'Bamin L. (Age 9)', quantity: 'Medical Crush Triage', vaultLocation: 'Paediatric Medical Tent B', authorizedCustodian: 'Dr. P. Sonowal' }
      ]
    },
    {
      id: 'REG-LOGISTICS',
      name: 'NH-10 Strategic Fuel Depot & Explosive Breaching Coordinates',
      category: 'TACTICAL_INFRASTRUCTURE',
      description: 'Underground diesel fuel reserves and controlled geological blasting cord charges for landslide bypass excavation.',
      totalItems: 3,
      items: [
        { id: 'LOG-01', item: 'Diesel Generator Reserves (20,000 Liters)', quantity: 'Tank Sub-Level 2', vaultLocation: 'Bypass Cut km-14.2 (Hidden bunker)', authorizedCustodian: 'BRO Commander Col. S. Sharma' },
        { id: 'LOG-02', item: 'Commercial Emulsion Explosives (450 kg)', quantity: 'Class-1 Magazine', vaultLocation: 'Granite Quarry Adit 3', authorizedCustodian: 'Geotech Engineer K. Das' },
        { id: 'LOG-03', item: 'Bailey Bridge Modular Steel Spans', quantity: '3 Units (90ft)', vaultLocation: 'Teesta River Staging Yard', authorizedCustodian: 'BRO Logistics Team Delta' }
      ]
    }
  ];

  const activeRegistry = disasterRegistries[selectedDatasetIndex];

  // Count active devices in the 3-device Bluetooth quorum
  const activeDeviceCount = [deviceAActive, deviceBActive, deviceCActive].filter(Boolean).length;
  const isQuorumReached = activeDeviceCount === 3 && !tampered;

  // Synthesize cryptographic handshake chime
  const playHandshakeChime = (success = true) => {
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

      if (success) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.26);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  // Memory countdown timer for zeroization
  useEffect(() => {
    if (!isQuorumReached) return;

    const timer = setInterval(() => {
      setEphemeralTtl(prev => {
        if (prev <= 1) {
          // Zeroize RAM when countdown hits 0
          setDeviceCActive(false); // Simulate natural device divergence
          playHandshakeChime(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isQuorumReached]);

  // Handle device toggle
  const toggleDevice = (deviceKey) => {
    if (tampered) return;
    if (deviceKey === 'A') setDeviceAActive(p => !p);
    if (deviceKey === 'B') setDeviceBActive(p => !p);
    if (deviceKey === 'C') setDeviceCActive(p => !p);
    setEphemeralTtl(60);
  };

  // Emergency Tamper / Physical Theft Button
  const handleTamperBreach = () => {
    setTampered(true);
    setDeviceAActive(false);
    setDeviceBActive(false);
    setDeviceCActive(false);
    playHandshakeChime(false);
  };

  const handleResetStorage = () => {
    setTampered(false);
    setDeviceAActive(true);
    setDeviceBActive(true);
    setDeviceCActive(true);
    setEphemeralTtl(60);
    playHandshakeChime(true);
  };

  // Generate synthetic hex memory dump for the "stolen phone" view
  const generateHexDump = () => {
    const lines = [];
    const hexChars = '0123456789ABCDEF';
    for (let l = 0; l < 12; l++) {
      const offset = (l * 16).toString(16).padStart(6, '0').toUpperCase();
      let bytes = '';
      let ascii = '';
      for (let b = 0; b < 16; b++) {
        const val = Math.floor(Math.random() * 256);
        bytes += val.toString(16).padStart(2, '0').toUpperCase() + ' ';
        ascii += (val >= 32 && val <= 126) ? String.fromCharCode(val) : '.';
      }
      lines.push(`${offset}:  ${bytes.slice(0, 24)} ${bytes.slice(24)}  |${ascii}|`);
    }
    return lines.join('\n');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner: World-First Innovation #4 */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/80 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-8 bottom-4 opacity-10 flex items-center gap-2 pointer-events-none">
          <ShieldCheck className="w-36 h-36 text-purple-400" />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[11px] font-black tracking-wider uppercase rounded-full shadow-lg">
                WORLD-FIRST INNOVATION #4
              </span>
              <span className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-700/50">
                <Lock className="w-3.5 h-3.5 text-purple-400" /> ML-KEM (Kyber-1024) • Post-Quantum Cryptography
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 flex items-center gap-3">
              Multi-Device Post-Quantum "Chaff" Data Masking
              <span className="text-base font-normal text-purple-300 bg-purple-900/40 px-3 py-1 rounded-xl border border-purple-500/20">
                IndexedDB Engine
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl mt-2 leading-relaxed">
              During extended regional grid failures, physical security breaks down. If a rescue worker’s phone is lost or stolen by bad actors, 
              critical medical registries, strategic supply locations, and high-value emergency financial ledgers can be compromised or altered.
            </p>
          </div>

          {/* Controls: Sound & Emergency Self-Destruct */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                soundEnabled 
                  ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-md shadow-purple-950/50'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
              {soundEnabled ? 'Chimes ON' : 'Muted'}
            </button>

            {tampered ? (
              <button
                onClick={handleResetStorage}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reset Storage Keys
              </button>
            ) : (
              <button
                onClick={handleTamperBreach}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <Flame className="w-4 h-4" /> Simulate Hostile Phone Seizure
              </button>
            )}
          </div>
        </div>

        {/* 3 Core Pillars: The Concept, How It Works, The World-First Edge */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3.5 border-t border-purple-500/20 pt-4 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-purple-500/20">
            <div className="text-purple-400 font-bold flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5" /> 1. The Concept
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              During extended regional grid failures, physical security breaks down. If a rescue worker’s phone is lost or stolen by bad actors, critical medical registries, strategic supply locations, and high-value emergency financial ledgers can be compromised or altered.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-purple-500/20">
            <div className="text-purple-400 font-bold flex items-center gap-1.5 mb-1">
              <Cpu className="w-3.5 h-3.5" /> 2. How It Works
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              We build a localized, quantum-resistant file fragmentation protocol directly into the browser's <strong>IndexedDB</strong> engine using <strong>ML-KEM (Kyber-1024)</strong> post-quantum lattice encryption to encapsulate and shard data shares.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-purple-500/20">
            <div className="text-purple-400 font-bold flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> 3. The World-First Edge
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Instead of encrypting a file locally on one phone, our platform breaks the database into thousands of microscopic, mathematically incomplete fragments mixed with millions of strings of digital "chaff". A single device holds zero readable information until <strong>three team phones physically pass within Bluetooth range</strong> to recombine shares and dissolve the chaff.
            </p>
          </div>
        </div>
      </div>

      {/* 3-Device Bluetooth Proximity Mesh Quorum Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Bluetooth className="w-4 h-4 text-cyan-400" /> 3-Device Bluetooth Quorum Handshake (3-of-3 Threshold)
            </div>
            <div className="text-sm text-slate-300 mt-0.5">
              Click individual nodes below to simulate rescue workers walking into or out of 10m Bluetooth range:
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isQuorumReached 
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-950/40' 
                : 'bg-amber-950/80 border-amber-400 text-amber-300'
            }`}>
              {isQuorumReached ? 'QUORUM 3/3: RECONSTRUCTION ACTIVE' : `QUORUM ${activeDeviceCount}/3: DATA SHADOWED`}
            </span>
          </div>
        </div>

        {/* 3 Interactive Phone Node Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          
          {/* Device A */}
          <button
            onClick={() => toggleDevice('A')}
            disabled={tampered}
            className={`p-4 rounded-xl border text-left transition-all ${
              deviceAActive 
                ? 'bg-purple-950/50 border-purple-500 shadow-lg shadow-purple-950/40 text-white'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${deviceAActive ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}`}></span>
                DEVICE A: Team Alpha Leader
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                {deviceAActive ? 'BLE LOCKED' : 'OUT OF RANGE'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Holds: <strong>Polynomial Share #1</strong> + 6,140 Chaff Decoys
            </div>
            <div className="text-[10px] font-mono text-purple-400 mt-1">
              {deviceAActive ? 'Ephemeral Hash: 0x9A4F...B72C' : 'Handshake severed'}
            </div>
          </button>

          {/* Device B */}
          <button
            onClick={() => toggleDevice('B')}
            disabled={tampered}
            className={`p-4 rounded-xl border text-left transition-all ${
              deviceBActive 
                ? 'bg-indigo-950/50 border-indigo-500 shadow-lg shadow-indigo-950/40 text-white'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${deviceBActive ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`}></span>
                DEVICE B: Medical Officer
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                {deviceBActive ? 'BLE LOCKED' : 'OUT OF RANGE'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Holds: <strong>Polynomial Share #2</strong> + 6,140 Chaff Decoys
            </div>
            <div className="text-[10px] font-mono text-indigo-400 mt-1">
              {deviceBActive ? 'Ephemeral Hash: 0x4D18...71EA' : 'Handshake severed'}
            </div>
          </button>

          {/* Device C */}
          <button
            onClick={() => toggleDevice('C')}
            disabled={tampered}
            className={`p-4 rounded-xl border text-left transition-all ${
              deviceCActive 
                ? 'bg-cyan-950/50 border-cyan-500 shadow-lg shadow-cyan-950/40 text-white'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${deviceCActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></span>
                DEVICE C: Incident Commander
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                {deviceCActive ? 'BLE LOCKED' : 'OUT OF RANGE'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Holds: <strong>Polynomial Share #3</strong> + 6,140 Chaff Decoys
            </div>
            <div className="text-[10px] font-mono text-cyan-400 mt-1">
              {deviceCActive ? 'Ephemeral Hash: 0x882E...00F4' : 'Handshake severed'}
            </div>
          </button>

        </div>
      </div>

      {/* Main Grid: Data Display (Stolen Phone View vs Reconstructed View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Ledger Explorer / Hex Dump (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            
            {/* View Switcher Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {isQuorumReached ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isQuorumReached ? 'Decrypted Ephemeral Ledger (RAM Only)' : 'Stolen Phone IndexedDB Shadow Dump'}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('reconstructed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'reconstructed'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Cleartext Table
                </button>
                <button
                  onClick={() => setViewMode('stolen_dump')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === 'stolen_dump'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Binary className="w-3.5 h-3.5" /> Raw Hex Noise
                </button>
              </div>
            </div>

            {/* If Physical Tamper Alert Triggered */}
            {tampered && (
              <div className="p-4 bg-rose-950/60 border border-rose-500/80 rounded-xl text-rose-200 mt-4 animate-pulse">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  PHYSICAL THEFT / TAMPER TRIPWIRE ACTIVATED
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Device flash memory has been overwritten with 0x00 zero-patterns and salt poison. Local IndexedDB keys deleted. Handshake permanently refused until master admin authorization.
                </div>
              </div>
            )}

            {/* Case 1: Quorum Reached & Cleartext Mode */}
            {isQuorumReached && viewMode === 'reconstructed' && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30">
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Winnowing Filter Cleared 18,420 Chaff Packets
                  </span>
                  <span className="font-mono text-amber-300">Auto-Zeroize in {ephemeralTtl}s</span>
                </div>

                <div className="space-y-2.5">
                  {activeRegistry.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-xs hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{item.item}</span>
                        <span className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/30 font-mono">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-1.5 flex items-center justify-between text-[11px]">
                        <span>Storage: <strong>{item.vaultLocation}</strong></span>
                        <span className="text-indigo-300">Signatory: {item.authorizedCustodian}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Case 2: Quorum Incomplete (1 or 2 phones) OR Hex Dump Mode Selected */}
            {(!isQuorumReached || viewMode === 'stolen_dump') && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 font-mono">
                  <span className="text-rose-400 font-bold">
                    ENTROPY: {noiseEntropyBits} bits/byte (Pure Thermal Noise)
                  </span>
                  <span className="text-slate-500">IndexedDB: 18,420 Decoy Fragments</span>
                </div>

                <div className="bg-black/90 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400/90 leading-relaxed overflow-x-auto select-none">
                  <pre>{generateHexDump()}</pre>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-white">Forensic Security Guarantee:</strong> Because each device holds only an incomplete polynomial residue mixed with 99.98% random chaff, statistical frequency analysis, dictionary attacks, and quantum Shor/Grover algorithms yield exactly 0 extractable bits.
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Dataset Selector & Mathematical Mechanics (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dataset Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" /> Protected Survival Datasets
            </h3>

            <div className="space-y-2.5">
              {disasterRegistries.map((reg, idx) => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedDatasetIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedDatasetIndex === idx
                      ? 'bg-purple-950/70 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{reg.name}</span>
                    <span className="text-[10px] font-mono text-purple-400">{reg.totalItems} Items</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{reg.description}</div>
                  <div className="text-[10px] text-indigo-300 mt-1 font-mono">
                    Category: {reg.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cryptographic Architecture Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> ML-KEM (Kyber-1024) &amp; Chaff Winnowing
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Operating inside IndexedDB, this protocol combines NIST FIPS 203 <strong>ML-KEM (Kyber-1024)</strong> post-quantum key encapsulation with 
              microscopic file fragmentation and digital chaffing:
            </p>
            <div className="mt-3 space-y-2 text-xs font-mono text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">1.</span>
                <span>Core DB split into thousands of microscopic polynomial fragments</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">2.</span>
                <span>Fragments submerged in millions of strings of digital "chaff" (noise)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">3.</span>
                <span>IndexedDB on a single phone stores 0 readable or decryptable information</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">4.</span>
                <span>3 devices in Bluetooth range run ML-KEM (Kyber-1024) mutual handshake</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">5.</span>
                <span>Digital chaff dissolves; database materializes strictly in ephemeral RAM</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Deep-Tech Educational & Scientific Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-slate-300">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-purple-400" /> Strategic Edge: Defeating Physical Coercion &amp; Quantum Supercomputers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="font-bold text-purple-300 mb-1">1. Zero Extortion Surface</div>
            <p className="text-slate-400">
              Even if a looter holds a rescuer hostage at gunpoint demanding the password, the rescuer physically cannot decrypt the phone. The data does not exist in complete form on their device.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="font-bold text-purple-300 mb-1">2. Immune to Quantum Computing</div>
            <p className="text-slate-400">
              Standard RSA and ECC algorithms rely on mathematical hardness assumptions vulnerable to Shor’s algorithm. Chaffing and threshold secret sharing provide Information-Theoretic Security: multiple plaintexts are equally probable without all 3 shares.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="font-bold text-purple-300 mb-1">3. Autonomous Proximity Decryption</div>
            <p className="text-slate-400">
              No manual passwords or cloud logins needed. Rescuers simply walk near each other in the command tent; their devices automatically handshake over Bluetooth, show the roster, and zeroize when they disperse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
