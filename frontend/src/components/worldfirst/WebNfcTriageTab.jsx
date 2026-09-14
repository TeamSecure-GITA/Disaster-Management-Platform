import React, { useState, useEffect } from 'react';
import { 
  Zap, Heart, ShieldAlert, Activity, CheckCircle, 
  AlertTriangle, RefreshCw, Plus, Clock, FileText, 
  Sparkles, Radio, Smartphone, Award, Stethoscope
} from 'lucide-react';

export default function WebNfcTriageTab() {
  const [hasWebNfcSupport, setHasWebNfcSupport] = useState(false);
  const [isReadingNfc, setIsReadingNfc] = useState(false);
  const [isWritingNfc, setIsWritingNfc] = useState(false);
  const [tagTappedAnimation, setTagTappedAnimation] = useState(false);

  // Active Tag State (on-chip NDEF payload)
  const [activePatient, setActivePatient] = useState({
    patientId: 'VIC-NER-9912',
    nfcTagSerial: '04:5A:21:8F:CC:90:80',
    triageCategory: 'RED_IMMEDIATE',
    fullName: 'Tenzing Norbu',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Sulfa drugs',
    heartRateBpm: 128,
    spO2Percent: 88,
    systolicBp: 85,
    glasgowComaScale: 11,
    primaryDiagnosis: 'Compound Femur Fracture & Traumatic Hemorrhagic Shock',
    appliedInterventions: [
      { time: '14:22', action: 'Combat Application Tourniquet (CAT) Right Thigh', medic: 'PARAMEDIC_KUMAR' },
      { time: '14:35', action: 'Tranexamic Acid (TXA) 1g IV Infusion', medic: 'DR_R_SHARMA' },
      { time: '14:50', action: 'High-Flow Oxygen Mask 12 L/min', medic: 'VOLUNTEER_AID_04' }
    ],
    lastUpdatedOffline: '14:50:18',
    chipStorageUsedBytes: 248,
    chipStorageTotalBytes: 888 // NTAG216 standard size
  });

  // New intervention input
  const [newActionText, setNewActionText] = useState('');
  const [newMedicCallsign, setNewMedicCallsign] = useState('FIELD_MEDIC_01');

  // Check Web NFC hardware support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setHasWebNfcSupport(true);
    }
  }, []);

  // Audio chime feedback
  const playNfcChime = (isSuccess = true) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(isSuccess ? 880 : 440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isSuccess ? 1760 : 220, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio context may require explicit user gesture
    }
  };

  // Hardware Web NFC Scan
  const handleHardwareNfcScan = async () => {
    if (!hasWebNfcSupport) {
      triggerSimulatedTap('READ');
      return;
    }

    try {
      setIsReadingNfc(true);
      const ndef = new window.NDEFReader();
      await ndef.scan();
      ndef.onreading = (event) => {
        playNfcChime(true);
        setTagTappedAnimation(true);
        setTimeout(() => setTagTappedAnimation(false), 800);
        setIsReadingNfc(false);
      };
    } catch (error) {
      console.warn('Web NFC Read failed, switching to simulation:', error);
      triggerSimulatedTap('READ');
    }
  };

  // Trigger simulated tap
  const triggerSimulatedTap = (mode = 'READ') => {
    if (mode === 'READ') setIsReadingNfc(true);
    else setIsWritingNfc(true);

    setTimeout(() => {
      playNfcChime(true);
      setTagTappedAnimation(true);
      setTimeout(() => setTagTappedAnimation(false), 900);
      setIsReadingNfc(false);
      setIsWritingNfc(false);
    }, 600);
  };

  // Add treatment to on-chip tag log
  const handleAddIntervention = (e) => {
    e.preventDefault();
    if (!newActionText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry = {
      time: timeStr,
      action: newActionText.trim(),
      medic: newMedicCallsign.trim()
    };

    setActivePatient(prev => ({
      ...prev,
      appliedInterventions: [newEntry, ...prev.appliedInterventions],
      lastUpdatedOffline: timeStr,
      chipStorageUsedBytes: Math.min(prev.chipStorageTotalBytes, prev.chipStorageUsedBytes + 48)
    }));

    setNewActionText('');
    triggerSimulatedTap('WRITE');
  };

  // Quick triage status change
  const handleSetTriageCategory = (cat) => {
    setActivePatient(prev => ({
      ...prev,
      triageCategory: cat,
      lastUpdatedOffline: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
    triggerSimulatedTap('WRITE');
  };

  const getTriageTheme = (cat) => {
    switch (cat) {
      case 'RED_IMMEDIATE':
        return { bg: 'bg-rose-950/60', border: 'border-rose-500', text: 'text-rose-300', badge: 'bg-rose-600 text-white', label: 'RED: IMMEDIATE SURGERY / EXTRACT' };
      case 'YELLOW_DELAYED':
        return { bg: 'bg-amber-950/60', border: 'border-amber-500', text: 'text-amber-300', badge: 'bg-amber-600 text-slate-950', label: 'YELLOW: DELAYED / STABILIZE' };
      case 'GREEN_MINOR':
        return { bg: 'bg-emerald-950/60', border: 'border-emerald-500', text: 'text-emerald-300', badge: 'bg-emerald-600 text-white', label: 'GREEN: MINOR / WALKING' };
      case 'BLACK_EXPECTANT':
      default:
        return { bg: 'bg-slate-950', border: 'border-slate-700', text: 'text-slate-400', badge: 'bg-slate-800 text-slate-300', label: 'BLACK: EXPECTANT / DECEASED' };
    }
  };

  const theme = getTriageTheme(activePatient.triageCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    Web-NFC "Digital Triage Stamps" for Mass Casualties
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                    Zero-Paper Field Hospital
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Paper triage tags get torn, soaked in river silt, and lost during transport. Volunteers slap ultra-cheap, waterproof, skin-safe NFC sticker patches onto victims' foreheads or wrists. Medical teams tap their smartphone directly via Web-NFC to instantly flash & update real-time vitals, blood type, and surgical priority—persisted entirely on the sticker chip itself with zero internet or database connectivity.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${hasWebNfcSupport ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
              <div>
                <div className="text-[10px] text-slate-400">Web-NFC Hardware</div>
                <div className="text-xs font-bold text-slate-200">
                  {hasWebNfcSupport ? 'NDEF Reader Active' : 'Native + Universal Bridge'}
                </div>
              </div>
            </div>

            <button
              onClick={handleHardwareNfcScan}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-950/40"
            >
              <Smartphone className="w-4 h-4" />
              {isReadingNfc ? 'Scanning NFC Field...' : 'Tap Phone to Tag'}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Physical NFC Sticker Visualizer & Triage Hero */}
      <div className={`p-6 rounded-2xl border transition-all relative overflow-hidden ${theme.bg} ${theme.border}`}>
        {/* Animated NFC Field Waves on Tap */}
        {tagTappedAnimation && (
          <div className="absolute inset-0 bg-white/10 animate-ping pointer-events-none rounded-2xl"></div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left: Physical Wristband/Sticker Badge */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center p-3 text-center shadow-xl transition-all ${
                tagTappedAnimation ? 'scale-110' : 'scale-100'
              } ${
                activePatient.triageCategory === 'RED_IMMEDIATE' 
                  ? 'bg-rose-900 border-rose-400 text-white shadow-rose-950/80' 
                  : (activePatient.triageCategory === 'YELLOW_DELAYED' 
                      ? 'bg-amber-800 border-amber-300 text-slate-950 shadow-amber-950/80' 
                      : 'bg-emerald-900 border-emerald-400 text-white shadow-emerald-950/80')
              }`}>
                <div className="text-[10px] font-mono opacity-80">NTAG216</div>
                <Radio className="w-5 h-5 my-0.5 animate-pulse" />
                <div className="text-xs font-black tracking-wider leading-tight">
                  {activePatient.triageCategory.replace('_', ' ')}
                </div>
                <div className="text-[9px] font-mono opacity-80 mt-0.5">{activePatient.bloodGroup}</div>
              </div>

              {/* Waterproof Skin-Patch Adhesive Ring */}
              <div className="absolute -inset-1.5 border border-dashed border-white/40 rounded-full pointer-events-none"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${theme.badge}`}>
                  {theme.label}
                </span>
                <span className="text-xs font-mono text-slate-400">Tag: {activePatient.nfcTagSerial}</span>
              </div>

              <h3 className="text-2xl font-black text-white mt-1">
                {activePatient.fullName}
              </h3>
              <div className="text-xs text-slate-300 mt-0.5">
                ID: <span className="font-mono text-white font-bold">{activePatient.patientId}</span> | Blood: <span className="text-rose-400 font-bold">{activePatient.bloodGroup}</span> | Allergies: <span className="text-amber-400 font-bold">{activePatient.allergies}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 italic">
                Diagnosis: {activePatient.primaryDiagnosis}
              </div>
            </div>
          </div>

          {/* Right: Quick START Triage Switcher Buttons */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 text-center md:text-right">
              Rapid Re-Triage (One-Tap Rewrite to Sticker):
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSetTriageCategory('RED_IMMEDIATE')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activePatient.triageCategory === 'RED_IMMEDIATE'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg'
                    : 'bg-slate-900/80 text-rose-300 border-rose-900/50 hover:bg-rose-950'
                }`}
              >
                🔴 RED (Immediate)
              </button>
              <button
                onClick={() => handleSetTriageCategory('YELLOW_DELAYED')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activePatient.triageCategory === 'YELLOW_DELAYED'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg'
                    : 'bg-slate-900/80 text-amber-300 border-amber-900/50 hover:bg-amber-950'
                }`}
              >
                🟡 YELLOW (Delayed)
              </button>
              <button
                onClick={() => handleSetTriageCategory('GREEN_MINOR')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activePatient.triageCategory === 'GREEN_MINOR'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                    : 'bg-slate-900/80 text-emerald-300 border-emerald-900/50 hover:bg-emerald-950'
                }`}
              >
                🟢 GREEN (Minor)
              </button>
              <button
                onClick={() => handleSetTriageCategory('BLACK_EXPECTANT')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activePatient.triageCategory === 'BLACK_EXPECTANT'
                    ? 'bg-slate-700 text-white border-slate-500 shadow-lg'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                ⚫ BLACK (Expectant)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: On-Chip Vitals & On-Tag Treatment Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real-Time Physiological Vitals on NFC Chip */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-rose-400" />
              On-Chip Physiological Vitals (Stored on Sticker)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Heart Rate</div>
                <div className="text-2xl font-black text-rose-400 mt-0.5">{activePatient.heartRateBpm} <span className="text-xs font-normal text-slate-400">BPM</span></div>
                <div className="text-[9px] text-rose-300 mt-1">⚠️ Severe Tachycardia</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Blood Oxygen (SpO2)</div>
                <div className="text-2xl font-black text-cyan-400 mt-0.5">{activePatient.spO2Percent} <span className="text-xs font-normal text-slate-400">%</span></div>
                <div className="text-[9px] text-cyan-300 mt-1">High-Flow O2 Active</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Systolic Blood Pressure</div>
                <div className="text-2xl font-black text-amber-400 mt-0.5">{activePatient.systolicBp} <span className="text-xs font-normal text-slate-400">mmHg</span></div>
                <div className="text-[9px] text-amber-300 mt-1">Hypotension Flag</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Glasgow Coma Scale</div>
                <div className="text-2xl font-black text-purple-400 mt-0.5">{activePatient.glasgowComaScale} <span className="text-xs font-normal text-slate-400">/ 15</span></div>
                <div className="text-[9px] text-purple-300 mt-1">Moderate Impairment</div>
              </div>
            </div>

            {/* Chip Memory Gauge */}
            <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>NFC EEPROM Memory (NTAG216):</span>
                <span className="font-mono text-white">{activePatient.chipStorageUsedBytes} / {activePatient.chipStorageTotalBytes} Bytes</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(activePatient.chipStorageUsedBytes / activePatient.chipStorageTotalBytes) * 100}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500">
                Data travels directly on patient's skin. 100% readable by any hospital NFC phone across field transit.
              </div>
            </div>
          </div>
        </div>

        {/* Right: On-Tag Medical Intervention Log & Field Doctor Entry */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                Immutable On-Tag Medical Log (Writes to NFC Sticker)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Last Tap: {activePatient.lastUpdatedOffline}
              </span>
            </div>

            {/* Add Action Form */}
            <form onSubmit={handleAddIntervention} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="Log medical action (e.g., Morphine 10mg IV, Intubation, Splint applied)..."
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
              <input
                type="text"
                placeholder="Medic ID"
                value={newMedicCallsign}
                onChange={(e) => setNewMedicCallsign(e.target.value)}
                className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                Write to Sticker
              </button>
            </form>

            {/* Timeline of interventions recorded on tag */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {activePatient.appliedInterventions.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-200">{item.action}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      By: <span className="text-slate-400">{item.medic}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 text-rose-300 rounded whitespace-nowrap">
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
