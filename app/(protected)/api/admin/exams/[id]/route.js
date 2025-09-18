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
 * @returns {ObjectId|null} - MongoDB ObjectId or null if invalid
 */
const toObjectId = (id) => {
  try {
    return new ObjectId(id);
  } catch (error) {
    return null;
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
    processedData.courses = processedData.courses.map(course => 
      typeof course === 'string' ? toObjectId(course) : course
    );
  }
  
  // Convert careers array to ObjectIds
  if (processedData.careers && Array.isArray(processedData.careers)) {
    processedData.careers = processedData.careers.map(career => 
      typeof career === 'string' ? toObjectId(career) : career
    );
  }
  
  // Convert interestTags array to ObjectIds
  if (processedData.interestTags && Array.isArray(processedData.interestTags)) {
    processedData.interestTags = processedData.interestTags.map(tag => 
      typeof tag === 'string' ? toObjectId(tag) : tag
    );
  }
  
  return processedData;
};

// GET a single exam by ID
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

    // Convert ID to ObjectId
    const id = params.id;
    const objectId = toObjectId(id);
    
    if (!objectId) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid exam ID format" 
      }, { status: 400 });
    }

    // Find exam by ID with populated references
    const exam = await Exam.findById(objectId)
      .populate('courses', 'name')
      .populate('careers', 'name')
      .populate('interestTags', 'name');
    
    if (!exam) {
      return NextResponse.json({ 
        success: false, 
        message: "Exam not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Exam retrieved successfully",
      data: { exam }
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT is redirected to PATCH for partial updates
export async function PUT(req, { params }) {
  return PATCH(req, { params });
}

// PATCH to update an exam
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

    // Convert ID to ObjectId
    const id = params.id;
    const objectId = toObjectId(id);
    
    if (!objectId) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid exam ID format" 
      }, { status: 400 });
    }

    // Check if exam exists
    const existingExam = await Exam.findById(objectId);
    if (!existingExam) {
      return NextResponse.json({ 
        success: false, 
        message: "Exam not found" 
      }, { status: 404 });
    }

    // Parse request body
    const data = await req.json();
    
    // Process data to convert string IDs to ObjectIds
    const processedData = processExamData(data);

    // If name or region is being updated, check for duplicates
    if ((data.name && data.name !== existingExam.name) || 
        (data.region !== undefined && data.region !== existingExam.region)) {
      const duplicateCheck = await Exam.findOne({ 
        name: data.name || existingExam.name,
        region: data.region !== undefined ? data.region : existingExam.region,
        _id: { $ne: objectId }
      });
      
      if (duplicateCheck) {
        return NextResponse.json({ 
          success: false, 
          message: "An exam with this name and region already exists" 
        }, { status: 409 });
      }
    }

    // Update exam
    const updatedExam = await Exam.findByIdAndUpdate(
      objectId,
      { $set: processedData },
      { new: true, runValidators: true }
    ).populate('courses', 'name')
      .populate('careers', 'name')
      .populate('interestTags', 'name');

    return NextResponse.json({
      success: true,
      message: "Exam updated successfully",
      data: { exam: updatedExam }
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// DELETE an exam
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

    // Convert ID to ObjectId
    const id = params.id;
    const objectId = toObjectId(id);
    
    if (!objectId) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid exam ID format" 
      }, { status: 400 });
    }

    // Check if exam exists
    const exam = await Exam.findById(objectId);
    if (!exam) {
      return NextResponse.json({ 
        success: false, 
        message: "Exam not found" 
      }, { status: 404 });
    }

    // Delete exam
    await Exam.findByIdAndDelete(objectId);

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully",
      data: null
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}