import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/rbac.js";
import connectDB from "@/lib/mongodb";
import NGO from "@/models/Ngo";
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
        { error: "Invalid NGO ID format" },
        { status: 400 }
      );
    }

    // Find NGO by ID
    const ngo = await NGO.findById(id).populate("interestTags", "name");

    if (!ngo) {
      return NextResponse.json(
        { error: "NGO not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ngo);
  } catch (error) {
    console.error("Error fetching NGO:", error);
    return NextResponse.json(
      { error: "Failed to fetch NGO" },
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
        { error: "Invalid NGO ID format" },
        { status: 400 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    if (data.interestTags && Array.isArray(data.interestTags)) {
      data.interestTags = data.interestTags.map(tag => 
        typeof tag === 'string' ? new mongoose.Types.ObjectId(tag) : tag
      );
    }

    if (data.programs && Array.isArray(data.programs)) {
      data.programs = data.programs.map(program => 
        typeof program === 'string' ? new mongoose.Types.ObjectId(program) : program
      );
    }

    // Set lastUpdated field
    data.lastUpdated = new Date();

    // Update NGO
    const updatedNGO = await NGO.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedNGO) {
      return NextResponse.json(
        { error: "NGO not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "NGO updated successfully",
      ngo: updatedNGO,
    });
  } catch (error) {
    console.error("Error updating NGO:", error);
    return NextResponse.json(
      { error: "Failed to update NGO" },
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
        { error: "Invalid NGO ID format" },
        { status: 400 }
      );
    }

    // Delete NGO
    const deletedNGO = await NGO.findByIdAndDelete(id);

    if (!deletedNGO) {
      return NextResponse.json(
        { error: "NGO not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "NGO deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting NGO:", error);
    return NextResponse.json(
      { error: "Failed to delete NGO" },
      { status: 500 }
    );
  }
}