"use client";

import { useEffect, useState } from 'react';
import { Drone } from '../../types/fleet';
import DroneStatusCard from './DroneStatusCard';
import FleetOverview from './FleetOverview';
import HealthMetrics from './HealthMetrics';

export default function FleetDashboard() {
  const [fleet, setFleet] = useState<Drone[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);

  useEffect(() => {
    // WebSocket connection for real-time fleet updates
    const ws = new WebSocket('ws://localhost:3001/fleet');

    ws.onopen = () => {
      console.log('Connected to fleet management server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'fleet_update') {
        setFleet(data.fleet);
        // Update selected drone if it's in the updated fleet
        if (selectedDrone) {
          const updatedDrone = data.fleet.find((d: Drone) => d.id === selectedDrone.id);
          if (updatedDrone) {
            setSelectedDrone(updatedDrone);
          }
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [selectedDrone]);

  const handleDroneSelect = (drone: Drone) => {
    setSelectedDrone(drone);
  };

  return (
    <div className="fleet-dashboard">
      <div className="dashboard-header">
        <h1 className="heading-1">Fleet Management</h1>
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-label">Total Drones</span>
            <span className="stat-value">{fleet.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Active Missions</span>
            <span className="stat-value">
              {fleet.filter(drone => drone.status === 'in-mission').length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Available</span>
            <span className="stat-value">
              {fleet.filter(drone => drone.status === 'available').length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Needs Attention</span>
            <span className="stat-value">
              {fleet.filter(drone => 
                drone.health.batteryStatus === 'critical' || 
                drone.health.maintenanceStatus === 'due'
              ).length}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <FleetOverview
            fleet={fleet}
            onDroneSelect={handleDroneSelect}
            selectedDrone={selectedDrone}
          />
        </div>
        <div className="dashboard-sidebar">
          {selectedDrone ? (
            <>
              <DroneStatusCard drone={selectedDrone} />
              <HealthMetrics drone={selectedDrone} />
            </>
          ) : (
            <div className="empty-state">
              <p>Select a drone to view detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
