import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Stream from '@/models/Stream.js';
import Course from '@/models/Course.js';
import DegreeProgram from '@/models/DegreeProgram.js';
import College from '@/models/College.js';

// GET /api/recommendations?lat=..&lng=..&stream=Arts,Science&limit=10
export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const params = url.searchParams;

    const lat = params.get('lat') ? parseFloat(params.get('lat')) : undefined;
    const lng = params.get('lng') ? parseFloat(params.get('lng')) : undefined;
    const streamList = params.get('stream') ? params.get('stream').split(',').filter(Boolean) : [];
    const limit = Math.min(Math.max(parseInt(params.get('limit') || '10', 10), 1), 50);

    let streamIds = [];
    if (streamList.length > 0) {
      const streams = await Stream.find({ name: { $in: streamList }, isActive: true }).select('_id name').lean();
      streamIds = streams.map(s => s._id);
    }

    const courseFilter = { isActive: true };
    if (streamIds.length > 0) courseFilter.streamId = { $in: streamIds };

    const courses = await Course.find(courseFilter).select('_id name code streamId').limit(50).lean();
    const courseIds = courses.map(c => c._id);

    const programFilter = { isActive: true };
    if (courseIds.length > 0) programFilter.courseId = { $in: courseIds };

    if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      // Prefer nearby colleges
      const nearbyColleges = await College.find({
        isActive: true,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: 50000,
          },
        },
      })
        .select('_id name address facilities location')
        .limit(100)
        .lean();

      const nearbyCollegeIds = nearbyColleges.map(c => c._id);
      if (nearbyCollegeIds.length > 0) programFilter.collegeId = { $in: nearbyCollegeIds };
    }

    const programs = await DegreeProgram.find(programFilter)
      .populate('courseId', 'name code')
      .populate('collegeId', 'name address facilities location')
      .limit(limit)
      .lean();

    const items = programs.map(p => ({
      course: p.courseId,
      college: p.collegeId,
      medium: p.medium,
      fees: p.fees,
      cutoff: p.cutoff,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error('GET /api/recommendations error', err);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}


