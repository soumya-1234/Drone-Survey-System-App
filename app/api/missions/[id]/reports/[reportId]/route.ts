import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

const updateReportSchema = z.object({
  summary: z.string().optional(),
  flightDuration: z.string().optional(), // PostgreSQL interval as string
  coverageArea: z.number().positive().optional()
});

// GET /api/missions/[id]/reports/[reportId] - Get report details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; reportId: string } }
): Promise<NextResponse> {
  try {
    const { rows: [report] } = await sql.query(
      `SELECT r.*,
        json_build_object(
          'id', m.id,
          'name', m.name,
          'status', m.status,
          'startTime', m.start_time,
          'endTime', m.end_time
        ) as mission
      FROM reports r
      JOIN missions m ON r.mission_id = m.id
      WHERE r.mission_id = $1 AND r.id = $2`,
      [parseInt(params.id), parseInt(params.reportId)]
    );

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

// PUT /api/missions/[id]/reports/[reportId] - Update report
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; reportId: string } }
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = updateReportSchema.parse(body);

    const updateFields: string[] = [];
    const values: (string | number)[] = [parseInt(params.reportId), parseInt(params.id)];
    let paramIndex = 3;

    if (validatedData.summary !== undefined) {
      updateFields.push(`summary = $${paramIndex}`);
      values.push(validatedData.summary);
      paramIndex++;
    }
    if (validatedData.flightDuration !== undefined) {
      updateFields.push(`flight_duration = $${paramIndex}::interval`);
      values.push(validatedData.flightDuration);
      paramIndex++;
    }
    if (validatedData.coverageArea !== undefined) {
      updateFields.push(`coverage_area = $${paramIndex}`);
      values.push(validatedData.coverageArea);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE reports
      SET ${updateFields.join(', ')}
      WHERE id = $1 AND mission_id = $2
      RETURNING *
    `;

    const { rows: [report] } = await sql.query(query, values);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid report data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

// DELETE /api/missions/[id]/reports/[reportId] - Delete report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; reportId: string } }
): Promise<NextResponse> {
  try {
    const { rows: [report] } = await sql.query(
      'DELETE FROM reports WHERE id = $1 AND mission_id = $2 RETURNING *',
      [parseInt(params.reportId), parseInt(params.id)]
    );

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
