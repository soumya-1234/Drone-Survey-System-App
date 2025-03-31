"use client";

import { Drone } from '../../types/fleet';

interface DroneStatusCardProps {
  drone: Drone;
}

export default function DroneStatusCard({ drone }: DroneStatusCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#16a34a';
      case 'in-mission':
        return '#2563eb';
      case 'maintenance':
        return '#f59e0b';
      case 'charging':
        return '#6366f1';
      case 'offline':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level <= 20) return '#dc2626';
    if (level <= 40) return '#f59e0b';
    return '#16a34a';
  };

  return (
    <div className="status-card">
      <div className="card-header">
        <h2 className="heading-2">{drone.name}</h2>
        <div className="status-badge" style={{ backgroundColor: getStatusColor(drone.status) }}>
          {drone.status}
        </div>
      </div>

      <div className="card-content">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Model</span>
            <span className="info-value">{drone.model}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Serial Number</span>
            <span className="info-value">{drone.serialNumber}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Active</span>
            <span className="info-value">
              {new Date(drone.lastActive).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="battery-indicator">
          <div className="battery-label">
            <span>Battery Level</span>
            <span style={{ color: getBatteryColor(drone.health.batteryLevel) }}>
              {drone.health.batteryLevel}%
            </span>
          </div>
          <div className="battery-bar">
            <div
              className="battery-fill"
              style={{
                width: `${drone.health.batteryLevel}%`,
                backgroundColor: getBatteryColor(drone.health.batteryLevel)
              }}
            />
          </div>
        </div>

        {drone.location && (
          <div className="location-info">
            <span className="info-label">Current Location</span>
            <div className="coordinates">
              <span>Lat: {drone.location.lat.toFixed(6)}</span>
              <span>Lng: {drone.location.lng.toFixed(6)}</span>
              <span>Alt: {drone.location.altitude}m</span>
            </div>
          </div>
        )}

        {drone.currentMissionId && (
          <div className="mission-info">
            <span className="info-label">Current Mission</span>
            <span className="mission-id">{drone.currentMissionId}</span>
          </div>
        )}
      </div>
    </div>
  );
}
