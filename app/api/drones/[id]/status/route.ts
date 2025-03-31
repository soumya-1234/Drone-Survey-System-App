import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Drone from '@/models/Drone';

const updateDroneStatusSchema = z.object({
  status: z.enum(['available', 'in-mission', 'maintenance']),
  batteryLevel: z.number().min(0).max(100).optional()
});

// PUT /api/drones/[id]/status - Update drone status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = updateDroneStatusSchema.parse(body);

    await connectDB();

    // Check if drone exists and get current status
    const existingDrone = await Drone.findById(params.id);
    if (!existingDrone) {
      return NextResponse.json(
        { error: 'Drone not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    if (existingDrone.status === 'in-mission' && validatedData.status === 'maintenance') {
      return NextResponse.json(
        { error: 'Cannot move drone to maintenance while in mission' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: validatedData.status,
      lastSeen: new Date()
    };

    if (validatedData.batteryLevel !== undefined) {
      updateData.batteryLevel = validatedData.batteryLevel;
    }

    // Update drone status
    const drone = await Drone.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    );

    // If status changed to maintenance, update related missions
    if (validatedData.status === 'maintenance' && existingDrone.status !== 'maintenance') {
      // Note: This would require a Mission model and proper relationship setup
      // For now, we'll just update the drone status
    }

    return NextResponse.json(drone);
  } catch (error) {
    console.error('Error updating drone status:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid status data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update drone status' },
      { status: 500 }
    );
  }
}
