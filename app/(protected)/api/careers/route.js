import connectDB from '@/lib/mongodb';
import Career from '@/models/Career';
import Course from '@/models/Course';
import DegreeProgram from '@/models/DegreeProgram';
import Exam from '@/models/Exam';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const q = searchParams.get('q');
    const sector = searchParams.get('sector');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('Careers API - Filters:', { q, sector, tag, page, limit });
    
    // Build query
    const query = { isActive: true };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    // Sector filter - use regex for partial matching
    if (sector) {
      query.sectors = { $regex: sector, $options: 'i' };
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    console.log('Final query:', JSON.stringify(query, null, 2));
    
    // Execute query with pagination and populate related courses
    const skip = (page - 1) * limit;
    const careers = await Career.find(query)
      .populate('typicalCourses', 'name slug')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Career.countDocuments(query);
    
    console.log(`Found ${careers.length} careers out of ${total} total`);
    
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