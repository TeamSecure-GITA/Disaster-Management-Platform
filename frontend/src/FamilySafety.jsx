import React, { useState } from "react";

function FamilySafety() {
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Family Member 1",
      relation: "Parent",
      status: "Safe",
      location: "Home",
    },
    {
      id: 2,
      name: "Family Member 2",
      relation: "Sibling",
      status: "Safe",
      location: "College",
    },
  ]);

  const updateStatus = (id) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === id
          ? {
              ...member,
              status: member.status === "Safe" ? "Need Help" : "Safe",
            }
          : member
      )
    );
  };

  return (
    <div className="family-page">
      <h1>👨‍👩‍👧 Family Safety Tracker</h1>

      <p>
        Check the safety status of your family members during an emergency.
      </p>

      <div className="family-status">
        <h2>🛡️ Family Safety Status</h2>

        <p>
          {members.filter((member) => member.status === "Safe").length} of{" "}
          {members.length} members are currently marked safe.
        </p>
      </div>

      <div className="family-grid">
        {members.map((member) => (
          <div className="family-card" key={member.id}>
            <div className="family-icon">👤</div>

            <h2>{member.name}</h2>

            <p>
              <strong>Relation:</strong> {member.relation}
            </p>

            <p>
              <strong>Location:</strong> 📍 {member.location}
            </p>

            <div
              className={
                member.status === "Safe"
                  ? "family-safe"
                  : "family-help"
              }
            >
              {member.status === "Safe"
                ? "🟢 Safe"
                : "🔴 Needs Help"}
            </div>

            <button
              className="family-status-btn"
              onClick={() => updateStatus(member.id)}
            >
              Change Status
            </button>
          </div>
        ))}
      </div>

      <button
        className="add-family-btn"
        onClick={() => alert("Family member feature will be connected to the backend later.")}
      >
        ➕ Add Family Member
      </button>
    </div>
  );
}

export default FamilySafety;