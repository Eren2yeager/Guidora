import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Scholarship from '@/models/Scholarship.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';
import mongoose from 'mongoose';

/**
 * Helper function to convert string ID to MongoDB ObjectId
 * @param {string|any} id - The ID to convert
 * @returns {ObjectId|null} - Converted ObjectId or null if invalid
 */
const toObjectId = (id) => {
  if (!id) return null;
  if (typeof id === 'string') {
    try {
      return new mongoose.Types.ObjectId(id);
    } catch (error) {
      console.log(`Invalid ObjectId format: ${error.message}`);
      return null;
    }
  }
  return id;
};

/**
 * Helper function to convert arrays of IDs to ObjectIds
 * @param {Array} ids - Array of IDs to convert
 * @returns {Array} - Array with converted ObjectIds
 */
const convertIdsToObjectIds = (ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.map(id => typeof id === 'string' ? toObjectId(id) : id).filter(id => id !== null);
};

/**
 * Process scholarship data to convert all string IDs to ObjectIds
 * @param {Object} scholarship - Scholarship data to process
 * @returns {Object} - Processed scholarship data with converted ObjectIds
 */
const processScholarshipData = (scholarship) => {
  // Create a copy to avoid mutating the original
  const processedScholarship = { ...scholarship };
  
  // Convert _id if it's a string
  if (processedScholarship._id && typeof processedScholarship._id === 'string') {
    processedScholarship._id = toObjectId(processedScholarship._id);
  }
  
  // Convert eligibleCourses array if present
  if (processedScholarship.eligibleCourses) {
    processedScholarship.eligibleCourses = convertIdsToObjectIds(processedScholarship.eligibleCourses);
  }
  
  // Convert eligibleColleges array if present
  if (processedScholarship.eligibleColleges) {
    processedScholarship.eligibleColleges = convertIdsToObjectIds(processedScholarship.eligibleColleges);
  }
  
  // Convert eligibleStreams array if present
  if (processedScholarship.eligibleStreams) {
    processedScholarship.eligibleStreams = convertIdsToObjectIds(processedScholarship.eligibleStreams);
  }
  
  return processedScholarship;
};

/**
 * GET - Fetch a single scholarship by ID
 */
export async function GET(request, { params }) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 401 });
    }

    await connectDB();
    
    // Convert string ID to ObjectId
    const scholarshipId = toObjectId(params.id);
    if (!scholarshipId) {
      return NextResponse.json({
        success: false,
        message: 'Invalid scholarship ID format'
      }, { status: 400 });
    }

    // Find scholarship by ID
    const scholarship = await Scholarship.findById(scholarshipId)
      .populate('eligibleCourses', 'name')
      .populate('eligibleColleges', 'name')
      .populate('eligibleStreams', 'name');

    if (!scholarship) {
      return NextResponse.json({
        success: false,
        message: 'Scholarship not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Scholarship retrieved successfully',
      data: { scholarship }
    });
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch scholarship',
      error: error.message
    }, { status: 500 });
  }
}

/**
 * PUT - Update a scholarship by ID
 */
export async function PUT(request, { params }) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 401 });
    }

    await connectDB();
    
    // Convert string ID to ObjectId
    const scholarshipId = toObjectId(params.id);
    if (!scholarshipId) {
      return NextResponse.json({
        success: false,
        message: 'Invalid scholarship ID format'
      }, { status: 400 });
    }

    // Check if scholarship exists
    const existingScholarship = await Scholarship.findById(scholarshipId);
    if (!existingScholarship) {
      return NextResponse.json({
        success: false,
        message: 'Scholarship not found'
      }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({
        success: false,
        message: 'Missing required field: name'
      }, { status: 400 });
    }

    // Validate provider enum if provided
    if (body.provider && !['Gov', 'College', 'NGO', 'Private', 'Other'].includes(body.provider)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid provider value'
      }, { status: 400 });
    }

    // Process scholarship data to convert IDs to ObjectIds
    const processedData = processScholarshipData(body);
    
    // Add lastUpdated timestamp
    processedData.lastUpdated = new Date();

    // Update scholarship
    const updatedScholarship = await Scholarship.findByIdAndUpdate(
      scholarshipId,
      processedData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Scholarship updated successfully',
      data: { scholarship: updatedScholarship }
    });
  } catch (error) {
    console.error('Error updating scholarship:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update scholarship',
      error: error.message
    }, { status: 500 });
  }
}

/**
 * DELETE - Remove a scholarship by ID
 */
export async function DELETE(request, { params }) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 401 });
    }

    await connectDB();
    
    // Convert string ID to ObjectId
    const scholarshipId = toObjectId(params.id);
    if (!scholarshipId) {
      return NextResponse.json({
        success: false,
        message: 'Invalid scholarship ID format'
      }, { status: 400 });
    }

    // Find and delete scholarship
    const deletedScholarship = await Scholarship.findByIdAndDelete(scholarshipId);

    if (!deletedScholarship) {
      return NextResponse.json({
        success: false,
        message: 'Scholarship not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Scholarship deleted successfully',
      data: { scholarshipId: params.id }
    });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete scholarship',
      error: error.message
    }, { status: 500 });
  }
}