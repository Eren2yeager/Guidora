import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Course from '@/models/Course.js';

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const params = url.searchParams;

    const stream = params.get('stream') || undefined; // stream name or id not supported here; use tags/name
    const q = params.get('q') || undefined;
    const tags = params.get('tags') ? params.get('tags').split(',').filter(Boolean) : [];

    const page = Math.max(parseInt(params.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(params.get('limit') || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (q) {
      filter['$or'] = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    if (tags.length > 0) {
      filter.tags = { $all: tags };
    }

    // For MVP: filter by stream using stream name in tags or description
    if (stream) {
      filter['$or'] = [
        ...(filter['$or'] || []),
        { tags: { $in: [stream] } },
        { description: { $regex: stream, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Course.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Course.countDocuments(filter),
    ]);

    return NextResponse.json({ items, page, limit, total });
  } catch (err) {
    console.error('GET /api/courses error', err);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}