import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdminSession } from "@/lib/auth";
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

export async function GET(request, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { id } = params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid counselor ID" 
      }, { status: 400 });
    }

    // Find counselor by ID
    const counselor = await Counselor.findById(id)
      .populate('interestTags', 'name')
      .populate('assignedStudents', 'name email');
    
    if (!counselor) {
      return NextResponse.json({ 
        success: false, 
        message: "Counselor not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Counselor retrieved successfully",
      data: { counselor }
    });

  } catch (error) {
    console.error('Error fetching counselor:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { id } = params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid counselor ID" 
      }, { status: 400 });
    }

    // Get counselor data from request
    const data = await request.json();

    // Process all ObjectId references
    const processedData = processCounselorData(data);

    // Update counselor
    const updatedCounselor = await Counselor.findByIdAndUpdate(
      id,
      { $set: processedData },
      { new: true, runValidators: true }
    );
    
    if (!updatedCounselor) {
      return NextResponse.json({ 
        success: false, 
        message: "Counselor not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Counselor updated successfully",
      data: { counselor: updatedCounselor }
    });

  } catch (error) {
    console.error('Error updating counselor:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  // Redirect to PATCH for consistency
  return PATCH(request, { params });
}

export async function DELETE(request, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { id } = params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid counselor ID" 
      }, { status: 400 });
    }

    // Delete counselor
    const deletedCounselor = await Counselor.findByIdAndDelete(id);
    
    if (!deletedCounselor) {
      return NextResponse.json({ 
        success: false, 
        message: "Counselor not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Counselor deleted successfully",
      data: null
    });

  } catch (error) {
    console.error('Error deleting counselor:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}