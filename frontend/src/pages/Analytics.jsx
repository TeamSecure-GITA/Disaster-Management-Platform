import React, { useState } from "react";

const STATISTICS = [
  { title: "Total Incidents",   value: "128",   icon: "🚨" },
  { title: "People Affected",   value: "2,540", icon: "👥" },
  { title: "Active Shelters",   value: "24",    icon: "🏠" },
  { title: "Rescue Requests",   value: "86",    icon: "🚑" },
];

const DISASTERS = [
  { name: "Flood",      count: 48, percentage: 75, icon: "🌊", color: "#3b82f6" },
  { name: "Cyclone",    count: 31, percentage: 55, icon: "🌀", color: "#8b5cf6" },
  { name: "Earthquake", count: 19, percentage: 40, icon: "🏚️", color: "#f59e0b" },
  { name: "Fire",       count: 30, percentage: 50, icon: "🔥", color: "#ef4444" },
];

const REPORTS = [
  { id: 1, type: "Flood",      location: "Bhubaneswar", severity: "High",   status: "Active",     date: "2026-08-30" },
  { id: 2, type: "Cyclone",    location: "Puri",        severity: "Medium",  status: "Monitoring", date: "2026-08-29" },
  { id: 3, type: "Fire",       location: "Cuttack",     severity: "High",    status: "Response",   date: "2026-08-29" },
  { id: 4, type: "Earthquake", location: "Balasore",    severity: "Low",     status: "Resolved",   date: "2026-08-28" },
];

function Analytics() {
  const [generating, setGenerating] = useState(false);

  // ── Generate a real downloadable CSV + HTML report ────────────────────────
  const generateReport = () => {
    setGenerating(true);

    // Build CSV content
    const csvRows = [
      ["Disaster Management Platform — Incident Report"],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ["# Summary Statistics"],
      ["Metric", "Value"],
      ...STATISTICS.map((s) => [s.title, s.value]),
      [],
      ["# Disaster Type Breakdown"],
      ["Type", "Incidents", "% of Total"],
      ...DISASTERS.map((d) => [d.name, d.count, `${d.percentage}%`]),
      [],
      ["# Recent Incident Reports"],
      ["ID", "Disaster Type", "Location", "Severity", "Status", "Date"],
      ...REPORTS.map((r) => [r.id, r.type, r.location, r.severity, r.status, r.date]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `disaster_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also open a printable HTML report in a new tab
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Disaster Management Report — ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; color: #1e293b; }
          h1 { color: #dc2626; } h2 { color: #1d4ed8; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #1e293b; color: white; padding: 10px; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
          .stat-card { background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 2rem; font-weight: bold; color: #1d4ed8; }
          .high { color: #dc2626; } .medium { color: #d97706; } .low { color: #16a34a; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>🛡️ Disaster Management Platform</h1>
        <p><strong>Report Date:</strong> ${new Date().toLocaleString()}</p>
        <h2>📊 Summary Statistics</h2>
        <div class="stat-grid">
          ${STATISTICS.map((s) => `<div class="stat-card">${s.icon}<div class="stat-value">${s.value}</div><div>${s.title}</div></div>`).join("")}
        </div>
        <h2>📈 Disaster Type Breakdown</h2>
        <table>
          <tr><th>Type</th><th>Incidents</th><th>Percentage</th></tr>
          ${DISASTERS.map((d) => `<tr><td>${d.icon} ${d.name}</td><td>${d.count}</td><td>${d.percentage}%</td></tr>`).join("")}
        </table>
        <h2>📋 Recent Incident Reports</h2>
        <table>
          <tr><th>Type</th><th>Location</th><th>Severity</th><th>Status</th><th>Date</th></tr>
          ${REPORTS.map((r) => `<tr><td>${r.type}</td><td>📍 ${r.location}</td><td class="${r.severity.toLowerCase()}">${r.severity}</td><td>${r.status}</td><td>${r.date}</td></tr>`).join("")}
        </table>
        <button onclick="window.print()" style="background:#1d4ed8;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-size:1rem;">🖨️ Print Report</button>
      </body>
      </html>`;

    const printBlob = new Blob([html], { type: "text/html" });
    const printUrl = URL.createObjectURL(printBlob);
    window.open(printUrl, "_blank");

    setTimeout(() => setGenerating(false), 1500);
  };

  return (
    <div className="analytics-page">
      <h1>📊 Disaster Analytics & Reports</h1>
      <p>Overview of disaster incidents, affected people, shelters, and emergency response activity.</p>

      {/* Statistics */}
      <div className="analytics-stats">
        {STATISTICS.map((stat) => (
          <div className="analytics-stat-card" key={stat.title}>
            <div className="analytics-stat-icon">{stat.icon}</div>
            <div>
              <h2>{stat.value}</h2>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Disaster Breakdown */}
      <div className="analytics-section">
        <h2>📈 Disaster Type Breakdown</h2>
        <div className="disaster-breakdown">
          {DISASTERS.map((disaster) => (
            <div className="disaster-breakdown-card" key={disaster.name}>
              <div className="breakdown-header">
                <span>{disaster.icon} {disaster.name}</span>
                <strong>{disaster.count} incidents</strong>
              </div>
              <div className="progress-background">
                <div
                  className="progress-value"
                  style={{ width: `${disaster.percentage}%`, backgroundColor: disaster.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="analytics-section">
        <h2>📋 Recent Incident Reports</h2>
        <div className="reports-table">
          <div className="report-row report-heading">
            <span>Disaster</span>
            <span>Location</span>
            <span>Severity</span>
            <span>Status</span>
          </div>
          {REPORTS.map((report) => (
            <div className="report-row" key={report.id}>
              <span>{report.type}</span>
              <span>📍 {report.location}</span>
              <span className={`severity ${report.severity.toLowerCase()}`}>{report.severity}</span>
              <span>{report.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Report — downloads CSV + opens printable HTML */}
      <button
        className="generate-report-btn"
        onClick={generateReport}
        disabled={generating}
        style={{ opacity: generating ? 0.7 : 1, cursor: generating ? "wait" : "pointer" }}
      >
        {generating ? "⏳ Generating..." : "📄 Download Report (CSV + Printable)"}
      </button>
    </div>
  );
}

export default Analytics;