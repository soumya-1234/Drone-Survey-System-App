"use client";

import { useState, useEffect } from 'react';
import { CreateMissionDto, Waypoint, Drone } from '../../types/mission';

interface MissionFormProps {
  onSubmit: (mission: CreateMissionDto) => void;
  availableDrones: Drone[];
}

export default function MissionForm({ onSubmit, availableDrones }: MissionFormProps) {
  const [mission, setMission] = useState<CreateMissionDto>({
    name: '',
    waypoints: [],
    drones: [],
    scheduledTime: undefined
  });

  const [selectedDrones, setSelectedDrones] = useState<number[]>([]);
  const [waypoint, setWaypoint] = useState<Omit<Waypoint, 'id'>>({
    latitude: 0,
    longitude: 0,
    altitude: 0,
    speed: 0,
    action: 'photo'
  });

  const handleAddWaypoint = () => {
    setMission(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, waypoint]
    }));
    setWaypoint({
      latitude: 0,
      longitude: 0,
      altitude: 0,
      speed: 0,
      action: 'photo'
    });
  };

  const handleRemoveWaypoint = (index: number) => {
    setMission(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index)
    }));
  };

  const handleDroneSelection = (droneId: number) => {
    setSelectedDrones(prev => {
      if (prev.includes(droneId)) {
        return prev.filter(id => id !== droneId);
      }
      return [...prev, droneId];
    });

    setMission(prev => ({
      ...prev,
      drones: selectedDrones
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(mission);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mission Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Mission Name
        </label>
        <input
          type="text"
          id="name"
          value={mission.name}
          onChange={(e) => setMission(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      {/* Drone Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Select Drones</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableDrones.map(drone => (
            <div
              key={drone.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedDrones.includes(drone.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => handleDroneSelection(drone.id)}
            >
              <div className="font-medium">{drone.name}</div>
              <div className="text-sm text-gray-500">{drone.model}</div>
              <div className="text-sm text-gray-500">Battery: {drone.batteryLevel}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Waypoints */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Waypoints</h3>
        <div className="space-y-4">
          {/* Add Waypoint Form */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <input
              type="number"
              placeholder="Latitude"
              value={waypoint.latitude}
              onChange={(e) => setWaypoint(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
              className="form-input"
              step="any"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={waypoint.longitude}
              onChange={(e) => setWaypoint(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
              className="form-input"
              step="any"
            />
            <input
              type="number"
              placeholder="Altitude (m)"
              value={waypoint.altitude}
              onChange={(e) => setWaypoint(prev => ({ ...prev, altitude: parseFloat(e.target.value) }))}
              className="form-input"
              step="any"
            />
            <input
              type="number"
              placeholder="Speed (m/s)"
              value={waypoint.speed}
              onChange={(e) => setWaypoint(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
              className="form-input"
              step="any"
            />
            <select
              value={waypoint.action}
              onChange={(e) => setWaypoint(prev => ({ ...prev, action: e.target.value as 'photo' | 'video' | 'hover' }))}
              className="form-select"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="hover">Hover</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddWaypoint}
            className="btn btn-secondary w-full"
          >
            Add Waypoint
          </button>

          {/* Waypoints List */}
          <div className="space-y-2">
            {mission.waypoints.map((wp, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="text-sm">
                  <span className="font-medium">Waypoint {index + 1}:</span>
                  {` ${wp.latitude.toFixed(6)}, ${wp.longitude.toFixed(6)}, ${wp.altitude}m, ${wp.speed}m/s - ${wp.action}`}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveWaypoint(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Time */}
      <div>
        <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
          Schedule Time (optional)
        </label>
        <input
          type="datetime-local"
          id="scheduledTime"
          value={mission.scheduledTime || ''}
          onChange={(e) => setMission(prev => ({ ...prev, scheduledTime: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={mission.waypoints.length === 0 || selectedDrones.length === 0}
        >
          Create Mission
        </button>
      </div>
    </form>
  );
}
