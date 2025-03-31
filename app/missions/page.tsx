"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mission, MissionStatus } from '../types/mission';
import { toast } from 'react-hot-toast';
import MissionCard from '../components/Dashboard/MissionCard';

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MissionStatus | 'all'>('all');

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch('/api/missions');
      if (!response.ok) {
        throw new Error('Failed to fetch missions');
      }
      const data = await response.json();
      setMissions(data);
    } catch (error) {
      console.error('Error fetching missions:', error);
      setError('Failed to load missions');
      toast.error('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: MissionStatus) => {
    try {
      const response = await fetch('/api/missions/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId: id, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mission status');
      }

      // Refresh the missions list to get updated data
      await fetchMissions();
      toast.success('Mission status updated successfully');
    } catch (error) {
      console.error('Error updating mission status:', error);
      toast.error('Failed to update mission status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/missions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete mission');
      }

      setMissions(missions.filter(mission => mission._id !== id));
      toast.success('Mission deleted successfully');
    } catch (error) {
      console.error('Error deleting mission:', error);
      toast.error('Failed to delete mission');
    }
  };

  const filteredMissions = missions.filter(mission => 
    filter === 'all' ? true : mission.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchMissions}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Missions</h1>
        <Button onClick={() => window.location.href = '/missions/new'}>
          Create New Mission
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-48">
            <Label>Filter by Status</Label>
            <Select value={filter} onValueChange={(value: MissionStatus | 'all') => setFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Missions</SelectItem>
                <SelectItem value={MissionStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={MissionStatus.SCHEDULED}>Scheduled</SelectItem>
                <SelectItem value={MissionStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={MissionStatus.PAUSED}>Paused</SelectItem>
                <SelectItem value={MissionStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={MissionStatus.ABORTED}>Aborted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredMissions.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                No missions found
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredMissions.map(mission => (
            <MissionCard
              key={mission._id}
              mission={mission}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
