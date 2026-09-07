// ─────────────────────────────────────────────────────────────────────────────
// src/components/Sidebar.jsx
//
// Left navigation bar with real, colorful, distinct emergency SVG icons
// and full multi-language localization.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { NavLink } from "react-router-dom";
import logoImg from "../assets/logo.png";
import { isAuthorizedAdmin, isHeadAdmin } from "../utils/adminAuth";
import { useLanguage } from "../i18n/LanguageContext";
import {
  IconDashboard,
  IconLandslide,
  IconAlerts,
  IconClimate,
  IconMap,
  IconSos,
  IconRescue,
  IconShelter,
  IconFamily,
  IconEvacuation,
  IconQrId,
  IconNotifications,
  IconAi,
  IconVoice,
  IconDamage,
  IconAnalytics,
  IconSafety,
  IconStatistics,
  IconReport,
  IconAdmin,
} from "./NavigationIcons";

const menuItems = [
  { key: "nav_dashboard",          fallback: "Dashboard",              icon: IconDashboard,     path: "/" },
  { key: "nav_ner_landslide",      fallback: "NER Landslide Monitor",  icon: IconLandslide,     path: "/ner-landslide-monitor" },
  { key: "nav_alerts",             fallback: "Disaster Alerts",        icon: IconAlerts,        path: "/alerts" },
  { key: "nav_climate_chronicle",  fallback: "Climate Chronicle",      icon: IconClimate,       path: "/climate-chronicle" },
  { key: "nav_map",                fallback: "Disaster Response Map",  icon: IconMap,           path: "/map" },
  { key: "nav_sos",                fallback: "Emergency SOS",          icon: IconSos,           path: "/emergency-sos" },
  { key: "nav_rescue",             fallback: "Rescue Centers",         icon: IconRescue,        path: "/rescue-centers" },
  { key: "nav_shelter",            fallback: "Shelter Finder",         icon: IconShelter,       path: "/shelter-finder" },
  { key: "nav_family",             fallback: "Family Safety",          icon: IconFamily,        path: "/family-safety" },
  { key: "nav_evacuation",         fallback: "Evacuation Planner",     icon: IconEvacuation,    path: "/evacuation-planner" },
  { key: "nav_qr_id",              fallback: "QR Rescue ID",           icon: IconQrId,          path: "/qr-rescue-id" },
  { key: "nav_notifications",      fallback: "Notifications",          icon: IconNotifications, path: "/notifications" },
  { key: "nav_ai",                 fallback: "AI Assistant",           icon: IconAi,            path: "/ai-assistant" },
  { key: "nav_voice",              fallback: "Voice Assistant",        icon: IconVoice,         path: "/voice-assistant" },
  { key: "nav_damage",             fallback: "Damage Assessment",      icon: IconDamage,        path: "/damage-assessment" },
  { key: "nav_analytics",          fallback: "Analytics & Reports",    icon: IconAnalytics,     path: "/analytics-reports" },
  { key: "nav_safety",             fallback: "Safety Guides",          icon: IconSafety,        path: "/safety-guides" },
  { key: "nav_statistics",         fallback: "Statistics",             icon: IconStatistics,    path: "/statistics" },
  { key: "nav_incident",           fallback: "Report Disaster",        icon: IconReport,        path: "/incident-report" },
];

function Sidebar() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isHead, setIsHead]   = React.useState(false);

  /* ── Auth check ─────────────────────────────────────── */
  React.useEffect(() => {
    try {
      const rawUser    = localStorage.getItem("user");
      const rawSession = localStorage.getItem("user_session");
      const rawProfile = localStorage.getItem("user_profile_data_v2");
      let email = "", role = "";

      if (rawUser)    { try { const p = JSON.parse(rawUser);    email = p?.email || ""; role = p?.role || ""; } catch {} }
      if (!email && rawSession) { try { const p = JSON.parse(rawSession); email = p?.email || ""; role = p?.role || ""; } catch {} }
      if (!email && rawProfile) { try { const p = JSON.parse(rawProfile); email = p?.email || ""; role = p?.role || ""; } catch {} }

      if (email) {
        const authorized = isAuthorizedAdmin(email) || role === "admin";
        setIsAdmin(authorized);
        setIsHead(isHeadAdmin(email));
      }
    } catch (e) {
      console.error("Sidebar auth check error:", e);
    }
  }, []);

  return (
    <aside
      aria-label="Main Navigation"
      style={{
        width: "260px",
        minWidth: "260px",
        height: "100%",
        backgroundColor: "#0b1329",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── Sidebar Header ─────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "16px 18px",
        borderBottom: "1px solid #1e293b",
        background: "linear-gradient(135deg, #0f172a 0%, #0b1329 100%)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <img
          src={logoImg || "/logo.png"}
          alt="Disaster Management Logo"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/logo.png";
          }}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            objectFit: "contain",
            boxShadow: "0 0 12px rgba(56,189,248,0.5)",
            border: "2px solid rgba(56,189,248,0.5)",
            background: "#0b1f3a",
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "#38bdf8", lineHeight: "1.2", letterSpacing: "-0.01em" }}>
            {t.app_name_short || "Disaster Platform"}
          </div>
          <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: "600", letterSpacing: "0.03em" }}>
            Emergency Response System
          </div>
        </div>
      </div>

      {/* ── Navigation Links ─────────────────────── */}
      <div style={{ padding: "10px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>

        {/* Administrator menu — hidden from normal users */}
        {isAdmin && (
          <NavLink
            to="/administrator"
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 12px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "0.875rem",
              color: isActive ? "#ffffff" : "#fde68a",
              background: isActive
                ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                : "rgba(245,158,11,0.12)",
              border: `1.5px solid ${isActive ? "#6366f1" : "rgba(245,158,11,0.35)"}`,
              fontWeight: "700",
              boxShadow: isActive ? "0 4px 14px rgba(99,102,241,0.35)" : "0 2px 6px rgba(245,158,11,0.15)",
              marginBottom: "6px",
              transition: "all 0.15s",
            })}
          >
            <IconAdmin size={20} />
            <span style={{ flex: 1 }}>{t.nav_admin || "Administrator"}</span>
            <span style={{
              fontSize: "0.62rem",
              backgroundColor: isHead ? "#f59e0b" : "#6366f1",
              color: isHead ? "#0f172a" : "#ffffff",
              padding: "2px 7px",
              borderRadius: "5px",
              fontWeight: "800",
              letterSpacing: "0.03em",
            }}>
              {isHead ? "HEAD" : "ADMIN"}
            </span>
          </NavLink>
        )}

        {/* Divider label */}
        <div style={{
          fontSize: "0.65rem",
          fontWeight: "700",
          color: "#475569",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          padding: "6px 10px 4px",
        }}>
          {t.nav_header || "Navigation"}
        </div>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "9px 12px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.875rem",
              color: isActive ? "#ffffff" : "#cbd5e1",
              backgroundColor: isActive ? "#1d4ed8" : "transparent",
              fontWeight: isActive ? "700" : "500",
              boxShadow: isActive ? "0 3px 12px rgba(29,78,216,0.45)" : "none",
              transition: "all 0.13s",
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains("active"))
                e.currentTarget.style.backgroundColor = "rgba(30,41,59,0.8)";
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.classList.contains("active"))
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ width: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <item.icon size={20} />
            </span>
            <span style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {t[item.key] || item.fallback}
            </span>
          </NavLink>
        ))}
      </div>

      {/* ── Footer / Status ─────────────────────── */}
      <div style={{
        marginTop: "auto",
        padding: "14px 16px",
        borderTop: "1px solid #1e293b",
        fontSize: "0.72rem",
        color: "#475569",
        textAlign: "center",
      }}>
        Disaster Management Platform · NER Response
      </div>
    </aside>
  );
}

export default Sidebar;