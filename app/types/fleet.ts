export type DroneStatus = 'available' | 'in-mission' | 'maintenance' | 'charging' | 'offline';
export type BatteryStatus = 'critical' | 'low' | 'medium' | 'full';
export type MaintenanceStatus = 'due' | 'upcoming' | 'completed';

export interface DroneHealth {
  batteryLevel: number;
  batteryStatus: BatteryStatus;
  signalStrength: number;
  lastMaintenance: string;
  maintenanceStatus: MaintenanceStatus;
  flightHours: number;
  motorHealth: number[];
  compassCalibration: number;
  gpsAccuracy: number;
}

export interface Drone {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: DroneStatus;
  health: DroneHealth;
  currentMissionId?: string;
  lastActive: string;
  location?: {
    lat: number;
    lng: number;
    altitude: number;
  };
}
