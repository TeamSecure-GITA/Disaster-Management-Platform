import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

function RescueID() {
  const [person, setPerson] = useState({
    name: "",
    bloodGroup: "",
    emergencyContact: "",
    location: "",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setPerson({
      ...person,
      [e.target.name]: e.target.value,
    });

    setSaved(false);
  };

  const handleGenerate = (e) => {
    e.preventDefault();

    if (
      !person.name ||
      !person.bloodGroup ||
      !person.emergencyContact ||
      !person.location
    ) {
      alert("Please fill all fields.");
      return;
    }

    setSaved(true);
  };

  const qrData = JSON.stringify({
    name: person.name,
    bloodGroup: person.bloodGroup,
    emergencyContact: person.emergencyContact,
    location: person.location,
  });

  return (
    <div className="rescue-id-page">
      <h1>🪪 QR Rescue ID</h1>

      <p>
        Create a digital emergency identification card for disaster
        situations.
      </p>

      {!saved && (
        <form className="rescue-form" onSubmit={handleGenerate}>
          <label>👤 Full Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={person.name}
            onChange={handleChange}
          />

          <label>🩸 Blood Group</label>

          <select
            name="bloodGroup"
            value={person.bloodGroup}
            onChange={handleChange}
          >
            <option value="">Select blood group</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>

          <label>📞 Emergency Contact</label>

          <input
            type="tel"
            name="emergencyContact"
            placeholder="Emergency contact number"
            value={person.emergencyContact}
            onChange={handleChange}
          />

          <label>📍 Current Location</label>

          <input
            type="text"
            name="location"
            placeholder="Enter your location"
            value={person.location}
            onChange={handleChange}
          />

          <button type="submit">
            🪪 Generate Rescue ID
          </button>
        </form>
      )}

      {saved && (
        <div className="rescue-id-card">
          <div className="rescue-id-header">
            <h2>🚨 EMERGENCY RESCUE ID</h2>
            <span>SAFE-ID</span>
          </div>

          <div className="rescue-id-content">
            <div>
              <p>
                <strong>Name:</strong> {person.name}
              </p>

              <p>
                <strong>Blood Group:</strong> {person.bloodGroup}
              </p>

              <p>
                <strong>Emergency Contact:</strong>{" "}
                {person.emergencyContact}
              </p>

              <p>
                <strong>Location:</strong> {person.location}
              </p>
            </div>

            <div className="qr-container">
              <QRCodeCanvas
                value={qrData}
                size={160}
                bgColor="#ffffff"
                fgColor="#000000"
              />

              <p>Scan for emergency information</p>
            </div>
          </div>

          <button
            className="edit-rescue-btn"
            onClick={() => setSaved(false)}
          >
            ✏️ Edit Information
          </button>
        </div>
      )}
    </div>
  );
}

export default RescueID;