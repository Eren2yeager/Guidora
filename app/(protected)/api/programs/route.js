import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import DegreeProgram from '@/models/DegreeProgram.js';
import Course from '@/models/Course.js';
import College from '@/models/College';
export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const params = url.searchParams;

    const courseId = params.get('courseId') || undefined;
    const collegeId = params.get('collegeId') || undefined;
    const medium = params.get('medium') || undefined;
    const minCutoffParam = params.get('minCutoff');
    const maxFeesParam = params.get('maxFees');
    
    const minCutoff = minCutoffParam ? parseFloat(minCutoffParam) : undefined;
    const maxFees = maxFeesParam ? parseFloat(maxFeesParam) : undefined;

    const page = Math.max(parseInt(params.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(params.get('limit') || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (courseId) filter.courseId = courseId;
    if (collegeId) filter.collegeId = collegeId;
    if (medium) filter.medium = { $in: medium.split(',').filter(Boolean) };
    if (minCutoff !== undefined && !Number.isNaN(minCutoff)) {
      filter['cutoff.lastYear'] = { $gte: minCutoff };
    }
    if (maxFees !== undefined && !Number.isNaN(maxFees)) {
      filter['fees.tuitionPerYear'] = { $lte: maxFees };
    }

    console.log('Programs API filter:', JSON.stringify(filter));

    const query = DegreeProgram.find(filter)
      .populate('courseId', 'name code')
      .populate('collegeId', 'name code address facilities')
      .skip(skip)
      .limit(limit)
      .lean();

    const [items, total] = await Promise.all([query, DegreeProgram.countDocuments(filter)]);

    console.log(`Found ${items.length} programs, total: ${total}`);

    return NextResponse.json({ items, page, limit, total });
  } catch (err) {
    console.error('GET /api/programs error', err);
    return NextResponse.json({ error: 'Failed to fetch programs', details: err.message }, { status: 500 });
  }
}