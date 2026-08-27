import React, { useState } from "react";

function ShelterFinder() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  const shelters = [
    {
      id: 1,
      name: "Community Emergency Shelter",
      location: "Bhubaneswar",
      distance: "2.4 km",
      capacity: 500,
      available: 180,
      type: "Shelter",
      facilities: ["Food", "Water", "Medical"],
      status: "Available",
      contact: "Emergency Desk",
    },
    {
      id: 2,
      name: "Cyclone Relief Center",
      location: "Patia",
      distance: "4.1 km",
      capacity: 300,
      available: 75,
      type: "Cyclone Shelter",
      facilities: ["Food", "Water", "Power"],
      status: "Limited",
      contact: "Relief Center",
    },
    {
      id: 3,
      name: "Government Relief Camp",
      location: "Cuttack Road",
      distance: "6.8 km",
      capacity: 800,
      available: 0,
      type: "Relief Camp",
      facilities: ["Food", "Medical", "Water"],
      status: "Full",
      contact: "Relief Office",
    },
  ];

  const filteredShelters = shelters.filter((shelter) => {
    const matchesSearch =
      shelter.name.toLowerCase().includes(search.toLowerCase()) ||
      shelter.location.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      type === "All" || shelter.type === type;

    return matchesSearch && matchesType;
  });

  return (
    <div className="shelter-page">
      <h1>📍 Rescue Center & Shelter Finder</h1>

      <p>
        Find emergency shelters and relief centers available in your area.
      </p>

      <div className="shelter-search">
        <input
          type="text"
          placeholder="🔍 Search location or shelter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option>All</option>
          <option>Shelter</option>
          <option>Cyclone Shelter</option>
          <option>Relief Camp</option>
        </select>
      </div>

      <div className="shelter-list">
        {filteredShelters.map((shelter) => (
          <div className="shelter-card" key={shelter.id}>
            <div className="shelter-card-header">
              <div>
                <h2>🏠 {shelter.name}</h2>
                <p>📍 {shelter.location}</p>
              </div>

              <span
                className={`shelter-status ${shelter.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {shelter.status}
              </span>
            </div>

            <div className="shelter-info">
              <p>
                <strong>📏 Distance:</strong>{" "}
                {shelter.distance}
              </p>

              <p>
                <strong>👥 Capacity:</strong>{" "}
                {shelter.capacity}
              </p>

              <p>
                <strong>🟢 Available:</strong>{" "}
                {shelter.available}
              </p>

              <p>
                <strong>📞 Contact:</strong>{" "}
                {shelter.contact}
              </p>
            </div>

            <div className="facility-list">
              {shelter.facilities.map((facility) => (
                <span key={facility}>
                  ✓ {facility}
                </span>
              ))}
            </div>

            <button
              className="shelter-map-btn"
              onClick={() =>
                alert(
                  `Map view for ${shelter.name} will be connected later.`
                )
              }
            >
              🗺️ View on Map
            </button>
          </div>
        ))}
      </div>

      {filteredShelters.length === 0 && (
        <div className="empty-shelters">
          🔍 No shelters found.
        </div>
      )}
    </div>
  );
}

export default ShelterFinder;