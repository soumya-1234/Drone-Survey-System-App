import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    // Extract database name from MongoDB URI
    const dbName = process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'drone-survey';
    const db = client.db(dbName);
    const collection = db.collection('missions');

    // Validate ID format
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid mission ID format' },
        { status: 400 }
      );
    }

    const mission = await collection.findOne({
      _id: new ObjectId(params.id)
    });

    if (!mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    // Calculate mission statistics
    const statistics = {
      totalWaypoints: mission.flightPath.length,
      totalDistance: calculateTotalDistance(mission.flightPath),
      estimatedDuration: calculateEstimatedDuration(mission),
      coverageArea: calculateCoverageArea(mission.flightPath),
      status: mission.status,
      progress: {
        completed: 0, // This would be updated based on actual mission progress
        total: mission.flightPath.length,
        percentage: 0
      }
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching mission statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mission statistics' },
      { status: 500 }
    );
  }
}

// Helper function to calculate total distance between waypoints
function calculateTotalDistance(waypoints: [number, number][]): number {
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [lon1, lat1] = waypoints[i];
    const [lon2, lat2] = waypoints[i + 1];
    totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
  }
  return totalDistance;
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Helper function to calculate estimated duration based on distance and speed
function calculateEstimatedDuration(mission: any): number {
  const totalDistance = calculateTotalDistance(mission.flightPath);
  const durationInSeconds = totalDistance / mission.speed;
  return durationInSeconds;
}

// Helper function to calculate coverage area (simplified as a polygon area)
function calculateCoverageArea(waypoints: [number, number][]): number {
  // This is a simplified calculation. In a real application,
  // you would want to use a more sophisticated method to calculate
  // the actual coverage area based on the drone's camera parameters
  // and flight path.
  
  // For now, we'll return a rough estimate based on the bounding box
  const lats = waypoints.map(wp => wp[1]);
  const lons = waypoints.map(wp => wp[0]);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  
  const width = calculateDistance(minLat, minLon, minLat, maxLon);
  const height = calculateDistance(minLat, minLon, maxLat, minLon);
  
  return width * height; // Area in square meters
} 