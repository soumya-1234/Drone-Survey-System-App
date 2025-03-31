"use client";

import { useState, useEffect } from 'react';
import { Mission } from '../types/mission';
import { getMissions } from '../services/api';
import { MissionCard } from '../components/Dashboard/MissionCard';

export default function MonitoringPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchMissions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const data = await getMissions(['in-progress', 'paused']);
      setMissions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch missions');
    } finally {
      setLoading(false);
    }
  };

  if (loading && missions.length === 0) {
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
            onClick={fetchMissions}
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
        <h1 className="text-3xl font-bold">Mission Monitoring</h1>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          )}
          <span className="text-sm text-gray-500">
            Auto-refreshing every 10 seconds
          </span>
        </div>
      </div>

      {missions.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No Active Missions</h3>
          <p className="mt-2 text-sm text-gray-500">
            There are currently no missions in progress or paused.
          </p>
          <button
            onClick={() => window.location.href = '/missions/new'}
            className="mt-4 btn btn-primary"
          >
            Create New Mission
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {missions.map(mission => (
            <div key={mission._id} className="bg-white rounded-lg shadow-lg p-6">
              <MissionCard
                mission={mission}
                onUpdate={fetchMissions}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
