import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/rbac.js";
import connectDB from "@/lib/mongodb";
import TimelineEvent from "@/models/TimelineEvent";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth.js';

// Helper function to convert string ID to ObjectId
const toObjectId = (id) => {
  if (!id) return null;
  return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
};

// Helper function to convert array of IDs to ObjectIds
const convertIdsToObjectIds = (ids) => {
  if (!ids || !Array.isArray(ids)) return [];
  return ids.map(id => toObjectId(id));
};

// Process timeline event data to convert all string IDs to ObjectIds
const processTimelineEventData = (data) => {
  if (!data) return {};
  
  const processedData = { ...data };
  
  // Convert _id if present
  if (processedData._id) {
    processedData._id = toObjectId(processedData._id);
  }
  
  // Convert interestTags array if present
  if (processedData.interestTags) {
    processedData.interestTags = convertIdsToObjectIds(processedData.interestTags);
  }
  
  // Handle related fields
  if (processedData.related) {
    if (processedData.related.collegeId) {
      processedData.related.collegeId = toObjectId(processedData.related.collegeId);
    }
    
    if (processedData.related.courseId) {
      processedData.related.courseId = toObjectId(processedData.related.courseId);
    }
    
    if (processedData.related.programId) {
      processedData.related.programId = toObjectId(processedData.related.programId);
    }
    
    if (processedData.related.examId) {
      processedData.related.examId = toObjectId(processedData.related.examId);
    }
  }
  
  return processedData;
};

export async function GET(request) {
  try {
    // Check if user is admin using getServerSession
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
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }
    
    if (type) {
      searchQuery.type = type;
    }

    // Get total count for pagination
    const totalCount = await TimelineEvent.countDocuments(searchQuery);

    // Get timeline events with pagination
    const events = await TimelineEvent.find(searchQuery)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate("related.collegeId", "name")
      .populate("related.courseId", "name")
      .populate("related.programId", "name")
      .populate("related.examId", "name")
      .populate("interestTags", "name");

    return NextResponse.json({
      success: true,
      message: "Timeline events retrieved successfully",
      data: {
        events,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        }
      }
    });
  } catch (error) {
    console.error("Error fetching timeline events:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch timeline events",
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Check if user is admin using getServerSession
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
    if (!body.title || !body.type || !body.startDate) {
      return NextResponse.json({
        success: false,
        message: "Title, type, and startDate are required"
      }, { status: 400 });
    }

    // Process timeline event data to convert all string IDs to ObjectIds
    const processedData = processTimelineEventData(body);

    // Create new timeline event with a new ObjectId if not provided
    if (!processedData._id) {
      processedData._id = new mongoose.Types.ObjectId();
    }

    // Create new timeline event
    const newEvent = new TimelineEvent(processedData);
    await newEvent.save();

    return NextResponse.json({
      success: true,
      message: "Timeline event created successfully",
      data: { event: newEvent }
    });
  } catch (error) {
    console.error("Error creating timeline event:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create timeline event",
      error: error.message
    }, { status: 500 });
  }
}