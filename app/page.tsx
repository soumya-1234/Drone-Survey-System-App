"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Drone {
  id: string;
  name: string;
  model: string;
  status: 'available' | 'in-mission' | 'maintenance';
  batteryLevel: number;
  lastMaintenance: string;
}

interface Mission {
  id: string;
  name: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'aborted';
  startDate: string;
  endDate: string | null;
  droneIds?: string[];
}

export default function HomePage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dronesResponse, missionsResponse] = await Promise.all([
        fetch('/api/drones'),
        fetch('/api/missions')
      ]);

      if (!dronesResponse.ok || !missionsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [dronesData, missionsData] = await Promise.all([
        dronesResponse.json(),
        missionsResponse.json()
      ]);

      const processedMissions = missionsData.map((mission: Mission) => ({
        ...mission,
        droneIds: mission.droneIds || []
      }));

      setDrones(dronesData);
      setMissions(processedMissions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const availableDrones = drones.filter(drone => drone.status === 'available');
  const inMissionDrones = drones.filter(drone => drone.status === 'in-mission');
  const maintenanceDrones = drones.filter(drone => drone.status === 'maintenance');

  const activeMissions = missions.filter(mission => mission.status === 'in-progress');
  const scheduledMissions = missions.filter(mission => mission.status === 'scheduled');
  const completedMissions = missions.filter(mission => mission.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Drone Survey System</h1>
            <p className="mt-2 text-lg text-gray-600">Monitor and manage your drone fleet</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/missions/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                New Mission
              </Button>
            </Link>
            <Link href="/fleet/new">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Add Drone
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Fleet Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Drones</span>
                  <span className="font-semibold text-gray-900">{drones.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available</span>
                  <span className="font-semibold text-green-600">{availableDrones.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In Mission</span>
                  <span className="font-semibold text-blue-600">{inMissionDrones.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Maintenance</span>
                  <span className="font-semibold text-yellow-600">{maintenanceDrones.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Mission Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Missions</span>
                  <span className="font-semibold text-blue-600">{activeMissions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Scheduled</span>
                  <span className="font-semibold text-yellow-600">{scheduledMissions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{completedMissions.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Battery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Battery</span>
                  <span className="font-semibold text-gray-900">
                    {drones.length > 0
                      ? Math.round(drones.reduce((acc, drone) => acc + drone.batteryLevel, 0) / drones.length)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Low Battery Drones</span>
                  <span className="font-semibold text-red-600">
                    {drones.filter(drone => drone.batteryLevel < 20).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Missions */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Recent Missions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missions.slice(0, 5).map((mission) => (
                  <div key={mission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{mission.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(mission.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {(mission.droneIds || []).length} drones
                      </span>
                      <Badge variant={
                        mission.status === 'completed' ? 'default' :
                        mission.status === 'in-progress' ? 'secondary' :
                        'outline'
                      }>
                        {mission.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Drone Status */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Drone Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drones.slice(0, 5).map((drone) => (
                  <div key={drone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{drone.name}</h3>
                      <p className="text-sm text-gray-500">{drone.model}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Battery: </span>
                        <span className="font-medium text-gray-900">{drone.batteryLevel}%</span>
                      </div>
                      <Badge variant={
                        drone.status === 'available' ? 'default' :
                        drone.status === 'in-mission' ? 'secondary' :
                        'outline'
                      }>
                        {drone.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
