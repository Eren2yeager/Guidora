import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { isAdminSession } from "@/lib/rbac";
import connectDB from "@/lib/mongodb";
import Counselor from "@/models/CounselorSchema";
import { ObjectId } from "mongodb";

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
 * Process counselor data to convert all relevant fields to ObjectId
 * @param {Object} data - The counselor data to process
 * @returns {Object} - Processed counselor data with ObjectId conversions
 */
const processCounselorData = (data) => {
  const processedData = { ...data };
  
  // Convert interestTags array to ObjectIds
  if (processedData.interestTags && Array.isArray(processedData.interestTags)) {
    processedData.interestTags = processedData.interestTags.map(tag => toObjectId(tag));
  }
  
  // Convert assignedStudents array to ObjectIds
  if (processedData.assignedStudents && Array.isArray(processedData.assignedStudents)) {
    processedData.assignedStudents = processedData.assignedStudents.map(student => toObjectId(student));
  }
  
  // Convert availableSlots.bookedBy to ObjectIds if present
  if (processedData.availableSlots && Array.isArray(processedData.availableSlots)) {
    processedData.availableSlots = processedData.availableSlots.map(slot => {
      if (slot.bookedBy) {
        return { ...slot, bookedBy: toObjectId(slot.bookedBy) };
      }
      return slot;
    });
  }
  
  // Convert ratings.userId to ObjectIds if present
  if (processedData.ratings && Array.isArray(processedData.ratings)) {
    processedData.ratings = processedData.ratings.map(rating => {
      if (rating.userId) {
        return { ...rating, userId: toObjectId(rating.userId) };
      }
      return rating;
    });
  }
  
  return processedData;
};

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
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
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await Counselor.countDocuments(searchQuery);

    // Get counselors with pagination
    const counselors = await Counselor.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: "Counselors retrieved successfully",
      data: {
        counselors,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    console.error("Error fetching counselors:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    // Process all ObjectId references
    const processedData = processCounselorData(data);

    // Check if counselor already exists
    const existingCounselor = await Counselor.findOne({ email: processedData.email });
    if (existingCounselor) {
      return NextResponse.json(
        { success: false, message: "Counselor with this email already exists" },
        { status: 400 }
      );
    }

    // Create new counselor
    const newCounselor = new Counselor(processedData);
    await newCounselor.save();

    return NextResponse.json({ 
      success: true,
      message: "Counselor created successfully",
      data: { counselor: newCounselor }
    });
  } catch (error) {
    console.error("Error creating counselor:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}