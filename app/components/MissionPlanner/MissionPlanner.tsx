"use client";

import { useState, useEffect } from 'react';
import { Mission, Drone, CreateMissionDto } from '../../types/mission';
import { getDrones, createMission } from '../../services/api';
import MissionForm from './MissionForm';

interface MissionPlannerProps {
  onMissionCreated?: () => void;
}

export default function MissionPlanner({ onMissionCreated }: MissionPlannerProps) {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      const data = await getDrones('available');
      setDrones(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (missionData: CreateMissionDto) => {
    try {
      await createMission(missionData);
      // Refresh available drones after mission creation
      fetchDrones();
      onMissionCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchDrones}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Plan New Mission</h1>
      <MissionForm onSubmit={handleSubmit} availableDrones={drones} />
    </div>
  );
}
