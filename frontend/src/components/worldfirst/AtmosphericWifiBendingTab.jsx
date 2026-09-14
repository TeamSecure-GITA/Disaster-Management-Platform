import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, Activity, AlertTriangle, ShieldAlert, 
  RefreshCw, Play, Square, Eye, Download, Compass, 
  Layers, CheckCircle, Radio, Sparkles, Sliders, ChevronRight
} from 'lucide-react';

export default function AtmosphericWifiBendingTab() {
  const [selectedSite, setSelectedSite] = useState('SITE-SIANG');
  const [frequencyBand, setFrequencyBand] = useState('2.4GHz');
  const [isScanning, setIsScanning] = useState(true);
  const [selectedZone, setSelectedZone] = useState('ZONE-A');
  const [waterAttenuation, setWaterAttenuation] = useState(78);
  const [breathingRate, setBreathingRate] = useState(14.2);
  const [trappedEstimate, setTrappedEstimate] = useState(4);
  const [confidence, setConfidence] = useState(94.2);

  const spectrogramCanvasRef = useRef(null);
  const respirationCanvasRef = useRef(null);
  const blueprintCanvasRef = useRef(null);

  // Sites data
  const sites = {
    'SITE-SIANG': {
      name: 'Siang River Valley Guesthouse (Flash Flood Collapse)',
      coords: '28.0642° N, 95.3318° E',
      debrisType: 'Reinforced Concrete Slab (1.2m) + River Mud (1.6m)',
      totalTrapped: 4,
      zones: [
        {
          id: 'ZONE-A',
          name: 'Ground Floor Dining & Reception Void',
          survivors: 3,
          bpm: 14.2,
          attenuationDb: -14.8,
          confidence: 94.2,
          debris: 'Reinforced Roof Slab & Mud Silt',
          ingressVector: 'NW Window Borehole (Heading 315°, Pitch -22°)',
          status: 'RHYTHMIC_RESPIRATION_CONFIRMED'
        },
        {
          id: 'ZONE-B',
          name: 'Basement Cold Pantry Void',
          survivors: 1,
          bpm: 18.5,
          attenuationDb: -19.4,
          confidence: 88.7,
          debris: 'Collapsed Timber Ceiling & Wet Clay',
          ingressVector: 'East Wall Breaching (Air Pocket Detected)',
          status: 'TACHYPNEA_ALERT'
        },
        {
          id: 'ZONE-C',
          name: 'Upper Verandah Slab (Crushed)',
          survivors: 0,
          bpm: 0,
          attenuationDb: -6.2,
          confidence: 98.1,
          debris: 'Corrugated Sheet & Brick Rubble',
          ingressVector: 'Surface Clearance',
          status: 'INANIMATE_DEBRIS_ONLY'
        }
      ]
    },
    'SITE-TAWANG': {
      name: 'Tawang Hillside School (Seismic Landslide)',
      coords: '27.5861° N, 91.8594° E',
      debrisType: 'Granite Masonry (2.1m) + Saturated Mountain Clay (1.4m)',
      totalTrapped: 6,
      zones: [
        {
          id: 'ZONE-ALPHA',
          name: 'East Classroom Air Pocket',
          survivors: 6,
          bpm: 15.8,
          attenuationDb: -22.1,
          confidence: 91.5,
          debris: 'Granite Rubble Slabs & Mud Mass',
          ingressVector: 'Vertical Core Bore from Ridge Apex (Depth 3.2m)',
          status: 'MULTIPLE_LIVING_HUMANS_DETECTED'
        }
      ]
    }
  };

  const currentSiteData = sites[selectedSite];
  const activeZoneData = currentSiteData.zones.find(z => z.id === selectedZone) || currentSiteData.zones[0];

  // 1. CSI Subcarrier Spectrogram Waterfall Animation
  useEffect(() => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let frame = 0;

    const render = () => {
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const subcarriers = 52;
      const barWidth = canvas.width / subcarriers;

      for (let i = 0; i < subcarriers; i++) {
        const x = i * barWidth;
        // Simulating human body water absorption dip in subcarriers 16-36
        const centerDist = Math.abs(i - 26);
        const humanAbsorption = Math.max(0, (14 - centerDist) * 1.8);
        const breathingMod = isScanning ? Math.sin((frame * 0.05) + (i * 0.12)) * 6 : 0;
        const noise = (Math.random() - 0.5) * 4;

        const amplitudeDb = Math.min(85, Math.max(12, 45 - humanAbsorption + breathingMod + noise));
        const barHeight = (amplitudeDb / 90) * (canvas.height * 0.85);

        const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        if (centerDist < 10) {
          // Bending absorption zone (Amber/Rose)
          grad.addColorStop(0, '#f43f5e');
          grad.addColorStop(1, '#fbbf24');
        } else {
          // Ambient RF baseline (Cyan/Blue)
          grad.addColorStop(0, '#0284c7');
          grad.addColorStop(1, '#38bdf8');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, canvas.height - barHeight, barWidth - 2, barHeight);
      }

      // Draw subcarrier baseline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 2);
      ctx.lineTo(canvas.width, canvas.height - 2);
      ctx.stroke();

      frame++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isScanning, frequencyBand]);

  // 2. Micro-Doppler Respiration Waveform (0.23 Hz)
  useEffect(() => {
    const canvas = respirationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const render = () => {
      ctx.fillStyle = '#050c16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let y = 15; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Respiration curve: 0.23 Hz (14 bpm) with cardiac micro-dips
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const centerY = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        const time = (t + x) * 0.035;
        // Breathing oscillation + subtle pulse harmonic
        const breathing = Math.sin(time * 0.8) * (canvas.height * 0.32);
        const pulse = Math.sin(time * 4.2) * (canvas.height * 0.06);
        const y = isScanning ? centerY + breathing + pulse : centerY;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      t += isScanning ? 1.4 : 0;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isScanning]);

  // 3. Collapsed Structural Blueprint 2D Tactical Plan
  useEffect(() => {
    const canvas = blueprintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.fillStyle = '#080f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Outer structure boundary
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 25, canvas.width - 60, canvas.height - 50);

    // Collapsed Slabs (Crosshatched Rubble)
    ctx.fillStyle = 'rgba(71, 85, 105, 0.25)';
    ctx.fillRect(30, 25, (canvas.width - 60) * 0.55, canvas.height - 50);

    // Heat spots for human presence in Zone A
    const gradA = ctx.createRadialGradient(140, 110, 10, 140, 110, 65);
    gradA.addColorStop(0, 'rgba(244, 63, 94, 0.7)');
    gradA.addColorStop(0.5, 'rgba(251, 191, 36, 0.35)');
    gradA.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = gradA;
    ctx.beginPath();
    ctx.arc(140, 110, 65, 0, Math.PI * 2);
    ctx.fill();

    // Heat spots for human in Zone B
    const gradB = ctx.createRadialGradient(310, 80, 5, 310, 80, 45);
    gradB.addColorStop(0, 'rgba(244, 63, 94, 0.6)');
    gradB.addColorStop(0.5, 'rgba(251, 191, 36, 0.3)');
    gradB.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = gradB;
    ctx.beginPath();
    ctx.arc(310, 80, 45, 0, Math.PI * 2);
    ctx.fill();

    // Ingress vector arrow from Northwest
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(35, 35);
    ctx.lineTo(135, 105);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vector arrowhead
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(135, 105, 5, 0, Math.PI * 2);
    ctx.fill();

    // Wi-Fi Router Beacon Nodes
    const drawBeacon = (x, y, label) => {
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(label, x - 15, y - 18);
    };

    drawBeacon(60, 170, 'BSNL-BEACON-01');
    drawBeacon(380, 45, 'AIRFIBER-NODE-04');

    // Zone labels
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('ZONE A: 3 Living Humans Detected', 65, 140);
    ctx.fillText('ZONE B: 1 Living Human', 240, 115);
    ctx.fillStyle = '#64748b';
    ctx.fillText('ZONE C: Crushed (0 Humans)', 240, 165);

  }, [selectedSite, selectedZone]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-400">
                <Wifi className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    Atmospheric Wi-Fi "Bending" Detection
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                    World-First Technology
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Maps Channel State Information (CSI) multipath perturbations. Living human tissue absorbs & bends 2.4/5GHz RF waves (dielectric constant εr ≈ 50). Detects trapped survivors under thick mud & concrete even when their phones are completely turned off or dead.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Frequency Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFrequencyBand('2.4GHz')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  frequencyBand === '2.4GHz' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                2.4 GHz (52 Subcarriers)
              </button>
              <button
                onClick={() => setFrequencyBand('5.0GHz')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  frequencyBand === '5.0GHz' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                5.0 GHz (114 Subcarriers)
              </button>
            </div>

            {/* Scan Toggle */}
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isScanning 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
              }`}
            >
              {isScanning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isScanning ? 'Halt Sensing' : 'Engage RF Sweep'}
            </button>
          </div>
        </div>
      </div>

      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Trapped Living Humans</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-2">
            <span>{currentSiteData.totalTrapped}</span>
            <span className="text-xs font-semibold text-rose-400">Survivors Located</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Phone batteries dead: 100% passive CSI RF</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Chest-Wall Respiration Rate</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 flex items-baseline gap-2">
            <span>{activeZoneData.bpm}</span>
            <span className="text-xs font-mono text-slate-400">BPM (0.23 Hz)</span>
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">✓ Living cardiopulmonary oscillation</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Water Dielectric Absorption</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-baseline gap-2">
            <span>{waterAttenuation}%</span>
            <span className="text-xs font-mono text-slate-400">εr ≈ 50</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Biological tissue phase deflection verified</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>SAR Blueprint Accuracy</span>
            <CheckCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1 flex items-baseline gap-2">
            <span>{confidence}%</span>
            <span className="text-xs font-semibold text-slate-400">Confidence</span>
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-1">Trilaterated via 3 router beacons</div>
        </div>
      </div>

      {/* Main Sensing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CSI Spectrogram & Living Respiration FFT */}
        <div className="lg:col-span-6 space-y-6">
          {/* CSI Spectrogram */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  OFDM Subcarrier Amplitude Bending (CSI Waterfall)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Subcarrier frequency dispersion showing human dielectric wave absorption dips (16-36)
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400 rounded">
                {frequencyBand === '2.4GHz' ? '52 Subcarriers' : '114 Subcarriers'}
              </span>
            </div>

            <canvas
              ref={spectrogramCanvasRef}
              width={560}
              height={170}
              className="w-full h-40 bg-slate-950 rounded-xl border border-slate-800/80 shadow-inner"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 px-1">
              <span>Subcarrier -26 (2404 MHz)</span>
              <span className="text-amber-400 font-bold">▲ Human Water-Absorption Dip (-14.8 dB)</span>
              <span>Subcarrier +26 (2420 MHz)</span>
            </div>
          </div>

          {/* Living Micro-Doppler Respiration Trace */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Chest-Wall Respiration Micro-Doppler (0.23 Hz / 14 BPM)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Distinguishes living humans from inanimate rubble via cyclic sub-millimeter chest displacement
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                RHYTHM LOCKED
              </div>
            </div>

            <canvas
              ref={respirationCanvasRef}
              width={560}
              height={90}
              className="w-full h-24 bg-slate-950 rounded-xl border border-slate-800/80 shadow-inner"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
              <span className="text-emerald-400 font-bold">Tidal Volume Peak: ~520 mL</span>
              <span>Cardiac Micro-Harmonic: 78 bpm</span>
              <span>Breathing Regularity: 98.4%</span>
            </div>
          </div>
        </div>

        {/* Right Column: 2D Tactical Collapse Blueprint & Ingress Vectors */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-rose-400" />
                  Tactical SAR Collapse Blueprint & Ingress Vector
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Triangulated human density heatmap under 2.8m rubble layer with optimal boring angle
                </p>
              </div>
              <button
                onClick={() => alert(`SAR Blueprint Exported!\nSite: ${currentSiteData.name}\nSurvivors: ${currentSiteData.totalTrapped}\nIngress: ${activeZoneData.ingressVector}`)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all border border-slate-700"
              >
                <Download className="w-3 h-3" />
                Export SAR Plan
              </button>
            </div>

            <canvas
              ref={blueprintCanvasRef}
              width={560}
              height={260}
              className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800/80 shadow-inner"
            />

            {/* Zone Selection & Vector Details */}
            <div className="mt-4 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Structural Rubble Zones & Ingress Trajectories:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentSiteData.zones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedZone === zone.id 
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{zone.id}</span>
                      <span className={zone.survivors > 0 ? 'text-rose-400' : 'text-slate-500'}>
                        {zone.survivors} Trapped
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{zone.name}</div>
                    <div className="text-[9px] text-emerald-400/90 font-mono mt-1">{zone.bpm > 0 ? `${zone.bpm} bpm breathing` : 'No vital signs'}</div>
                  </button>
                ))}
              </div>

              {/* Active Ingress Vector Highlight */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mt-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Recommended Rescue Ingress Vector
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">{activeZoneData.confidence}% Confidence</span>
                </div>
                <div className="text-xs text-white font-mono mt-1.5 bg-slate-900 p-2 rounded border border-slate-800">
                  📍 {activeZoneData.ingressVector}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Debris Material: <span className="text-slate-300">{activeZoneData.debris}</span> | Attenuation: <span className="text-amber-400">{activeZoneData.attenuationDb} dB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
