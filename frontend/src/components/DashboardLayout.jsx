import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderTopBar from "./HeaderTopBar";
import EmergencyAlertBanner from "./EmergencyAlertBanner";
import LiveNotificationToast from "./LiveNotificationToast";
import CitizenUnsafeEmergencyModal from "./CitizenUnsafeEmergencyModal";
import MobileBottomNav from "./MobileBottomNav";
import OfflineStatusWidget from "./OfflineStatusWidget";
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
        flexDirection: "column",
        width: "100%",
        maxWidth: "100vw",
        height: "100vh",
        maxHeight: "100dvh",
        overflow: "hidden",
        backgroundColor: "#060b17",
        backgroundImage: "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(14, 165, 233, 0.08), rgba(2, 6, 23, 0.98))",
        position: "relative",
      }}
    >
      {/* ── Top Permanent Navigation & Status Bar (Full Width) ── */}
      <HeaderTopBar
        isDesktopMode={isDesktopMode}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <CitizenUnsafeEmergencyModal />
      <LiveNotificationToast />

      {/* ── Main Body: Sidebar + Main Content Row ── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Mobile Sidebar Backdrop Overlay (only in mobile drawer mode) */}
        {!isDesktopMode && (
          <div
            className={`mobile-sidebar-backdrop ${sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Navigation Bar */}
        <Sidebar
          isOpen={isDesktopMode || sidebarOpen}
          isDesktopMode={isDesktopMode}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main
          className="app-main-content-scroll"
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px 20px 80px 20px",
            color: "#f8fafc",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Outlet />
        </main>

        {/* Mobile Quick Bottom Navigation Bar (< 768px, hidden in desktop mode) */}
        {!isDesktopMode && (
          <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />
        )}

        <OfflineStatusWidget />
      </div>
    </div>
  );
}