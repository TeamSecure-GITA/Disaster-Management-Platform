import React, { useState } from "react";

function EvacuationPlanner() {
  const [disaster, setDisaster] = useState("Flood");
  const [location, setLocation] = useState("");
  const [plan, setPlan] = useState(null);

  const createPlan = () => {
    if (!location.trim()) {
      alert("Please enter your current location.");
      return;
    }

    const plans = {
      Flood: {
        destination: "Nearest Flood Relief Center",
        route: "Move toward higher ground and avoid flooded roads.",
        checklist: [
          "Carry drinking water",
          "Keep your phone charged",
          "Carry essential medicines",
          "Avoid walking through floodwater",
        ],
      },

      Cyclone: {
        destination: "Nearest Cyclone Shelter",
        route: "Move to the designated cyclone shelter using a safe route.",
        checklist: [
          "Stay away from windows",
          "Carry emergency supplies",
          "Keep important documents safe",
          "Follow official evacuation instructions",
        ],
      },

      Earthquake: {
        destination: "Designated Open Safe Area",
        route: "Move away from damaged buildings and other unsafe structures.",
        checklist: [
          "Stay away from damaged buildings",
          "Avoid elevators",
          "Carry your emergency kit",
          "Follow local emergency instructions",
        ],
      },

      Fire: {
        destination: "Designated Safe Assembly Area",
        route: "Use the nearest safe exit and move away from the affected area.",
        checklist: [
          "Avoid smoke",
          "Do not use unsafe exits",
          "Stay outside the affected building",
          "Follow emergency personnel instructions",
        ],
      },
    };

    setPlan({
      ...plans[disaster],
      currentLocation: location,
    });
  };

  return (
    <div className="evacuation-page">
      <h1>🧭 Smart Evacuation Planner</h1>

      <p>
        Create a basic emergency evacuation plan based on the disaster type
        and your current location.
      </p>

      <div className="evacuation-form">
        <label>🚨 Disaster Type</label>

        <select
          value={disaster}
          onChange={(e) => setDisaster(e.target.value)}
        >
          <option>Flood</option>
          <option>Cyclone</option>
          <option>Earthquake</option>
          <option>Fire</option>
        </select>

        <label>📍 Current Location</label>

        <input
          type="text"
          placeholder="Enter your location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button onClick={createPlan}>
          🧭 Create Evacuation Plan
        </button>
      </div>

      {plan && (
        <div className="evacuation-result">
          <h2>🛡️ Your Evacuation Plan</h2>

          <div className="evacuation-info">
            <p>
              <strong>📍 Current Location:</strong>{" "}
              {plan.currentLocation}
            </p>

            <p>
              <strong>🚨 Disaster:</strong> {disaster}
            </p>

            <p>
              <strong>🏠 Safe Destination:</strong>{" "}
              {plan.destination}
            </p>

            <p>
              <strong>🛣️ Suggested Route:</strong>{" "}
              {plan.route}
            </p>
          </div>

          <h3>🎒 Emergency Checklist</h3>

          <ul>
            {plan.checklist.map((item, index) => (
              <li key={index}>✅ {item}</li>
            ))}
          </ul>

          <div className="evacuation-warning">
            ⚠️ This is a demonstration planner. During a real emergency,
            follow official evacuation orders and current local emergency
            information.
          </div>
        </div>
      )}
    </div>
  );
}

export default EvacuationPlanner;