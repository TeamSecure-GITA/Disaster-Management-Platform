import React, { useState } from "react";

function SOSCenter() {
  const [sosSent, setSosSent] = useState(false);

  const sendSOS = () => {
    setSosSent(true);
  };

  const contacts = [
    {
      name: "Emergency Services",
      number: "112",
      icon: "🚨",
    },
    {
      name: "Ambulance",
      number: "108",
      icon: "🚑",
    },
    {
      name: "Fire & Rescue",
      number: "101",
      icon: "🚒",
    },
    {
      name: "Police",
      number: "100",
      icon: "👮",
    },
  ];

  return (
    <div className="sos-page">
      <div className="sos-header">
        <h1>🚨 Emergency SOS Center</h1>
        <p>
          Quick access to emergency assistance and safety actions.
        </p>
      </div>

      <div className="sos-main-card">
        <div className="sos-icon">🆘</div>

        <h2>Emergency SOS</h2>

        <p>
          Use this button only when you need immediate emergency assistance.
        </p>

        <button className="sos-button" onClick={sendSOS}>
          SOS
        </button>

        {sosSent && (
          <div className="sos-message">
            ⚠️ SOS request prepared.
            <br />
            In a real deployment, this would connect to an emergency
            notification service.
          </div>
        )}
      </div>

      <h2 className="section-title">
        📞 Emergency Contacts
      </h2>

      <div className="emergency-contacts">
        {contacts.map((contact) => (
          <div className="emergency-contact-card" key={contact.number}>
            <div className="contact-icon">
              {contact.icon}
            </div>

            <div>
              <h3>{contact.name}</h3>
              <p>{contact.number}</p>
            </div>

            <button
              className="call-btn"
              onClick={() =>
                alert(`Calling ${contact.name}: ${contact.number}`)
              }
            >
              📞 Call
            </button>
          </div>
        ))}
      </div>

      <h2 className="section-title">
        ⚡ Quick Emergency Actions
      </h2>

      <div className="quick-actions">
        <button onClick={() => alert("Shelter Finder opened.")}>
          🏠 Find Shelter
        </button>

        <button onClick={() => alert("Disaster map opened.")}>
          🗺️ Open Disaster Map
        </button>

        <button onClick={() => alert("Emergency contacts opened.")}>
          📞 Emergency Contacts
        </button>

        <button onClick={() => alert("Safety guide opened.")}>
          🛡️ Safety Guide
        </button>
      </div>

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