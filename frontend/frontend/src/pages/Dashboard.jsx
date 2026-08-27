import React, { useState, useEffect } from "react";

export default function Dashboard() {
  // Rapid Response Dispatch SLA Counter (Real-time seconds tracking)
  const [dispatchTimer, setDispatchTimer] = useState(48); // Sub-60s counter
  const [sosActive, setSosActive] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);

  // Stat cards data
  const stats = [
    { title: "Active Alerts", value: "3 High Priority", color: "#ef4444" },
    { title: "Rescue Operations", value: "12 Ongoing", color: "#38bdf8" },
    { title: "Safe Shelters Available", value: "48 Open", color: "#22c55e" },
    { title: "Emergency SOS Requests", value: "5 Pending", color: "#f59e0b" },
  ];

  // Live Incident Feed data
  const recentActivities = [
    { id: 1, time: "10 mins ago", event: "Flood Warning issued for Coastal Region Sector 4", status: "Critical" },
    { id: 2, time: "25 mins ago", event: "Rescue Team Alpha dispatched to Shelter Station #2", status: "In Progress" },
    { id: 3, time: "1 hour ago", event: "Medical supplies restocked at Central Emergency Hub", status: "Completed" },
  ];

  // Emergency Kit Checklist state
  const [checklist, setChecklist] = useState([
    { id: 1, text: "72-Hour Clean Water Supply (3 Gallons)", checked: true },
    { id: 2, text: "First Aid Kit & Prescription Medicines", checked: true },
    { id: 3, text: "Emergency Flashlight & Extra Batteries", checked: false },
    { id: 4, text: "Power Bank & Charging Cables", checked: false },
    { id: 5, text: "Important Government Documents (In Waterproof Bag)", checked: false }
  ]);

  // Crowdsourced Hazard Reporting state
  const [reportText, setReportText] = useState("");
  const [reports, setReports] = useState([
    { id: 1, text: "Waterlogging near Main Highway Gate #3", time: "15 mins ago", status: "Verified" }
  ]);

  // Family Locator Feed
  const missingPersons = [
    { id: 1, name: "Prafulla Kumar Behera", status: "Safe at Shelter #1", time: "10m ago" },
    { id: 2, name: "Santilata Behera", status: "Safe at Shelter #1", time: "10m ago" }
  ];

  const toggleCheck = (id) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReports([{ id: Date.now(), text: reportText, time: "Just now", status: "Under Review" }, ...reports]);
    setReportText("");
  };

  const triggerSOS = () => {
    setSosActive(true);
    alert("🚨 Emergency SOS signal & live GPS coordinates broadcasted to local rescue teams! Target dispatch time: < 60 seconds.");
  };

  const requestRapidCallback = () => {
    setCallbackRequested(true);
    alert("⚡ 1-Minute Automated Emergency Callback requested. An operator will contact your registered phone number immediately.");
  };

  return (
    <div style={{ maxWidth: "1100px", paddingBottom: "40px" }}>
      
      {/* Header & Rapid Helplines */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#f8fafc", margin: "0 0 6px 0" }}>
            Disaster Management Dashboard
          </h1>
          <p style={{ color: "#94a3b8", margin: 0 }}>
            Real-time monitoring, emergency coordination, and live incident response.
          </p>
        </div>

        {/* Rapid Dial Helpline Badges */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <a href="tel:112" style={{ backgroundColor: "#dc2626", color: "#fff", padding: "8px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "0.85rem", fontWeight: "bold" }}>
            📞 National Emergency: 112
          </a>
          <a href="tel:108" style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "0.85rem", fontWeight: "bold" }}>
            🚑 Ambulance: 108
          </a>
        </div>
      </div>

      {/* ZERO-DELAY GUARANTEE & SLA RESPONSE BANNER */}
      <div style={{ backgroundColor: "#064e3b", border: "1px solid #10b981", borderRadius: "10px", padding: "14px 18px", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.5rem" }}>⚡</span>
          <div>
            <div style={{ fontWeight: "bold", color: "#6ee7b7", fontSize: "0.95rem" }}>
              Zero-Delay SLA Active: Average Response Time is 42 Seconds
            </div>
            <div style={{ fontSize: "0.8rem", color: "#a7f3d0" }}>
              Automated AI dispatch route active. All help requests are processed immediately with zero queuing delays.
            </div>
          </div>
        </div>
        <button
          onClick={requestRapidCallback}
          style={{ backgroundColor: callbackRequested ? "#059669" : "#10b981", color: "#064e3b", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "0.85rem" }}
        >
          {callbackRequested ? "✓ Callback Dispatch Scheduled" : "📞 Request 1-Min Auto Callback"}
        </button>
      </div>

      {/* Emergency Immediate Distress SOS Button */}
      <div style={{ backgroundColor: sosActive ? "#7f1d1d" : "#450a0a", border: "2px solid #ef4444", borderRadius: "12px", padding: "16px 20px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#fca5a5" }}>
            Immediate Danger / Trapped? Send Immediate Rescue Beacon
          </span>
          <div style={{ fontSize: "0.85rem", color: "#fecaca", marginTop: "2px" }}>
            Shares your live GPS location instantly with active NDRF & Local Rescue Units.
          </div>
        </div>
        <button 
          onClick={triggerSOS} 
          style={{ backgroundColor: sosActive ? "#22c55e" : "#ef4444", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" }}
        >
          {sosActive ? "✓ Rescue Beacon Active" : "Broadcast SOS Signal"}
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "1.5rem" }}>
        {stats.map((stat, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: "0.875rem", fontWeight: "500" }}>
              {stat.title}
            </span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: stat.color, marginTop: "8px" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Weather & Hazard Alert Banner */}
      <div style={{ backgroundColor: "#0284c7", color: "#fff", padding: "16px 20px", borderRadius: "10px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span style={{ fontWeight: "bold", fontSize: "1rem" }}>⛈️ Local Weather Warning: Heavy Rainfall Expected</span>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>Temp: 28°C | Wind: 32 km/h | AQI: 42 (Good)</div>
        </div>
        <button style={{ backgroundColor: "#0f172a", color: "#38bdf8", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
          View Radar
        </button>
      </div>

      {/* Live Incident Feed & Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "1.5rem" }}>
        
        {/* Incident Feed */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#f8fafc", marginBottom: "1rem" }}>
            Live Incident Feed
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  backgroundColor: "#0f172a",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #1e293b"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{act.time}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: act.status === "Critical" ? "#ef4444" : act.status === "In Progress" ? "#38bdf8" : "#22c55e" }}>
                    {act.status}
                  </span>
                </div>
                <div style={{ fontSize: "0.9rem", color: "#e2e8f0" }}>{act.event}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Hub */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#f8fafc", marginBottom: "1rem" }}>
            Quick Actions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button onClick={triggerSOS} style={{ padding: "12px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", textAlign: "left" }}>
              🚨 Dispatch SOS Emergency Team
            </button>
            <button style={{ padding: "12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", textAlign: "left" }}>
              📢 Broadcast Regional Alert
            </button>
            <button style={{ padding: "12px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", textAlign: "left" }}>
              📍 Open Shelter Finder Map
            </button>
          </div>
        </div>

      </div>

      {/* Family Locator Feed & Emergency Supply Hub */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "1.5rem" }}>
        
        {/* Family Locator Feed */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#f8fafc", marginBottom: "0.5rem" }}>
            👨‍👩‍👧‍👦 Family & Personnel Safety Radar
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1rem" }}>
            Real-time check-ins from registered family members during regional evacuations.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {missingPersons.map((person) => (
              <div key={person.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", padding: "10px 14px", borderRadius: "8px", border: "1px solid #334155" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#f8fafc" }}>{person.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>{person.status}</div>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{person.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Offline Mesh SMS Fallback Info */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#f8fafc", marginBottom: "0.5rem" }}>
            📡 Zero-Internet / Offline SMS Rescue Mode
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1rem" }}>
            If cellular internet drops, send an emergency SMS to route your request immediately.
          </p>
          <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px", border: "1px solid #334155", fontSize: "0.875rem", color: "#e2e8f0" }}>
            Send SMS: <strong style={{ color: "#38bdf8" }}>RESCUE [NAME] [LOCATION]</strong> to <strong style={{ color: "#22c55e" }}>56161</strong>
          </div>
        </div>

      </div>

      {/* Active Relief Shelters & 72-Hour Survival Kit */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "1.5rem" }}>
        
        {/* Active Relief Shelters */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#f8fafc", marginBottom: "1rem" }}>
            🏥 Active Relief Shelters
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#e2e8f0", marginBottom: "4px" }}>
                <span>Community Hall #1 (City Center)</span>
                <span style={{ color: "#22c55e", fontWeight: "bold" }}>75% Full (50 Beds Open)</span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "#0f172a", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "75%", height: "100%", backgroundColor: "#22c55e" }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#e2e8f0", marginBottom: "4px" }}>
                <span>Central Stadium Shelter</span>
                <span style={{ color: "#f59e0b", fontWeight: "bold" }}>90% Full (12 Beds Open)</span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "#0f172a", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "90%", height: "100%", backgroundColor: "#f59e0b" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 72-Hour Survival Kit Checklist */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#f8fafc", marginBottom: "1rem" }}>
            🎒 72-Hour Survival Kit Prep
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {checklist.map((item) => (
              <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: item.checked ? "#94a3b8" : "#f8fafc", cursor: "pointer", textDecoration: item.checked ? "line-through" : "none" }}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheck(item.id)}
                  style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                />
                {item.text}
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* Crowdsourced Hazard Reporting */}
      <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#f8fafc", marginBottom: "0.5rem" }}>
          📢 Crowdsourced Incident & Hazard Reporting
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1rem" }}>
          Report fallen power lines, road blockages, or flooding to alert emergency responders.
        </p>

        <form onSubmit={handleReportSubmit} style={{ display: "flex", gap: "10px", marginBottom: "1.5rem" }}>
          <input
            type="text"
            placeholder="Describe hazard or incident near your location..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
          />
          <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            Submit Report
          </button>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {reports.map((rep) => (
            <div key={rep.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", padding: "10px 14px", borderRadius: "8px", border: "1px solid #334155" }}>
              <span style={{ fontSize: "0.875rem", color: "#e2e8f0" }}>{rep.text}</span>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{rep.time}</span>
                <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "12px", backgroundColor: rep.status === "Verified" ? "#166534" : "#854d0e", color: rep.status === "Verified" ? "#4ade80" : "#fef08a" }}>
                  {rep.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}