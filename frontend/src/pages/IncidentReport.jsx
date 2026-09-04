import React, { useState, useEffect } from "react";
import localforage from 'localforage';

function IncidentReport() {
  const [form, setForm] = useState({
    type: "Flood",
    location: "",
    severity: "Medium",
    description: "",
    affectedPeople: "",
  });

  const [image, setImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [reports, setReports] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Load persisted reports on mount
  useEffect(() => {
    localforage.getItem('incident_reports').then((saved) => {
      if (saved && Array.isArray(saved)) setReports(saved);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setSubmitted(false);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.location || !form.description) {
      alert("Please enter the location and description.");
      return;
    }

    const newReport = {
      ...form,
      id: Date.now(),
      status: "Submitted",
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    // Persist to IndexedDB
    localforage.setItem('incident_reports', updated).catch(() => {});
    setSubmitted(true);

    setForm({
      type: "Flood",
      location: "",
      severity: "Medium",
      description: "",
      affectedPeople: "",
    });

    setImage(null);
  };

  return (
    <div className="incident-page">

      <div className="incident-header">
        <h1>📝 Report a Disaster</h1>

        <p>
          Submit information about a disaster or emergency incident.
        </p>
      </div>

      <form
        className="incident-form"
        onSubmit={handleSubmit}
      >

        <div className="incident-card">

          <h2>🚨 Incident Information</h2>

          <label>Disaster Type</label>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option>Flood</option>
            <option>Cyclone</option>
            <option>Earthquake</option>
            <option>Fire</option>
            <option>Landslide</option>
            <option>Other</option>
          </select>

          <label>📍 Location</label>

          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
            <input
              type="text"
              name="location"
              placeholder="Enter incident location or use GPS"
              value={form.location}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) return alert('GPS not supported.');
                setGpsLoading(true);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setForm(f => ({ ...f, location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}` }));
                    setGpsLoading(false);
                  },
                  () => { alert('Unable to get GPS.'); setGpsLoading(false); }
                );
              }}
              style={{ whiteSpace: 'nowrap', padding: '8px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              {gpsLoading ? '📡...' : '📍 GPS'}
            </button>
          </div>

          <label>⚠️ Severity</label>

          <select
            name="severity"
            value={form.severity}
            onChange={handleChange}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          {/* Specialized NER Landslide & Slope Movement Section */}
          {form.type === "Landslide" && (
            <div style={{
              background: "rgba(30, 41, 59, 0.7)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: "10px",
              padding: "16px",
              marginTop: "12px",
              marginBottom: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "1.1rem" }}>⛰️</span>
                <strong style={{ color: "#38bdf8", fontSize: "0.95rem" }}>NER Slope Movement & Geotechnical Observations</strong>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Crack Width (approx cm)</label>
                  <input
                    type="number"
                    name="crackWidth"
                    placeholder="e.g. 5 cm"
                    value={form.crackWidth || ""}
                    onChange={handleChange}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Crack Length (meters)</label>
                  <input
                    type="number"
                    name="crackLength"
                    placeholder="e.g. 12 m"
                    value={form.crackLength || ""}
                    onChange={handleChange}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Road Connectivity / Blockage Status</label>
                <select
                  name="roadStatus"
                  value={form.roadStatus || "Clear"}
                  onChange={handleChange}
                  style={{ width: "100%", marginTop: "4px" }}
                >
                  <option value="Clear">Road Fully Open</option>
                  <option value="Caution">Caution - Single Lane Traffic</option>
                  <option value="Partially Blocked">Partially Blocked (Light vehicles only)</option>
                  <option value="Completely Blocked">Completely Blocked (Debris on Highway)</option>
                  <option value="Culvert/Bridge Washed">Culvert or Bridge Damaged</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Slope Displacement Trend</label>
                <select
                  name="slopeTrend"
                  value={form.slopeTrend || "Stationary"}
                  onChange={handleChange}
                  style={{ width: "100%", marginTop: "4px" }}
                >
                  <option value="Stationary">Stationary - Surface cracks only</option>
                  <option value="Slow Creep">Slow Creep - Tilting trees/poles</option>
                  <option value="Active Rapid Movement">Active Rapid Movement / Mud run</option>
                  <option value="Rockfall">Falling Boulders / Rockfall Active</option>
                </select>
              </div>
            </div>
          )}

          <label>👥 Number of Affected People</label>

          <input
            type="number"
            name="affectedPeople"
            min="0"
            placeholder="Enter approximate number"
            value={form.affectedPeople}
            onChange={handleChange}
          />

          <label>📝 Description</label>

          <textarea
            name="description"
            rows="6"
            placeholder="Describe what happened..."
            value={form.description}
            onChange={handleChange}
          />

          <label>📷 Attach Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
          />

          {image && (
            <div className="image-preview">
              <img
                src={image}
                alt="Incident preview"
              />
            </div>
          )}

          <button
            type="submit"
            className="submit-incident-btn"
          >
            📤 Submit Incident Report
          </button>

          {submitted && (
            <div className="incident-success">
              ✅ Incident report submitted successfully.
            </div>
          )}

        </div>

      </form>

      {reports.length > 0 && (
        <div className="submitted-reports">

          <h2>📋 Your Submitted Reports</h2>

          {reports.map((report) => (
            <div
              className="submitted-report-card"
              key={report.id}
            >
              <h3>
                {report.type} — {report.severity}
              </h3>

              <p>
                📍 <strong>Location:</strong>{" "}
                {report.location}
              </p>

              <p>
                👥 <strong>Affected:</strong>{" "}
                {report.affectedPeople || "Not specified"}
              </p>

              <p>
                📝 <strong>Description:</strong>{" "}
                {report.description}
              </p>

              <span className="report-status">
                ✓ {report.status}
              </span>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default IncidentReport;