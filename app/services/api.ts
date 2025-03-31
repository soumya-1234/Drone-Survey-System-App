import { Mission, Drone, Report, DroneStatus, CreateMissionDto, MissionStatus } from '../types/mission';

const API_BASE = '/api';

// Error handling wrapper
export const apiRequest = async <T>(
  promise: Promise<Response>,
  errorMessage: string
): Promise<T> => {
  try {
    const response = await promise;
    if (!response.ok) {
      throw new Error(`${errorMessage}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Drone Management
export const getDrones = (status?: DroneStatus): Promise<Drone[]> => {
  const url = new URL(`${API_BASE}/drones`, window.location.origin);
  if (status) {
    url.searchParams.append('status', status);
  }
  return apiRequest<Drone[]>(fetch(url.toString()), 'Failed to fetch drones');
};

export const getDroneDetails = (id: string): Promise<Drone> =>
  apiRequest<Drone>(fetch(`${API_BASE}/drones/${id}`), 'Failed to fetch drone details');

export const updateDroneStatus = (droneId: string, status: DroneStatus, batteryLevel?: number): Promise<void> =>
  apiRequest(
    fetch(`${API_BASE}/drones/${droneId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, batteryLevel })
    }),
    'Failed to update drone status'
  );

// Mission Management
export const getMissions = (status?: MissionStatus | MissionStatus[]): Promise<Mission[]> => {
  const url = new URL(`${API_BASE}/missions`, window.location.origin);
  if (status) {
    const statusParam = Array.isArray(status) ? status.join(',') : status;
    url.searchParams.append('status', statusParam);
  }
  return apiRequest<Mission[]>(fetch(url.toString()), 'Failed to fetch missions');
};

export const getMissionStatus = (missionId: string): Promise<Mission> =>
  apiRequest<Mission>(
    fetch(`${API_BASE}/missions/${missionId}/status`),
    'Failed to fetch mission status'
  );

export const createMission = (data: CreateMissionDto): Promise<Mission> =>
  apiRequest<Mission>(
    fetch(`${API_BASE}/missions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    'Failed to create mission'
  );

export const controlMission = (missionId: string, action: 'pause' | 'resume' | 'abort' | 'complete'): Promise<Mission> =>
  apiRequest<Mission>(
    fetch(`${API_BASE}/missions/${missionId}/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    }),
    `Failed to ${action} mission`
  );

export const startMission = (missionId: string): Promise<void> =>
  apiRequest(
    fetch(`${API_BASE}/missions/${missionId}/start`, {
      method: 'POST'
    }),
    'Failed to start mission'
  );

// Report Management
interface GetReportsOptions {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  missionId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const getReports = (options: GetReportsOptions = {}): Promise<Report[]> => {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });

  const url = `${API_BASE}/reports?${params}`;
  return apiRequest<Report[]>(fetch(url), 'Failed to fetch reports');
};

export const getReportDetails = (missionId: string, reportId: string): Promise<Report> =>
  apiRequest<Report>(
    fetch(`${API_BASE}/missions/${missionId}/reports/${reportId}`),
    'Failed to fetch report details'
  );

export const getReportsByMissionId = (missionId: string): Promise<Report[]> => {
  const url = new URL(`${API_BASE}/reports`, window.location.origin);
  url.searchParams.append('missionId', missionId);
  return apiRequest<Report[]>(fetch(url.toString()), 'Failed to fetch reports by mission id');
};
