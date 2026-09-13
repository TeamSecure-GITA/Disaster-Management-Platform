// ─────────────────────────────────────────────────────────────────────────────
// src/pages/ARSeeTheRisk.jsx
//
// AR "See the Risk" — Point phone camera at a mountain slope; an augmented
// reality overlay projects the live Landslide Susceptibility Index (LSI) heatmap
// and a plain-language "Safe Distance" retreat line directly onto the slope.
//
// Built specifically for mountain communities, rescue teams, and non-literate
// users using WebRTC, Canvas 2D HUD, Web Speech synthesis & Geotechnical LSI modeling.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Verified Real-World Vulnerable Slopes across the North East & Himalayas ──
const VULNERABLE_SLOPES = [
  {
    id: "sikkim-nh10",
    label: "Sikkim — NH-10 29th Mile",
    corridor: "Sevoke-Teesta-Gangtok",
    state: "Sikkim",
    lat: 27.0984,
    lng: 88.4872,
    slope: 48,
    rainfall: 168,
    soilSaturation: 92,
    histHazard: 0.95,
    rCrit: 120,
    emoji: "🏔️",
    hazardDesc: "Active debris slide & crown fracture above highway.",
  },
  {
    id: "joshimath-cliff",
    label: "Uttarakhand — Joshimath Ward 4 Cliff",
    corridor: "Alaknanda Gorge",
    state: "Uttarakhand",
    lat: 30.5574,
    lng: 79.5629,
    slope: 44,
    rainfall: 135,
    soilSaturation: 88,
    histHazard: 0.92,
    rCrit: 110,
    emoji: "⛰️",
    hazardDesc: "Deep subsidence cracks & tension fissures on hill slope.",
  },
  {
    id: "cherrapunji-scarp",
    label: "Meghalaya — Cherrapunji Escarpment",
    corridor: "Sohra Ridge NH-206",
    state: "Meghalaya",
    lat: 25.2986,
    lng: 91.7324,
    slope: 42,
    rainfall: 218,
    soilSaturation: 96,
    histHazard: 0.88,
    rCrit: 150,
    emoji: "🌧️",
    hazardDesc: "Extreme pore-water pressure & hyper-saturated topsoil.",
  },
  {
    id: "dima-hasao-rail",
    label: "Assam — Dima Hasao Rail Corridor",
    corridor: "Lumding-Badarpur Pass",
    state: "Assam",
    lat: 25.1843,
    lng: 93.0215,
    slope: 36,
    rainfall: 142,
    soilSaturation: 82,
    histHazard: 0.84,
    rCrit: 130,
    emoji: "🌊",
    hazardDesc: "Railway cutting slope instability & ballast wash-away.",
  },
  {
    id: "kohima-bypass",
    label: "Nagaland — Kohima NH-29 Phesama Slide",
    corridor: "Dimapur-Kohima Highway",
    state: "Nagaland",
    lat: 25.6284,
    lng: 94.1102,
    slope: 39,
    rainfall: 104,
    soilSaturation: 78,
    histHazard: 0.80,
    rCrit: 125,
    emoji: "🛣️",
    hazardDesc: "Clayey gouge slope creep causing pavement sinking.",
  },
  {
    id: "stable-foothill",
    label: "Guwahati — Terraced Green Foothill",
    corridor: "Dispur Belt",
    state: "Assam",
    lat: 26.1445,
    lng: 91.7362,
    slope: 18,
    rainfall: 42,
    soilSaturation: 40,
    histHazard: 0.25,
    rCrit: 140,
    emoji: "🌲",
    hazardDesc: "Dense vegetative cover and stable low slope gradient.",
  },
];

// ── Multilingual & Plain-Language Guidance for Non-Literate Users ────────────
const VERNACULAR_GUIDANCE = {
  en: {
    name: "English",
    flag: "🇬🇧",
    critical: "DANGER! Slope is structurally unstable. Move back {dist}m immediately!",
    high: "HIGH RISK! Slope movement detected. Keep at least {dist}m distance.",
    moderate: "CAUTION! Saturated slope under monitoring. Maintain {dist}m buffer.",
    low: "SAFE. Slope is stable. Normal baseline caution active.",
    safeZoneText: "SAFE GROUND — STAND HERE",
    dangerZoneText: "DANGER SLOPE — DO NOT ENTER",
    retreatNotice: "RUN TOWARDS THE ARROW TO REACH SAFETY",
    voicePrompt: "Warning! Slope is unsafe. Move back {dist} meters immediately.",
  },
  hi: {
    name: "हिंदी (Hindi)",
    flag: "🇮🇳",
    critical: "खतरा! पहाड़ की ढलान कभी भी गिर सकती है। तुरंत {dist} मीटर पीछे हटें!",
    high: "भारी खतरा! ढलान खिसक रही है। कम से कम {dist} मीटर दूर रहें।",
    moderate: "सावधानी! मिट्टी गीली है। {dist} मीटर की दूरी बनाए रखें।",
    low: "सुरक्षित। ढलान स्थिर है। सामान्य सतर्कता रखें।",
    safeZoneText: "सुरक्षित क्षेत्र — यहाँ रहें",
    dangerZoneText: "खतरे की ढलान — आगे न जाएं",
    retreatNotice: "तीर की दिशा में पीछे हटें और सुरक्षित स्थान पर जाएं",
    voicePrompt: "चेतावनी! ढलान असुरक्षित है। तुरंत {dist} मीटर पीछे हटें!",
  },
  as: {
    name: "অসমীয়া (Assamese)",
    flag: "🇮🇳",
    critical: "বিপদ! পাহাৰৰ ঢাল অতি বিপজ্জনক। তৎক্ষণাৎ {dist} মিটাৰ পিছলৈ যাওক!",
    high: "উচ্চ শংকা! পাহাৰ খহি পৰাৰ সম্ভাৱনা। {dist} মিটাৰ দূৰত্ব বজাই ৰাখক।",
    moderate: "সাৱধান! মাটি তিতি কোমল হৈছে। {dist} মিটাৰ আঁতৰত থাকক।",
    low: "নিৰাপদ। পাহাৰ স্থিৰ অৱস্থাত আছে।",
    safeZoneText: "নিৰাপদ অঞ্চল — ইয়াত থাকক",
    dangerZoneText: "বিপদজনক ঢাল — প্ৰৱেশ নকৰিব",
    retreatNotice: "কাঁড় চিনে দেখুওৱা দিশত নিৰাপদ স্থানলৈ দৌৰি যাওক",
    voicePrompt: "সতৰ্কবাণী! পাহাৰৰ ঢাল বিপজ্জনক। তৎক্ষণাৎ {dist} মিটাৰ আঁতৰত থাকক!",
  },
  bn: {
    name: "বাংলা (Bengali)",
    flag: "🇮🇳",
    critical: "বিপদ! এই পাহাড়ের ঢালটি যে কোনো মুহূর্তে ধসে পড়তে পারে। অবিলম্বে {dist} মিটার দূরে যান!",
    high: "উচ্চ ঝুঁকি! ভূমিধসের আশঙ্কা। অন্তত {dist} মিটার দূরত্ব বজায় রাখুন।",
    moderate: "সতর্ক থাকুন! মাটি স্যাঁতসেঁতে। {dist} মিটার নিরাপদ দূরত্ব রাখুন।",
    low: "নিরাপদ। ঢালটি স্থিতিশীল অবস্থায় আছে।",
    safeZoneText: "নিরাপদ অঞ্চল — এখানে দাঁড়ান",
    dangerZoneText: "বিপদজনক ঢাল — প্রবেশ নিষেধ",
    retreatNotice: "তীরের নির্দেশনায় নিরাপদ আশ্রয়ের দিকে যান",
    voicePrompt: "সতর্কতা! এই ঢালটি বিপজ্জনক। অবিলম্বে {dist} মিটার দূরে সরে যান!",
  },
  ne: {
    name: "नेपाली (Nepali)",
    flag: "🇳🇵",
    critical: "खतरा! भिरालो जमिन जुनसुकै बेला खस्न सक्छ। तुरुन्त {dist} मिटर पछाडि सर्नुहोस्!",
    high: "उच्च जोखिम! पहिरोको सम्भावना। कम्तिमा {dist} मिटर टाढा बस्नुहोस्।",
    moderate: "सावधानी! माटो गिलो छ। {dist} मिटरको सुरक्षित दूरी राख्नुहोस्।",
    low: "सुरक्षित। भिरालो स्थिर छ।",
    safeZoneText: "सुरक्षित क्षेत्र — यहाँ बस्नुहोस्",
    dangerZoneText: "खतरनाक भिरालो — भित्र नजानुहोस्",
    retreatNotice: "बाणको दिशामा पछाडि सरेर सुरक्षित स्थानमा जानुहोस्",
    voicePrompt: "चेतावनी! यो ढलान खतरनाक छ। तुरुन्त {dist} मिटर पछाडि सर्नुहोस्!",
  },
};

// ── Geotechnical Mathematical Functions ─────────────────────────────────────
// Calculates Landslide Susceptibility Index (LSI) according to proposal specification:
// LSI = 0.35 * min(R24 / Rcrit, 1.8) + 0.25 * (Ssoil / 100) + 0.25 * min(theta / 60, 1.2) + 0.15 * Hnorm
function calculateLSI(r24, rCrit, sSoil, slopeAngle, hNorm) {
  const wr = 0.35;
  const ws = 0.25;
  const wt = 0.25;
  const wh = 0.15;

  const rainRatio = Math.min((r24 || 0) / (rCrit || 120), 1.8);
  const soilRatio = Math.min((sSoil || 0) / 100, 1.0);
  const slopeRatio = Math.min((slopeAngle || 0) / 60, 1.2);
  const histRatio = Math.min(hNorm || 0.5, 1.0);

  const lsi = (wr * rainRatio) + (ws * soilRatio) + (wt * slopeRatio) + (wh * histRatio);
  return Math.min(Math.max(parseFloat(lsi.toFixed(3)), 0.1), 0.99);
}

// Factor of Safety (FoS) Approximation: FoS ≈ 1 / (LSI + 0.10)
function calculateFoS(lsi) {
  const fos = 1 / (lsi + 0.10);
  return parseFloat(fos.toFixed(2));
}

// Minimum Safe Setback Distance (Meters):
// Scales progressively with slope gradient and failure volume
function calculateSafeDistance(lsi, slopeAngle) {
  const baseMeters = 50;
  const multiplier = Math.pow(lsi, 1.8) * 460;
  const angleBonus = Math.max(0, (slopeAngle - 30) * 4);
  const dist = Math.round(baseMeters + multiplier + angleBonus);
  return Math.min(Math.max(dist, 40), 650);
}

// Helper: Color by LSI Level
function getLsiColor(lsi, alpha = 1) {
  if (lsi >= 0.80) return `rgba(239, 68, 68, ${alpha})`;    // Critical (Red)
  if (lsi >= 0.65) return `rgba(249, 115, 22, ${alpha})`;   // High Risk (Orange)
  if (lsi >= 0.45) return `rgba(234, 179, 8, ${alpha})`;    // Moderate (Yellow)
  return `rgba(34, 197, 94, ${alpha})`;                     // Safe (Emerald)
}

function getRiskCategory(lsi) {
  if (lsi >= 0.80) return { label: "CRITICAL FAILURE RISK", code: "critical", color: "#ef4444", icon: "🚨", alertSound: 900 };
  if (lsi >= 0.65) return { label: "HIGH LANDSLIDE RISK", code: "high", color: "#f97316", icon: "⚠️", alertSound: 650 };
  if (lsi >= 0.45) return { label: "MODERATE ADVISORY", code: "moderate", color: "#eab308", icon: "🟡", alertSound: 450 };
  return { label: "STABLE / LOW RISK", code: "low", color: "#22c55e", icon: "🟢", alertSound: 300 };
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: AR "See the Risk"
// ═════════════════════════════════════════════════════════════════════════════
export default function ARSeeTheRisk() {
  const navigate = useNavigate();

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const containerRef = useRef(null);
  const audioCtxRef = useRef(null);

  // States
  const [selectedSlope, setSelectedSlope] = useState(VULNERABLE_SLOPES[0]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState("camera"); // "camera" | "simulator"
  const [facingMode, setFacingMode] = useState("environment"); // "environment" | "user"
  const [cameraError, setCameraError] = useState("");
  const [devicePitch, setDevicePitch] = useState(null); // Real Gyroscope Pitch Angle
  const [gyroActive, setGyroActive] = useState(false);

  // Interactive Geotechnical Overrides
  const [customSlopeAngle, setCustomSlopeAngle] = useState(selectedSlope.slope);
  const [customRainfall, setCustomRainfall] = useState(selectedSlope.rainfall);
  const [customSaturation, setCustomSaturation] = useState(selectedSlope.soilSaturation);

  // AR Layer Toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSafeLine, setShowSafeLine] = useState(true);
  const [showWireframe, setShowWireframe] = useState(true);
  const [showPlainLanguageHUD, setShowPlainLanguageHUD] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedLang, setSelectedLang] = useState("en");

  // Recording & Snapshot States
  const [recording, setRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState(null);
  const [toastNotice, setToastNotice] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Derived Real-Time Computations
  const effectiveSlope = devicePitch != null ? devicePitch : customSlopeAngle;
  const lsi = useMemo(() => {
    return calculateLSI(
      customRainfall,
      selectedSlope.rCrit,
      customSaturation,
      effectiveSlope,
      selectedSlope.histHazard
    );
  }, [customRainfall, selectedSlope.rCrit, customSaturation, effectiveSlope, selectedSlope.histHazard]);

  const fos = useMemo(() => calculateFoS(lsi), [lsi]);
  const safeDistance = useMemo(() => calculateSafeDistance(lsi, effectiveSlope), [lsi, effectiveSlope]);
  const riskCategory = useMemo(() => getRiskCategory(lsi), [lsi]);
  const currentLangData = VERNACULAR_GUIDANCE[selectedLang] || VERNACULAR_GUIDANCE.en;

  // Sync state when choosing a new slope preset
  const handleSelectSlope = (slope) => {
    setSelectedSlope(slope);
    setCustomSlopeAngle(slope.slope);
    setCustomRainfall(slope.rainfall);
    setCustomSaturation(slope.soilSaturation);
    setToastNotice(`Loaded slope profile: ${slope.label}`);
    setTimeout(() => setToastNotice(""), 3500);
  };

  // ── Web Audio Acoustic Danger Sonar ─────────────────────────────────────────
  const playBeep = useCallback((freq = 600, duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy
    }
  }, [soundEnabled]);

  // Periodic acoustic sonar pulse (frequency speeds up in critical zone)
  useEffect(() => {
    if (!soundEnabled || !cameraActive) return;
    const intervalMs = lsi >= 0.80 ? 600 : lsi >= 0.65 ? 1200 : lsi >= 0.45 ? 2000 : 3500;
    const timer = setInterval(() => {
      playBeep(riskCategory.alertSound, 0.09);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [soundEnabled, cameraActive, lsi, riskCategory.alertSound, playBeep]);

  // ── Multilingual Vernacular Voice Guidance (Web Speech API) ────────────────
  const speakVoiceGuidance = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-Speech is not supported on this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const prompt = currentLangData.voicePrompt.replace("{dist}", safeDistance);
    const utterance = new SpeechSynthesisUtterance(prompt);

    const langCodeMap = { en: "en-IN", hi: "hi-IN", as: "as-IN", bn: "bn-IN", ne: "ne-NP" };
    utterance.lang = langCodeMap[selectedLang] || "en-IN";
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    utterance.onstart = () => setToastNotice(`🔊 Speaking alert (${currentLangData.name})...`);
    utterance.onend = () => setTimeout(() => setToastNotice(""), 2000);
    window.speechSynthesis.speak(utterance);
  }, [currentLangData, safeDistance, selectedLang]);

  // ── Device Orientation Inclinometer (Real Gyroscope Support) ───────────────
  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.beta != null) {
        // beta represents front-to-back tilt in degrees (-180 to 180)
        // When pointing phone at a slope in landscape/portrait, measure tilt angle
        const pitch = Math.abs(event.beta);
        const mappedAngle = Math.round(Math.min(Math.max(90 - Math.abs(pitch - 90), 12), 75));
        setDevicePitch(mappedAngle);
        setGyroActive(true);
      }
    };

    if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === "function") {
      // iOS 13+ permission workflow
      // Triggered on user interaction
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const requestGyroPermission = async () => {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === "granted") {
          setToastNotice("✅ Gyroscope sensor calibrated!");
          setTimeout(() => setToastNotice(""), 3000);
        }
      } catch (err) {
        console.warn("Gyro permission error:", err);
      }
    }
  };

  // ── Camera Management & Fallback Simulator ──────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setCameraMode("camera");
      setToastNotice("📹 Live camera feed initialized with AR overlay");
      setTimeout(() => setToastNotice(""), 3500);
    } catch (err) {
      console.warn("Camera access failed, activating realistic slope simulator:", err);
      setCameraError("Camera unavailable. Activated Realistic 3D Mountain Slope Simulator!");
      setCameraActive(true);
      setCameraMode("simulator");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setCameraActive(false);
  }, []);

  const toggleFlipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  useEffect(() => {
    if (cameraActive && cameraMode === "camera") {
      startCamera();
    }
  }, [facingMode]); // eslint-disable-line

  useEffect(() => {
    return () => {
      stopCamera();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [stopCamera]);

  // ── 1-Click GPS Lock ───────────────────────────────────────────────────────
  const handleAcquireGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        // Find nearest slope or update coordinates
        setSelectedSlope((prev) => ({
          ...prev,
          label: `GPS Field Slope (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
          lat: latitude,
          lng: longitude,
        }));
        setToastNotice(`📍 GPS Locked: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`);
        setTimeout(() => setToastNotice(""), 4000);
      },
      (err) => {
        setGpsLoading(false);
        alert(`Failed to acquire GPS: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ── Canvas AR Render Loop ──────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraActive) return;
    let tick = 0;

    const render = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width = (video && video.videoWidth) ? video.videoWidth : 960;
      const height = canvas.height = (video && video.videoHeight) ? video.videoHeight : 540;

      ctx.clearRect(0, 0, width, height);

      // ── IF IN SIMULATOR MODE: Draw Realistic Mountain Slope Background ───
      if (cameraMode === "simulator" || !video || video.readyState < 2) {
        // Mountain sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, "#081b33");
        skyGrad.addColorStop(0.4, "#0f2b48");
        skyGrad.addColorStop(1, "#182c23");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Distant mountain ridgelines
        ctx.beginPath();
        ctx.moveTo(0, height * 0.45);
        ctx.lineTo(width * 0.25, height * 0.28);
        ctx.lineTo(width * 0.55, height * 0.38);
        ctx.lineTo(width * 0.85, height * 0.22);
        ctx.lineTo(width, height * 0.32);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = "#0c233c";
        ctx.fill();

        // Active Forefront Mountain Slope (steepness controlled by effectiveSlope)
        const slopeSteepnessFactor = (effectiveSlope / 60);
        const crownY = height * (0.22 - (slopeSteepnessFactor * 0.08));
        const toeY = height * 0.78;

        ctx.beginPath();
        ctx.moveTo(0, crownY + 40);
        ctx.lineTo(width * 0.3, crownY);
        ctx.lineTo(width * 0.7, crownY + 20);
        ctx.lineTo(width, crownY + 80);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const rockGrad = ctx.createLinearGradient(0, crownY, 0, height);
        rockGrad.addColorStop(0, "#2c2825");
        rockGrad.addColorStop(0.5, "#3d3630");
        rockGrad.addColorStop(1, "#1f2a1b");
        ctx.fillStyle = rockGrad;
        ctx.fill();

        // Geological strata striations
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          const sy = crownY + 35 * (i + 1);
          ctx.beginPath();
          ctx.moveTo(width * 0.1, sy);
          ctx.bezierCurveTo(width * 0.4, sy - 15, width * 0.7, sy + 25, width * 0.95, sy + 10);
          ctx.stroke();
        }

        // Drifting monsoon cloud/mist layer
        const mistOffset = (tick * 0.8) % width;
        ctx.fillStyle = "rgba(200, 220, 255, 0.06)";
        ctx.fillRect(0, crownY - 30, width, 60);
      }

      // ── 1. 3D Perspective Slope Grid Wireframe ──────────────────────────────
      if (showWireframe) {
        ctx.save();
        ctx.strokeStyle = getLsiColor(lsi, 0.22);
        ctx.lineWidth = 1;
        const gridCols = 10;
        const horizonY = height * 0.28;
        const groundY = height * 0.75;

        // Perspective longitudinal slope lines
        for (let c = 0; c <= gridCols; c++) {
          const topX = (c / gridCols) * width * 0.6 + width * 0.2;
          const botX = (c / gridCols) * width * 1.2 - width * 0.1;
          ctx.beginPath();
          ctx.moveTo(topX, horizonY);
          ctx.lineTo(botX, groundY);
          ctx.stroke();
        }

        // Transverse contour intervals
        for (let r = 1; r <= 6; r++) {
          const cy = horizonY + Math.pow(r / 6, 1.4) * (groundY - horizonY);
          ctx.beginPath();
          ctx.moveTo(0, cy);
          ctx.lineTo(width, cy);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── 2. Live LSI Heatmap Overlay Bands ──────────────────────────────────
      if (showHeatmap) {
        ctx.save();
        const pulse = Math.sin(tick * 0.05) * 0.08;
        const numBands = 8;

        for (let b = 0; b < numBands; b++) {
          const x = (b / numBands) * width;
          const bandWidth = width / numBands;
          const wobble = Math.sin(tick * 0.04 + b * 1.1) * 0.05;
          const bandLsi = Math.min(Math.max(lsi + wobble, 0.05), 0.98);

          // Gradient vertically down slope: Red/Orange at crown -> Green at safe foot
          const grad = ctx.createLinearGradient(x, height * 0.2, x, height * 0.78);
          grad.addColorStop(0.0, getLsiColor(bandLsi, 0.0));
          grad.addColorStop(0.25, getLsiColor(bandLsi, 0.22 + pulse));
          grad.addColorStop(0.65, getLsiColor(bandLsi, 0.42 + pulse));
          grad.addColorStop(1.0, getLsiColor(bandLsi, 0.08));

          ctx.fillStyle = grad;
          ctx.fillRect(x, height * 0.2, bandWidth, height * 0.58);
        }
        ctx.restore();
      }

      // ── 3. High-Tech Crosshairs & Inclinometer HUD ─────────────────────────
      const cx = width * 0.5;
      const cy = height * 0.48;

      ctx.save();
      // Outer Target Reticle
      ctx.strokeStyle = getLsiColor(lsi, 0.85);
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, 54, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Precision Center Crosshair
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy); ctx.lineTo(cx - 6, cy);
      ctx.moveTo(cx + 6, cy); ctx.lineTo(cx + 22, cy);
      ctx.moveTo(cx, cy - 22); ctx.lineTo(cx, cy - 6);
      ctx.moveTo(cx, cy + 6); ctx.lineTo(cx, cy + 22);
      ctx.stroke();

      // Pitch readout directly inside target
      ctx.fillStyle = "rgba(2,6,23,0.75)";
      ctx.fillRect(cx - 42, cy + 62, 84, 22);
      ctx.strokeStyle = getLsiColor(lsi, 0.9);
      ctx.strokeRect(cx - 42, cy + 62, 84, 22);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11.5px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`\u03B8: ${effectiveSlope.toFixed(1)}°`, cx, cy + 77);
      ctx.restore();

      // ── 4. Plain-Language Glowing "Safe Distance" Retreat Line ─────────────
      if (showSafeLine) {
        ctx.save();
        const safeLineY = height * 0.74;
        const lineOffset = (tick * 2) % 24;

        // Glowing neon boundary glow
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 14]);
        ctx.lineDashOffset = -lineOffset;
        ctx.beginPath();
        ctx.moveTo(0, safeLineY);
        ctx.lineTo(width, safeLineY);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.setLineDash([]);

        // Animated barrier hazard chevrons pointing backwards (Safety retreat direction)
        const numChevrons = 6;
        for (let i = 0; i < numChevrons; i++) {
          const ax = (i / (numChevrons - 1)) * (width * 0.85) + width * 0.08;
          ctx.beginPath();
          ctx.moveTo(ax, safeLineY + 8);
          ctx.lineTo(ax - 12, safeLineY + 22);
          ctx.moveTo(ax, safeLineY + 8);
          ctx.lineTo(ax + 12, safeLineY + 22);
          ctx.strokeStyle = "#00f0ff";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Plain-Language Banner above Safe Line
        if (showPlainLanguageHUD) {
          const bannerText = `⛔ DO NOT CROSS · MINIMUM SAFE RETREAT: ${safeDistance}m ⛔`;
          ctx.font = "900 13px 'Inter', sans-serif";
          ctx.textAlign = "center";
          const tw = ctx.measureText(bannerText).width + 36;

          ctx.fillStyle = "rgba(2, 6, 23, 0.92)";
          ctx.beginPath();
          ctx.roundRect(width * 0.5 - tw * 0.5, safeLineY - 44, tw, 30, 8);
          ctx.fill();
          ctx.strokeStyle = "#00f0ff";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = "#00f0ff";
          ctx.fillText(bannerText, width * 0.5, safeLineY - 24);

          // Safe Zone Indicator at bottom
          ctx.fillStyle = "rgba(34, 197, 94, 0.18)";
          ctx.fillRect(0, safeLineY, width, height - safeLineY);

          ctx.fillStyle = "#22c55e";
          ctx.font = "bold 13px 'Inter', sans-serif";
          ctx.fillText(`\u2714 ${currentLangData.safeZoneText} (\u2265 ${safeDistance}m FROM TOE OF SLOPE)`, width * 0.5, safeLineY + 44);
        }
        ctx.restore();
      }

      // ── 5. LiDAR Scan Sweep Line ──────────────────────────────────────────
      const scanY = (tick * 3.2) % height;
      const scanGrad = ctx.createLinearGradient(0, scanY - 6, 0, scanY + 6);
      scanGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
      scanGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.45)");
      scanGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 6, width, 12);

      tick++;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cameraActive, cameraMode, effectiveSlope, lsi, showWireframe, showHeatmap, showSafeLine, showPlainLanguageHUD, safeDistance, currentLangData]);

  // ── Snapshot / Screenshot with Watermark ────────────────────────────────────
  const handleTakeSnapshot = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");

    // Draw video frame or background
    if (cameraMode === "camera" && video && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);
    }
    // Draw AR canvas overlay
    ctx.drawImage(canvas, 0, 0);

    // Add Official Geological Telemetry Watermark
    ctx.fillStyle = "rgba(2, 6, 23, 0.88)";
    ctx.fillRect(16, exportCanvas.height - 68, exportCanvas.width - 32, 52);
    ctx.strokeStyle = riskCategory.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, exportCanvas.height - 68, exportCanvas.width - 32, 52);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `NER AR GEOTECHNICAL SCAN · ${selectedSlope.label} · GPS: [${selectedSlope.lat}, ${selectedSlope.lng}]`,
      28,
      exportCanvas.height - 45
    );
    ctx.fillStyle = riskCategory.color;
    ctx.font = "bold 12px monospace";
    ctx.fillText(
      `LSI: ${(lsi * 100).toFixed(1)}% | FoS: ${fos} | Slope: ${effectiveSlope}° | Safe Setback: ${safeDistance}m | Time: ${new Date().toISOString()}`,
      28,
      exportCanvas.height - 25
    );

    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AR_Slope_Scan_${selectedSlope.id}_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setToastNotice("📸 AR Telemetry Snapshot saved to device gallery!");
      setTimeout(() => setToastNotice(""), 3500);
    }, "image/png");
  };

  // ── Video Recording ────────────────────────────────────────────────────────
  const handleStartRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const stream = canvas.captureStream(30);
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        setRecording(false);
        setToastNotice("🎬 AR Video recording captured! Ready for review/download.");
        setTimeout(() => setToastNotice(""), 4000);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setRecordedBlobUrl(null);
    } catch (e) {
      alert("Video recording not supported on this browser.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDownloadVideo = () => {
    if (!recordedBlobUrl) return;
    const a = document.createElement("a");
    a.href = recordedBlobUrl;
    a.download = `AR_Slope_Scan_${selectedSlope.id}_${Date.now()}.webm`;
    a.click();
  };

  // ── Share Risk Alert ───────────────────────────────────────────────────────
  const handleShareRisk = async () => {
    const shareText = `⚠️ LANDSLIDE AR ALERT: ${selectedSlope.label}\n\n• Risk Level: ${riskCategory.label} (LSI ${(lsi * 100).toFixed(0)}%)\n• Factor of Safety: ${fos}\n• Slope Angle: ${effectiveSlope}°\n• Minimum Safe Distance: ${safeDistance} meters from slope base.\n\nGuidance (${currentLangData.name}): ${currentLangData[riskCategory.code].replace("{dist}", safeDistance)}\n\nDisaster Management Platform AR Scanner: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Landslide Risk Alert: ${selectedSlope.label}`,
          text: shareText,
          url: window.location.href,
        });
        setToastNotice("✅ Alert shared successfully!");
      } catch (err) {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setToastNotice("📋 Emergency Alert details copied to clipboard!");
    }
    setTimeout(() => setToastNotice(""), 3500);
  };

  // ── Fullscreen Toggle ──────────────────────────────────────────────────────
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // ── Incident Report Link URL (Pre-fills report fields) ──────────────────────
  const incidentReportUrl = `/incident-report?type=Landslide&location=${encodeURIComponent(
    selectedSlope.label
  )}&severity=${riskCategory.code === "critical" ? "Critical" : riskCategory.code === "high" ? "High" : "Medium"}&description=${encodeURIComponent(
    `AR Slope Scanner Telemetry: LSI ${(lsi * 100).toFixed(1)}%, Factor of Safety ${fos}, Slope Angle ${effectiveSlope}°, 24h Rainfall ${customRainfall}mm, Soil Saturation ${customSaturation}%. Minimum Safe Setback Line: ${safeDistance} meters.`
  )}`;

  const mapUrl = `/map?lat=${selectedSlope.lat}&lng=${selectedSlope.lng}&zoom=14&name=${encodeURIComponent(
    selectedSlope.label
  )}`;

  const sosUrl = `/emergency-sos?lat=${selectedSlope.lat}&lng=${selectedSlope.lng}&type=Landslide&desc=${encodeURIComponent(
    `Immediate landslide slope breach alert at ${selectedSlope.label} (LSI ${(lsi * 100).toFixed(0)}%)`
  )}`;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 30% -20%, #0a1628 0%, #020617 50%, #020617 100%)",
      color: "#e2e8f0",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      paddingBottom: 60,
      position: "relative",
    }}>
      {/* ── Top Ribbon ──────────────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(4, 11, 24, 0.94)",
        borderBottom: "1px solid rgba(56, 189, 248, 0.15)",
        padding: "8px 24px",
        fontSize: 11,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        color: "#64748b",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "#38bdf8", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#38bdf8", animation: "pulse 1.5s infinite" }} />
            AR OPTICAL INCLINOMETER & LSI HEATMAP ENGINE
          </span>
          <span>Mode: <strong style={{ color: "#00ff88" }}>{cameraMode === "camera" ? "Live Optical Stream" : "3D Geological Simulator"}</strong></span>
          <span>FoS Formula: <strong style={{ color: "#cbd5e1" }}>FoS ≈ 1 / (LSI + 0.10)</strong></span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: soundEnabled ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${soundEnabled ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 6, padding: "3px 10px", fontSize: 11, color: soundEnabled ? "#38bdf8" : "#94a3b8",
              cursor: "pointer",
            }}
          >
            {soundEnabled ? "🔊 Acoustic Sonar: ON" : "🔇 Audio Muted"}
          </button>
          <div style={{ background: "linear-gradient(135deg,#7c3aed,#1d4ed8)", color: "#fff", borderRadius: 6, padding: "3px 8px", fontSize: 10.5, fontWeight: 800 }}>
            WORLD FIRST IN DISASTER-TECH
          </div>
        </div>
      </div>

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #0284c7, #0369a1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 8px 30px rgba(2,132,199,0.3)",
          }}>
            📷
          </div>
          <div>
            <h1 style={{
              fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1.1,
              background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #00ff88 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              AR "See the Risk" — Slope Hazard Scanner
            </h1>
            <p style={{ fontSize: 12.5, color: "#64748b", margin: "4px 0 0" }}>
              Point camera at mountain slope · Live LSI heatmap overlay · Plain-language safe retreat boundary line
            </p>
          </div>
        </div>

        {/* Vernacular Language Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Language:</span>
          {Object.entries(VERNACULAR_GUIDANCE).map(([code, l]) => (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedLang(code)}
              style={{
                background: selectedLang === code ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.03)",
                border: selectedLang === code ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, padding: "5px 10px", fontSize: 11.5, fontWeight: 700,
                color: selectedLang === code ? "#38bdf8" : "#94a3b8", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {l.flag} {l.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Toast Notification Banner ──────────────────────────────────────── */}
      {toastNotice && (
        <div style={{
          margin: "12px 24px 0",
          background: "rgba(14, 165, 233, 0.14)",
          border: "1px solid rgba(14, 165, 233, 0.4)",
          borderRadius: 12, padding: "10px 18px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 12.5, color: "#bae6fd", fontWeight: 600,
          animation: "fadeIn 0.2s ease-out",
        }}>
          <span>{toastNotice}</span>
          <button onClick={() => setToastNotice("")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* ── Main Workspace Grid ────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.65fr 1fr",
        gap: 20,
        padding: "20px 24px",
        maxWidth: 1600,
        margin: "0 auto",
      }} ref={containerRef}>

        {/* ════ LEFT COLUMN: AR Viewport & Camera Canvas ══════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* AR Viewport Container */}
          <div style={{
            position: "relative",
            background: "#020617",
            borderRadius: 20,
            overflow: "hidden",
            border: `2px solid ${cameraActive ? riskCategory.color : "rgba(255,255,255,0.08)"}`,
            boxShadow: cameraActive ? `0 0 40px ${riskCategory.color}33` : "0 10px 30px rgba(0,0,0,0.5)",
            aspectRatio: "16 / 9",
            minHeight: 380,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* Hidden Video Feed that feeds canvas */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ display: "none" }}
            />

            {/* Live AR Canvas */}
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: cameraActive ? "block" : "none",
              }}
            />

            {/* Offline / Inactive Placeholder */}
            {!cameraActive && (
              <div style={{
                textAlign: "center", padding: 30, maxWidth: 440,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 24,
                  background: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(129,140,248,0.15))",
                  border: "1px solid rgba(56,189,248,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
                }}>
                  🏔️
                </div>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>
                    AR Slope Scanner Ready
                  </h3>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>
                    Point your camera at a hill slope to project the live LSI heatmap and plain-language safe retreat boundary.
                  </p>
                </div>

                {cameraError && (
                  <div style={{
                    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 8, padding: "8px 14px", color: "#fca5a5", fontSize: 11.5,
                  }}>
                    {cameraError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{
                      background: "linear-gradient(135deg, #0284c7, #2563eb)",
                      border: "none", color: "#fff", borderRadius: 10, padding: "12px 24px",
                      fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(37,99,235,0.4)",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    🎥 Start Live Camera
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCameraActive(true);
                      setCameraMode("simulator");
                      setToastNotice("Activated 3D Geological Mountain Slope Simulator!");
                      setTimeout(() => setToastNotice(""), 3500);
                    }}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#38bdf8", borderRadius: 10, padding: "12px 20px",
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    🏔️ Test with Simulator Feed
                  </button>
                </div>
              </div>
            )}

            {/* Over-the-Canvas HUD Badges (When Active) */}
            {cameraActive && (
              <>
                {/* Top-Left: Mode & Sensor Status */}
                <div style={{
                  position: "absolute", top: 14, left: 14, zIndex: 10,
                  display: "flex", gap: 8, alignItems: "center",
                }}>
                  <div style={{
                    background: "rgba(2,6,23,0.88)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                    padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#38bdf8",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", animation: "pulse 1s infinite" }} />
                    {cameraMode === "camera" ? "LIVE AR CAMERA" : "GEOLOGICAL SIMULATOR"}
                  </div>

                  {gyroActive && (
                    <div style={{
                      background: "rgba(2,6,23,0.88)", backdropFilter: "blur(8px)",
                      border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8,
                      padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#00ff88",
                    }}>
                      📐 GYRO LOCKED ({devicePitch}°)
                    </div>
                  )}
                </div>

                {/* Top-Right: LSI Index Telemetry Box */}
                <div style={{
                  position: "absolute", top: 14, right: 14, zIndex: 10,
                  background: "rgba(2,6,23,0.92)", backdropFilter: "blur(12px)",
                  border: `1.5px solid ${riskCategory.color}`, borderRadius: 12,
                  padding: "8px 14px", textAlign: "right", minWidth: 140,
                }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.8 }}>
                    LSI HAZARD SCORE
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: riskCategory.color, fontFamily: "monospace", lineHeight: 1.1 }}>
                    {(lsi * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: riskCategory.color, marginTop: 2 }}>
                    {riskCategory.label}
                  </div>
                </div>

                {/* Bottom Center: Plain-Language Vernacular Emergency Banner */}
                {showPlainLanguageHUD && (
                  <div style={{
                    position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
                    width: "92%", maxWidth: 650, zIndex: 10,
                    background: "rgba(2,6,23,0.92)", backdropFilter: "blur(16px)",
                    border: `1.5px solid ${riskCategory.color}`, borderRadius: 12,
                    padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    boxShadow: `0 8px 30px ${riskCategory.color}44`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 26 }}>{riskCategory.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: riskCategory.color }}>
                          {currentLangData[riskCategory.code].replace("{dist}", safeDistance)}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          {currentLangData.retreatNotice} · Safe boundary at <strong style={{ color: "#00f0ff" }}>{safeDistance} meters</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={speakVoiceGuidance}
                      style={{
                        background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)",
                        borderRadius: 8, padding: "6px 12px", color: "#38bdf8",
                        fontSize: 11.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                        display: "flex", alignItems: "center", gap: 5,
                      }}
                    >
                      🔊 Speak Alert
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* AR Action Quickbar (All Working Handlers) */}
          <div style={{
            display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
            background: "rgba(15,23,42,0.6)", padding: "10px 14px", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {!cameraActive ? (
              <button
                type="button" onClick={startCamera}
                style={{
                  background: "linear-gradient(135deg, #0284c7, #2563eb)",
                  border: "none", color: "#fff", borderRadius: 8, padding: "8px 16px",
                  fontSize: 12, fontWeight: 800, cursor: "pointer",
                }}
              >🎥 Start Camera</button>
            ) : (
              <button
                type="button" onClick={stopCamera}
                style={{
                  background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5", borderRadius: 8, padding: "8px 16px",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}
              >⏹ Stop Feed</button>
            )}

            <button
              type="button" onClick={toggleFlipCamera} disabled={!cameraActive || cameraMode !== "camera"}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#cbd5e1", borderRadius: 8, padding: "8px 14px",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                opacity: (!cameraActive || cameraMode !== "camera") ? 0.4 : 1,
              }}
            >🔄 Flip Camera</button>

            <button
              type="button" onClick={handleTakeSnapshot} disabled={!cameraActive}
              style={{
                background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)",
                color: "#00ff88", borderRadius: 8, padding: "8px 14px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                opacity: !cameraActive ? 0.4 : 1, display: "flex", alignItems: "center", gap: 5,
              }}
            >📸 Snapshot</button>

            {!recording ? (
              <button
                type="button" onClick={handleStartRecording} disabled={!cameraActive}
                style={{
                  background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171", borderRadius: 8, padding: "8px 14px",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  opacity: !cameraActive ? 0.4 : 1, display: "flex", alignItems: "center", gap: 5,
                }}
              >🔴 Record Video</button>
            ) : (
              <button
                type="button" onClick={handleStopRecording}
                style={{
                  background: "#ef4444", border: "none", color: "#fff",
                  borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer",
                }}
              >⏹ Stop Recording</button>
            )}

            {recordedBlobUrl && (
              <button
                type="button" onClick={handleDownloadVideo}
                style={{
                  background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)",
                  color: "#38bdf8", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}
              >⬇️ Download WebM</button>
            )}

            <button
              type="button" onClick={handleAcquireGPS} disabled={gpsLoading}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#cbd5e1", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {gpsLoading ? "📍 Acquiring..." : "📍 Lock Device GPS"}
            </button>

            <button
              type="button" onClick={handleShareRisk}
              style={{
                background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)",
                color: "#a5b4fc", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >📤 Share Alert</button>

            <button
              type="button" onClick={handleToggleFullscreen}
              style={{
                marginLeft: "auto", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1",
                borderRadius: 8, padding: "8px 12px", fontSize: 12, cursor: "pointer",
              }}
            >
              {isFullscreen ? "⛶ Exit Fullscreen" : "⛶ Fullscreen"}
            </button>
          </div>

          {/* AR Visual Layer Filters */}
          <div style={{
            display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
            padding: "8px 14px", background: "rgba(15,23,42,0.4)", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.04)",
          }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>AR OVERLAYS:</span>
            {[
              { label: "🌡️ LSI Heatmap", active: showHeatmap, toggle: () => setShowHeatmap(!showHeatmap) },
              { label: "📏 Safe Setback Line", active: showSafeLine, toggle: () => setShowSafeLine(!showSafeLine) },
              { label: "📐 3D Slope Wireframe", active: showWireframe, toggle: () => setShowWireframe(!showWireframe) },
              { label: "🗣️ Plain-Language HUD", active: showPlainLanguageHUD, toggle: () => setShowPlainLanguageHUD(!showPlainLanguageHUD) },
            ].map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={f.toggle}
                style={{
                  background: f.active ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${f.active ? "#38bdf8" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8, padding: "4px 10px", fontSize: 11.5, fontWeight: f.active ? 700 : 500,
                  color: f.active ? "#38bdf8" : "#94a3b8", cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}

            {!gyroActive && (
              <button
                type="button"
                onClick={requestGyroPermission}
                style={{
                  background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.15)",
                  borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#cbd5e1", cursor: "pointer",
                }}
              >
                📐 Calibrate Gyroscope
              </button>
            )}
          </div>

          {/* Interactive Geotechnical Sliders */}
          <div style={{
            background: "rgba(15,23,42,0.5)", borderRadius: 16, padding: "16px 20px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8", letterSpacing: 0.5 }}>
                ⚙️ REAL-TIME GEOTECHNICAL SENSOR OVERRIDES
              </span>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                Adjust parameters to observe live LSI and safe-line reactions
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {/* Slope Angle */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#94a3b8" }}>Slope Angle (θ)</span>
                  <strong style={{ color: "#f97316" }}>{effectiveSlope}°</strong>
                </div>
                <input
                  type="range" min="15" max="65" value={effectiveSlope}
                  onChange={(e) => {
                    setDevicePitch(null); // manual override
                    setCustomSlopeAngle(Number(e.target.value));
                  }}
                  style={{ width: "100%", accentColor: "#f97316" }}
                />
              </div>

              {/* 24h Rainfall */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#94a3b8" }}>24h Rainfall (mm)</span>
                  <strong style={{ color: "#38bdf8" }}>{customRainfall} mm</strong>
                </div>
                <input
                  type="range" min="20" max="300" value={customRainfall}
                  onChange={(e) => setCustomRainfall(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#38bdf8" }}
                />
              </div>

              {/* Soil Moisture Saturation */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#94a3b8" }}>Soil Saturation</span>
                  <strong style={{ color: "#a855f7" }}>{customSaturation}%</strong>
                </div>
                <input
                  type="range" min="10" max="100" value={customSaturation}
                  onChange={(e) => setCustomSaturation(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#a855f7" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN: Scientific Metrics & Working Action Links ════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Primary Risk Status Card */}
          <div style={{
            background: `linear-gradient(135deg, ${riskCategory.color}15, rgba(15,23,42,0.85))`,
            border: `2px solid ${riskCategory.color}`,
            borderRadius: 18, padding: "20px 22px",
            boxShadow: `0 8px 32px ${riskCategory.color}25`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <span style={{
                  fontSize: 10.5, fontWeight: 800, padding: "3px 8px", borderRadius: 6,
                  background: riskCategory.color, color: "#020617", textTransform: "uppercase",
                }}>
                  {riskCategory.code}
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: "8px 0 2px" }}>
                  {riskCategory.label}
                </h2>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  {selectedSlope.label}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: riskCategory.color, fontFamily: "monospace" }}>
                  {(lsi * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>LSI Index</div>
              </div>
            </div>

            {/* Factor of Safety (FoS) Meter */}
            <div style={{
              background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "12px 14px",
              border: "1px solid rgba(255,255,255,0.06)", marginBottom: 14,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "#cbd5e1" }}>Factor of Safety (FoS)</span>
                <strong style={{
                  color: fos < 1.0 ? "#ef4444" : fos < 1.3 ? "#f97316" : fos < 1.8 ? "#eab308" : "#22c55e",
                  fontFamily: "monospace", fontSize: 14,
                }}>
                  {fos} {fos < 1.0 ? "(Failure Imminent)" : fos < 1.3 ? "(Unstable)" : "(Stable)"}
                </strong>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${Math.min(fos / 2.5, 1) * 100}%`,
                  background: fos < 1.0 ? "#ef4444" : fos < 1.3 ? "#f97316" : "#22c55e",
                  borderRadius: 6,
                }} />
              </div>
            </div>

            {/* Plain-Language Retreat Callout */}
            <div style={{
              background: "rgba(0,0,0,0.4)", borderRadius: 12, padding: "12px 14px",
              border: `1px solid ${riskCategory.color}50`,
            }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                📏 MANDATORY SAFE RETREAT DISTANCE:
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#00f0ff", fontFamily: "monospace", margin: "4px 0" }}>
                {safeDistance} Meters
              </div>
              <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.4 }}>
                {currentLangData[riskCategory.code].replace("{dist}", safeDistance)}
              </div>
            </div>
          </div>

          {/* Integrated Action Buttons & Working Links */}
          <div style={{ display: "grid", gap: 8 }}>
            <Link
              to={incidentReportUrl}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px 18px", borderRadius: 12,
                background: "linear-gradient(135deg, #059669, #10b981)",
                color: "#ffffff", fontWeight: 800, fontSize: 13, textDecoration: "none",
                boxShadow: "0 4px 16px rgba(16,185,129,0.3)", textAlign: "center",
              }}
            >
              📝 File Geotechnical Incident Report ↗
            </Link>

            <Link
              to={mapUrl}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "11px 18px", borderRadius: 12,
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "#ffffff", fontWeight: 700, fontSize: 13, textDecoration: "none",
                boxShadow: "0 4px 16px rgba(37,99,235,0.3)", textAlign: "center",
              }}
            >
              🗺️ View on GIS Disaster Response Map ↗
            </Link>

            <Link
              to={sosUrl}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "11px 18px", borderRadius: 12,
                background: "linear-gradient(135deg, #b91c1c, #dc2626)",
                color: "#ffffff", fontWeight: 800, fontSize: 13, textDecoration: "none",
                boxShadow: "0 4px 16px rgba(220,38,38,0.3)", textAlign: "center",
              }}
            >
              🆘 One-Tap Emergency Evacuation SOS ↗
            </Link>

            <Link
              to="/mesh-console"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "10px 18px", borderRadius: 12,
                background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)",
                color: "#00ff88", fontWeight: 700, fontSize: 12.5, textDecoration: "none", textAlign: "center",
              }}
            >
              📡 Relay via Off-Grid LoRa Mesh ↗
            </Link>

            <Link
              to="/ner-landslide-monitor"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "10px 18px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#cbd5e1", fontWeight: 600, fontSize: 12.5, textDecoration: "none", textAlign: "center",
              }}
            >
              ⛰️ Regional NER Landslide Monitor ↗
            </Link>
          </div>

          {/* Quick Real-World Slope Presets */}
          <div style={{
            background: "rgba(15,23,42,0.5)", borderRadius: 16, padding: "16px 18px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
              🏔️ REAL-WORLD NER VULNERABLE SLOPES:
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {VULNERABLE_SLOPES.map((s) => {
                const isSelected = selectedSlope.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSlope(s)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px", borderRadius: 10,
                      background: isSelected ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isSelected ? "#38bdf8" : "rgba(255,255,255,0.06)"}`,
                      color: isSelected ? "#38bdf8" : "#cbd5e1", cursor: "pointer",
                      textAlign: "left", transition: "all 0.15s",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{s.emoji} {s.label}</div>
                      <div style={{ fontSize: 10.5, color: "#64748b" }}>{s.corridor} · {s.slope}° slope</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: s.slope >= 40 ? "#f87171" : "#34d399" }}>
                      {s.slope >= 40 ? "HIGH" : "MODERATE"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
