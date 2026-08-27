import React from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">

      <div className="welcome-card">

        <div className="welcome-logo">
          🛡️
        </div>

        <h1>Disaster Management Platform</h1>

        <p className="welcome-subtitle">
          Protect • Respond • Recover
        </p>

        <p className="welcome-description">
          A smart platform for disaster alerts, emergency
          assistance, rescue coordination and public safety.
        </p>

        <div className="welcome-buttons">

          <button
            onClick={() => navigate("/login")}
            className="welcome-login"
          >
            🔐 Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="welcome-register"
          >
            📝 Register
          </button>

        </div>

        <div className="welcome-admin">

          <button
            onClick={() => navigate("/admin-login")}
          >
            🛡️ Admin Login
          </button>

        </div>

        <div className="welcome-features">

          <span>🚨 Alerts</span>
          <span>🗺️ Disaster Map</span>
          <span>🏥 Emergency Services</span>
          <span>🤖 AI Assistance</span>

        </div>

      </div>

    </div>
  );
}

export default Welcome;