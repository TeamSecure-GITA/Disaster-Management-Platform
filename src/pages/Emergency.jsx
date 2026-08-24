function Emergency() {
  const contacts = [
    {
      name: "Police",
      number: "112",
      icon: "👮"
    },
    {
      name: "Fire & Rescue",
      number: "101",
      icon: "🚒"
    },
    {
      name: "Ambulance",
      number: "108",
      icon: "🚑"
    },
    {
      name: "Disaster Management",
      number: "1070",
      icon: "🚨"
    }
  ];

  return (
    <div className="emergency-page">
      <h1>🆘 Emergency Contacts</h1>

      <p className="subtitle">
        Important emergency services for disaster situations.
      </p>

      <div className="contact-grid">
        {contacts.map((contact, index) => (
          <div className="contact-card" key={index}>
            <div className="contact-icon">
              {contact.icon}
            </div>

            <div>
              <h2>{contact.name}</h2>
              <p>{contact.number}</p>
            </div>

            <a
              href={`tel:${contact.number}`}
              className="call-btn"
            >
              📞 Call
            </a>
          </div>
        ))}
      </div>

      <div className="emergency-notice">
        <h2>⚠️ Emergency Notice</h2>
        <p>
          In a real emergency, contact the appropriate emergency
          service immediately.
        </p>
      </div>
    </div>
  );
}

export default Emergency;