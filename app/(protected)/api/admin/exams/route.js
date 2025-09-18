import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Exam from '@/models/Exam.js';
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
 * Process exam data to convert all relevant fields to ObjectId
 * @param {Object} data - The exam data to process
 * @returns {Object} - Processed exam data with ObjectId conversions
 */
const processExamData = (data) => {
  const processedData = { ...data };
  
  // Convert courses array to ObjectIds
  if (processedData.courses && Array.isArray(processedData.courses)) {
    processedData.courses = processedData.courses.map(course => toObjectId(course));
  }
  
  // Convert careers array to ObjectIds
  if (processedData.careers && Array.isArray(processedData.careers)) {
    processedData.careers = processedData.careers.map(career => toObjectId(career));
  }
  
  // Convert interestTags array to ObjectIds
  if (processedData.interestTags && Array.isArray(processedData.interestTags)) {
    processedData.interestTags = processedData.interestTags.map(tag => toObjectId(tag));
  }
  
  return processedData;
};

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
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const level = searchParams.get('level') || '';
    const region = searchParams.get('region') || '';
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (level) {
      query.level = level;
    }
    if (region) {
      query.region = region;
    }

    // Fetch exams with pagination and filtering
    const exams = await Exam.find(query)
      .populate('courses', 'name')
      .populate('careers', 'name')
      .populate('interestTags', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Exam.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      message: "Exams retrieved successfully",
      data: {
        exams,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function POST(req) {
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

    // Parse request body
    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name is required' 
      }, { status: 400 });
    }

    // Process data to convert string IDs to ObjectIds
    const processedData = processExamData(data);

    // Check for duplicate name
    const existingExam = await Exam.findOne({ 
      name: data.name, 
      region: data.region || '' 
    });
    
    if (existingExam) {
      return NextResponse.json({ 
        success: false, 
        message: 'An exam with this name and region already exists' 
      }, { status: 409 });
    }

    // Create new exam
    const newExam = await Exam.create(processedData);

    return NextResponse.json({ 
      success: true,
      message: 'Exam created successfully',
      data: { exam: newExam }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}