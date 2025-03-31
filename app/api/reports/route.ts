import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';

// GET /api/reports - Get all survey reports
export async function GET(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const missionId = searchParams.get('missionId');

    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (missionId) query.missionId = missionId;

    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(query),
    ]);

    return NextResponse.json({
      reports: reports.map(report => ({
        id: report._id,
        missionId: report.missionId,
        missionName: report.missionName,
        date: report.date,
        status: report.status,
        type: report.type,
        location: report.location,
        coverage: report.coverage,
        imageCount: report.imageCount,
        downloadUrl: report.downloadUrl,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

const createReportSchema = z.object({
  missionId: z.string(),
  missionName: z.string(),
  type: z.enum(['survey', 'inspection', 'mapping']),
  location: z.string(),
  coverage: z.number().min(0).max(100),
  imageCount: z.number().min(0).optional(),
  downloadUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const validatedData = createReportSchema.parse(body);
    
    const report = await Report.create({
      ...validatedData,
      date: new Date(),
      status: 'processing',
    });
    
    return NextResponse.json({
      id: report._id,
      missionId: report.missionId,
      missionName: report.missionName,
      date: report.date,
      status: report.status,
      type: report.type,
      location: report.location,
      coverage: report.coverage,
      imageCount: report.imageCount,
      downloadUrl: report.downloadUrl,
    }, { status: 201 });
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
