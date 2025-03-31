"use client";

import { useState } from 'react';
import DroneMap from '../components/Map/DroneMap';
import MissionForm from '../components/MissionPlanner/MissionForm';
import { Mission, Coordinate, Waypoint, MissionStatus } from '../types/mission';

export default function MissionPlanner() {
  const [mission, setMission] = useState<Mission>({
    id: crypto.randomUUID(),
    name: '',
    droneId: '',
    status: 'pending' as MissionStatus,
    startTime: new Date().toISOString(),
    waypoints: [],
    flightParameters: {
      altitude: 50,
      speed: 5,
      sensorType: 'rgb',
      captureInterval: 2
    }
  });

  const handleAreaSelect = (coordinates: Coordinate[]) => {
    setMission(prev => ({
      ...prev,
      waypoints: coordinates.map((coord, index) => ({
        id: `wp-${index}`,
        latitude: coord.lat,
        longitude: coord.lng,
        altitude: prev.flightParameters.altitude
      }))
    }));
  };

  const handleWaypointAdd = (waypoint: Coordinate) => {
    setMission(prev => ({
      ...prev,
      waypoints: [
        ...prev.waypoints,
        {
          id: `wp-${prev.waypoints.length}`,
          latitude: waypoint.lat,
          longitude: waypoint.lng,
          altitude: prev.flightParameters.altitude
        }
      ]
    }));
  };

  const handleMissionSubmit = (updatedMission: Partial<Mission>) => {
    setMission(prev => ({
      ...prev,
      ...updatedMission
    }));
  };

  return (
    <main className="flex min-h-screen flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Mission Planner</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[600px]">
          <DroneMap
            waypoints={mission.waypoints}
            onAreaSelect={handleAreaSelect}
            onWaypointAdd={handleWaypointAdd}
          />
        </div>
        
        <div className="lg:col-span-1">
          <MissionForm
            mission={mission}
            onSubmit={handleMissionSubmit}
          />
        </div>
      </div>
    </main>
  );
}
