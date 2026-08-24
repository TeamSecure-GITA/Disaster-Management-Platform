import React from "react";

function Analytics() {
  const statistics = [
    {
      title: "Total Incidents",
      value: "128",
      icon: "🚨",
    },
    {
      title: "People Affected",
      value: "2,540",
      icon: "👥",
    },
    {
      title: "Active Shelters",
      value: "24",
      icon: "🏠",
    },
    {
      title: "Rescue Requests",
      value: "86",
      icon: "🚑",
    },
  ];

  const disasters = [
    {
      name: "Flood",
      count: 48,
      percentage: 75,
      icon: "🌊",
    },
    {
      name: "Cyclone",
      count: 31,
      percentage: 55,
      icon: "🌀",
    },
    {
      name: "Earthquake",
      count: 19,
      percentage: 40,
      icon: "🏚️",
    },
    {
      name: "Fire",
      count: 30,
      percentage: 50,
      icon: "🔥",
    },
  ];

  const reports = [
    {
      id: 1,
      type: "Flood",
      location: "Bhubaneswar",
      severity: "High",
      status: "Active",
    },
    {
      id: 2,
      type: "Cyclone",
      location: "Puri",
      severity: "Medium",
      status: "Monitoring",
    },
    {
      id: 3,
      type: "Fire",
      location: "Cuttack",
      severity: "High",
      status: "Response",
    },
    {
      id: 4,
      type: "Earthquake",
      location: "Balasore",
      severity: "Low",
      status: "Resolved",
    },
  ];

  return (
    <div className="analytics-page">
      <h1>📊 Disaster Analytics & Reports</h1>

      <p>
        Overview of disaster incidents, affected people,
        shelters, and emergency response activity.
      </p>

      {/* Statistics */}

      <div className="analytics-stats">
        {statistics.map((stat) => (
          <div className="analytics-stat-card" key={stat.title}>
            <div className="analytics-stat-icon">
              {stat.icon}
            </div>

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
          {disasters.map((disaster) => (
            <div
              className="disaster-breakdown-card"
              key={disaster.name}
            >
              <div className="breakdown-header">
                <span>
                  {disaster.icon} {disaster.name}
                </span>

                <strong>{disaster.count}</strong>
              </div>

              <div className="progress-background">
                <div
                  className="progress-value"
                  style={{
                    width: `${disaster.percentage}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports */}

      <div className="analytics-section">
        <h2>📋 Recent Incident Reports</h2>

        <div className="reports-table">
          <div className="report-row report-heading">
            <span>Disaster</span>
            <span>Location</span>
            <span>Severity</span>
            <span>Status</span>
          </div>

          {reports.map((report) => (
            <div className="report-row" key={report.id}>
              <span>{report.type}</span>
              <span>📍 {report.location}</span>

              <span
                className={`severity ${report.severity.toLowerCase()}`}
              >
                {report.severity}
              </span>

              <span>{report.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report Button */}

      <button
        className="generate-report-btn"
        onClick={() =>
          alert(
            "Report generation will be connected to the backend later."
          )
        }
      >
        📄 Generate Report
      </button>
    </div>
  );
}

export default Analytics;