import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderTopBar from "./HeaderTopBar";
import EmergencyAlertBanner from "./EmergencyAlertBanner";
import LiveNotificationToast from "./LiveNotificationToast";
import MobileBottomNav from "./MobileBottomNav";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close mobile drawer when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        maxWidth: "100vw",
        height: "100vh",
        maxHeight: "100dvh",
        overflow: "hidden",
        backgroundColor: "#020617",
        position: "relative",
      }}
    >
      {/* ── Mobile Sidebar Backdrop Overlay ── */}
      <div
        className={`mobile-sidebar-backdrop ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── Left Navigation Bar (Desktop fixed, Mobile/Tablet slide-in drawer) ── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Right-side column: header + emergency banner + content ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <HeaderTopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <EmergencyAlertBanner />
        <LiveNotificationToast />

        <main
          className="app-main-content-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "20px 24px",
            color: "#f8fafc",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Outlet />
        </main>

        {/* ── Mobile Quick Bottom Navigation Bar (< 768px) ── */}
        <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}