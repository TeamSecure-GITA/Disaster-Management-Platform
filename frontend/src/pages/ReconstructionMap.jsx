// ─────────────────────────────────────────────────────────────────────────────
// src/pages/ReconstructionMap.jsx
//
// Reconstruction Progress Timelines
// Public interactive map showing post-disaster rebuilding status per district,
// category breakdown, accountability tracker, and progress timelines.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";

const CATEGORIES = [
  { id: "power",    label: "⚡ Power Grid",      color: "#fbbf24" },
  { id: "water",    label: "💧 Water Supply",     color: "#38bdf8" },
  { id: "roads",    label: "🛣️ Roads & Bridges",  color: "#94a3b8" },
  { id: "schools",  label: "🏫 Schools",          color: "#a78bfa" },
  { id: "hospitals",label: "🏥 Hospitals",        color: "#f97316" },
  { id: "housing",  label: "🏠 Housing",          color: "#34d399" },
];

const DISTRICTS = [
  {
    id: "central", name: "Central District", color: "#60a5fa",
    overall: 72, population: 45000, affectedFamilies: 1840,
    lastUpdated: "2026-09-13",
    responsible: "District Collector Ramesh T.",
    progress: { power: 90, water: 85, roads: 70, schools: 55, hospitals: 80, housing: 48 },
    timeline: [
      { date: "Sep 10", event: "Disaster struck — power, roads down",         status: "done",    category: "power"  },
      { date: "Sep 11", event: "Emergency generators deployed",               status: "done",    category: "power"  },
      { date: "Sep 12", event: "NH-16 partially cleared",                     status: "done",    category: "roads"  },
      { date: "Sep 13", event: "Grid restoration 70% complete",               status: "done",    category: "power"  },
      { date: "Sep 15", event: "Full power restoration target",               status: "pending", category: "power"  },
      { date: "Sep 18", event: "All schools reopened (target)",               status: "pending", category: "schools"},
      { date: "Sep 25", event: "Road reconstruction complete",                status: "pending", category: "roads"  },
    ],
  },
  {
    id: "north", name: "North District", color: "#34d399",
    overall: 45, population: 32000, affectedFamilies: 2100,
    lastUpdated: "2026-09-13",
    responsible: "Sub-Collector Anjali P.",
    progress: { power: 55, water: 40, roads: 35, schools: 20, hospitals: 65, housing: 25 },
    timeline: [
      { date: "Sep 10", event: "Floods inundated 3 wards",                  status: "done",    category: "water"  },
      { date: "Sep 11", event: "NDRF teams deployed",                        status: "done",    category: "roads"  },
      { date: "Sep 13", event: "Water pumping operations begun",             status: "done",    category: "water"  },
      { date: "Sep 16", event: "Pumping complete — roads accessible",        status: "pending", category: "roads"  },
      { date: "Sep 20", event: "Water supply restoration target",            status: "pending", category: "water"  },
      { date: "Oct 1",  event: "Housing assessment complete",                status: "pending", category: "housing"},
      { date: "Oct 15", event: "Temporary housing for all families",         status: "pending", category: "housing"},
    ],
  },
  {
    id: "east", name: "East District", color: "#f97316",
    overall: 60, population: 28000, affectedFamilies: 980,
    lastUpdated: "2026-09-13",
    responsible: "BDO Kumar S.",
    progress: { power: 75, water: 70, roads: 60, schools: 50, hospitals: 55, housing: 52 },
    timeline: [
      { date: "Sep 10", event: "Landslide blocked NH-55",                    status: "done",    category: "roads"  },
      { date: "Sep 12", event: "Alternate route opened",                     status: "done",    category: "roads"  },
      { date: "Sep 13", event: "Power restored to 75% homes",               status: "done",    category: "power"  },
      { date: "Sep 14", event: "School damage assessment",                   status: "pending", category: "schools"},
      { date: "Sep 17", event: "All schools reopened",                       status: "pending", category: "schools"},
      { date: "Sep 22", event: "NH-55 fully cleared",                        status: "pending", category: "roads"  },
      { date: "Oct 5",  event: "All housing repairs complete",               status: "pending", category: "housing"},
    ],
  },
  {
    id: "west", name: "West District", color: "#a78bfa",
    overall: 85, population: 20000, affectedFamilies: 320,
    lastUpdated: "2026-09-13",
    responsible: "Tehsildar Meena R.",
    progress: { power: 95, water: 90, roads: 88, schools: 80, hospitals: 88, housing: 78 },
    timeline: [
      { date: "Sep 10", event: "Minor flooding — 2 wards affected",          status: "done",    category: "water"  },
      { date: "Sep 11", event: "Pumping complete",                           status: "done",    category: "water"  },
      { date: "Sep 12", event: "Power fully restored",                       status: "done",    category: "power"  },
      { date: "Sep 13", event: "Roads cleared, schools open",                status: "done",    category: "roads"  },
      { date: "Sep 14", event: "Hospital operations normal",                 status: "pending", category: "hospitals"},
      { date: "Sep 18", event: "All reconstruction complete (est.)",         status: "pending", category: "housing"},
    ],
  },
  {
    id: "south", name: "South District", color: "#ef4444",
    overall: 28, population: 38000, affectedFamilies: 3200,
    lastUpdated: "2026-09-13",
    responsible: "District Collector Anand V.",
    progress: { power: 30, water: 20, roads: 25, schools: 10, hospitals: 40, housing: 15 },
    timeline: [
      { date: "Sep 10", event: "Category 5 impact — severe damage",          status: "done",    category: "power"  },
      { date: "Sep 11", event: "NDRF + Army deployed",                       status: "done",    category: "roads"  },
      { date: "Sep 12", event: "Rescue ops in progress",                     status: "done",    category: "roads"  },
      { date: "Sep 20", event: "Emergency power to hospitals (target)",      status: "pending", category: "hospitals"},
      { date: "Sep 25", event: "Primary roads cleared (target)",             status: "pending", category: "roads"  },
      { date: "Oct 10", event: "Water supply partial restoration",           status: "pending", category: "water"  },
      { date: "Nov 1",  event: "Full reconstruction phase 1 start",          status: "pending", category: "housing"},
    ],
  },
];

function ProgressBar({ value, color, showLabel = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: "4px", transition: "width 0.6s" }} />
      </div>
      {showLabel && <span style={{ fontSize: "0.7rem", fontWeight: "700", color, minWidth: "32px" }}>{value}%</span>}
    </div>
  );
}

const timelineCatColor = (cat) => (CATEGORIES.find(c => c.id === cat)?.color || "#94a3b8");

export default function ReconstructionMap() {
  const [selected, setSelected]  = useState(DISTRICTS[0]);
  const [activeView, setActiveView] = useState("overview");

  const overallAvg = Math.round(DISTRICTS.reduce((acc, d) => acc + d.overall, 0) / DISTRICTS.length);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#020617,#0c1526,#071220)", color: "#e2e8f0", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
        <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "linear-gradient(135deg,#1e40af,#1e3a8a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: "0 4px 20px rgba(30,64,175,0.4)" }}>🏗️</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", background: "linear-gradient(90deg,#60a5fa,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Reconstruction Progress</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Public accountability tracker · Real-time rebuilding status · Post-disaster recovery timelines</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#60a5fa" }}>{overallAvg}%</div>
          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Overall District Recovery</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Affected Families", value: DISTRICTS.reduce((acc, d) => acc + d.affectedFamilies, 0).toLocaleString(), icon: "👨‍👩‍👧", color: "#f97316" },
          { label: "Districts Recovering",    value: `${DISTRICTS.length} / ${DISTRICTS.length}`, icon: "🗺️", color: "#60a5fa" },
          { label: "Recovery > 70%",          value: DISTRICTS.filter(d => d.overall >= 70).length, icon: "✅", color: "#34d399" },
          { label: "Critical Districts",      value: DISTRICTS.filter(d => d.overall < 40).length, icon: "🚨", color: "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px", backdropFilter: "blur(10px)" }}>
            <div style={{ fontSize: "1.3rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px" }}>
        {/* District list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {DISTRICTS.map(d => {
            const critColor = d.overall >= 70 ? "#34d399" : d.overall >= 50 ? "#fbbf24" : d.overall >= 30 ? "#f97316" : "#ef4444";
            return (
              <div key={d.id} onClick={() => setSelected(d)} style={{
                background: selected.id === d.id ? `rgba(${d.id === "central" ? "96,165,250" : d.id === "north" ? "52,211,153" : d.id === "east" ? "249,115,22" : d.id === "west" ? "167,139,250" : "239,68,68"},0.12)` : "rgba(15,23,42,0.7)",
                border: `1.5px solid ${selected.id === d.id ? d.color + "60" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "12px", padding: "14px 16px", cursor: "pointer", transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "700", fontSize: "0.88rem", color: selected.id === d.id ? d.color : "#e2e8f0" }}>{d.name}</span>
                  <span style={{ fontWeight: "800", fontSize: "0.9rem", color: critColor }}>{d.overall}%</span>
                </div>
                <ProgressBar value={d.overall} color={critColor} />
                <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: "5px" }}>{d.affectedFamilies.toLocaleString()} families · Updated {d.lastUpdated}</div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
            {[["overview","📊 Overview"], ["timeline","📅 Timeline"]].map(([id, lbl]) => (
              <button key={id} onClick={() => setActiveView(id)} style={{
                padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "0.83rem",
                background: activeView === id ? "linear-gradient(135deg,#1e40af,#1e3a8a)" : "rgba(255,255,255,0.05)",
                color: activeView === id ? "#fff" : "#94a3b8", transition: "all 0.15s",
              }}>{lbl}</button>
            ))}
          </div>

          {activeView === "overview" ? (
            <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: "800", color: selected.color }}>{selected.name}</h2>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Responsible: {selected.responsible}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "2.2rem", fontWeight: "800", color: selected.overall >= 70 ? "#34d399" : selected.overall >= 50 ? "#fbbf24" : "#ef4444" }}>{selected.overall}%</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Overall Recovery</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {CATEGORIES.map(cat => (
                  <div key={cat.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{cat.label}</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: "700", color: cat.color }}>{selected.progress[cat.id]}%</span>
                    </div>
                    <ProgressBar value={selected.progress[cat.id]} color={cat.color} showLabel={false} />
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "20px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px" }}>
                  <div style={{ fontSize: "0.68rem", color: "#475569", marginBottom: "3px" }}>Population</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#60a5fa" }}>{selected.population.toLocaleString()}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px" }}>
                  <div style={{ fontSize: "0.68rem", color: "#475569", marginBottom: "3px" }}>Affected Families</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f97316" }}>{selected.affectedFamilies.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", backdropFilter: "blur(10px)" }}>
              <h3 style={{ margin: "0 0 18px", fontSize: "0.88rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>📅 {selected.name} — Recovery Timeline</h3>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "20px", top: 0, bottom: 0, width: "2px", background: "rgba(255,255,255,0.06)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {selected.timeline.map((event, i) => {
                    const evtColor = timelineCatColor(event.category);
                    return (
                      <div key={i} style={{ display: "flex", gap: "16px", paddingLeft: "0", marginBottom: "2px" }}>
                        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", width: "42px" }}>
                          <div style={{
                            width: "14px", height: "14px", borderRadius: "50%", marginTop: "18px",
                            backgroundColor: event.status === "done" ? evtColor : "transparent",
                            border: `2px solid ${event.status === "done" ? evtColor : "#374151"}`,
                            flexShrink: 0,
                          }} />
                        </div>
                        <div style={{
                          flex: 1, padding: "12px 14px", borderRadius: "10px", marginBottom: "8px",
                          background: event.status === "done" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${event.status === "done" ? evtColor + "30" : "rgba(255,255,255,0.05)"}`,
                          opacity: event.status === "done" ? 1 : 0.65,
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <span style={{ fontWeight: "600", fontSize: "0.83rem", color: event.status === "done" ? "#e2e8f0" : "#94a3b8" }}>{event.event}</span>
                            <div style={{ display: "flex", gap: "8px", flexShrink: 0, marginLeft: "12px" }}>
                              <span style={{ fontSize: "0.65rem", color: evtColor, fontWeight: "700", padding: "1px 7px", borderRadius: "4px", background: evtColor + "15" }}>
                                {CATEGORIES.find(c => c.id === event.category)?.label.split(" ").slice(1).join(" ") || event.category}
                              </span>
                              {event.status === "done"
                                ? <span style={{ fontSize: "0.65rem", color: "#34d399" }}>✓ Done</span>
                                : <span style={{ fontSize: "0.65rem", color: "#475569" }}>⏳ Pending</span>
                              }
                            </div>
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "3px" }}>{event.date}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
