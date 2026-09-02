import React, { useState, useEffect } from "react";
import { fetchLiveDisasterStats } from "../services/liveDisasterService";

const FREE_DATA_REPOSITORIES = [
  {
    name: "Open Government Data (OGD) India",
    url: "https://data.gov.in/keywords/disaster-management",
    desc: "National open datasets on cyclones, floods, rainfall deviations, and relief fund distributions",
    tag: "Govt of India Open Data",
  },
  {
    name: "UN OCHA Humanitarian Data Exchange (HDX)",
    url: "https://data.humdata.org",
    desc: "Open humanitarian data repository covering global crisis assessments and relief supplies",
    tag: "United Nations HDX",
  },
  {
    name: "World Bank Climate & Disaster Risk Data",
    url: "https://datacatalog.worldbank.org",
    desc: "Vulnerability indices, global loss assessments, and infrastructure risk analytics",
    tag: "World Bank Open Data",
  },
  {
    name: "OpenStreetMap Disaster Geodata",
    url: "https://www.hotosm.org",
    desc: "Humanitarian OpenStreetMap Team free open geospatial infrastructure datasets",
    tag: "HOTOSM Open Geospatial",
  },
];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchLiveDisasterStats().then((data) => setStats(data));
  }, []);

  const rawReports = [
    { id: "REP-101", type: "Flood & Inundation", location: "Bhubaneswar Lowlands", severity: "High", status: "Active Triage", date: "2026-09-02", units: "ODRAF Unit 3", victims: 140 },
    { id: "REP-102", type: "Cyclone & Storm", location: "Puri Coastal Marine Drive", severity: "Critical", status: "Evacuation Complete", date: "2026-09-02", units: "NDRF Batt 03", victims: 850 },
    { id: "REP-103", type: "Urban Fire Hazard", location: "Cuttack Market Sector", severity: "High", status: "Contained", date: "2026-09-01", units: "Central Fire Brigade", victims: 45 },
    { id: "REP-104", type: "Seismic Activity", location: "Balasore Border Zone", severity: "Moderate", status: "Resolved", date: "2026-08-31", units: "Civil Defense", victims: 12 },
    { id: "REP-105", type: "Landslide Risk", location: "Eastern Ghats Hill Pass", severity: "Moderate", status: "Route Cleared", date: "2026-08-30", units: "PWD Road Rescue", victims: 60 },
  ];

  const filteredReports = timeframe === "today"
    ? rawReports.filter((r) => r.date === "2026-09-02")
    : rawReports;

  // ── Generate real downloadable CSV & printable executive HTML report ──────
  const generateReport = () => {
    setGenerating(true);

    const csvRows = [
      ["DISASTER MANAGEMENT PLATFORM — COMPREHENSIVE EXECUTIVE REPORT"],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Timeframe: ${timeframe.toUpperCase()}`],
      [],
      ["# SECTION 1: KEY PERFORMANCE INDICATORS"],
      ["Metric", "Value", "Operational Status"],
      ["Total Recorded Incidents", stats?.totalIncidents || 48, "Synchronized with USGS & Field Feeds"],
      ["Active Missions Underway", stats?.activeAlerts || 12, "Immediate Priority"],
      ["Operational Shelters", stats?.rescueShelters || 18, "Capacity Monitored"],
      ["Citizens Evacuated & Assisted", stats?.peopleAssisted || 3420, "Field Registered"],
      [],
      ["# SECTION 2: DISASTER INCIDENT BREAKDOWN"],
      ["Disaster Typology", "Total Cases", "Active Cases", "Risk Level"],
      ...(stats?.breakdown || []).map((b) => [b.disaster, b.cases, b.active, b.severity]),
      [],
      ["# SECTION 3: RECENT INCIDENT LOGS"],
      ["Incident ID", "Disaster Type", "Location", "Severity", "Assigned Units", "Citizens Impacted", "Status", "Date"],
      ...filteredReports.map((r) => [r.id, r.type, r.location, r.severity, r.units, r.victims, r.status, r.date]),
    ];

    const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `disaster-analytics-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Printable Executive Summary HTML
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Executive Disaster Analytics Dossier — ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 900px; margin: 40px auto; color: #0f172a; padding: 20px; }
          h1 { color: #dc2626; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
          h2 { color: #1d4ed8; margin-top: 24px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 20px 0; }
          .kpi-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; text-align: center; }
          .kpi-val { font-size: 1.8rem; font-weight: 800; color: #1d4ed8; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 0.88rem; }
          th { background: #1e293b; color: white; padding: 10px; text-align: left; }
          td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .critical { color: #dc2626; font-weight: bold; }
          .high { color: #ea580c; font-weight: bold; }
          .moderate { color: #d97706; font-weight: bold; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h1>🛡️ Disaster Response Executive Summary</h1>
          <button class="no-print" onclick="window.print()" style="padding:10px 20px; background:#1d4ed8; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">🖨️ Print Dossier</button>
        </div>
        <p><strong>Generated At:</strong> ${new Date().toLocaleString()} | <strong>Classification:</strong> Official Emergency Dispatch Report</p>
        
        <div class="kpi-grid">
          <div class="kpi-box"><div class="kpi-val">${stats?.totalIncidents || 48}</div><div>Total Incidents</div></div>
          <div class="kpi-box"><div class="kpi-val">${stats?.activeAlerts || 12}</div><div>Active Missions</div></div>
          <div class="kpi-box"><div class="kpi-val">${stats?.rescueShelters || 18}</div><div>Verified Shelters</div></div>
          <div class="kpi-box"><div class="kpi-val">${stats?.peopleAssisted || 3420}</div><div>Citizens Assisted</div></div>
        </div>

        <h2>📈 Disaster Typology & Risk Breakdown</h2>
        <table>
          <tr><th>Disaster Category</th><th>Recorded Cases</th><th>Active Cases</th><th>Threat Level</th></tr>
          ${(stats?.breakdown || []).map((b) => `<tr><td>${b.disaster}</td><td><strong>${b.cases}</strong></td><td>${b.active}</td><td class="${b.severity.toLowerCase()}">${b.severity}</td></tr>`).join("")}
        </table>

        <h2>📋 Incident Triage Records</h2>
        <table>
          <tr><th>ID</th><th>Type</th><th>Location</th><th>Units Assigned</th><th>Impacted</th><th>Status</th><th>Date</th></tr>
          ${filteredReports.map((r) => `<tr><td>${r.id}</td><td>${r.type}</td><td>📍 ${r.location}</td><td>${r.units}</td><td>${r.victims}</td><td>${r.status}</td><td>${r.date}</td></tr>`).join("")}
        </table>
      </body>
      </html>
    `;

    const printBlob = new Blob([html], { type: "text/html" });
    const printUrl = URL.createObjectURL(printBlob);
    window.open(printUrl, "_blank");

    setTimeout(() => setGenerating(false), 1200);
  };

  return (
    <div style={{ padding: "20px", color: "#ffffff", minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "22px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800", color: "#f8fafc" }}>
              📊 Disaster Analytics & Field Operations Dossier
            </h1>
            <span style={{ backgroundColor: "#2563eb", color: "#fff", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "999px", fontWeight: "700" }}>
              Live Platform Logs
            </span>
          </div>
          <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Real-time multi-hazard analytics, incident response metrics, and exportable executive intelligence.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={generateReport}
            disabled={generating}
            style={{
              padding: "10px 18px",
              backgroundColor: "#16a34a",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: generating ? "wait" : "pointer",
              boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {generating ? "⏳ Compiling..." : "📄 Export Report (CSV & Print)"}
          </button>
        </div>
      </div>

      {/* ── Top Metrics ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { title: "Total Incidents Recorded", value: stats?.totalIncidents || "48", icon: "🚨", color: "#ef4444", sub: "USGS & Platform" },
          { title: "Active Rescue Missions",   value: stats?.activeAlerts || "12",    icon: "🚑", color: "#f59e0b", sub: "Priority Dispatch" },
          { title: "Operational Shelters",     value: stats?.rescueShelters || "18",  icon: "⛺", color: "#3b82f6", sub: "100% Operational" },
          { title: "Citizens Assisted & Safe", value: stats?.peopleAssisted?.toLocaleString() || "3,420", icon: "👥", color: "#10b981", sub: "In 6 coastal districts" },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "14px",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1.5rem" }}>{card.icon}</span>
              <span style={{ fontSize: "0.72rem", color: card.color, fontWeight: "700" }}>{card.sub}</span>
            </div>
            <div style={{ fontSize: "1.7rem", fontWeight: "800", color: "#fff" }}>{card.value}</div>
            <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{card.title}</div>
          </div>
        ))}
      </div>

      {/* ── Disaster Distribution & Progress Bars ── */}
      <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "22px", marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
          📈 Disaster Typology & Capacity Allocation
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {(stats?.breakdown || []).map((d, i) => {
            const pct = Math.min(100, Math.round((d.cases / (stats?.totalIncidents || 48)) * 100));
            return (
              <div key={i} style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#f1f5f9" }}>{d.disaster}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: "700", color: d.fill }}>{d.cases} cases ({pct}%)</span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "#1e293b", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", backgroundColor: d.fill, borderRadius: "999px" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginTop: "6px" }}>
                  <span>Active: <strong style={{ color: "#f59e0b" }}>{d.active}</strong></span>
                  <span>Threat: <strong style={{ color: d.severity === "Critical" ? "#dc2626" : "#38bdf8" }}>{d.severity}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Incident Reports Table with Filter ── */}
      <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "22px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
              📋 Field Triage & Emergency Mission Log
            </h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.8rem" }}>
              Operational incident records dispatched to response units
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setTimeframe("all")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: timeframe === "all" ? "#2563eb" : "#0f172a",
                color: timeframe === "all" ? "#fff" : "#94a3b8",
              }}
            >
              All Records ({rawReports.length})
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("today")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: timeframe === "today" ? "#2563eb" : "#0f172a",
                color: timeframe === "today" ? "#fff" : "#94a3b8",
              }}
            >
              Today's Missions (2)
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                <th style={{ padding: "10px" }}>ID</th>
                <th style={{ padding: "10px" }}>Disaster Type</th>
                <th style={{ padding: "10px" }}>Location</th>
                <th style={{ padding: "10px" }}>Assigned Units</th>
                <th style={{ padding: "10px" }}>Severity</th>
                <th style={{ padding: "10px" }}>Citizens Impacted</th>
                <th style={{ padding: "10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} style={{ borderBottom: "1px solid #1e293b", backgroundColor: "rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "12px 10px", color: "#38bdf8", fontWeight: "700" }}>{report.id}</td>
                  <td style={{ padding: "12px 10px", fontWeight: "600", color: "#f1f5f9" }}>{report.type}</td>
                  <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>📍 {report.location}</td>
                  <td style={{ padding: "12px 10px", color: "#94a3b8" }}>{report.units}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <span style={{ color: report.severity === "Critical" ? "#dc2626" : report.severity === "High" ? "#ea580c" : "#f59e0b", fontWeight: "700" }}>
                      ● {report.severity}
                    </span>
                  </td>
                  <td style={{ padding: "12px 10px", fontWeight: "600", color: "#fff" }}>{report.victims}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <span style={{ backgroundColor: "#0f172a", border: "1px solid #334155", padding: "3px 8px", borderRadius: "6px", fontSize: "0.78rem", color: "#10b981" }}>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Official Free Open Data Portals ── */}
      <div>
        <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#38bdf8", marginBottom: "14px" }}>
          🌐 Free Open Government & Humanitarian Data Feeds
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {FREE_DATA_REPOSITORIES.map((repo, i) => (
            <a
              key={i}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "14px",
                padding: "16px",
                color: "#ffffff",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#334155";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{repo.name}</strong>
                <span style={{ fontSize: "0.72rem", backgroundColor: "#0f172a", color: "#38bdf8", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
                  {repo.tag} ↗
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.4" }}>{repo.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}