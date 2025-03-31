'use client';

import MissionPlanner from '@/components/MissionPlanning/MissionPlanner';

export default function MissionPlanningPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mission Planning</h1>
          <p className="mt-2 text-lg text-gray-600">
            Define survey areas, configure flight paths, and set up mission parameters
          </p>
        </div>
        <MissionPlanner />
      </div>
    </div>
  );
} 