'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { MissionStatus, Drone } from '../../types/mission';

export default function NewMission() {
  const router = useRouter();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    droneId: '',
    startDate: '',
    endDate: '',
    flightPath: [[0, 0]], // Default empty flight path
    altitude: 100, // Default altitude in meters
    speed: 10, // Default speed in m/s
    dataCollection: {
      frequency: 1,
      sensors: ['RGB Camera'],
      resolution: 'Medium'
    }
  });

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const response = await fetch('/api/drones');
        if (!response.ok) throw new Error('Failed to fetch drones');
        const data = await response.json();
        setDrones(data);
      } catch (error) {
        console.error('Error fetching drones:', error);
        toast.error('Failed to load available drones');
      } finally {
        setLoading(false);
      }
    };

    fetchDrones();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create mission');
      }

      toast.success('Mission created successfully');
      router.push('/missions');
    } catch (error) {
      console.error('Error creating mission:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create mission');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDataCollectionChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      dataCollection: {
        ...prev.dataCollection,
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Mission</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <Label htmlFor="name">Mission Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="droneId">Select Drone</Label>
          <Select
            value={formData.droneId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, droneId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a drone" />
            </SelectTrigger>
            <SelectContent>
              {drones.map((drone) => (
                <SelectItem key={drone._id} value={drone._id}>
                  {drone.name} ({drone.model})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="altitude">Altitude (meters)</Label>
            <Input
              id="altitude"
              name="altitude"
              type="number"
              value={formData.altitude}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="speed">Speed (m/s)</Label>
            <Input
              id="speed"
              name="speed"
              type="number"
              value={formData.speed}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
        </div>

        <div>
          <Label>Data Collection Settings</Label>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="frequency">Collection Frequency (seconds)</Label>
              <Input
                id="frequency"
                type="number"
                value={formData.dataCollection.frequency}
                onChange={(e) => handleDataCollectionChange('frequency', Number(e.target.value))}
                required
                min="1"
              />
            </div>

            <div>
              <Label>Select Sensors</Label>
              <Select
                value={formData.dataCollection.sensors[0]}
                onValueChange={(value) => handleDataCollectionChange('sensors', [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sensor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RGB Camera">RGB Camera</SelectItem>
                  <SelectItem value="Thermal Camera">Thermal Camera</SelectItem>
                  <SelectItem value="LiDAR">LiDAR</SelectItem>
                  <SelectItem value="Multispectral">Multispectral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Resolution</Label>
              <Select
                value={formData.dataCollection.resolution}
                onValueChange={(value) => handleDataCollectionChange('resolution', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/missions')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Create Mission
          </button>
        </div>
      </form>
    </div>
  );
} 