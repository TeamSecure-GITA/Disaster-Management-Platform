// ─────────────────────────────────────────────────────────────────────────────
// src/pages/SafeZoneTracker.jsx
//
// Safe Zones Live-Capacity Tracker
// Real-time dashboard: live capacity, medical supplies, power status,
// pet-friendliness, satellite ping updates.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";

const SEED_SHELTERS = [
  { id: 1, name: "Rajiv Gandhi Stadium",    district: "Central",  capacity: 2000, occupied: 1654, power: "FULL",    medical: 85, petFriendly: false, waterDays: 7, food: "PLENTY",  lastPing: 0, status: "OPEN"   },
  { id: 2, name: "St. Mary's School",       district: "North",    capacity: 400,  occupied: 391,  power: "FULL",    medical: 30, petFriendly: false, waterDays: 2, food: "LOW",     lastPing: 0, status: "FULL"   },
  { id: 3, name: "Community Hall Block 7",  district: "East",     capacity: 300,  occupied: 178,  power: "BACKUP",  medical: 60, petFriendly: true,  waterDays: 5, food: "PLENTY",  lastPing: 0, status: "OPEN"   },
  { id: 4, name: "NIT Campus Grounds",      district: "West",     capacity: 3000, occupied: 812,  power: "FULL",    medical: 92, petFriendly: true,  waterDays: 10, food: "PLENTY", lastPing: 0, status: "OPEN"   },
  { id: 5, name: "Old Railway Depot",       district: "South",    capacity: 500,  occupied: 499,  power: "NONE",    medical: 10, petFriendly: false, waterDays: 1, food: "CRITICAL",lastPing: 0, status: "FULL"   },
  { id: 6, name: "District Hospital Annex", district: "Central",  capacity: 200,  occupied: 134,  power: "FULL",    medical: 98, petFriendly: false, waterDays: 14, food: "PLENTY", lastPing: 0, status: "OPEN"   },
  { id: 7, name: "Nehru Sports Complex",    district: "North",    capacity: 1500, occupied: 733,  power: "BACKUP",  medical: 55, petFriendly: true,  waterDays: 4, food: "MODERATE",lastPing: 0, status: "OPEN"   },
  { id: 8, name: "Municipal High School",   district: "East",     capacity: 600,  occupied: 521,  power: "FULL",    medical: 40, petFriendly: false, waterDays: 3, food: "LOW",     lastPing: 0, status: "OPEN"   },
];

const powerIcon  = { FULL: { icon: "⚡", color: "#34d399", label: "Full Grid" }, BACKUP: { icon: "🔋", color: "#fbbf24", label: "Generator" }, NONE: { icon: "❌", color: "#ef4444", label: "No Power" } };
const foodColor  = { PLENTY: "#34d399", MODERATE: "#fbbf24", LOW: "#f97316", CRITICAL: "#ef4444" };
const statusColor= { OPEN: "#34d399", FULL: "#ef4444", CLOSED: "#94a3b8" };

function CapacityBar({ occupied, capacity, status }) {
  const pct = Math.min(100, Math.round((occupied / capacity) * 100));
  const color = pct >= 98 ? "#ef4444" : pct >= 80 ? "#f97316" : pct >= 60 ? "#eab308" : "#34d399";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{occupied.toLocaleString()} / {capacity.toLocaleString()}</span>
        <span style={{ fontSize: "0.72rem", fontWeight: "700", color }}>{pct}%</span>
      </div>
      <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function MedicalBar({ level }) {
  const color = level >= 80 ? "#34d399" : level >= 40 ? "#fbbf24" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${level}%`, background: color, borderRadius: "3px", transition: "width 0.5s" }} />
      </div>
      <span style={{ fontSize: "0.7rem", color, fontWeight: "700", minWidth: "28px" }}>{level}%</span>
    </div>
  );
}

export default function SafeZoneTracker() {
  const [shelters, setShelters]   = useState(SEED_SHELTERS.map(s => ({ ...s, lastPing: Date.now() - Math.random() * 30000 })));
  const [filter, setFilter]       = useState({ district: "All", status: "All", petFriendly: false });
  const [sort, setSort]           = useState("capacity");
  const [pingTick, setPingTick]   = useState(0);
  const [selected, setSelected]   = useState(null);

  // Simulate live updates every 8 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setShelters(prev => prev.map(s => {
        if (s.status === "CLOSED") return s;
        const delta = Math.floor(Math.random() * 20) - 10;
        const newOcc = Math.max(0, Math.min(s.capacity, s.occupied + delta));
        return {
          ...s,
          occupied: newOcc,
          status: newOcc >= s.capacity ? "FULL" : "OPEN",
          lastPing: Date.now(),
          medical: Math.max(0, Math.min(100, s.medical + (Math.random() > 0.8 ? -2 : 0))),
        };
      }));
      setPingTick(p => p + 1);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const districts = ["All", ...new Set(shelters.map(s => s.district))];

  const filtered = shelters
    .filter(s => {
      if (filter.district !== "All" && s.district !== filter.district) return false;
      if (filter.status !== "All" && s.status !== filter.status) return false;
      if (filter.petFriendly && !s.petFriendly) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "capacity") return (b.capacity - b.occupied) - (a.capacity - a.occupied);
      if (sort === "medical") return b.medical - a.medical;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const totalOccupied = shelters.reduce((acc, s) => acc + s.occupied, 0);
  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const openCount     = shelters.filter(s => s.status === "OPEN").length;
  const fullCount     = shelters.filter(s => s.status === "FULL").length;
  const petCount      = shelters.filter(s => s.petFriendly && s.status === "OPEN").length;

  const pingAgo = (ts) => {
    const secs = Math.floor((Date.now() - ts) / 1000);
    if (secs < 60) return `${secs}s ago`;
    return `${Math.floor(secs / 60)}m ago`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#020617,#0c1526,#071220)", color: "#e2e8f0", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
        <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "linear-gradient(135deg,#16a34a,#064e3b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: "0 4px 20px rgba(22,163,74,0.4)" }}>🏕️</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", background: "linear-gradient(90deg,#34d399,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Safe Zones Live Tracker</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Real-time shelter capacity · Medical supplies · Power · Pet-friendliness</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "0.8rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34d399", animation: "blink 2s infinite" }} />
            Satellite ping #{pingTick} · {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Occupied",   value: `${totalOccupied.toLocaleString()} / ${totalCapacity.toLocaleString()}`, icon: "👥", color: "#60a5fa", sub: `${Math.round((totalOccupied/totalCapacity)*100)}% full` },
          { label: "Open Shelters",    value: openCount, icon: "✅", color: "#34d399", sub: `${fullCount} at capacity` },
          { label: "Pet-Friendly",     value: petCount,  icon: "🐾", color: "#f9a8d4", sub: "shelters accepting pets" },
          { label: "Critical Supplies",value: shelters.filter(s => s.medical < 30).length, icon: "⚠️", color: "#ef4444", sub: "need medical resupply" },
        ].map(stat => (
          <div key={stat.label} style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px", backdropFilter: "blur(10px)" }}>
            <div style={{ fontSize: "1.3rem" }}>{stat.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color: stat.color, margin: "4px 0" }}>{stat.value}</div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{stat.label}</div>
            <div style={{ fontSize: "0.68rem", color: "#475569", marginTop: "2px" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <select value={filter.district} onChange={e => setFilter(p => ({ ...p, district: e.target.value }))}
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", padding: "8px 12px", fontSize: "0.82rem", cursor: "pointer" }}>
          {districts.map(d => <option key={d} value={d}>{d === "All" ? "All Districts" : d}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", padding: "8px 12px", fontSize: "0.82rem", cursor: "pointer" }}>
          {["All","OPEN","FULL"].map(s => <option key={s}>{s === "All" ? "All Statuses" : s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", padding: "8px 12px", fontSize: "0.82rem", cursor: "pointer" }}>
          <option value="capacity">Sort: Most Space</option>
          <option value="medical">Sort: Medical Supply</option>
          <option value="name">Sort: Name</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#e2e8f0", fontSize: "0.82rem" }}>
          <input type="checkbox" checked={filter.petFriendly} onChange={e => setFilter(p => ({ ...p, petFriendly: e.target.checked }))} />
          🐾 Pet-Friendly Only
        </label>
        <span style={{ marginLeft: "auto", color: "#64748b", fontSize: "0.78rem" }}>{filtered.length} shelter{filtered.length !== 1 ? "s" : ""} shown</span>
      </div>

      {/* Shelter Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))", gap: "16px" }}>
        {filtered.map(shelter => {
          const pwr = powerIcon[shelter.power];
          const isSelected = selected === shelter.id;
          return (
            <div key={shelter.id} onClick={() => setSelected(isSelected ? null : shelter.id)}
              style={{
                background: "rgba(15,23,42,0.7)", border: `1.5px solid ${isSelected ? "#3b82f6" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "16px", padding: "18px", backdropFilter: "blur(10px)",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: isSelected ? "0 0 24px rgba(59,130,246,0.3)" : "none",
              }}>

              {/* Title row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#f1f5f9", marginBottom: "3px" }}>{shelter.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{shelter.district} District</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "3px 9px", borderRadius: "5px", backgroundColor: statusColor[shelter.status] + "22", color: statusColor[shelter.status] }}>
                    {shelter.status}
                  </span>
                  {shelter.petFriendly && <span title="Pet Friendly" style={{ fontSize: "0.8rem" }}>🐾</span>}
                </div>
              </div>

              {/* Capacity */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "5px" }}>CAPACITY</div>
                <CapacityBar occupied={shelter.occupied} capacity={shelter.capacity} status={shelter.status} />
              </div>

              {/* Info row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "1rem" }}>{pwr.icon}</div>
                  <div style={{ fontSize: "0.62rem", color: pwr.color, fontWeight: "600", marginTop: "2px" }}>{pwr.label}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "1rem" }}>💧</div>
                  <div style={{ fontSize: "0.62rem", color: shelter.waterDays <= 2 ? "#ef4444" : "#34d399", fontWeight: "600", marginTop: "2px" }}>{shelter.waterDays}d water</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "1rem" }}>🍱</div>
                  <div style={{ fontSize: "0.62rem", color: foodColor[shelter.food], fontWeight: "600", marginTop: "2px" }}>{shelter.food}</div>
                </div>
              </div>

              {/* Medical */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>🏥 MEDICAL SUPPLIES</span>
                </div>
                <MedicalBar level={shelter.medical} />
              </div>

              {/* Ping */}
              <div style={{ marginTop: "10px", fontSize: "0.65rem", color: "#374151", textAlign: "right" }}>
                📡 Last ping: {pingAgo(shelter.lastPing)}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
    </div>
  );
}
