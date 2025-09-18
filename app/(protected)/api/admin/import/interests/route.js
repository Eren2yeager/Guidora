import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import mongoose from 'mongoose';
import Interest from '@/models/Interest.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
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
 * Process interest data to convert all relevant fields to ObjectId
 * @param {Object} data - The interest data to process
 * @returns {Object} - Processed interest data with ObjectId conversions
 */
const processInterestData = (data) => {
  const processedData = { ...data };
  
  // Convert _id to ObjectId if present
  if (processedData._id) {
    processedData._id = toObjectId(processedData._id);
  }
  
  // Convert streams array to ObjectIds
  if (processedData.streams && Array.isArray(processedData.streams)) {
    processedData.streams = processedData.streams.map(stream => toObjectId(stream));
  }
  
  // Convert careers array to ObjectIds
  if (processedData.careers && Array.isArray(processedData.careers)) {
    processedData.careers = processedData.careers.map(career => toObjectId(career));
  }
  
  // Convert courses array to ObjectIds
  if (processedData.courses && Array.isArray(processedData.courses)) {
    processedData.courses = processedData.courses.map(course => toObjectId(course));
  }
  
  // Convert degreePrograms array to ObjectIds
  if (processedData.degreePrograms && Array.isArray(processedData.degreePrograms)) {
    processedData.degreePrograms = processedData.degreePrograms.map(program => toObjectId(program));
  }
  
  // Convert colleges array to ObjectIds
  if (processedData.colleges && Array.isArray(processedData.colleges)) {
    processedData.colleges = processedData.colleges.map(college => toObjectId(college));
  }
  
  // Convert universities array to ObjectIds
  if (processedData.universities && Array.isArray(processedData.universities)) {
    processedData.universities = processedData.universities.map(university => toObjectId(university));
  }
  
  // Convert exams array to ObjectIds
  if (processedData.exams && Array.isArray(processedData.exams)) {
    processedData.exams = processedData.exams.map(exam => toObjectId(exam));
  }
  
  return processedData;
};

export async function POST(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    // if (!isAdminSession(session)) {
    //   return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    // }

    // Connect to database
    await connectDB();

    // Handle both JSON and FormData
    let data;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const fileContent = await file.text();
      try {
        data = JSON.parse(fileContent);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
      }
    } else if (contentType.includes('application/json')) {
      data = await req.json();
    } else {
      return NextResponse.json({ error: 'Unsupported content type. Please send JSON data or form-data with JSON file.' }, { status: 415 });
    }

    // Validate data is an array
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Data must be an array of interests' }, { status: 400 });
    }

    // Process each interest entry
    const results = [];
    for (const interestData of data) {
      try {
        // Validate required fields
        if (!interestData.name || !interestData.category) {
          results.push({
            name: interestData.name || 'unknown',
            status: 'error',
            message: 'Missing required fields (name, category)'
          });
          continue;
        }

        // Process interest data to convert all relevant fields to ObjectId
        const processedInterest = processInterestData(interestData);
        
        // Add lastUpdated timestamp
        processedInterest.lastUpdated = new Date();

        // Check if interest already exists
        const existingInterest = await Interest.findOne({ name: processedInterest.name });
        
        if (existingInterest) {
          // Update existing interest
          await Interest.updateOne({ _id: existingInterest._id }, { $set: processedInterest });
          results.push({
            name: processedInterest.name,
            status: 'updated',
            message: 'Interest updated successfully'
          });
        } else {
          // Create new interest
          const newInterest = new Interest(processedInterest);
          await newInterest.save();
          results.push({
            name: processedInterest.name,
            status: 'created',
            message: 'Interest created successfully'
          });
        }
      } catch (error) {
        results.push({
          name: interestData.name || 'unknown',
          status: 'error',
          message: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${data.length} interests`,
      results
    });

  } catch (error) {
    console.error('Error importing interests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}