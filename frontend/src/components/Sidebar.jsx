import React from "react";
import { NavLink } from "react-router-dom";
import { isAuthorizedAdmin, isHeadAdmin } from "../utils/adminAuth";

const menuItems = [
  {
    name: "Dashboard",
    icon: "🏠",
    path: "/",
  },
  {
    name: "NER Landslide Monitor",
    icon: "⛰️",
    path: "/ner-landslide-monitor",
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
    name: "Disaster Response Map",
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
];

function Sidebar({ onNavigate }) {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isHead, setIsHead] = React.useState(false);

  React.useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Read offline session
        const rawLocal = localStorage.getItem("user_session");
        const rawProfile = localStorage.getItem("user_profile_data_v2");
        let email = "";
        let role = "";

        if (rawLocal) {
          try {
            const parsed = JSON.parse(rawLocal);
            email = parsed?.email || "";
            role = parsed?.role || "";
          } catch {}
        }
        if (!email && rawProfile) {
          try {
            const parsed = JSON.parse(rawProfile);
            email = parsed?.email || "";
            role = parsed?.role || "";
          } catch {}
        }

        if (email) {
          const authorized = isAuthorizedAdmin(email) || role === "admin";
          setIsAdmin(authorized);
          setIsHead(isHeadAdmin(email));
        }
      } catch (e) {
        console.error("Sidebar auth check error:", e);
      }
    }
    checkAdminStatus();
  }, []);

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
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <img
          src="/logo.png"
          alt="Disaster Management Logo"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            objectFit: "contain",
            boxShadow: "0 0 14px rgba(56, 189, 248, 0.45)",
            border: "2px solid rgba(56, 189, 248, 0.6)",
            flexShrink: 0,
            background: "#0b1f3a",
          }}
        />
        <h2 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#38bdf8", margin: 0, letterSpacing: "-0.01em" }}>
          Disaster Platform
        </h2>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {/* ── ADMINISTRATOR MENU (Hidden from all standard users) ── */}
        {isAdmin && (
          <NavLink
            to="/administrator"
            onClick={onNavigate}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.875rem",
              color: isActive ? "#ffffff" : "#fde68a",
              backgroundColor: isActive ? "#4f46e5" : "rgba(245, 158, 11, 0.15)",
              border: `1.5px solid ${isActive ? "#6366f1" : "rgba(245, 158, 11, 0.4)"}`,
              fontWeight: "700",
              boxShadow: "0 2px 8px rgba(245, 158, 11, 0.2)",
              marginBottom: "8px"
            })}
          >
            <span style={{ fontSize: "1.1rem" }}>🛡️</span>
            <span>Administrator</span>
            <span style={{
              marginLeft: "auto",
              fontSize: "0.65rem",
              backgroundColor: isHead ? "#f59e0b" : "#6366f1",
              color: isHead ? "#0f172a" : "#ffffff",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "800"
            }}>
              {isHead ? "HEAD" : "ADMIN"}
            </span>
          </NavLink>
        )}

        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            onClick={onNavigate}
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
      </nav>
    </aside>
  );
}

export default Sidebar;