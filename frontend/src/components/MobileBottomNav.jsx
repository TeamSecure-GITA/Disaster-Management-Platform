import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, Flame, Bell, Menu } from "lucide-react";

export default function MobileBottomNav({ onOpenMenu }) {
  const navItemStyle = ({ isActive }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    textDecoration: "none",
    fontSize: "0.66rem",
    fontWeight: isActive ? "800" : "600",
    color: isActive ? "#38bdf8" : "#94a3b8",
    padding: "6px 12px",
    borderRadius: "12px",
    backgroundColor: isActive ? "rgba(56, 189, 248, 0.14)" : "transparent",
    border: isActive ? "1px solid rgba(56, 189, 248, 0.35)" : "1px solid transparent",
    boxShadow: isActive ? "0 0 14px rgba(56, 189, 248, 0.25)" : "none",
    transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
    position: "relative",
  });

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      style={{
        position: "fixed",
        bottom: "10px",
        left: "12px",
        right: "12px",
        height: "64px",
        backgroundColor: "rgba(8, 14, 28, 0.94)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(56, 189, 248, 0.25)",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 8px",
        zIndex: 90,
        boxShadow: "0 10px 35px rgba(0, 0, 0, 0.75), 0 0 20px rgba(56, 189, 248, 0.18)",
      }}
    >
      {/* 1. Dashboard */}
      <NavLink to="/" end style={navItemStyle}>
        <LayoutDashboard size={19} />
        <span>Command</span>
      </NavLink>

      {/* 2. Disaster Map */}
      <NavLink to="/map" style={navItemStyle}>
        <Map size={19} />
        <span>GIS Map</span>
      </NavLink>

      {/* 3. Emergency SOS — Highlighted Central Floating Action with animated pulse rings */}
      <div style={{ position: "relative" }}>
        <div className="animate-pulse-ring" style={{ borderRadius: "999px" }} />
        <NavLink
          to="/emergency-sos"
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            textDecoration: "none",
            fontSize: "0.68rem",
            fontWeight: "900",
            color: "#ffffff",
            background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
            padding: "8px 18px",
            borderRadius: "999px",
            border: "2px solid rgba(255, 255, 255, 0.4)",
            boxShadow: isActive
              ? "0 0 25px rgba(225, 29, 72, 1), 0 4px 14px rgba(0,0,0,0.6)"
              : "0 0 18px rgba(225, 29, 72, 0.85), 0 4px 12px rgba(0,0,0,0.5)",
            transform: "translateY(-12px)",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
            letterSpacing: "0.06em",
            fontFamily: "var(--font-mono, monospace)",
          })}
        >
          <Flame size={20} />
          <span>SOS</span>
        </NavLink>
      </div>

      {/* 4. Alerts */}
      <NavLink to="/alerts" style={navItemStyle}>
        <Bell size={19} />
        <span>Alerts</span>
      </NavLink>

      {/* 5. Menu Drawer Trigger */}
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open all services menu"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "3px",
          backgroundColor: "transparent",
          border: "none",
          color: "#94a3b8",
          fontSize: "0.66rem",
          fontWeight: "600",
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: "12px",
          transition: "all 0.18s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
      >
        <Menu size={19} />
        <span>Deck</span>
      </button>
    </nav>
  );
}
