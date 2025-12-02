import  connectDB  from '@/lib/mongodb';
import College from '@/models/College.js';
import mongoose from 'mongoose';
import University from '@/models/University';
import DegreeProgram from '@/models/DegreeProgram';
import Course from '@/models/Course';
import Stream from '@/models/Stream';
import Exam from '@/models/Exam';
import Interest from '@/models/Interest';
import Counselor from '@/models/CounselorSchema';
/**
 * GET /api/colleges/[id]
 * Fetch a single college by ID with populated references
 */
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } =await  params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ 
        success: false, 
        error: 'Invalid college ID format' 
      }, { status: 400 });
    }

    // Find college by ID and populate references
    const college = await College.findById(id)
      .populate('university', 'name code')
      .populate('degreePrograms', 'name code duration')
      .populate('courses', 'name code duration')
      .populate('streams', 'name code')
      .populate('examsAccepted', 'name code')
      .populate('interestTags', 'name')
      .populate('collegeAdvisors', 'name profilePicture')
      .populate('studentAdvisors', 'name profilePicture');

    if (!college) {
      return Response.json({ 
        success: false, 
        error: 'College not found' 
      }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      data: college 
    });
  } catch (error) {
    console.error('Error fetching college:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}