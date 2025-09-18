import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import DegreeProgram from '@/models/DegreeProgram.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Helper function to convert string ID to ObjectId
const toObjectId = (id) => id ? new ObjectId(id) : null;

// Process program data to convert string IDs to ObjectIds
const processProgramData = (data) => {
  if (!data) return null;
  const processed = { ...data };
  
  if (processed._id) processed._id = toObjectId(processed._id);
  if (processed.collegeId) processed.collegeId = toObjectId(processed.collegeId);
  if (processed.courseId) processed.courseId = toObjectId(processed.courseId);
  
  if (processed.interestTags && Array.isArray(processed.interestTags)) {
    processed.interestTags = processed.interestTags.map(tag => toObjectId(tag));
  }
  
  if (processed.eligibilityOverrides?.requiredSubjects) {
    processed.eligibilityOverrides.requiredSubjects = 
      processed.eligibilityOverrides.requiredSubjects.map(subject => toObjectId(subject));
  }
  
  return processed;
};

// GET handler for fetching a single program
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const populate = searchParams.get('populate') || '';
    const populateFields = populate.split(',').filter(Boolean);
    
    let query = DegreeProgram.findById(toObjectId(params.id));
    
    if (populateFields.includes('college')) query = query.populate('collegeId');
    if (populateFields.includes('course')) query = query.populate('courseId');
    if (populateFields.includes('interests')) query = query.populate('interestTags');

    const program = await query;
    if (!program) {
      return NextResponse.json({ success: false, message: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Program retrieved successfully',
      data: program
    });
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT handler for complete program update
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 403 });
    }

    await connectDB();
    const programData = await req.json();

    // Validate required fields
    if (!programData.collegeId || !programData.courseId || !programData.name) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: collegeId, courseId, and name are required' 
      }, { status: 400 });
    }

    const processedData = processProgramData({
      ...programData,
      lastUpdated: new Date()
    });

    // Check if program exists
    const existingProgram = await DegreeProgram.findById(toObjectId(params.id));
    if (!existingProgram) {
      return NextResponse.json({ success: false, message: 'Program not found' }, { status: 404 });
    }

    // Check for duplicate
    const duplicateProgram = await DegreeProgram.findOne({
      collegeId: processedData.collegeId,
      courseId: processedData.courseId,
      name: processedData.name,
      _id: { $ne: toObjectId(params.id) }
    });

    if (duplicateProgram) {
      return NextResponse.json({ 
        success: false, 
        message: 'A program with this college, course, and name already exists' 
      }, { status: 409 });
    }

    const updatedProgram = await DegreeProgram.findByIdAndUpdate(
      toObjectId(params.id),
      { $set: processedData },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Program updated successfully',
      data: updatedProgram
    });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH handler for partial program update
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 403 });
    }

    await connectDB();
    const programData = await req.json();
    const processedData = processProgramData({
      ...programData,
      lastUpdated: new Date()
    });

    // Check if program exists
    const existingProgram = await DegreeProgram.findById(toObjectId(params.id));
    if (!existingProgram) {
      return NextResponse.json({ success: false, message: 'Program not found' }, { status: 404 });
    }

    // Check for duplicates if key fields are being updated
    if (processedData.name || processedData.collegeId || processedData.courseId) {
      const query = {
        _id: { $ne: toObjectId(params.id) },
        collegeId: processedData.collegeId || existingProgram.collegeId,
        courseId: processedData.courseId || existingProgram.courseId,
        name: processedData.name || existingProgram.name
      };
      
      const duplicateProgram = await DegreeProgram.findOne(query);
      if (duplicateProgram) {
        return NextResponse.json({ 
          success: false, 
          message: 'A program with this college, course, and name already exists' 
        }, { status: 409 });
      }
    }

    const updatedProgram = await DegreeProgram.findByIdAndUpdate(
      toObjectId(params.id),
      { $set: processedData },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Program updated successfully',
      data: updatedProgram
    });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE handler for removing a program
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 403 });
    }

    await connectDB();
    
    // Check if program exists
    const existingProgram = await DegreeProgram.findById(toObjectId(params.id));
    if (!existingProgram) {
      return NextResponse.json({ success: false, message: 'Program not found' }, { status: 404 });
    }

    await DegreeProgram.findByIdAndDelete(toObjectId(params.id));

    return NextResponse.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}