import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Course from '@/models/Course.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * Helper function to convert string IDs to ObjectId
 * @param {string} id - The ID to convert
 * @returns {ObjectId} - MongoDB ObjectId
 */
const toObjectId = (id) => {
  try {
    return typeof id === 'string' ? new ObjectId(id) : id;
  } catch (error) {
    return id;
  }
};

/**
 * Process course data to convert all relevant fields to ObjectId
 * @param {Object} data - The course data to process
 * @returns {Object} - Processed course data with ObjectId conversions
 */
const processCourseData = (data) => {
  const processedData = { ...data };
  
  // Convert streamId to ObjectId
  if (processedData.streamId) {
    processedData.streamId = toObjectId(processedData.streamId);
  }
  
  // Convert interestTags array to ObjectIds
  if (processedData.interestTags && Array.isArray(processedData.interestTags)) {
    processedData.interestTags = processedData.interestTags.map(tag => toObjectId(tag));
  }
  
  // Convert outcomes references to ObjectIds
  if (processedData.outcomes) {
    if (processedData.outcomes.careers && Array.isArray(processedData.outcomes.careers)) {
      processedData.outcomes.careers = processedData.outcomes.careers.map(career => toObjectId(career));
    }
    
    if (processedData.outcomes.Exams && Array.isArray(processedData.outcomes.Exams)) {
      processedData.outcomes.Exams = processedData.outcomes.Exams.map(exam => toObjectId(exam));
    }
    
    if (processedData.outcomes.higherStudies && Array.isArray(processedData.outcomes.higherStudies)) {
      processedData.outcomes.higherStudies = processedData.outcomes.higherStudies.map(course => toObjectId(course));
    }
  }
  
  return processedData;
};

export async function GET(req, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { id } = params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid course ID' 
      }, { status: 400 });
    }

    // Find course by ID with populated references
    const course = await Course.findById(id)
      .populate('streamId', 'name slug')
      .populate('interestTags', 'name slug')
      .populate('outcomes.careers', 'name description')
      .populate('outcomes.Exams', 'name description')
      .populate('outcomes.higherStudies', 'name code');
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        message: 'Course not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Course retrieved successfully",
      data: { course }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  // Redirect to PATCH for consistency
  return PATCH(req, { params });
}

export async function PATCH(req, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { id } = params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid course ID' 
      }, { status: 400 });
    }

    // Get course data from request
    const data = await req.json();

    // Validate required fields
    if (!data.code || !data.name || !data.streamId) {
      return NextResponse.json({ 
        success: false,
        message: 'Missing required fields (code, name, streamId)' 
      }, { status: 400 });
    }

    // Check if course with same code already exists (excluding current course)
    const existingCourse = await Course.findOne({ 
      code: data.code, 
      _id: { $ne: id } 
    });
    
    if (existingCourse) {
      return NextResponse.json({ 
        success: false,
        message: `Another course with code ${data.code} already exists` 
      }, { status: 409 });
    }

    // Process data to convert string IDs to ObjectIds
    const processedData = processCourseData(data);

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id, 
      processedData, 
      { new: true, runValidators: true }
    ).populate('streamId', 'name slug');

    if (!updatedCourse) {
      return NextResponse.json({ 
        success: false, 
        message: 'Course not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Course updated successfully', 
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { id } = params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid course ID' 
      }, { status: 400 });
    }

    // Delete course
    const deletedCourse = await Course.findByIdAndDelete(id);
    
    if (!deletedCourse) {
      return NextResponse.json({ 
        success: false, 
        message: 'Course not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Course deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}