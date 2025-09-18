import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import mongoose from 'mongoose';
import Counselor from '@/models/CounselorSchema.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';

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
 * Process counselor data to convert all string IDs to ObjectIds
 * @param {Object} counselor - Counselor data to process
 * @returns {Object} - Processed counselor data with converted ObjectIds
 */
const processCounselorData = (counselor) => {
  // Convert _id if it's a string
  if (counselor._id && typeof counselor._id === 'string') {
    counselor._id = toObjectId(counselor._id);
  }
  
  // Convert array reference fields
  if (counselor.interestTags && Array.isArray(counselor.interestTags)) {
    counselor.interestTags = counselor.interestTags
      .map(tag => typeof tag === 'string' ? toObjectId(tag) : tag)
      .filter(tag => tag !== null);
  }
  
  if (counselor.assignedStudents && Array.isArray(counselor.assignedStudents)) {
    counselor.assignedStudents = counselor.assignedStudents
      .map(student => typeof student === 'string' ? toObjectId(student) : student)
      .filter(student => student !== null);
  }
  
  // Convert nested objects in arrays
  if (counselor.ratings && Array.isArray(counselor.ratings)) {
    counselor.ratings = counselor.ratings.map(rating => ({
      ...rating,
      userId: rating.userId ? toObjectId(rating.userId) : null
    })).filter(rating => rating.userId !== null);
  }
  
  if (counselor.availableSlots && Array.isArray(counselor.availableSlots)) {
    counselor.availableSlots = counselor.availableSlots.map(slot => {
      if (slot._id && typeof slot._id === 'string') {
        slot._id = toObjectId(slot._id);
      }
      
      return {
        ...slot,
        bookedBy: slot.bookedBy ? toObjectId(slot.bookedBy) : undefined
      };
    });
  }
  
  return counselor;
};

export async function POST(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    // Handle both JSON and FormData
    let data;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      
      if (!file) {
        return NextResponse.json({ 
          success: false, 
          message: 'No file uploaded' 
        }, { status: 400 });
      }

      const fileContent = await file.text();
      try {
        data = JSON.parse(fileContent);
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid JSON file' 
        }, { status: 400 });
      }
    } else if (contentType.includes('application/json')) {
      data = await req.json();
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Unsupported content type. Please send JSON data or form-data with JSON file.' 
      }, { status: 415 });
    }

    // Validate data is an array
    if (!Array.isArray(data)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Data must be an array of counselors' 
      }, { status: 400 });
    }

    // Process each counselor entry
    const results = [];
    for (const counselor of data) {
      try {
        // Validate required fields
        if (!counselor.name || !counselor.email) {
          results.push({
            email: counselor.email || 'unknown',
            status: 'error',
            message: 'Missing required fields (name, email)'
          });
          continue;
        }
        
        // Process all ObjectId references
        const processedCounselor = processCounselorData(counselor);

        // Check if counselor already exists
        const existingCounselor = await Counselor.findOne({ email: processedCounselor.email });
        
        if (existingCounselor) {
          // Update existing counselor
          await Counselor.updateOne({ _id: existingCounselor._id }, { $set: processedCounselor });
          results.push({
            email: processedCounselor.email,
            status: 'updated',
            message: 'Counselor updated successfully'
          });
        } else {
          // Create new counselor
          const newCounselor = new Counselor(processedCounselor);
          await newCounselor.save();
          results.push({
            email: processedCounselor.email,
            status: 'created',
            message: 'Counselor created successfully'
          });
        }
      } catch (error) {
        results.push({
          email: counselor.email || 'unknown',
          status: 'error',
          message: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${data.length} counselors`,
      results
    });

  } catch (error) {
    console.error('Error importing counselors:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}