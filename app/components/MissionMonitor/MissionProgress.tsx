import React from 'react';
import { Mission } from '../../types/mission';

interface MissionProgressProps {
  mission: Mission;
}

const MissionProgress: React.FC<MissionProgressProps> = ({ mission }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-info';
      case 'paused':
        return 'bg-warning';
      case 'completed':
        return 'bg-success';
      case 'failed':
        return 'bg-danger';
      default:
        return 'bg-gray-500';
    }
  };

  const progressPercentage = Math.round(
    (mission.progress?.completedWaypoints || 0) / (mission.waypoints?.length || 1) * 100
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Mission Progress</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white capitalize ${getStatusColor(mission.status)}`}>
          {mission.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-500">Overall Progress</span>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-in-out ${getStatusColor(mission.status)}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900">{progressPercentage}% Complete</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Waypoints</span>
            <span className="text-sm font-medium text-gray-900">
              {mission.progress?.completedWaypoints || 0} / {mission.waypoints?.length || 0}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Distance</span>
            <span className="text-sm font-medium text-gray-900">
              {mission.progress?.distanceCovered || 0}m
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900">Time Information</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Start Time</span>
          <span className="text-sm font-medium text-gray-900">
            {new Date(mission.startTime).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Duration</span>
          <span className="text-sm font-medium text-gray-900">
            {mission.progress?.duration || '0:00'}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Flight Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Altitude</span>
            <span className="text-sm font-medium text-gray-900">
              {mission.flightParameters.altitude}m
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Speed</span>
            <span className="text-sm font-medium text-gray-900">
              {mission.flightParameters.speed}m/s
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Sensor Type</span>
            <span className="text-sm font-medium text-gray-900">
              {mission.flightParameters.sensorType}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Capture Interval</span>
            <span className="text-sm font-medium text-gray-900">
              {mission.flightParameters.captureInterval}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionProgress;
