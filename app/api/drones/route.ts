import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCollection } from '@/lib/mongodb';
import { DroneStatus } from '../../types/mission';

const createDroneSchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  maxPayload: z.number().min(0),
  maxFlightTime: z.number().min(0),
  maxRange: z.number().min(0)
});

// GET /api/drones - List all drones
export async function GET() {
  try {
    const collection = await getCollection('drones');
    const drones = await collection.find({}).toArray();
    return NextResponse.json(drones);
  } catch (error) {
    console.error('Error fetching drones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drones' },
      { status: 500 }
    );
  }
}

// POST /api/drones - Create a new drone
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createDroneSchema.parse(body);

    const collection = await getCollection('drones');
    const drone = {
      ...validatedData,
      status: DroneStatus.AVAILABLE,
      batteryLevel: 100,
      lastMaintenance: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(drone);
    return NextResponse.json(
      { ...drone, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating drone:', error);
    return NextResponse.json(
      { error: 'Failed to create drone' },
      { status: 500 }
    );
  }
}
