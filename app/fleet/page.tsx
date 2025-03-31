"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Battery, Calendar, AlertCircle } from 'lucide-react';

interface Drone {
  _id: string;
  name: string;
  model: string;
  status: 'available' | 'in-mission' | 'maintenance';
  batteryLevel: number;
  lastMaintenance: string;
  maxPayload: number;
  maxFlightTime: number;
  maxRange: number;
}

export default function FleetPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      const response = await fetch('/api/drones');
      if (!response.ok) {
        throw new Error('Failed to fetch drones');
      }
      const data = await response.json();
      setDrones(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drones');
      toast.error('Failed to fetch drones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const availableDrones = drones.filter(drone => drone.status === 'available');
  const inMissionDrones = drones.filter(drone => drone.status === 'in-mission');
  const maintenanceDrones = drones.filter(drone => drone.status === 'maintenance');
  const lowBatteryDrones = drones.filter(drone => drone.batteryLevel < 20);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Drone Fleet</h1>
            <p className="mt-2 text-lg text-gray-600">Manage and monitor your drone fleet</p>
          </div>
          <Link href="/fleet/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Add New Drone
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Total Drones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{drones.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{availableDrones.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">In Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{inMissionDrones.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{maintenanceDrones.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {lowBatteryDrones.length > 0 && (
          <div className="mb-8">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Low Battery Alert</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{lowBatteryDrones.length} drone{lowBatteryDrones.length !== 1 ? 's' : ''} have battery levels below 20%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drones.map((drone) => (
            <Card key={drone._id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-900">{drone.name}</CardTitle>
                    <p className="text-sm text-gray-500">{drone.model}</p>
                  </div>
                  <Badge variant={
                    drone.status === 'available' ? 'default' :
                    drone.status === 'in-mission' ? 'secondary' :
                    'outline'
                  }>
                    {drone.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Battery className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Battery Level:</span>
                    <span className={`ml-2 font-medium ${
                      drone.batteryLevel < 20 ? 'text-red-600' :
                      drone.batteryLevel < 50 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {drone.batteryLevel}%
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Last Maintenance:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(drone.lastMaintenance).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Max Payload</span>
                      <p className="font-medium text-gray-900">{drone.maxPayload}kg</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Flight Time</span>
                      <p className="font-medium text-gray-900">{drone.maxFlightTime}min</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Max Range</span>
                      <p className="font-medium text-gray-900">{drone.maxRange}km</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
