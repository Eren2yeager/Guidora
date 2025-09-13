import { connectToDatabase } from '@/lib/mongodb';
import Career from '@/models/Career';

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const q = searchParams.get('q');
    const sector = searchParams.get('sector');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query = { isActive: true };
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    if (sector) {
      query.sectors = { $in: [sector] };
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const careers = await Career.find(query)
      .sort({ title: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Career.countDocuments(query);
    
    return Response.json({
      items: careers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching careers:', error);
    return Response.json(
      { error: 'Failed to fetch careers' },
      { status: 500 }
    );
  }
}