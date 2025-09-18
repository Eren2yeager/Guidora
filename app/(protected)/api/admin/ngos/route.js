import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from "@/lib/rbac.js";
import connectDB from "@/lib/mongodb";
import NGO from "@/models/Ngo";
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
 * Process NGO data to convert all string IDs to ObjectIds
 * @param {Object} ngo - NGO data to process
 * @returns {Object} - Processed NGO data with converted ObjectIds
 */
const processNgoData = (ngo) => {
  // Create a copy to avoid mutating the original
  const processedNgo = { ...ngo };
  
  // Convert _id if it's a string
  if (processedNgo._id && typeof processedNgo._id === 'string') {
    processedNgo._id = toObjectId(processedNgo._id);
  }
  
  // Convert array reference fields
  if (processedNgo.programs) {
    processedNgo.programs = convertIdsToObjectIds(processedNgo.programs);
  }
  
  if (processedNgo.interestTags) {
    processedNgo.interestTags = convertIdsToObjectIds(processedNgo.interestTags);
  }
  
  return processedNgo;
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
    
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination
    const totalCount = await NGO.countDocuments(searchQuery);

    // Get NGOs with pagination
    const ngos = await NGO.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("interestTags", "name");

    return NextResponse.json({
      success: true,
      message: "NGOs retrieved successfully",
      data: {
        ngos,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        }
      }
    });
  } catch (error) {
    console.error("Error fetching NGOs:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch NGOs",
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
    const requiredFields = ["name", "description", "website"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          message: `${field} is required`
        }, { status: 400 });
      }
    }

    // Process NGO data to convert IDs to ObjectIds
    const processedData = processNgoData(body);

    // Create new NGO
    const ngo = new NGO(processedData);
    await ngo.save();

    return NextResponse.json({
      success: true,
      message: "NGO created successfully",
      data: { ngo }
    });
  } catch (error) {
    console.error("Error creating NGO:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create NGO",
      error: error.message
    }, { status: 500 });
  }
}