import React from "react";
import { useLocation } from "react-router-dom";

const features = {
  "/alerts": {
    icon: "🚨",
    title: "Disaster Alerts",
    description: "Real-time emergency warnings and disaster alerts.",
  },

  "/map": {
    icon: "🗺️",
    title: "Disaster Response Map",
    description: "Monitor disaster locations, weather hazards, and emergency areas.",
  },

  "/emergency-sos": {
    icon: "🆘",
    title: "Emergency SOS",
    description: "Emergency assistance and SOS response.",
  },

  "/rescue-centers": {
    icon: "📍",
    title: "Rescue Centers",
    description: "Find nearby rescue and emergency centers.",
  },

  "/shelter-finder": {
    icon: "📍",
    title: "Shelter Finder",
    description: "Find safe shelters during emergencies.",
  },

  "/family-safety": {
    icon: "👥",
    title: "Family Safety",
    description: "Manage family emergency safety information.",
  },

  "/evacuation-planner": {
    icon: "⏱️",
    title: "Evacuation Planner",
    description: "Plan safer evacuation routes.",
  },

  "/qr-rescue-id": {
    icon: "🪪",
    title: "QR Rescue ID",
    description: "Manage your emergency QR Rescue ID.",
  },

  "/notifications": {
    icon: "🔔",
    title: "Notifications",
    description: "View emergency notifications and updates.",
  },

  "/ai-assistant": {
    icon: "🤖",
    title: "AI Assistant",
    description: "AI-powered disaster management assistance.",
  },

  "/voice-assistant": {
    icon: "🎙️",
    title: "Voice Assistant",
    description: "Voice-based emergency assistance.",
  },

  "/damage-assessment": {
    icon: "🛠️",
    title: "Damage Assessment",
    description: "Assess disaster-related damage.",
  },

  "/analytics-reports": {
    icon: "📊",
    title: "Analytics & Reports",
    description: "View disaster analytics and reports.",
  },

  "/safety-guides": {
    icon: "🛡️",
    title: "Safety Guides",
    description: "Important disaster safety information.",
  },

  "/statistics": {
    icon: "📊",
    title: "Statistics",
    description: "View disaster statistics.",
  },

  "/incident-report": {
    icon: "📝",
    title: "Report Disaster",
    description: "Report a disaster or emergency incident.",
  },

  "/profile": {
    icon: "👤",
    title: "My Profile",
    description: "View and manage your profile.",
  },

  "/settings": {
    icon: "⚙️",
    title: "Settings",
    description: "Manage platform settings.",
  },

  "/logout": {
    icon: "🚪",
    title: "Logout",
    description: "Logout from the disaster management platform.",
  },
};

function FeaturePage() {
  const location = useLocation();

  const feature = features[location.pathname];

  if (!feature) {
    return null;
  }

  return (
    <div style={{ padding: "24px 32px", color: "#f8fafc" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{feature.icon}</div>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "2rem", fontWeight: "800", color: "#fff" }}>
          {feature.title}
        </h1>
        <p style={{ margin: 0, color: "#94a3b8" }}>{feature.description}</p>
      </div>

      {/* Main Card */}
      <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "28px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
          <span style={{ color: "#4ade80", fontWeight: "600" }}>System Ready</span>
        </div>

        <h2 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: "700", color: "#fff" }}>
          {feature.title}
        </h2>
        <p style={{ margin: "0 0 24px 0", color: "#94a3b8", lineHeight: "1.7" }}>
          This module is active and ready for integration with the Disaster Management Platform.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>

          <div style={{ backgroundColor: "#0f172a", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>🟢</div>
            <h3 style={{ margin: "0 0 4px 0", fontWeight: "700", color: "#fff" }}>Status</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>Active</p>
          </div>

          <div style={{ backgroundColor: "#0f172a", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>⚡</div>
            <h3 style={{ margin: "0 0 4px 0", fontWeight: "700", color: "#fff" }}>Response</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>Ready</p>
          </div>

          <div style={{ backgroundColor: "#0f172a", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>🔐</div>
            <h3 style={{ margin: "0 0 4px 0", fontWeight: "700", color: "#fff" }}>Security</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>Protected</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FeaturePage;