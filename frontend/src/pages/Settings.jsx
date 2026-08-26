import React, { useState } from "react";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);
  const [language, setLanguage] = useState("English");

  return (
    <div className="settings-page">
      <h1>⚙️ Settings</h1>
      <p>Manage your Disaster Management Platform preferences.</p>

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
        <h2>📍 Location</h2>

        <label>
          <input
            type="checkbox"
            checked={location}
            onChange={() => setLocation(!location)}
          />
          Allow location access
        </label>
      </div>

      <div className="settings-card">
        <h2>🌐 Language</h2>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Odia</option>
        </select>
      </div>

      <div className="settings-card">
        <h2>🆘 Emergency Mode</h2>
        <p>
          Emergency mode helps users quickly access disaster alerts,
          rescue centers and emergency contacts.
        </p>

        <button className="emergency-settings-btn">
          🚨 Emergency Help
        </button>
      </div>
    </div>
  );
}

export default Settings;