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

export async function GET(request, { params }) {
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

    const id = toObjectId(params.id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid University ID format" },
        { status: 400 }
      );
    }

    // Find university by ID
    const university = await University.findById(id)
      .populate("degreePrograms", "name")
      .populate("courses", "name")
      .populate("universityAdvisors", "name email")
      .populate("studentAdvisors", "name email");

    if (!university) {
      return NextResponse.json(
        { success: false, error: "University not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { university }
    });
  } catch (error) {
    console.error("Error fetching university:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch university" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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

    const id = toObjectId(params.id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid University ID format" },
        { status: 400 }
      );
    }

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

    // Update university
    const updatedUniversity = await University.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedUniversity) {
      return NextResponse.json(
        { success: false, error: "University not found" },
        { status: 404 }
      );
    }

    // Get updated university with populated fields
    const populatedUniversity = await University.findById(id)
      .populate("degreePrograms", "name")
      .populate("courses", "name")
      .populate("universityAdvisors", "name email")
      .populate("studentAdvisors", "name email");

    return NextResponse.json({
      success: true,
      message: "University updated successfully",
      data: { university: populatedUniversity },
    });
  } catch (error) {
    console.error("Error updating university:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update university" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    const id = toObjectId(params.id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid University ID format" },
        { status: 400 }
      );
    }

    // Delete university
    const deletedUniversity = await University.findByIdAndDelete(id);

    if (!deletedUniversity) {
      return NextResponse.json(
        { success: false, error: "University not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "University deleted successfully",
      data: { id: params.id }
    });
  } catch (error) {
    console.error("Error deleting university:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete university" },
      { status: 500 }
    );
  }
}