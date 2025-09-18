import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Scholarship from '@/models/Scholarship.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';
import mongoose from 'mongoose';

/**
 * Converts a string ID to MongoDB ObjectId
 * @param {string|Object} id - The ID to convert
 * @returns {Object} MongoDB ObjectId
 */
const toObjectId = (id) => {
  if (!id) return null;
  if (typeof id === 'string') {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

/**
 * Converts an array of string IDs to MongoDB ObjectIds
 * @param {Array} ids - Array of IDs to convert
 * @returns {Array} Array of MongoDB ObjectIds
 */
const convertIdsToObjectIds = (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) return [];
  return ids.map(id => toObjectId(id)).filter(id => id !== null);
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
        message: 'Data must be an array of scholarships' 
      }, { status: 400 });
    }

    // Process each scholarship entry
    const results = [];
    for (const scholarship of data) {
      try {
        // Validate required fields
        if (!scholarship.name) {
          results.push({
            name: scholarship.name || 'unknown',
            status: 'error',
            message: 'Missing required field: name'
          });
          continue;
        }

        // Process ObjectIds for the scholarship
        const processedScholarship = { ...scholarship };
        
        // Ensure _id is an ObjectId
        if (!processedScholarship._id) {
          processedScholarship._id = new mongoose.Types.ObjectId();
        } else {
          processedScholarship._id = toObjectId(processedScholarship._id);
        }
        
        // Convert providerId to ObjectId
        if (processedScholarship.providerId) {
          processedScholarship.providerId = toObjectId(processedScholarship.providerId);
        }
        
        // Convert reference arrays to ObjectIds
        processedScholarship.relatedDegreePrograms = convertIdsToObjectIds(processedScholarship.relatedDegreePrograms);
        processedScholarship.relatedColleges = convertIdsToObjectIds(processedScholarship.relatedColleges);
        processedScholarship.relatedCareers = convertIdsToObjectIds(processedScholarship.relatedCareers);
        processedScholarship.interestTags = convertIdsToObjectIds(processedScholarship.interestTags);

        // Check if scholarship already exists
        const existingScholarship = await Scholarship.findOne({ 
          $or: [
            { _id: processedScholarship._id },
            { name: processedScholarship.name }
          ]
        });
        
        if (existingScholarship) {
          // Update existing scholarship
          await Scholarship.updateOne(
            { _id: existingScholarship._id }, 
            { $set: processedScholarship }
          );
          results.push({
            name: processedScholarship.name,
            status: 'updated',
            message: 'Scholarship updated successfully'
          });
        } else {
          // Create new scholarship
          await Scholarship.create(processedScholarship);
          results.push({
            name: processedScholarship.name,
            status: 'created',
            message: 'Scholarship created successfully'
          });
        }
      } catch (error) {
        results.push({
          name: scholarship.name || 'unknown',
          status: 'error',
          message: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${data.length} scholarships`,
      data: {
        results,
        total: data.length,
        successful: results.filter(r => r.status !== 'error').length,
        failed: results.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    console.error('Error processing scholarships import:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error processing import',
      error: error.message
    }, { status: 500 });
  }
}