"use client";

import { useState, useEffect } from 'react';
import { Mission, Drone } from '../../types/mission';
import { getDrones, getMissions } from '../../services/api';
import MissionCard from './MissionCard';
import DroneCard from './DroneCard';
import MissionPlanner from '../MissionPlanner/MissionPlanner';

export default function DashboardPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMissionPlanner, setShowMissionPlanner] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [missionsData, dronesData] = await Promise.all([
        getMissions(),
        getDrones()
      ]);
      setMissions(missionsData);
      setDrones(dronesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleMissionUpdate = () => {
    fetchData();
  };

  const handleDroneUpdate = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mission Control</h1>
        <button
          onClick={() => setShowMissionPlanner(!showMissionPlanner)}
          className="btn btn-primary"
        >
          {showMissionPlanner ? 'Hide Mission Planner' : 'Plan New Mission'}
        </button>
      </div>

      {showMissionPlanner && (
        <div className="mb-8">
          <MissionPlanner onMissionCreated={handleMissionUpdate} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Missions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Missions</h2>
          <div className="space-y-4">
            {missions
              .filter(m => ['in-progress', 'paused'].includes(m.status))
              .map(mission => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onMissionUpdate={handleMissionUpdate}
                />
              ))}
          </div>
        </div>

        {/* Drone Fleet */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Drone Fleet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drones.map(drone => (
              <DroneCard
                key={drone.id}
                drone={drone}
                onStatusUpdate={handleDroneUpdate}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scheduled Missions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Scheduled Missions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions
            .filter(m => m.status === 'scheduled')
            .map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onMissionUpdate={handleMissionUpdate}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
