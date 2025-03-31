import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Drone from '@/models/Drone';
import Mission from '@/models/Mission';
import mongoose from 'mongoose';
import { Mission as MissionType } from '@/app/types/mission';

const controlMissionSchema = z.object({
  action: z.enum(['pause', 'resume', 'abort', 'complete'])
});

// POST /api/missions/[id]/control - Control mission (pause, resume, abort)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    console.log('Received control request for mission:', params.id);
    const body = await request.json();
    console.log('Request body:', body);
    
    const { action } = controlMissionSchema.parse(body);
    console.log('Parsed action:', action);

    await connectDB();

    // Get current mission status
    const mission = await Mission.findById(params.id);
    console.log('Found mission:', mission);
    
    if (!mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    // If mission is already aborted, only allow resume
    if (mission.status === 'aborted' && action !== 'resume') {
      return NextResponse.json(
        { error: 'Cannot perform this action on an aborted mission' },
        { status: 400 }
      );
    }

    // Validate state transitions
    const validTransitions: Record<string, string[]> = {
      scheduled: ['abort'],
      'in-progress': ['pause', 'abort', 'complete'],
      paused: ['resume', 'abort', 'complete'],
      completed: ['abort'],
      aborted: ['resume']
    };

    const allowedActions = validTransitions[mission.status] || [];
    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { 
          error: `Cannot ${action} mission in ${mission.status} status`,
          allowedActions
        },
        { status: 400 }
      );
    }

    let newStatus;
    const timestamp = new Date().toISOString();

    switch (action) {
      case 'pause':
        newStatus = 'paused';
        break;

      case 'resume':
        newStatus = 'in-progress';
        if (mission.status === 'aborted') {
          mission.endDate = undefined; // Clear end date when resuming from aborted
        }
        break;

      case 'abort':
        newStatus = 'aborted';
        mission.endDate = timestamp;
        break;

      case 'complete':
        newStatus = 'completed';
        mission.endDate = timestamp;
        break;
    }

    console.log('Updating mission status to:', newStatus);

    // Create a new mission object with only the fields we want to update
    const updateData = {
      status: newStatus,
      endDate: action === 'abort' ? timestamp : mission.endDate,
      updatedAt: new Date()
    };

    // Update mission status using findByIdAndUpdate
    const savedMission = await Mission.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, lean: true }
    ).exec() as unknown as MissionType;

    if (!savedMission) {
      return NextResponse.json(
        { error: 'Failed to update mission status' },
        { status: 500 }
      );
    }

    // If there's a drone assigned, update its status
    if (savedMission.droneId) {
      try {
        const droneStatus = action === 'pause' ? 'idle' : 'active';
        await Drone.findByIdAndUpdate(
          savedMission.droneId,
          { $set: { status: droneStatus } }
        );
      } catch (error) {
        console.error('Error updating drone status:', error);
        // Don't fail the request if drone update fails
      }
    }

    console.log('Mission updated successfully:', savedMission);
    return NextResponse.json(savedMission);
  } catch (error) {
    console.error('Error controlling mission:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to control mission' },
      { status: 500 }
    );
  }
}
