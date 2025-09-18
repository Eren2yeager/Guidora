import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/rbac.js";
import connectDB from "@/lib/mongodb";
import Resource from "@/models/Resource";
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
        { error: "Invalid Resource ID format" },
        { status: 400 }
      );
    }

    // Find resource by ID
    const resource = await Resource.findById(id)
      .populate("relatedCareers", "name")
      .populate("relatedCourses", "name")
      .populate("relatedDegreePrograms", "name");

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
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
        { error: "Invalid Resource ID format" },
        { status: 400 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    if (data.relatedCareers && Array.isArray(data.relatedCareers)) {
      data.relatedCareers = data.relatedCareers.map(id => 
        typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
      );
    }

    if (data.relatedCourses && Array.isArray(data.relatedCourses)) {
      data.relatedCourses = data.relatedCourses.map(id => 
        typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
      );
    }

    if (data.relatedDegreePrograms && Array.isArray(data.relatedDegreePrograms)) {
      data.relatedDegreePrograms = data.relatedDegreePrograms.map(id => 
        typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
      );
    }

    if (data.addedBy && typeof data.addedBy === 'string') {
      data.addedBy = new mongoose.Types.ObjectId(data.addedBy);
    }

    // Handle ratings if present
    if (data.ratings && Array.isArray(data.ratings)) {
      data.ratings = data.ratings.map(rating => {
        if (rating.userId && typeof rating.userId === 'string') {
          rating.userId = new mongoose.Types.ObjectId(rating.userId);
        }
        return rating;
      });
    }

    // Set lastUpdated field
    data.lastUpdated = new Date();

    // Update resource
    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Resource updated successfully",
      resource: updatedResource,
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
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
        { error: "Invalid Resource ID format" },
        { status: 400 }
      );
    }

    // Delete resource
    const deletedResource = await Resource.findByIdAndDelete(id);

    if (!deletedResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}