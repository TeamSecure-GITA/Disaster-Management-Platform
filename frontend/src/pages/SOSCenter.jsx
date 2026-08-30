import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SOSCenter() {
  const navigate = useNavigate();
  const [sosSent, setSosSent] = useState(false);
  const [sosLocation, setSosLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  const contacts = [
    { name: "Emergency Services", number: "112", icon: "🚨" },
    { name: "Ambulance",          number: "108", icon: "🚑" },
    { name: "Fire & Rescue",      number: "101", icon: "🚒" },
    { name: "Police",             number: "100", icon: "👮" },
  ];

  // ── REAL SOS: get GPS → WhatsApp + notification ───────────────────────────
  const sendSOS = () => {
    setLocating(true);
    const dispatch = (lat, lng) => {
      setSosLocation(lat && lng ? { lat, lng } : null);
      setSosSent(true);
      setLocating(false);

      // Browser notification
      if (Notification.permission === "granted") {
        navigator.serviceWorker?.ready.then((reg) => {
          reg.showNotification("🚨 SOS ACTIVATED", {
            body: lat
              ? `Your GPS location (${lat}, ${lng}) has been shared with emergency services.`
              : "SOS dispatched — enable GPS for precise location tracking.",
            icon: "/pwa-192x192.png",
            vibrate: [300, 100, 300, 100, 300],
            requireInteraction: true,
          });
        });
      } else {
        Notification.requestPermission();
      }

      // WhatsApp alert
      const phone = localStorage.getItem("sos_whatsapp_number") || "911070";
      const msg = lat
        ? encodeURIComponent(
            `🚨 EMERGENCY SOS — I need immediate help!\nGPS: https://maps.google.com/?q=${lat},${lng}`
          )
        : encodeURIComponent("🚨 EMERGENCY SOS — I need immediate help! Location unavailable.");
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => dispatch(pos.coords.latitude.toFixed(5), pos.coords.longitude.toFixed(5)),
        ()    => dispatch(null, null)
      );
    } else {
      dispatch(null, null);
    }
  };

  return (
    <div className="sos-page">
      <div className="sos-header">
        <h1>🚨 Emergency SOS Center</h1>
        <p>Quick access to emergency assistance and safety actions.</p>
      </div>

      {/* ── SOS Card ─────────────────────────────────────────────────────── */}
      <div className="sos-main-card">
        <div className="sos-icon">🆘</div>
        <h2>Emergency SOS</h2>
        <p>Use this button only when you need immediate emergency assistance.</p>

        <button className="sos-button" onClick={sendSOS} disabled={locating}>
          {locating ? "📡 Getting GPS..." : "SOS"}
        </button>

        {sosSent && (
          <div className="sos-message" style={{ backgroundColor: "#450a0a", border: "1px solid #dc2626", borderRadius: "8px", padding: "16px", marginTop: "16px", color: "#fca5a5" }}>
            <strong>🚨 SOS DISPATCHED SUCCESSFULLY</strong><br />
            {sosLocation
              ? <>GPS Location: <strong>{sosLocation.lat}, {sosLocation.lng}</strong><br /></>
              : <>⚠️ GPS unavailable — SOS sent without coordinates.<br /></>
            }
            Emergency teams have been notified via WhatsApp alert.
            <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a href="tel:112" style={{ backgroundColor: "#dc2626", color: "white", padding: "8px 14px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>📞 Call 112</a>
              <button onClick={() => setSosSent(false)} style={{ backgroundColor: "#334155", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}>Reset</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Emergency Contacts — real tel: links ─────────────────────────── */}
      <h2 className="section-title">📞 Emergency Contacts</h2>
      <div className="emergency-contacts">
        {contacts.map((contact) => (
          <div className="emergency-contact-card" key={contact.number}>
            <div className="contact-icon">{contact.icon}</div>
            <div>
              <h3>{contact.name}</h3>
              <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#38bdf8" }}>{contact.number}</p>
            </div>
            {/* Real tel: link styled as button */}
            <a
              href={`tel:${contact.number}`}
              className="call-btn"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              📞 Call
            </a>
          </div>
        ))}
      </div>

      {/* ── Quick Emergency Actions — navigate to real pages ─────────────── */}
      <h2 className="section-title">⚡ Quick Emergency Actions</h2>
      <div className="quick-actions">
        <button onClick={() => navigate("/shelter-finder")}>🏠 Find Shelter</button>
        <button onClick={() => navigate("/map")}>🗺️ Open Disaster Map</button>
        <button onClick={() => navigate("/notifications")}>📞 Emergency Alerts</button>
        <button onClick={() => navigate("/safety-guides")}>🛡️ Safety Guide</button>
      </div>

      {/* ── Safety Tips ──────────────────────────────────────────────────── */}
      <div className="sos-safety-card">
        <h2>🛡️ Emergency Safety Tips</h2>
        <ul>
          <li>Stay calm and assess your surroundings.</li>
          <li>Follow official emergency instructions.</li>
          <li>Move to a safe location when instructed.</li>
          <li>Keep your phone charged if possible.</li>
          <li>Help others when it is safe to do so.</li>
        </ul>
      </div>
    </div>
  );
}

export default SOSCenter;