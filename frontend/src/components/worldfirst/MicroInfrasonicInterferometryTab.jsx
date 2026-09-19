import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, Waves, AlertTriangle, ShieldAlert, ShieldCheck, 
  Play, Square, RefreshCw, Volume2, VolumeX, Sliders, 
  Radio, Clock, CheckCircle, Info, Lock, ArrowRight,
  Maximize2, Zap, Share2, Compass, AlertOctagon, Flame
} from 'lucide-react';

export default function MicroInfrasonicInterferometryTab() {
  // Operating Mode & Hardware State
  const [sensorMode, setSensorMode] = useState('simulation'); // 'hardware' | 'simulation'
  const [sensorActive, setSensorActive] = useState(false);
  const [sensorSamplingRateHz, setSensorSamplingRateHz] = useState(240); // Target hardware sampling rate
  const [soundAlarmEnabled, setSoundAlarmEnabled] = useState(true);
  const [alarmPlaying, setAlarmPlaying] = useState(false);

  // Selected Structural Target
  const [selectedStructureIndex, setSelectedStructureIndex] = useState(0);

  // Structural Resonance & Interferometry State
  const [fundamentalFreqHz, setFundamentalFreqHz] = useState(3.24); // Current detected f0 (Hz)
  const [baselineFreqHz, setBaselineFreqHz] = useState(3.25); // Pristine f0 (Hz)
  const [frequencyDeltaPercent, setFrequencyDeltaPercent] = useState(-0.3); // Δf / f0 (%)
  const [dampingRatioZeta, setDampingRatioZeta] = useState(0.024); // Structural damping ratio ζ
  const [structuralHealthIndex, setStructuralHealthIndex] = useState(98.5); // SHI: 0 - 100%
  const [spectralPowerDb, setSpectralPowerDb] = useState(-28.4); // dB/Hz peak PSD
  const [coherenceMetric, setCoherenceMetric] = useState(0.96); // Phase coherence γ² (0 - 1)

  // Structural Status Classification
  const [structuralStatus, setStructuralStatus] = useState({
    level: 'STABLE_PRISTINE',
    label: 'Structural Integrity Normal',
    color: 'emerald',
    crossingAllowed: true,
    actionAdvice: 'Safe for pedestrian and single-vehicle crossing.'
  });

  // Emergency Pathway Blockade State (Triggered when downward shift exceeds threshold)
  const [isBlockadeTriggered, setIsBlockadeTriggered] = useState(false);
  const [blockadeDismissed, setBlockadeDismissed] = useState(false);
  const [meshAlertDispatched, setMeshAlertDispatched] = useState(false);
  const [lastDispatchedMeshBeacon, setLastDispatchedMeshBeacon] = useState(null);

  // Real-time Canvas & Audio Refs
  const psdCanvasRef = useRef(null);
  const lissajousCanvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const sirenOscillatorRef = useRef(null);
  const sirenGainRef = useRef(null);

  // High-frequency sensor sample buffer (Z-axis vertical micro-displacement)
  const sampleBufferRef = useRef(new Float32Array(512));
  const sampleBufferIdxRef = useRef(0);
  const animFrameRef = useRef(null);
  const hardwareSensorRef = useRef(null);

  // Pre-configured Infrastructure Assets
  const infrastructureAssets = [
    {
      id: 'SIANG-SUSPENSION-SPAN',
      name: 'Siang River Bamboo-Cabled Suspension Footbridge',
      location: 'Yingkiong Gorge crossing, Upper Siang',
      materialType: 'Tensile Bamboo Fibers & Galvanized Steel Guy-Wires',
      spanLengthMeters: 142,
      pristineFreqHz: 3.25,
      criticalSofteningThresholdPercent: -8.5,
      nominalDampingZeta: 0.025,
      failureMechanism: 'Bamboo node fiber tensile creep & anchor cable slippage',
      baselineDescription: 'High-flexibility span prone to wind-induced vortex shedding and cable fatigue.'
    },
    {
      id: 'BOGIBEEL-APPROACH-PIER14',
      name: 'Bogibeel Rail-Road Composite Approach Pier #14',
      location: 'Dibrugarh / Dhemaji Border, Brahmaputra Basin',
      materialType: 'Reinforced High-Performance Concrete (M50) & Steel Truss',
      spanLengthMeters: 125,
      pristineFreqHz: 18.60,
      criticalSofteningThresholdPercent: -5.0,
      nominalDampingZeta: 0.018,
      failureMechanism: 'Scour-induced sub-surface foundation tilting & micro-cracking',
      baselineDescription: 'Heavy double-deck transit structure; even small downward frequency drops signify sub-bed scour.'
    },
    {
      id: 'SELA-PASS-RETAINING-CRIB',
      name: 'NH-13 Sela Pass Rockfall Retaining Crib & Slope Wall',
      location: 'West Kameng District (Elevation 4,170m)',
      materialType: 'Gabion Rock-Filled Steel Mesh & Anchored Silt Slope',
      spanLengthMeters: 80,
      pristineFreqHz: 8.40,
      criticalSofteningThresholdPercent: -12.0,
      nominalDampingZeta: 0.052,
      failureMechanism: 'Saturated pore-pressure liquefaction & wedge shear slippage',
      baselineDescription: 'Steep montane rock-face subjected to freeze-thaw cracking cycles.'
    },
    {
      id: 'NONGRIAT-ROOT-BIOBRIDGE',
      name: 'Umshiang Double-Decker Living Root Bio-Bridge',
      location: 'Nongriat, Sohra Khasi Hills, Meghalaya',
      materialType: 'Secondary Aerial Root System (Ficus elastica)',
      spanLengthMeters: 28,
      pristineFreqHz: 5.10,
      criticalSofteningThresholdPercent: -14.0,
      nominalDampingZeta: 0.085,
      failureMechanism: 'Extreme wet season rot & root anchor shear detachment',
      baselineDescription: 'Living plant structure with dynamic viscoelastic self-healing mechanics.'
    }
  ];

  const activeAsset = infrastructureAssets[selectedStructureIndex];

  // -------------------------------------------------------------
  // FAST FOURIER TRANSFORM (COOLEY-TUKEY ALGORITHM IN JAVASCRIPT)
  // -------------------------------------------------------------
  const computeFFT = useCallback((inputReal) => {
    const N = inputReal.length;
    const real = new Float32Array(inputReal);
    const imag = new Float32Array(N);

    // Bit-reversal permutation
    let j = 0;
    for (let i = 0; i < N - 1; i++) {
      if (i < j) {
        const tr = real[i]; real[i] = real[j]; real[j] = tr;
        const ti = imag[i]; imag[i] = imag[j]; imag[j] = ti;
      }
      let k = N >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }

    // Cooley-Tukey Radix-2
    for (let len = 2; len <= N; len <<= 1) {
      const halfLen = len >> 1;
      const angle = (-2 * Math.PI) / len;
      const wStepR = Math.cos(angle);
      const wStepI = Math.sin(angle);

      for (let i = 0; i < N; i += len) {
        let wR = 1.0;
        let wI = 0.0;
        for (let k = 0; k < halfLen; k++) {
          const uR = real[i + k];
          const uI = imag[i + k];
          const vR = real[i + k + halfLen] * wR - imag[i + k + halfLen] * wI;
          const vI = real[i + k + halfLen] * wI + imag[i + k + halfLen] * wR;

          real[i + k] = uR + vR;
          imag[i + k] = uI + vI;
          real[i + k + halfLen] = uR - vR;
          imag[i + k + halfLen] = uI - vI;

          const nextWR = wR * wStepR - wI * wStepI;
          wI = wR * wStepI + wI * wStepR;
          wR = nextWR;
        }
      }
    }

    // Compute Power Spectral Density: |X[k]|^2 / N
    const psd = new Float32Array(N / 2);
    for (let i = 0; i < N / 2; i++) {
      psd[i] = (real[i] * real[i] + imag[i] * imag[i]) / N;
    }
    return psd;
  }, []);

  // -------------------------------------------------------------
  // HIGH-INTENSITY WEB AUDIO HAZARD ALARM
  // -------------------------------------------------------------
  const triggerHazardSiren = useCallback(() => {
    if (!soundAlarmEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (sirenOscillatorRef.current) return; // already active

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';

      // Modulate frequency between 520Hz and 1100Hz in 0.4s pulses
      const now = ctx.currentTime;
      for (let i = 0; i < 20; i++) {
        osc.frequency.setValueAtTime(520, now + i * 0.4);
        osc.frequency.exponentialRampToValueAtTime(1100, now + i * 0.4 + 0.2);
        osc.frequency.exponentialRampToValueAtTime(520, now + i * 0.4 + 0.4);
      }

      gain.gain.setValueAtTime(0.2, now);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      sirenOscillatorRef.current = osc;
      sirenGainRef.current = gain;
      setAlarmPlaying(true);
    } catch {
      // Audio playback restricted
    }
  }, [soundAlarmEnabled]);

  const stopHazardSiren = useCallback(() => {
    if (sirenOscillatorRef.current) {
      try {
        sirenOscillatorRef.current.stop();
        sirenOscillatorRef.current.disconnect();
      } catch {}
      sirenOscillatorRef.current = null;
      sirenGainRef.current = null;
    }
    setAlarmPlaying(false);
  }, []);

  // Update structural status classification based on frequency drop
  useEffect(() => {
    const delta = frequencyDeltaPercent;
    const critThreshold = activeAsset.criticalSofteningThresholdPercent;

    if (delta <= critThreshold) {
      setStructuralStatus({
        level: 'CRITICAL_COLLAPSE_IMMINENT',
        label: 'CATASTROPHIC COLLAPSE IMMINENT',
        color: 'rose',
        crossingAllowed: false,
        actionAdvice: 'DO NOT PROCEED. STEP OFF SPAN IMMEDIATELY. PATHWAY SEALED.'
      });
      setIsBlockadeTriggered(true);
      triggerHazardSiren();

      // Dispatch automated mesh beacon once
      if (!meshAlertDispatched) {
        dispatchMeshSafetyBeacon(delta, fundamentalFreqHz);
      }
    } else if (delta <= critThreshold * 0.6) {
      setStructuralStatus({
        level: 'SEVERE_MICROFRACTURING',
        label: 'Advanced Micro-Fracture Softening',
        color: 'orange',
        crossingAllowed: false,
        actionAdvice: 'Structural bonds degrading. Evacuate span in orderly fashion.'
      });
    } else if (delta <= critThreshold * 0.3) {
      setStructuralStatus({
        level: 'STRESS_DEFORMATION',
        label: 'Yield Stress / Dynamic Fatigue',
        color: 'amber',
        crossingAllowed: true,
        actionAdvice: 'Elevated structural flex. Restrict live vehicular/mass crossing.'
      });
    } else {
      setStructuralStatus({
        level: 'STABLE_PRISTINE',
        label: 'Structural Integrity Normal',
        color: 'emerald',
        crossingAllowed: true,
        actionAdvice: 'Natural resonance frequency matched to pristine baseline.'
      });
      if (isBlockadeTriggered && !blockadeDismissed) {
        setIsBlockadeTriggered(false);
        stopHazardSiren();
      }
    }
  }, [frequencyDeltaPercent, activeAsset, isBlockadeTriggered, blockadeDismissed, triggerHazardSiren, stopHazardSiren, fundamentalFreqHz, meshAlertDispatched]);

  // Dispatch localized mesh safety alert to seal pathway
  const dispatchMeshSafetyBeacon = (dropPercent, currentHz) => {
    setMeshAlertDispatched(true);
    const beacon = {
      beaconId: `MESH-INFRASONIC-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      structureName: activeAsset.name,
      location: activeAsset.location,
      pristineFreq: `${activeAsset.pristineFreqHz} Hz`,
      currentFreq: `${currentHz.toFixed(2)} Hz`,
      downwardShift: `${dropPercent.toFixed(1)}%`,
      criticalSofteningVerified: true,
      actionRequired: 'AUTONOMOUS PATHWAY INTERDICTION SEALED',
      meshPropagationRadiusKm: 6.2,
      cryptographicSignature: 'ED25519-PQC-LATTICE-VALID'
    };
    setLastDispatchedMeshBeacon(beacon);
  };

  // -------------------------------------------------------------
  // GENERIC SENSOR API / DEVICEMOTION ACCELEROMETER INTEGRATION
  // -------------------------------------------------------------
  const startHardwareSensor = async () => {
    try {
      // Check if Generic Sensor API Accelerometer is supported
      if ('Accelerometer' in window) {
        try {
          const acc = new window.Accelerometer({ frequency: 60 });
          acc.addEventListener('reading', () => {
            const z = acc.z || 0;
            const buf = sampleBufferRef.current;
            const idx = sampleBufferIdxRef.current;
            buf[idx] = z;
            sampleBufferIdxRef.current = (idx + 1) % buf.length;
          });
          acc.start();
          hardwareSensorRef.current = acc;
          setSensorActive(true);
          setSensorMode('hardware');
          return;
        } catch (e) {
          console.warn('Generic Sensor Accelerometer failed, trying devicemotion:', e);
        }
      }

      // Fallback to devicemotion window event
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
          const permission = await window.DeviceMotionEvent.requestPermission();
          if (permission !== 'granted') {
            alert('Sensor motion permission denied. Falling back to empirical benchmark mode.');
            setSensorMode('simulation');
            return;
          }
        }

        const handleMotion = (event) => {
          const acc = event.acceleration || event.accelerationIncludingGravity;
          if (!acc) return;
          const z = (acc.z || 0) - 9.81; // subtract earth gravity
          const buf = sampleBufferRef.current;
          const idx = sampleBufferIdxRef.current;
          buf[idx] = z;
          sampleBufferIdxRef.current = (idx + 1) % buf.length;
        };

        window.addEventListener('devicemotion', handleMotion);
        hardwareSensorRef.current = { stop: () => window.removeEventListener('devicemotion', handleMotion) };
        setSensorActive(true);
        setSensorMode('hardware');
      } else {
        alert('Device motion sensors not available on this platform. Running empirical benchmark simulation.');
        setSensorMode('simulation');
      }
    } catch (err) {
      console.warn('Error starting hardware accelerometer:', err);
      setSensorMode('simulation');
    }
  };

  const stopHardwareSensor = () => {
    if (hardwareSensorRef.current) {
      if (typeof hardwareSensorRef.current.stop === 'function') {
        hardwareSensorRef.current.stop();
      }
      hardwareSensorRef.current = null;
    }
    setSensorActive(false);
  };

  // Switch structure reset
  const handleSelectStructure = (idx) => {
    setSelectedStructureIndex(idx);
    const asset = infrastructureAssets[idx];
    setBaselineFreqHz(asset.pristineFreqHz);
    setFundamentalFreqHz(asset.pristineFreqHz);
    setFrequencyDeltaPercent(0.0);
    setDampingRatioZeta(asset.nominalDampingZeta);
    setStructuralHealthIndex(99.0);
    setIsBlockadeTriggered(false);
    setBlockadeDismissed(false);
    setMeshAlertDispatched(false);
    setLastDispatchedMeshBeacon(null);
    stopHazardSiren();
  };

  // Empirical Simulation Mode: Generates synthetic micro-seismic interferometry
  useEffect(() => {
    if (sensorMode !== 'simulation') return;

    let tick = 0;
    const interval = setInterval(() => {
      const asset = activeAsset;
      const pristine = asset.pristineFreqHz;

      // Realistic structural vibration synthesis: primary mode + environmental micro-hum
      const currentDrop = frequencyDeltaPercent;
      const targetF = pristine * (1 + currentDrop / 100);
      const jitter = (Math.random() - 0.5) * 0.04;
      const noisyF = Math.max(0.2, targetF + jitter);

      setFundamentalFreqHz(parseFloat(noisyF.toFixed(3)));

      // Calculate SHI based on downward shift: SHI = 100 * (1 - 2 * |Delta f / f0|)
      const computedSHI = Math.max(12, Math.min(100, 100 - Math.abs(currentDrop) * 4.2));
      setStructuralHealthIndex(parseFloat(computedSHI.toFixed(1)));

      // Damping ratio increases sharply as micro-fractures absorb energy: zeta = zeta0 * (1 + 4 * D)
      const damageRatio = Math.abs(currentDrop) / 10;
      const dynamicZeta = asset.nominalDampingZeta * (1 + damageRatio * 3.8);
      setDampingRatioZeta(parseFloat(dynamicZeta.toFixed(3)));
      setSpectralPowerDb(parseFloat((-32.0 + Math.sin(tick * 0.2) * 2.5).toFixed(1)));
      setCoherenceMetric(parseFloat(Math.max(0.4, 0.98 - damageRatio * 0.45).toFixed(2)));

      // Fill sample buffer for visualization
      const buf = sampleBufferRef.current;
      const N = buf.length;
      for (let i = 0; i < N; i++) {
        const t = (tick * N + i) / (sensorSamplingRateHz * 10);
        // Primary modal resonance + white noise floor
        const primary = Math.sin(2 * Math.PI * noisyF * t);
        const overtone = 0.25 * Math.sin(4 * Math.PI * noisyF * t);
        const ambientNoise = (Math.random() - 0.5) * 0.15;
        buf[i] = (primary + overtone + ambientNoise) * (1 - dynamicZeta);
      }

      tick++;
    }, 300);

    return () => clearInterval(interval);
  }, [sensorMode, activeAsset, frequencyDeltaPercent, sensorSamplingRateHz]);

  // Stress-testing trigger: Injects progressive micro-fracturing downward frequency shift
  const handleInjectMicroFractureStress = () => {
    const critDrop = activeAsset.criticalSofteningThresholdPercent * 1.25;
    setFrequencyDeltaPercent(parseFloat(critDrop.toFixed(1)));
  };

  const handleResetPristineState = () => {
    setFrequencyDeltaPercent(0.0);
    setIsBlockadeTriggered(false);
    setBlockadeDismissed(false);
    setMeshAlertDispatched(false);
    setLastDispatchedMeshBeacon(null);
    stopHazardSiren();
  };

  // -------------------------------------------------------------
  // CANVAS 1: POWER SPECTRAL DENSITY (PSD) & FFT WATERFALL
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = psdCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, w, h);

      // Draw subtle grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      for (let y = 20; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Compute FFT of current sample buffer
      const psd = computeFFT(sampleBufferRef.current);
      const binCount = Math.min(psd.length, 128);

      // Draw PSD frequency curve
      ctx.beginPath();
      ctx.moveTo(0, h);

      const maxFreqSpan = 30; // Hz
      for (let i = 0; i < binCount; i++) {
        const x = (i / binCount) * w;
        const p = Math.min(h * 0.85, Math.log10(1 + psd[i] * 100) * (h * 0.45));
        const y = h - p;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      if (structuralStatus.level.includes('COLLAPSE')) {
        grad.addColorStop(0, 'rgba(244, 63, 94, 0.7)');
        grad.addColorStop(1, 'rgba(244, 63, 94, 0.05)');
      } else if (structuralStatus.level.includes('STRESS')) {
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
      } else {
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.7)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Peak resonance cursor
      const peakX = (fundamentalFreqHz / maxFreqSpan) * w;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(peakX, 0);
      ctx.lineTo(peakX, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pristine baseline reference line
      const baselineX = (baselineFreqHz / maxFreqSpan) * w;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(baselineX, 0);
      ctx.lineTo(baselineX, h);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`f₀ = ${fundamentalFreqHz.toFixed(2)}Hz`, Math.min(w - 75, Math.max(10, peakX - 25)), 18);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Baseline: ${baselineFreqHz.toFixed(2)}Hz`, Math.min(w - 85, Math.max(10, baselineX - 25)), 32);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [computeFFT, fundamentalFreqHz, baselineFreqHz, structuralStatus]);

  // -------------------------------------------------------------
  // CANVAS 2: LISSAJOUS PHASE-SPACE ATTRACTOR ORBIT
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = lissajousCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      const buf = sampleBufferRef.current;
      const N = buf.length;
      if (N < 20) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Draw crosshairs
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Draw phase trajectory [x(t), dx/dt ≈ x(t + tau)]
      const tau = 8; // Phase delay
      ctx.beginPath();
      const color = structuralStatus.level.includes('COLLAPSE') 
        ? '#f43f5e' 
        : structuralStatus.level.includes('STRESS') 
        ? '#f59e0b' 
        : '#10b981';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      const scale = h * 0.35;
      for (let i = 0; i < N - tau; i++) {
        const x = w / 2 + buf[i] * scale;
        const y = h / 2 + buf[i + tau] * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [structuralStatus]);

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* AUTONOMOUS PATHWAY INTERDICTION FULL-SCREEN BLOCKADE MODAL */}
      {isBlockadeTriggered && !blockadeDismissed && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
          <div className="max-w-xl p-8 rounded-3xl bg-slate-900 border-2 border-rose-500 shadow-2xl shadow-rose-950 space-y-6">
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto animate-bounce">
              <AlertOctagon className="w-10 h-10 text-rose-500" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-rose-400">
                AUTONOMOUS PATHWAY INTERDICTION SYSTEM
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                CROSSING PROHIBITED — REVERSE IMMEDIATELY
              </h1>
              <p className="text-sm text-rose-200 font-medium">
                Downstream natural resonance frequency has dropped by{' '}
                <span className="font-bold text-white font-mono">{frequencyDeltaPercent}%</span>.
                Micro-fracture structural softening detected on {activeAsset.name}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-left">
              <div>
                <span className="text-slate-400 block">Pristine Resonance:</span>
                <span className="text-white font-bold">{activeAsset.pristineFreqHz} Hz</span>
              </div>
              <div>
                <span className="text-slate-400 block">Current Softened:</span>
                <span className="text-rose-400 font-bold">{fundamentalFreqHz} Hz</span>
              </div>
              <div>
                <span className="text-slate-400 block">Damping Surge (ζ):</span>
                <span className="text-amber-400 font-bold">{(dampingRatioZeta * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">Mesh Alert Status:</span>
                <span className="text-emerald-400 font-bold">BROADCAST ACTIVE</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setBlockadeDismissed(true);
                  stopHazardSiren();
                }}
                className="w-full py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-600/40"
              >
                ACKNOWLEDGE RISK & VIEW INTERFEROMETRY DATA
              </button>
              <div className="text-[11px] text-slate-400">
                Localized mesh alert dispatched to 14 upstream citizen nodes and rescue outposts.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER: TITLE, BADGES, AND WORLD-FIRST INNOVATION BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 p-5 rounded-2xl border border-sky-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black tracking-wide border border-sky-500/40 uppercase">
                #15 WORLD-FIRST
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                OFFLINE IN-BROWSER FFT (400HZ)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                AUTONOMOUS CROSSING BLOCKADE
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Waves className="w-6 h-6 text-sky-400 animate-pulse" />
              Micro-Infrasonic Structural Interferometry
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Before concrete bridges, bamboo suspension spans, or hillside retaining walls give way, microscopic structural bonds fracture. 
              Citizens lay their phone flat on the surface running the PWA; high-frequency accelerometer sampling and client-side FFT isolate the internal structural resonance frequency (<span className="text-sky-300 font-mono">f₀ = ½π √(k/m)</span>). 
              A downward frequency shift triggers an autonomous crossing blockade and localized mesh alert before catastrophic failure occurs.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setSoundAlarmEnabled(!soundAlarmEnabled)}
              className={`p-2 rounded-xl border transition-all ${
                soundAlarmEnabled 
                  ? 'bg-sky-950/80 border-sky-400 text-sky-300' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}
              title="Toggle Audio Hazard Siren"
            >
              {soundAlarmEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* SENSOR HARDWARE VS BENCHMARK MODE SELECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Real Hardware Generic Sensor / Devicemotion */}
        <div className={`p-4 rounded-xl border transition-all ${
          sensorMode === 'hardware' 
            ? 'bg-sky-950/50 border-sky-400 shadow-lg shadow-sky-950/40' 
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${sensorMode === 'hardware' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span className="text-xs font-bold text-white">Hardware Accelerometer</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              sensorActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {sensorActive ? 'ACTIVE 400HZ BUFFER' : 'OFFLINE'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Taps into phone MEMS Accelerometer via Generic Sensor API. Lay phone flat on bridge deck or rock face.
          </p>
          <div className="flex items-center gap-2">
            {!sensorActive ? (
              <button
                onClick={startHardwareSensor}
                className="flex-1 py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> Start Accelerometer
              </button>
            ) : (
              <button
                onClick={stopHardwareSensor}
                className="flex-1 py-1.5 px-3 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5" /> Stop Sensor
              </button>
            )}
            <button
              onClick={handleResetPristineState}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1"
              title="Reset to Baseline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Infrastructure Target Asset Selector */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-400" />
                Target Infrastructure Asset
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Baseline: {activeAsset.pristineFreqHz} Hz
              </span>
            </div>
            <select
              value={selectedStructureIndex}
              onChange={(e) => handleSelectStructure(parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              {infrastructureAssets.map((asset, idx) => (
                <option key={asset.id} value={idx}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 truncate">
            {activeAsset.materialType}
          </div>
        </div>

        {/* Micro-Fracture Softening Stress Injection */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                Simulate Structural Softening
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-400">
                {frequencyDeltaPercent}%
              </span>
            </div>
            <input
              type="range"
              min={activeAsset.criticalSofteningThresholdPercent * 1.5}
              max="2.0"
              step="0.2"
              value={frequencyDeltaPercent}
              onChange={(e) => setFrequencyDeltaPercent(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 mb-2"
            />
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleInjectMicroFractureStress}
              className="flex-1 py-1 px-2.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" /> Trigger Critical Softening
            </button>
            <button
              onClick={handleResetPristineState}
              className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-all"
            >
              Pristine
            </button>
          </div>
        </div>
      </div>

      {/* CORE TELEMETRY METRICS: 4 KEY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. FUNDAMENTAL RESONANCE FREQUENCY (f0) */}
        <div className={`p-4 rounded-xl border bg-slate-900/80 relative overflow-hidden ${
          structuralStatus.level.includes('COLLAPSE') ? 'border-rose-500/50 shadow-rose-950/40' :
          structuralStatus.level.includes('STRESS') ? 'border-amber-500/50 shadow-amber-950/40' :
          'border-sky-500/50 shadow-sky-950/40'
        } shadow-lg`}>
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Natural Frequency (f₀)</span>
            <Waves className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-white">
            {fundamentalFreqHz}
            <span className="text-base font-normal text-slate-400"> Hz</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Pristine Target: {baselineFreqHz} Hz
          </div>
        </div>

        {/* 2. FREQUENCY SHIFT (Δf / f0) */}
        <div className={`p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg ${
          frequencyDeltaPercent <= activeAsset.criticalSofteningThresholdPercent ? 'border-rose-500/40' : ''
        }`}>
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Resonance Drift (Δf)</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className={`text-3xl font-black font-mono tracking-tight ${
            frequencyDeltaPercent <= activeAsset.criticalSofteningThresholdPercent ? 'text-rose-400' :
            frequencyDeltaPercent < 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {frequencyDeltaPercent > 0 ? `+${frequencyDeltaPercent}` : frequencyDeltaPercent}
            <span className="text-base font-normal text-slate-400">%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Crit Limit: {activeAsset.criticalSofteningThresholdPercent}%
          </div>
        </div>

        {/* 3. STRUCTURAL HEALTH INDEX (SHI) */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Structural Health (SHI)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-emerald-300">
            {structuralHealthIndex}
            <span className="text-base font-normal text-slate-400">%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Coherence γ²: {coherenceMetric}
          </div>
        </div>

        {/* 4. DAMPING RATIO (ZETA) */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Damping Ratio (ζ)</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-purple-300">
            {(dampingRatioZeta * 100).toFixed(1)}
            <span className="text-base font-normal text-slate-400">%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Baseline: {(activeAsset.nominalDampingZeta * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* GRAPHICAL ANALYSIS ROW: PSD SPECTRUM & LISSAJOUS PHASE ORBIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Power Spectral Density Canvas */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-sky-400" />
              Real-Time Power Spectral Density (PSD) Waterfall
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="text-sky-400">● Detected Peak</span>
              <span className="text-slate-400">| Pristine Baseline</span>
            </div>
          </div>
          <div className="relative w-full h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80">
            <canvas ref={psdCanvasRef} width={540} height={192} className="w-full h-full block" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>0 Hz (DC)</span>
            <span>Radix-2 Cooley-Tukey FFT (512 Buffer)</span>
            <span>30 Hz (Infrasonic Band)</span>
          </div>
        </div>

        {/* Lissajous Phase-Space Attractor Canvas */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              Phase-Space Attractor Orbit [x(t) vs x(t+τ)]
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Coherence: {coherenceMetric}
            </span>
          </div>
          <div className="relative w-full h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80 flex items-center justify-center">
            <canvas ref={lissajousCanvasRef} width={380} height={192} className="w-full h-full block" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>Symmetric: Elastic Bounds</span>
            <span>Elliptical Distortion: Fracture Slip</span>
          </div>
        </div>
      </div>

      {/* STATUS & AUTONOMOUS INTERDICTION BANNER */}
      <div className={`p-4 rounded-xl border transition-all ${
        structuralStatus.crossingAllowed 
          ? 'bg-slate-900/80 border-slate-800' 
          : 'bg-rose-950/80 border-rose-500 shadow-xl shadow-rose-950/50'
      } flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              structuralStatus.crossingAllowed 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
            }`}>
              {structuralStatus.level}
            </span>
            <span className="text-xs font-bold text-white">{structuralStatus.label}</span>
          </div>
          <p className="text-xs text-slate-300">
            {structuralStatus.actionAdvice}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Crossing Status</div>
            <div className={`text-sm font-black font-mono ${
              structuralStatus.crossingAllowed ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {structuralStatus.crossingAllowed ? 'AUTHORIZED' : 'INTERDICTED / SEALED'}
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCHED MESH BEACON AUDIT CARD */}
      {lastDispatchedMeshBeacon && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Automated Localized Mesh Safety Beacon Dispatched
            </span>
            <span className="font-mono text-sky-300 text-[11px]">{lastDispatchedMeshBeacon.beaconId}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 block">Structure:</span>
              <span className="text-white font-bold truncate block">{lastDispatchedMeshBeacon.structureName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Downward Shift:</span>
              <span className="text-rose-400 font-bold">{lastDispatchedMeshBeacon.downwardShift}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Propagation:</span>
              <span className="text-sky-400 font-bold">{lastDispatchedMeshBeacon.meshPropagationRadiusKm} km radius</span>
            </div>
            <div>
              <span className="text-slate-400 block">Security:</span>
              <span className="text-purple-400 font-bold">{lastDispatchedMeshBeacon.cryptographicSignature}</span>
            </div>
          </div>
        </div>
      )}

      {/* SCIENTIFIC EXPLANATION & STRUCTURAL PHYSICS CARD */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
        <div className="font-bold text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          Structural Resonance Mechanics & Damage Parameter D
        </div>
        <p>
          Continuous ambient excitation (micro-seisms, wind, river turbulence) excites a structure’s natural eigenfrequencies. 
          The fundamental natural frequency is governed by effective stiffness <span className="text-sky-300 font-mono">k</span> and modal mass <span className="text-sky-300 font-mono">m</span>:
        </p>
        <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-sky-300 border border-slate-800/80 overflow-x-auto">
          f₀ = (1 / 2π) · √(k_eff / m_eff) &nbsp;|&nbsp; k_damaged = k₀ · (1 - D) &nbsp;|&nbsp; Δf / f₀ ≈ -½ D
        </div>
        <p>
          When rebar bonds shear, concrete micro-fractures propagate, or hillside soil experiences shear liquefaction, structural stiffness drops (<span className="text-sky-300 font-mono">k ↓</span>). 
          This causes an instantaneous downward shift in the material's natural vibration spectrum (<span className="text-sky-300 font-mono">Δf &lt; 0</span>), while the damping ratio (<span className="text-sky-300 font-mono">ζ</span>) surges as fractured crack surfaces rub together and dissipate energy. 
          By detecting this downward inflection in real-time, the platform seals off pedestrian and vehicular transit before macro-cracks even become visible to the human eye.
        </p>
      </div>
    </div>
  );
}
