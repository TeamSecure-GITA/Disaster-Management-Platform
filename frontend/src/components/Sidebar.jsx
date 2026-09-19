// ─────────────────────────────────────────────────────────────────────────────
// src/components/Sidebar.jsx
//
// Tactical Command & Emergency Navigation Bar
// Glassmorphic styling, categorized crisis sectors, active glow accents,
// and full multi-language localization.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { NavLink } from "react-router-dom";
import logoImg from "../assets/logo.png";
import { isAuthorizedAdmin, isHeadAdmin, isApprovedMember, getUnreadReviewCount } from "../utils/adminAuth";
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
  IconFaq,
  IconMesh,
  IconAR,
  IconDigitalTwin,
  IconVulnerability,
  IconSensory,
  IconSafeZone,
  IconDynRoute,
  IconMicroTask,
  IconAidLedger,
  IconReconstruct,
  IconZeroInternet,
  IconDrone,
  IconDelivery,
  IconNERSuite,
  IconWorldFirst,
  IconHyperSpeed,
  IconDecentralized,
  IconExtremeResilience,
} from "./NavigationIcons";

// ── 🏠 OVERVIEW ──────────────────────────────────────────────────────────────
const overviewItems = [
  { key: "nav_dashboard", fallback: "Dashboard",          icon: IconDashboard, path: "/", badge: "LIVE" },
  { key: "nav_map",       fallback: "Live Situation Map", icon: IconMap,       path: "/map" },
  { key: "nav_alerts",    fallback: "Disaster Alert",     icon: IconAlerts,    path: "/alerts", badge: "LIVE" },
];

// ── 🚨 RESPONSE ──────────────────────────────────────────────────────────────
const responseItems = [
  { key: "nav_sos",        fallback: "Emergency SOS",      icon: IconSos,        path: "/emergency-sos", badge: "SOS" },
  { key: "nav_rescue",     fallback: "Rescue Center",      icon: IconRescue,     path: "/rescue-centers" },
  { key: "nav_evacuation", fallback: "Evacuation Planner", icon: IconEvacuation, path: "/evacuation-planner" },
  { key: "nav_damage",     fallback: "Resources",          icon: IconDamage,     path: "/damage-assessment" },
  { key: "nav_relief",     fallback: "Responder Tracker",  icon: IconDelivery,   path: "/relief-tracker" },
];

// ── 🧠 INTELLIGENCE ───────────────────────────────────────────────────────────
const intelligenceItems = [
  { key: "nav_ai_voice",          fallback: "AI & Voice Assistant",   icon: IconAi,         path: "/ai-assistant", badge: "AI/VOICE" },
  { key: "nav_ner_landslide",     fallback: "NER Monitor",            icon: IconLandslide,  path: "/ner-landslide-monitor", badge: "AI" },
  { key: "nav_statistics",        fallback: "Risk Prediction",        icon: IconStatistics, path: "/statistics" },
  { key: "nav_climate_chronicle", fallback: "Disaster Intelligence",  icon: IconClimate,    path: "/climate-chronicle" },
  { key: "nav_analytics",         fallback: "Analytics",              icon: IconAnalytics,  path: "/analytics-reports" },
];

// ── 📡 CONNECTIVITY ──────────────────────────────────────────────────────────
const connectivityItems = [
  { key: "nav_smart_alerts",  fallback: "Smart Sensors",          icon: IconSensory,     path: "/smart-alerts",       badge: "IoT" },
  { key: "nav_mesh",          fallback: "LoRa Mesh",              icon: IconMesh,        path: "/mesh-console",       badge: "P2P" },
  { key: "nav_low_bandwidth", fallback: "Offline Emergency Mode", icon: IconSafeZone,    path: "/low-bandwidth",      badge: "2G" },
  { key: "nav_zero_net",      fallback: "Zero-Internet Mode",     icon: IconZeroInternet, path: "/zero-internet-mesh", badge: "OFF-GRID" },
];

// ── 🚁 FIELD ─────────────────────────────────────────────────────────────────
const fieldItems = [
  { key: "nav_drone",      fallback: "Drone Operations",   icon: IconDrone,     path: "/drone-analytics",  badge: "UAV" },
  { key: "nav_tasks",      fallback: "Volunteer Network",  icon: IconMicroTask, path: "/volunteer-tasks" },
  { key: "nav_incident",   fallback: "Field Reports",      icon: IconReport,    path: "/incident-report" },
];

// ── 👥 COMMUNITY ──────────────────────────────────────────────────────────────
const communityItems = [
  { key: "nav_family",    fallback: "Family Safety",   icon: IconFamily,  path: "/family-safety" },
  { key: "nav_report_dis", fallback: "Report Disaster", icon: IconAlerts,  path: "/incident-report" },
  { key: "nav_safety",    fallback: "Safety Guides",   icon: IconSafety,  path: "/safety-guides" },
];

// ── 🧪 INNOVATION LAB ─────────────────────────────────────────────────────────
const innovationItems = [
  { key: "nav_digital_twin",   fallback: "Digital Twin",                    icon: IconDigitalTwin,    path: "/digital-twin",            badge: "SIM" },
  { key: "nav_ner_topography", fallback: "Multi-Disaster Simulation",       icon: IconNERSuite,       path: "/ner-topography-suite",    badge: "NER" },
  { key: "nav_world_first",    fallback: "World-First Innovations",         icon: IconWorldFirst,     path: "/world-first-innovations", badge: "NOVEL" },
  { key: "nav_decentralized",  fallback: "Decentralized Resilience & SAR Radar", icon: IconDecentralized,  path: "/decentralized-resilience", badge: "SAR" },
  { key: "nav_extreme_res",    fallback: "Extreme Resilience & Grid-Free",  icon: IconExtremeResilience, path: "/extreme-resilience", badge: "GRID-FREE" },
];

// ── ⚙ SYSTEM ─────────────────────────────────────────────────────────────────
const systemItems = [
  { key: "nav_faq",           fallback: "Help & FAQ",    icon: IconFaq,           path: "/faq" },
  { key: "nav_settings",      fallback: "Settings",      icon: IconAdmin,         path: "/settings" },
];

export default function Sidebar({ isOpen = false, isDesktopMode = false, onClose }) {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isHead, setIsHead] = React.useState(false);
  const [isApproved, setIsApproved] = React.useState(false);
  const [unreadReviews, setUnreadReviews] = React.useState(getUnreadReviewCount());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [collapsedSectors, setCollapsedSectors] = React.useState({});

  const toggleSector = (sectorKey) => {
    setCollapsedSectors((prev) => ({ ...prev, [sectorKey]: !prev[sectorKey] }));
  };

  /* ── Auth clearance check ─────────────────────────────── */
  React.useEffect(() => {
    const checkClearance = () => {
      try {
        const rawUser = localStorage.getItem("user");
        const rawSession = localStorage.getItem("user_session");
        const rawProfile = localStorage.getItem("user_profile_data_v2");
        let email = "", role = "";

        if (rawUser) { try { const p = JSON.parse(rawUser); email = p?.email || ""; role = p?.role || ""; } catch {} }
        if (!email && rawSession) { try { const p = JSON.parse(rawSession); email = p?.email || ""; role = p?.role || ""; } catch {} }
        if (!email && rawProfile) { try { const p = JSON.parse(rawProfile); email = p?.email || ""; role = p?.role || ""; } catch {} }

        const authorized = (email && isAuthorizedAdmin(email)) || role === "admin";
        const approved = authorized || (email && isApprovedMember(email));

        setIsAdmin(authorized);
        setIsHead(email ? isHeadAdmin(email) : false);
        setIsApproved(approved);
        setUnreadReviews(getUnreadReviewCount());
      } catch (e) {
        console.error("Sidebar auth check error:", e);
      }
    };

    checkClearance();

    window.addEventListener("admin_auth_updated", checkClearance);
    window.addEventListener("platform_reviews_updated", checkClearance);
    window.addEventListener("storage", checkClearance);
    return () => {
      window.removeEventListener("admin_auth_updated", checkClearance);
      window.removeEventListener("platform_reviews_updated", checkClearance);
      window.removeEventListener("storage", checkClearance);
    };
  }, []);

  const handleNavClick = () => {
    if (!isDesktopMode && typeof onClose === "function") {
      onClose();
    }
  };

  const filterItems = (items) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        (item.fallback && item.fallback.toLowerCase().includes(q)) ||
        (t[item.key] && t[item.key].toLowerCase().includes(q)) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  };

  const renderNavGroup = (title, items, iconPrefix = "⚡", sectorId = "") => {
    const filtered = filterItems(items);
    if (searchQuery.trim() && filtered.length === 0) return null;
    const isCollapsed = !searchQuery.trim() && sectorId && collapsedSectors[sectorId];

    return (
      <div style={{ marginBottom: "14px" }}>
        <button
          type="button"
          onClick={() => sectorId && toggleSector(sectorId)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "transparent",
            border: "none",
            padding: "8px 12px 4px",
            fontSize: "0.65rem",
            fontWeight: "800",
            color: "rgba(148, 163, 184, 0.8)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: "var(--font-mono, monospace)",
            cursor: sectorId ? "pointer" : "default",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ opacity: 0.9 }}>{iconPrefix}</span>
            <span>{title}</span>
          </div>
          {sectorId && !searchQuery.trim() && (
            <span style={{ fontSize: "0.62rem", color: "#64748b" }}>
              {isCollapsed ? "＋" : "—"}
            </span>
          )}
        </button>

        {!isCollapsed && (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "2px" }}>
            {filtered.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={handleNavClick}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "0.84rem",
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? "#ffffff" : "#cbd5e1",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(14, 165, 233, 0.28) 0%, rgba(3, 105, 161, 0.35) 100%)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(56, 189, 248, 0.4)"
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? "0 4px 14px rgba(14, 165, 233, 0.25), inset 0 0 12px rgba(56, 189, 248, 0.15)"
                    : "none",
                  transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.55)";
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.color = "#f1f5f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.color = "#cbd5e1";
                  }
                }}
              >
                <span
                  style={{
                    width: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "transform 0.18s ease",
                  }}
                >
                  <item.icon size={19} />
                </span>

                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t[item.key] || item.fallback}
                </span>

                {item.badge && (
                  <span
                    style={{
                      fontSize: "0.58rem",
                      fontWeight: "800",
                      padding: "2px 6px",
                      borderRadius: "999px",
                      letterSpacing: "0.04em",
                      fontFamily: "var(--font-mono, monospace)",
                      ...(item.badge === "SOS"
                        ? { background: "rgba(244, 63, 94, 0.25)", color: "#fb7185", border: "1px solid rgba(244, 63, 94, 0.4)" }
                        : item.badge === "LIVE"
                        ? { background: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.4)" }
                        : item.badge === "AI" || item.badge === "GENAI"
                        ? { background: "rgba(168, 85, 247, 0.2)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.4)" }
                        : { background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }
                      ),
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      aria-label="Main Tactical Navigation"
      className={`app-sidebar-responsive ${isDesktopMode ? "desktop-docked" : (isOpen ? "drawer-open" : "")}`}
      style={{
        width: "272px",
        minWidth: "272px",
        height: "100%",
        background: "linear-gradient(180deg, rgba(8, 14, 28, 0.96) 0%, rgba(5, 9, 18, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(56, 189, 248, 0.14)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        flexShrink: 0,
        boxShadow: "4px 0 30px rgba(0, 0, 0, 0.45)",
      }}
    >
      {/* ── Mobile-Only Tactical Header ───────────────────────── */}
      {!isDesktopMode && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 16px",
            borderBottom: "1px solid rgba(56, 189, 248, 0.14)",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(8, 14, 28, 0.95) 100%)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
        <div style={{ position: "relative" }}>
          <img
            src={logoImg || "/logo.png"}
            alt="Disaster Tactical Logo"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/logo.png";
            }}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              objectFit: "contain",
              boxShadow: "0 0 16px rgba(56, 189, 248, 0.5)",
              border: "2px solid rgba(56, 189, 248, 0.5)",
              background: "#081324",
              display: "block",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: "1px",
              right: "1px",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              border: "2px solid #080e1c",
              boxShadow: "0 0 8px #10b981",
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: "800",
              fontSize: "0.98rem",
              background: "linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: "1.2",
              letterSpacing: "-0.02em",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {t.app_name_short || "NER Disaster Deck"}
          </div>
          <div
            style={{
              fontSize: "0.64rem",
              color: "#38bdf8",
              fontWeight: "700",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono, monospace)",
              marginTop: "2px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#38bdf8", display: "inline-block" }} />
            <span>CRISIS COMMAND</span>
          </div>
        </div>

        {/* Mobile close button (in mobile drawer mode) */}
        {!isDesktopMode && (
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={handleNavClick}
            aria-label="Close navigation"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#94a3b8",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1rem",
              marginLeft: "auto",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        )}
        </div>
      )}

      {/* ── Navigation Links Container ─────────────────────── */}
      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Administrator command badge — shown if authorized */}
        {isAdmin && (
          <NavLink
            to="/administrator"
            onClick={handleNavClick}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 13px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "0.88rem",
              color: isActive ? "#ffffff" : "#fef08a",
              background: isActive
                ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                : "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.12) 100%)",
              border: `1.5px solid ${isActive ? "#818cf8" : "rgba(245, 158, 11, 0.4)"}`,
              fontWeight: "800",
              boxShadow: isActive
                ? "0 4px 16px rgba(99, 102, 241, 0.45)"
                : "0 2px 8px rgba(245, 158, 11, 0.2)",
              marginBottom: "12px",
              transition: "all 0.18s ease",
            })}
          >
            <IconAdmin size={20} />
            <span style={{ flex: 1, letterSpacing: "-0.01em" }}>{t.nav_admin || "Admin Command"}</span>
            {unreadReviews > 0 && (
              <span
                title={`${unreadReviews} unread user review${unreadReviews !== 1 ? "s" : ""}`}
                style={{
                  fontSize: "0.62rem",
                  backgroundColor: "#ea580c",
                  color: "#ffffff",
                  padding: "2px 7px",
                  borderRadius: "999px",
                  fontWeight: "800",
                }}
              >
                ⭐ {unreadReviews}
              </span>
            )}
            <span
              style={{
                fontSize: "0.62rem",
                backgroundColor: isHead ? "#f59e0b" : "#6366f1",
                color: isHead ? "#0f172a" : "#ffffff",
                padding: "3px 8px",
                borderRadius: "6px",
                fontWeight: "800",
                letterSpacing: "0.04em",
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              {isHead ? "HEAD" : "ADMIN"}
            </span>
          </NavLink>
        )}

        {/* 🏠 OVERVIEW */}
        {renderNavGroup("OVERVIEW", overviewItems, "🏠", "grp_overview")}

        {/* 🚨 RESPONSE */}
        {renderNavGroup("RESPONSE", responseItems, "🚨", "grp_response")}

        {/* 🧠 INTELLIGENCE */}
        {renderNavGroup("INTELLIGENCE", intelligenceItems, "🧠", "grp_intel")}

        {/* 📡 CONNECTIVITY */}
        {renderNavGroup("CONNECTIVITY", connectivityItems, "📡", "grp_connect")}

        {/* 🚁 FIELD */}
        {renderNavGroup("FIELD", fieldItems, "🚁", "grp_field")}

        {/* 👥 COMMUNITY */}
        {renderNavGroup("COMMUNITY", communityItems, "👥", "grp_community")}

        {/* 🧪 INNOVATION LAB */}
        {renderNavGroup("INNOVATION LAB", innovationItems, "🧪", "grp_lab")}

        {/* ⚙ SYSTEM — Administration only shown to admins */}
        {renderNavGroup("SYSTEM", [
          ...systemItems,
          ...(isAdmin ? [{ key: "nav_admin_hub", fallback: "Administration", icon: IconAdmin, path: "/administrator" }] : []),
        ], "⚙", "grp_system")}
      </div>

      {/* ── Footer Branding: Together for a Safer Tomorrow ───────────── */}
      <div
        style={{
          marginTop: "auto",
          padding: "14px 16px",
          borderTop: "1px solid rgba(56, 189, 248, 0.12)",
          background: "rgba(5, 9, 18, 0.95)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(99, 102, 241, 0.35) 100%)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            flexShrink: 0,
            boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
          }}
        >
          ❄️
        </div>
        <span
          style={{
            fontSize: "0.74rem",
            fontWeight: "600",
            color: "#94a3b8",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          Together for a Safer Tomorrow
        </span>
      </div>
    </aside>
  );
}