import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Drone from '@/models/Drone';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();
    await connectDB();
    const droneId = params.id;

    const updateData = {
      status: action === 'start' ? 'maintenance' : 'available',
      lastMaintenance: new Date(),
    };

    const drone = await Drone.findByIdAndUpdate(
      droneId,
      { $set: updateData },
      { new: true }
    );

    if (!drone) {
      return NextResponse.json(
        { error: 'Drone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `Maintenance ${action}ed successfully`, drone },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating drone maintenance status:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance status' },
      { status: 500 }
    );
  }
} 