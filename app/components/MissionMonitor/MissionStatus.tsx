import React from 'react';
import { Mission, MissionStatus } from '../../types/mission';

interface MissionStatusProps {
  mission: Mission;
}

const MissionStatusComponent: React.FC<MissionStatusProps> = ({ mission }) => {
  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'in-progress':
        return 'text-info';
      case 'completed':
        return 'text-success';
      case 'aborted':
        return 'text-error';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: MissionStatus) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'aborted':
        return 'Aborted';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Mission Status</h2>
      
      <div className="space-y-4">
        <div>
          <span className="text-sm text-gray-500">Status:</span>
          <span className={`ml-2 font-medium ${getStatusColor(mission.status)}`}>
            {getStatusText(mission.status)}
          </span>
        </div>

        {mission.progress && (
          <>
            <div>
              <span className="text-sm text-gray-500">Progress:</span>
              <span className="ml-2 font-medium">
                {mission.progress.completedWaypoints} / {mission.waypoints.length} waypoints
              </span>
            </div>

            <div>
              <span className="text-sm text-gray-500">Distance Covered:</span>
              <span className="ml-2 font-medium">
                {mission.progress.distanceCovered}m
              </span>
            </div>

            <div>
              <span className="text-sm text-gray-500">Duration:</span>
              <span className="ml-2 font-medium">{mission.progress.duration}</span>
            </div>

            <div>
              <span className="text-sm text-gray-500">Battery:</span>
              <span className="ml-2 font-medium">
                {mission.progress.batteryRemaining}%
              </span>
            </div>
          </>
        )}

        <div>
          <span className="text-sm text-gray-500">Start Time:</span>
          <span className="ml-2 font-medium">
            {new Date(mission.startTime).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MissionStatusComponent;
