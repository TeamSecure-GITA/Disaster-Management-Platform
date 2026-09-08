import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderTopBar from "./HeaderTopBar";
import EmergencyAlertBanner from "./EmergencyAlertBanner";
import LiveNotificationToast from "./LiveNotificationToast";
import MobileBottomNav from "./MobileBottomNav";
import { detectDesktopMode } from "../utils/browserMode";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopMode, setIsDesktopMode] = useState(() => detectDesktopMode());
  const location = useLocation();

  // Close mobile drawer on route navigation (only in mobile drawer mode)
  useEffect(() => {
    if (!isDesktopMode) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isDesktopMode]);

  // Handle desktop mode detection (e.g. mobile browser Desktop site vs normal mode, resize, orientation)
  useEffect(() => {
    const updateMode = () => {
      const desktop = detectDesktopMode();
      setIsDesktopMode(desktop);
      if (desktop) {
        document.documentElement.setAttribute("data-desktop-mode", "true");
        setSidebarOpen(false); // No drawer overlay needed in desktop mode
      } else {
        document.documentElement.setAttribute("data-desktop-mode", "false");
      }
    };

    updateMode();
    window.addEventListener("resize", updateMode);
    window.addEventListener("orientationchange", updateMode);
    return () => {
      window.removeEventListener("resize", updateMode);
      window.removeEventListener("orientationchange", updateMode);
    };
  }, []);

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
      className={isDesktopMode ? "force-desktop-layout" : "normal-layout"}
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
      {/* ── Mobile Sidebar Backdrop Overlay (only in mobile drawer mode) ── */}
      {!isDesktopMode && (
        <div
          className={`mobile-sidebar-backdrop ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Left Navigation Bar (Desktop fixed, Mobile/Tablet slide-in drawer) ── */}
      <Sidebar
        isOpen={isDesktopMode || sidebarOpen}
        isDesktopMode={isDesktopMode}
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
        <HeaderTopBar
          isDesktopMode={isDesktopMode}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
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

        {/* ── Mobile Quick Bottom Navigation Bar (< 768px, hidden in desktop mode) ── */}
        {!isDesktopMode && (
          <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />
        )}
      </div>
    </div>
  );
}