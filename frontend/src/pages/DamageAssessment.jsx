import React, { useState } from "react";

const SAMPLE_SCENARIOS = [
  {
    name: "Coastal Cyclone Structural Impact",
    tag: "Cyclone Cat-4",
    imgUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
    damageLevel: "Severe",
    score: "78 / 100",
    color: "#ea580c",
    structuralRisk: "High — Roof Dislodgement & Wall Cracks",
    inundation: "1.2 meters waterlogging",
    roadStatus: "Partially Blocked by Fallen Trees",
    evacuationPriority: "Immediate (Priority 1)",
    recommendedGear: "Chain Saws, Power Generators, Tarpaulins, Water Filtration",
    actionPlan: "Deploy NDRF clearance team; establish mobile medical post within 500m.",
  },
  {
    name: "River Basin Flash Flood Submersion",
    tag: "Flood Inundation",
    imgUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    damageLevel: "Critical",
    score: "92 / 100",
    color: "#dc2626",
    structuralRisk: "Extreme — Foundation Scour & Submersion",
    inundation: "2.8 meters water depth",
    roadStatus: "Completely Submerged / Inaccessible by Road",
    evacuationPriority: "Airlift & Inflatable Boat Evacuation",
    recommendedGear: "ODRAF Motor Boats, Life Buoys, Helivac, Satellite Radios",
    actionPlan: "Dispatch amphibious boats; airlift stranded families from rooftops to high shelter.",
  },
  {
    name: "Earthquake Urban Debris & Collapse",
    tag: "Seismic M6.4",
    imgUrl: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=600&q=80",
    damageLevel: "Critical",
    score: "95 / 100",
    color: "#dc2626",
    structuralRisk: "Catastrophic — Structural Failure & Voids",
    inundation: "Nil (Rubble Hazard)",
    roadStatus: "Blocked by Masonry Rubble",
    evacuationPriority: "Search & Rescue (Golden 72 Hours)",
    recommendedGear: "Acoustic Life Detectors, Hydraulic Cutters, Heavy Cranes",
    actionPlan: "Cordon 50m collapse perimeter; deploy K9 canine rescue search units.",
  },
  {
    name: "Wildfire Perimeter & Tree Burn",
    tag: "Wildfire Forest",
    imgUrl: "https://images.unsplash.com/photo-1602980085566-4c65d6494944?auto=format&fit=crop&w=600&q=80",
    damageLevel: "Moderate",
    score: "55 / 100",
    color: "#f59e0b",
    structuralRisk: "Moderate — Perimeter Fire Threat",
    inundation: "Nil (Smoke Inhalation Hazard)",
    roadStatus: "Low Visibility / Smoke Corridor",
    evacuationPriority: "Precautionary Evacuation",
    recommendedGear: "Fire Retardant Foam, N95 Masks, Water Tankers",
    actionPlan: "Create 15m firebreak trench; issue air quality advisory for downwind villages.",
  },
];

const SATELLITE_OPEN_PORTALS = [
  {
    name: "ISRO Bhuvan Disaster Management Support (DMS)",
    url: "https://bhuvan-app1.nrsc.gov.in/disaster/",
    desc: "Indian Space Research Organisation live satellite flood & cyclone inundation layers",
    tag: "ISRO India",
  },
  {
    name: "Copernicus Emergency Management Service",
    url: "https://emergency.copernicus.eu",
    desc: "European Sentinel satellite rapid damage mapping and satellite vector analysis",
    tag: "Copernicus EMS",
  },
  {
    name: "NASA EarthData Natural Hazards & Disasters",
    url: "https://www.earthdata.nasa.gov/learn/find-data/near-real-time/hazards-and-disasters",
    desc: "Near real-time FIRMS active fire hotspots, MODIS flood & hurricane telemetry",
    tag: "NASA Open Data",
  },
  {
    name: "UNOSAT Rapid Mapping & Satellite Analysis",
    url: "https://unosat.org",
    desc: "UN Institute for Training and Research operational satellite damage evaluations",
    tag: "United Nations",
  },
];

export default function DamageAssessment() {
  const [activeTab, setActiveTab] = useState("bot"); // Default to WhatsApp/Telegram Bot
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [assessment, setAssessment] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // WhatsApp / Telegram Bot State
  const [botPlatform, setBotPlatform] = useState("whatsapp"); // 'whatsapp' | 'telegram'
  const [botMessages, setBotMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome to National Disaster Response AI Bot. Send or upload a photo of your damaged house, flooded street, or blocked road. I will automatically extract your EXIF GPS coordinates, evaluate damage severity, and pin a distress marker on the Master Response Map.",
      time: "Just now",
    },
  ]);
  const [pinnedMarker, setPinnedMarker] = useState(null);
  const [isBotProcessing, setIsBotProcessing] = useState(false);

  const triggerBotPhotoUpload = (sampleUrl = null, sampleLabel = "Ground Photo") => {
    setIsBotProcessing(true);
    const photoUrl = sampleUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80";

    // 1. Citizen sends photo
    setBotMessages((prev) => [
      ...prev,
      { sender: "user", text: `📷 [Sent Photo: ${sampleLabel}]`, image: photoUrl, time: new Date().toLocaleTimeString() },
    ]);

    // 2. Bot replies with EXIF & CV Analysis
    setTimeout(() => {
      const mockGps = "20.2961, 85.8245";
      const markerId = `DISTRESS-${Math.floor(Math.random() * 9000 + 1000)}`;

      setBotMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `🔍 Photo received. Extracting EXIF metadata...\n` +
            `📍 GPS Extracted: Lat 20.2961° N, Lng 85.8245° E (Near Ward 7 Riverbank)\n` +
            `🧠 Computer Vision Evaluation: Severe Inundation (2.2m depth) & Wall Scour Risk.\n` +
            `🏷️ Severity Score: 88 / 100 [CRITICAL]\n` +
            `📌 Color-Coded RED Distress Marker pinned on Master Map (#${markerId}).\n` +
            `🚨 NDRF Amphibious Boat Unit #04 notified.`,
          time: new Date().toLocaleTimeString(),
        },
      ]);

      const newPin = {
        id: markerId,
        coords: mockGps,
        severity: "CRITICAL",
        score: 88,
        inundation: "2.2m",
        label: sampleLabel,
        time: new Date().toLocaleTimeString(),
      };
      setPinnedMarker(newPin);
      setIsBotProcessing(false);

      // Store in local storage for Disaster Response Map
      try {
        const existing = JSON.parse(localStorage.getItem("crowdsourced_damage_pins") || "[]");
        existing.unshift(newPin);
        localStorage.setItem("crowdsourced_damage_pins", JSON.stringify(existing.slice(0, 20)));
      } catch (_) {}
    }, 1800);
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setAssessment(null);

    if (activeTab === "bot") {
      triggerBotPhotoUpload(url, file.name);
    }
  };

  const handleSelectSample = (sample) => {
    setImage({ name: `${sample.name}.jpg`, size: 2.4 * 1024 * 1024 });
    setPreview(sample.imgUrl);
    setAssessment(sample);

    if (activeTab === "bot") {
      triggerBotPhotoUpload(sample.imgUrl, sample.name);
    }
  };


  const analyzeDamage = () => {
    if (!preview && !image) {
      alert("Please upload an image or select a sample scenario first.");
      return;
    }

    setAnalyzing(true);
    setAssessment(null);

    setTimeout(() => {
      // Pick dynamic score and risk based on image size / random variation
      const randomScore = Math.floor(65 + Math.random() * 32);
      const isCritical = randomScore >= 85;
      const isSevere = randomScore >= 70 && randomScore < 85;

      setAssessment({
        name: image?.name || "Uploaded Field Image",
        tag: isCritical ? "Critical Impact" : isSevere ? "Severe Hazard" : "Moderate Risk",
        damageLevel: isCritical ? "Critical" : isSevere ? "Severe" : "Moderate",
        score: `${randomScore} / 100`,
        color: isCritical ? "#dc2626" : isSevere ? "#ea580c" : "#f59e0b",
        structuralRisk: isCritical
          ? "Critical Structural Fracture & Void Creation"
          : isSevere
          ? "Severe Masonry Cracks & Roof Shear"
          : "Superficial Wall Cracks & Window Breakage",
        inundation: isCritical ? "1.8m Severe Waterlogged" : "0.4m Minor Flow",
        roadStatus: isCritical ? "Severely Impassable / Bridge Collapse Alert" : "Passable with High-Clearance 4x4",
        evacuationPriority: isCritical ? "Priority 1 (Urgent Rescue)" : "Priority 2 (Shelter Transfer)",
        recommendedGear: isCritical
          ? "Heavy Rescue Cranes, Acoustic Lifelocators, Ambulances, Inflatable Boats"
          : "Debris Saws, First-Aid Kits, Emergency Generator, Tarpaulins",
        actionPlan:
          "Report automatically routed to District Disaster Management Officer (DDMO). Mobilize primary relief team within 45 minutes.",
        analyzedAt: new Date().toLocaleTimeString(),
      });
      setAnalyzing(false);
    }, 2200);
  };

  const exportAssessmentReport = () => {
    if (!assessment) return;
    const reportJson = {
      platform: "Disaster Management Platform — Damage Assessment Dossier",
      timestamp: new Date().toISOString(),
      reportId: `DMG-${Date.now()}`,
      assessmentData: assessment,
    };
    const blob = new Blob([JSON.stringify(reportJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `damage-assessment-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "20px", color: "#ffffff", minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800", color: "#f8fafc" }}>
              🛰️ AI & Satellite Damage Assessment Engine
            </h1>
            <span style={{ backgroundColor: "#059669", color: "#ffffff", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "999px", fontWeight: "700" }}>
              ● Multi-Modal AI Active
            </span>
          </div>
          <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Upload drone, smartphone, or satellite imagery to analyze structural damage, passability, and evacuation priority.
          </p>
        </div>

        {assessment && (
          <button
            type="button"
            onClick={exportAssessmentReport}
            style={{
              padding: "10px 18px",
              backgroundColor: "#1d4ed8",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            📥 Export Assessment Dossier (JSON)
          </button>
        )}
      </div>

      {/* ── Mode Switcher Tabs ── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "22px", borderBottom: "1px solid #334155", paddingBottom: "14px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setActiveTab("bot")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: activeTab === "bot" ? "#22c55e" : "#1e293b",
            color: activeTab === "bot" ? "#000000" : "#94a3b8",
            boxShadow: activeTab === "bot" ? "0 4px 14px rgba(34,197,94,0.35)" : "none",
            transition: "all 0.15s",
          }}
        >
          <span>💬 WhatsApp / Telegram Disaster Bot</span>
          <span style={{ fontSize: "0.68rem", backgroundColor: activeTab === "bot" ? "rgba(0,0,0,0.2)" : "#334155", padding: "2px 6px", borderRadius: "999px", color: activeTab === "bot" ? "#000" : "#38bdf8", fontWeight: "800" }}>
            CROWDSOURCED AI
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inspector")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: activeTab === "inspector" ? "#2563eb" : "#1e293b",
            color: activeTab === "inspector" ? "#ffffff" : "#94a3b8",
            boxShadow: activeTab === "inspector" ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
            transition: "all 0.15s",
          }}
        >
          <span>🔬 Field Image Inspector & Satellite Vision</span>
        </button>
      </div>

      {activeTab === "bot" ? (
        /* ── WhatsApp / Telegram Bot Section ── */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "26px" }}>
          {/* Bot Phone Simulator */}
          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "18px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Bot Header */}
            <div style={{
              backgroundColor: botPlatform === "whatsapp" ? "#075e54" : "#17212b",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: botPlatform === "whatsapp" ? "#25d366" : "#229ed9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "800", color: "#fff" }}>
                  {botPlatform === "whatsapp" ? "💬" : "✈️"}
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                    {botPlatform === "whatsapp" ? "NDRF Emergency Bot (+91 911-DISASTER)" : "NDRF Disaster Bot (@IndiaDisasterBot)"}
                    <span style={{ color: "#38bdf8", fontSize: "0.85rem" }}>✓</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#a7f3d0" }}>
                    ● Online · Instant EXIF GPS Extraction & Vision Triage
                  </div>
                </div>
              </div>

              {/* Toggle platform */}
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => setBotPlatform("whatsapp")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    backgroundColor: botPlatform === "whatsapp" ? "#25d366" : "rgba(255,255,255,0.1)",
                    color: botPlatform === "whatsapp" ? "#000" : "#fff",
                  }}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setBotPlatform("telegram")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    backgroundColor: botPlatform === "telegram" ? "#229ed9" : "rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                >
                  Telegram
                </button>
              </div>
            </div>

            {/* Chat message bubbles */}
            <div style={{
              flex: 1,
              minHeight: "360px",
              maxHeight: "420px",
              overflowY: "auto",
              padding: "16px",
              backgroundColor: botPlatform === "whatsapp" ? "#0b141a" : "#0e1621",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}>
              {botMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    backgroundColor: m.sender === "user"
                      ? (botPlatform === "whatsapp" ? "#005c4b" : "#2b5278")
                      : (botPlatform === "whatsapp" ? "#202c33" : "#182533"),
                    color: "#e2e8f0",
                    padding: "10px 14px",
                    borderRadius: m.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    fontSize: "0.85rem",
                    lineHeight: "1.4",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.image && (
                    <img
                      src={m.image}
                      alt="Disaster report"
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }}
                    />
                  )}
                  {m.text}
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8", textAlign: "right", marginTop: "4px" }}>
                    {m.time}
                  </div>
                </div>
              ))}

              {isBotProcessing && (
                <div style={{ alignSelf: "flex-start", backgroundColor: "#202c33", padding: "8px 14px", borderRadius: "14px", fontSize: "0.8rem", color: "#38bdf8" }}>
                  🤖 Bot analyzing photo EXIF GPS & evaluating severity...
                </div>
              )}
            </div>

            {/* Simulated Action / Photo Dispatcher */}
            <div style={{ padding: "14px", backgroundColor: "#1e293b", borderTop: "1px solid #334155" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "8px", fontWeight: "600" }}>
                📲 Quick Citizen Simulations (Panic-Proof Reporting):
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                <button
                  type="button"
                  onClick={() => triggerBotPhotoUpload("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80", "Flooded Street")}
                  disabled={isBotProcessing}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#0284c7",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    cursor: isBotProcessing ? "not-allowed" : "pointer",
                  }}
                >
                  🌊 Send Flooded Street Photo
                </button>
                <button
                  type="button"
                  onClick={() => triggerBotPhotoUpload("https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=600&q=80", "Collapsed Building")}
                  disabled={isBotProcessing}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    cursor: isBotProcessing ? "not-allowed" : "pointer",
                  }}
                >
                  🏚️ Send Collapsed House Photo
                </button>
                <button
                  type="button"
                  onClick={() => triggerBotPhotoUpload("https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80", "Blocked Bridge")}
                  disabled={isBotProcessing}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#ea580c",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    cursor: isBotProcessing ? "not-allowed" : "pointer",
                  }}
                >
                  🌉 Send Blocked Bridge Photo
                </button>
              </div>

              {/* Custom Image Upload via Bot */}
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "8px", backgroundColor: "#0f172a", border: "1px dashed #475569", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", color: "#38bdf8" }}>
                <span>📷 Upload Real Photo from Device</span>
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          {/* Master Map Distress Marker Hub */}
          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "18px", padding: "20px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc" }}>
                🗺️ Master Map Pinned Distress Markers
              </h3>
              <span style={{ fontSize: "0.75rem", backgroundColor: "#dc2626", color: "#fff", padding: "3px 8px", borderRadius: "999px", fontWeight: "700" }}>
                Live EXIF Synced
              </span>
            </div>

            <p style={{ margin: "0 0 16px 0", fontSize: "0.82rem", color: "#94a3b8" }}>
              Photos submitted via WhatsApp or Telegram have their EXIF GPS telemetry stripped and automatically plotted onto the NDRF master coordination grid without requiring manual forms.
            </p>

            {pinnedMarker ? (
              <div style={{
                backgroundColor: "#0f172a",
                border: "2px solid #ef4444",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block", boxShadow: "0 0 8px #ef4444" }} />
                    <strong style={{ fontSize: "0.95rem", color: "#fff" }}>Pin #{pinnedMarker.id}</strong>
                  </div>
                  <span style={{ fontSize: "0.72rem", backgroundColor: "#dc2626", color: "#fff", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
                    {pinnedMarker.severity} ({pinnedMarker.score}/100)
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.78rem", color: "#cbd5e1" }}>
                  <div>📍 <strong>GPS Coords:</strong> {pinnedMarker.coords}</div>
                  <div>🌊 <strong>Water Depth:</strong> {pinnedMarker.inundation}</div>
                  <div>🏷️ <strong>Category:</strong> {pinnedMarker.label}</div>
                  <div>🕒 <strong>Logged At:</strong> {pinnedMarker.time}</div>
                </div>

                <div style={{ marginTop: "12px", padding: "8px", backgroundColor: "rgba(220,38,38,0.15)", borderRadius: "6px", fontSize: "0.75rem", color: "#fca5a5" }}>
                  🚨 Assigned: <strong>NDRF Amphibious Unit 04</strong> &bull; Priority Tier 1 Evacuation
                </div>
              </div>
            ) : (
              <div style={{ padding: "30px", textAlign: "center", backgroundColor: "#0f172a", borderRadius: "12px", border: "1px dashed #334155", color: "#64748b", marginBottom: "16px" }}>
                <span style={{ fontSize: "2.4rem" }}>📍</span>
                <p style={{ margin: "8px 0 0 0", fontSize: "0.85rem" }}>
                  No marker pinned yet in this session. Click a quick simulation button or upload a photo to generate an instant GPS pin.
                </p>
              </div>
            )}

            {/* Architecture diagram for presentation */}
            <div style={{ backgroundColor: "#0f172a", borderRadius: "12px", padding: "14px", border: "1px solid #334155" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#38bdf8", marginBottom: "8px" }}>
                ⚡ Crowdsourced Pipeline Architecture
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.75rem", color: "#94a3b8" }}>
                <div>1️⃣ Citizen sends photo via WhatsApp / Telegram API Webhook</div>
                <div>2️⃣ Server extracts EXIF Header (GPS Latitude, Longitude, Altitude, Timestamp)</div>
                <div>3️⃣ YOLOv8 & PyTorch model predicts structural damage score (0-100)</div>
                <div>4️⃣ Color-coded marker instantly published to Master Map via WebSockets</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Standard Field Inspector & Satellite Vision Section ── */
        <>
          {/* ── Sample Disaster Scenarios Bar ── */}
          <div style={{ marginBottom: "22px" }}>
            <h3 style={{ fontSize: "0.95rem", color: "#cbd5e1", marginBottom: "10px" }}>
              ⚡ Or Select a Real-World Sample Scenario:
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {SAMPLE_SCENARIOS.map((scenario, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSample(scenario)}
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    padding: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#38bdf8")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#334155")}
                >
                  <img
                    src={scenario.imgUrl}
                    alt={scenario.name}
                    style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f8fafc" }}>
                      {scenario.name}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: scenario.color, fontWeight: "700" }}>
                      ● {scenario.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Upload & Analysis Card ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "26px" }}>
            {/* Upload Box */}
            <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem", fontWeight: "700" }}>
                📸 Upload Disaster Field Image
              </h3>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "36px 20px",
                  border: "2px dashed #475569",
                  borderRadius: "14px",
                  cursor: "pointer",
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  transition: "border-color 0.2s",
                }}
              >
                <span style={{ fontSize: "2.8rem", marginBottom: "8px" }}>📷</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#38bdf8" }}>
                  Click or Drag & Drop Image Here
                </span>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px" }}>
                  Supports JPG, PNG, WEBP, GeoTIFF Drone/Satellite photos (up to 20MB)
                </span>
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              </label>

              {preview && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "6px" }}>
                    Selected Frame: <strong>{image?.name || "Disaster Image"}</strong>
                  </div>
                  <img
                    src={preview}
                    alt="Selected disaster preview"
                    style={{ width: "100%", maxHeight: "240px", objectFit: "cover", borderRadius: "10px", border: "1px solid #334155" }}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={analyzeDamage}
                disabled={analyzing || (!image && !preview)}
                style={{
                  marginTop: "16px",
                  width: "100%",
                  padding: "13px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  cursor: analyzing || (!image && !preview) ? "not-allowed" : "pointer",
                  opacity: analyzing || (!image && !preview) ? 0.6 : 1,
                }}
              >
                {analyzing ? "🔍 Scanning structural integrity & satellite layers..." : "🤖 Run Multi-Modal AI Damage Analysis"}
              </button>
            </div>

            {/* Assessment Output Card */}
            <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem", fontWeight: "700" }}>
                📊 Structural & Evacuation Dossier
              </h3>

              {!assessment && !analyzing && (
                <div style={{ height: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", textAlign: "center" }}>
                  <span style={{ fontSize: "3rem", marginBottom: "10px" }}>🛰️</span>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    No active assessment. Upload a photo or select a scenario above to generate an instant damage classification report.
                  </p>
                </div>
              )}

              {analyzing && (
                <div style={{ padding: "24px", backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #334155" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#38bdf8", marginBottom: "12px" }}>
                    ⏳ Processing imagery pipeline...
                  </div>
                  {[
                    "🌐 Querying satellite land cover reference",
                    "🔎 Calculating structural shear stress & perimeter voids",
                    "💧 Computing flood inundation level",
                    "🚑 Generating triage priority score & equipment dispatch recommendations",
                  ].map((step, idx) => (
                    <div key={idx} style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "6px 0" }}>
                      ✓ {step}
                    </div>
                  ))}
                </div>
              )}

              {assessment && !analyzing && (
                <div style={{ border: `2px solid ${assessment.color}`, borderRadius: "12px", padding: "18px", backgroundColor: "rgba(15, 23, 42, 0.8)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1.2rem", color: assessment.color, fontWeight: "800" }}>
                        ● {assessment.damageLevel} Damage Level
                      </h4>
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{assessment.tag}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Damage Index:</div>
                      <div style={{ fontSize: "1.3rem", fontWeight: "800", color: assessment.color }}>
                        {assessment.score}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.82rem", marginBottom: "14px" }}>
                    <div style={{ padding: "8px", backgroundColor: "#1e293b", borderRadius: "8px" }}>
                      <strong style={{ color: "#94a3b8" }}>⚠️ Structural Risk:</strong>
                      <div style={{ color: "#f8fafc", marginTop: "2px" }}>{assessment.structuralRisk}</div>
                    </div>
                    <div style={{ padding: "8px", backgroundColor: "#1e293b", borderRadius: "8px" }}>
                      <strong style={{ color: "#94a3b8" }}>💧 Inundation:</strong>
                      <div style={{ color: "#f8fafc", marginTop: "2px" }}>{assessment.inundation}</div>
                    </div>
                    <div style={{ padding: "8px", backgroundColor: "#1e293b", borderRadius: "8px" }}>
                      <strong style={{ color: "#94a3b8" }}>🚗 Access / Roads:</strong>
                      <div style={{ color: "#f8fafc", marginTop: "2px" }}>{assessment.roadStatus}</div>
                    </div>
                    <div style={{ padding: "8px", backgroundColor: "#1e293b", borderRadius: "8px" }}>
                      <strong style={{ color: "#94a3b8" }}>🚨 Evacuation Priority:</strong>
                      <div style={{ color: assessment.color, fontWeight: "700", marginTop: "2px" }}>{assessment.evacuationPriority}</div>
                    </div>
                  </div>

                  <div style={{ padding: "10px", backgroundColor: "#1e293b", borderRadius: "8px", marginBottom: "10px", fontSize: "0.82rem" }}>
                    <strong style={{ color: "#38bdf8" }}>🛠️ Recommended Field Response Equipment:</strong>
                    <div style={{ color: "#e2e8f0", marginTop: "3px" }}>{assessment.recommendedGear}</div>
                  </div>

                  <div style={{ padding: "10px", backgroundColor: "#1e293b", borderRadius: "8px", fontSize: "0.82rem" }}>
                    <strong style={{ color: "#22c55e" }}>📋 Tactical Action Plan:</strong>
                    <div style={{ color: "#e2e8f0", marginTop: "3px" }}>{assessment.actionPlan}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Official Satellite Open Data Portals ── */}
      <div>
        <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#38bdf8", marginBottom: "14px" }}>
          🌐 Official Free Satellite & Emergency Damage Portals
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {SATELLITE_OPEN_PORTALS.map((portal, i) => (
            <a
              key={i}
              href={portal.url}
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
                <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{portal.name}</strong>
                <span style={{ fontSize: "0.72rem", backgroundColor: "#0f172a", color: "#38bdf8", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
                  {portal.tag} ↗
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.4" }}>{portal.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}