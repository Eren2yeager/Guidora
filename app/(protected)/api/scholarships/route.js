import connectDB from '@/lib/mongodb';
import Scholarship from '@/models/Scholarship';
import College from '@/models/College';
import University from '@/models/University';
import Career from '@/models/Career';
import DegreeProgram from '@/models/DegreeProgram';
import Interest from '@/models/Interest';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const providerType = searchParams.get('providerType');
    const q = searchParams.get('q');
    const state = searchParams.get('state');
    const stream = searchParams.get('stream');
    const minAmount = searchParams.get('minAmount');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('Scholarships API - Filters:', { providerType, q, state, stream, minAmount, page, limit });
    
    // Build query
    const query = { isActive: true };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    
    if (providerType) {
      query.providerType = providerType;
    }
    
    if (state) {
      query['eligibility.state'] = { $regex: state, $options: 'i' };
    }
    
    if (stream) {
      query['eligibility.stream'] = { $regex: stream, $options: 'i' };
    }
    
    if (minAmount) {
      query['benefits.amount'] = { $gte: parseInt(minAmount) };
    }
    
    console.log('Final query:', JSON.stringify(query, null, 2));
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const scholarships = await Scholarship.find(query)
      .populate('relatedDegreePrograms', 'name code')
      .populate('relatedColleges', 'name')
      .populate('relatedCareers', 'name slug')
      .populate('interestTags', 'name')
      .sort({ 'benefits.amount': -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Scholarship.countDocuments(query);
    
    console.log(`Found ${scholarships.length} scholarships out of ${total} total`);
    
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