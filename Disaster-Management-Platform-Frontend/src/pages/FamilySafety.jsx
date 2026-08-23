import React, { useState } from "react";

export default function FamilySafety() {
  const [members, setMembers] = useState([
    { id: 1, name: "Prafulla Kumar Behera", status: "Safe", location: "Home" },
    { id: 2, name: "Santilata Behera", status: "Safe", location: "Home" }
  ]);

  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMember = {
      id: Date.now(),
      name: newName,
      status: "Safe",
      location: newLocation || "Unknown"
    };

    setMembers([...members, newMember]);
    setNewName("");
    setNewLocation("");
  };

  const toggleStatus = (id) => {
    setMembers(members.map(member => {
      if (member.id === id) {
        return {
          ...member,
          status: member.status === "Safe" ? "Needs Help" : "Safe"
        };
      }
      return member;
    }));
  };

  const safeCount = members.filter(m => m.status === "Safe").length;
  const alertCount = members.filter(m => m.status === "Needs Help").length;

  return (
    <div style={{ maxWidth: "900px" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
        Family Safety
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        Keep your family members safe during emergencies.
      </p>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "2rem" }}>
        <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "10px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Family Members</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginTop: "4px" }}>{members.length}</h2>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "10px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Safe Members</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#22c55e", marginTop: "4px" }}>{safeCount}</h2>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "10px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Emergency Alerts</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", color: alertCount > 0 ? "#ef4444" : "#f8fafc", marginTop: "4px" }}>{alertCount}</h2>
        </div>
      </div>

      {/* Add Member Form */}
      <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "10px", border: "1px solid #334155", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem" }}>Add Family Member</h3>
        <form onSubmit={handleAddMember} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Member Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: "1 1 200px", padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
          />
          <input
            type="text"
            placeholder="Current Location"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            style={{ flex: "1 1 200px", padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
          />
          <button
            type="submit"
            style={{ padding: "10px 20px", backgroundColor: "#2563eb", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "600", cursor: "pointer" }}
          >
            Add Member
          </button>
        </form>
      </div>

      {/* Family Tracking List */}
      <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem" }}>Family Tracking</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {members.map((member) => (
          <div
            key={member.id}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1e293b", padding: "14px 18px", borderRadius: "10px", border: "1px solid #334155" }}
          >
            <div>
              <div style={{ fontWeight: "600", fontSize: "1rem" }}>{member.name}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Location: {member.location}</div>
            </div>
            <button
              onClick={() => toggleStatus(member.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "600",
                fontSize: "0.85rem",
                cursor: "pointer",
                backgroundColor: member.status === "Safe" ? "#166534" : "#991b1b",
                color: member.status === "Safe" ? "#4ade80" : "#fca5a5"
              }}
            >
              {member.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}