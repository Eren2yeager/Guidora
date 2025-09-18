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

// GET /api/admin/courses
export async function GET(req) {
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const streamId = searchParams.get('streamId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (streamId) {
      // Convert streamId to ObjectId if it's a string
      query.streamId = toObjectId(streamId);
    }

    // Get courses with pagination
    const courses = await Course.find(query)
      .populate('streamId', 'name slug')
      .populate('interestTags', 'name slug')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    return NextResponse.json({
      success: true,
      message: "Courses retrieved successfully",
      data: {
        courses,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// POST /api/admin/courses
export async function POST(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    // Get request body
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.code || !data.streamId || !data.level) {
      return NextResponse.json({ 
        error: 'Missing required fields (name, code, streamId, level)' 
      }, { status: 400 });
    }

    // Check for duplicate code
    const existingCourse = await Course.findOne({ code: data.code });
    if (existingCourse) {
      return NextResponse.json({ 
        error: 'Course with this code already exists' 
      }, { status: 409 });
    }

    // Create new course
    const course = new Course({
      ...data,
      lastUpdated: new Date()
    });
    await course.save();

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/courses/[id]
export async function PUT(req, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    const { id } = params;
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.code || !data.streamId || !data.level) {
      return NextResponse.json({ 
        error: 'Missing required fields (name, code, streamId, level)' 
      }, { status: 400 });
    }

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check for duplicate code (excluding current course)
    const existingCourse = await Course.findOne({ 
      code: data.code,
      _id: { $ne: id }
    });
    if (existingCourse) {
      return NextResponse.json({ 
        error: 'Another course with this code already exists' 
      }, { status: 409 });
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { 
        ...data,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/courses/[id]
export async function DELETE(req, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    const { id } = params;

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Delete course
    await Course.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}