import React from "react";
function Alerts() {
  return (
    <div className="alerts-page">
      <h1>🚨 Disaster Alerts</h1>

      <p>
        Monitor current disaster situations and emergency warnings.
      </p>

      <div className="alert-grid">

        <div className="alert-card">
          <h2>🌊 Flood</h2>
          <p>📍 Odisha</p>
          <p>Heavy rainfall may cause flooding in low-lying areas.</p>
          <strong>HIGH ALERT</strong>
        </div>

        <div className="alert-card">
          <h2>🌀 Cyclone</h2>
          <p>📍 Bay of Bengal</p>
          <p>Cyclonic conditions are being monitored.</p>
          <strong>MEDIUM ALERT</strong>
        </div>

        <div className="alert-card">
          <h2>🌎 Earthquake</h2>
          <p>📍 North-East India</p>
          <p>Earthquake activity is being monitored.</p>
          <strong>LOW ALERT</strong>
        </div>

        <div className="alert-card">
          <h2>🔥 Wildfire</h2>
          <p>📍 Forest Region</p>
          <p>Fire monitoring and response teams are active.</p>
          <strong>MEDIUM ALERT</strong>
        </div>

      </div>
    </div>
  );
}

export default Alerts;