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
    fontSize: "0.68rem",
    fontWeight: isActive ? "700" : "500",
    color: isActive ? "#38bdf8" : "#94a3b8",
    padding: "4px 8px",
    borderRadius: "8px",
    transition: "color 0.15s, background-color 0.15s",
    position: "relative",
  });

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {/* 1. Dashboard */}
      <NavLink to="/" end style={navItemStyle}>
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>

      {/* 2. Disaster Map */}
      <NavLink to="/map" style={navItemStyle}>
        <Map size={20} />
        <span>Map</span>
      </NavLink>

      {/* 3. Emergency SOS — Highlighted Central Action */}
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
          fontWeight: "800",
          color: "#ffffff",
          backgroundColor: "#dc2626",
          padding: "6px 14px",
          borderRadius: "20px",
          boxShadow: isActive
            ? "0 0 16px rgba(220, 38, 38, 0.8)"
            : "0 2px 10px rgba(220, 38, 38, 0.5)",
          transform: "translateY(-4px)",
          transition: "transform 0.15s, box-shadow 0.15s",
        })}
      >
        <Flame size={19} />
        <span>SOS</span>
      </NavLink>

      {/* 4. Alerts */}
      <NavLink to="/alerts" style={navItemStyle}>
        <Bell size={20} />
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
          fontSize: "0.68rem",
          fontWeight: "600",
          cursor: "pointer",
          padding: "4px 8px",
        }}
      >
        <Menu size={20} />
        <span>Menu</span>
      </button>
    </nav>
  );
}
