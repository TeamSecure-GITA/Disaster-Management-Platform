import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderTopBar from "./HeaderTopBar";
import EmergencyAlertBanner from "./EmergencyAlertBanner";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#020617" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <HeaderTopBar />
        <EmergencyAlertBanner />
        <main style={{ flex: 1, padding: "24px", overflowY: "auto", color: "#f8fafc" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}