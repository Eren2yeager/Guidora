import connectDB from '@/lib/mongodb';
import Career from '@/models/Career';
import Course from '@/models/Course';
import DegreeProgram from '@/models/DegreeProgram';
import Exam from '@/models/Exam';
import Scholarship from '@/models/Scholarship';
import Interest from '@/models/Interest';

/**
 * GET /api/careers/[slug]
 * Fetch a single career by slug with populated references
 */
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { slug } = await params;
    
    console.log('Fetching career by slug:', slug);

    // Find career by slug and populate references
    const career = await Career.findOne({ slug, isActive: true })
      .populate('typicalDegrees', 'name code')
      .populate('typicalCourses', 'name code')
      .populate('exams', 'name code')
      .populate('relatedScholarships', 'name amount')
      .populate('relatedCareers', 'name slug')
      .populate('interestTags', 'name')
      .lean();

    if (!career) {
      return Response.json({ 
        success: false, 
        error: 'Career not found' 
      }, { status: 404 });
    }

    console.log('Career found:', career.name);

    return Response.json({ 
      success: true, 
      data: career 
    });
  } catch (error) {
    console.error('Error fetching career:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
