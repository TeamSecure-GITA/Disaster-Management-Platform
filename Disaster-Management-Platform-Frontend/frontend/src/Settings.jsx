import React, { useState } from "react";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [location, setLocation] = useState("Odisha");

  return (
    <div className="settings-page">
      <h1>⚙️ Settings</h1>
      <p>Manage your disaster management platform preferences.</p>

      <div className="settings-card">
        <h2>🔔 Notifications</h2>

        <label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
          Enable emergency notifications
        </label>
      </div>

      <div className="settings-card">
        <h2>🌙 Appearance</h2>

        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          Dark mode
        </label>
      </div>

      <div className="settings-card">
        <h2>📍 Location</h2>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option>Odisha</option>
          <option>Bhubaneswar</option>
          <option>Cuttack</option>
          <option>Puri</option>
          <option>Other</option>
        </select>

        <p>Selected location: {location}</p>
      </div>

      <div className="settings-card">
        <h2>🚨 Emergency Alerts</h2>
        <p>
          Emergency alerts will be displayed when a disaster is detected
          in your selected area.
        </p>
      </div>
    </div>
  );
}

export default Settings;