import { connectToDatabase } from '@/lib/mongodb';
import Scholarship from '@/models/Scholarship';

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const provider = searchParams.get('provider');
    const q = searchParams.get('q');
    const state = searchParams.get('state');
    const stream = searchParams.get('stream');
    const minAmount = searchParams.get('minAmount');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query = { isActive: true };
    
    if (q) {
      query.$text = { $search: q };
    }
    
    if (provider) {
      query.provider = provider;
    }
    
    if (state) {
      query['eligibility.state'] = state;
    }
    
    if (stream) {
      query['eligibility.stream'] = stream;
    }
    
    if (minAmount) {
      query['benefits.amount'] = { $gte: parseInt(minAmount) };
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const scholarships = await Scholarship.find(query)
      .sort({ 'benefits.amount': -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Scholarship.countDocuments(query);
    
    return Response.json({
      items: scholarships,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return Response.json(
      { error: 'Failed to fetch scholarships' },
      { status: 500 }
    );
  }
}