import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { MissionStatus } from '@/types/mission';

const updateMissionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'aborted', 'paused', 'resumed'] as const).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  droneId: z.string().optional(),
  location: z.string().optional(),
  waypoints: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number(),
    order: z.number(),
    action: z.enum(['photo', 'video', 'hover']).optional()
  })).optional()
});

// GET /api/missions/[id] - Get mission details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
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
    
    return NextResponse.json(mission);
  } catch (error) {
    console.error('Error fetching mission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mission' },
      { status: 500 }
    );
  }
}

// PUT /api/missions/[id] - Update mission details
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('missions');
    const body = await request.json();

    // Validate ID format
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid mission ID format' },
        { status: 400 }
      );
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Mission updated successfully' });
  } catch (error) {
    console.error('Error updating mission:', error);
    return NextResponse.json(
      { error: 'Failed to update mission' },
      { status: 500 }
    );
  }
}

// DELETE /api/missions/[id] - Delete a mission
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('missions');
    
    // Validate ID format
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid mission ID format' },
        { status: 400 }
      );
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(params.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Mission deleted successfully' });
  } catch (error) {
    console.error('Error deleting mission:', error);
    return NextResponse.json(
      { error: 'Failed to delete mission' },
      { status: 500 }
    );
  }
}
