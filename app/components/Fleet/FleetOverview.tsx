"use client";

import { Drone } from '../../types/fleet';

interface FleetOverviewProps {
  fleet: Drone[];
  selectedDrone: Drone | null;
  onDroneSelect: (drone: Drone) => void;
}

export default function FleetOverview({ fleet, selectedDrone, onDroneSelect }: FleetOverviewProps) {
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

  const needsAttention = (drone: Drone) => {
    return (
      drone.health.batteryStatus === 'critical' ||
      drone.health.maintenanceStatus === 'due' ||
      drone.health.motorHealth.some(health => health < 70) ||
      drone.health.signalStrength < 50
    );
  };

  return (
    <div className="fleet-overview">
      <div className="overview-header">
        <h2 className="heading-2">Fleet Overview</h2>
        <div className="filter-controls">
          {/* Add filter controls here */}
        </div>
      </div>

      <div className="fleet-grid">
        {fleet.map(drone => (
          <div
            key={drone.id}
            className={`drone-card ${selectedDrone?.id === drone.id ? 'selected' : ''} ${
              needsAttention(drone) ? 'needs-attention' : ''
            }`}
            onClick={() => onDroneSelect(drone)}
          >
            <div className="card-header">
              <h3 className="drone-name">{drone.name}</h3>
              <div className="status-indicator" style={{ backgroundColor: getStatusColor(drone.status) }}>
                {drone.status}
              </div>
            </div>

            <div className="card-content">
              <div className="quick-stats">
                <div className="stat">
                  <span className="stat-label">Battery</span>
                  <span className="stat-value">{drone.health.batteryLevel}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Signal</span>
                  <span className="stat-value">{drone.health.signalStrength}%</span>
                </div>
              </div>

              {needsAttention(drone) && (
                <div className="warning-indicators">
                  {drone.health.batteryStatus === 'critical' && (
                    <div className="warning">Low Battery</div>
                  )}
                  {drone.health.maintenanceStatus === 'due' && (
                    <div className="warning">Maintenance Due</div>
                  )}
                  {drone.health.motorHealth.some(health => health < 70) && (
                    <div className="warning">Motor Issue</div>
                  )}
                  {drone.health.signalStrength < 50 && (
                    <div className="warning">Weak Signal</div>
                  )}
                </div>
              )}

              <div className="last-active">
                Last Active: {new Date(drone.lastActive).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
