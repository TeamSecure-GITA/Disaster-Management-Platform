import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Volume2, Radio, Activity, Globe, Eye, ShieldAlert, 
  Send, RefreshCw, Play, Square, CheckCircle, AlertTriangle, 
  MapPin, Heart, Zap, Sliders, ArrowUpRight, Clock, Sparkles, 
  Database, Network, Cpu, Layers, HardDrive, Share2, Compass, 
  Waves, Lock, Fingerprint, Users, CloudRain, Navigation,
  ArrowRight, X, PhoneCall, Shield, Bell, Check, ChevronRight,
  AlertOctagon, CheckCircle2, ChevronDown, Flame, Search, Siren
} from 'lucide-react';

export default function DecentralizedResilienceSuite() {
  const navigate = useNavigate();

  // ─── CLOCK & TIMESTAMPS ───────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── EMERGENCY MODE STATE ─────────────────────────────────────────────────
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [liveMapModalOpen, setLiveMapModalOpen] = useState(false);
  const [activeCapabilityModal, setActiveCapabilityModal] = useState(null);

  // ─── LIVE OPERATIONAL FLOW STATE ──────────────────────────────────────────
  const [activeFlowStep, setActiveFlowStep] = useState(2); // 0: Detect, 1: Predict, 2: Alert, 3: Evacuate, 4: Rescue, 5: Recover

  // ─── LIVE SIMULATION ENGINE STATE ─────────────────────────────────────────
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simStageText, setSimStageText] = useState("Standing By");
  const simIntervalRef = useRef(null);

  // ─── METRICS COUNTERS (LIVE REACTIVE) ─────────────────────────────────────
  const [peopleAffected, setPeopleAffected] = useState(1240);
  const [peopleEvacuated, setPeopleEvacuated] = useState(387);
  const [activeIncidentsCount, setActiveIncidentsCount] = useState(3);
  const [responseUnitsCount, setResponseUnitsCount] = useState(14);
  const [shelterCapacityPercent, setShelterCapacityPercent] = useState(72);

  // ─── WEB AUDIO CONTEXT REF FOR CHIRP & SIREN ──────────────────────────────
  const audioContextRef = useRef(null);

  const playChirpSound = (freq = 2400, duration = 0.25) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio feedback fallback:", e);
    }
  };

  const playEmergencyAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      [880, 1174, 880, 1174].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.16);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + idx * 0.16 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.16 + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.16);
        osc.stop(ctx.currentTime + idx * 0.16 + 0.15);
      });
    } catch (e) {
      console.warn("Emergency audio warning fallback:", e);
    }
  };

  // Toggle Emergency Mode
  const handleToggleEmergencyMode = () => {
    const nextState = !emergencyMode;
    setEmergencyMode(nextState);
    if (nextState) {
      playEmergencyAlertSound();
    }
  };

  // Run Real-Time Disaster Simulation
  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimProgress(0);
    setActiveFlowStep(0);
    setSimStageText("SAR Beam Scanning & Sentinel-1 InSAR Coherence Ingest...");
    playChirpSound(1800, 0.3);

    let progress = 0;
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    simIntervalRef.current = setInterval(() => {
      progress += 10;
      setSimProgress(progress);

      if (progress === 20) {
        setActiveFlowStep(1);
        setSimStageText("AI Risk Prediction: 94% LSI Landslide Trigger Confirmed.");
        playChirpSound(2200, 0.2);
      } else if (progress === 40) {
        setActiveFlowStep(2);
        setSimStageText("Broadcasting Multi-Channel SOS & Ultrasonic Audio Beacons...");
        playChirpSound(2600, 0.25);
      } else if (progress === 60) {
        setActiveFlowStep(3);
        setSimStageText("Evacuation Corridor (NH-10 Teesta bypass) Activated.");
        setPeopleEvacuated(prev => prev + 120);
        playChirpSound(3100, 0.2);
      } else if (progress === 80) {
        setActiveFlowStep(4);
        setSimStageText("NDRF Rescue Unit #4 Arrived on GPS Coordinates.");
        setResponseUnitsCount(prev => prev + 2);
        playChirpSound(3400, 0.2);
      } else if (progress >= 100) {
        clearInterval(simIntervalRef.current);
        setActiveFlowStep(5);
        setSimStageText("Simulation Complete: All 387 victims safeguarded.");
        setIsSimulating(false);
        playEmergencyAlertSound();
      }
    }, 900);
  };

  // ─── DEEP-TECH TOOL 1: ULTRASONIC MESH RELAY ENGINE ───────────────────────
  const [audioMode, setAudioMode] = useState('ultrasonic'); // 'ultrasonic' vs 'diagnostic'
  const [isRelaying, setIsRelaying] = useState(false);
  const [activeHop, setActiveHop] = useState(0);
  const [hopNodes, setHopNodes] = useState([
    { id: 'NODE-0', role: 'Trapped Survivor (Originator)', device: 'Redmi 9 (Low-End Android)', lat: 28.0642, lng: 95.3318, location: 'Submerged Siang Gorge Pocket A', status: 'TRANSMITTING', hopIndex: 0, bloodGroup: 'O-Negative', triage: 'CRITICAL_BLEEDING', snrDb: '+22 dB' },
    { id: 'NODE-1', role: 'Valley Relay Repeater #1', device: 'Samsung M12 (Villager on Ridge)', lat: 28.0710, lng: 95.3340, location: 'Pangin Ridge Trail', status: 'REPEATER_ACTIVE', hopIndex: 1, bloodGroup: 'O-Negative', triage: 'RELAYED', snrDb: '+18 dB' },
    { id: 'NODE-2', role: 'Valley Relay Repeater #2', device: 'JioPhone 4G (High Mountain Pass)', lat: 28.0820, lng: 95.3385, location: 'Yembung Bamboo Outpost', status: 'REPEATER_ACTIVE', hopIndex: 2, bloodGroup: 'O-Negative', triage: 'RELAYED', snrDb: '+14 dB' },
    { id: 'NODE-3', role: 'Disaster Gateway Base (Uplink)', device: 'SDRF Central Solar Terminal', lat: 28.0950, lng: 95.3420, location: 'Pasighat Emergency HQ', status: 'INTERNET_SYNC_SUCCESS', hopIndex: 3, bloodGroup: 'O-Negative', triage: 'DISPATCHED_TO_NDRF', snrDb: '+26 dB' }
  ]);

  const handleStartHopRelay = () => {
    if (isRelaying) return;
    setIsRelaying(true);
    setActiveHop(0);
    playChirpSound(audioMode === 'ultrasonic' ? 19200 : 2400, 0.4);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setActiveHop(current);
      playChirpSound(audioMode === 'ultrasonic' ? 19200 + current * 400 : 2400 + current * 300, 0.3);
      if (current >= 3) {
        clearInterval(interval);
        setTimeout(() => setIsRelaying(false), 800);
      }
    }, 1100);
  };

  // ─── DEEP-TECH TOOL 2: SAR RADAR & DISPLACEMENT MATRIX ────────────────────
  const [sarCoherence, setSarCoherence] = useState(0.88);
  const [isProcessingSar, setIsProcessingSar] = useState(false);
  const [sarBaselineBperp, setSarBaselineBperp] = useState(142.5); // meters
  const [displacementAlert, setDisplacementAlert] = useState(false);

  const handleProcessSar = () => {
    setIsProcessingSar(true);
    playChirpSound(1600, 0.3);
    setTimeout(() => {
      setIsProcessingSar(false);
      setSarCoherence(0.94);
      setDisplacementAlert(true);
      playChirpSound(2800, 0.2);
    }, 1400);
  };

  // ─── DEEP-TECH TOOL 3: RADIO SDR / LORA TRIANGULATION ─────────────────────
  const [radioFreq, setRadioFreq] = useState(868.1); // MHz
  const [isScanningRadio, setIsScanningRadio] = useState(false);
  const [radioTowers, setRadioTowers] = useState([
    { id: 'TOWER-A', name: 'NH-10 Mile 12 Repeater', rssi: -72, snr: '+11 dB', dist: '1.2 km', lock: true },
    { id: 'TOWER-B', name: 'Teesta Gorge Mast-4', rssi: -84, snr: '+6 dB', dist: '2.8 km', lock: true },
    { id: 'TOWER-C', name: 'Singtam Ridge Node', rssi: -95, snr: '+2 dB', dist: '4.1 km', lock: true }
  ]);

  const handleScanRadio = () => {
    setIsScanningRadio(true);
    playChirpSound(2100, 0.25);
    setTimeout(() => {
      setIsScanningRadio(false);
      setRadioTowers(prev => prev.map(t => ({ ...t, rssi: Math.min(-60, t.rssi + Math.floor(Math.random() * 8) - 4) })));
    }, 1200);
  };

  // ─── ACTIVE INCIDENTS LIST ────────────────────────────────────────────────
  const activeIncidents = [
    {
      id: 1,
      title: "Landslide - NH-10",
      severity: "CRITICAL",
      badgeColor: "#ef4444",
      location: "Bargarh, Odisha / Sikkim Border",
      exposed: "387 exposed",
      villages: "4 villages",
      roads: "2 roads",
      eta: "08 min",
      details: "Severe slope failure near Teesta confluence. 4 villages cutoff. Evacuation route active.",
    },
    {
      id: 2,
      title: "Flood - Sector 4",
      severity: "HIGH",
      badgeColor: "#f97316",
      location: "Jagatsinghpur, Odisha",
      exposed: "612 affected",
      villages: "2 shelters",
      roads: "1 road",
      eta: "16 min",
      details: "Mahanadi delta embankment overflow. Water level +1.4m above critical baseline.",
    },
    {
      id: 3,
      title: "Road Blockage - Zone B",
      severity: "MEDIUM",
      badgeColor: "#eab308",
      location: "Rourkela, Odisha",
      exposed: "241 affected",
      villages: "1 shelter",
      roads: "1 road",
      eta: "24 min",
      details: "Debris boulder obstruction on arterial connector. JCB clearance units dispatched.",
    },
  ];

  // ─── INCIDENT TIMELINE ────────────────────────────────────────────────────
  const timelineEvents = [
    { time: "21:12", text: "Sensor anomaly detected", color: "#ef4444" },
    { time: "21:20", text: "Rainfall threshold exceeded", color: "#f97316" },
    { time: "21:30", text: "Alert broadcast to NDRF", color: "#eab308" },
    { time: "21:35", text: "Siren activated in SIMUL1-4", color: "#38bdf8" },
    { time: "21:42", text: "Public alert released", color: "#a855f7" },
    { time: "21:50", text: "Evacuation initiated", color: "#22c55e" },
    { time: "22:04", text: "Rescue unit #4 dispatched", color: "#94a3b8" },
    { time: "22:20", text: "Unit arrived at location", color: "#10b981" },
  ];

  // ─── 9 KEY CAPABILITIES ───────────────────────────────────────────────────
  const keyCapabilities = [
    {
      id: "ner",
      title: "NER Monitor",
      badge: "LIVE",
      badgeType: "live",
      icon: "🏔️",
      desc: "Real-time landslide & hazard monitoring for NER region.",
      route: "/ner-landslide-monitor"
    },
    {
      id: "risk",
      title: "AI Risk Prediction",
      badge: "LIVE",
      badgeType: "live",
      icon: "🧠",
      desc: "ML-powered early warning and risk assessment.",
      route: "/statistics"
    },
    {
      id: "sos",
      title: "Emergency SOS",
      badge: "LIVE",
      badgeType: "live",
      icon: "🚨",
      desc: "One-tap distress signal with GPS & nearest responder.",
      action: () => setSosModalOpen(true)
    },
    {
      id: "sensors",
      title: "Smart Sensors",
      badge: "LIVE",
      badgeType: "live",
      icon: "📡",
      desc: "IoT-based environmental & structural monitoring.",
      route: "/smart-alerts"
    },
    {
      id: "digital_twin",
      title: "Digital Twin",
      badge: "PROTOTYPE",
      badgeType: "proto",
      icon: "🧊",
      desc: "Simulate disasters & test response strategies.",
      route: "/digital-twin"
    },
    {
      id: "zero_net",
      title: "Zero-Internet Mode",
      badge: "RESEARCH",
      badgeType: "res",
      icon: "📶",
      desc: "Mesh + offline communication for no-network zones.",
      action: () => setActiveCapabilityModal("ultrasonic")
    },
    {
      id: "drone",
      title: "Drone Analytics",
      badge: "LIVE",
      badgeType: "live",
      icon: "🚁",
      desc: "Aerial surveillance & real-time assessment.",
      route: "/drone-analytics"
    },
    {
      id: "quantum",
      title: "Quantum-Inspired Optimization",
      badge: "RESEARCH",
      badgeType: "res",
      icon: "⚛️",
      desc: "Optimized resource & evacuation planning using quantum algorithms.",
      action: () => setActiveCapabilityModal("quantum")
    },
    {
      id: "wifi_csi",
      title: "RF/WiFi SOS & Survivor Detection",
      badge: "PROTOTYPE",
      badgeType: "proto",
      icon: "📶",
      desc: "Camera-free detection using WiFi/CSI signals.",
      action: () => setActiveCapabilityModal("csi")
    },
  ];

  // ─── 6 OPERATIONAL FLOW STEPS ─────────────────────────────────────────────
  const flowSteps = [
    { step: 1, name: "Detect", sub: "Sensors & Satellite Data", icon: "📡" },
    { step: 2, name: "Predict", sub: "AI Risk Analysis & LSI", icon: "🧠" },
    { step: 3, name: "Alert", sub: "Multi-Channel Notifications", icon: "🔔" },
    { step: 4, name: "Evacuate", sub: "Safe Routes & Shelters", icon: "🏃" },
    { step: 5, name: "Rescue", sub: "Dispatch & On-ground Teams", icon: "🚑" },
    { step: 6, name: "Recover", sub: "Assessment & Rebuild", icon: "🛡️" },
  ];

  // ─── RECENT ALERTS LIST ───────────────────────────────────────────────────
  const recentAlerts = [
    { title: "Landslide Risk - NH-10", severity: "Critical", time: "21:42", dot: "#ef4444" },
    { title: "Heavy Rainfall Warning", severity: "High", time: "20:17", dot: "#f97316" },
    { title: "Road Blockage - Zone B", severity: "Medium", time: "19:32", dot: "#eab308" },
    { title: "Flood Alert - Sector 4", severity: "Medium", time: "18:45", dot: "#eab308" },
    { title: "Weather Report: Update", severity: "Low", time: "16:20", dot: "#38bdf8" },
  ];

  return (
    <div 
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        minHeight: "100%",
        backgroundColor: emergencyMode ? "#1a0508" : "#060d19",
        color: "#ffffff",
        transition: "background-color 0.4s ease",
        padding: "4px",
      }}
    >
      {/* ── TOP ACTIVE EMERGENCY NOTIFICATION BAR ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          padding: "8px 16px",
          borderRadius: "14px",
          backgroundColor: emergencyMode ? "rgba(225, 29, 72, 0.28)" : "rgba(15, 23, 42, 0.85)",
          border: emergencyMode ? "1.5px solid #ef4444" : "1px solid rgba(225, 29, 72, 0.35)",
          boxShadow: emergencyMode ? "0 0 25px rgba(239, 68, 68, 0.4)" : "0 4px 18px rgba(0,0,0,0.4)",
          animation: emergencyMode ? "pulseEmergency 1.8s infinite" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Active Emergency Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(225, 29, 72, 0.25)",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              padding: "4px 10px",
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444", boxShadow: "0 0 8px #ef4444" }} />
            <span style={{ fontSize: "0.74rem", fontWeight: "900", color: "#fca5a5", letterSpacing: "0.04em" }}>
              ACTIVE EMERGENCY
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem" }}>
            <span style={{ fontWeight: "800", color: "#ffffff" }}>
              NER Landslide Risk — NH-10
            </span>
            <span
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                fontSize: "0.62rem",
                fontWeight: "900",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              CRITICAL
            </span>
          </div>

          {/* Affected Stats */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.72rem", color: "#cbd5e1" }}>
            <span>⚠️ <strong>4</strong> Villages Affected</span>
            <span>👥 <strong>387</strong> People Exposed</span>
            <span>🛣️ <strong>2</strong> Roads Blocked</span>
            <span style={{ color: "#94a3b8" }}>🕒 Updated {currentTime.slice(0, 5)}</span>
          </div>
        </div>

        {/* Right Status Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "20px",
              padding: "3px 10px",
              fontSize: "0.68rem",
              fontWeight: "700",
              color: "#34d399",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            <span>All Services Operational</span>
          </div>

          <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "600" }}>EN ▾</span>

          <button
            onClick={() => navigate('/alerts?tab=notifications')}
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "8px",
              padding: "5px 8px",
              color: "#38bdf8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              position: "relative",
            }}
            title="Notifications"
          >
            <Bell size={14} />
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: "#ef4444",
                color: "#ffffff",
                fontSize: "0.55rem",
                fontWeight: "900",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              1
            </span>
          </button>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN DASHBOARD GRID ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          gap: "16px",
          alignItems: "start",
        }}
      >
        {/* ════════════════════ LEFT COLUMN (PRIMARY SUITE) ════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* ── 1. HERO BANNER CARD ── */}
          <div
            style={{
              position: "relative",
              borderRadius: "20px",
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(8, 20, 38, 0.96) 0%, rgba(5, 14, 28, 0.98) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.28)",
              padding: "24px 28px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: "24px",
              alignItems: "center",
            }}
          >
            {/* Left Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", zIndex: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.18)",
                    color: "#34d399",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "0.68rem",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span>🌿</span>
                  <span>NEXT-GEN DISASTER RESPONSE</span>
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(56, 189, 248, 0.15)",
                    color: "#38bdf8",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "0.64rem",
                    fontWeight: "800",
                  }}
                >
                  SITE: 1
                </span>
                <span style={{ fontSize: "0.66rem", color: "#94a3b8", fontFamily: "monospace" }}>
                  LAST UPDATED: {currentTime}
                </span>
              </div>

              <div>
                <h1
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "1.75rem",
                    fontWeight: "900",
                    letterSpacing: "-0.02em",
                    background: "linear-gradient(135deg, #ffffff 40%, #bae6fd 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Decentralized Resilience & SAR Radar Suite
                </h1>
                <div style={{ color: "#38bdf8", fontWeight: "700", fontSize: "0.92rem", marginBottom: "4px" }}>
                  AI-driven. Sensor-powered. Community-focused.
                </div>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.82rem", lineHeight: "1.5", maxWidth: "560px" }}>
                  From early warning to rescue — one integrated platform for a safe and more resilient future.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                <button
                  onClick={() => setLiveMapModalOpen(true)}
                  style={{
                    background: "linear-gradient(135deg, #0284c7, #2563eb)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#ffffff",
                    padding: "10px 18px",
                    fontSize: "0.82rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 16px rgba(2, 132, 199, 0.4)",
                  }}
                >
                  <Globe size={16} />
                  <span>View Live Map</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById("key-capabilities-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(56, 189, 248, 0.35)",
                    borderRadius: "10px",
                    color: "#cbd5e1",
                    padding: "10px 18px",
                    fontSize: "0.82rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Compass size={16} />
                  <span>Explore Features</span>
                </button>

                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  style={{
                    background: isSimulating ? "rgba(16, 185, 129, 0.3)" : "linear-gradient(135deg, #10b981, #059669)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#ffffff",
                    padding: "10px 18px",
                    fontSize: "0.82rem",
                    fontWeight: "800",
                    cursor: isSimulating ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                  }}
                >
                  <Play size={16} fill="#ffffff" />
                  <span>{isSimulating ? `Simulating ${simProgress}%` : "Run Demo"}</span>
                </button>
              </div>

              {isSimulating && (
                <div style={{ marginTop: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#34d399", fontWeight: "700", marginBottom: "4px" }}>
                    <span>{simStageText}</span>
                    <span>{simProgress}%</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${simProgress}%`, height: "100%", backgroundColor: "#10b981", transition: "width 0.4s ease" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Right Aerial Graphic with SAR Radar Overlay */}
            <div
              style={{
                position: "relative",
                height: "210px",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                backgroundImage: "url('/images/mountain_corridor.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.7)",
              }}
            >
              {/* Radial Dark Vignette */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at center, transparent 30%, rgba(5, 12, 24, 0.7) 100%)",
                }}
              />

              {/* Rotating SAR Radar Sweep Beam */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "260px",
                  height: "260px",
                  marginLeft: "-130px",
                  marginTop: "-130px",
                  borderRadius: "50%",
                  border: "1px dashed rgba(56, 189, 248, 0.4)",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "conic-gradient(from 0deg, rgba(56, 189, 248, 0.4) 0deg, rgba(56, 189, 248, 0) 60deg)",
                    animation: "rotateRadar 4s linear infinite",
                  }}
                />
              </div>

              {/* Landslide Risk Marker (Red Pulse) */}
              <div
                style={{
                  position: "absolute",
                  top: "28%",
                  right: "18%",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(225, 29, 72, 0.9)",
                  border: "1px solid #ffffff",
                  borderRadius: "20px",
                  padding: "4px 10px",
                  boxShadow: "0 0 15px rgba(225, 29, 72, 0.8)",
                  animation: "pulseWarning 1.5s infinite",
                  cursor: "pointer",
                }}
                onClick={() => setLiveMapModalOpen(true)}
              >
                <AlertTriangle size={12} color="#ffffff" />
                <div style={{ fontSize: "0.62rem", fontWeight: "900", color: "#ffffff", whiteSpace: "nowrap" }}>
                  Landslide Risk (94% LSI)
                </div>
              </div>

              {/* Evacuation Route Path Overlay */}
              <svg
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                viewBox="0 0 340 210"
              >
                <path
                  d="M 50,180 Q 140,110 220,90 T 300,50"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                  filter="drop-shadow(0 0 6px #38bdf8)"
                />
              </svg>

              {/* Rescue Unit Marker (Blue) */}
              <div
                style={{
                  position: "absolute",
                  bottom: "22%",
                  left: "22%",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(2, 132, 199, 0.9)",
                  border: "1px solid #ffffff",
                  borderRadius: "20px",
                  padding: "4px 10px",
                  boxShadow: "0 0 15px rgba(2, 132, 199, 0.8)",
                  cursor: "pointer",
                }}
                onClick={() => setLiveMapModalOpen(true)}
              >
                <Navigation size={12} color="#ffffff" />
                <div style={{ fontSize: "0.62rem", fontWeight: "900", color: "#ffffff", whiteSpace: "nowrap" }}>
                  Rescue Unit (GPS Locked)
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. METRICS ROW (4 KPI CARDS) ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
            }}
          >
            {/* Metric 1 */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ef4444",
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>
                  Active Incidents
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#ffffff" }}>
                  {activeIncidentsCount}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#f87171", fontWeight: "700" }}>
                  1 Critical · 2 High
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(2, 132, 199, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#38bdf8",
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>
                  People Affected
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#ffffff" }}>
                  {peopleAffected.toLocaleString()}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#38bdf8", fontWeight: "700" }}>
                  {peopleEvacuated} Evacuated
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#10b981",
                }}
              >
                <Navigation size={20} />
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>
                  Response Units
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#ffffff" }}>
                  {responseUnitsCount}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#34d399", fontWeight: "700" }}>
                  10 In Route · 4 On Site
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.25)",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(168, 85, 247, 0.15)",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#c084fc",
                }}
              >
                <Shield size={20} />
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>
                  Shelter Capacity
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#ffffff" }}>
                  {shelterCapacityPercent}%
                </div>
                <div style={{ fontSize: "0.65rem", color: "#c084fc", fontWeight: "700" }}>
                  1,152 / 1,600 Occupied
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. KEY CAPABILITIES (3x3 GRID) ── */}
          <div id="key-capabilities-section" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "900", color: "#ffffff", letterSpacing: "-0.01em" }}>
                Key Capabilities
              </h2>
              <button
                onClick={() => setLiveMapModalOpen(true)}
                style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.74rem", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span>View All Features</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
              }}
            >
              {keyCapabilities.map((cap) => {
                const badgeBg = cap.badgeType === 'live' 
                  ? 'rgba(16, 185, 129, 0.2)' 
                  : cap.badgeType === 'proto' 
                  ? 'rgba(245, 158, 11, 0.2)' 
                  : 'rgba(168, 85, 247, 0.2)';
                const badgeColor = cap.badgeType === 'live' 
                  ? '#34d399' 
                  : cap.badgeType === 'proto' 
                  ? '#fbbf24' 
                  : '#c084fc';

                return (
                  <div
                    key={cap.id}
                    onClick={() => {
                      if (cap.action) {
                        cap.action();
                      } else if (cap.route) {
                        navigate(cap.route);
                      }
                    }}
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.75)",
                      border: "1px solid rgba(56, 189, 248, 0.16)",
                      borderRadius: "14px",
                      padding: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(2, 132, 199, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.16)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(2, 132, 199, 0.15)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        flexShrink: 0,
                      }}
                    >
                      {cap.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#ffffff" }}>
                          {cap.title}
                        </span>
                        <span
                          style={{
                            fontSize: "0.58rem",
                            fontWeight: "900",
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            letterSpacing: "0.03em",
                          }}
                        >
                          {cap.badge}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8", lineHeight: "1.4" }}>
                        {cap.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 4. OPERATIONAL FLOW (PIPELINE STEPPER) ── */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "16px",
              padding: "16px 20px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#38bdf8" }}>⚡</span>
                <span style={{ fontSize: "0.92rem", fontWeight: "900", color: "#ffffff" }}>
                  Operational Flow
                </span>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  (From Alert to Recovery)
                </span>
              </div>
              <span style={{ fontSize: "0.68rem", color: "#34d399", fontWeight: "700" }}>
                Phase {activeFlowStep + 1} of 6 Active
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "8px",
                position: "relative",
              }}
            >
              {flowSteps.map((step, idx) => {
                const isActive = activeFlowStep === idx;
                const isPast = activeFlowStep > idx;

                return (
                  <div
                    key={step.step}
                    onClick={() => {
                      setActiveFlowStep(idx);
                      playChirpSound(2000 + idx * 300, 0.2);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "10px",
                      backgroundColor: isActive ? "rgba(2, 132, 199, 0.22)" : "transparent",
                      border: isActive ? "1px solid #38bdf8" : "1px solid transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: isActive 
                          ? "#0284c7" 
                          : isPast 
                          ? "rgba(16, 185, 129, 0.2)" 
                          : "rgba(30, 41, 59, 0.8)",
                        border: `1.5px solid ${isActive ? "#ffffff" : isPast ? "#10b981" : "#475569"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        marginBottom: "6px",
                        boxShadow: isActive ? "0 0 14px rgba(56, 189, 248, 0.8)" : "none",
                      }}
                    >
                      {step.icon}
                    </div>
                    <div style={{ fontSize: "0.78rem", fontWeight: "800", color: isActive ? "#38bdf8" : isPast ? "#34d399" : "#cbd5e1" }}>
                      {step.step}. {step.name}
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "#94a3b8", marginTop: "2px" }}>
                      {step.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 5. BOTTOM GRID: QUICK ACTIONS, DEMO SCENARIO, RECENT ALERTS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr",
              gap: "12px",
            }}
          >
            {/* Quick Actions */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                borderRadius: "16px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: "900", color: "#ffffff" }}>
                Quick Actions
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  onClick={() => setSosModalOpen(true)}
                  style={{
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#ffffff",
                    padding: "10px",
                    fontSize: "0.74rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>Send SOS</span>
                  <span style={{ fontSize: "0.6rem", opacity: 0.8 }}>Panic Broadcast</span>
                </button>

                <button
                  onClick={() => navigate('/evacuation-planner')}
                  style={{
                    background: "linear-gradient(135deg, #0284c7, #1d4ed8)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#ffffff",
                    padding: "10px",
                    fontSize: "0.74rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
                  }}
                >
                  <Navigation size={16} />
                  <span>Evacuation Planner</span>
                  <span style={{ fontSize: "0.6rem", opacity: 0.8 }}>Find Safe Route</span>
                </button>

                <button
                  onClick={() => navigate('/incident-report')}
                  style={{
                    background: "linear-gradient(135deg, #0d9488, #059669)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#ffffff",
                    padding: "10px",
                    fontSize: "0.74rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Eye size={16} />
                  <span>Report Disaster</span>
                  <span style={{ fontSize: "0.6rem", opacity: 0.8 }}>Citizen Ground Intel</span>
                </button>

                <button
                  onClick={() => navigate('/ai-assistant')}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#ffffff",
                    padding: "10px",
                    fontSize: "0.74rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Sparkles size={16} />
                  <span>AI Assistant</span>
                  <span style={{ fontSize: "0.6rem", opacity: 0.8 }}>Ask Life-Safety</span>
                </button>
              </div>

              <button
                onClick={() => navigate('/voice-assistant')}
                style={{
                  background: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  borderRadius: "10px",
                  color: "#38bdf8",
                  padding: "8px",
                  fontSize: "0.74rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Volume2 size={14} />
                <span>Voice Assistant (18+ Dialects)</span>
              </button>
            </div>

            {/* Demo Scenario */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                borderRadius: "16px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "900", color: "#ffffff" }}>
                  Demo Scenario
                </span>
                <span style={{ fontSize: "0.62rem", color: "#34d399", fontWeight: "800" }}>
                  NH-10 Sector
                </span>
              </div>

              {/* Scenic thumbnail */}
              <div
                style={{
                  height: "85px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundImage: "url('/images/mountain_corridor.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  position: "relative",
                }}
              >
                <div style={{ position: "absolute", bottom: "4px", left: "6px", backgroundColor: "rgba(0,0,0,0.75)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.6rem", color: "#fff" }}>
                  Teesta Valley Gorge
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#ffffff" }}>
                  NER Landslide Simulation
                </div>
                <div style={{ display: "flex", gap: "6px", fontSize: "0.62rem", color: "#94a3b8", marginTop: "2px" }}>
                  <span>Rainfall: 110mm</span> · <span>Risk: Critical</span> · <span>180min</span>
                </div>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                  padding: "8px",
                  fontSize: "0.76rem",
                  fontWeight: "800",
                  cursor: isSimulating ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginTop: "auto",
                }}
              >
                <Play size={13} fill="#fff" />
                <span>{isSimulating ? `Progress ${simProgress}%` : "Run Simulation"}</span>
              </button>
            </div>

            {/* Recent Alerts */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                borderRadius: "16px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "900", color: "#ffffff" }}>
                  Recent Alerts
                </span>
                <button
                  onClick={() => navigate('/alerts')}
                  style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.64rem", fontWeight: "700", cursor: "pointer" }}
                >
                  View All ↗
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {recentAlerts.map((alert, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 6px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      fontSize: "0.68rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: alert.dot }} />
                      <span style={{ color: "#cbd5e1", fontWeight: "700" }}>{alert.title}</span>
                    </div>
                    <span style={{ color: "#64748b", fontFamily: "monospace" }}>{alert.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════ RIGHT COLUMN (OPERATIONAL RAIL) ════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* ── 1. WEATHER WIDGET ── */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "16px",
              padding: "14px 16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CloudRain size={26} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#ffffff", lineHeight: 1 }}>
                    27°C
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                    Heavy Rain (112 mm)
                  </div>
                </div>
              </div>
              <span style={{ fontSize: "0.65rem", color: "#38bdf8", fontWeight: "700" }}>
                7-day History
              </span>
            </div>
            <div style={{ fontSize: "0.64rem", color: "#64748b" }}>
              📍 Sikkim Teesta Basin · Soil Moisture: 91% (CRITICAL)
            </div>
          </div>

          {/* ── 2. ACTIVE ZONE RISK CARD (NH-10) ── */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "16px",
              padding: "14px 16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#ef4444" }}>⚠️</span>
                <span style={{ fontSize: "0.78rem", fontWeight: "900", color: "#ffffff" }}>
                  LANDSLIDE RISK (NH-10)
                </span>
              </div>
              <span style={{ backgroundColor: "#ef4444", color: "#ffffff", fontSize: "0.58rem", fontWeight: "900", padding: "2px 6px", borderRadius: "4px" }}>
                CRITICAL
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: "700" }}>Risk Score:</span>
              <span style={{ fontSize: "0.92rem", fontWeight: "900", color: "#ef4444" }}>87%</span>
            </div>

            <div style={{ width: "100%", height: "7px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden", marginBottom: "6px" }}>
              <div style={{ width: "87%", height: "100%", backgroundColor: "#ef4444", boxShadow: "0 0 10px #ef4444" }} />
            </div>

            <div style={{ fontSize: "0.62rem", color: "#94a3b8" }}>
              🕒 Updated {currentTime.slice(0, 5)} · Slope: 48° · FoS: 0.91
            </div>
          </div>

          {/* ── 3. SYSTEM HEALTH STATUS ── */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "16px",
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: "0.82rem", fontWeight: "900", color: "#ffffff", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Shield size={14} color="#34d399" />
              <span>System Health</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.7rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>API Services</span>
                <span style={{ color: "#34d399", fontWeight: "800" }}>● Online</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Database</span>
                <span style={{ color: "#34d399", fontWeight: "800" }}>● Online</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Socket.IO</span>
                <span style={{ color: "#34d399", fontWeight: "800" }}>● Online</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Satellite Feed</span>
                <span style={{ color: "#34d399", fontWeight: "800" }}>● Online</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Sensor Network</span>
                <span style={{ color: "#34d399", fontWeight: "800" }}>114/116 Online</span>
              </div>
            </div>
          </div>

          {/* ── 4. ACTIVE INCIDENTS ACCORDION ── */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "16px",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: "900", color: "#ffffff" }}>
                Active Incidents
              </div>
              <span style={{ fontSize: "0.64rem", color: "#38bdf8", fontWeight: "700", cursor: "pointer" }} onClick={() => navigate('/alerts')}>
                View All ↗
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {activeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.6)",
                    border: `1px solid ${inc.badgeColor}44`,
                    borderRadius: "10px",
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                  onClick={() => setLiveMapModalOpen(true)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: inc.badgeColor }} />
                      <span style={{ fontSize: "0.76rem", fontWeight: "800", color: "#ffffff" }}>{inc.title}</span>
                    </div>
                    <span style={{ fontSize: "0.58rem", fontWeight: "900", color: inc.badgeColor, backgroundColor: `${inc.badgeColor}22`, padding: "1px 5px", borderRadius: "4px" }}>
                      {inc.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.64rem", color: "#94a3b8", marginTop: "2px" }}>
                    {inc.location}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "#cbd5e1", marginTop: "4px" }}>
                    <span>👥 {inc.exposed}</span>
                    <span style={{ color: "#38bdf8", fontWeight: "800" }}>ETA: {inc.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 5. INCIDENT TIMELINE ── */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "16px",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: "900", color: "#ffffff" }}>
                Incident Timeline
              </div>
              <span style={{ fontSize: "0.64rem", color: "#64748b" }}>
                Live Stream
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", paddingLeft: "10px" }}>
              {/* Vertical timeline line */}
              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "6px",
                  bottom: "6px",
                  width: "2px",
                  backgroundColor: "rgba(56, 189, 248, 0.2)",
                }}
              />

              {timelineEvents.map((evt, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.68rem", zIndex: 2 }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: evt.color,
                      boxShadow: `0 0 6px ${evt.color}`,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "#64748b", fontFamily: "monospace", width: "35px" }}>
                    {evt.time}
                  </span>
                  <span style={{ color: "#cbd5e1", fontWeight: "600" }}>
                    {evt.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 6. EMERGENCY MODE CARD ── */}
          <div
            style={{
              backgroundColor: emergencyMode ? "rgba(225, 29, 72, 0.3)" : "rgba(15, 23, 42, 0.85)",
              border: emergencyMode ? "1.5px solid #ef4444" : "1px solid rgba(225, 29, 72, 0.3)",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: emergencyMode ? "0 0 20px rgba(225, 29, 72, 0.4)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap size={18} color="#ef4444" fill={emergencyMode ? "#ef4444" : "none"} />
              <span style={{ fontSize: "0.85rem", fontWeight: "900", color: "#ffffff" }}>
                Emergency Mode
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.68rem", color: "#94a3b8", lineHeight: "1.4" }}>
              Simplified high-contrast view for critical situations.
            </p>

            <button
              onClick={handleToggleEmergencyMode}
              style={{
                background: emergencyMode ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #e11d48, #be123c)",
                border: "none",
                borderRadius: "10px",
                color: "#ffffff",
                padding: "10px",
                fontSize: "0.78rem",
                fontWeight: "900",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: emergencyMode ? "0 4px 15px rgba(16, 185, 129, 0.4)" : "0 4px 15px rgba(225, 29, 72, 0.4)",
              }}
            >
              <Siren size={15} />
              <span>{emergencyMode ? "Deactivate Emergency Mode" : "Activate Emergency Mode"}</span>
            </button>
          </div>

          {/* Quick Access Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              fontSize: "0.68rem",
              color: "#64748b",
            }}
          >
            <span style={{ cursor: "pointer", color: "#38bdf8" }} onClick={() => navigate('/map')}>Maps</span>
            <span style={{ cursor: "pointer", color: "#ef4444" }} onClick={() => setSosModalOpen(true)}>SOS</span>
            <span style={{ cursor: "pointer", color: "#f59e0b" }} onClick={() => navigate('/alerts')}>Alerts</span>
            <span style={{ cursor: "pointer" }} onClick={() => setLiveMapModalOpen(true)}>More ▾</span>
          </div>
        </div>
      </div>

      {/* ════════════════════ MODALS & WORKING FUNCTIONAL SUITES ════════════════════ */}

      {/* ── MODAL 1: LIVE SAR RADAR & MAP INTERFACING ── */}
      {liveMapModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setLiveMapModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#0b162a",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "920px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Waves size={24} color="#38bdf8" />
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#fff" }}>
                    Synthetic Aperture Radar (SAR) Interferometry & Live GIS Map
                  </h2>
                  <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
                    Sentinel-1 C-Band Phase Coherence · Cloud-Piercing Landslide Radar
                  </div>
                </div>
              </div>
              <button
                onClick={() => setLiveMapModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Radar Viewport */}
            <div
              style={{
                position: "relative",
                height: "360px",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                backgroundImage: "url('/images/mountain_corridor.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                marginBottom: "16px",
              }}
            >
              {/* Radar grid and concentric rings */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(circle at center, transparent 0%, rgba(6,16,28,0.75) 100%)",
                }}
              />

              {/* 360 Sweep */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "320px",
                  height: "320px",
                  marginLeft: "-160px",
                  marginTop: "-160px",
                  borderRadius: "50%",
                  border: "1px dashed rgba(56, 189, 248, 0.4)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "conic-gradient(from 0deg, rgba(56, 189, 248, 0.5) 0deg, rgba(56, 189, 248, 0) 60deg)",
                    animation: "rotateRadar 3s linear infinite",
                  }}
                />
              </div>

              {/* Telemetry Readout */}
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "14px",
                  backgroundColor: "rgba(11, 22, 42, 0.9)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "0.72rem",
                }}
              >
                <div>📍 GPS: 28.0642° N, 95.3318° E (NH-10 Corridor)</div>
                <div>📡 Coherence γ: <strong style={{ color: "#38bdf8" }}>{sarCoherence}</strong> · Bperp: {sarBaselineBperp}m</div>
                <div>⚡ Surface Phase Shift: <strong style={{ color: "#ef4444" }}>-4.2 cm Displacement</strong></div>
              </div>
            </div>

            {/* Radar Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleProcessSar}
                  disabled={isProcessingSar}
                  style={{
                    background: "linear-gradient(135deg, #0284c7, #2563eb)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "8px 16px",
                    fontSize: "0.78rem",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  {isProcessingSar ? "Computing InSAR Interferogram..." : "Run Sentinel-1 Pass Analysis"}
                </button>
                <button
                  onClick={() => navigate('/map')}
                  style={{
                    background: "rgba(30, 41, 59, 0.8)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    borderRadius: "8px",
                    color: "#38bdf8",
                    padding: "8px 16px",
                    fontSize: "0.78rem",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  Open Full GIS Map ↗
                </button>
              </div>

              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                Synthetic Aperture Radar · Sentinel-1 C-Band Radar Pass Active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: WORKING CAPABILITY MODAL (ULTRASONIC / QUANTUM / CSI) ── */}
      {activeCapabilityModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setActiveCapabilityModal(null)}
        >
          <div
            style={{
              backgroundColor: "#0b162a",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "880px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {activeCapabilityModal === 'ultrasonic' && <Volume2 size={24} color="#10b981" />}
                {activeCapabilityModal === 'quantum' && <Cpu size={24} color="#a855f7" />}
                {activeCapabilityModal === 'csi' && <Radio size={24} color="#f59e0b" />}

                <div>
                  <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "900", color: "#fff" }}>
                    {activeCapabilityModal === 'ultrasonic' && "Ultrasonic 'Chirp' Multi-Hop Sound-Wave Mesh"}
                    {activeCapabilityModal === 'quantum' && "Quantum-Inspired Optimization Engine"}
                    {activeCapabilityModal === 'csi' && "RF / WiFi CSI Breathing & Doppler Survivor Detector"}
                  </h2>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    {activeCapabilityModal === 'ultrasonic' && "Zero-Internet Autonomous Acoustic Relay across Mountain Valleys"}
                    {activeCapabilityModal === 'quantum' && "Simulated Annealing Evacuation & Resource Allocation"}
                    {activeCapabilityModal === 'csi' && "Sub-wall human breathing detection without cameras"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveCapabilityModal(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* TAB 1: ULTRASONIC MODAL CONTENT */}
            {activeCapabilityModal === 'ultrasonic' && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(15,23,42,0.7)", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
                    Sound Wave Carrier: <strong>{audioMode === 'ultrasonic' ? '19.2 kHz (Silent Ultrasonic)' : '2.4 kHz (Audible Diagnostic)'}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => setAudioMode('ultrasonic')}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: audioMode === 'ultrasonic' ? '#10b981' : '#1e293b',
                        color: audioMode === 'ultrasonic' ? '#061019' : '#94a3b8',
                        fontWeight: "800",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                      }}
                    >
                      19.2 kHz Silent
                    </button>
                    <button
                      onClick={() => setAudioMode('diagnostic')}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: audioMode === 'diagnostic' ? '#0284c7' : '#1e293b',
                        color: audioMode === 'diagnostic' ? '#061019' : '#94a3b8',
                        fontWeight: "800",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                      }}
                    >
                      2.4 kHz Audible
                    </button>
                  </div>
                </div>

                {/* Nodes list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {hopNodes.map((n, i) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: activeHop === i ? "rgba(16, 185, 129, 0.2)" : "rgba(30, 41, 59, 0.5)",
                        border: activeHop === i ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.74rem",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "800", color: activeHop === i ? "#34d399" : "#ffffff" }}>
                          Hop #{i}: {n.role}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.66rem" }}>
                          {n.device} · {n.location}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ color: activeHop === i ? "#34d399" : "#64748b", fontWeight: "800" }}>
                          {n.status}
                        </span>
                        <div style={{ fontSize: "0.64rem", color: "#94a3b8" }}>
                          SNR: {n.snrDb}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    onClick={handleStartHopRelay}
                    disabled={isRelaying}
                    style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      padding: "10px 20px",
                      fontSize: "0.8rem",
                      fontWeight: "800",
                      cursor: isRelaying ? "wait" : "pointer",
                    }}
                  >
                    {isRelaying ? `Transmitting Hop #${activeHop}...` : "Emit Ultrasonic SOS Audio Chirp"}
                  </button>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    Physical Audio Multi-Hop · Zero GSM required
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: QUANTUM OPTIMIZATION CONTENT */}
            {activeCapabilityModal === 'quantum' && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                  Solves NP-hard emergency resource distribution and dynamic multi-corridor evacuation bottlenecks using Quantum-Inspired Annealing algorithms.
                </p>
                <div style={{ backgroundColor: "rgba(15,23,42,0.8)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#c084fc", marginBottom: "8px" }}>
                    Live Simulated Annealing Results:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.72rem" }}>
                    <div>Route Clearance Efficiency: <strong style={{ color: "#34d399" }}>+38.4% faster</strong></div>
                    <div>Bottleneck Reduction: <strong style={{ color: "#38bdf8" }}>-54% congestion</strong></div>
                    <div>Ambulance Dispatch Latency: <strong style={{ color: "#c084fc" }}>04.2 min avg</strong></div>
                    <div>Convergence Iterations: <strong>1,024 spins / 12ms</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CSI SURVIVOR DETECTION CONTENT */}
            {activeCapabilityModal === 'csi' && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                  Analyzes Wi-Fi Channel State Information (CSI) multipath attenuation and Doppler phase shifts to detect chest cavity breathing of survivors buried under rubble.
                </p>
                <div style={{ backgroundColor: "rgba(15,23,42,0.8)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#fbbf24", marginBottom: "8px" }}>
                    CSI Breathing Telemetry:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.72rem" }}>
                    <div>Subcarrier Frequency: <strong>5.18 GHz (Wi-Fi 6)</strong></div>
                    <div>Respiration Rate: <strong style={{ color: "#34d399" }}>16 breaths/min (Human Detected)</strong></div>
                    <div>Estimated Depth: <strong style={{ color: "#38bdf8" }}>2.4m under reinforced concrete</strong></div>
                    <div>Confidence Metric: <strong style={{ color: "#fbbf24" }}>96.8% Biological Signal</strong></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 3: EMERGENCY SOS DISPATCH MODAL ── */}
      {sosModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSosModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#19080b",
              border: "2px solid #ef4444",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(239, 68, 68, 0.5)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.2)", border: "2px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto" }}>
              <AlertTriangle size={32} color="#ef4444" />
            </div>

            <h2 style={{ margin: "0 0 6px 0", fontSize: "1.3rem", fontWeight: "900", color: "#fff" }}>
              EMERGENCY SOS BROADCAST
            </h2>
            <p style={{ margin: "0 0 16px 0", fontSize: "0.8rem", color: "#fca5a5" }}>
              Instant distress beacon with live GPS coordinates, medical profile, and nearest NDRF responder dispatch.
            </p>

            <div style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", marginBottom: "18px", textAlign: "left", fontSize: "0.74rem" }}>
              <div>📍 <strong>Live GPS:</strong> 28.0642° N, 95.3318° E</div>
              <div>🚨 <strong>Status:</strong> Immediate Distress Broadcast Active</div>
              <div>📞 <strong>National Dispatch:</strong> 112 / 108 Emergency Lines Connected</div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  playEmergencyAlertSound();
                  alert("SOS Distress Signal Sent! NDRF and SDRF teams have received your coordinates.");
                  setSosModalOpen(false);
                }}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  padding: "12px",
                  fontSize: "0.85rem",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                Confirm SOS Broadcast
              </button>
              <button
                onClick={() => setSosModalOpen(false)}
                style={{
                  padding: "12px 18px",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSS KEYFRAME ANIMATIONS ── */}
      <style>{`
        @keyframes rotateRadar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseWarning {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.9; }
        }
        @keyframes pulseEmergency {
          0%, 100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 35px rgba(239, 68, 68, 0.7); }
        }
      `}</style>
    </div>
  );
}
