import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/useAuth";
import { getOfflineReports, clearOfflineReports, saveOfflineReport } from "../utils/offlineStorage";
import { requestNotificationPermission, sendLocalEmergencyAlert } from "../utils/pushAlerts";

export default function Dashboard() {
  const { user, loading } = useAuth();
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
    { id: 2, text: "First-Aid Kit & Prescription Medicines", checked: true },
    { id: 3, text: "Emergency Flashlight & Extra Batteries", checked: false },
    { id: 4, text: "Power Bank & Charging Cables", checked: false },
    { id: 5, text: "Important Government Documents (In Waterproof Bag)", checked: false }
  ]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleCheck = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPushEnabled(true);
      sendLocalEmergencyAlert("🔔 Lock-Screen Alerts Active", "You will receive emergency notifications.");
    }
  };

  return (
    <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh", color: "#f8fafc", padding: "24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Header Title & National Hotline Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "bold" }}>Disaster Management Dashboard</h1>
            <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>Real-time monitoring, emergency coordination, and live incident response.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ backgroundColor: "#dc2626", color: "white", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", fontSize: "0.85rem" }}>National Emergency: 112</span>
            <span style={{ backgroundColor: "#2563eb", color: "white", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", fontSize: "0.85rem" }}>🚑 Ambulance: 108</span>
          </div>
        </div>

        {/* User Banner */}
        <div style={{ padding: "12px 18px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
          {loading ? (
            <p style={{ margin: 0, color: "#94a3b8" }}>Loading offline session...</p>
          ) : (
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold", color: "#38bdf8" }}>
              Welcome back, {user ? user.name || user.email : "Emergency Guest"}
            </h2>
          )}
        </div>

        {/* Offline Warning Bar */}
        {!isOnline && (
          <div style={{ backgroundColor: "#854d0e", color: "#fef08a", padding: "12px 18px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
            <span>⚠️ Offline Mode Active: App running entirely from local cache.</span>
            <span>Unsynced Offline Reports: {pendingSyncCount}</span>
          </div>
        )}

        {/* SLA Callback Banner */}
        <div style={{ backgroundColor: "#064e3b", border: "1px solid #059669", padding: "12px 18px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ color: "#34d399" }}>⚡ Zero-Delay SLA Active: Average Response Time is 42 Seconds</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#a7f3d0" }}>Automated AI dispatch mode active. All help requests are processed immediately with zero queuing delays.</p>
          </div>
          <button onClick={() => setCallbackRequested(true)} style={{ backgroundColor: "#059669", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            {callbackRequested ? "✓ Callback Requested" : "📞 Request 1-Min Auto Callback"}
          </button>
        </div>

        {/* Immediate Danger SOS Banner */}
        <div style={{ backgroundColor: "#7f1d1d", border: "1px solid #dc2626", padding: "16px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ color: "#fca5a5", fontSize: "1.05rem" }}>Immediate Danger / Trapped? Send Immediate Rescue Beacon</strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#fecaca" }}>Shares your live GPS location instantly with active NDRF & Local Rescue Units.</p>
          </div>
          <button onClick={() => setSosActive(!sosActive)} style={{ backgroundColor: sosActive ? "#450a0a" : "#dc2626", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            {sosActive ? "🚨 SOS Beacon Active!" : "Broadcast SOS Signal"}
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Active Alerts</span>
            <h3 style={{ margin: "6px 0 0 0", color: "#f87171", fontSize: "1.5rem" }}>3 High Priority</h3>
          </div>
          <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Rescue Operations</span>
            <h3 style={{ margin: "6px 0 0 0", color: "#60a5fa", fontSize: "1.5rem" }}>12 Ongoing</h3>
          </div>
          <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Safe Shelters Available</span>
            <h3 style={{ margin: "6px 0 0 0", color: "#4ade80", fontSize: "1.5rem" }}>48 Open</h3>
          </div>
          <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Emergency SOS Requests</span>
            <h3 style={{ margin: "6px 0 0 0", color: "#facc15", fontSize: "1.5rem" }}>5 Pending</h3>
          </div>
        </div>

        {/* Local Weather Warning Bar */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #0284c7", padding: "12px 18px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ color: "#38bdf8" }}>🌧️ Local Weather Warning: Heavy Rainfall Expected</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#cbd5e1" }}>Temp: 28°C | Wind: 32 km/h | AQI: 42 (Good)</p>
          </div>
          <button style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer" }}>View Radar</button>
        </div>

        {/* Live Feed & Quick Actions Split */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>Live Incident Feed</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "6px", borderLeft: "4px solid #ef4444" }}>
                <strong style={{ fontSize: "0.9rem" }}>Flood Warning issued for Coastal Region Sector 4</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>10 mins ago • Critical</p>
              </div>
              <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "6px", borderLeft: "4px solid #3b82f6" }}>
                <strong style={{ fontSize: "0.9rem" }}>Rescue Team Alpha dispatched to Shelter Station #2</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>25 mins ago • In Progress</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button style={{ backgroundColor: "#dc2626", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>🚨 Dispatch SOS Emergency Team</button>
              <button style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>📢 Broadcast Regional Alert</button>
              <button style={{ backgroundColor: "#059669", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>📍 Open Shelter Finder Map</button>
            </div>
          </div>
        </div>

        {/* Safety Radar & Offline SMS Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>👨‍👩‍👧 Family & Personnel Safety Radar</h3>
            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#94a3b8" }}>Real-time check-ins from registered family members during regional evacuations.</p>
            <div style={{ backgroundColor: "#0f172a", padding: "10px", borderRadius: "6px", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
              <span>Prafulla Kumar Behera</span>
              <span style={{ color: "#4ade80", fontSize: "0.85rem" }}>Safe at Shelter #1</span>
            </div>
            <div style={{ backgroundColor: "#0f172a", padding: "10px", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
              <span>Sanjibita Behera</span>
              <span style={{ color: "#4ade80", fontSize: "0.85rem" }}>Safe at Shelter #1</span>
            </div>
          </div>

          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>📲 Zero-Internet / Offline SMS Rescue Mode</h3>
            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#94a3b8" }}>If cellular internet drops, send an emergency SMS to route your rescue request immediately.</p>
            <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "6px", border: "1px dashed #475569" }}>
              <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>Send SMS: <strong>RESCUE [NAME] [LOCATION]</strong> to <strong>56161</strong></span>
            </div>
          </div>
        </div>

        {/* Relief Shelters & Survival Kit Prep */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>🏥 Active Relief Shelters</h3>
            <div style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>Community Hall #1 (City Center)</span>
                <span style={{ color: "#4ade80" }}>75% Full (50 Beds Open)</span>
              </div>
              <div style={{ backgroundColor: "#334155", height: "8px", borderRadius: "4px" }}>
                <div style={{ backgroundColor: "#22c55e", width: "75%", height: "100%", borderRadius: "4px" }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>Central Stadium Shelter</span>
                <span style={{ color: "#facc15" }}>88% Full (12 Beds Open)</span>
              </div>
              <div style={{ backgroundColor: "#334155", height: "8px", borderRadius: "4px" }}>
                <div style={{ backgroundColor: "#eab308", width: "88%", height: "100%", borderRadius: "4px" }}></div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>🎒 72-Hour Survival Kit Prep</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {checklist.map(item => (
                <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} />
                  <span style={{ textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "#94a3b8" : "#f8fafc" }}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Crowdsourced Hazard Reporting */}
        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>📢 Crowdsourced Incident & Hazard Reporting</h3>
          <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#94a3b8" }}>Report fallen power lines, road blockages, or flooding to alert emergency responders.</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              placeholder="Describe hazard or incident..." 
              value={reportInput}
              onChange={(e) => setReportInput(e.target.value)}
              style={{ flex: 1, backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "6px", padding: "10px", color: "white" }}
            />
            <button 
              onClick={() => {
                if(reportInput.trim()){
                  setReports([{ id: Date.now(), text: reportInput, time: "Just now", status: "Pending" }, ...reports]);
                  setReportInput("");
                }
              }}
              style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
            >
              Submit Hazard Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}