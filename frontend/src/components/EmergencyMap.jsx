import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon display issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ userLocation, setUserLocation }) {
  useMapEvents({
    click(e) {
      setUserLocation(e.latlng);
    },
  });

  return userLocation ? (
    <Marker position={userLocation}>
      <Popup>📍 Your Drop Location</Popup>
    </Marker>
  ) : null;
}

export default function EmergencyMap() {
  const [position, setPosition] = useState([20.2961, 85.8245]); // Default location
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  return (
    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px' }}>🗺️ Interactive Emergency Map</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px' }}>Click anywhere on the map to set an incident marker.</p>
      <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>🏥 Safe Shelter / Base Center</Popup>
          </Marker>
          <LocationMarker userLocation={userLocation} setUserLocation={setUserLocation} />
        </MapContainer>
      </div>
    </div>
  );
}