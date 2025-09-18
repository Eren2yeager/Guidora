import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from "@/lib/rbac.js";
import connectDB from "@/lib/mongodb";
import Resource from "@/models/Resource";
import mongoose from "mongoose";

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
 * Process resource data to convert all string IDs to ObjectIds
 * @param {Object} resource - Resource data to process
 * @returns {Object} - Processed resource data with converted ObjectIds
 */
const processResourceData = (resource) => {
  // Create a copy to avoid mutating the original
  const processedResource = { ...resource };
  
  // Convert _id if it's a string
  if (processedResource._id && typeof processedResource._id === 'string') {
    processedResource._id = toObjectId(processedResource._id);
  }
  
  // Convert array reference fields
  const arrayRefs = ['relatedCourses', 'relatedCareers', 'relatedStreams', 'interestTags'];
  arrayRefs.forEach(field => {
    if (processedResource[field]) {
      processedResource[field] = convertIdsToObjectIds(processedResource[field]);
    }
  });
  
  return processedResource;
};

export async function GET(request) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: Admin access required"
      }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    
    if (search) {
      searchQuery = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ],
      };
    }
    
    if (type) {
      searchQuery.type = type;
    }

    // Get total count for pagination
    const totalCount = await Resource.countDocuments(searchQuery);

    // Get resources with pagination
    const resources = await Resource.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("relatedCareers", "name")
      .populate("relatedCourses", "name");

    return NextResponse.json({
      success: true,
      message: "Resources retrieved successfully",
      data: {
        resources,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        }
      }
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch resources",
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: Admin access required"
      }, { status: 401 });
    }

    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.type || !body.url) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: title, type, and url are required"
      }, { status: 400 });
    }

    // Process resource data to convert IDs to ObjectIds
    const processedData = processResourceData(body);

    // Create new resource
    const resource = new Resource(processedData);
    await resource.save();

    return NextResponse.json({
      success: true,
      message: "Resource created successfully",
      data: { resource }
    });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create resource",
      error: error.message
    }, { status: 500 });
  }
}