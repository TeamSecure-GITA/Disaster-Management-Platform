import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearOfflineSession } from "../utils/offlineStorage";

const menuItems = [
  {
    name: "Dashboard",
    icon: "🏠",
    path: "/",
  },
  {
    name: "Disaster Alerts",
    icon: "🚨",
    path: "/alerts",
  },
  {
    name: "Climate Chronicle",
    icon: "📰",
    path: "/climate-chronicle",
  },
  {
    name: "Live Map",
    icon: "🗺️",
    path: "/map",
  },
  {
    name: "Emergency SOS",
    icon: "🆘",
    path: "/emergency-sos",
  },
  {
    name: "Rescue Centers",
    icon: "📍",
    path: "/rescue-centers",
  },
  {
    name: "Shelter Finder",
    icon: "📍",
    path: "/shelter-finder",
  },
  {
    name: "Family Safety",
    icon: "👥",
    path: "/family-safety",
  },
  {
    name: "Evacuation Planner",
    icon: "⏱️",
    path: "/evacuation-planner",
  },
  {
    name: "QR Rescue ID",
    icon: "🪪",
    path: "/qr-rescue-id",
  },
  {
    name: "Notifications",
    icon: "🔔",
    path: "/notifications",
  },
  {
    name: "AI Assistant",
    icon: "🤖",
    path: "/ai-assistant",
  },
  {
    name: "Voice Assistant",
    icon: "🎙️",
    path: "/voice-assistant",
  },
  {
    name: "Damage Assessment",
    icon: "🛠️",
    path: "/damage-assessment",
  },
  {
    name: "Analytics & Reports",
    icon: "📊",
    path: "/analytics-reports",
  },
  {
    name: "Safety Guides",
    icon: "🛡️",
    path: "/safety-guides",
  },
  {
    name: "Statistics",
    icon: "📊",
    path: "/statistics",
  },
  {
    name: "Report Disaster",
    icon: "📝",
    path: "/incident-report",
  },
  {
    name: "My Profile",
    icon: "👤",
    path: "/profile",
  },
  {
    name: "Settings",
    icon: "⚙️",
    path: "/settings",
  },
  {
    name: "Login / Switch Account",
    icon: "🔐",
    path: "/login",
  },
];

function Sidebar({ onNavigate }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clearOfflineSession();
    navigate("/login");
  };

  return (
    <aside style={{
      width: "260px",
      minWidth: "260px",
      height: "100vh",
      backgroundColor: "#0f172a",
      borderRight: "1px solid #334155",
      padding: "20px 16px",
      display: "flex",
      flexDirection: "column",
      overflowY: "auto"
    }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#38bdf8", marginBottom: "20px" }}>
        Disaster Platform
      </h2>
      <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.875rem",
              color: isActive ? "#ffffff" : "#94a3b8",
              backgroundColor: isActive ? "#2563eb" : "transparent",
            })}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            color: "#f87171",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
            marginTop: "6px",
            transition: "background 0.15s"
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;