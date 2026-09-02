import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { fetchLiveDisasterStats } from "../services/liveDisasterService";

// Free authoritative external open data sources
const OPEN_DATA_SOURCES = [
  {
    name: "USGS Real-Time Earthquake Hazards",
    icon: "🌍",
    url: "https://earthquake.usgs.gov/earthquakes/map/",
    desc: "Free real-time USGS global seismic monitoring & tsunami alerts",
    tag: "Free Open API",
  },
  {
    name: "GDACS Global Disaster Alerts",
    icon: "🚨",
    url: "https://www.gdacs.org",
    desc: "UN & European Commission automated multi-hazard alert system",
    tag: "UN OCHA / EC",
  },
  {
    name: "ReliefWeb Disaster Database",
    icon: "🌐",
    url: "https://reliefweb.int/disasters",
    desc: "Global humanitarian disaster impact statistics and field bulletins",
    tag: "United Nations",
  },
  {
    name: "EM-DAT International Disasters",
    icon: "📊",
    url: "https://www.emdat.be",
    desc: "Global disaster database of Centre for Research on the Epidemiology of Disasters",
    tag: "Open Statistics",
  },
  {
    name: "IMD Mausam Cyclone & Radar",
    icon: "🌀",
    url: "https://mausam.imd.gov.in",
    desc: "India Meteorological Department live cyclone tracks & satellite radar",
    tag: "Govt of India",
  },
  {
    name: "NDMA India Disaster Portal",
    icon: "🛡️",
    url: "https://ndma.gov.in",
    desc: "National Disaster Management Authority national vulnerability data",
    tag: "Official NDMA",
  },
];

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoSync, setAutoSync] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLiveDisasterStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn("Failed to load live statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    let interval = null;
    if (autoSync) {
      interval = setInterval(loadData, 45000); // 45 second live poll
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoSync]);

  const severityColor = (sev) => {
    if (sev === "Critical") return "#dc2626";
    if (sev === "High") return "#ea580c";
    if (sev === "Moderate") return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div style={{ padding: "20px", color: "#ffffff", minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "22px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800", color: "#f8fafc" }}>
              📊 Live Disaster Statistics & Global Intelligence
            </h1>
            <span style={{ backgroundColor: "#10b981", color: "#064e3b", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "999px", fontWeight: "700" }}>
              ● Live Feeds Active
            </span>
          </div>
          <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Real-world disaster metrics augmented with USGS Seismic Feeds, IMD Cyclones, and platform field logs.
          </p>
        </div>

        {/* Sync Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1e293b",
              color: "#38bdf8",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.82rem",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "⟳ Syncing..." : "↻ Refresh Live Data"}
          </button>
        </div>
      </div>

      {/* ── Top Metric Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Recorded Incidents", value: stats?.totalIncidents ?? "48", icon: "🚨", color: "#ef4444", change: "+4 today" },
          { label: "Active Emergency Alerts", value: stats?.activeAlerts ?? "12", icon: "⚠️", color: "#f59e0b", change: "Live monitoring" },
          { label: "Rescue & Shelter Centers", value: stats?.rescueShelters ?? "18", icon: "⛺", color: "#3b82f6", change: "Available 24/7" },
          { label: "Citizens Assisted & Evacuated", value: stats?.peopleAssisted?.toLocaleString() ?? "3,420", icon: "👥", color: "#10b981", change: "Across 6 districts" },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "14px",
              border: "1px solid #334155",
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1.6rem" }}>{card.icon}</span>
              <span style={{ fontSize: "0.72rem", color: card.color, fontWeight: "700", backgroundColor: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "999px" }}>
                {card.change}
              </span>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#ffffff" }}>
              {card.value}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: "500" }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px", marginBottom: "24px" }}>
        {/* Disaster Type Bar Chart */}
        <div style={{ backgroundColor: "#1e293b", padding: "22px", borderRadius: "16px", border: "1px solid #334155" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
                📈 Incident Frequency by Disaster Category
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                Aggregated distribution of severe hazards
              </p>
            </div>
          </div>

          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.breakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="disaster" stroke="#94a3b8" fontSize={12} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                  formatter={(val, name, item) => [`${val} Total Cases (${item.payload.active} Active)`, "Incidents"]}
                />
                <Bar dataKey="cases" radius={[6, 6, 0, 0]}>
                  {(stats?.breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie Chart */}
        <div style={{ backgroundColor: "#1e293b", padding: "22px", borderRadius: "16px", border: "1px solid #334155" }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
            🎯 Severity Level Matrix
          </h2>
          <p style={{ margin: "4px 0 16px 0", color: "#64748b", fontSize: "0.8rem" }}>
            Active mission escalation levels
          </p>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.severitySplit || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.severitySplit || []).map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                  formatter={(val) => [`${val} Incidents`, "Count"]}
                />
                <Legend formatter={(val) => <span style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 24-Hour Incident & Response Trend ── */}
      <div style={{ backgroundColor: "#1e293b", padding: "22px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
          ⏱️ 24-Hour Incident Occurrence vs. Rescue Resolutions
        </h2>
        <p style={{ margin: "4px 0 16px 0", color: "#64748b", fontSize: "0.8rem" }}>
          Hourly emergency triage volume
        </p>

        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.trendData || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incidentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
              <Legend formatter={(val) => <span style={{ color: "#cbd5e1", fontSize: "0.82rem" }}>{val}</span>} />
              <Area type="monotone" dataKey="incidents" name="Reported Incidents" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#incidentGrad)" />
              <Area type="monotone" dataKey="resolved" name="Resolved / Rescued" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#resolvedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Live Disaster Incident Feed Table ── */}
      <div style={{ backgroundColor: "#1e293b", padding: "22px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
              📡 Live Verified Disaster Feeds & Global Seismicity
            </h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.8rem" }}>
              Real-time events streamed from USGS Seismic Feeds & Emergency Dispatch
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                <th style={{ padding: "10px 12px" }}>Event / Bulletin</th>
                <th style={{ padding: "10px 12px" }}>Category</th>
                <th style={{ padding: "10px 12px" }}>Location</th>
                <th style={{ padding: "10px 12px" }}>Severity</th>
                <th style={{ padding: "10px 12px" }}>Status</th>
                <th style={{ padding: "10px 12px" }}>Source / Link</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentLiveFeeds || []).map((feed, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #1f293d", backgroundColor: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#f1f5f9" }}>{feed.title}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ backgroundColor: "#0f172a", border: "1px solid #334155", padding: "2px 8px", borderRadius: "6px", fontSize: "0.78rem" }}>
                      {feed.category}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#cbd5e1" }}>📍 {feed.location}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ color: severityColor(feed.severity), fontWeight: "700", fontSize: "0.82rem" }}>
                      ● {feed.severity}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#94a3b8" }}>{feed.status}</td>
                  <td style={{ padding: "12px" }}>
                    {feed.externalUrl ? (
                      <a href={feed.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", textDecoration: "underline", fontSize: "0.8rem" }}>
                        View Live Source ↗
                      </a>
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>{feed.source}</span>
                    )}
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
          🌐 Authoritative Open Data Sources & Disaster Archives
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {OPEN_DATA_SOURCES.map((src, i) => (
            <a
              key={i}
              href={src.url}
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
                transition: "transform 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#334155";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1.3rem" }}>{src.icon}</span>
                <span style={{ fontSize: "0.72rem", backgroundColor: "#0f172a", color: "#38bdf8", padding: "2px 8px", borderRadius: "999px", fontWeight: "700", border: "1px solid #334155" }}>
                  {src.tag} ↗
                </span>
              </div>
              <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{src.name}</strong>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.4" }}>{src.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}