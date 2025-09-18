import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Exam from '@/models/Exam.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isAdminSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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
 * Process exam data to convert all relevant fields to ObjectId
 * @param {Object} data - The exam data to process
 * @returns {Object} - Processed exam data with ObjectId conversions
 */
const processExamData = (data) => {
  const processedData = { ...data };
  
  // Convert courses array to ObjectIds
  if (processedData.courses && Array.isArray(processedData.courses)) {
    processedData.courses = processedData.courses.map(course => toObjectId(course));
  }
  
  // Convert careers array to ObjectIds
  if (processedData.careers && Array.isArray(processedData.careers)) {
    processedData.careers = processedData.careers.map(career => toObjectId(career));
  }
  
  // Convert interestTags array to ObjectIds
  if (processedData.interestTags && Array.isArray(processedData.interestTags)) {
    processedData.interestTags = processedData.interestTags.map(tag => toObjectId(tag));
  }
  
  return processedData;
};

export async function POST(req) {
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
        message: 'Data must be an array of exams' 
      }, { status: 400 });
    }

    // Process each exam entry
    const results = [];
    for (const exam of data) {
      try {
        // Validate required fields
        if (!exam.name) {
          results.push({
            name: exam.name || 'unknown',
            status: 'error',
            message: 'Missing required field: name'
          });
          continue;
        }

        // Validate level enum if provided
        if (exam.level && !['State', 'National', 'Institution'].includes(exam.level)) {
          results.push({
            name: exam.name,
            status: 'error',
            message: 'Invalid level value. Must be State, National, or Institution'
          });
          continue;
        }

        // Add lastUpdated timestamp
        exam.lastUpdated = new Date();

        // Process ObjectId references
        const processedExam = processExamData(exam);

        // Check if exam already exists by name and region
        const existingExam = await Exam.findOne({ 
          name: exam.name,
          region: exam.region || ''
        });
        
        if (existingExam) {
          // Update existing exam
          await Exam.updateOne(
            { _id: existingExam._id }, 
            { $set: processedExam }
          );
          results.push({
            name: exam.name,
            status: 'updated',
            message: 'Exam updated successfully'
          });
        } else {
          // Create new exam
          await Exam.create(processedExam);
          results.push({
            name: exam.name,
            status: 'created',
            message: 'Exam created successfully'
          });
        }
      } catch (error) {
        // Handle duplicate key errors specifically
        if (error.code === 11000) {
          results.push({
            name: exam.name || 'unknown',
            status: 'error',
            message: 'Duplicate exam name and region combination'
          });
        } else {
          results.push({
            name: exam.name || 'unknown',
            status: 'error',
            message: error.message
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${data.length} exams`,
      data: { results }
    });

  } catch (error) {
    console.error('Error processing exams import:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}