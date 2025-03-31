import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import Mission from '@/models/Mission';
import Drone from '@/models/Drone';
import mongoose from 'mongoose';

interface MissionProgress {
  completedWaypoints: number;
  totalWaypoints: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  batteryLevels: {
    droneId: string;
    name: string;
    batteryLevel: number;
  }[];
  elapsedTime?: string;
  estimatedTimeRemaining?: string;
  imagesCaptured: number;
  coverageArea: number;
}

// GET /api/missions/[id]/status - Get mission progress
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid mission ID format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'drone-survey');
    const collection = db.collection('missions');

    const mission = await collection.findOne(
      { _id: new ObjectId(params.id) },
      { projection: { status: 1 } }
    );

    if (!mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    // Get drone information if a drone is assigned
    let droneStatus = null;
    if (mission.droneId) {
      try {
        // Check if the droneId is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(mission.droneId)) {
          const drone = await Drone.findById(mission.droneId);
          if (drone) {
            droneStatus = {
              droneId: drone._id.toString(),
              name: drone.name,
              batteryLevel: drone.batteryLevel
            };
          }
        } else {
          console.warn('Invalid drone ID format:', mission.droneId);
        }
      } catch (error) {
        console.error('Error fetching drone:', error);
      }
    }

    // Calculate progress based on mission status
    const progress: MissionProgress = {
      completedWaypoints: 0,
      totalWaypoints: 0,
      batteryLevels: droneStatus ? [droneStatus] : [],
      imagesCaptured: 0,
      coverageArea: 0
    };

    // Add elapsed time if mission is in progress or completed
    if (mission.status === 'in-progress' || mission.status === 'completed') {
      const startTime = new Date(mission.startDate);
      const currentTime = new Date();
      const elapsedMs = currentTime.getTime() - startTime.getTime();
      progress.elapsedTime = formatDuration(elapsedMs);
    }

    return NextResponse.json({
      mission,
      progress
    });
  } catch (error) {
    console.error('Error fetching mission status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mission status' },
      { status: 500 }
    );
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

// PUT /api/missions/[id]/status - Update mission status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await clientPromise;

    const { action } = await request.json();

    // Validate action
    const validActions = ['pause', 'resume', 'complete', 'abort', 'start'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get the mission
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'drone-survey');
    const collection = db.collection('missions');

    const mission = await collection.findOne(
      { _id: new ObjectId(params.id) },
      { projection: { status: 1 } }
    );

    if (!mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    // Determine new status based on action
    let newStatus;
    switch (action) {
      case 'pause':
        newStatus = 'paused';
        break;
      case 'resume':
        newStatus = 'in-progress';
        break;
      case 'complete':
        newStatus = 'completed';
        break;
      case 'abort':
        newStatus = 'aborted';
        break;
      case 'start':
        newStatus = 'in-progress';
        break;
    }

    // Update mission status
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status: newStatus,
          ...(newStatus === 'completed' || newStatus === 'aborted' ? { endDate: new Date() } : {})
        } 
      },
      { returnDocument: 'after', projection: { status: 1 } }
    );

    if (!result?.value) {
      return NextResponse.json(
        { error: 'Failed to update mission status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: result.value.status });
  } catch (error) {
    console.error('Error updating mission status:', error);
    return NextResponse.json(
      { error: 'Failed to update mission status' },
      { status: 500 }
    );
  }
}
