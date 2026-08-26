import React, { useState } from "react";

function AdvancedMap() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const locations = [
    {
      id: 1,
      name: "Flood Affected Area",
      type: "Disaster",
      severity: "High",
      location: "Bhubaneswar",
      icon: "🌊",
      x: "30%",
      y: "35%",
    },
    {
      id: 2,
      name: "Cyclone Warning Zone",
      type: "Disaster",
      severity: "Medium",
      location: "Puri",
      icon: "🌀",
      x: "65%",
      y: "25%",
    },
    {
      id: 3,
      name: "Community Emergency Shelter",
      type: "Shelter",
      severity: "Available",
      location: "Bhubaneswar",
      icon: "🏠",
      x: "45%",
      y: "60%",
    },
    {
      id: 4,
      name: "Relief Center",
      type: "Shelter",
      severity: "Limited",
      location: "Cuttack",
      icon: "🏥",
      x: "75%",
      y: "65%",
    },
  ];

  const filteredLocations =
    filter === "All"
      ? locations
      : locations.filter((item) => item.type === filter);

  return (
    <div className="advanced-map-page">
      <div className="map-header">
        <div>
          <h1>🗺️ Disaster Response Map</h1>
          <p>
            View disaster zones and emergency shelters.
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>Disaster</option>
          <option>Shelter</option>
        </select>
      </div>

      <div className="map-layout">

        <div className="map-area">
          <div className="map-grid">
            {filteredLocations.map((item) => (
              <button
                key={item.id}
                className="map-marker"
                style={{
                  left: item.x,
                  top: item.y,
                }}
                onClick={() => setSelected(item)}
                title={item.name}
              >
                {item.icon}
              </button>
            ))}
          </div>

          <div className="map-legend">
            <strong>Legend</strong>
            <span>🌊 Disaster</span>
            <span>🏠 Shelter</span>
            <span>🔴 High Risk</span>
          </div>
        </div>

        <div className="map-details">
          {selected ? (
            <>
              <h2>{selected.icon} {selected.name}</h2>

              <p>
                <strong>Type:</strong> {selected.type}
              </p>

              <p>
                <strong>Location:</strong> 📍 {selected.location}
              </p>

              <p>
                <strong>Status:</strong> {selected.severity}
              </p>

              <button onClick={() => setSelected(null)}>
                Close
              </button>
            </>
          ) : (
            <>
              <h2>📋 Location Details</h2>
              <p>
                Select a marker on the map to view its information.
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdvancedMap;