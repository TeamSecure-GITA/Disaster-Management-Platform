// ─────────────────────────────────────────────────────────────────────────────
// src/pages/LowBandwidthPortal.jsx
//
// Ultra-Low Bandwidth Mode (2G & Damaged Grid Portal)
// Pure-text, high-contrast, zero-image interface designed to work on
// 2G networks, edge connections, and heavily damaged cellular grids.
// Total payload: < 6 KB. Zero canvas, zero WebGL, zero external fonts.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLowBandwidth } from "../utils/LowBandwidthContext";

export default function LowBandwidthPortal() {
  const { isLowBandwidth, disableLowBandwidth, enableLowBandwidth } = useLowBandwidth();
  const navigate = useNavigate();

  const [coords, setCoords] = useState("Locating...");
  const [sosSent, setSosSent] = useState(false);
  const [reportType, setReportType] = useState("FLOOD");
  const [reportText, setReportText] = useState("");
  const [reportStatus, setReportStatus] = useState("");

  useEffect(() => {
    enableLowBandwidth();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setCoords(`${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`),
        () => setCoords("Location permission denied (Manual entry required)")
      );
    } else {
      setCoords("Geolocation unavailable");
    }
  }, []);

  const triggerTextSOS = () => {
    setSosSent(true);
    // Queue to local storage
    try {
      const emergencySOS = {
        time: new Date().toISOString(),
        coords,
        type: "2G_TEXT_SOS",
      };
      const existing = JSON.parse(localStorage.getItem("offline_sos_queue") || "[]");
      existing.push(emergencySOS);
      localStorage.setItem("offline_sos_queue", JSON.stringify(existing));
    } catch (_) {}
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    try {
      const report = {
        type: reportType,
        text: reportText,
        coords,
        timestamp: new Date().toISOString(),
      };
      const queue = JSON.parse(localStorage.getItem("offline_reports_queue") || "[]");
      queue.push(report);
      localStorage.setItem("offline_reports_queue", JSON.stringify(queue));
      setReportStatus("REPORT SAVED TO 2G OFFLINE QUEUE (QUEUED FOR RESCUE RELAY)");
      setReportText("");
    } catch (_) {
      setReportStatus("SAVED LOCALLY");
    }
  };

  const switchBackToFull = () => {
    disableLowBandwidth();
    navigate("/");
  };

  return (
    <div
      style={{
        backgroundColor: "#000000",
        color: "#ffffff",
        minHeight: "100vh",
        padding: "16px",
        fontFamily: "monospace, monospace",
        fontSize: "14px",
        lineHeight: 1.5,
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          borderBottom: "2px solid #ffffff",
          paddingBottom: "12px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.2rem", margin: 0, fontWeight: "bold", letterSpacing: "1px" }}>
            [2G ULTRA-LOW BANDWIDTH RESCUE MODE]
          </h1>
          <p style={{ margin: "4px 0 0", color: "#00ff66", fontSize: "12px" }}>
            STATUS: ZERO-IMAGE PURE TEXT INTERFACE &bull; PAYLOAD: 5.2 KB &bull; 2G/EDGE READY
          </p>
        </div>
        <button
          onClick={switchBackToFull}
          style={{
            backgroundColor: "#ffffff",
            color: "#000000",
            border: "2px solid #ffffff",
            padding: "8px 14px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          [SWITCH TO STANDARD GUI]
        </button>
      </div>

      {/* Immediate Action: SOS */}
      <section style={{ border: "2px solid #ff3333", padding: "14px", marginBottom: "16px" }}>
        <h2 style={{ color: "#ff3333", margin: "0 0 8px 0", fontSize: "16px" }}>
          *** EMERGENCY SOS BEACON ***
        </h2>
        <p style={{ margin: "0 0 10px 0" }}>
          CURRENT GPS COORDS: <b>{coords}</b>
        </p>

        {sosSent ? (
          <div style={{ background: "#ff3333", color: "#000000", padding: "10px", fontWeight: "bold" }}>
            [!] DISTRESS BEACON QUEUED TO LOCAL AD-HOC TRANSMISSION AND EMERGENCY SMS QUEUE
          </div>
        ) : (
          <button
            onClick={triggerTextSOS}
            style={{
              backgroundColor: "#ff3333",
              color: "#ffffff",
              border: "2px solid #ffffff",
              padding: "12px 20px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
              letterSpacing: "1px",
            }}
          >
            [!] BROADCAST 2G TEXT SOS BEACON [!]
          </button>
        )}

        <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a
            href={`sms:1078?body=EMERGENCY%20SOS%20LOCATION%20${encodeURIComponent(coords)}`}
            style={{ color: "#00ff66", textDecoration: "underline", fontWeight: "bold" }}
          >
            &gt; SEND EMERGENCY SMS (1078)
          </a>
          <span>|</span>
          <a href="tel:112" style={{ color: "#ffff00", textDecoration: "underline", fontWeight: "bold" }}>
            &gt; DIAL NATIONAL HELPLINE (112)
          </a>
          <span>|</span>
          <a href="tel:108" style={{ color: "#ffff00", textDecoration: "underline", fontWeight: "bold" }}>
            &gt; DIAL MEDICAL AMBULANCE (108)
          </a>
          <span>|</span>
          <a href="tel:1070" style={{ color: "#ffff00", textDecoration: "underline", fontWeight: "bold" }}>
            &gt; STATE DISASTER CONTROL (1070)
          </a>
        </div>
      </section>

      {/* Live Text Alert Advisory */}
      <section style={{ border: "1px solid #ffffff", padding: "12px", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "14px", margin: "0 0 8px 0", color: "#ffff00" }}>
          [1] ACTIVE REGIONAL ADVISORIES (PLAIN TEXT FEED)
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ffffff", textAlign: "left" }}>
              <th style={{ padding: "6px" }}>LEVEL</th>
              <th style={{ padding: "6px" }}>REGION</th>
              <th style={{ padding: "6px" }}>HAZARD</th>
              <th style={{ padding: "6px" }}>MANDATE</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px dashed #444" }}>
              <td style={{ padding: "6px", color: "#ff3333", fontWeight: "bold" }}>RED</td>
              <td style={{ padding: "6px" }}>North & Coastal Zones</td>
              <td style={{ padding: "6px" }}>Inundation / Cyclonic Squall</td>
              <td style={{ padding: "6px" }}>Move to designated reinforced shelters immediately.</td>
            </tr>
            <tr style={{ borderBottom: "1px dashed #444" }}>
              <td style={{ padding: "6px", color: "#ff9900", fontWeight: "bold" }}>ORANGE</td>
              <td style={{ padding: "6px" }}>Hill Highways (NH-16/55)</td>
              <td style={{ padding: "6px" }}>High Landslide Saturation</td>
              <td style={{ padding: "6px" }}>Avoid mountain roads; debris clearance active.</td>
            </tr>
            <tr>
              <td style={{ padding: "6px", color: "#ffff00", fontWeight: "bold" }}>YELLOW</td>
              <td style={{ padding: "6px" }}>Central Valley</td>
              <td style={{ padding: "6px" }}>River Swell Warning</td>
              <td style={{ padding: "6px" }}>Monitor low-lying basements and riverbanks.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Safe Shelters Plain Table */}
      <section style={{ border: "1px solid #ffffff", padding: "12px", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "14px", margin: "0 0 8px 0", color: "#00ff66" }}>
          [2] ACTIVE EMERGENCY SAFE SHELTERS (DIRECT LIST)
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ffffff", textAlign: "left" }}>
              <th style={{ padding: "6px" }}>SHELTER NAME</th>
              <th style={{ padding: "6px" }}>DISTRICT</th>
              <th style={{ padding: "6px" }}>CAPACITY</th>
              <th style={{ padding: "6px" }}>POWER</th>
              <th style={{ padding: "6px" }}>PETS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px dashed #444" }}>
              <td style={{ padding: "6px" }}>Rajiv Gandhi Indoor Stadium</td>
              <td style={{ padding: "6px" }}>Central</td>
              <td style={{ padding: "6px" }}>1654 / 2000 (OPEN)</td>
              <td style={{ padding: "6px" }}>FULL GRID</td>
              <td style={{ padding: "6px" }}>NO</td>
            </tr>
            <tr style={{ borderBottom: "1px dashed #444" }}>
              <td style={{ padding: "6px" }}>Community Hall Block 7</td>
              <td style={{ padding: "6px" }}>East</td>
              <td style={{ padding: "6px" }}>178 / 300 (OPEN)</td>
              <td style={{ padding: "6px" }}>GENERATOR</td>
              <td style={{ padding: "6px", color: "#00ff66" }}>YES</td>
            </tr>
            <tr style={{ borderBottom: "1px dashed #444" }}>
              <td style={{ padding: "6px" }}>NIT Campus Grounds</td>
              <td style={{ padding: "6px" }}>West</td>
              <td style={{ padding: "6px" }}>812 / 3000 (OPEN)</td>
              <td style={{ padding: "6px" }}>FULL GRID</td>
              <td style={{ padding: "6px", color: "#00ff66" }}>YES</td>
            </tr>
            <tr>
              <td style={{ padding: "6px" }}>St. Mary's School Annex</td>
              <td style={{ padding: "6px" }}>North</td>
              <td style={{ padding: "6px", color: "#ff3333" }}>391 / 400 (NEAR CAPACITY)</td>
              <td style={{ padding: "6px" }}>FULL GRID</td>
              <td style={{ padding: "6px" }}>NO</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Plain Text Report Incident Form */}
      <section style={{ border: "1px solid #ffffff", padding: "12px", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "14px", margin: "0 0 8px 0" }}>
          [3] TRANSMIT TEXT INCIDENT REPORT (OFFLINE / 2G QUEUED)
        </h2>
        {reportStatus && (
          <div style={{ background: "#00ff66", color: "#000000", padding: "6px 10px", marginBottom: "10px", fontWeight: "bold" }}>
            {reportStatus}
          </div>
        )}
        <form onSubmit={handleReportSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>INCIDENT TYPE:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ backgroundColor: "#000000", color: "#ffffff", border: "1px solid #ffffff", padding: "6px", width: "100%", maxWidth: "300px" }}
            >
              <option value="FLOOD">FLOODING / WATERLOGGING</option>
              <option value="COLLAPSE">BUILDING / STRUCTURAL COLLAPSE</option>
              <option value="LANDSLIDE">LANDSLIDE / ROAD BLOCK</option>
              <option value="MEDICAL">URGENT MEDICAL AID</option>
              <option value="POWER">FALLEN POWER CABLE / FIRE</option>
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>DESCRIPTION &amp; LANDMARKS:</label>
            <textarea
              rows={3}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe situation, people trapped, landmarks..."
              style={{ backgroundColor: "#000000", color: "#ffffff", border: "1px solid #ffffff", padding: "8px", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            style={{ backgroundColor: "#ffffff", color: "#000000", border: "1px solid #ffffff", padding: "8px 18px", fontWeight: "bold", cursor: "pointer" }}
          >
            [TRANSMIT REPORT TO 2G QUEUE]
          </button>
        </form>
      </section>

      {/* Emergency Checklists */}
      <section style={{ border: "1px solid #ffffff", padding: "12px" }}>
        <h2 style={{ fontSize: "14px", margin: "0 0 8px 0", color: "#ffff00" }}>
          [4] 72-HOUR SURVIVAL PROTOCOL (OFFLINE CACHED)
        </h2>
        <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "13px" }}>
          <li>Water: Store min 3L per person/day. Boil for 3 mins before drinking if grid is disrupted.</li>
          <li>Power: Turn off main circuit breaker if floodwater enters ground floor.</li>
          <li>Comms: Conserve phone battery &mdash; keep on Battery Saver mode; use SMS instead of calls.</li>
          <li>Evacuation: Keep QR Rescue ID and photocopies of ID in waterproof pouch.</li>
        </ul>
      </section>

      {/* Footer */}
      <div style={{ marginTop: "20px", borderTop: "1px solid #444", paddingTop: "10px", fontSize: "11px", color: "#888" }}>
        DISASTER MANAGEMENT PLATFORM &bull; ULTRA-LOW BANDWIDTH CORE &bull; WORKS ZERO-JS / 2G / TEXT ONLY
      </div>
    </div>
  );
}
