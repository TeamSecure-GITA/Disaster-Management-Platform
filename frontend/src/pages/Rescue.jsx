function Rescue() {
  const centers = [
    {
      name: "Bhubaneswar Relief Center",
      location: "Bhubaneswar, Odisha",
      capacity: "500 people",
      status: "Open"
    },
    {
      name: "Cuttack Emergency Center",
      location: "Cuttack, Odisha",
      capacity: "300 people",
      status: "Open"
    },
    {
      name: "Puri Cyclone Shelter",
      location: "Puri, Odisha",
      capacity: "400 people",
      status: "Available"
    },
    {
      name: "Balasore Relief Center",
      location: "Balasore, Odisha",
      capacity: "250 people",
      status: "Available"
    }
  ];

  return (
    <div>
      <h1>📍 Rescue Centers</h1>

      <p className="subtitle">
        Find available emergency shelters and rescue centers.
      </p>

      <div className="rescue-grid">
        {centers.map((center, index) => (
          <div className="rescue-card" key={index}>
            <h2>{center.name}</h2>

            <p>📍 {center.location}</p>

            <p>👥 Capacity: {center.capacity}</p>

            <span className="status">
              ● {center.status}
            </span>

            <button className="details-btn">
              View Center
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rescue;