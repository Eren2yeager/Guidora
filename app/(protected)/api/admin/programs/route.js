import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import DegreeProgram from '@/models/DegreeProgram.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * Convert string ID to MongoDB ObjectId
 * @param {string} id - The ID to convert
 * @returns {ObjectId} MongoDB ObjectId
 */
const toObjectId = (id) => {
  if (!id) return null;
  return new ObjectId(id);
};

/**
 * Process program data to convert string IDs to ObjectIds
 * @param {Object} programData - The program data to process
 * @returns {Object} Processed program data with ObjectIds
 */
const processProgramData = (programData) => {
  if (!programData) return null;
  
  const processed = { ...programData };
  
  // Convert main IDs
  if (processed._id) processed._id = toObjectId(processed._id);
  if (processed.collegeId) processed.collegeId = toObjectId(processed.collegeId);
  if (processed.courseId) processed.courseId = toObjectId(processed.courseId);
  
  // Convert arrays of IDs
  if (processed.interestTags && Array.isArray(processed.interestTags)) {
    processed.interestTags = processed.interestTags.map(tag => toObjectId(tag));
  }
  
  // Convert eligibilityOverrides.requiredSubjects if it exists
  if (processed.eligibilityOverrides && processed.eligibilityOverrides.requiredSubjects) {
    processed.eligibilityOverrides.requiredSubjects = 
      processed.eligibilityOverrides.requiredSubjects.map(subject => toObjectId(subject));
  }
  
  return processed;
};

/**
 * GET handler for fetching programs with pagination, search, and filtering
 */
export async function GET(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const collegeId = searchParams.get('collegeId');
    const courseId = searchParams.get('courseId');
    const isActive = searchParams.get('isActive');
    const populate = searchParams.get('populate') || '';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Add search condition if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add filters if provided
    if (collegeId) query.collegeId = toObjectId(collegeId);
    if (courseId) query.courseId = toObjectId(courseId);
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Create base query
    let programsQuery = DegreeProgram.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Handle population of related fields
    const populateFields = populate.split(',').filter(Boolean);
    if (populateFields.includes('college')) {
      programsQuery = programsQuery.populate('collegeId');
    }
    if (populateFields.includes('course')) {
      programsQuery = programsQuery.populate('courseId');
    }
    if (populateFields.includes('interests')) {
      programsQuery = programsQuery.populate('interestTags');
    }

    // Execute query
    const programs = await programsQuery;
    const total = await DegreeProgram.countDocuments(query);

    // Return response
    return NextResponse.json({
      success: true,
      message: 'Programs retrieved successfully',
      data: {
        programs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

/**
 * POST handler for creating a new program
 */
export async function POST(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const programData = await req.json();

    // Validate required fields
    if (!programData.collegeId || !programData.courseId || !programData.name) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: collegeId, courseId, and name are required' 
      }, { status: 400 });
    }

    // Process data to convert string IDs to ObjectIds
    const processedData = processProgramData({
      ...programData,
      lastUpdated: new Date()
    });

    // Check if program already exists
    const existingProgram = await DegreeProgram.findOne({
      collegeId: processedData.collegeId,
      courseId: processedData.courseId,
      name: processedData.name
    });

    if (existingProgram) {
      return NextResponse.json({ 
        success: false, 
        message: 'A program with this college, course, and name already exists' 
      }, { status: 409 });
    }

    // Create new program
    const newProgram = new DegreeProgram(processedData);
    await newProgram.save();

    return NextResponse.json({
      success: true,
      message: 'Program created successfully',
      data: newProgram
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}