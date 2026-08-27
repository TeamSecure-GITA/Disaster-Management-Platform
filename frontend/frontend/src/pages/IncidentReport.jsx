import React, { useState } from "react";

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

    setReports([newReport, ...reports]);
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

          <input
            type="text"
            name="location"
            placeholder="Enter incident location"
            value={form.location}
            onChange={handleChange}
          />

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