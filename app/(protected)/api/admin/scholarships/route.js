import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Scholarship from '@/models/Scholarship.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';
import mongoose from 'mongoose';

/**
 * Helper function to convert string IDs to MongoDB ObjectIds
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
  
  // Convert array reference fields
  const arrayRefs = ['eligibleCourses', 'eligibleColleges', 'eligibleStreams'];
  arrayRefs.forEach(field => {
    if (processedScholarship[field]) {
      processedScholarship[field] = convertIdsToObjectIds(processedScholarship[field]);
    }
  });
  
  return processedScholarship;
};

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 401 });
    }

    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Get total count for pagination
    const totalCount = await Scholarship.countDocuments(searchQuery);

    // Get scholarships with pagination
    const scholarships = await Scholarship.find(searchQuery)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      message: "Scholarships retrieved successfully",
      data: {
        scholarships,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        }
      }
    });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch scholarships',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 401 });
    }

    await connectDB();
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

    const scholarship = await Scholarship.create(processedData);
    return NextResponse.json({
      success: true,
      message: 'Scholarship created successfully',
      data: { scholarship }
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create scholarship',
      error: error.message
    }, { status: 500 });
  }
}