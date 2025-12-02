import connectDB from '@/lib/mongodb';
import Scholarship from '@/models/Scholarship';
import College from '@/models/College';
import University from '@/models/University';
import Career from '@/models/Career';
import DegreeProgram from '@/models/DegreeProgram';
import Interest from '@/models/Interest';

/**
 * GET /api/scholarships/[id]
 * Fetch a single scholarship by ID with populated references
 */
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    console.log('Fetching scholarship by ID:', id);

    // Find scholarship by ID and populate references
    const scholarship = await Scholarship.findOne({ _id: id, isActive: true })
      .populate('relatedDegreePrograms', 'name code')
      .populate('relatedColleges', 'name address')
      .populate('relatedCareers', 'name slug')
      .populate('interestTags', 'name')
      .lean();

    if (!scholarship) {
      return Response.json({ 
        success: false, 
        error: 'Scholarship not found' 
      }, { status: 404 });
    }

    console.log('Scholarship found:', scholarship.name);

    return Response.json({ 
      success: true, 
      data: scholarship 
    });
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
