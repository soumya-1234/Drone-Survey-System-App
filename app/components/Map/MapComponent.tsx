import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapComponentProps {
  waypoints: Array<{
    lat: number;
    lng: number;
    altitude: number;
  }>;
  center: {
    lat: number;
    lng: number;
  };
}

const MapComponent: React.FC<MapComponentProps> = ({ waypoints, center }) => {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {waypoints.map((waypoint, index) => (
        <Marker
          key={index}
          position={[waypoint.lat, waypoint.lng]}
          icon={icon}
        />
      ))}

      <Polyline
        positions={waypoints.map(wp => [wp.lat, wp.lng])}
        color="#2563eb"
        weight={3}
        opacity={0.8}
      />
    </MapContainer>
  );
};

export default MapComponent;
