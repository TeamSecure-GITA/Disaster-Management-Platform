import React, { useState, useEffect } from "react";
import { getOfflineReports, clearOfflineReports, saveOfflineReport } from "../utils/offlineStorage";
import { requestNotificationPermission, sendLocalEmergencyAlert } from "../utils/pushAlerts";

import EmergencyMap from "../components/EmergencyMap";
import SirenBeacon from "../components/SirenBeacon";
import OfflineChatbot from "../components/OfflineChatbot";
import MedicalCard from "../components/MedicalCard";

export default function Dashboard() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [reportInput, setReportInput] = useState("");
  const [pushEnabled, setPushEnabled] = useState(Notification.permission === "granted");

  const [reports, setReports] = useState([
    { id: 1, text: "Fallen power line on Sector 3 Main Road", time: "10 mins ago", status: "Verified" }
  ]);

  const [checklist, setChecklist] = useState([
    { id: 1, text: "72-Hour Clean Water Supply (3 Gallons)", checked: true },
    { id: 2, text: "First Aid Kit & Prescription Medicines", checked: true },
    { id: 3, text: "Flashlight & Spare Batteries", checked: false },
    { id: 4, text: "Power Bank & Charging Cables", checked: false }
  ]);

  const familyMembers = [
    { id: 1, name: "Prafulla Kumar Behera", status: "Safe at Shelter #1", time: "10m ago" },
    { id: 2, name: "Santilata Behera", status: "Safe at Shelter #1", time: "10m ago" }
  ];

  const stats = [
    { title: "Active Alerts", value: "3 High Priority", color: "#ef4444" },
    { title: "Rescue Operations", value: "12 Ongoing", color: "#38bdf8" },
    { title: "Safe Shelters Available", value: "48 Open", color: "#22c55e" },
    { title: "Emergency SOS Requests", value: "5 Pending", color: "#f59e0b" },
  ];

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); syncOfflineData(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    checkPendingReports();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkPendingReports = async () => {
    const pending = await getOfflineReports();
    setPendingSyncCount(pending.length);
  };

  const syncOfflineData = async () => {
    const pending = await getOfflineReports();
    if (pending.length > 0) {
      await clearOfflineReports();
      setPendingSyncCount(0);
      alert("⚡ Network restored! Unsynced offline reports submitted to emergency response servers.");
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportInput.trim()) return;

    const newReport = { id: Date.now(), text: reportInput, time: "Just now", status: isOnline ? "Under Review" : "Saved Offline" };
    
    if (!isOnline) {
      await saveOfflineReport(newReport);
      checkPendingReports();
    }

    setReports([newReport, ...reports]);
    setReportInput("");
  };

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPushEnabled(true);
      sendLocalEmergencyAlert("🚨 Lock-Screen Alerts Active", "You will receive emergency notifications during evacuations.");
    }
  };

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "#f8fafc", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {!isOnline && (
          <div style={{ backgroundColor: "#854d0e", color: "#fef08a", padding: "12px 18px", borderRadius: "8px", marginBottom: "1.25rem", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
            <span>📡 Offline Mode Active: App running entirely from local cache.</span>
            <span>Unsynced Offline Reports: {pendingSyncCount}</span>
          </div>
        )}

        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", padding: "8px 16px", marginBottom: "1rem", display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#94a3b8" }}>
          <span>🌤️ Local Weather Radar: 28°C | Severe Weather Warning Active</span>
          <span>Wind: 42 km/h | AQI: 45 (Good)</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: "0 0 6px 0" }}>Disaster Emergency Dashboard</h1>
            <p style={{ color: "#94a3b8", margin: 0 }}>Offline-ready emergency response & safety coordinator.</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <a href="tel:112" style={{ backgroundColor: "#dc2626", color: "#fff", padding: "8px 12px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>📞 112</a>
            <a href="tel:108" style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 12px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>🚑 108</a>
          </div>
        </div>

        {/* --- NEW FRONTEND COMPONENTS --- */}
        <SirenBeacon />
        <EmergencyMap />
        <OfflineChatbot />
        <MedicalCard />

        {/* --- SLA & SOS BUTTONS --- */}
        <div style={{ backgroundColor: "#064e3b", border: "1px solid #10b981", borderRadius: "10px", padding: "12px 18px", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#6ee7b7", fontWeight: "bold", fontSize: "0.9rem" }}>⚡ Emergency SLA: Response Time Under 60 Seconds</span>
          <button onClick={() => setCallbackRequested(true)} style={{ backgroundColor: callbackRequested ? "#059669" : "#10b981", color: "#064e3b", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            {callbackRequested ? "✓ Callback Scheduled" : "📞 Request Auto Callback"}
          </button>
        </div>

        <div style={{ backgroundColor: sosActive ? "#7f1d1d" : "#450a0a", border: "2px solid #ef4444", borderRadius: "12px", padding: "16px 20px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#fca5a5" }}>Immediate Danger? Trigger SOS Rescue Signal</span>
            <div style={{ fontSize: "0.85rem", color: "#fecaca" }}>Dispatches coordinates directly to rescue command units.</div>
          </div>
          <button onClick={() => setSosActive(true)} style={{ backgroundColor: sosActive ? "#22c55e" : "#ef4444", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            {sosActive ? "✓ SOS Active" : "Broadcast SOS"}
          </button>
        </div>

        {/* --- KPI METRICS GRID --- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "1.5rem" }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "18px" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{stat.title}</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: stat.color, marginTop: "6px" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "1.5rem" }}>
          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "10px" }}>👨‍👩‍👧‍👦 Family Safety Radar</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {familyMembers.map((member) => (
                <div key={member.id} style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#0f172a", padding: "10px 14px", borderRadius: "8px" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", color: "#f8fafc" }}>{member.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>{member.status}</div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{member.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "10px" }}>🎒 72-Hour Survival Kit Checklist</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {checklist.map((item) => (
                <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: item.checked ? "#94a3b8" : "#f8fafc", cursor: "pointer", textDecoration: item.checked ? "line-through" : "none" }}>
                  <input type="checkbox" checked={item.checked} onChange={() => setChecklist(checklist.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))} style={{ accentColor: "#2563eb" }} />
                  {item.text}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* --- HAZARD REPORTING --- */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "6px" }}>📢 Crowdsourced Hazard Reporter</h2>
          <form onSubmit={handleReportSubmit} style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
            <input type="text" placeholder="Describe hazard in your area..." value={reportInput} onChange={(e) => setReportInput(e.target.value)} style={{ flex: 1, padding: "10px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff" }} />
            <button type="submit" style={{ backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Submit Report</button>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {reports.map((rep) => (
              <div key={rep.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", padding: "10px 14px", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.85rem" }}>{rep.text}</span>
                <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "10px", backgroundColor: rep.status === "Verified" ? "#166534" : rep.status === "Saved Offline" ? "#854d0e" : "#1e3a8a", color: rep.status === "Verified" ? "#4ade80" : rep.status === "Saved Offline" ? "#fef08a" : "#93c5fd" }}>
                  {rep.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}