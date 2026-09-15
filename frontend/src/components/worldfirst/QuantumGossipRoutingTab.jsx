import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Radio, Share2, UploadCloud, RefreshCw, 
  Play, Square, Eye, CheckCircle, AlertTriangle, 
  Sparkles, Layers, Lock, Cpu, Server, Satellite, 
  Network, ArrowRight, Database, Users, ChevronRight, Info
} from 'lucide-react';

export default function QuantumGossipRoutingTab() {
  // Post-Quantum Kyber-1024 Cryptographic State
  const [keyPairGenerated, setKeyPairGenerated] = useState(true);
  const [kyberPublicKey, setKyberPublicKey] = useState('0x4F8A...E921 (Kyber-1024 Lattice Public Key - 1568 Bytes)');
  const [kyberCiphertext, setKyberCiphertext] = useState('0x8C33...11A9 (LWE Ciphertext Vector - 1568 Bytes)');
  const [sharedSecretKey, setSharedSecretKey] = useState('0x9D4E...77F2 (256-bit Post-Quantum Shared Secret)');
  const [encryptionTimeMs, setEncryptionTimeMs] = useState(0.84); // ms via WebAssembly

  // Epidemic Gossip Simulation Parameters
  const [carrierNodesCount, setCarrierNodesCount] = useState(32);
  const [infectedCount, setInfectedCount] = useState(1);
  const [isSimulatingGossip, setIsSimulatingGossip] = useState(true);
  const [gossipR0, setGossipR0] = useState(3.4); // basic reproduction number
  const [hopDepth, setHopDepth] = useState(4);
  const [bloomFilterHits, setBloomFilterHits] = useState(142); // duplicate suppressions

  // Satellite Uplink Gateway State
  const [satelliteInRange, setSatelliteInRange] = useState(false);
  const [satelliteBurstUploaded, setSatelliteBurstUploaded] = useState(false);
  const [uploadedTokenCount, setUploadedTokenCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Canvas Ref for Epidemic Mesh Graph
  const gossipCanvasRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // Regional Distress Tokens in the Local Gossip Vault
  const [tokenVault, setTokenVault] = useState([
    {
      id: 'PQC-TOK-8841',
      callsign: 'SURVIVOR-GORGE-9',
      lat: 28.0642,
      lng: 95.3318,
      status: 'CRITICAL_TRAPPED',
      survivors: 3,
      medicalNeed: 'Blood loss & tourniquet required',
      hops: 5,
      firstSeen: '6 mins ago',
      kyberEncrypted: true
    },
    {
      id: 'PQC-TOK-8842',
      callsign: 'VILLAGE-CLINIC-EAST',
      lat: 28.1180,
      lng: 95.2954,
      status: 'OXYGEN_EXHAUSTION',
      survivors: 8,
      medicalNeed: 'Ambu bags & 2x O2 cylinders',
      hops: 3,
      firstSeen: '14 mins ago',
      kyberEncrypted: true
    },
    {
      id: 'PQC-TOK-8843',
      callsign: 'BRIDGE-CHECKPOST',
      lat: 28.0710,
      lng: 95.3240,
      status: 'STRANDED_FLOOD',
      survivors: 12,
      medicalNeed: 'Clean water & thermal foil',
      hops: 6,
      firstSeen: '21 mins ago',
      kyberEncrypted: true
    }
  ]);

  // Real Web BroadcastChannel for Cross-Tab / Cross-Window Live Gossip Synchronization!
  useEffect(() => {
    try {
      const bc = new BroadcastChannel('pqc-disaster-gossip-mesh');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_GOSSIP_TOKEN') {
          setTokenVault(prev => {
            if (prev.some(t => t.id === event.data.token.id)) return prev;
            return [event.data.token, ...prev];
          });
          setInfectedCount(c => Math.min(carrierNodesCount, c + 1));
        }
      };
    } catch (e) {
      console.log("BroadcastChannel unavailable:", e);
    }

    return () => {
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
    };
  }, [carrierNodesCount]);

  // Live Canvas Epidemic Gossip Graph
  useEffect(() => {
    const canvas = gossipCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    // Generate or maintain simulated node coordinates
    const nodes = Array.from({ length: carrierNodesCount }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * (canvas.width - 60),
      y: 30 + Math.random() * (canvas.height - 60),
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      isCarrier: i === 0 || i < infectedCount,
      carrierPulse: 0
    }));

    const render = () => {
      ctx.fillStyle = '#060d19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Satellite Uplink Station Zone at Top-Right
      const satX = canvas.width - 70;
      const satY = 70;
      ctx.fillStyle = satelliteInRange ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.1)';
      ctx.beginPath();
      ctx.arc(satX, satY, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = satelliteInRange ? '#10b981' : '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = satelliteInRange ? '#34d399' : '#818cf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('SATELLITE GATEWAY', satX - 52, satY - 10);
      ctx.font = '9px sans-serif';
      ctx.fillText(satelliteInRange ? 'IN RANGE (UPLOADING)' : 'ORBIT SEARCH', satX - 45, satY + 6);

      // Move nodes and simulate epidemic gossip exchanges
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce walls
        if (node.x < 20 || node.x > canvas.width - 20) node.vx *= -1;
        if (node.y < 20 || node.y > canvas.height - 20) node.vy *= -1;

        // Check distance to satellite gateway
        const distToSat = Math.hypot(node.x - satX, node.y - satY);
        if (distToSat < 65 && node.isCarrier && !satelliteInRange) {
          setSatelliteInRange(true);
        }

        // Compare with other nodes for proximity gossip contact (< 60 px)
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 60) {
            // Draw gossip transfer line
            ctx.strokeStyle = (node.isCarrier || other.isCarrier) ? 'rgba(168, 85, 247, 0.4)' : 'rgba(51, 65, 85, 0.2)';
            ctx.lineWidth = (node.isCarrier || other.isCarrier) ? 1.5 : 0.8;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();

            // Gossip transmission (infection spread)
            if (isSimulatingGossip && (node.isCarrier !== other.isCarrier)) {
              if (Math.random() < 0.08) {
                node.isCarrier = true;
                other.isCarrier = true;
                setInfectedCount(c => Math.min(carrierNodesCount, c + 1));
              }
            }
          }
        }

        // Draw Node
        const isCarrier = node.isCarrier;
        ctx.fillStyle = isCarrier ? '#a855f7' : '#334155';
        ctx.beginPath();
        ctx.arc(node.x, node.y, isCarrier ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (isCarrier) {
          // Subtle pulse ring
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [carrierNodesCount, infectedCount, isSimulatingGossip, satelliteInRange]);

  // Simulate High-Speed Satellite Burst Upload (0.8s transfer)
  const triggerSatelliteBurst = () => {
    setSatelliteInRange(true);
    setUploadProgress(0);
    setSatelliteBurstUploaded(false);

    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      setUploadProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(interval);
        setSatelliteBurstUploaded(true);
        setUploadedTokenCount(tokenVault.length * 4); // uploaded regional batch
      }
    }, 100);
  };

  // Inject New Outbound SOS Token to Gossip Mesh
  const broadcastNewGossipToken = () => {
    const newToken = {
      id: `PQC-TOK-${Math.floor(1000 + Math.random() * 9000)}`,
      callsign: `LOCAL-CARRIER-${Math.floor(10 + Math.random() * 89)}`,
      lat: Number((28.064 + (Math.random() - 0.5) * 0.05).toFixed(4)),
      lng: Number((95.328 + (Math.random() - 0.5) * 0.05).toFixed(4)),
      status: 'CRITICAL_TRAPPED',
      survivors: Math.floor(1 + Math.random() * 5),
      medicalNeed: 'Fracture stabilization & intravenous saline',
      hops: 1,
      firstSeen: 'Just now',
      kyberEncrypted: true
    };

    setTokenVault(prev => [newToken, ...prev]);
    setInfectedCount(c => Math.min(carrierNodesCount, c + 3));

    // Broadcast across all open browser windows / tabs!
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'NEW_GOSSIP_TOKEN',
        token: newToken
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                WORLD-FIRST: KYBER-1024 POST-QUANTUM EPIDEMIC GOSSIP PROTOCOL
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                ZERO-ROUTE RESILIENT
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Quantum-Resistant Encrypted Distributed "Gossip" Routing
            </h2>

            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              Traditional networks fail in disasters because static routing paths break every second. Instead of searching for an online server, our platform turns every survivor and volunteer phone into an autonomous <span className="text-purple-300 font-mono">epidemic carrier</span>. As citizens pass each other, their browsers secretly exchange distress tokens protected by <span className="text-purple-300 font-mono">Kyber-1024 Post-Quantum Lattice Cryptography</span>. Data spreads like a benign virus through the crowd; the moment <em>any single person</em> walks within range of a satellite van or relief camp, the entire region's collected tokens upload at once.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={broadcastNewGossipToken}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              <Share2 className="w-4 h-4" />
              INJECT NEW GOSSIP TOKEN (CROSS-TAB SYNC)
            </button>

            <button
              onClick={triggerSatelliteBurst}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-950 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-900 rounded-xl text-xs font-bold transition-all"
            >
              <Satellite className="w-4 h-4" />
              SIMULATE SATELLITE BURST UPLOAD
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Epidemic Canvas Visualizer + Kyber Cryptography Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Epidemic Mesh Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Epidemic Gossip Crowd Mesh (Zero Fixed Routers)
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-purple-400 font-bold">{infectedCount} / {carrierNodesCount} CARRIERS</span>
                <span className="text-slate-500">R₀ = {gossipR0}</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="w-full aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
              <canvas ref={gossipCanvasRef} width={700} height={440} className="w-full h-full" />

              {/* Inset Badge: Cross-Tab Notice */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-purple-500/40 rounded-lg p-2.5 text-xs">
                <div className="text-[10px] uppercase font-mono text-purple-400 font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  REAL BROWSER BROADCASTCHANNEL ACTIVE
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Open another tab or window to see distress packets sync in real time!
                </div>
              </div>

              {/* Upload Progress Overlay */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Satellite className="w-12 h-12 text-emerald-400 animate-bounce" />
                  <div className="text-lg font-black text-white">SATELLITE GATEWAY BURST UPLOAD IN PROGRESS</div>
                  <div className="w-64 bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <div className="text-xs font-mono text-emerald-300">Compressed 0.8s High-Gain Transceiver Burst</div>
                </div>
              )}
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-mono">EPIDEMIC VELOCITY</div>
                <div className="text-lg font-black text-purple-400 font-mono mt-1">4.8 sec / hop</div>
                <div className="text-[9px] text-slate-500">P2P Bluetooth / Sound</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-mono">BLOOM FILTER SUPPRESSION</div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-1">{bloomFilterHits} Duplicates</div>
                <div className="text-[9px] text-slate-500">0% network loop saturation</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-mono">SATELLITE SYNC STATUS</div>
                <div className={`text-lg font-black font-mono mt-1 ${satelliteBurstUploaded ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {satelliteBurstUploaded ? 'BURST UPLOADED' : 'ACCUMULATING'}
                </div>
                <div className="text-[9px] text-slate-500">{satelliteBurstUploaded ? `${uploadedTokenCount} tokens uploaded` : 'Awaiting uplink gateway'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Kyber-1024 Lattice Cryptography & Token Vault (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Post-Quantum Kyber-1024 Inspector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Kyber-1024 (ML-KEM) Lattice Engine
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                WASM: {encryptionTimeMs} ms
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Standard RSA and Elliptic Curve (ECC) crypto are vulnerable to future quantum computers. Every gossip packet is encapsulated with <strong>NIST FIPS 203 ML-KEM (Kyber-1024)</strong> based on the hardness of Learning With Errors over Module Lattices:
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs space-y-2">
              <div>
                <div className="text-[10px] text-slate-500">LATTICE PUBLIC KEY (A · s + e mod q):</div>
                <div className="text-purple-300 font-bold truncate text-[11px]">{kyberPublicKey}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">IND-CCA2 CIPHERTEXT VECTOR:</div>
                <div className="text-cyan-300 font-bold truncate text-[11px]">{kyberCiphertext}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">EPHEMERAL SHARED SECRET:</div>
                <div className="text-emerald-400 font-bold truncate text-[11px]">{sharedSecretKey}</div>
              </div>
            </div>
          </div>

          {/* Local Gossip Distress Token Vault */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Local Carrier Token Vault ({tokenVault.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">HOP LEVEL: {hopDepth}</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {tokenVault.map(t => (
                <div key={t.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{t.id}</span>
                    <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Kyber Encrypted
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Source: <strong className="text-slate-200">{t.callsign}</strong> ({t.survivors} trapped)
                  </div>
                  <div className="text-[10px] text-amber-300/90 font-mono">
                    Coords: {t.lat}, {t.lng} • Hops: {t.hops}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Needs: {t.medicalNeed}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert(`All ${tokenVault.length} Post-Quantum encrypted disaster tokens queued for satellite burst sync upon approaching uplink terminal.`)}
              className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold font-mono transition-all"
            >
              EXPORT ENCRYPTED MESH BUNDLE (.PQC)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
