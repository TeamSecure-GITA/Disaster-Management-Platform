import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderTopBar from "./HeaderTopBar";
import EmergencyAlertBanner from "./EmergencyAlertBanner";

export default function DashboardLayout() {
  const [navOpen, setNavOpen] = useState(false);

  const openNav  = useCallback(() => setNavOpen(true),  []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#020617" }}>
      {/* ── Slide-over nav drawer (no permanent space taken) ── */}
      <Sidebar open={navOpen} onClose={closeNav} />

      {/* ── Full-width column layout ── */}
      <HeaderTopBar onOpenNav={openNav} navOpen={navOpen} />
      <EmergencyAlertBanner />
      <main style={{ flex: 1, overflowY: "auto", padding: "24px", color: "#f8fafc" }}>
        <Outlet />
      </main>
    </div>
  );
}