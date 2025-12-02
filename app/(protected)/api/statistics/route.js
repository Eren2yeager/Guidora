import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import College from '@/models/College.js';
import Course from '@/models/Course.js';
import Scholarship from '@/models/Scholarship.js';

export async function GET() {
  try {
    await connectDB();

    // Fetch counts in parallel for better performance
    const [collegesCount, coursesCount, scholarshipsCount] = await Promise.all([
      College.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      Scholarship.countDocuments({ isActive: true }),
    ]);

    return NextResponse.json({
      colleges: collegesCount,
      courses: coursesCount,
      scholarships: scholarshipsCount,
    });
  } catch (err) {
    console.error('GET /api/statistics error', err);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
