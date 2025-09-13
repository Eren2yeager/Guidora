import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Course from '@/models/Course.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';

// GET /api/admin/courses
export async function GET(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('search') || '';

    // Build search query
    const query = searchTerm ? {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } },
        { level: { $regex: searchTerm, $options: 'i' } }
      ]
    } : {};

    // Fetch courses
    const courses = await Course.find(query)
      .populate('streamId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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