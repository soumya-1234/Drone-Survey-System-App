import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCollection } from '@/lib/mongodb';
import { MissionStatus } from '../../types/mission';

const createMissionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  droneId: z.string().min(1),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  flightPath: z.array(z.array(z.number())),
  altitude: z.number().min(0),
  speed: z.number().min(0),
  dataCollection: z.object({
    frequency: z.number().min(1),
    sensors: z.array(z.enum(['RGB Camera', 'Thermal Camera', 'LiDAR', 'Multispectral'])),
    resolution: z.enum(['Low', 'Medium', 'High'])
  })
});

// GET /api/missions - List missions with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const collection = await getCollection('missions');
    const query = status ? { status: { $in: status.split(',') } } : {};
    const missions = await collection.find(query).toArray();
    return NextResponse.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch missions' },
      { status: 500 }
    );
  }
}

// POST /api/missions - Create a new mission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createMissionSchema.parse(body);

    const collection = await getCollection('missions');
    const mission = {
      ...validatedData,
      status: MissionStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(mission);
    return NextResponse.json(
      { ...mission, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating mission:', error);
    return NextResponse.json(
      { error: 'Failed to create mission' },
      { status: 500 }
    );
  }
}
