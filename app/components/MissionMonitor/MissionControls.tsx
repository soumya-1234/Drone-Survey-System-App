import React from 'react';
import { MissionStatus } from '../../types/mission';

interface MissionControlsProps {
  status: MissionStatus;
  onPause: () => void;
  onResume: () => void;
  onReturn: () => void;
  onAbort: () => void;
}

const MissionControls: React.FC<MissionControlsProps> = ({
  status,
  onPause,
  onResume,
  onReturn,
  onAbort,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Mission Controls</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {status === 'in-progress' ? (
          <button
            onClick={onPause}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-warning hover:bg-warning/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning"
          >
            Pause Mission
          </button>
        ) : status === 'paused' ? (
          <button
            onClick={onResume}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-info hover:bg-info/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
          >
            Resume Mission
          </button>
        ) : null}

        <button
          onClick={onReturn}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-info hover:bg-info/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info"
          disabled={status === 'completed' || status === 'failed'}
        >
          Return to Home
        </button>

        <button
          onClick={onAbort}
          className="col-span-2 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-danger hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
          disabled={status === 'completed' || status === 'failed'}
        >
          Abort Mission
        </button>
      </div>
    </div>
  );
};

export default MissionControls;
