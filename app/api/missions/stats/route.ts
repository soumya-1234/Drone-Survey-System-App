import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'drone-survey');
    const collection = db.collection('missions');

    // Get all completed missions
    const completedMissions = await collection.find({ status: 'completed' }).toArray();

    // Calculate statistics
    const stats = {
      totalSurveys: completedMissions.length,
      totalDuration: 0,
      totalDistance: 0,
      totalCoverage: 0,
      averageDuration: 0,
      averageDistance: 0,
      averageCoverage: 0,
      surveysByMonth: {} as Record<string, number>,
      surveysByLocation: {} as Record<string, number>,
    };

    // Calculate individual statistics
    completedMissions.forEach(mission => {
      // Calculate duration
      const startDate = new Date(mission.startDate);
      const endDate = new Date(mission.endDate);
      const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // in minutes
      stats.totalDuration += duration;

      // Calculate distance (assuming waypoints are in order)
      let distance = 0;
      if (mission.area?.coordinates?.[0]) {
        const waypoints = mission.area.coordinates[0];
        for (let i = 1; i < waypoints.length; i++) {
          const prev = waypoints[i - 1];
          const curr = waypoints[i];
          // Simple Euclidean distance (can be replaced with more accurate calculation)
          distance += Math.sqrt(
            Math.pow(curr[0] - prev[0], 2) + 
            Math.pow(curr[1] - prev[1], 2)
          );
        }
      }
      stats.totalDistance += distance;

      // Calculate coverage (area of the polygon)
      let coverage = 0;
      if (mission.area?.coordinates?.[0]) {
        const waypoints = mission.area.coordinates[0];
        // Simple polygon area calculation (can be replaced with more accurate calculation)
        for (let i = 0; i < waypoints.length; i++) {
          const j = (i + 1) % waypoints.length;
          coverage += waypoints[i][0] * waypoints[j][1];
          coverage -= waypoints[j][0] * waypoints[i][1];
        }
        coverage = Math.abs(coverage) / 2;
      }
      stats.totalCoverage += coverage;

      // Count surveys by month
      const monthKey = startDate.toISOString().slice(0, 7); // YYYY-MM format
      stats.surveysByMonth[monthKey] = (stats.surveysByMonth[monthKey] || 0) + 1;

      // Count surveys by location
      stats.surveysByLocation[mission.location] = (stats.surveysByLocation[mission.location] || 0) + 1;
    });

    // Calculate averages
    if (completedMissions.length > 0) {
      stats.averageDuration = stats.totalDuration / completedMissions.length;
      stats.averageDistance = stats.totalDistance / completedMissions.length;
      stats.averageCoverage = stats.totalCoverage / completedMissions.length;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching mission statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mission statistics' },
      { status: 500 }
    );
  }
} 