// ─────────────────────────────────────────────────────────────────────────────
// src/components/Sidebar.jsx
//
// Tactical Command & Emergency Navigation Bar
// Multi-tiered visual hierarchy differentiated by frequency-of-use:
// - Tier 1: Immediate Crisis Response & Core Operations (High visual priority)
// - Tier 2: Intelligence, Sensors & Field Logistics (Operational priority)
// - Tier 3: Citizen & Community Safety
// - Tier 4: Innovation Lab & Simulations (Research tier, visually distinct)
// - Tier 5: System & Configuration
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
  IconFamily,
  IconEvacuation,
  IconAi,
  IconDamage,
  IconSafety,
  IconStatistics,
  IconAdmin,
  IconFaq,
  IconMesh,
  IconAR,
  IconDigitalTwin,
  IconSensory,
  IconSafeZone,
  IconMicroTask,
  IconAidLedger,
  IconReconstruct,
  IconZeroInternet,
  IconDrone,
  IconDelivery,
  IconNERSuite,
  IconWorldFirst,
  IconDecentralized,
  IconExtremeResilience,
} from "./NavigationIcons";

// ── 1. TIER: CORE COMMAND & OVERVIEW (Daily / Continuous) ─────────────────────
const overviewItems = [
  { key: "nav_dashboard", fallback: "Dashboard",          icon: IconDashboard, path: "/",       badge: "LIVE", tier: "crisis", accent: "#38bdf8" },
  { key: "nav_map",       fallback: "Live Situation Map", icon: IconMap,       path: "/map",    badge: "TACTICAL", tier: "crisis", accent: "#0284c7" },
  { key: "nav_alerts",    fallback: "Disaster Alert",     icon: IconAlerts,    path: "/alerts", badge: "CRITICAL", tier: "crisis", accent: "#ef4444" },
];

// ── 2. TIER: CRISIS RESPONSE (Urgent / Emergency Dispatch) ────────────────────
const responseItems = [
  { key: "nav_sos",        fallback: "Emergency SOS Center",    icon: IconSos,        path: "/emergency-sos",     badge: "SOS", tier: "urgent", accent: "#dc2626" },
  { key: "nav_rescue",     fallback: "Rescue Centers",          icon: IconRescue,     path: "/rescue-centers",    badge: "FIELD", tier: "crisis", accent: "#10b981" },
  { key: "nav_evacuation", fallback: "Evacuation Planner",      icon: IconEvacuation, path: "/evacuation-planner", badge: "ROUTES", tier: "crisis", accent: "#38bdf8" },
  { key: "nav_damage",     fallback: "Damage & Resources",      icon: IconDamage,     path: "/damage-assessment", badge: null, tier: "crisis", accent: "#f59e0b" },
  { key: "nav_relief",     fallback: "Live Relief Fleet",       icon: IconDelivery,   path: "/relief-tracker",    badge: "GPS", tier: "crisis", accent: "#06b6d4" },
];

// ── 3. TIER: INTELLIGENCE & TELEMETRY (Operational Analysis) ─────────────────
const intelligenceItems = [
  { key: "nav_ai_voice",          fallback: "AI & Voice Assistant",   icon: IconAi,         path: "/ai-assistant",         badge: "AI", tier: "intel", accent: "#a855f7" },
  { key: "nav_ner_landslide",     fallback: "NER Landslide Monitor",  icon: IconLandslide,  path: "/ner-landslide-monitor", badge: "RADAR", tier: "intel", accent: "#f97316" },
  { key: "nav_statistics",        fallback: "Statistics & Analytics", icon: IconStatistics, path: "/statistics",            badge: null, tier: "intel", accent: "#38bdf8" },
  { key: "nav_climate_chronicle", fallback: "Disaster Intelligence",  icon: IconClimate,    path: "/climate-chronicle",    badge: null, tier: "intel", accent: "#0ea5e9" },
];

// ── 4. TIER: CONNECTIVITY & OFF-GRID MESH (Resilience Infrastructure) ─────────
const connectivityItems = [
  { key: "nav_smart_alerts",  fallback: "Smart IoT Sensors",      icon: IconSensory,      path: "/smart-alerts",       badge: "IoT", tier: "connectivity", accent: "#06b6d4" },
  { key: "nav_mesh",          fallback: "LoRa Mesh Console",      icon: IconMesh,         path: "/mesh-console",       badge: "P2P", tier: "connectivity", accent: "#10b981" },
  { key: "nav_zero_net",      fallback: "Zero-Internet Mode",     icon: IconZeroInternet, path: "/zero-internet-mesh", badge: "OFF-GRID", tier: "connectivity", accent: "#f59e0b" },
  { key: "nav_low_bandwidth", fallback: "Ultra-Low 2G Mode",      icon: IconSafeZone,     path: "/low-bandwidth",      badge: "2G", tier: "connectivity", accent: "#64748b" },
];

// ── 5. TIER: FIELD DEPLOYMENTS & LOGISTICS ───────────────────────────────────
const fieldItems = [
  { key: "nav_drone",        fallback: "Drone Reconnaissance",   icon: IconDrone,        path: "/drone-analytics",  badge: "UAV", tier: "field", accent: "#38bdf8" },
  { key: "nav_tasks",        fallback: "Volunteer Network",      icon: IconMicroTask,    path: "/volunteer-tasks",  badge: null, tier: "field", accent: "#10b981" },
  { key: "nav_aid_ledger",   fallback: "Aid Ledger & Supply",    icon: IconAidLedger,    path: "/aid-ledger",       badge: "LEDGER", tier: "field", accent: "#06b6d4" },
  { key: "nav_reconstruct",  fallback: "Reconstruction Map",     icon: IconReconstruct,  path: "/reconstruction",   badge: null, tier: "field", accent: "#f59e0b" },
];

// ── 6. TIER: COMMUNITY & CITIZEN SAFETY ──────────────────────────────────────
const communityItems = [
  { key: "nav_family",    fallback: "Family Safety & QR ID",   icon: IconFamily,  path: "/family-safety",  badge: null, tier: "community", accent: "#818cf8" },
  { key: "nav_report_dis", fallback: "Report Citizen Incident", icon: IconAlerts,  path: "/incident-report", badge: "REPORT", tier: "community", accent: "#f43f5e" },
  { key: "nav_safety",    fallback: "Safety Action Guides",    icon: IconSafety,  path: "/safety-guides",   badge: null, tier: "community", accent: "#10b981" },
];

// ── 7. TIER: INNOVATION LAB (Predictive & Deep-Tech Research) ─────────────────
const innovationItems = [
  { key: "nav_digital_twin",   fallback: "Digital Twin 3D Simulation",     icon: IconDigitalTwin,       path: "/digital-twin",            badge: "SIM", tier: "lab", accent: "#a855f7" },
  { key: "nav_ner_topography", fallback: "Multi-Disaster Simulation",      icon: IconNERSuite,          path: "/ner-topography-suite",    badge: "NER", tier: "lab", accent: "#8b5cf6" },
  { key: "nav_world_first",    fallback: "World-First Deep-Tech",          icon: IconWorldFirst,        path: "/world-first-innovations", badge: "NOVEL", tier: "lab", accent: "#6366f1" },
  { key: "nav_decentralized",  fallback: "Decentralized SAR Radar",        icon: IconDecentralized,     path: "/decentralized-resilience",badge: "SAR", tier: "lab", accent: "#ec4899" },
  { key: "nav_extreme_res",    fallback: "Extreme Resilience Suite",       icon: IconExtremeResilience, path: "/extreme-resilience",      badge: "LAB", tier: "lab", accent: "#06b6d4" },
  { key: "nav_ar_risk",        fallback: "AR See The Risk Scanner",        icon: IconAR,                path: "/ar-see-the-risk",         badge: "AR", tier: "lab", accent: "#14b8a6" },
];

// ── 8. TIER: SYSTEM & SUPPORT ────────────────────────────────────────────────
const systemItems = [
  { key: "nav_faq",      fallback: "Help & SOP Protocols",  icon: IconFaq,   path: "/faq",      badge: null, tier: "system", accent: "#64748b" },
  { key: "nav_settings", fallback: "Platform Settings",     icon: IconAdmin, path: "/settings", badge: null, tier: "system", accent: "#64748b" },
  { key: "nav_reviews",  fallback: "Operational Feedback",  icon: IconAlerts,path: "/reviews",  badge: null, tier: "system", accent: "#64748b" },
];

export default function Sidebar({ isOpen = false, isDesktopMode = false, onClose }) {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isHead, setIsHead] = React.useState(false);
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
        let email = "";

        if (rawUser) { try { const p = JSON.parse(rawUser); email = p?.email || ""; } catch {} }
        if (!email && rawSession) { try { const p = JSON.parse(rawSession); email = p?.email || ""; } catch {} }
        if (!email && rawProfile) { try { const p = JSON.parse(rawProfile); email = p?.email || ""; } catch {} }

        const authorized = Boolean(email && isAuthorizedAdmin(email));
        setIsAdmin(authorized);
        setIsHead(email ? isHeadAdmin(email) : false);
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

  // Deduplication tracker: ensures each destination/menu path is rendered at most once across the sidebar
  const renderedPaths = new Set();
  if (isAdmin) {
    renderedPaths.add("/administrator");
  }

  const renderNavGroup = (title, items, iconPrefix, sectorId, groupType = "standard") => {
    const uniqueItems = items.filter((item) => {
      if (!item?.path) return false;
      if (renderedPaths.has(item.path)) return false;
      renderedPaths.add(item.path);
      return true;
    });

    const filtered = filterItems(uniqueItems);
    if (searchQuery.trim() && filtered.length === 0) return null;
    if (filtered.length === 0) return null;
    const isCollapsed = !searchQuery.trim() && sectorId && collapsedSectors[sectorId];

    // Sector header color accent depending on group type
    const headerColor =
      groupType === "urgent" ? "#f87171" :
      groupType === "crisis" ? "#38bdf8" :
      groupType === "lab" ? "#c084fc" :
      groupType === "community" ? "#34d399" : "#94a3b8";

    const headerTag =
      groupType === "urgent" ? "CRISIS OPS" :
      groupType === "crisis" ? "CORE" :
      groupType === "lab" ? "RESEARCH / SIM" : null;

    return (
      <div style={{ marginBottom: groupType === "urgent" || groupType === "crisis" ? "12px" : "10px" }}>
        {/* Sector Group Header */}
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
            padding: "6px 10px 4px",
            fontSize: "0.68rem",
            fontWeight: "800",
            color: headerColor,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontFamily: "var(--font-mono, monospace)",
            cursor: sectorId ? "pointer" : "default",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ opacity: 0.95 }}>{iconPrefix}</span>
            <span>{title}</span>
            {headerTag && (
              <span
                style={{
                  fontSize: "0.52rem",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  backgroundColor: groupType === "urgent" ? "rgba(220, 38, 38, 0.25)" : groupType === "lab" ? "rgba(168, 85, 247, 0.2)" : "rgba(56, 189, 248, 0.2)",
                  color: headerColor,
                  fontWeight: "900",
                  letterSpacing: "0.06em",
                }}
              >
                {headerTag}
              </span>
            )}
          </div>
          {sectorId && !searchQuery.trim() && (
            <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: "700" }}>
              {isCollapsed ? "＋" : "—"}
            </span>
          )}
        </button>

        {!isCollapsed && (
          <div style={{ display: "flex", flexDirection: "column", gap: groupType === "urgent" ? "5px" : "3px", marginTop: "3px" }}>
            {filtered.map((item) => {
              const isUrgentSOS = item.tier === "urgent";
              const isCrisisTier = item.tier === "crisis";
              const isLabTier = item.tier === "lab";

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={handleNavClick}
                  style={({ isActive }) => {
                    if (isUrgentSOS) {
                      return {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontSize: "0.88rem",
                        fontWeight: "800",
                        color: "#ffffff",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(220, 38, 38, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%)"
                          : "linear-gradient(135deg, rgba(220, 38, 38, 0.22) 0%, rgba(153, 27, 27, 0.28) 100%)",
                        border: `1.5px solid ${isActive ? "#ef4444" : "rgba(239, 68, 68, 0.55)"}`,
                        boxShadow: isActive
                          ? "0 4px 18px rgba(220, 38, 38, 0.5), inset 0 0 12px rgba(255, 255, 255, 0.2)"
                          : "0 2px 10px rgba(220, 38, 38, 0.2)",
                        transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                      };
                    }

                    if (isCrisisTier) {
                      return {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 11px",
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontSize: "0.86rem",
                        fontWeight: isActive ? "700" : "600",
                        color: isActive ? "#ffffff" : "#f1f5f9",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(14, 165, 233, 0.32) 0%, rgba(3, 105, 161, 0.42) 100%)"
                          : "rgba(15, 23, 42, 0.5)",
                        border: isActive
                          ? "1px solid rgba(56, 189, 248, 0.55)"
                          : "1px solid rgba(255, 255, 255, 0.05)",
                        boxShadow: isActive
                          ? "0 4px 14px rgba(14, 165, 233, 0.3), inset 0 0 10px rgba(56, 189, 248, 0.15)"
                          : "none",
                        transition: "all 0.18s ease",
                      };
                    }

                    if (isLabTier) {
                      return {
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "0.80rem",
                        fontWeight: isActive ? "700" : "500",
                        color: isActive ? "#ffffff" : "#cbd5e1",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(168, 85, 247, 0.28) 0%, rgba(126, 34, 206, 0.35) 100%)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(192, 132, 252, 0.45)"
                          : "1px solid transparent",
                        boxShadow: isActive ? "0 2px 10px rgba(168, 85, 247, 0.25)" : "none",
                        transition: "all 0.18s ease",
                      };
                    }

                    // Standard tier (Intelligence, Connectivity, Field, Community, System)
                    return {
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "7px 11px",
                      borderRadius: "9px",
                      textDecoration: "none",
                      fontSize: "0.82rem",
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? "#ffffff" : "#cbd5e1",
                      background: isActive
                        ? "linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(3, 105, 161, 0.3) 100%)"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(56, 189, 248, 0.35)"
                        : "1px solid transparent",
                      boxShadow: isActive ? "0 2px 10px rgba(14, 165, 233, 0.2)" : "none",
                      transition: "all 0.18s ease",
                    };
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.classList.contains("active")) {
                      e.currentTarget.style.backgroundColor = isUrgentSOS
                        ? "rgba(220, 38, 38, 0.35)"
                        : isLabTier
                        ? "rgba(168, 85, 247, 0.15)"
                        : "rgba(30, 41, 59, 0.65)";
                      e.currentTarget.style.transform = "translateX(3px)";
                      e.currentTarget.style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.classList.contains("active")) {
                      e.currentTarget.style.backgroundColor = isUrgentSOS
                        ? "linear-gradient(135deg, rgba(220, 38, 38, 0.22) 0%, rgba(153, 27, 27, 0.28) 100%)"
                        : isCrisisTier
                        ? "rgba(15, 23, 42, 0.5)"
                        : "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.color = isCrisisTier ? "#f1f5f9" : "#cbd5e1";
                    }
                  }}
                >
                  {/* Icon Container Capsule */}
                  <span
                    style={{
                      width: isUrgentSOS ? "26px" : isCrisisTier ? "24px" : "22px",
                      height: isUrgentSOS ? "26px" : isCrisisTier ? "24px" : "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      borderRadius: isUrgentSOS ? "7px" : "6px",
                      backgroundColor: isUrgentSOS ? "rgba(239, 68, 68, 0.3)" : isCrisisTier ? "rgba(14, 165, 233, 0.15)" : "transparent",
                    }}
                  >
                    <item.icon size={isUrgentSOS ? 18 : isCrisisTier ? 17 : 16} />
                  </span>

                  {/* Title Label */}
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

                  {/* High-Contrast Status & Type Badge */}
                  {item.badge && (
                    <span
                      style={{
                        fontSize: isUrgentSOS ? "0.62rem" : "0.56rem",
                        fontWeight: "900",
                        padding: isUrgentSOS ? "2px 7px" : "2px 6px",
                        borderRadius: "999px",
                        letterSpacing: "0.05em",
                        fontFamily: "var(--font-mono, monospace)",
                        whiteSpace: "nowrap",
                        ...(item.badge === "SOS" || item.badge === "CRITICAL"
                          ? { background: "#dc2626", color: "#ffffff", border: "1px solid #ef4444", boxShadow: "0 0 8px rgba(220, 38, 38, 0.6)" }
                          : item.badge === "LIVE" || item.badge === "FIELD"
                          ? { background: "#059669", color: "#ffffff", border: "1px solid #10b981", boxShadow: "0 0 6px rgba(5, 150, 105, 0.4)" }
                          : item.badge === "SIM" || item.badge === "NER" || item.badge === "NOVEL" || item.badge === "SAR"
                          ? { background: "rgba(126, 34, 206, 0.8)", color: "#ffffff", border: "1px solid #a855f7" }
                          : item.badge === "IoT" || item.badge === "UAV" || item.badge === "P2P" || item.badge === "GPS"
                          ? { background: "rgba(2, 132, 199, 0.75)", color: "#ffffff", border: "1px solid #38bdf8" }
                          : { background: "rgba(71, 85, 105, 0.8)", color: "#e2e8f0", border: "1px solid rgba(148, 163, 184, 0.3)" }
                        ),
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
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
        background: "linear-gradient(180deg, rgba(8, 14, 28, 0.97) 0%, rgba(5, 9, 18, 0.99) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(56, 189, 248, 0.16)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        flexShrink: 0,
        boxShadow: "4px 0 30px rgba(0, 0, 0, 0.5)",
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

        {/* 🚨 TIER 1: CORE COMMAND & ACTIVE CRISIS */}
        {renderNavGroup("CORE COMMAND", overviewItems, "🌐", "grp_overview", "crisis")}
        {renderNavGroup("CRISIS RESPONSE", responseItems, "🚨", "grp_response", "urgent")}

        {/* 🧠 TIER 2: INTELLIGENCE, OFF-GRID & LOGISTICS */}
        {renderNavGroup("INTELLIGENCE", intelligenceItems, "🧠", "grp_intel", "standard")}
        {renderNavGroup("CONNECTIVITY & MESH", connectivityItems, "📡", "grp_connect", "standard")}
        {renderNavGroup("FIELD DEPLOYMENTS", fieldItems, "🚁", "grp_field", "standard")}

        {/* 👥 TIER 3: CITIZEN & COMMUNITY */}
        {renderNavGroup("COMMUNITY SAFETY", communityItems, "👥", "grp_community", "community")}

        {/* 🧪 TIER 4: INNOVATION LAB & SIMULATIONS */}
        {renderNavGroup("INNOVATION LAB", innovationItems, "🧪", "grp_lab", "lab")}

        {/* ⚙ TIER 5: SYSTEM */}
        {renderNavGroup("SYSTEM & SUPPORT", systemItems, "⚙", "grp_system", "standard")}
      </div>

      {/* ── Footer Branding: Operational Resilience ───────────── */}
      <div
        style={{
          marginTop: "auto",
          padding: "12px 16px",
          borderTop: "1px solid rgba(56, 189, 248, 0.12)",
          background: "rgba(5, 9, 18, 0.95)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "6px",
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(99, 102, 241, 0.35) 100%)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            flexShrink: 0,
            boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
          }}
        >
          🛡️
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: "700",
              color: "#e2e8f0",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            Tactical Operations Ready
          </span>
          <span style={{ fontSize: "0.6rem", color: "#64748b", fontFamily: "var(--font-mono, monospace)" }}>
            Zero-Cloud Fault Tolerant
          </span>
        </div>
      </div>
    </aside>
  );
}