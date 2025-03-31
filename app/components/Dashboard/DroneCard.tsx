"use client";

import { useState } from 'react';
import { Drone, DroneStatus } from '../../types/mission';
import { updateDroneStatus } from '../../services/api';

interface DroneCardProps {
  drone: Drone;
  onStatusUpdate: () => void;
}

export default function DroneCard({ drone, onStatusUpdate }: DroneCardProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: DroneStatus) => {
    try {
      setUpdating(true);
      await updateDroneStatus(drone.id, newStatus);
      onStatusUpdate();
    } catch (error: any) {
      console.error('Failed to update drone status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 70) return 'bg-green-500';
    if (level >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: DroneStatus) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'in-mission': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLastSeenText = (lastSeen: Date) => {
    const minutes = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 relative">
      {updating && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{drone.name}</h3>
          <p className="text-sm text-gray-500">{drone.model}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(drone.status)}`}>
          {drone.status}
        </span>
      </div>

      {/* Battery Level */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Battery</span>
          <span>{drone.batteryLevel}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBatteryColor(drone.batteryLevel)} transition-all`}
            style={{ width: `${drone.batteryLevel}%` }}
          />
        </div>
      </div>

      {/* Last Seen */}
      <div className="text-sm text-gray-500 mb-4">
        Last seen: {getLastSeenText(drone.lastSeen)}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {drone.status !== 'available' && (
          <button
            onClick={() => handleStatusUpdate('available')}
            className="btn btn-sm btn-secondary flex-1"
            disabled={updating}
          >
            Mark Available
          </button>
        )}
        {drone.status !== 'maintenance' && (
          <button
            onClick={() => handleStatusUpdate('maintenance')}
            className="btn btn-sm btn-warning flex-1"
            disabled={updating}
          >
            Maintenance
          </button>
        )}
      </div>
    </div>
  );
}
