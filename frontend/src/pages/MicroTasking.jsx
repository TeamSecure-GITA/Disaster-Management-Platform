// ─────────────────────────────────────────────────────────────────────────────
// src/pages/MicroTasking.jsx
//
// Micro-Tasking Volunteering Module — "Uber for Relief"
// Gamified bite-sized disaster relief tasks. Filter by skill/location/category.
// Accept, complete, earn XP, and climb the leaderboard.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "medical",    label: "🏥 Medical",     color: "#ef4444", bg: "rgba(239,68,68,0.15)"   },
  { id: "logistics",  label: "🚚 Logistics",   color: "#f97316", bg: "rgba(249,115,22,0.15)"  },
  { id: "translation",label: "🌐 Language",    color: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
  { id: "debris",     label: "🏗️ Debris",      color: "#fbbf24", bg: "rgba(251,191,36,0.15)"  },
  { id: "rescue",     label: "🆘 Search",      color: "#60a5fa", bg: "rgba(96,165,250,0.15)"  },
  { id: "support",    label: "💬 Support",     color: "#34d399", bg: "rgba(52,211,153,0.15)"  },
];

const SEED_TASKS = [
  { id: 1,  category: "logistics",  xp: 50,  title: "Drive insulin to Shelter B",         desc: "2 miles south on NH-16. Insulin shipment needs urgent delivery to diabetes patients at Community Hall.", skill: "Driver", distance: 2.1, urgency: "CRITICAL", status: "open",  assignee: null },
  { id: 2,  category: "debris",     xp: 80,  title: "Clear debris on 5th Street",          desc: "Fallen tree blocking emergency access road. Chainsaw and safety gear provided on-site.", skill: "Physical", distance: 0.8, urgency: "HIGH",     status: "open",  assignee: null },
  { id: 3,  category: "translation",xp: 40,  title: "Translate for Bengali family at Shelter X", desc: "Family of 5 needs Bengali-English translation for medical intake forms.", skill: "Bengali Speaker", distance: 1.2, urgency: "HIGH",     status: "open",  assignee: null },
  { id: 4,  category: "medical",    xp: 120, title: "Assist field medic at NIT Camp",      desc: "Triage support needed. Basic first aid certification required. 4-hour shift.", skill: "First Aid", distance: 3.4, urgency: "CRITICAL", status: "open",  assignee: null },
  { id: 5,  category: "support",    xp: 30,  title: "Phone check-in calls for elderly",   desc: "Call 20 registered elderly residents to confirm safety and needs. Phone list provided.", skill: "Communication", distance: 0.0, urgency: "MEDIUM",   status: "open",  assignee: null },
  { id: 6,  category: "logistics",  xp: 60,  title: "Transport blankets from depot",      desc: "Pick up 50 emergency blankets from Sector 4 depot and deliver to Night Shelter.", skill: "Driver", distance: 4.5, urgency: "MEDIUM",   status: "open",  assignee: null },
  { id: 7,  category: "rescue",     xp: 150, title: "Missing person search — Hill Zone",  desc: "Elderly man (72) missing since flood. Last seen near Riverside Park. Join search party.", skill: "Physical", distance: 5.2, urgency: "CRITICAL", status: "open",  assignee: null },
  { id: 8,  category: "medical",    xp: 70,  title: "Blood pressure monitoring rounds",   desc: "Monitor BP for 30+ cardiac patients at Hospital Annex. BP cuff provided.", skill: "First Aid", distance: 2.8, urgency: "HIGH",     status: "open",  assignee: null },
  { id: 9,  category: "support",    xp: 25,  title: "Children activity coordinator",      desc: "Organise activities for 40+ children at Community Shelter to reduce trauma.", skill: "Childcare", distance: 1.0, urgency: "LOW",      status: "open",  assignee: null },
  { id: 10, category: "debris",     xp: 90,  title: "Roof tarp installation",             desc: "Secure emergency tarps over 6 damaged roofs in Colony 3 before rain tonight.", skill: "Construction", distance: 1.7, urgency: "HIGH",     status: "open",  assignee: null },
];

const urgencyColor = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#fbbf24", LOW: "#94a3b8" };

const LEADERBOARD = [
  { rank: 1, name: "Priya S.",    xp: 1840, tasks: 23, badge: "🏅" },
  { rank: 2, name: "Arjun M.",   xp: 1620, tasks: 19, badge: "🥈" },
  { rank: 3, name: "Deepa N.",   xp: 1290, tasks: 15, badge: "🥉" },
  { rank: 4, name: "Ravi K.",    xp: 980,  tasks: 12, badge: "⭐" },
  { rank: 5, name: "Meena P.",   xp: 760,  tasks: 9,  badge: "⭐" },
];

export default function MicroTasking() {
  const [tasks, setTasks]           = useState(SEED_TASKS);
  const [filterCat, setFilterCat]   = useState("all");
  const [filterUrg, setFilterUrg]   = useState("all");
  const [maxDist, setMaxDist]       = useState(10);
  const [myXP, setMyXP]             = useState(320);
  const [myTasks, setMyTasks]       = useState(3);
  const [activeTab, setActiveTab]   = useState("board");
  const [toast, setToast]           = useState(null);

  const showToast = (msg, color = "#34d399") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const acceptTask = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "accepted", assignee: "You" } : t));
    showToast("✅ Task accepted! Head to the location.", "#34d399");
  };

  const completeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "done" } : t));
    setMyXP(p => p + task.xp);
    setMyTasks(p => p + 1);
    showToast(`🎉 +${task.xp} XP earned! Task complete.`, "#fbbf24");
  };

  const filtered = tasks.filter(t => {
    if (filterCat !== "all" && t.category !== filterCat) return false;
    if (filterUrg !== "all" && t.urgency !== filterUrg) return false;
    if (t.distance > maxDist) return false;
    if (activeTab === "mine" && t.assignee !== "You") return false;
    return true;
  });

  const level = Math.floor(myXP / 500) + 1;
  const nextLevelXP = level * 500;
  const progressPct = Math.round(((myXP % 500) / 500) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#020617,#0c1526)", color: "#e2e8f0", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: "24px" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, background: "rgba(15,23,42,0.95)", border: `2px solid ${toast.color}`, borderRadius: "12px", padding: "14px 20px", color: toast.color, fontWeight: "700", fontSize: "0.9rem", boxShadow: `0 8px 30px ${toast.color}40` }}>
          {toast.msg}
        </div>
      )}

      {/* Header + XP */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
        <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: "linear-gradient(135deg,#ea580c,#7c2d12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: "0 4px 20px rgba(234,88,12,0.4)" }}>🤝</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", background: "linear-gradient(90deg,#fb923c,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Volunteer Micro-Tasks</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Gamified disaster relief · Match your skills to exact tasks</p>
        </div>
        {/* XP Card */}
        <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "12px", padding: "12px 18px", textAlign: "center" }}>
          <div style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your XP</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#fbbf24" }}>{myXP.toLocaleString()}</div>
          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Level {level} Volunteer</div>
          <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden", marginTop: "5px", width: "100px" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg,#f97316,#fbbf24)", borderRadius: "3px" }} />
          </div>
          <div style={{ fontSize: "0.62rem", color: "#475569", marginTop: "2px" }}>{myXP % 500}/{500} to Level {level + 1}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
        {[["board","📋 Task Board"], ["mine","🎯 My Tasks"], ["leaderboard","🏆 Leaderboard"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "0.83rem",
            background: activeTab === id ? "linear-gradient(135deg,#ea580c,#c2410c)" : "rgba(255,255,255,0.06)",
            color: activeTab === id ? "#fff" : "#94a3b8", transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      {activeTab === "leaderboard" ? (
        <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", backdropFilter: "blur(10px)", maxWidth: "600px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: "700", color: "#fbbf24" }}>🏆 Top Volunteers This Week</h3>
          {LEADERBOARD.map(v => (
            <div key={v.rank} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", borderRadius: "10px", marginBottom: "8px", background: v.rank === 1 ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${v.rank === 1 ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.06)"}` }}>
              <span style={{ fontSize: "1.4rem" }}>{v.badge}</span>
              <span style={{ fontSize: "1rem", fontWeight: "700", color: "#475569", minWidth: "20px" }}>#{v.rank}</span>
              <span style={{ flex: 1, fontWeight: "600", color: "#e2e8f0" }}>{v.name}</span>
              <span style={{ fontSize: "0.8rem", color: "#fbbf24", fontWeight: "700" }}>{v.xp.toLocaleString()} XP</span>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{v.tasks} tasks</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", borderRadius: "10px", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", marginTop: "12px" }}>
            <span style={{ fontSize: "1.4rem" }}>👤</span>
            <span style={{ fontSize: "1rem", fontWeight: "700", color: "#475569", minWidth: "20px" }}>#8</span>
            <span style={{ flex: 1, fontWeight: "600", color: "#60a5fa" }}>You</span>
            <span style={{ fontSize: "0.8rem", color: "#fbbf24", fontWeight: "700" }}>{myXP.toLocaleString()} XP</span>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{myTasks} tasks</span>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", padding: "8px 12px", fontSize: "0.82rem", cursor: "pointer" }}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select value={filterUrg} onChange={e => setFilterUrg(e.target.value)} style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", padding: "8px 12px", fontSize: "0.82rem", cursor: "pointer" }}>
              <option value="all">All Urgencies</option>
              {["CRITICAL","HIGH","MEDIUM","LOW"].map(u => <option key={u}>{u}</option>)}
            </select>
            <label style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
              📍 Max {maxDist} km
              <input type="range" min={0} max={10} step={0.5} value={maxDist} onChange={e => setMaxDist(+e.target.value)}
                style={{ marginLeft: "8px", accentColor: "#f97316" }} />
            </label>
            <span style={{ marginLeft: "auto", color: "#64748b", fontSize: "0.78rem" }}>{filtered.length} task{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Task Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "16px" }}>
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#475569", padding: "40px", fontSize: "0.9rem" }}>
                No tasks match your filters.
              </div>
            )}
            {filtered.map(task => {
              const cat = CATEGORIES.find(c => c.id === task.category);
              return (
                <div key={task.id} style={{
                  background: "rgba(15,23,42,0.7)", border: `1px solid ${task.status === "done" ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "16px", padding: "18px", backdropFilter: "blur(10px)",
                  opacity: task.status === "done" ? 0.6 : 1,
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "3px 9px", borderRadius: "5px", backgroundColor: cat.bg, color: cat.color }}>{cat.label}</span>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: "700", color: urgencyColor[task.urgency] }}>⚡ {task.urgency}</span>
                      <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#fbbf24" }}>+{task.xp} XP</span>
                    </div>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "0.92rem", fontWeight: "700", color: "#f1f5f9" }}>{task.title}</h3>
                  <p style={{ margin: "0 0 12px", fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.5 }}>{task.desc}</p>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>🔧 {task.skill}</span>
                    {task.distance > 0 && <span style={{ fontSize: "0.72rem", color: "#64748b" }}>📍 {task.distance} km away</span>}
                  </div>
                  {task.status === "open" && (
                    <button onClick={() => acceptTask(task.id)} style={{ width: "100%", padding: "9px", borderRadius: "9px", border: "none", cursor: "pointer", background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", fontWeight: "700", fontSize: "0.83rem" }}>
                      ✋ Accept Task
                    </button>
                  )}
                  {task.status === "accepted" && task.assignee === "You" && (
                    <button onClick={() => completeTask(task.id)} style={{ width: "100%", padding: "9px", borderRadius: "9px", border: "none", cursor: "pointer", background: "linear-gradient(135deg,#1d4ed8,#1e40af)", color: "#fff", fontWeight: "700", fontSize: "0.83rem" }}>
                      ✅ Mark Complete (+{task.xp} XP)
                    </button>
                  )}
                  {task.status === "accepted" && task.assignee !== "You" && (
                    <div style={{ fontSize: "0.78rem", color: "#475569", textAlign: "center", padding: "8px" }}>Assigned to another volunteer</div>
                  )}
                  {task.status === "done" && (
                    <div style={{ fontSize: "0.8rem", color: "#34d399", textAlign: "center", padding: "8px", fontWeight: "700" }}>✓ Completed</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
