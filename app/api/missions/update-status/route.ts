import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { missionId, status } = await request.json();

    if (!missionId || !status) {
      return NextResponse.json(
        { error: 'Mission ID and status are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'drone-survey');
    const collection = db.collection('missions');

    const result = await collection.updateOne(
      { _id: new ObjectId(missionId) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating mission status:', error);
    return NextResponse.json(
      { error: 'Failed to update mission status' },
      { status: 500 }
    );
  }
} 