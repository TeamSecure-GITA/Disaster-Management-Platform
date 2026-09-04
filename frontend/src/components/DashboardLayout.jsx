import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderTopBar from "./HeaderTopBar";
import EmergencyAlertBanner from "./EmergencyAlertBanner";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#020617" }}>
      {/* ── Permanent Left Navigation Bar ── */}
      <Sidebar />

      {/* ── Right-side column: header + content ── */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <HeaderTopBar />
        <EmergencyAlertBanner />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", color: "#f8fafc" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}