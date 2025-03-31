'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { toast } from 'react-hot-toast';
import { Mission, MissionStatus } from '../../types/mission';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Settings, 
  Play, 
  Pause, 
  Trash2,
  ArrowLeft,
  Route,
  Timer,
  AreaChart,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface MissionStatistics {
  totalWaypoints: number;
  totalDistance: number;
  estimatedDuration: number;
  coverageArea: number;
  status: MissionStatus;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export default function MissionPage() {
  const params = useParams();
  const [mission, setMission] = useState<Mission | null>(null);
  const [statistics, setStatistics] = useState<MissionStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissionData = async () => {
      try {
        const [missionResponse, statsResponse] = await Promise.all([
          fetch(`/api/missions/${params.id}`),
          fetch(`/api/missions/${params.id}/statistics`)
        ]);

        if (!missionResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to fetch mission data');
        }

        const [missionData, statsData] = await Promise.all([
          missionResponse.json(),
          statsResponse.json()
        ]);

        setMission(missionData);
        setStatistics(statsData);
      } catch (error) {
        console.error('Error fetching mission data:', error);
        toast.error('Failed to load mission details');
      } finally {
        setLoading(false);
      }
    };

    fetchMissionData();
  }, [params.id]);

  const handleStatusChange = async (newStatus: MissionStatus) => {
    if (!mission) return;

    try {
      const response = await fetch(`/api/missions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mission status');
      }

      setMission((prev: Mission | null) => prev ? { ...prev, status: newStatus } : null);
      toast.success('Mission status updated successfully');
    } catch (error) {
      console.error('Error updating mission status:', error);
      toast.error('Failed to update mission status');
    }
  };

  const handleDelete = async () => {
    if (!mission) return;

    if (!confirm('Are you sure you want to delete this mission?')) {
      return;
    }

    try {
      const response = await fetch(`/api/missions/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete mission');
      }

      toast.success('Mission deleted successfully');
      // Redirect to missions list
      window.location.href = '/missions';
    } catch (error) {
      console.error('Error deleting mission:', error);
      toast.error('Failed to delete mission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!mission || !statistics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Mission not found</h1>
        <Link href="/missions">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Missions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/missions">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Missions
          </Button>
        </Link>
        <div className="space-x-4">
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Mission
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{mission.name}</span>
              <Badge variant={mission.status === MissionStatus.IN_PROGRESS ? 'default' : 'secondary'}>
                {mission.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{mission.description}</p>
            
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>Drone: {mission.droneId}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Start: {new Date(mission.startDate).toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>End: {new Date(mission.endDate).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Mission Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Mission Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Route className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500">Total Distance</span>
                  <p className="font-medium">{(statistics.totalDistance / 1000).toFixed(2)} km</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500">Estimated Duration</span>
                  <p className="font-medium">{Math.round(statistics.estimatedDuration / 60)} minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <AreaChart className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500">Coverage Area</span>
                  <p className="font-medium">{(statistics.coverageArea / 10000).toFixed(2)} hectares</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500">Waypoints</span>
                  <p className="font-medium">{statistics.totalWaypoints}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Mission Progress</span>
                <span>{statistics.progress.percentage}%</span>
              </div>
              <Progress value={statistics.progress.percentage} />
            </div>
          </CardContent>
        </Card>

        {/* Flight Path Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Flight Path
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Altitude</span>
                  <p>{mission.altitude}m</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Speed</span>
                  <p>{mission.speed}m/s</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Waypoints</h3>
              <div className="space-y-2">
                {mission.flightPath.map((coord: [number, number], index: number) => (
                  <div key={index} className="text-sm">
                    Point {index + 1}: [{coord[0].toFixed(6)}, {coord[1].toFixed(6)}]
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Data Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Frequency</span>
                  <p>{mission.dataCollection.frequency}Hz</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Resolution</span>
                  <p>{mission.dataCollection.resolution}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Sensors</h3>
              <div className="space-y-2">
                {mission.dataCollection.sensors.map((sensor: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>{sensor}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Mission Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={() => handleStatusChange(MissionStatus.IN_PROGRESS)}
                disabled={mission.status === MissionStatus.IN_PROGRESS}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Mission
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleStatusChange(MissionStatus.PAUSED)}
                disabled={mission.status === MissionStatus.PAUSED}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Mission
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 