"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mission, Drone, MissionStatus } from '../../types/mission';
import { getMissionStatus, controlMission, getDrones, startMission } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { MapPin, Clock, Calendar, Settings, Play, Pause, Trash2 } from 'lucide-react';

interface MissionCardProps {
  mission: Mission;
  onStatusChange?: (id: string, status: MissionStatus) => void;
  onDelete?: (id: string) => void;
}

export default function MissionCard({ mission, onStatusChange, onDelete }: MissionCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignedDrones, setAssignedDrones] = useState<Drone[]>([]);
  const [localStatus, setLocalStatus] = useState(mission.status);

  useEffect(() => {
    const fetchAssignedDrones = async () => {
      try {
        const response = await fetch('/api/drones');
        if (!response.ok) {
          throw new Error('Failed to fetch drones');
        }
        const data = await response.json();
        setAssignedDrones(data);
      } catch (error) {
        console.error('Error fetching assigned drones:', error);
      }
    };

    if (mission.droneId) {
      fetchAssignedDrones();
    }
  }, [mission.droneId]);

  // Update local status when mission prop changes
  useEffect(() => {
    setLocalStatus(mission.status);
  }, [mission.status]);

  const handleStatusChange = async (newStatus: MissionStatus) => {
    try {
      const response = await fetch('/api/missions/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          missionId: mission._id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mission status');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setLocalStatus(newStatus);
        // Call the parent callback if provided
        if (onStatusChange) {
          await onStatusChange(mission._id, newStatus);
        }
        toast.success('Mission status updated successfully');
      } else {
        throw new Error(data.error || 'Failed to update mission status');
      }
    } catch (error) {
      console.error('Error updating mission status:', error);
      toast.error('Failed to update mission status');
      // Revert local state on error
      setLocalStatus(mission.status);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/missions/${mission._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete mission');
      }

      toast.success('Mission deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting mission:', error);
      toast.error('Failed to delete mission');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAssignDrone = async (droneId: string) => {
    try {
      const response = await fetch(`/api/missions/${mission._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ droneId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign drone');
      }

      const updatedMission = await response.json();
      onStatusChange?.(updatedMission._id, updatedMission.status);
      toast.success('Drone assigned successfully');
    } catch (error) {
      console.error('Error assigning drone:', error);
      toast.error('Failed to assign drone');
    }
  };

  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case MissionStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case MissionStatus.IN_PROGRESS:
        return 'bg-green-100 text-green-800';
      case MissionStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case MissionStatus.ABORTED:
        return 'bg-red-100 text-red-800';
      case MissionStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-800';
      case MissionStatus.PENDING:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      // If it's already a Date object, format it directly
      if (date instanceof Date) {
        return format(date, 'MMM d, yyyy HH:mm');
      }
      // Try parsing as ISO string first
      return format(parseISO(date), 'MMM d, yyyy HH:mm');
    } catch (error) {
      try {
        // If that fails, try parsing as regular date string
        return format(new Date(date), 'MMM d, yyyy HH:mm');
      } catch (error) {
        // If both fail, return a fallback
        return 'Invalid date';
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{mission.name}</CardTitle>
        <Badge variant={localStatus === MissionStatus.IN_PROGRESS ? 'default' : 'secondary'}>
          {localStatus}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Drone: {mission.droneId || 'Not assigned'}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Start Date</div>
              <div className="text-sm text-gray-500">
                {formatDate(mission.startDate)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">End Date</div>
              <div className="text-sm text-gray-500">
                {formatDate(mission.endDate)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Altitude</div>
              <div className="text-sm text-gray-500">{mission.altitude || 0}m</div>
            </div>
            <div>
              <div className="text-sm font-medium">Speed</div>
              <div className="text-sm text-gray-500">{mission.speed || 0}m/s</div>
            </div>
          </div>

          {mission.dataCollection && (
            <div>
              <div className="text-sm font-medium">Resolution</div>
              <div className="text-sm text-gray-500">
                {mission.dataCollection.resolution}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Link href={`/missions/${mission._id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(mission._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {onStatusChange && localStatus === MissionStatus.PENDING && (
              <Button
                size="sm"
                onClick={() => handleStatusChange(MissionStatus.IN_PROGRESS)}
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}
            {onStatusChange && localStatus === MissionStatus.IN_PROGRESS && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusChange(MissionStatus.PAUSED)}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
