import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

const updateDroneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  model: z.string().max(100).nullable().optional(),
  status: z.enum(['available', 'in-mission', 'maintenance']).optional(),
  batteryLevel: z.number().min(0).max(100).nullable().optional()
});

// GET /api/drones/[id] - Get drone details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { rows: [drone] } = await sql`
      SELECT d.*,
        json_agg(json_build_object(
          'missionId', md.mission_id,
          'role', md.role,
          'assignedAt', md.assigned_at,
          'mission', json_build_object(
            'id', m.id,
            'name', m.name,
            'status', m.status
          )
        )) FILTER (WHERE md.mission_id IS NOT NULL) as missions
      FROM drones d
      LEFT JOIN mission_drones md ON d.id = md.drone_id
      LEFT JOIN missions m ON md.mission_id = m.id
      WHERE d.id = ${parseInt(params.id)}
      GROUP BY d.id
    `;

    if (!drone) {
      return NextResponse.json(
        { error: 'Drone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(drone);
  } catch (error) {
    console.error('Error fetching drone:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drone' },
      { status: 500 }
    );
  }
}

// PUT /api/drones/[id] - Update drone details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateDroneSchema.parse(body);

    const updateFields = [];
    const values = [];

    if (validatedData.name !== undefined) {
      updateFields.push(sql`name = ${validatedData.name}`);
    }
    if (validatedData.model !== undefined) {
      updateFields.push(sql`model = ${validatedData.model}`);
    }
    if (validatedData.status !== undefined) {
      updateFields.push(sql`status = ${validatedData.status}`);
    }
    if (validatedData.batteryLevel !== undefined) {
      updateFields.push(sql`battery_level = ${validatedData.batteryLevel}`);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Always update last_seen when updating drone
    updateFields.push(sql`last_seen = CURRENT_TIMESTAMP`);

    const { rows: [drone] } = await sql`
      UPDATE drones
      SET ${sql.join(updateFields, sql`, `)}
      WHERE id = ${parseInt(params.id)}
      RETURNING *
    `;

    if (!drone) {
      return NextResponse.json(
        { error: 'Drone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(drone);
  } catch (error) {
    console.error('Error updating drone:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid drone data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update drone' },
      { status: 500 }
    );
  }
}

// DELETE /api/drones/[id] - Delete a drone
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { rows: [drone] } = await sql`
      DELETE FROM drones
      WHERE id = ${parseInt(params.id)}
      RETURNING *
    `;

    if (!drone) {
      return NextResponse.json(
        { error: 'Drone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(drone);
  } catch (error) {
    console.error('Error deleting drone:', error);
    return NextResponse.json(
      { error: 'Failed to delete drone' },
      { status: 500 }
    );
  }
}
