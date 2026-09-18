import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  PhoneCall,
  Printer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  LifeBuoy,
  ExternalLink,
  Search,
  BookmarkCheck,
  Zap,
  Flame,
  Waves,
  Mountain,
  HeartPulse,
  Share2
} from "lucide-react";

// Real-World Comprehensive Disaster Safety Protocols & SOPs
const DISASTER_GUIDES = {
  Cyclone: {
    icon: "🌀",
    badge: "CYCLONE_ALERT",
    accentColor: "#38bdf8",
    title: "Cyclone & Severe Storm Surge Safety",
    threatLevel: "Category 1–5 Coastal Cyclone Threat",
    hotline: "1070",
    hotlineLabel: "1070 (SDMA) / 112 (National Emergency)",
    before: [
      "Check roof, windows, and remove dead branches or loose outdoor objects.",
      "Identify the nearest Multi-Purpose Cyclone Shelter and prepare family evacuation plan.",
      "Charge power banks, battery-powered radios, and waterproof emergency torches.",
      "Stock 3 days of potable water (3L/person/day) and non-perishable ready-to-eat dry rations.",
      "Keep cattle/pets untied with reflective collars before storm landfall.",
    ],
    during: [
      "Stay indoors in the strongest central room, away from exterior windows and glass doors.",
      "Do NOT venture outside during the calm 'eye of the storm' — severe reverse winds follow rapidly.",
      "Turn off the main electrical breaker switch and gas cylinder regulator immediately.",
      "If advised by local officials or NDRF, evacuate immediately to designated shelter.",
      "Listen strictly to official All India Radio / IMD bulletins; ignore unverified rumors.",
    ],
    after: [
      "Wait for official 'All-Clear' signal from district administration before exiting shelter.",
      "Watch out for fallen live power lines, broken gas mains, and damaged tree branches.",
      "Boil all drinking water or use chlorine purification tablets to prevent waterborne diseases.",
      "Take photos of structural damage for insurance claims and relief grant assessments.",
      "Report road blockages and live wire hazards to local emergency numbers (1912 for Electricity).",
    ],
    officialSopUrl: "https://ndma.gov.in/Governance/Guidelines/cyclone",
  },

  Flood: {
    icon: "🌊",
    badge: "FLOOD_ALERT",
    accentColor: "#06b6d4",
    title: "Flood, Inundation & Tsunami Safety",
    threatLevel: "Flash Flood & Riverine Inundation",
    hotline: "108",
    hotlineLabel: "108 (Ambulance) / 1077 (District Control)",
    before: [
      "Know your area's flood vulnerability and height above sea level.",
      "Elevate furnace, water heater, and electrical panels above estimated flood levels.",
      "Pack vital certificates, passports, and deed records in double-sealed waterproof bags.",
      "Prepare emergency floatation devices (life vests, sealed plastic water cans).",
      "Plan higher ground evacuation routes avoiding low underpasses and culverts.",
    ],
    during: [
      "Move to higher ground immediately; do NOT wait for water to enter your home.",
      "Never drive or walk through moving water ('Turn Around, Don't Drown' — 15cm sweeps a person, 60cm moves cars).",
      "Avoid touching electrical equipment if you are standing in water.",
      "If trapped in a building, move to the roof only if necessary; signal for help with a brightly colored cloth or whistle.",
      "Keep updated with Central Water Commission (CWC) river stage forecasts.",
    ],
    after: [
      "Do not eat food that has come into contact with floodwater.",
      "Disinfect all flooded rooms with bleaching powder / chlorine solution.",
      "Watch out for venomous snakes and rodents seeking shelter in dry corners.",
      "Pump out flooded basements gradually (1/3 per day) to avoid foundation wall collapse.",
      "Use safe drinking water sources or chlorine water purification kits.",
    ],
    officialSopUrl: "https://ndma.gov.in/Governance/Guidelines/floods",
  },

  Earthquake: {
    icon: "🏚️",
    badge: "SEISMIC_ALERT",
    accentColor: "#f59e0b",
    title: "Earthquake & Seismic Tremor Safety",
    threatLevel: "Seismic Zone II to V Hazards",
    hotline: "112",
    hotlineLabel: "112 (National Emergency) / 1070 (Disaster Control)",
    before: [
      "Fasten heavy furniture, cupboards, and water heaters firmly to structural wall studs.",
      "Store heavy and breakable objects on low shelves with latching cabinet doors.",
      "Practice 'DROP, COVER, and HOLD ON' drills with all household members quarterly.",
      "Identify safe interior spots: beneath sturdy dining tables or against interior load-bearing walls.",
      "Locate and label emergency gas and electrical main shutoff switches.",
    ],
    during: [
      "DROP to your hands and knees immediately.",
      "COVER your head and neck under a sturdy desk or table.",
      "HOLD ON to your shelter until the shaking stops.",
      "If in bed: stay there, curl face down, and cover your head with a pillow.",
      "If outdoors: move to an open area away from power lines, chimneys, and high-rise glass façades.",
      "Do NOT run outside during shaking or use elevators under any circumstances.",
    ],
    after: [
      "Expect aftershocks which can trigger additional structural collapses.",
      "Inspect gas lines for smell/leaks; do not strike matches or operate light switches.",
      "Check yourself and family members for trauma; apply immediate pressure to bleeding wounds.",
      "If trapped under debris: tap on a pipe or wall with a stone, or use a whistle; do NOT shout constantly to preserve air.",
      "Leave severely cracked buildings and assemble in designated open ground assembly zones.",
    ],
    officialSopUrl: "https://ndma.gov.in/Governance/Guidelines/earthquakes",
  },

  Fire: {
    icon: "🔥",
    badge: "FIRE_HAZARD",
    accentColor: "#ef4444",
    title: "Urban Fire & Wildfire Evacuation",
    threatLevel: "Rapid Thermal & Smoke Hazard",
    hotline: "101",
    hotlineLabel: "101 (Fire Brigade) / 112 (Emergency)",
    before: [
      "Install and test smoke alarms on every level of the home monthly.",
      "Keep ABC-type dry powder fire extinguishers in the kitchen and stairwells.",
      "Ensure two clear, unobstructed escape exits from every room.",
      "Create a 10-meter defensible fuel-free perimeter around houses in wildfire-prone zones.",
      "Teach family members: STOP, DROP, and ROLL if clothing catches fire.",
    ],
    during: [
      "Get out immediately — never stop to collect personal belongings.",
      "Crawl low under smoke where cool, breathable air remains near the floor.",
      "Test doors with the back of your hand before turning handles; if hot, use alternative exit.",
      "Close doors behind you to slow down the spread of fire and toxic smoke.",
      "Call 101 or 112 once you are in a safe open location.",
    ],
    after: [
      "Never re-enter a burning or extinguished building until the Fire Chief declares it fully safe.",
      "Treat minor burns with clean cool running water for 15 minutes (no ice or butter).",
      "Discard any food, medicine, or cosmetics exposed to smoke, heat, or extinguishing chemicals.",
      "Cooperate with fire forensic investigators to identify origin causes.",
      "Contact your emergency relief officer and insurance assessor.",
    ],
    officialSopUrl: "https://ndma.gov.in/Governance/Guidelines/fire",
  },

  Landslide: {
    icon: "⛰️",
    badge: "SLOPE_HAZARD",
    accentColor: "#10b981",
    title: "Landslide, Debris Flow & Cloudburst Safety",
    threatLevel: "Hilly & Unstable Slope Hazard",
    hotline: "1077",
    hotlineLabel: "1077 (District Collector) / 112",
    before: [
      "Learn about slope history and past mudslide tracks in your hill zone.",
      "Plant ground cover on slopes and build retaining walls with proper drainage weep-holes.",
      "Watch for warning signs: sticking doors/windows, leaning trees, or new cracks in plaster.",
      "Listen for unusual sounds: cracking trees, rushing water, or rumbling boulders.",
      "Prepare emergency hill evacuation backpack with whistle and high-visibility jackets.",
    ],
    during: [
      "Quickly evacuate slope zones; move uphill or perpendicular to the path of debris flow.",
      "Avoid river valleys, narrow ravines, and low channels during intense cloudburst rains.",
      "If escape is impossible, curl into a tight ball and protect your head with arms and sturdy objects.",
      "Do not cross flooded culverts or mountain bridges showing scour marks.",
    ],
    after: [
      "Stay away from the slide area; additional slope collapses often follow.",
      "Inspect utility lines and report severed pipes to emergency services immediately.",
      "Watch for flash floods that often accompany landslide dam bursts.",
      "Assist trapped neighbors without entering unstable slope perimeters.",
    ],
    officialSopUrl: "https://ndma.gov.in/Governance/Guidelines/landslides",
  },

  FirstAid: {
    icon: "🩹",
    badge: "LIFE_SUPPORT",
    accentColor: "#ec4899",
    title: "Emergency First Aid & CPR Protocols",
    threatLevel: "Immediate Life Support (ILS)",
    hotline: "108",
    hotlineLabel: "108 (Ambulance) / 112 (National Emergency)",
    before: [
      "Maintain a certified First-Aid Kit with sterile gauze, tourniquet, antiseptic, and burn dressing.",
      "Keep an updated list of family blood groups, allergies, and chronic medical prescriptions.",
      "Complete a certified Red Cross / St. John Ambulance First-Aid and CPR training course.",
    ],
    during: [
      "Severe Bleeding: Apply direct, firm pressure with sterile cloth; elevate limb above heart.",
      "Adult CPR: Push hard and fast in the center of the chest (100–120 bpm to rhythm of Stayin' Alive).",
      "Choking: Administer 5 back blows followed by 5 abdominal thrusts (Heimlich Maneuver).",
      "Heatstroke: Move victim to shade, apply ice packs to neck/armpits/groin, and fan vigorously.",
      "Fracture: Immobilize the injured limb with splints; do not attempt to realign broken bones.",
    ],
    after: [
      "Hand over detailed casualty notes to arriving paramedics.",
      "Restock used first-aid supplies immediately.",
      "Monitor injured persons for signs of traumatic shock (pale skin, rapid breathing, confusion).",
    ],
    officialSopUrl: "https://www.who.int/emergencies",
  },
};

const OFFICIAL_SAFETY_WEBSITES = [
  {
    name: "NDMA Official Standard Operating Procedures",
    url: "https://ndma.gov.in/Governance/Guidelines",
    desc: "Indian National Disaster Management Authority master guidelines & statutory standard protocols.",
    badge: "GOVT_OFFICIAL",
  },
  {
    name: "International Red Cross (IFRC) Preparedness",
    url: "https://www.ifrc.org/our-work/disasters-climate-and-crises",
    desc: "Global community-level first-aid, shelter manuals, and international disaster response drills.",
    badge: "IFRC_GLOBAL",
  },
  {
    name: "Ready.gov Emergency Action Plans",
    url: "https://www.ready.gov",
    desc: "Tactical checklist guides, 72-hour bug-out bags, and family crisis evacuation strategies.",
    badge: "TACTICAL_PLANS",
  },
  {
    name: "WHO Health Emergencies Programme",
    url: "https://www.who.int/emergencies",
    desc: "World Health Organization protocols for mass casualty triage, clean water and infection control.",
    badge: "WHO_HEALTH",
  },
];

export default function SafetyGuides() {
  const [selectedDisaster, setSelectedDisaster] = useState("Cyclone");
  const [completedItems, setCompletedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all", "before", "during", "after"

  const guide = DISASTER_GUIDES[selectedDisaster];

  // Stop speaking when unmounted or guide changed
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [selectedDisaster]);

  const toggleItem = (key) => {
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalBefore = guide.before.length;
  const doneBefore = guide.before.filter((_, i) => completedItems[`${selectedDisaster}-before-${i}`]).length;
  const readinessPercent = Math.round((doneBefore / totalBefore) * 100);

  // Web Speech API Voice guidance
  const toggleVoiceGuide = () => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported on your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `Safety protocols for ${guide.title}. Phase one: Before the disaster. ${guide.before.join(". ")}. Phase two: During the disaster. ${guide.during.join(". ")}. Phase three: Post disaster recovery. ${guide.after.join(". ")}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Filter disaster guides based on search query
  const disasterKeys = Object.keys(DISASTER_GUIDES).filter((key) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const g = DISASTER_GUIDES[key];
    return (
      key.toLowerCase().includes(q) ||
      g.title.toLowerCase().includes(q) ||
      g.threatLevel.toLowerCase().includes(q) ||
      g.before.some((b) => b.toLowerCase().includes(q)) ||
      g.during.some((d) => d.toLowerCase().includes(q)) ||
      g.after.some((a) => a.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ padding: "20px", color: "#f8fafc", minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ── Top Mission Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
          paddingBottom: "18px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "rgba(14, 165, 233, 0.12)",
                border: "1px solid rgba(14, 165, 233, 0.3)",
                color: "#38bdf8",
                fontSize: "0.72rem",
                fontWeight: "800",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px #38bdf8" }} />
              OPERATIONAL SAFETY SOPs
            </div>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>
              GOV_NDMA_V4.2 • IFRC_COMPLIANT
            </span>
          </div>

          <h1
            style={{
              margin: "8px 0 4px 0",
              fontSize: "1.85rem",
              fontWeight: "900",
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tactical Disaster Protocols & Survival Matrix
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.92rem", maxWidth: "780px" }}>
            Three-phase operational procedures (Preparation, Crisis Survival, Post-Event Triage) optimized for offline survival, high-stress response, and rapid civilian execution.
          </p>
        </div>

        {/* Tactical Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Audio voice guide */}
          <button
            type="button"
            onClick={toggleVoiceGuide}
            style={{
              padding: "10px 16px",
              background: isSpeaking ? "rgba(239, 68, 68, 0.18)" : "rgba(14, 165, 233, 0.12)",
              color: isSpeaking ? "#f87171" : "#38bdf8",
              border: isSpeaking ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(14, 165, 233, 0.3)",
              borderRadius: "12px",
              fontWeight: "800",
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
          >
            {isSpeaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
            <span>{isSpeaking ? "Mute Voice Guide" : "Audio Safety Briefing"}</span>
          </button>

          {/* Print Card */}
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              padding: "10px 16px",
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              color: "#cbd5e1",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s ease",
            }}
          >
            <Printer size={16} />
            <span>Print Field Card</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Strip ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "8px 14px",
          backdropFilter: "blur(12px)",
        }}
      >
        <Search size={18} color="#64748b" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search safety protocols (e.g. CPR, tourniquet, cyclone eye, floodwater, gas shutoff)..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#f8fafc",
            fontSize: "0.88rem",
            width: "100%",
            fontFamily: "inherit",
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Disaster Selector Nav (Horizontal Tactical Dock) ── */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          paddingBottom: "12px",
          marginBottom: "24px",
          scrollbarWidth: "thin",
        }}
      >
        {disasterKeys.map((key) => {
          const item = DISASTER_GUIDES[key];
          const isSelected = selectedDisaster === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDisaster(key)}
              style={{
                padding: "12px 20px",
                borderRadius: "14px",
                border: isSelected ? `1.5px solid ${item.accentColor}` : "1px solid rgba(255, 255, 255, 0.08)",
                background: isSelected
                  ? `linear-gradient(135deg, ${item.accentColor}22 0%, rgba(15, 23, 42, 0.9) 100%)`
                  : "rgba(15, 23, 42, 0.65)",
                color: isSelected ? "#ffffff" : "#94a3b8",
                fontWeight: "800",
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                whiteSpace: "nowrap",
                backdropFilter: "blur(12px)",
                boxShadow: isSelected ? `0 8px 24px -6px ${item.accentColor}44` : "none",
                transform: isSelected ? "translateY(-2px)" : "none",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <span style={{ fontSize: "1.35rem" }}>{item.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: isSelected ? "#f8fafc" : "#cbd5e1" }}>{key}</div>
                <div style={{ fontSize: "0.68rem", color: isSelected ? item.accentColor : "#64748b", fontFamily: "monospace" }}>
                  {item.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Active Guide Hero Panel (Tactical HUD) ── */}
      <div
        className="tactical-card"
        style={{
          border: `1px solid ${guide.accentColor}44`,
          borderRadius: "20px",
          padding: "24px 28px",
          marginBottom: "28px",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, ${guide.accentColor}0a 100%)`,
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: "absolute",
            right: "-80px",
            top: "-80px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: guide.accentColor,
            opacity: 0.07,
            filter: "blur(70px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: `${guide.accentColor}18`,
                  border: `1px solid ${guide.accentColor}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                }}
              >
                {guide.icon}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.55rem", fontWeight: "900", color: "#f8fafc", letterSpacing: "-0.01em" }}>
                  {guide.title}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(245, 158, 11, 0.15)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      color: "#fbbf24",
                      fontSize: "0.72rem",
                      fontWeight: "800",
                    }}
                  >
                    THREAT PROFILE
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: "600" }}>
                    {guide.threatLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Readiness Ring & Link */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 18px",
                borderRadius: "14px",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Pre-Crisis Readiness
                </div>
                <div
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: "900",
                    color: readinessPercent === 100 ? "#22c55e" : guide.accentColor,
                    fontFamily: "monospace",
                  }}
                >
                  {readinessPercent}%
                  <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "500", marginLeft: "6px" }}>
                    ({doneBefore}/{totalBefore} Verified)
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: `conic-gradient(${readinessPercent === 100 ? "#22c55e" : guide.accentColor} ${readinessPercent * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "#090d16",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    color: "#f8fafc",
                  }}
                >
                  {doneBefore}/{totalBefore}
                </div>
              </div>
            </div>

            <a
              href={guide.officialSopUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "12px 18px",
                backgroundColor: "rgba(14, 165, 233, 0.12)",
                border: "1px solid rgba(14, 165, 233, 0.35)",
                color: "#38bdf8",
                borderRadius: "14px",
                fontWeight: "800",
                fontSize: "0.82rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <span>Statutory SOP</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* Emergency Speed-Dial Hotline Strip */}
        <div
          style={{
            marginTop: "18px",
            padding: "12px 18px",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderRadius: "14px",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                display: "inline-flex",
                padding: "6px",
                borderRadius: "8px",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                color: "#f87171",
              }}
            >
              <PhoneCall size={16} />
            </span>
            <div>
              <span style={{ fontSize: "0.85rem", color: "#fca5a5", fontWeight: "700" }}>
                Hazard Dedicated Line: <strong>{guide.hotlineLabel}</strong>
              </span>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                Zero-toll national emergency dispatch priority • Instant cellular GPS triangulation
              </div>
            </div>
          </div>

          <a
            href={`tel:${guide.hotline}`}
            style={{
              padding: "8px 18px",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: "800",
              fontSize: "0.82rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
            }}
          >
            <PhoneCall size={14} />
            <span>Call {guide.hotline} Now</span>
          </a>
        </div>
      </div>

      {/* ── Phase Tab Filter (Optional Focus View) ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "All 3 Chronological Phases" },
          { id: "before", label: "Phase 1: Pre-Disaster Readiness" },
          { id: "during", label: "Phase 2: During Hazard (Life Safety)" },
          { id: "after", label: "Phase 3: Post-Disaster Recovery" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: activeTab === tab.id ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
              background: activeTab === tab.id ? "rgba(14, 165, 233, 0.15)" : "rgba(15, 23, 42, 0.5)",
              color: activeTab === tab.id ? "#38bdf8" : "#94a3b8",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Three Action Phases Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: activeTab === "all" ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr",
          gap: "22px",
          marginBottom: "36px",
        }}
      >
        {/* Phase 1: Before */}
        {(activeTab === "all" || activeTab === "before") && (
          <div
            className="tactical-card"
            style={{
              border: "1px solid rgba(34, 197, 94, 0.25)",
              borderRadius: "18px",
              padding: "22px",
              background: "linear-gradient(180deg, rgba(34, 197, 94, 0.04) 0%, rgba(15, 23, 42, 0.75) 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
                borderBottom: "1px solid rgba(34, 197, 94, 0.2)",
                paddingBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    background: "rgba(34, 197, 94, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4ade80",
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#4ade80" }}>
                    Phase 1: Pre-Disaster Readiness
                  </h3>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Mitigation & Household Drills</span>
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#4ade80", fontWeight: "800" }}>
                T-MINUS DRILL
              </span>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "14px", lineHeight: "1.5" }}>
              Click items as completed to calculate your family survival quotient:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {guide.before.map((step, idx) => {
                const itemKey = `${selectedDisaster}-before-${idx}`;
                const isChecked = !!completedItems[itemKey];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleItem(itemKey)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      backgroundColor: isChecked ? "rgba(34, 197, 94, 0.14)" : "rgba(255, 255, 255, 0.025)",
                      border: isChecked ? "1px solid rgba(34, 197, 94, 0.45)" : "1px solid rgba(255, 255, 255, 0.07)",
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      lineHeight: "1.45",
                      color: isChecked ? "#bbf7d0" : "#cbd5e1",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: isChecked ? "0 4px 16px -4px rgba(34, 197, 94, 0.2)" : "none",
                    }}
                  >
                    <div
                      style={{
                        minWidth: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        border: isChecked ? "1.5px solid #22c55e" : "1.5px solid #475569",
                        backgroundColor: isChecked ? "#22c55e" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#052e16",
                        fontSize: "0.75rem",
                        fontWeight: "900",
                        marginTop: "2px",
                      }}
                    >
                      {isChecked ? "✓" : ""}
                    </div>
                    <span style={{ textDecoration: isChecked ? "line-through" : "none", opacity: isChecked ? 0.9 : 1 }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Phase 2: During */}
        {(activeTab === "all" || activeTab === "during") && (
          <div
            className="tactical-card"
            style={{
              border: "1px solid rgba(251, 146, 60, 0.25)",
              borderRadius: "18px",
              padding: "22px",
              background: "linear-gradient(180deg, rgba(251, 146, 60, 0.04) 0%, rgba(15, 23, 42, 0.75) 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
                borderBottom: "1px solid rgba(251, 146, 60, 0.2)",
                paddingBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    background: "rgba(251, 146, 60, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fb923c",
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#fb923c" }}>
                    Phase 2: During the Crisis
                  </h3>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Life Preservation & Defense</span>
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#fb923c", fontWeight: "800" }}>
                T-ZERO PROTOCOL
              </span>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "14px", lineHeight: "1.5" }}>
              Immediate life-safety actions when hazardous event strikes:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {guide.during.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(251, 146, 60, 0.08)",
                    border: "1px solid rgba(251, 146, 60, 0.25)",
                    fontSize: "0.88rem",
                    lineHeight: "1.45",
                    color: "#fed7aa",
                  }}
                >
                  <span style={{ fontWeight: "800", color: "#fb923c", marginTop: "1px" }}>⚡</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3: After */}
        {(activeTab === "all" || activeTab === "after") && (
          <div
            className="tactical-card"
            style={{
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "18px",
              padding: "22px",
              background: "linear-gradient(180deg, rgba(56, 189, 248, 0.04) 0%, rgba(15, 23, 42, 0.75) 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
                borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
                paddingBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    background: "rgba(56, 189, 248, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#38bdf8",
                  }}
                >
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#38bdf8" }}>
                    Phase 3: Post-Hazard Triage
                  </h3>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Recovery & Threat Neutralization</span>
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#38bdf8", fontWeight: "800" }}>
                T-PLUS RECOVERY
              </span>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "14px", lineHeight: "1.5" }}>
              Safe re-entry, secondary hazard avoidance & relief linkage:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {guide.after.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.22)",
                    fontSize: "0.88rem",
                    lineHeight: "1.45",
                    color: "#e0f2fe",
                  }}
                >
                  <span style={{ fontWeight: "800", color: "#38bdf8", marginTop: "1px" }}>🛡️</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Official Free External SOP Resources ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
            Official Statutory Disaster SOP Repositories
          </h2>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "6px",
              background: "rgba(14, 165, 233, 0.15)",
              color: "#38bdf8",
              fontSize: "0.72rem",
              fontWeight: "700",
            }}
          >
            FREE ACCESS
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {OFFICIAL_SAFETY_WEBSITES.map((site, i) => (
            <a
              key={i}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tactical-card"
              style={{
                borderRadius: "16px",
                padding: "18px 20px",
                color: "#ffffff",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(12px)",
                transition: "all 0.25s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <span
                  style={{
                    padding: "2px 7px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#38bdf8",
                    fontSize: "0.68rem",
                    fontWeight: "800",
                    fontFamily: "monospace",
                  }}
                >
                  {site.badge}
                </span>
                <span style={{ color: "#38bdf8", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: "700" }}>
                  Official Portal <ExternalLink size={13} />
                </span>
              </div>
              <strong style={{ fontSize: "0.98rem", color: "#f8fafc", lineHeight: "1.3" }}>{site.name}</strong>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.45" }}>{site.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}