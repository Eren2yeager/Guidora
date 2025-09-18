import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/rbac.js";
import connectDB from "@/lib/mongodb";
import TimelineEvent from "@/models/TimelineEvent";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid TimelineEvent ID format" },
        { status: 400 }
      );
    }

    // Find timeline event by ID
    const event = await TimelineEvent.findById(id)
      .populate("related.collegeId", "name")
      .populate("related.courseId", "name")
      .populate("related.programId", "name")
      .populate("related.examId", "name")
      .populate("interestTags", "name");

    if (!event) {
      return NextResponse.json(
        { error: "Timeline event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching timeline event:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline event" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid TimelineEvent ID format" },
        { status: 400 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.type || !data.startDate) {
      return NextResponse.json(
        { error: "Title, type, and startDate are required" },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    if (data.interestTags && Array.isArray(data.interestTags)) {
      data.interestTags = data.interestTags.map(id => 
        typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
      );
    }

    // Handle related fields
    if (data.related) {
      if (data.related.collegeId && typeof data.related.collegeId === 'string') {
        data.related.collegeId = new mongoose.Types.ObjectId(data.related.collegeId);
      }
      
      if (data.related.courseId && typeof data.related.courseId === 'string') {
        data.related.courseId = new mongoose.Types.ObjectId(data.related.courseId);
      }
      
      if (data.related.programId && typeof data.related.programId === 'string') {
        data.related.programId = new mongoose.Types.ObjectId(data.related.programId);
      }
      
      if (data.related.examId && typeof data.related.examId === 'string') {
        data.related.examId = new mongoose.Types.ObjectId(data.related.examId);
      }
    }

    // Update timeline event
    const updatedEvent = await TimelineEvent.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "Timeline event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Timeline event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating timeline event:", error);
    return NextResponse.json(
      { error: "Failed to update timeline event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid TimelineEvent ID format" },
        { status: 400 }
      );
    }

    // Delete timeline event
    const deletedEvent = await TimelineEvent.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json(
        { error: "Timeline event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Timeline event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timeline event:", error);
    return NextResponse.json(
      { error: "Failed to delete timeline event" },
      { status: 500 }
    );
  }
}