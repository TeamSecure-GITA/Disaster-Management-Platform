import React from "react";

function Maintenance() {
  return (
    <div className="maintenance-page">
      <div className="maintenance-card">
        <div className="maintenance-icon">🛡️</div>

        <h1>System Maintenance</h1>

        <p>
          Our system is continuously monitoring the platform
          to keep your experience safe and reliable.
        </p>

        <div className="maintenance-status">
          <span className="status-dot"></span>
          System Operational
        </div>

        <p className="maintenance-small">
          If a temporary problem occurs, the system will
          automatically attempt recovery.
        </p>

        <button onClick={() => window.location.reload()}>
          🔄 Check Again
        </button>
      </div>
    </div>
  );
}

export default Maintenance;