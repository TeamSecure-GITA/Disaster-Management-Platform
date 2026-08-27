import React, { useState } from "react";

function SafetyGuides() {
  const [selectedDisaster, setSelectedDisaster] = useState("Flood");

  const guides = {
    Flood: {
      icon: "🌊",
      title: "Flood Safety",
      before: [
        "Keep an emergency kit ready.",
        "Keep important documents protected.",
        "Know the nearest safe shelter.",
        "Monitor official weather and emergency updates.",
      ],
      during: [
        "Move to higher ground when instructed.",
        "Avoid walking or driving through floodwater.",
        "Stay away from electrical equipment in wet areas.",
        "Follow official evacuation instructions.",
      ],
      after: [
        "Return only when authorities say it is safe.",
        "Avoid damaged buildings and electrical hazards.",
        "Use safe drinking water.",
        "Report hazards to the appropriate authorities.",
      ],
    },

    Cyclone: {
      icon: "🌀",
      title: "Cyclone Safety",
      before: [
        "Monitor official cyclone warnings.",
        "Secure loose objects around your home.",
        "Keep emergency supplies ready.",
        "Know your nearest cyclone shelter.",
      ],
      during: [
        "Stay indoors in a safe area.",
        "Keep away from windows.",
        "Do not go outside during dangerous conditions.",
        "Follow evacuation orders.",
      ],
      after: [
        "Wait for official confirmation before leaving shelter.",
        "Avoid fallen electrical wires.",
        "Stay away from damaged structures.",
        "Continue monitoring official updates.",
      ],
    },

    Earthquake: {
      icon: "🏚️",
      title: "Earthquake Safety",
      before: [
        "Prepare an emergency kit.",
        "Identify safer areas inside your building.",
        "Keep heavy objects secured.",
        "Learn your emergency evacuation routes.",
      ],
      during: [
        "Drop, cover, and hold on.",
        "Stay away from windows and glass.",
        "If outdoors, move away from buildings and power lines.",
        "Do not use elevators.",
      ],
      after: [
        "Check yourself and others for injuries.",
        "Move away from damaged buildings.",
        "Expect possible aftershocks.",
        "Follow official instructions.",
      ],
    },

    Fire: {
      icon: "🔥",
      title: "Fire Safety",
      before: [
        "Keep exits clear.",
        "Know your building's emergency exits.",
        "Keep fire safety equipment accessible.",
        "Practice an evacuation plan.",
      ],
      during: [
        "Leave the affected area using a safe exit.",
        "Stay low if there is smoke.",
        "Do not use elevators during a building fire.",
        "Follow emergency personnel instructions.",
      ],
      after: [
        "Do not re-enter a damaged building.",
        "Wait for authorities to declare the area safe.",
        "Report hazards.",
        "Follow official recovery instructions.",
      ],
    },

    Landslide: {
      icon: "⛰️",
      title: "Landslide Safety",
      before: [
        "Monitor local warnings during heavy rainfall.",
        "Know whether your area is vulnerable to landslides.",
        "Prepare an emergency kit.",
        "Know safe evacuation routes.",
      ],
      during: [
        "Move away from the landslide area.",
        "Follow evacuation instructions.",
        "Avoid valleys and unstable slopes.",
        "Do not approach an active landslide.",
      ],
      after: [
        "Stay away from the affected area.",
        "Watch for additional landslides.",
        "Avoid damaged roads and bridges.",
        "Follow official instructions before returning.",
      ],
    },
  };

  const guide = guides[selectedDisaster];

  return (
    <div className="safety-guides-page">
      <h1>🛡️ Disaster Safety Guides</h1>

      <p>
        Learn what to do before, during, and after common disasters.
      </p>

      <div className="disaster-selector">
        {Object.keys(guides).map((disaster) => (
          <button
            key={disaster}
            className={
              selectedDisaster === disaster
                ? "disaster-tab active"
                : "disaster-tab"
            }
            onClick={() => setSelectedDisaster(disaster)}
          >
            {guides[disaster].icon} {disaster}
          </button>
        ))}
      </div>

      <div className="guide-title">
        <span>{guide.icon}</span>
        <h2>{guide.title}</h2>
      </div>

      <div className="guide-sections">
        <div className="guide-card">
          <h3>🟢 Before the Disaster</h3>

          <ul>
            {guide.before.map((item, index) => (
              <li key={index}>✓ {item}</li>
            ))}
          </ul>
        </div>

        <div className="guide-card">
          <h3>🟠 During the Disaster</h3>

          <ul>
            {guide.during.map((item, index) => (
              <li key={index}>✓ {item}</li>
            ))}
          </ul>
        </div>

        <div className="guide-card">
          <h3>🔵 After the Disaster</h3>

          <ul>
            {guide.after.map((item, index) => (
              <li key={index}>✓ {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="safety-note">
        ⚠️ Always follow current instructions from official emergency
        authorities during an actual disaster.
      </div>
    </div>
  );
}

export default SafetyGuides;