import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Alerts from "./pages/Alerts";
import Map from "./pages/Map";
import Rescue from "./pages/Rescue";
import Emergency from "./pages/Emergency";
import Statistics from "./pages/Statistics";
import "./index.css";

function Dashboard() {
  return (
    <>
      <h1>Emergency Response Dashboard</h1>

      <p className="subtitle">
        Monitor disasters, alerts and emergency response information.
      </p>

      <section className="cards">
        <div className="card">
          <h3>🚨 Active Alerts</h3>
          <p>0 Active Disasters</p>
        </div>

        <div className="card">
          <h3>📍 Rescue Centers</h3>
          <p>0 Centers Available</p>
        </div>

        <div className="card">
          <h3>🆘 Emergency Status</h3>
          <p>System Ready</p>
        </div>
      </section>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <aside className="sidebar">
          <h2>🚨 Disaster Management</h2>

          <nav>
            <Link to="/">🏠 Dashboard</Link>
            <Link to="/alerts">🚨 Disaster Alerts</Link>
            <Link to="/map">🗺️ Live Map</Link>
            <Link to="/rescue">📍 Rescue Centers</Link>
            <Link to="/emergency">🆘 Emergency Contacts</Link>
            <Link to="/statistics">📊 Statistics</Link>
            <Link to="/settings">⚙️ Settings</Link>
          </nav>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <button className="emergency-btn">
              🆘 Emergency Help
            </button>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/map" element={<Map />} />
            <Route path="/rescue" element={<Rescue />} />
            <Route path="/emergency" element={<Emergency />} />
           <Route path="/statistics" element={<Statistics />} />
            <Route
              path="/settings"
              element={<h1>⚙️ Settings — Coming Next</h1>}
            />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;