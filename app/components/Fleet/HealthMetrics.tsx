"use client";

import { Drone } from '../../types/fleet';

interface HealthMetricsProps {
  drone: Drone;
}

export default function HealthMetrics({ drone }: HealthMetricsProps) {
  const getHealthColor = (value: number, threshold: number) => {
    if (value >= threshold) return '#16a34a';
    if (value >= threshold * 0.7) return '#f59e0b';
    return '#dc2626';
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'due':
        return '#dc2626';
      case 'upcoming':
        return '#f59e0b';
      case 'completed':
        return '#16a34a';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="health-metrics">
      <h3 className="heading-3">Health Metrics</h3>
      
      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-header">
            <span>Signal Strength</span>
            <span style={{ color: getHealthColor(drone.health.signalStrength, 80) }}>
              {drone.health.signalStrength}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${drone.health.signalStrength}%`,
                backgroundColor: getHealthColor(drone.health.signalStrength, 80)
              }}
            />
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-header">
            <span>GPS Accuracy</span>
            <span style={{ color: getHealthColor(drone.health.gpsAccuracy, 90) }}>
              {drone.health.gpsAccuracy}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${drone.health.gpsAccuracy}%`,
                backgroundColor: getHealthColor(drone.health.gpsAccuracy, 90)
              }}
            />
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-header">
            <span>Compass Calibration</span>
            <span style={{ color: getHealthColor(drone.health.compassCalibration, 95) }}>
              {drone.health.compassCalibration}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${drone.health.compassCalibration}%`,
                backgroundColor: getHealthColor(drone.health.compassCalibration, 95)
              }}
            />
          </div>
        </div>

        <div className="motor-health">
          <span className="metric-label">Motor Health</span>
          <div className="motor-grid">
            {drone.health.motorHealth.map((health, index) => (
              <div key={index} className="motor-item">
                <span className="motor-label">M{index + 1}</span>
                <div className="motor-indicator" style={{ backgroundColor: getHealthColor(health, 90) }}>
                  {health}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="maintenance-info">
          <div className="maintenance-header">
            <span>Maintenance Status</span>
            <span style={{ color: getMaintenanceStatusColor(drone.health.maintenanceStatus) }}>
              {drone.health.maintenanceStatus}
            </span>
          </div>
          <div className="maintenance-details">
            <span>Last Maintenance: {new Date(drone.health.lastMaintenance).toLocaleDateString()}</span>
            <span>Flight Hours: {drone.health.flightHours}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
