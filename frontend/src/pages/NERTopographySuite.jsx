// ─────────────────────────────────────────────────────────────────────────────
// src/pages/NERTopographySuite.jsx
//
// North-Eastern Region (NER) Topography Disaster Command Suite
// Tailored for the brutal challenges of the Northeast:
// 1. 🏔️ Seismic-Acoustic Early Landslide Warning System (IoT + Edge AI)
// 2. 📡 UHF/VHF Radio-to-Web Gateway for Isolated Valleys
// 3. 🌦️ "Synthetic Aperture Radar" (SAR) Micro-Mapping for Monsoon Floods
// 4. 🗣️ Local Dialect Voice-SOS (AI Model for NER Indigenous Languages)
// 5. 🪵 Bamboo-Mesh Hyper-Local Drone Delivery Router
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { Link } from "react-router-dom";

// ── 1. Landslide Sensors Dataset (NH-10, NH-2, Arunachal Ridges) ──
const LANDSLIDE_SENSORS = [
  {
    id: "SEN-SK-01",
    highway: "NH-10 (Sevoke-Teesta Gorge)",
    location: "29th Mile, Sikkim Corridor",
    lat: "27.0821",
    lng: "88.4612",
    elevation: "860m",
    status: "ARMED_NORMAL",
    vibrationUgal: 18,
    acousticKhz: 32,
    moisturePct: 74,
    shearAngleDeg: 1.2,
    ttfMinutes: 45,
    barrierState: "OPEN (GREEN)",
  },
  {
    id: "SEN-NL-04",
    highway: "NH-2 (Kohima-Dimapur)",
    location: "Dzüdza Sinking Zone, Nagaland",
    lat: "25.6841",
    lng: "94.0415",
    elevation: "1,240m",
    status: "PRE_COLLAPSE_WARNING",
    vibrationUgal: 88,
    acousticKhz: 142,
    moisturePct: 94,
    shearAngleDeg: 6.8,
    ttfMinutes: 9,
    barrierState: "LOCKED (RED)",
  },
  {
    id: "SEN-AR-09",
    highway: "NH-13 (Trans-Arunachal Highway)",
    location: "Bhalukpong-Tenga Gorge, Arunachal",
    lat: "27.1284",
    lng: "92.6419",
    elevation: "1,850m",
    status: "ARMED_NORMAL",
    vibrationUgal: 24,
    acousticKhz: 48,
    moisturePct: 68,
    shearAngleDeg: 0.9,
    ttfMinutes: 60,
    barrierState: "OPEN (GREEN)",
  },
  {
    id: "SEN-MZ-02",
    highway: "NH-54 (Aizawl-Lunglei Ridge)",
    location: "Hnahthial Fault, Mizoram",
    lat: "23.3712",
    lng: "92.8541",
    elevation: "1,120m",
    status: "MONITORING_ELEVATED",
    vibrationUgal: 52,
    acousticKhz: 86,
    moisturePct: 82,
    shearAngleDeg: 3.4,
    ttfMinutes: 22,
    barrierState: "CAUTION (AMBER)",
  },
];

// ── 2. UHF/VHF HAM Gateway Stations ──
const HAM_PACKETS_FEED = [
  {
    id: "PKT-VU2NER-104",
    frequency: "144.800 MHz (VHF 2m)",
    callsign: "VU2KIB / Kibithu Post",
    valley: "Anjaw Valley (Arunachal Border)",
    rssi: "-62 dBm",
    rawAFSK: "!SOS! LOC:28.291N,97.014E | COMM_DEAD:YES | CASUALTIES:4 | NEED:ANTIVENOM_SNAKEBITE,O_POS_BLOOD",
    decoded: {
      type: "MEDICAL_EMERGENCY",
      village: "Kibithu Border Sector",
      coords: "28.291° N, 97.014° E",
      injuries: 4,
      priority: "CRITICAL (Airlift Drone Req)",
      timestamp: "10 mins ago",
    },
  },
  {
    id: "PKT-VU2NL-078",
    frequency: "433.500 MHz (UHF 70cm)",
    callsign: "VU3MON / Konyak Village Net",
    valley: "Mon Highlands, Nagaland",
    rssi: "-74 dBm",
    rawAFSK: "!SOS! LOC:26.744N,95.031E | ROAD_WASHED:NH702B | STRANDED:65_FAMILIES | WATER:ZERO",
    decoded: {
      type: "LOGISTICS_SUPPLY_CUT",
      village: "Shangnyu Village",
      coords: "26.744° N, 95.031° E",
      injuries: 0,
      priority: "HIGH (Drinking Water / Rations)",
      timestamp: "24 mins ago",
    },
  },
];

// ── 3. SAR Microwave Radar Layers ──
const SAR_SITES = [
  {
    name: "Upper Brahmaputra & Majuli River Island",
    state: "Assam",
    cloudCoverOptical: "100% (Blind Whiteouts)",
    sarPenetration: "Sentinel-1 C-Band (5.405 GHz) & NISAR L-Band",
    inundationExpansionKm2: "+148 km² in 48h",
    soilBackscatterDb: "-21.4 dB (Open Water Reflector)",
    embankmentBreaches: "Breach near Salmora — 12,000 evacuees",
    floodWarning: "CRITICAL: Floodwave reaching Kaziranga in 18 hrs",
  },
  {
    name: "Barak Valley & Silchar Flood Basin",
    state: "Southern Assam",
    cloudCoverOptical: "94% Dense Monsoonal Cumulonimbus",
    sarPenetration: "NISAR L+S Dual Polarisation (VV/VH)",
    inundationExpansionKm2: "+84 km² in 36h",
    soilBackscatterDb: "-19.8 dB (Saturated Alluvial Mud)",
    embankmentBreaches: "Bethukandi Dykes at 98% hydrostatic head",
    floodWarning: "HIGH RISK: Urban Submersion Warning issued",
  },
  {
    name: "Lohit River Gorge & Tezu Delta",
    state: "Eastern Arunachal",
    cloudCoverOptical: "98% Heavy Rain Cloud Cover",
    sarPenetration: "Sentinel-1 Ground Range Detected (GRD)",
    inundationExpansionKm2: "+62 km² in 24h",
    soilBackscatterDb: "-23.1 dB (Torrential River Runoff)",
    embankmentBreaches: "Subansiri Hydro reservoir flash overflow",
    floodWarning: "EXTREME RUNOFF: Flash floods in downstream plains",
  },
];

// ── 4. Indigenous Dialects Dataset ──
const NER_DIALECTS = [
  {
    id: "khasi",
    language: "Khasi",
    state: "Meghalaya (Khasi Hills)",
    audioScript: "Sngewbha iarap! Ka lum ka la khyllem bad ka iing ka la shah tap ha u phlang bad maw.",
    phonetic: "Sngewbha iarap, ka lum la khyllem bad ka iing la shah tap.",
    englishTranslation: "Please help! The mountain slope has collapsed and our house is buried under mud and rock rubble.",
    hindiTranslation: "कृपया सहायता करें! पहाड़ खिसक गया है और हमारा घर मलबे में दब गया है।",
    detectedDistress: "STRUCTURAL COLLAPSE / TRAPPED CITIZENS",
    priority: "TIER 1 RESCUE",
    coords: "25.5788° N, 91.8933° E (Sohra Plateau)",
  },
  {
    id: "mizo",
    language: "Mizo",
    state: "Mizoram",
    audioScript: "Khawngaihin min pui ru! Lei a min nasa lutuk a, kan chhungkua in kan tang khawp mai.",
    phonetic: "Khawngaihin min pui ru! Lei a min a, kan chhungkua kan tang.",
    englishTranslation: "Please assist us! Massive landslide has triggered and our family is trapped on the cliff ledge.",
    hindiTranslation: "कृपया हमारी मदद करें! भारी भूस्खलन हुआ है और हमारा परिवार चट्टान पर फंस गया है।",
    detectedDistress: "CLIFFSIDE ISOLATION / EVACUATION REQUIRED",
    priority: "TIER 1 RESCUE",
    coords: "23.7271° N, 92.7176° E (Aizawl District)",
  },
  {
    id: "bodo",
    language: "Bodo",
    state: "Assam (Bodoland BTC)",
    audioScript: "अननानै हेफाजाब हो! दैबाना जाबाय आरो नोआव थांनो हायाखै, गोबां मानसिफोरा थांबाय।",
    phonetic: "Onnanwi hefazab ho! Dwi bana jabay aro noao thangno hayakhoi.",
    englishTranslation: "Please give aid! River water has submerged the settlement, children and elders stranded on the roof.",
    hindiTranslation: "कृपया मदद भेजें! बाढ़ का पानी घर में घुस गया है और बच्चे छत पर फंसे हैं।",
    detectedDistress: "FLOOD INUNDATION / ROOFTOP STRANDED",
    priority: "BOAT EVACUATION",
    coords: "26.4950° N, 90.2710° E (Kokrajhar)",
  },
  {
    id: "garo",
    language: "Garo (A·chik)",
    state: "Meghalaya (Garo Hills)",
    audioScript: "Dakchakbo! Chiring batenga aro a.bri ga.akenga, rama champenga.",
    phonetic: "Dakchakbo! Chiring batenga aro abri gaakenga.",
    englishTranslation: "Help us! The river is swelling beyond banks, hills are sliding, and road connectivity is severed.",
    hindiTranslation: "सहायता करें! नदी उफान पर है और पहाड़ी दरक रही है, रास्ता बंद हो गया है।",
    detectedDistress: "VALLEY CUTOFF / SWELLING TORRENT",
    priority: "TIER 2 SUPPLIES",
    coords: "25.5140° N, 90.2200° E (Tura Corridor)",
  },
  {
    id: "mising",
    language: "Mising",
    state: "Assam (Riverine Majuli)",
    audioScript: "Ai kangkan! Asi kero lo ngoina gomin, Chang ghar a ampe mang.",
    phonetic: "Ai kangkan! Asi kero lo ngoina gomin.",
    englishTranslation: "Emergency! Floodwaters have eroded our stilt house pillars; need immediate boat evacuation.",
    hindiTranslation: "आपातकाल! बाढ़ के पानी ने चांग घर के खंभे बहा दिए हैं, तुरंत नाव भेजें।",
    detectedDistress: "STILT HOUSE FAILURE / AMPHIBIOUS BOAT DISPATCH",
    priority: "URGENT EVACUATION",
    coords: "26.9500° N, 94.2167° E (Majuli Island)",
  },
  {
    id: "ao_naga",
    language: "Ao Naga",
    state: "Nagaland (Mokokchung)",
    audioScript: "Tepu yarungma! Tsüksem alur ali tsülokba agi gari lenmang shishia punga.",
    phonetic: "Tepu yarungma! Tsüksem alur ali tsülokba agi.",
    englishTranslation: "Come quickly for help! Continuous rain has caused mudflows across the highway pass.",
    hindiTranslation: "जल्दी मदद भेजें! लगातार बारिश से राजमार्ग पर कीचड़ का बहाव आ गया है।",
    detectedDistress: "HIGHWAY MUDSLIDE / TRAFFIC BLOCKED",
    priority: "ROAD CLEARANCE",
    coords: "26.3240° N, 94.5150° E (Mokokchung)",
  },
];

// ── 5. Bamboo-Mesh Drone Corridors ──
const DRONE_HUBS = [
  {
    id: "HUB-KAZI-01",
    name: "Brahmaputra Tactical Drone Hub #1",
    baseLocation: "Tezpur Military Base, Assam",
    targetLandingPad: "Majuli Island Bamboo Pad #B-04 (Elevated Monastery Stilt)",
    distanceKm: 46.2,
    altitudeMslM: 145,
    valleyGorgeRisk: "Low (River Surface Winds 35 km/h)",
    batteryReq: "62%",
    cargoLoaded: "Insulin (120 vials), Water Purification Pills (5,000 tabs), Anti-Diarrheal",
    estimatedFlightMin: 22,
    waypointPath: ["Tezpur Helipad (0m)", "Brahmaputra Mid-Channel (80m)", "Salmora Ridge (120m)", "Majuli Bamboo Grid (15m Drop)"],
  },
  {
    id: "HUB-TAWANG-02",
    name: "Arunachal High-Altitude Drone Hub #2",
    baseLocation: "Dirang Valley Outpost",
    targetLandingPad: "Mago Remote Village Bamboo Mesh Pad (Village School Terrace)",
    distanceKm: 34.8,
    altitudeMslM: 3420,
    valleyGorgeRisk: "Severe (Sela Ridge Downdrafts & Freezing Cloud Base)",
    batteryReq: "84%",
    cargoLoaded: "Snake Antivenom (40 kits), Satellite LoRa Radios (4 units), Blood Units O-Neg",
    estimatedFlightMin: 31,
    waypointPath: ["Dirang River Base (1,500m)", "Sela Sub-Pass Corridor (2,800m)", "Gorge Defile (2,400m)", "Mago Bamboo Shock-Net (3,100m)"],
  },
  {
    id: "HUB-MIZO-03",
    name: "Mizoram Cloudburst Valley Router #3",
    baseLocation: "Aizawl Emergency Operations Center",
    targetLandingPad: "Reiek West Ridge Bamboo Community Pad",
    distanceKm: 28.5,
    altitudeMslM: 1280,
    valleyGorgeRisk: "Moderate (Fog Visibility <50m; Uses LiDAR Rangefinder)",
    batteryReq: "54%",
    cargoLoaded: "Trauma Dressing Kits (60 packs), Infant Nutrition Formulas, Emergency Flashlights",
    estimatedFlightMin: 18,
    waypointPath: ["Aizawl Central (1,100m)", "Tlawng River Valley (600m)", "West Ridge Climb (1,300m)", "Reiek Church Bamboo Pad (1,280m)"],
  },
];

export default function NERTopographySuite() {
  const [activeTab, setActiveTab] = useState("landslide");

  // Module 1 State: Landslide Sensors & Edge AI Simulation
  const [sensors, setSensors] = useState(LANDSLIDE_SENSORS);
  const [simulatingCloudburst, setSimulatingCloudburst] = useState(false);
  const [edgeAlertTriggered, setEdgeAlertTriggered] = useState(false);

  // Module 2 State: HAM Radio Demodulator
  const [activeAudioFreq, setActiveAudioFreq] = useState("144.800 MHz");
  const [decodedHamPackets, setDecodedHamPackets] = useState(HAM_PACKETS_FEED);
  const [isReceivingHam, setIsReceivingHam] = useState(false);

  // Module 3 State: SAR Radar
  const [sarMode, setSarMode] = useState("radar");
  const [selectedSarSite, setSelectedSarSite] = useState(SAR_SITES[0]);

  // Module 4 State: Dialect Voice-SOS
  const [selectedDialect, setSelectedDialect] = useState(NER_DIALECTS[0]);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [spokenResult, setSpokenResult] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Module 5 State: Bamboo Drone Logistics
  const [selectedDroneHub, setSelectedDroneHub] = useState(DRONE_HUBS[0]);
  const [droneFlightState, setDroneFlightState] = useState("IDLE");
  const [flightProgressPct, setFlightProgressPct] = useState(0);

  // Web Audio Synthesizer for AFSK Radio Beeps & Edge AI Alarm
  const playSoundEffect = (type = "edge_alarm") => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "edge_alarm") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === "afsk_chirp") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.setValueAtTime(2200, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (_) {}
  };

  // 1. Simulation: Torrential Cloudburst & Soil Shear (Edge AI Hack)
  const triggerSoilShearSimulation = () => {
    setSimulatingCloudburst(true);
    setEdgeAlertTriggered(false);

    setTimeout(() => {
      setSensors((prev) =>
        prev.map((s) => {
          if (s.id === "SEN-SK-01") {
            return {
              ...s,
              status: "🚨 PRE-COLLAPSE CRITICAL",
              vibrationUgal: 165,
              acousticKhz: 285,
              moisturePct: 98,
              shearAngleDeg: 8.4,
              ttfMinutes: 7,
              barrierState: "EMERGENCY SHUT (RED) — TRAFFIC HALTED",
            };
          }
          return s;
        })
      );
      setSimulatingCloudburst(false);
      setEdgeAlertTriggered(true);
      playSoundEffect("edge_alarm");
    }, 2000);
  };

  // 2. Simulation: Transmit and Decode HAM Audio Packet
  const simulateHamTransmission = () => {
    setIsReceivingHam(true);
    playSoundEffect("afsk_chirp");

    setTimeout(() => {
      const newPacket = {
        id: `PKT-VU2NER-${Math.floor(200 + Math.random() * 800)}`,
        frequency: activeAudioFreq,
        callsign: "VU2TAW / Sela Outpost",
        valley: "Tawang High Valley, Arunachal",
        rssi: "-68 dBm",
        rawAFSK: `!SOS! LOC:27.586N,91.866E | BRIDGE_COLLAPSE:YES | TRAPPED:18 | NEED:INSULIN,FOOD_RATIONS`,
        decoded: {
          type: "BRIDGE_COLLAPSE_TRAP",
          village: "Tawang River Basecamp",
          coords: "27.586° N, 91.866° E",
          injuries: 2,
          priority: "CRITICAL (Cutoff Gorge)",
          timestamp: "Just now",
        },
      };

      setDecodedHamPackets((prev) => [newPacket, ...prev]);
      setIsReceivingHam(false);
    }, 1800);
  };

  // 4. Dialect Speech Simulation
  const handleDialectSpeech = (dialect) => {
    setSelectedDialect(dialect);
    setIsListeningMic(true);
    setSpokenResult(null);

    setTimeout(() => {
      setIsListeningMic(false);
      setSpokenResult(dialect);

      if ("speechSynthesis" in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(dialect.englishTranslation);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          setIsPlayingAudio(true);
          utterance.onend = () => setIsPlayingAudio(false);
          window.speechSynthesis.speak(utterance);
        } catch (_) {}
      }
    }, 1600);
  };

  // 5. Bamboo Drone Launch Simulation
  const launchDroneMission = () => {
    setDroneFlightState("EN_ROUTE");
    setFlightProgressPct(0);

    const interval = setInterval(() => {
      setFlightProgressPct((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDroneFlightState("PAYLOAD_DROPPED");
          return 100;
        }
        return prev + 20;
      });
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#020617", color: "#f8fafc", padding: "24px", boxSizing: "border-box" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "22px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.9rem" }}>🏔️</span>
            <h1 style={{ margin: 0, fontSize: "1.7rem", fontWeight: "900", background: "linear-gradient(90deg, #34d399, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Northeast Topography Command Suite
            </h1>
            <span style={{ fontSize: "0.72rem", backgroundColor: "#059669", color: "#fff", padding: "4px 10px", borderRadius: "999px", fontWeight: "800", letterSpacing: "0.05em" }}>
              NER HARDENED TECH
            </span>
          </div>
          <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.88rem" }}>
            Engineered exclusively for the brutal challenges of the 8 North-Eastern states: extreme gorge isolation, seismic micro-shears, cloud-blind monsoons, and indigenous dialects.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            to="/ner-landslide-monitor"
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#cbd5e1",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "0.82rem",
            }}
          >
            ← Standard NER Monitor
          </Link>
        </div>
      </div>

      {/* ── Feature Navigation Tabs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "24px" }}>
        {[
          { id: "landslide", icon: "🏔️", title: "1. Seismic Edge-AI Warning", tag: "Pre-Collapse Highway Lock" },
          { id: "hamRadio", icon: "📡", title: "2. UHF/VHF Radio Gateway", tag: "Cut-Off Valley Packet Net" },
          { id: "sarRadar", icon: "🌦️", title: "3. SAR Microwave Flood Radar", tag: "Pierces 100% Monsoon Clouds" },
          { id: "dialectVoice", icon: "🗣️", title: "4. Indigenous Dialect SOS", tag: "8 Regional NER Languages" },
          { id: "bambooDrone", icon: "🪵", title: "5. Bamboo-Mesh Drone Router", tag: "3D Valley Gorges & Drop-Pads" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: activeTab === tab.id ? "1.5px solid #34d399" : "1px solid #334155",
              background: activeTab === tab.id ? "linear-gradient(135deg, rgba(5,150,105,0.25), rgba(14,165,233,0.15))" : "#0f172a",
              color: activeTab === tab.id ? "#fff" : "#94a3b8",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
              boxShadow: activeTab === tab.id ? "0 4px 16px rgba(52,211,153,0.25)" : "none",
            }}
          >
            <div style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{tab.icon}</div>
            <div style={{ fontSize: "0.86rem", fontWeight: "800", color: activeTab === tab.id ? "#38bdf8" : "#f1f5f9" }}>{tab.title}</div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>{tab.tag}</div>
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: Seismic-Acoustic Early Landslide Warning System (IoT + Edge AI)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "landslide" && (
        <div>
          <div style={{ backgroundColor: "rgba(15,23,42,0.8)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "16px", padding: "18px 22px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <span style={{ fontSize: "0.72rem", backgroundColor: "#059669", color: "#fff", padding: "3px 8px", borderRadius: "999px", fontWeight: "800" }}>
                  THE UN-REPLICATED KILLER HACK
                </span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: "8px 0 4px" }}>
                  Edge AI Seismic-Acoustic Slope Sensor Network (NH-10 & NH-2)
                </h2>
                <p style={{ fontSize: "0.83rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
                  Government websites only report landslides <em>after</em> the road has collapsed and vehicles are buried. Our system embeds lightweight Edge AI on solar-powered acoustic/inclinometer chips along critical Himalayan passes. By measuring high-frequency micro-acoustic fracturing (20-300 kHz), it predicts structural failure and <strong>automatically drops highway RFID barrier arms 8–14 minutes BEFORE the slope yields</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={triggerSoilShearSimulation}
                disabled={simulatingCloudburst}
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: simulatingCloudburst ? "not-allowed" : "pointer",
                  fontWeight: "800",
                  fontSize: "0.88rem",
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  color: "#fff",
                  boxShadow: "0 4px 18px rgba(220,38,38,0.45)",
                }}
              >
                {simulatingCloudburst ? "⏳ Micro-Shear Accelerating..." : "⚡ Trigger Cloudburst & Slope Shear (Simulation)"}
              </button>
            </div>
          </div>

          {edgeAlertTriggered && (
            <div style={{ padding: "16px 20px", backgroundColor: "rgba(220,38,38,0.2)", border: "2px solid #ef4444", borderRadius: "14px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "2.4rem" }}>🚨</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "1rem", fontWeight: "900", color: "#f87171" }}>
                  CRITICAL EDGE-AI PRE-COLLAPSE WARNING ACTIVATED: NH-10 (29th Mile, Sikkim)
                </div>
                <div style={{ fontSize: "0.82rem", color: "#fecaca", marginTop: "3px" }}>
                  Acoustic emission acceleration reached 285 kHz with 98% pore saturation. <strong>Highway Barrier #SK-10 has been automatically closed to STOP tourist/freight traffic 7 minutes ahead of collapse</strong>. Downhill sirens sounding at Rongpo.
                </div>
              </div>
            </div>
          )}

          {/* Sensor Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {sensors.map((s) => (
              <div
                key={s.id}
                style={{
                  backgroundColor: "#0f172a",
                  border: `1px solid ${s.status.includes("CRITICAL") ? "#ef4444" : s.status.includes("WARNING") ? "#f59e0b" : "#334155"}`,
                  borderRadius: "14px",
                  padding: "18px",
                  boxShadow: s.status.includes("CRITICAL") ? "0 0 20px rgba(239,68,68,0.3)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", backgroundColor: "#1e293b", color: "#38bdf8", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                      {s.id}
                    </span>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#fff", margin: "4px 0 0" }}>{s.highway}</h3>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{s.location} &bull; Elev: {s.elevation}</div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "3px 8px",
                      borderRadius: "999px",
                      fontWeight: "800",
                      backgroundColor: s.status.includes("CRITICAL") ? "#dc2626" : s.status.includes("WARNING") ? "#d97706" : "#059669",
                      color: "#fff",
                    }}
                  >
                    {s.status.includes("CRITICAL") ? "PRE-COLLAPSE" : s.status.includes("WARNING") ? "CRITICAL RISK" : "EDGE ARMED"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.78rem", margin: "14px 0", backgroundColor: "#020617", padding: "10px", borderRadius: "10px" }}>
                  <div>
                    <div style={{ color: "#64748b" }}>Acoustic Energy:</div>
                    <div style={{ fontWeight: "700", color: s.acousticKhz > 120 ? "#f87171" : "#38bdf8" }}>{s.acousticKhz} kHz</div>
                  </div>
                  <div>
                    <div style={{ color: "#64748b" }}>Soil Moisture:</div>
                    <div style={{ fontWeight: "700", color: s.moisturePct > 85 ? "#f87171" : "#34d399" }}>{s.moisturePct}% Saturation</div>
                  </div>
                  <div>
                    <div style={{ color: "#64748b" }}>Micro-Tremor:</div>
                    <div style={{ fontWeight: "700", color: "#cbd5e1" }}>{s.vibrationUgal} &mu;gal</div>
                  </div>
                  <div>
                    <div style={{ color: "#64748b" }}>Creep Tilt:</div>
                    <div style={{ fontWeight: "700", color: s.shearAngleDeg > 4 ? "#f87171" : "#cbd5e1" }}>{s.shearAngleDeg}&deg; Displacement</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #1e293b", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                  <div>
                    <span style={{ color: "#64748b" }}>Est. Time-To-Failure:</span>
                    <strong style={{ color: s.ttfMinutes <= 10 ? "#ef4444" : "#34d399", marginLeft: "4px" }}>
                      {s.ttfMinutes} mins
                    </strong>
                  </div>
                  <div style={{ fontWeight: "700", color: s.barrierState.includes("LOCKED") || s.barrierState.includes("EMERGENCY") ? "#ef4444" : "#34d399" }}>
                    🚧 {s.barrierState}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: UHF/VHF Radio-to-Web Gateway for Isolated Valleys
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "hamRadio" && (
        <div>
          <div style={{ backgroundColor: "rgba(15,23,42,0.8)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: "16px", padding: "18px 22px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <span style={{ fontSize: "0.72rem", backgroundColor: "#0284c7", color: "#fff", padding: "3px 8px", borderRadius: "999px", fontWeight: "800" }}>
                  ANALOG-TO-DIGITAL AIRWAVES GATEWAY
                </span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: "8px 0 4px" }}>
                  UHF / VHF HAM Radio Digital Demodulator & SOS Pinner
                </h2>
                <p style={{ fontSize: "0.83rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
                  In deep valleys of Nagaland and Arunachal, cell towers and satellite links collapse completely. Village chiefs and HAM operators broadcast analog AFSK voice/packet chirps over 2-meter & 70-cm bands. This central web gateway demodulates incoming analog radio audio into digital JSON SOS records and pins them immediately onto the Live Master Disaster Map.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={simulateHamTransmission}
                  disabled={isReceivingHam}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: isReceivingHam ? "not-allowed" : "pointer",
                    fontWeight: "800",
                    fontSize: "0.85rem",
                    background: "linear-gradient(135deg, #0284c7, #0369a1)",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(2,132,199,0.35)",
                  }}
                >
                  {isReceivingHam ? "📻 Demodulating Audio Chirp..." : "📡 Transmit Valley HAM Packet (Simulate)"}
                </button>
              </div>
            </div>
          </div>

          {/* Radio Receiver HUD */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px", marginBottom: "20px" }}>
            {/* Left: Radio Tuner Spectrogram */}
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "14px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} />
                  <strong style={{ fontSize: "0.9rem", color: "#fff" }}>VHF/UHF Listening Station Active</strong>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["144.800 MHz", "433.500 MHz"].map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setActiveAudioFreq(freq)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        backgroundColor: activeAudioFreq === freq ? "#0284c7" : "#1e293b",
                        color: activeAudioFreq === freq ? "#fff" : "#94a3b8",
                      }}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Waterfall Spectrogram simulation */}
              <div style={{ backgroundColor: "#020617", borderRadius: "10px", padding: "14px", border: "1px solid #1e293b", marginBottom: "14px" }}>
                <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "8px" }}>
                  AFSK-1200 BELL 202 AUDIO WATERFALL SPECTRUM
                </div>
                <div style={{ height: "70px", display: "flex", alignItems: "flex-end", gap: "3px" }}>
                  {Array.from({ length: 44 }).map((_, idx) => {
                    const h = isReceivingHam
                      ? Math.floor(20 + Math.random() * 50)
                      : Math.floor(10 + Math.sin(idx * 0.4) * 12);
                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          height: `${h}px`,
                          backgroundColor: isReceivingHam ? (idx % 2 === 0 ? "#38bdf8" : "#22c55e") : "#334155",
                          borderRadius: "2px",
                          transition: "height 0.1s",
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#64748b", marginTop: "6px" }}>
                  <span>1200 Hz (Mark)</span>
                  <span>Center Carrier</span>
                  <span>2200 Hz (Space)</span>
                </div>
              </div>

              <div style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: "1.4" }}>
                <div>📡 <strong>Listening Post:</strong> Kohima Ridge Central VHF Repeater</div>
                <div>⚡ <strong>Demodulation Latency:</strong> 180 milliseconds</div>
                <div>🔒 <strong>CRC-16 Checksum:</strong> Verified 100% Bit-Accurate</div>
              </div>
            </div>

            {/* Right: Decoded Incoming Distress Queue */}
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "14px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "0.92rem", fontWeight: "800", color: "#38bdf8" }}>
                  📻 Real-Time Decoded Radio Packets ({decodedHamPackets.length})
                </h3>
                <span style={{ fontSize: "0.7rem", color: "#34d399", fontWeight: "700" }}>
                  AUTO-MAPPED
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
                {decodedHamPackets.map((pkt) => (
                  <div
                    key={pkt.id}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "10px",
                      padding: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.72rem", backgroundColor: "#dc2626", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                        {pkt.decoded.type}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{pkt.decoded.timestamp}</span>
                    </div>

                    <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#f8fafc", margin: "4px 0" }}>
                      {pkt.decoded.village} ({pkt.valley})
                    </div>

                    <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#fbbf24", backgroundColor: "#020617", padding: "6px 8px", borderRadius: "6px", margin: "6px 0", wordBreak: "break-all" }}>
                      {pkt.rawAFSK}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b" }}>
                      <span>📍 Coords: {pkt.decoded.coords}</span>
                      <span>Callsign: <strong style={{ color: "#38bdf8" }}>{pkt.callsign}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: "Synthetic Aperture Radar" (SAR) Micro-Mapping for Monsoon Floods
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "sarRadar" && (
        <div>
          <div style={{ backgroundColor: "rgba(15,23,42,0.8)", border: "1px solid rgba(14,165,233,0.3)", borderRadius: "16px", padding: "18px 22px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <span style={{ fontSize: "0.72rem", backgroundColor: "#0284c7", color: "#fff", padding: "3px 8px", borderRadius: "999px", fontWeight: "800" }}>
                  ALL-WEATHER CLOUD-PENETRATING RADAR
                </span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: "8px 0 4px" }}>
                  Synthetic Aperture Radar (SAR) Micro-Mapping Engine (NISAR & Sentinel-1)
                </h2>
                <p style={{ fontSize: "0.83rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
                  During Assam & Meghalaya monsoon deluges, thick rain clouds render optical satellite maps (Google Maps, ISRO Cartosat) 100% blind. SAR fires active microwave pulses (C-band and L-band) that penetrate torrential clouds, rain curtains, and midnight darkness, delineating exact flood boundaries across the Brahmaputra River Basin.
                </p>
              </div>

              {/* Mode Toggle */}
              <div style={{ display: "flex", gap: "8px", backgroundColor: "#020617", padding: "4px", borderRadius: "10px", border: "1px solid #334155" }}>
                <button
                  type="button"
                  onClick={() => setSarMode("optical")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    backgroundColor: sarMode === "optical" ? "#475569" : "transparent",
                    color: sarMode === "optical" ? "#fff" : "#94a3b8",
                  }}
                >
                  ☁️ Standard Optical (Cloud-Blind)
                </button>
                <button
                  type="button"
                  onClick={() => setSarMode("radar")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    backgroundColor: sarMode === "radar" ? "#0284c7" : "transparent",
                    color: "#fff",
                  }}
                >
                  🛰️ SAR Microwave Penetration (Real Data)
                </button>
              </div>
            </div>
          </div>

          {/* SAR Comparison Viewer */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", marginBottom: "20px" }}>
            {/* Visual Screen */}
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "16px", padding: "18px", position: "relative", minHeight: "360px", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <strong style={{ fontSize: "0.95rem", color: "#fff" }}>
                  {selectedSarSite.name} — {sarMode === "optical" ? "Optical Satellite Feed" : "Synthetic Aperture Radar (VV Polarisation)"}
                </strong>
                <span style={{ fontSize: "0.72rem", backgroundColor: sarMode === "radar" ? "#059669" : "#dc2626", color: "#fff", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
                  {sarMode === "radar" ? "● CLOUDS PIERCED" : "● 100% BLOCKED BY CLOUDS"}
                </span>
              </div>

              {/* Simulated Map / Radar Canvas View */}
              <div style={{
                height: "260px",
                borderRadius: "12px",
                position: "relative",
                overflow: "hidden",
                border: "1px solid #1e293b",
                backgroundColor: sarMode === "optical" ? "#cbd5e1" : "#020c1b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {sarMode === "optical" ? (
                  <div style={{ textAlign: "center", color: "#475569", padding: "20px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "8px" }}>☁️☁️☁️</div>
                    <div style={{ fontWeight: "800", fontSize: "1rem", color: "#1e293b" }}>
                      OPTICAL SATELLITE OBSCURED (100% Cloud Reflection)
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#475569", maxWidth: "340px", margin: "6px auto 0" }}>
                      Monsoon cloudbursts over the Brahmaputra Basin completely block optical cameras. Government portals see zero ground terrain.
                    </p>
                  </div>
                ) : (
                  <div style={{ width: "100%", height: "100%", position: "relative", padding: "16px", boxSizing: "border-box" }}>
                    <svg width="100%" height="100%" viewBox="0 0 400 200" style={{ position: "absolute", top: 0, left: 0 }}>
                      <path d="M 0 100 Q 100 70 200 110 T 400 90" fill="none" stroke="#0ea5e9" strokeWidth="24" opacity="0.8" />
                      <path d="M 60 70 Q 140 30 220 70 T 360 60" fill="none" stroke="#38bdf8" strokeWidth="38" opacity="0.4" strokeDasharray="4 2" />
                      <circle cx="160" cy="85" r="8" fill="#ef4444" />
                      <text x="175" y="90" fill="#fca5a5" fontSize="11" fontWeight="bold">Breached Embankment (-21.4 dB)</text>
                      <circle cx="280" cy="110" r="8" fill="#ef4444" />
                      <text x="295" y="115" fill="#fca5a5" fontSize="11" fontWeight="bold">Flash Submersion Zone</text>
                    </svg>
                    <div style={{ position: "absolute", bottom: "12px", left: "14px", backgroundColor: "rgba(2,6,23,0.85)", padding: "6px 10px", borderRadius: "6px", fontSize: "0.72rem", color: "#38bdf8", border: "1px solid #0284c7" }}>
                      NISAR L-Band Active Microwave &bull; Resolution: 3m/pixel &bull; Penetrates Rain & Smoke
                    </div>
                  </div>
                )}
              </div>

              {/* Site selector buttons */}
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                {SAR_SITES.map((site, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSarSite(site)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: selectedSarSite.name === site.name ? "1px solid #38bdf8" : "1px solid #334155",
                      backgroundColor: selectedSarSite.name === site.name ? "rgba(56,189,248,0.15)" : "#1e293b",
                      color: selectedSarSite.name === site.name ? "#38bdf8" : "#94a3b8",
                      fontSize: "0.74rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {site.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Radar Telemetry & Flood Forecasting Dossier */}
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: "800", color: "#38bdf8" }}>
                🌊 SAR Flood Vector Telemetry
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
                <div style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b" }}>Active Satellite Constellation:</div>
                  <div style={{ fontWeight: "700", color: "#fff", marginTop: "2px" }}>{selectedSarSite.sarPenetration}</div>
                </div>

                <div style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b" }}>Cloud-Penetrated Water Expansion:</div>
                  <div style={{ fontWeight: "800", color: "#38bdf8", marginTop: "2px" }}>{selectedSarSite.inundationExpansionKm2}</div>
                </div>

                <div style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b" }}>Radar Surface Backscatter:</div>
                  <div style={{ fontWeight: "700", color: "#a7f3d0", marginTop: "2px" }}>{selectedSarSite.soilBackscatterDb}</div>
                </div>

                <div style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b" }}>Breach Telemetry:</div>
                  <div style={{ fontWeight: "700", color: "#f87171", marginTop: "2px" }}>{selectedSarSite.embankmentBreaches}</div>
                </div>

                <div style={{ padding: "10px", backgroundColor: "rgba(220,38,38,0.15)", border: "1px solid #ef4444", borderRadius: "8px", color: "#fca5a5", fontSize: "0.78rem", fontWeight: "700" }}>
                  🚨 {selectedSarSite.floodWarning}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: Local Dialect Voice-SOS (AI Model for NER Languages)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "dialectVoice" && (
        <div>
          <div style={{ backgroundColor: "rgba(15,23,42,0.8)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "16px", padding: "18px 22px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <span style={{ fontSize: "0.72rem", backgroundColor: "#059669", color: "#fff", padding: "3px 8px", borderRadius: "999px", fontWeight: "800" }}>
                  ZERO-BARRIER LINGUISTIC INCLUSION
                </span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: "8px 0 4px" }}>
                  Indigenous Dialect Voice-SOS (AI Translation for 8 NER Languages)
                </h2>
                <p style={{ fontSize: "0.83rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
                  Rural elders and panicked citizens across the Northeast speak indigenous dialects (Khasi, Garo, Mizo, Bodo, Mising, Ao Naga) and cannot type in English or Hindi during an emergency. The citizen taps one microphone button and screams for help; the AI model transcribes their dialect, instantly translates it to English and Hindi, classifies the distress severity, and dispatches responders.
                </p>
              </div>
            </div>
          </div>

          {/* Dialect Selector Bar */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "700", marginBottom: "8px" }}>
              🗣️ Select Indigenous Northeast Language to Test Voice-to-Action AI:
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {NER_DIALECTS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDialectSpeech(d)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: selectedDialect.id === d.id ? "1.5px solid #34d399" : "1px solid #334155",
                    backgroundColor: selectedDialect.id === d.id ? "rgba(5,150,105,0.25)" : "#0f172a",
                    color: selectedDialect.id === d.id ? "#fff" : "#94a3b8",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {d.language} <span style={{ fontSize: "0.7rem", color: "#64748b" }}>({d.state})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mic Action & Voice Translation Card */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            {/* Mic Interactive Interface */}
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div
                onClick={() => handleDialectSpeech(selectedDialect)}
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  backgroundColor: isListeningMic ? "#ef4444" : "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.4rem",
                  cursor: "pointer",
                  boxShadow: isListeningMic ? "0 0 35px rgba(239,68,68,0.8)" : "0 4px 20px rgba(2,132,199,0.4)",
                  transition: "all 0.2s",
                  marginBottom: "16px",
                }}
              >
                🎙️
              </div>

              <div style={{ fontSize: "1rem", fontWeight: "800", color: "#f8fafc" }}>
                {isListeningMic ? "Listening to Dialect Speech Input..." : `Tap to Speak in ${selectedDialect.language}`}
              </div>
              <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "6px 0 14px" }}>
                Auto-detects pitch, cadence, and tribal dialect vocabulary. Zero English/Hindi literacy required.
              </p>

              <div style={{ padding: "12px", backgroundColor: "#020617", borderRadius: "10px", width: "100%", boxSizing: "border-box", border: "1px solid #1e293b", textAlign: "left" }}>
                <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
                  Spoken Sample Trigger ({selectedDialect.language}):
                </div>
                <div style={{ fontSize: "0.88rem", color: "#38bdf8", fontWeight: "700", marginTop: "4px" }}>
                  "{selectedDialect.audioScript}"
                </div>
              </div>
            </div>

            {/* AI Translation & Dispatch Dossier */}
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "#34d399" }}>
                  🧠 AI Dialect-to-Action Dispatch Output
                </h3>
                {isPlayingAudio && (
                  <span style={{ fontSize: "0.7rem", backgroundColor: "#059669", color: "#fff", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
                    🔊 Speaking English Translation
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem" }}>
                <div style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b" }}>1. Native Language Detected:</div>
                  <div style={{ fontWeight: "700", color: "#fff" }}>{selectedDialect.language} ({selectedDialect.state})</div>
                </div>

                <div style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b" }}>2. Neural English Translation (For National NDRF Command):</div>
                  <div style={{ fontWeight: "700", color: "#38bdf8", marginTop: "2px" }}>"{selectedDialect.englishTranslation}"</div>
                </div>

                <div style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b" }}>3. Hindi Translation (For Field SDRF/CRPF Units):</div>
                  <div style={{ fontWeight: "700", color: "#fde68a", marginTop: "2px" }}>"{selectedDialect.hindiTranslation}"</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ padding: "8px", backgroundColor: "rgba(220,38,38,0.15)", borderRadius: "8px", border: "1px solid #ef4444" }}>
                    <div style={{ fontSize: "0.68rem", color: "#fca5a5" }}>Classified Distress:</div>
                    <div style={{ fontWeight: "800", color: "#f87171", fontSize: "0.78rem" }}>{selectedDialect.detectedDistress}</div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "#020617", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.68rem", color: "#64748b" }}>Extracted Coordinates:</div>
                    <div style={{ fontWeight: "700", color: "#34d399", fontSize: "0.78rem" }}>{selectedDialect.coords}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: Bamboo-Mesh Hyper-Local Drone Delivery Router
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "bambooDrone" && (
        <div>
          <div style={{ backgroundColor: "rgba(15,23,42,0.8)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "16px", padding: "18px 22px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <span style={{ fontSize: "0.72rem", backgroundColor: "#d97706", color: "#fff", padding: "3px 8px", borderRadius: "999px", fontWeight: "800" }}>
                  REMOTE GORGE AIRLIFT LOGISTICS
                </span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: "8px 0 4px" }}>
                  Bamboo-Mesh Hyper-Local Drone Corridor Logistics
                </h2>
                <p style={{ fontSize: "0.83rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
                  When mountain roads and ropeway suspension bridges are snapped by debris, physical rescue vehicles cannot reach isolated habitations. This platform maps community-built bamboo-mesh shock-absorbing landing pads and calculates 3D aerial trajectories that avoid high-altitude mountain downdrafts and dense cloud ceilings.
                </p>
              </div>

              <button
                type="button"
                onClick={launchDroneMission}
                disabled={droneFlightState === "EN_ROUTE"}
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: droneFlightState === "EN_ROUTE" ? "not-allowed" : "pointer",
                  fontWeight: "800",
                  fontSize: "0.88rem",
                  background: droneFlightState === "PAYLOAD_DROPPED" ? "linear-gradient(135deg, #059669, #047857)" : "linear-gradient(135deg, #d97706, #b45309)",
                  color: "#fff",
                  boxShadow: "0 4px 18px rgba(217,119,6,0.4)",
                }}
              >
                {droneFlightState === "EN_ROUTE" ? "🚁 Drone Navigating Gorge Path..." : droneFlightState === "PAYLOAD_DROPPED" ? "✓ Relief Dropped on Bamboo Pad" : "🚀 Launch Automated 3D Drone Airlift"}
              </button>
            </div>
          </div>

          {/* Drone Mission HUD */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", marginBottom: "20px" }}>
            {/* 3D Flight Corridor Profile */}
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "#f8fafc" }}>
                    {selectedDroneHub.name}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    Target: <strong style={{ color: "#38bdf8" }}>{selectedDroneHub.targetLandingPad}</strong>
                  </div>
                </div>
                <span style={{ fontSize: "0.72rem", backgroundColor: "#0284c7", color: "#fff", padding: "3px 8px", borderRadius: "999px", fontWeight: "700" }}>
                  {selectedDroneHub.distanceKm} km Corridor
                </span>
              </div>

              {/* Waypoint 3D Path Visualizer */}
              <div style={{ backgroundColor: "#020617", borderRadius: "12px", padding: "16px", border: "1px solid #1e293b", marginBottom: "16px" }}>
                <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>
                  3D Ridge-Avoidance Waypoint Profile:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedDroneHub.waypointPath.map((wp, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.78rem" }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: idx === 0 ? "#0284c7" : idx === selectedDroneHub.waypointPath.length - 1 ? "#22c55e" : "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "700", color: "#fff" }}>
                        {idx + 1}
                      </span>
                      <span style={{ color: "#cbd5e1", flex: 1 }}>{wp}</span>
                      {idx === selectedDroneHub.waypointPath.length - 1 && (
                        <span style={{ fontSize: "0.7rem", color: "#34d399", fontWeight: "700" }}>● Bamboo Shock-Net Ready</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress Bar during flight */}
                {droneFlightState !== "IDLE" && (
                  <div style={{ marginTop: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8", marginBottom: "4px" }}>
                      <span>Autonomous Flight Progress:</span>
                      <span style={{ color: "#38bdf8", fontWeight: "700" }}>{flightProgressPct}%</span>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "#1e293b", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${flightProgressPct}%`, backgroundColor: flightProgressPct === 100 ? "#22c55e" : "#0284c7", transition: "width 0.6s" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Hub Selection */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {DRONE_HUBS.map((hub) => (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() => {
                      setSelectedDroneHub(hub);
                      setDroneFlightState("IDLE");
                      setFlightProgressPct(0);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: selectedDroneHub.id === hub.id ? "1px solid #f59e0b" : "1px solid #334155",
                      backgroundColor: selectedDroneHub.id === hub.id ? "rgba(245,158,11,0.15)" : "#1e293b",
                      color: selectedDroneHub.id === hub.id ? "#fbbf24" : "#94a3b8",
                      fontSize: "0.74rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {hub.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Cargo Manifest & Terrain Hazards */}
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "16px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: "800", color: "#fbbf24" }}>
                📦 Medical Cargo Manifest & Flight Telemetry
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
                <div style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b" }}>Loaded Life-Saving Cargo:</div>
                  <div style={{ fontWeight: "700", color: "#34d399", marginTop: "2px" }}>{selectedDroneHub.cargoLoaded}</div>
                </div>

                <div style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b" }}>Max Flight Altitude (MSL):</div>
                  <div style={{ fontWeight: "700", color: "#fff", marginTop: "2px" }}>{selectedDroneHub.altitudeMslM} meters</div>
                </div>

                <div style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px" }}>
                  <div style={{ color: "#64748b" }}>Micro-Weather & Gorge Downward Wind:</div>
                  <div style={{ fontWeight: "700", color: "#f87171", marginTop: "2px" }}>{selectedDroneHub.valleyGorgeRisk}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ padding: "8px", backgroundColor: "#020617", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.68rem", color: "#64748b" }}>Est. Transit Time:</div>
                    <div style={{ fontWeight: "800", color: "#38bdf8", fontSize: "0.82rem" }}>{selectedDroneHub.estimatedFlightMin} mins</div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "#020617", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.68rem", color: "#64748b" }}>Battery Reserve:</div>
                    <div style={{ fontWeight: "800", color: "#34d399", fontSize: "0.82rem" }}>{selectedDroneHub.batteryReq}</div>
                  </div>
                </div>

                <div style={{ padding: "10px", backgroundColor: "rgba(16,185,129,0.12)", border: "1px solid #10b981", borderRadius: "8px", color: "#6ee7b7", fontSize: "0.75rem" }}>
                  ✓ <strong>Bamboo Pad Safety:</strong> Woven bamboo mesh absorbs 4.8G drop impact; winch mechanism lowers medical canister without propeller rotor-wash hazard to villagers.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
