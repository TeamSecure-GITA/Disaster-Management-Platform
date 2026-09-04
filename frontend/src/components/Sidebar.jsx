import React, { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { isAuthorizedAdmin, isHeadAdmin } from "../utils/adminAuth";
import { X } from "lucide-react";

const menuItems = [
  { name: "Dashboard",              icon: "🏠",  path: "/" },
  { name: "NER Landslide Monitor",  icon: "⛰️",  path: "/ner-landslide-monitor" },
  { name: "Disaster Alerts",        icon: "🚨",  path: "/alerts" },
  { name: "Climate Chronicle",      icon: "📰",  path: "/climate-chronicle" },
  { name: "Disaster Response Map",  icon: "🗺️",  path: "/map" },
  { name: "Emergency SOS",          icon: "🆘",  path: "/emergency-sos" },
  { name: "Rescue Centers",         icon: "📍",  path: "/rescue-centers" },
  { name: "Shelter Finder",         icon: "🏕️",  path: "/shelter-finder" },
  { name: "Family Safety",          icon: "👥",  path: "/family-safety" },
  { name: "Evacuation Planner",     icon: "⏱️",  path: "/evacuation-planner" },
  { name: "QR Rescue ID",           icon: "🪪",  path: "/qr-rescue-id" },
  { name: "Notifications",          icon: "🔔",  path: "/notifications" },
  { name: "AI Assistant",           icon: "🤖",  path: "/ai-assistant" },
  { name: "Voice Assistant",        icon: "🎙️",  path: "/voice-assistant" },
  { name: "Damage Assessment",      icon: "🛠️",  path: "/damage-assessment" },
  { name: "Analytics & Reports",    icon: "📊",  path: "/analytics-reports" },
  { name: "Safety Guides",          icon: "🛡️",  path: "/safety-guides" },
  { name: "Statistics",             icon: "📈",  path: "/statistics" },
  { name: "Report Disaster",        icon: "📝",  path: "/incident-report" },
];

function Sidebar({ open, onClose }) {
  const location = useLocation();
  const drawerRef = useRef(null);

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
  }, [open]); // re-check every time drawer opens

  /* ── Close on route change ───────────────────────────── */
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ── Close on outside click ──────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  /* ── Prevent body scroll when open ──────────────────── */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── BACKDROP ─────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(3px)",
          zIndex: 199,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
        aria-hidden="true"
      />

      {/* ── SLIDE-OVER DRAWER ────────────────────────── */}
      <aside
        ref={drawerRef}
        aria-label="Main Navigation"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "280px",
          height: "100vh",
          backgroundColor: "#0b1329",
          borderRight: "1px solid #1e293b",
          boxShadow: open ? "6px 0 40px rgba(0,0,0,0.7)" : "none",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* ── Drawer Header ─────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          borderBottom: "1px solid #1e293b",
          background: "linear-gradient(135deg, #0f172a 0%, #0b1329 100%)",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/logo.png"
              alt="Disaster Management Logo"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                objectFit: "contain",
                boxShadow: "0 0 12px rgba(56,189,248,0.5)",
                border: "2px solid rgba(56,189,248,0.5)",
                background: "#0b1f3a",
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#38bdf8", letterSpacing: "-0.01em" }}>
                Disaster Platform
              </div>
              <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: "500" }}>
                Emergency Response System
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close navigation"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "8px",
              color: "#f87171",
              cursor: "pointer",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Nav Items ─────────────────────────── */}
        <nav style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>

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
              <span style={{ fontSize: "1.1rem" }}>🛡️</span>
              <span style={{ flex: 1 }}>Administrator</span>
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
            color: "#334155",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "6px 10px 4px",
          }}>
            Navigation
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
                padding: "10px 12px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.875rem",
                color: isActive ? "#ffffff" : "#94a3b8",
                backgroundColor: isActive ? "#2563eb" : "transparent",
                fontWeight: isActive ? "700" : "500",
                boxShadow: isActive ? "0 3px 10px rgba(37,99,235,0.4)" : "none",
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
              <span style={{ fontSize: "1.05rem", width: "22px", textAlign: "center", flexShrink: 0 }}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Footer ────────────────────────────── */}
        <div style={{
          padding: "14px 18px",
          borderTop: "1px solid #1e293b",
          fontSize: "0.7rem",
          color: "#334155",
          textAlign: "center",
        }}>
          Disaster Management Platform · NER Response
        </div>
      </aside>
    </>
  );
}

export default Sidebar;