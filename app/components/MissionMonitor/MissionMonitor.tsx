"use client";

import React from 'react';
import { Mission } from '../../types/mission';
import MissionControls from './MissionControls';
import MissionProgress from './MissionProgress';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('../Map/MapComponent'), { ssr: false });

interface MissionMonitorProps {
  mission: Mission;
  onPause: () => void;
  onResume: () => void;
  onReturn: () => void;
  onAbort: () => void;
}

const MissionMonitor: React.FC<MissionMonitorProps> = ({
  mission,
  onPause,
  onResume,
  onReturn,
  onAbort,
}) => {
  return (
    <div className="h-full flex flex-col">
      <header className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{mission.name}</h1>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-6 p-6">
        <div className="col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <MapComponent
            waypoints={mission.waypoints.map(wp => ({
              lat: wp.latitude,
              lng: wp.longitude,
              altitude: wp.altitude
            }))}
            center={{
              lat: mission.waypoints[0]?.latitude || 0,
              lng: mission.waypoints[0]?.longitude || 0
            }}
          />
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <MissionProgress mission={mission} />
          <MissionControls
            status={mission.status}
            onPause={onPause}
            onResume={onResume}
            onReturn={onReturn}
            onAbort={onAbort}
          />
        </div>
      </div>
    </div>
  );
};

export default MissionMonitor;
