import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Drone from '@/models/Drone';
import Mission from '@/models/Mission';

// POST /api/missions/[id]/start - Start a mission
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await connectDB();

    // Get the mission
    const mission = await Mission.findById(params.id);
    if (!mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    // Validate mission status
    if (mission.status !== 'scheduled') {
      return NextResponse.json(
        { error: `Cannot start mission in ${mission.status} status` },
        { status: 400 }
      );
    }

    // Check if assigned drones are available
    const assignedDrones = await Drone.find({
      _id: { $in: mission.droneIds },
      status: { $ne: 'available' }
    });

    if (assignedDrones.length > 0) {
      return NextResponse.json(
        { error: 'Some assigned drones are not available' },
        { status: 400 }
      );
    }

    // Update mission status
    mission.status = 'in-progress';
    mission.startDate = new Date().toISOString();
    await mission.save();

    // Update drone statuses
    await Drone.updateMany(
      { _id: { $in: mission.droneIds } },
      { $set: { status: 'in-mission' } }
    );

    return NextResponse.json({
      message: 'Mission started successfully',
      mission
    });
  } catch (error) {
    console.error('Error starting mission:', error);
    return NextResponse.json(
      { error: 'Failed to start mission' },
      { status: 500 }
    );
  }
} 