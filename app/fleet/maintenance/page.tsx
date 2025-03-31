'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface Drone {
  id: string;
  name: string;
  model: string;
  status: 'available' | 'in-mission' | 'maintenance';
  batteryLevel: number;
  lastMaintenance: string;
}

export default function MaintenancePage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      console.error('Error fetching drones:', error);
      toast.error('Failed to fetch drones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaintenanceUpdate = async (droneId: string, action: 'start' | 'complete') => {
    try {
      const response = await fetch(`/api/drones/${droneId}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update maintenance status');
      }

      toast.success(`Maintenance ${action === 'start' ? 'started' : 'completed'} successfully`);
      fetchDrones();
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      toast.error('Failed to update maintenance status');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  const maintenanceDrones = drones.filter(drone => drone.status === 'maintenance');
  const otherDrones = drones.filter(drone => drone.status !== 'maintenance');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Drone Maintenance</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Drones Under Maintenance</h2>
          <div className="grid gap-4">
            {maintenanceDrones.map((drone) => (
              <div
                key={drone.id}
                className="border rounded-lg p-4 bg-yellow-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{drone.name}</h3>
                    <p className="text-sm text-gray-600">{drone.model}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    Maintenance
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Battery Level:</span> {drone.batteryLevel}%
                  </div>
                  <div>
                    <span className="font-medium">Last Maintenance:</span>{' '}
                    {new Date(drone.lastMaintenance).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleMaintenanceUpdate(drone.id, 'complete')}
                  >
                    Complete Maintenance
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Available Drones</h2>
          <div className="grid gap-4">
            {otherDrones.map((drone) => (
              <div
                key={drone.id}
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{drone.name}</h3>
                    <p className="text-sm text-gray-600">{drone.model}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      drone.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {drone.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Battery Level:</span> {drone.batteryLevel}%
                  </div>
                  <div>
                    <span className="font-medium">Last Maintenance:</span>{' '}
                    {new Date(drone.lastMaintenance).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleMaintenanceUpdate(drone.id, 'start')}
                  >
                    Start Maintenance
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 