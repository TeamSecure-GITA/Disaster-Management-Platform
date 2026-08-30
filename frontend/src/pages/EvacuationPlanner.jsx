import React, { useState } from "react";

function EvacuationPlanner() {
  const [disaster, setDisaster] = useState("Flood");
  const [location, setLocation] = useState("");
  const [plan, setPlan] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const SHELTER_COORDS = {
    Flood:      { lat: 20.3030, lng: 85.8191 },
    Cyclone:    { lat: 20.3522, lng: 85.8193 },
    Earthquake: { lat: 20.2700, lng: 85.8300 },
    Fire:       { lat: 20.2961, lng: 85.8400 },
  };

  const getGPS = () => {
    if (!navigator.geolocation) return alert('GPS not supported.');
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setGpsLoading(false);
      },
      () => { alert('GPS unavailable. Enter location manually.'); setGpsLoading(false); }
    );
  };

  const createPlan = () => {
    if (!location.trim()) {
      alert("Please enter your current location.");
      return;
    }

    const plans = {
      Flood: {
        destination: "Nearest Flood Relief Center (Community Hall #1)",
        route: "Move toward higher ground and avoid flooded roads.",
        checklist: [
          "Carry drinking water",
          "Keep your phone charged",
          "Carry essential medicines",
          "Avoid walking through floodwater",
        ],
      },
      Cyclone: {
        destination: "Nearest Cyclone Shelter (Patia Relief Center)",
        route: "Move to the designated cyclone shelter using a safe route.",
        checklist: [
          "Stay away from windows",
          "Carry emergency supplies",
          "Keep important documents safe",
          "Follow official evacuation instructions",
        ],
      },
      Earthquake: {
        destination: "Designated Open Safe Area (Cuttack Road Camp)",
        route: "Move away from damaged buildings and other unsafe structures.",
        checklist: [
          "Stay away from damaged buildings",
          "Avoid elevators",
          "Carry your emergency kit",
          "Follow local emergency instructions",
        ],
      },
      Fire: {
        destination: "Designated Safe Assembly Area (Stadium Shelter)",
        route: "Use the nearest safe exit and move away from the affected area.",
        checklist: [
          "Avoid smoke",
          "Do not use unsafe exits",
          "Stay outside the affected building",
          "Follow emergency personnel instructions",
        ],
      },
    };

    const coords = SHELTER_COORDS[disaster];
    setPlan({
      ...plans[disaster],
      currentLocation: location,
      mapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(location)}&destination=${coords.lat},${coords.lng}&travelmode=driving`,
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Enter your location or use GPS"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={getGPS}
            style={{ whiteSpace: 'nowrap', padding: '8px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            {gpsLoading ? '📡...' : '📍 GPS'}
          </button>
        </div>

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

            <p><strong>🏠 Safe Destination:</strong>{" "}{plan.destination}</p>

            <p><strong>🛣️ Suggested Route:</strong>{" "}{plan.route}</p>

            <a
              href={plan.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#1d4ed8', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', marginTop: '8px' }}
            >
              🗺️ Get Directions on Google Maps
            </a>
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