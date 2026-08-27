import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function Map() {
  const position = [20.2961, 85.8245];

  return (
    <div>
      <h1>🗺️ Live Disaster Map</h1>

      <p className="subtitle">
        Monitor disaster locations and emergency response areas.
      </p>

      <div className="map-container">
        <MapContainer
          center={position}
          zoom={6}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={position}>
            <Popup>
              📍 Disaster Monitoring Center
              <br />
              Bhubaneswar, Odisha
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default Map;