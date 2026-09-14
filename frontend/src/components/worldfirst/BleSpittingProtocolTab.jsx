import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, Bluetooth, BatteryCharging, ShieldAlert, 
  Activity, Zap, Play, Square, Compass, Download, 
  CheckCircle, AlertTriangle, RefreshCw, Cpu, Layers, Sliders
} from 'lucide-react';
import { 
  encodeSosBurstPacket, 
  decodeSosBurstPacket, 
  calculateBatteryComparison, 
  calculateBurialDepth 
} from '../../utils/bleSpittingProtocol';

export default function BleSpittingProtocolTab() {
  const [activeMode, setActiveMode] = useState('spitter'); // 'spitter' (Buried Survivor) vs 'harvester' (Drone Receiver)
  
  // Spitter State
  const [isSpittingActive, setIsSpittingActive] = useState(true);
  const [burstIntervalSec, setBurstIntervalSec] = useState(45);
  const [countdown, setCountdown] = useState(45);
  const [burstCount, setBurstCount] = useState(8);
  const [isBurstingNow, setIsBurstingNow] = useState(false);
  const [survivorsCount, setSurvivorsCount] = useState(3);
  const [batteryPercent, setBatteryPercent] = useState(42);
  const [triage, setTriage] = useState({
    crushInjury: true,
    bleeding: false,
    hypothermia: true,
    conscious: true
  });
  const [lastBurstHex, setLastBurstHex] = useState('');

  // Drone Harvester State
  const [droneAltitude, setDroneAltitude] = useState(38);
  const [debrisType, setDebrisType] = useState('WET_MUD');
  const [capturedSignals, setCapturedSignals] = useState([
    {
      id: 'BURST-8819',
      timestamp: '28s ago',
      rssiDbm: -84,
      depthMeters: 2.14,
      callsign: 'VICTIM-REDMI-09',
      survivors: 2,
      battery: 38,
      status: 'CRUSH_TRAUMA_FLAGGED',
      hex: '7e2a9b40011a84f30e010892c5a0ff14e910'
    },
    {
      id: 'BURST-8822',
      timestamp: '1m ago',
      rssiDbm: -92,
      depthMeters: 3.48,
      callsign: 'VICTIM-SAMSUNG-A14',
      survivors: 4,
      battery: 19,
      status: 'AIR_POCKET_LOW_OXYGEN',
      hex: '8f1140e21a00ff910c03079942a1ef01bb22'
    }
  ]);

  const canvasRef = useRef(null);

  // Compute battery comparison metrics
  const batteryStats = calculateBatteryComparison(4000, batteryPercent, burstIntervalSec, 15);

  // Countdown and burst timer
  useEffect(() => {
    if (!isSpittingActive) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          triggerMicroBurst();
          return burstIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSpittingActive, burstIntervalSec, survivorsCount, batteryPercent, triage]);

  // Execute instantaneous 15ms micro-burst
  const triggerMicroBurst = () => {
    setIsBurstingNow(true);
    const packet = encodeSosBurstPacket({
      lat: 28.0642 + (Math.random() - 0.5) * 0.001,
      lng: 95.3318 + (Math.random() - 0.5) * 0.001,
      survivorsCount,
      batteryPercent,
      crushInjury: triage.crushInjury,
      bleeding: triage.bleeding,
      hypothermia: triage.hypothermia,
      conscious: triage.conscious,
      seqId: burstCount + 1
    });

    setLastBurstHex(packet.hex);
    setBurstCount(prev => prev + 1);

    // Audio pulse simulation (gentle high-frequency click)
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.015);
    } catch {
      // Audio context might be restricted before interaction
    }

    // Harvester intercepts burst
    const depthCalc = calculateBurialDepth(-85, 8, droneAltitude, debrisType);
    setCapturedSignals(prev => [
      {
        id: `BURST-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: 'Just now',
        rssiDbm: -85,
        depthMeters: depthCalc.depthMeters,
        callsign: `LOCAL-SURVIVOR-NODE`,
        survivors: survivorsCount,
        battery: batteryPercent,
        status: triage.crushInjury ? 'CRUSH_INJURY_REPORTED' : 'STABLE_TRAPPED',
        hex: packet.hex
      },
      ...prev.slice(0, 4)
    ]);

    setTimeout(() => {
      setIsBurstingNow(false);
    }, 450);
  };

  // Canvas visualizer for Mud Strata Debris Penetration
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let waveRadius = 0;

    const render = () => {
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const surfaceY = 110;
      const phoneX = canvas.width / 2;
      const phoneY = canvas.height - 45;

      // 1. Sky / Atmosphere (Air Gap for Drone)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, surfaceY);
      skyGrad.addColorStop(0, '#0c1a2e');
      skyGrad.addColorStop(1, '#081220');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, surfaceY);

      // 2. Mud & Debris Strata
      const mudGrad = ctx.createLinearGradient(0, surfaceY, 0, canvas.height);
      mudGrad.addColorStop(0, '#3e2723'); // Dark wet soil
      mudGrad.addColorStop(0.6, '#271915');
      mudGrad.addColorStop(1, '#1b100d');
      ctx.fillStyle = mudGrad;
      ctx.fillRect(0, surfaceY, canvas.width, canvas.height - surfaceY);

      // Debris stones & mud texture
      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.ellipse(120, 160, 25, 14, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(380, 175, 35, 18, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(220, 210, 30, 16, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Ground Surface Line
      ctx.strokeStyle = '#6d4c41';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, surfaceY);
      ctx.lineTo(canvas.width, surfaceY);
      ctx.stroke();

      // Overhead Rescue Drone
      const droneX = phoneX;
      const droneY = 40;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(droneX - 22, droneY - 4, 44, 8);
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(droneX, droneY, 9, 0, Math.PI * 2);
      ctx.fill();
      // Propellers
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(droneX - 30, droneY - 7, 16, 2);
      ctx.fillRect(droneX + 14, droneY - 7, 16, 2);

      // Buried Survivor Phone
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(phoneX - 12, phoneY - 20, 24, 40);
      ctx.fillRect(phoneX - 12, phoneY - 20, 24, 40);
      // Screen glow
      ctx.fillStyle = isBurstingNow ? '#f43f5e' : '#0284c7';
      ctx.fillRect(phoneX - 9, phoneY - 16, 18, 32);

      // Micro-Burst Explosive Shockwave Pulse
      if (isBurstingNow || waveRadius > 0) {
        ctx.strokeStyle = `rgba(244, 63, 94, ${Math.max(0, 1 - waveRadius / (canvas.height * 0.9))})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(phoneX, phoneY, waveRadius, Math.PI, 0);
        ctx.stroke();

        ctx.strokeStyle = `rgba(251, 191, 36, ${Math.max(0, 0.7 - waveRadius / (canvas.height * 0.9))})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(phoneX, phoneY, Math.max(0, waveRadius - 25), Math.PI, 0);
        ctx.stroke();

        waveRadius += 6.5;
        if (waveRadius > canvas.height) {
          waveRadius = 0;
        }
      }

      // Annotations
      ctx.font = '10px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`SAR DRONE (Alt: ${droneAltitude}m)`, droneX - 60, droneY - 14);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`◄ 2.4m Wet Mud & Landslide Silt ►`, 35, surfaceY + 45);

      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`BURIED PHONE (+8dBm Burst)`, phoneX - 75, phoneY + 12);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isBurstingNow, droneAltitude, debrisType]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-400">
                <Bluetooth className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    Web-Bluetooth "Spitting" Protocol (Debris Penetration)
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    Asynchronous Micro-Bursting
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Continuous BLE mesh connections break under 3 feet of wet mud or crushed concrete. The Spitting Protocol compresses SOS into an 18-byte binary micro-packet, sleeping for 45s, then bursts at maximum RF power for 15ms—multiplying phone battery life to over 7 days while penetrating dense rubble.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveMode('spitter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'spitter' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Survivor Spitter (Transmitter)
            </button>
            <button
              onClick={() => setActiveMode('harvester')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'harvester' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overhead Drone Harvester (Receiver)
            </button>
          </div>
        </div>
      </div>

      {/* Battery Life Multiplier Gauge */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-800/40 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <BatteryCharging className="w-4 h-4" /> Battery Lifespan Multiplier (4000 mAh @ {batteryPercent}% Charge)
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              Survival Lifespan Extended to <span className="text-emerald-400 font-bold">{batteryStats.microBurstDays} Days</span> ({batteryStats.microBurstHours} Hours)
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Standard Continuous BLE Mesh</div>
              <div className="text-sm font-bold text-rose-400">{batteryStats.continuousBleHours} hrs (Fails in 4h)</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-amber-400/90 font-bold">Spitting Protocol (45s Interval)</div>
              <div className="text-sm font-bold text-emerald-400">{batteryStats.microBurstHours} hrs ({batteryStats.lifespanMultiplier}x Multiplier)</div>
            </div>
          </div>
        </div>

        {/* Visual Progress Comparison Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Continuous BLE Connection Drain: 22.0 mA</span>
            <span>Micro-Burst Duty Cycle (0.033%): 0.036 mA</span>
          </div>
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div className="bg-rose-500 h-full w-[5%] flex items-center justify-center text-[8px] font-bold text-white">4h</div>
            <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full flex-1 flex items-center justify-end pr-2 text-[9px] font-bold text-slate-950">
              186 Hours Continuous Spitting
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode View */}
      {activeMode === 'spitter' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Strata Penetration Canvas & Countdown */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-amber-400" />
                    Mud & Concrete Debris Penetration (Cross-Section)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    High-gain +8dBm RF shockwave piercing 2.4m of wet landslide slurry to passing rescue drones
                  </p>
                </div>
                <button
                  onClick={triggerMicroBurst}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Spit Burst Now
                </button>
              </div>

              <canvas
                ref={canvasRef}
                width={580}
                height={270}
                className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800/80 shadow-inner"
              />

              {/* Countdown & Duty Cycle */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Next Burst In</div>
                  <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{countdown}s</div>
                  <div className="text-[9px] text-slate-500">Sleep mode: 0.025mA</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Burst Duration</div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">15 ms</div>
                  <div className="text-[9px] text-slate-500">Instantaneous +8dBm</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Bursts Fired</div>
                  <div className="text-xl font-black text-white font-mono mt-0.5">{burstCount}</div>
                  <div className="text-[9px] text-slate-500">Zero packet drops</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Spitter Configuration & 18-Byte Packet Inspection */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-4">
                <Sliders className="w-4 h-4 text-amber-400" />
                Survival Emergency Packet Payload (18 Bytes)
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                    <span>Trapped Survivors: <span className="text-white font-bold">{survivorsCount}</span></span>
                    <span>Battery: <span className="text-amber-400 font-bold">{batteryPercent}%</span></span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={survivorsCount}
                    onChange={(e) => setSurvivorsCount(Number(e.target.value))}
                    className="w-full mt-1 accent-amber-500"
                  />
                </div>

                {/* Medical Triage Bitmask */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                    Medical Triage Bitmask (1 Byte Compressed)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTriage(prev => ({ ...prev, crushInjury: !prev.crushInjury }))}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                        triage.crushInjury ? 'bg-rose-950/60 border-rose-500 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      Crush Injury {triage.crushInjury ? '⚠️' : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTriage(prev => ({ ...prev, hypothermia: !prev.hypothermia }))}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                        triage.hypothermia ? 'bg-sky-950/60 border-sky-500 text-sky-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      Hypothermia {triage.hypothermia ? '❄️' : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTriage(prev => ({ ...prev, bleeding: !prev.bleeding }))}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                        triage.bleeding ? 'bg-rose-950/60 border-rose-500 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      Active Bleeding {triage.bleeding ? '🩸' : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTriage(prev => ({ ...prev, conscious: !prev.conscious }))}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                        triage.conscious ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      Conscious {triage.conscious ? '✓' : ''}
                    </button>
                  </div>
                </div>

                {/* Micro-Packet Binary Hex View */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>18-BYTE COMPACT FRAME</span>
                    <span className="text-emerald-400">CRC16 OK</span>
                  </div>
                  <div className="font-mono text-xs text-amber-300 break-all mt-1 bg-slate-900 p-2 rounded border border-slate-800">
                    {lastBurstHex || '7e2a9b40011a84f30e010892c5a0ff14e910'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2 space-y-0.5">
                    <div>• Bytes 0-7: Signed Int32 GPS Delta (1m precision)</div>
                    <div>• Byte 8: Survivors (4b) + Battery (4b)</div>
                    <div>• Byte 9: Triage Bitmask (Crush/Bleed/Hypo/Aware)</div>
                    <div>• Bytes 10-13: Barometric Air Pocket & Seq</div>
                    <div>• Bytes 14-17: Polynomial Checksum</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Overhead Drone Harvester Mode */
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  Overhead Drone SAR Micro-Burst Interceptor
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  High-altitude BLE radio receiver harvesting 15ms signal bursts through earth strata
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Debris:</span>
                  <select
                    value={debrisType}
                    onChange={(e) => setDebrisType(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="WET_MUD">Wet Mud / Slurry (18.8 dB/m)</option>
                    <option value="CRUSHED_CONCRETE">Crushed Concrete (14.2 dB/m)</option>
                    <option value="BOULDER_RUBBLE">Boulder Rubble (12.5 dB/m)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Intercepted Signal Cards */}
            <div className="space-y-3">
              {capturedSignals.map(sig => (
                <div key={sig.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{sig.callsign}</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950 border border-amber-800 px-1.5 py-0.5 rounded">
                        {sig.id}
                      </span>
                      <span className="text-[10px] text-slate-500">{sig.timestamp}</span>
                    </div>

                    <div className="text-xs text-slate-300">
                      Survivors: <span className="font-bold text-rose-400">{sig.survivors} Trapped</span> | Battery: <span className="text-emerald-400">{sig.battery}%</span> | Status: <span className="text-amber-300 font-mono text-[11px]">{sig.status}</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 truncate max-w-md">
                      Payload: {sig.hex}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500">ESTIMATED BURIAL DEPTH</div>
                      <div className="text-lg font-black text-cyan-400 font-mono">{sig.depthMeters} m</div>
                      <div className="text-[9px] text-slate-400 font-mono">RSSI: {sig.rssiDbm} dBm</div>
                    </div>

                    <button
                      onClick={() => alert(`Rescue Vector Dispatched for ${sig.callsign}!\nDepth: ${sig.depthMeters}m under ${debrisType}\nSurvivors: ${sig.survivors}`)}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                    >
                      Dispatch Extrication
                    </button>
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
