import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

const FAQ_DATA = [
  {
    category: "Emergency & SOS",
    icon: "🚨",
    items: [
      {
        q: "How does Emergency SOS work and who receives my distress signal?",
        a: "When you activate Emergency SOS, your precise GPS coordinates, battery status, and timestamp are instantly broadcast over high-priority WebSockets and SMS to registered disaster response centers, emergency teams, and your designated family contacts. It also sounds an audible emergency siren on your device to guide nearby rescue personnel.",
        action: { label: "Open Emergency SOS", path: "/emergency-sos" },
      },
      {
        q: "Can I trigger Emergency SOS without internet access?",
        a: "Yes! Our platform functions as an Offline Progressive Web App (PWA). If your internet disconnects, the SOS module automatically prepares an encrypted direct SMS alert and SMS emergency payload to official helpline numbers (112 / NDRF) using your device's cellular network.",
      },
      {
        q: "What should I do immediately after sending an SOS?",
        a: "Stay at your highest, safest accessible ground. Keep your mobile device powered on, conserve battery by lowering screen brightness, and look out for official rescue drones or responder signals. Do not attempt to cross moving floodwaters.",
      },
    ],
  },
  {
    category: "Disaster Response Map & Evacuation",
    icon: "🗺️",
    items: [
      {
        q: "How do I find real-time safe zones and evacuation routes?",
        a: "Open the Disaster Response Map to view live interactive hazard zones, flood levels, active landslide alerts, and safe evacuation corridors. Turn by turn directions guide you away from flooded or blocked highways toward the nearest verified safe shelter.",
        action: { label: "View Disaster Map", path: "/map" },
      },
      {
        q: "How are shelters and medical rescue centers verified?",
        a: "All shelter locations, bed capacities, clean water availability, and medical facilities are synchronized in real-time with District Disaster Management Authorities (DDMA), NDRF, and Indian Red Cross databases.",
        action: { label: "Find Safe Shelters", path: "/shelter-finder" },
      },
    ],
  },
  {
    category: "Live Alerts & Government Advisories",
    icon: "⚠️",
    items: [
      {
        q: "Where do the disaster alerts and notifications come from?",
        a: "Our platform integrates directly with official government bureaus including NDMA SACHET, India Meteorological Department (IMD Mausam), Central Water Commission (CWC Flood Forecast), and GDACS. All notifications are genuine, certified government bulletins.",
        action: { label: "Check Disaster Alerts", path: "/alerts" },
      },
      {
        q: "How can I enable live push notifications on my phone or computer?",
        a: "When prompted by your browser, tap 'Allow Notifications'. You can also toggle Emergency Notifications from the Settings page to receive desktop or lockscreen audio sirens whenever a severe warning is broadcast for your region.",
        action: { label: "Manage Notification Settings", path: "/settings" },
      },
    ],
  },
  {
    category: "AI & Voice Assistant",
    icon: "🤖",
    items: [
      {
        q: "What questions can I ask the AI Chatbot and Voice Assistant?",
        a: "You can ask any general questions (science, facts, identity, greetings) as well as emergency protocols (first-aid procedures for burns/fractures, flood survival tips, earthquake drills, landslide warnings, nearest hospitals).",
        action: { label: "Chat with AI Assistant", path: "/ai-assistant" },
      },
      {
        q: "Can I talk to the AI in regional Indian languages?",
        a: "Yes! Our AI Chatbot and Voice Assistant automatically detect your input language (Hindi, Odia, Bengali, Assamese, etc.), translate it to understand the request, and respond back in your chosen language.",
        action: { label: "Try Voice Assistant", path: "/voice-assistant" },
      },
    ],
  },
  {
    category: "Family Safety & Rescue ID",
    icon: "🛡️",
    items: [
      {
        q: "What is QR Rescue ID and how does it help in an emergency?",
        a: "QR Rescue ID generates a digital, scan-ready emergency medical card with your blood group, allergies, pre-existing conditions, emergency contacts, and safe-status check. First responders can scan this instantly even if you are unconscious.",
        action: { label: "Get Your QR Rescue ID", path: "/qr-rescue-id" },
      },
      {
        q: "How does the Family Safety Network notify my loved ones?",
        a: "You can add family members to your safety circle. When an alert affects your area, you can tap 'I Am Safe' to notify everyone simultaneously without having to make multiple phone calls over congested cellular towers.",
        action: { label: "Family Safety Hub", path: "/family-safety" },
      },
    ],
  },
];

export default function FAQ() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState("0-0");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Filtered FAQ Items
  const filteredData = useMemo(() => {
    return FAQ_DATA.map((cat) => {
      const filteredItems = cat.items.filter((item) => {
        const matchesCat = activeCategory === "All" || cat.category === activeCategory;
        const matchesSearch =
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      });
      return { ...cat, items: filteredItems };
    }).filter((cat) => cat.items.length > 0);
  }, [searchQuery, activeCategory]);

  const toggleAccordion = (id) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  // Instant AI Quick Answer
  const handleAskInstantAi = (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiAnswer(null);

    setTimeout(() => {
      const q = aiQuestion.toLowerCase();
      let answer = "";

      if (q.includes("sos") || q.includes("emergency") || q.includes("help") || q.includes("save")) {
        answer = "To trigger Emergency SOS, click the red Emergency SOS menu in the sidebar or press the SOS button. Your GPS coordinates and battery level will be transmitted immediately to authorities and emergency services.";
      } else if (q.includes("map") || q.includes("route") || q.includes("evacuat")) {
        answer = "Open the Disaster Response Map to see real-time flood inundation, active landslide hazards, road closures, and verified safe routes away from high-risk zones.";
      } else if (q.includes("shelter") || q.includes("camp") || q.includes("relief")) {
        answer = "Visit Shelter Finder to locate cyclone shelters, government relief centers, and medical relief stations near your current location with live bed and supply counts.";
      } else if (q.includes("offline") || q.includes("internet") || q.includes("network")) {
        answer = "This platform is a fully offline-capable Progressive Web App (PWA). Safety guides, your QR Rescue ID, and emergency SMS alerts remain functional even when cell towers or internet connections are down.";
      } else if (q.includes("alert") || q.includes("cyclone") || q.includes("weather")) {
        answer = "Check Disaster Alerts and the Climate Chronicle page for live certified bulletins from IMD Mausam, NDMA SACHET, and Central Water Commission.";
      } else {
        answer = `Regarding "${aiQuestion}": Our platform provides real-time disaster monitoring, emergency assistance, and official safety protocols. You can find safe routes on the map, access first aid guides, or speak directly to the AI Chatbot anytime.`;
      }

      setAiAnswer(answer);
      setAiLoading(false);
    }, 450);
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* ── HERO BANNER: Inspired by User Photo ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #1e293b 50%, #0f172a 100%)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          borderRadius: "18px",
          padding: "28px 32px",
          marginBottom: "32px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <span style={{ fontSize: "2rem" }}>💡</span>
          <span
            style={{
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              color: "#c084fc",
              fontWeight: "800",
              fontSize: "0.75rem",
              padding: "4px 12px",
              borderRadius: "20px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            KNOWLEDGE BASE &amp; INSTANT HELP
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              fontSize: "0.75rem",
              fontWeight: "700",
              padding: "4px 10px",
              borderRadius: "20px",
            }}
          >
            <span>✨</span>
            <span>Intelligent Quick Answers</span>
          </span>
        </div>

        {/* Highlighted Quote from user prompt photo */}
        <h1 style={{ fontSize: "1.7rem", fontWeight: "800", color: "#ffffff", lineHeight: "1.35", margin: "0 0 12px" }}>
          Frequently Asked Questions (FAQ)
        </h1>
        <div
          style={{
            fontSize: "1.05rem",
            color: "#f1f5f9",
            lineHeight: "1.6",
            maxWidth: "920px",
            backgroundColor: "rgba(30, 58, 138, 0.4)",
            borderLeft: "4px solid #38bdf8",
            padding: "12px 18px",
            borderRadius: "8px",
          }}
        >
          An FAQ works by <strong>listing common questions and clear answers in one place</strong> so users can find information quickly <strong>without contacting support</strong>.
        </div>
      </div>

      {/* ── INSTANT SEARCH & AI QUESTION BAR ── */}
      <div
        style={{
          backgroundColor: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "28px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
        }}
      >
        <form onSubmit={handleAskInstantAi} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "280px", position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "13px", fontSize: "1.1rem" }}>🔍</span>
            <input
              type="text"
              value={searchQuery || aiQuestion}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setAiQuestion(e.target.value);
              }}
              placeholder="Search common questions or type your query (e.g., How to trigger SOS? Where are shelters?)..."
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                backgroundColor: "#1e293b",
                border: "1.5px solid #334155",
                borderRadius: "10px",
                color: "#f8fafc",
                fontSize: "0.92rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "10px",
              fontSize: "0.9rem",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
            }}
          >
            <span>✨</span>
            <span>{aiLoading ? "Searching…" : "Instant AI Answer"}</span>
          </button>
        </form>

        {/* AI Answer Box */}
        {aiAnswer && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "rgba(124, 58, 237, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              color: "#f1f5f9",
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#c084fc", fontWeight: "700", fontSize: "0.85rem" }}>
              <span>✨ Intelligent Assistant Answer:</span>
            </div>
            <div style={{ fontSize: "0.92rem", lineHeight: "1.5" }}>{aiAnswer}</div>
          </div>
        )}
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {["All", "Emergency & SOS", "Disaster Response Map & Evacuation", "Live Alerts & Government Advisories", "AI & Voice Assistant", "Family Safety & Rescue ID"].map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                backgroundColor: isActive ? "#2563eb" : "#1e293b",
                color: isActive ? "#ffffff" : "#94a3b8",
                border: `1px solid ${isActive ? "#3b82f6" : "#334155"}`,
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "0.82rem",
                fontWeight: isActive ? "700" : "500",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── FAQ ACCORDION GROUPS ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {filteredData.map((catGroup, cIdx) => (
          <div
            key={catGroup.category}
            style={{
              backgroundColor: "#0b1329",
              border: "1px solid #1e293b",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "1.4rem" }}>{catGroup.icon}</span>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                {catGroup.category}
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {catGroup.items.map((item, iIdx) => {
                const id = `${cIdx}-${iIdx}`;
                const isOpen = openIndex === id;

                return (
                  <div
                    key={item.q}
                    style={{
                      border: `1px solid ${isOpen ? "#3b82f6" : "#1e293b"}`,
                      borderRadius: "10px",
                      backgroundColor: isOpen ? "#0f172a" : "#131e3a",
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <button
                      onClick={() => toggleAccordion(id)}
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "transparent",
                        border: "none",
                        color: "#f8fafc",
                        fontSize: "0.95rem",
                        fontWeight: "700",
                        textAlign: "left",
                        cursor: "pointer",
                        gap: "12px",
                      }}
                    >
                      <span>{item.q}</span>
                      <span style={{ fontSize: "1.1rem", color: "#38bdf8", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                        ▼
                      </span>
                    </button>

                    {isOpen && (
                      <div style={{ padding: "0 18px 16px 18px", borderTop: "1px solid #1e293b", color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6" }}>
                        <p style={{ margin: "12px 0" }}>{item.a}</p>
                        {item.action && (
                          <div style={{ marginTop: "12px" }}>
                            <Link
                              to={item.action.path}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                fontWeight: "700",
                                textDecoration: "none",
                              }}
                            >
                              <span>{item.action.label}</span>
                              <span>→</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
