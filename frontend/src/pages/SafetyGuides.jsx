import React, { useState } from "react";

// Real-World Comprehensive Disaster Safety Protocols & SOPs
const DISASTER_GUIDES = {
  Cyclone: {
    icon: "🌀",
    title: "Cyclone & Severe Storm Surge Safety",
    threatLevel: "Category 1–5 Coastal Threat",
    emergencyHelpline: "1070 (SDMA) / 112 (National Emergency)",
    before: [
      "Check roof, windows, and remove dead branches or loose outdoor objects.",
      "Identify the nearest Multi-Purpose Cyclone Shelter and prepare family evacuation plan.",
      "Charge power banks, battery-powered radios, and waterproof torches.",
      "Stock 3 days of potable water (3L/person/day) and non-perishable ready-to-eat dry rations.",
      "Keep cattle/pets untied with reflective collars before storm landfall.",
    ],
    during: [
      "Stay indoors in the strongest central room, away from exterior windows and glass doors.",
      "Do NOT venture outside during the calm 'eye of the storm' — severe reverse winds follow rapidly.",
      "Turn off the main electrical breaker switch and gas cylinder regulator.",
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
    title: "Flood, Inundation & Tsunami Safety",
    threatLevel: "Flash Flood & Riverine Inundation",
    emergencyHelpline: "108 (Ambulance) / 1077 (District Control)",
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
    title: "Earthquake & Seismic Tremor Safety",
    threatLevel: "Seismic Zone II to V Hazards",
    emergencyHelpline: "112 (All Emergency) / 1070 (Disaster Control)",
    before: [
      "Fasten heavy furniture, cupboards, and water heaters firmly to structural wall studs.",
      "Store heavy and breakable objects on low shelves with latching cabinet doors.",
      "Practice 'DROP, COVER, and HOLD ON' drills with all household members quarterly.",
      "Identify safe interior spots: beneath sturdy dining tables or against interior load-bearing walls.",
      "Locate and label emergency gas and electrical main shutoff switches.",
    ],
    during: [
      "**DROP** to your hands and knees immediately.",
      "**COVER** your head and neck under a sturdy desk or table.",
      "**HOLD ON** to your shelter until the shaking stops.",
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
    title: "Urban Fire & Wildfire Evacuation",
    threatLevel: "Rapid Thermal & Smoke Hazard",
    emergencyHelpline: "101 (Fire Brigade) / 112",
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
    title: "Landslide, Debris Flow & Cloudburst Safety",
    threatLevel: "Hilly & Unstable Slope Hazard",
    emergencyHelpline: "1077 (District Collector) / 112",
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
    title: "Emergency First Aid & CPR Protocols",
    threatLevel: "Immediate Life Support (ILS)",
    emergencyHelpline: "108 (Ambulance) / 112",
    before: [
      "Maintain a certified First-Aid Kit with sterile gauze, tourniquet, antiseptic, and burn dressing.",
      "Keep an updated list of family blood groups, allergies, and chronic medical prescriptions.",
      "Complete a certified Red Cross / St. John Ambulance First-Aid and CPR training course.",
    ],
    during: [
      "**Severe Bleeding:** Apply direct, firm pressure with sterile cloth; elevate limb above heart.",
      "**Adult CPR:** Push hard and fast in the center of the chest (100–120 beats per min to the rhythm of 'Stayin' Alive').",
      "**Choking:** Administer 5 back blows followed by 5 abdominal thrusts (Heimlich Maneuver).",
      "**Heatstroke:** Move victim to shade, apply ice packs to neck/armpits/groin, and fan vigorously.",
      "**Fracture:** Immobilize the injured limb with splints; do not attempt to realign broken bones.",
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
    name: "NDMA Official Standard Operating Procedures (SOPs)",
    url: "https://ndma.gov.in/Governance/Guidelines",
    desc: "Comprehensive Indian National Guidelines for all disaster typologies",
  },
  {
    name: "International Red Cross (IFRC) Preparedness",
    url: "https://www.ifrc.org/our-work/disasters-climate-and-crises",
    desc: "Global community-level first-aid and survival manuals",
  },
  {
    name: "Ready.gov Official Emergency Plans",
    url: "https://www.ready.gov",
    desc: "Detailed checklists, emergency kits, and family evacuation strategies",
  },
  {
    name: "WHO Emergency Health Guidelines",
    url: "https://www.who.int/emergencies",
    desc: "World Health Organization protocols for mass casualty and outbreak safety",
  },
];

export default function SafetyGuides() {
  const [selectedDisaster, setSelectedDisaster] = useState("Cyclone");
  const [completedItems, setCompletedItems] = useState({});

  const guide = DISASTER_GUIDES[selectedDisaster];

  const toggleItem = (key) => {
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalBefore = guide.before.length;
  const doneBefore = guide.before.filter((_, i) => completedItems[`${selectedDisaster}-before-${i}`]).length;
  const readinessPercent = Math.round((doneBefore / totalBefore) * 100);

  return (
    <div style={{ padding: "20px", color: "#ffffff", minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800", color: "#f8fafc" }}>
              🛡️ Disaster Safety Guides & Standard Operating Procedures
            </h1>
            <span style={{ backgroundColor: "#2563eb", color: "#fff", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "999px", fontWeight: "700" }}>
              Official SOPs
            </span>
          </div>
          <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Actionable three-phase disaster protocols based on NDMA, IFRC & WHO emergency safety guidelines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: "10px 18px",
            backgroundColor: "#1e293b",
            color: "#38bdf8",
            border: "1px solid #334155",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🖨️ Print Safety Card
        </button>
      </div>

      {/* ── Disaster Selector Tabs ── */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", marginBottom: "22px" }}>
        {Object.keys(DISASTER_GUIDES).map((key) => {
          const item = DISASTER_GUIDES[key];
          const isSelected = selectedDisaster === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDisaster(key)}
              style={{
                padding: "10px 18px",
                borderRadius: "12px",
                border: isSelected ? "1px solid #3b82f6" : "1px solid #334155",
                backgroundColor: isSelected ? "#2563eb" : "#1e293b",
                color: isSelected ? "#ffffff" : "#cbd5e1",
                fontWeight: "700",
                fontSize: "0.88rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
              <span>{key}</span>
            </button>
          );
        })}
      </div>

      {/* ── Active Guide Banner ── */}
      <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span style={{ fontSize: "2rem" }}>{guide.icon}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc" }}>
                  {guide.title}
                </h2>
                <span style={{ fontSize: "0.8rem", color: "#f59e0b", fontWeight: "600" }}>
                  ⚠️ {guide.threatLevel}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Preparedness Checklist:</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "800", color: readinessPercent === 100 ? "#22c55e" : "#38bdf8" }}>
                {readinessPercent}% Ready ({doneBefore}/{totalBefore})
              </div>
            </div>

            <a
              href={guide.officialSopUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 16px",
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                color: "#38bdf8",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "0.8rem",
                textDecoration: "none",
              }}
            >
              Official SOP ↗
            </a>
          </div>
        </div>

        {/* Emergency Hotline Bar */}
        <div style={{ marginTop: "14px", padding: "10px 14px", backgroundColor: "#0f172a", borderRadius: "10px", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ fontSize: "0.82rem", color: "#fca5a5", fontWeight: "600" }}>
            🚨 Emergency Contact for this Hazard: <strong>{guide.emergencyHelpline}</strong>
          </span>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Always prioritize human life safety over material assets
          </span>
        </div>
      </div>

      {/* ── Three Action Phases Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "26px" }}>
        {/* Phase 1: Before */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>🟢</span>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: "#4ade80" }}>
              Phase 1: Pre-Disaster Readiness
            </h3>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "12px" }}>
            Click items as you complete them to test your household readiness:
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
                    gap: "10px",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: isChecked ? "rgba(34, 197, 94, 0.12)" : "rgba(255,255,255,0.03)",
                    border: isChecked ? "1px solid #22c55e" : "1px solid #334155",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    lineHeight: "1.4",
                    color: isChecked ? "#f0fdf4" : "#e2e8f0",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontWeight: "800", color: isChecked ? "#22c55e" : "#64748b" }}>
                    {isChecked ? "☑" : "☐"}
                  </span>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase 2: During */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>🟠</span>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: "#fb923c" }}>
              Phase 2: During the Disaster (Life Safety)
            </h3>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "12px" }}>
            Critical actions when hazard strikes:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {guide.during.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(251, 146, 60, 0.08)",
                  border: "1px solid rgba(251, 146, 60, 0.25)",
                  fontSize: "0.85rem",
                  lineHeight: "1.4",
                  color: "#fed7aa",
                }}
              >
                <span style={{ fontWeight: "700", color: "#fb923c" }}>⚡</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 3: After */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>🔵</span>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: "#60a5fa" }}>
              Phase 3: Post-Disaster Recovery & Hazard Clearance
            </h3>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "12px" }}>
            Safe return, relief coordination & rebuilding:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {guide.after.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(96, 165, 250, 0.08)",
                  border: "1px solid rgba(96, 165, 250, 0.25)",
                  fontSize: "0.85rem",
                  lineHeight: "1.4",
                  color: "#dbeafe",
                }}
              >
                <span style={{ fontWeight: "700", color: "#60a5fa" }}>✓</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Official Free External SOP Resources ── */}
      <div>
        <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#38bdf8", marginBottom: "14px" }}>
          🌐 Official International & National Disaster SOP Libraries
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {OFFICIAL_SAFETY_WEBSITES.map((site, i) => (
            <a
              key={i}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "14px",
                padding: "16px",
                color: "#ffffff",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#334155";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{site.name}</strong>
                <span style={{ color: "#38bdf8", fontSize: "0.8rem" }}>Read SOP ↗</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.4" }}>{site.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}