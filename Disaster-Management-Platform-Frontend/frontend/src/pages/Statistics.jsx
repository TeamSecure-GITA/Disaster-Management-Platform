import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Statistics() {
  const data = [
    { disaster: "Flood", cases: 12 },
    { disaster: "Cyclone", cases: 8 },
    { disaster: "Earthquake", cases: 5 },
    { disaster: "Wildfire", cases: 7 },
    { disaster: "Landslide", cases: 4 }
  ];

  return (
    <div className="statistics-page">
      <h1>📊 Disaster Statistics</h1>

      <p className="subtitle">
        Overview of disaster events recorded by the platform.
      </p>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p>36</p>
        </div>

        <div className="stat-card">
          <h3>Active Alerts</h3>
          <p>8</p>
        </div>

        <div className="stat-card">
          <h3>Rescue Centers</h3>
          <p>4</p>
        </div>

        <div className="stat-card">
          <h3>People Assisted</h3>
          <p>1,250</p>
        </div>
      </div>

      <div className="chart-card">
        <h2>Disaster Events</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="disaster" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cases" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Statistics;