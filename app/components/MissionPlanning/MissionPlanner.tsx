'use client';

import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  Trash2, 
  Play, 
  Pause, 
  Settings, 
  MapPin,
  Clock,
  Calendar,
  Repeat
} from 'lucide-react';

// Initialize Mapbox with the access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Waypoint {
  id: string;
  coordinates: [number, number];
  altitude: number;
  speed: number;
}

interface FlightPath {
  id: string;
  name: string;
  waypoints: Waypoint[];
  altitude: number;
  speed: number;
}

interface MissionConfig {
  name: string;
  description: string;
  droneId: string;
  startDate: string;
  endDate: string;
  flightPath: [number, number][];  // Array of coordinates
  altitude: number;
  speed: number;
  dataCollection: {
    frequency: number;
    sensors: string[];
    resolution: 'Low' | 'Medium' | 'High';
  };
}

export default function MissionPlanner() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [missionConfig, setMissionConfig] = useState<MissionConfig>({
    name: '',
    description: '',
    droneId: '',  // This should be selected from available drones
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    flightPath: [],
    altitude: 100,
    speed: 10,
    dataCollection: {
      frequency: 1,
      sensors: [],
      resolution: 'Medium',
    },
  });

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-73.935242, 40.730610],
        zoom: 12,
        pitch: 60,
        bearing: -60,
        antialias: true,
        preserveDrawingBuffer: true
      });

      // Initialize draw control
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'draw_polygon'
      });

      map.current.on('load', () => {
        // Add drawing controls
        map.current?.addControl(draw, 'top-left');

        // Add navigation controls
        map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add scale control
        map.current?.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const startDrawing = () => {
    setIsDrawing(true);
    if (map.current) {
      map.current.on('click', (e) => {
        const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        setWaypoints([...waypoints, coordinates]);
      });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (map.current) {
      map.current.off('click', () => {});
    }
  };

  const saveFlightPath = () => {
    if (waypoints.length < 2) {
      toast.error('At least 2 waypoints are required for a flight path');
      return;
    }

    setMissionConfig(prev => ({
      ...prev,
      flightPath: waypoints,
    }));
    toast.success('Flight path saved successfully');
  };

  const clearFlightPath = () => {
    setWaypoints([]);
    setMissionConfig(prev => ({
      ...prev,
      flightPath: [],
    }));
  };

  const saveMission = async () => {
    try {
      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missionConfig),
      });

      if (!response.ok) throw new Error('Failed to save mission');

      toast.success('Mission saved successfully');
    } catch (error) {
      toast.error('Failed to save mission');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Map Section */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="space-y-4">
            <Button
              onClick={isDrawing ? stopDrawing : startDrawing}
              variant={isDrawing ? 'destructive' : 'default'}
            >
              {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
            </Button>
            <Button onClick={saveFlightPath} disabled={!isDrawing || waypoints.length < 2}>
              <Save className="h-4 w-4 mr-2" />
              Save Flight Path
            </Button>
            <Button onClick={clearFlightPath} variant="destructive" disabled={!missionConfig.flightPath.length}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Path
            </Button>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="w-96 bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Mission Configuration</h2>
        
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Mission Name</Label>
              <Input
                id="name"
                value={missionConfig.name}
                onChange={(e) => setMissionConfig(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={missionConfig.description}
                onChange={(e) => setMissionConfig(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="droneId">Drone</Label>
              <Select
                value={missionConfig.droneId}
                onValueChange={(value) => {
                  setMissionConfig(prev => ({ ...prev, droneId: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a drone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drone1">Drone 1</SelectItem>
                  <SelectItem value="drone2">Drone 2</SelectItem>
                  <SelectItem value="drone3">Drone 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Flight Path Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Flight Path Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="altitude">Altitude (m)</Label>
              <Input
                id="altitude"
                type="number"
                value={missionConfig.altitude}
                onChange={(e) => setMissionConfig(prev => ({
                  ...prev,
                  altitude: Number(e.target.value)
                }))}
              />
            </div>
            <div>
              <Label htmlFor="speed">Speed (m/s)</Label>
              <Input
                id="speed"
                type="number"
                value={missionConfig.speed}
                onChange={(e) => setMissionConfig(prev => ({
                  ...prev,
                  speed: Number(e.target.value)
                }))}
              />
            </div>
            <div className="text-sm text-gray-500">
              {waypoints.length} waypoints defined
            </div>
          </CardContent>
        </Card>

        {/* Data Collection Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Data Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="frequency">Collection Frequency (Hz)</Label>
              <Input
                id="frequency"
                type="number"
                value={missionConfig.dataCollection.frequency}
                onChange={(e) => setMissionConfig(prev => ({
                  ...prev,
                  dataCollection: { ...prev.dataCollection, frequency: Number(e.target.value) }
                }))}
              />
            </div>
            <div>
              <Label>Resolution</Label>
              <Select
                value={missionConfig.dataCollection.resolution}
                onValueChange={(value: 'Low' | 'Medium' | 'High') => {
                  setMissionConfig(prev => ({
                    ...prev,
                    dataCollection: { ...prev.dataCollection, resolution: value }
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sensors</Label>
              <div className="space-y-2">
                {['RGB Camera', 'Thermal Camera', 'LiDAR', 'Multispectral'].map((sensor) => (
                  <div key={sensor} className="flex items-center space-x-2">
                    <Switch
                      checked={missionConfig.dataCollection.sensors.includes(sensor)}
                      onCheckedChange={(checked) => {
                        setMissionConfig(prev => ({
                          ...prev,
                          dataCollection: {
                            ...prev.dataCollection,
                            sensors: checked
                              ? [...prev.dataCollection.sensors, sensor]
                              : prev.dataCollection.sensors.filter(s => s !== sensor)
                          }
                        }));
                      }}
                    />
                    <Label>{sensor}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={missionConfig.startDate.slice(0, 16)}
                onChange={(e) => setMissionConfig(prev => ({
                  ...prev,
                  startDate: new Date(e.target.value).toISOString()
                }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={missionConfig.endDate.slice(0, 16)}
                onChange={(e) => setMissionConfig(prev => ({
                  ...prev,
                  endDate: new Date(e.target.value).toISOString()
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={saveMission}
          className="w-full"
          disabled={!missionConfig.droneId || !missionConfig.name || waypoints.length < 2}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Mission
        </Button>
      </div>
    </div>
  );
} 