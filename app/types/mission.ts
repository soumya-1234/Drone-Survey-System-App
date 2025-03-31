export enum DroneStatus {
  AVAILABLE = 'available',
  IN_MISSION = 'in-mission',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired'
}

export enum MissionStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in-progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABORTED = 'aborted'
}

export type DroneRole = 'primary' | 'backup' | 'support';

export interface Coordinate {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface Waypoint extends Coordinate {
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  action?: 'photo' | 'video' | 'hover';
}

export interface Drone {
  _id: string;
  name: string;
  model: string;
  status: DroneStatus;
  batteryLevel: number;
  lastMaintenance: Date;
  maxPayload: number;
  maxFlightTime: number;
  maxRange: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionDrone {
  droneId: string;
  role: DroneRole;
}

export interface DroneBatteryStatus {
  droneId: string;
  name: string;
  batteryLevel: number;
}

export interface MissionProgress {
  completedWaypoints: number;
  totalWaypoints: number;
  imagesCaptured: number;
  coverageArea: number;
  elapsedTime: string;
  batteryLevels: DroneBatteryStatus[];
}

export interface Mission {
  _id: string;
  name: string;
  description?: string;
  status: MissionStatus;
  droneId: string;
  startDate: Date;
  endDate: Date;
  flightPath: [number, number][];
  altitude: number;
  speed: number;
  dataCollection: {
    frequency: number;
    sensors: ('RGB Camera' | 'Thermal Camera' | 'LiDAR' | 'Multispectral')[];
    resolution: 'Low' | 'Medium' | 'High';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionFilters {
  status?: MissionStatus | MissionStatus[];
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface CreateMissionDto {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  area: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  droneIds: string[];
}

export interface Report {
  id: string;
  missionId: string;
  missionName: string;
  date: string;
  status: 'completed' | 'processing' | 'failed';
  type: 'survey' | 'inspection' | 'mapping';
  location: string;
  coverage: number;
  imageCount: number;
  downloadUrl?: string;
}
