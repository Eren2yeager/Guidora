import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Course from '@/models/Course.js';
import Stream from '@/models/Stream.js';
import Interest from '@/models/Interest.js';

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const params = url.searchParams;

    const streamName = params.get('stream') || undefined;
    const q = params.get('q') || undefined;
    const level = params.get('level') || undefined;
    const tags = params.get('tags') ? params.get('tags').split(',').filter(Boolean) : [];

    const page = Math.max(parseInt(params.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(params.get('limit') || '50', 10), 1), 100);
    const skip = (page - 1) * limit;

    console.log('Courses API - Filters:', { streamName, q, level, tags });

    const filter = { isActive: true };

    // Stream filter - find stream by name first, then filter by streamId
    if (streamName) {
      const stream = await Stream.findOne({ 
        name: streamName, 
        isActive: true 
      }).select('_id').lean();
      
      console.log('Stream lookup result:', stream);
      
      if (stream) {
        filter.streamId = stream._id;
      } else {
        // If stream not found, return empty results
        console.log('Stream not found:', streamName);
        return NextResponse.json({ items: [], page, limit, total: 0 });
      }
    }

    // Search query filter
    if (q) {
      filter['$or'] = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
      ];
    }

    // Level filter
    if (level) {
      filter.level = level;
    }

    // Tags filter (if you add tags field to Course model in future)
    if (tags.length > 0) {
      filter.tags = { $all: tags };
    }

    console.log('Final filter:', JSON.stringify(filter, null, 2));

    const [items, total] = await Promise.all([
      Course.find(filter)
        .populate('streamId', 'name')
        .populate('interestTags', 'name')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    console.log(`Found ${items.length} courses out of ${total} total`);

    return NextResponse.json({ items, page, limit, total });
  } catch (err) {
    console.error('GET /api/courses error', err);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}