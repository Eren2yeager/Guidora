import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/rbac.js";
import connectDB from "@/lib/mongodb";
import University from "@/models/University";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";

// Helper function to convert string IDs to ObjectIds
const toObjectId = (id) => {
  return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
};

// Helper function to process university data
const processUniversityData = (data) => {
  // Convert string _id to ObjectId if present
  if (data._id) {
    data._id = toObjectId(data._id);
  } else {
    data._id = new mongoose.Types.ObjectId();
  }

  // Convert reference fields to ObjectIds
  if (data.degreePrograms && Array.isArray(data.degreePrograms)) {
    data.degreePrograms = data.degreePrograms.map(toObjectId);
  }

  if (data.courses && Array.isArray(data.courses)) {
    data.courses = data.courses.map(toObjectId);
  }

  if (data.universityAdvisors && Array.isArray(data.universityAdvisors)) {
    data.universityAdvisors = data.universityAdvisors.map(toObjectId);
  }

  if (data.studentAdvisors && Array.isArray(data.studentAdvisors)) {
    data.studentAdvisors = data.studentAdvisors.map(toObjectId);
  }

  return data;
};

export async function GET(request) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const state = searchParams.get("state") || "";
    
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }
    
    if (state) {
      searchQuery["address.state"] = state;
    }

    // Get total count for pagination
    const totalCount = await University.countDocuments(searchQuery);

    // Get universities with pagination
    const universities = await University.find(searchQuery)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .populate("degreePrograms", "name")
      .populate("courses", "name")
      .populate("universityAdvisors", "name email")
      .populate("studentAdvisors", "name email");

    return NextResponse.json({
      success: true,
      data: {
        universities,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching universities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch universities" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.code || !body.address?.state) {
      return NextResponse.json(
        { success: false, error: "Name, code, and address.state are required" },
        { status: 400 }
      );
    }

    // Process university data (convert IDs to ObjectIds)
    const data = processUniversityData(body);

    // Create new university
    const newUniversity = new University(data);
    await newUniversity.save();

    // Populate references for response
    const populatedUniversity = await University.findById(newUniversity._id)
      .populate("degreePrograms", "name")
      .populate("courses", "name")
      .populate("universityAdvisors", "name email")
      .populate("studentAdvisors", "name email");

    return NextResponse.json({
      success: true,
      message: "University created successfully",
      data: { university: populatedUniversity },
    });
  } catch (error) {
    console.error("Error creating university:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create university" },
      { status: 500 }
    );
  }
}