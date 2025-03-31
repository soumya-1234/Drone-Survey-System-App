import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { CreateReportDto } from '../../../../types/mission';

const createReportSchema = z.object({
  summary: z.string(),
  flightDuration: z.string(), // PostgreSQL interval as string (e.g., '2 hours 30 minutes')
  coverageArea: z.number().positive()
});

// GET /api/missions/[id]/reports - List all reports for a mission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { rows } = await sql.query(
      'SELECT * FROM reports WHERE mission_id = $1 ORDER BY created_at DESC',
      [parseInt(params.id)]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST /api/missions/[id]/reports - Create a new report
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = createReportSchema.parse(body);

    // First check if the mission exists and is completed
    const { rows: [mission] } = await sql.query(
      'SELECT status FROM missions WHERE id = $1',
      [parseInt(params.id)]
    );

    if (!mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    if (mission.status !== 'completed') {
      return NextResponse.json(
        { error: 'Reports can only be created for completed missions' },
        { status: 400 }
      );
    }

    const { rows: [report] } = await sql.query(
      'INSERT INTO reports (mission_id, summary, flight_duration, coverage_area) VALUES ($1, $2, $3::interval, $4) RETURNING *',
      [
        parseInt(params.id),
        validatedData.summary,
        validatedData.flightDuration,
        validatedData.coverageArea
      ]
    );

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid report data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
