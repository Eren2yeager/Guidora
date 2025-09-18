import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import mongoose from 'mongoose';
import Resource from '@/models/Resource.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';

// Helper function to convert string to ObjectId
const toObjectId = (id) => {
  try {
    return id && typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
  } catch (error) {
    console.error(`Invalid ObjectId: ${id}`);
    return null;
  }
};

// Helper function to convert array of IDs to ObjectIds
const convertIdsToObjectIds = (ids) => {
  if (!ids || !Array.isArray(ids)) return [];
  return ids.map(id => toObjectId(id)).filter(id => id !== null);
};

export async function POST(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 403 });
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
        return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
      }

      const fileContent = await file.text();
      try {
        data = JSON.parse(fileContent);
      } catch (error) {
        return NextResponse.json({ success: false, message: 'Invalid JSON file' }, { status: 400 });
      }
    } else if (contentType.includes('application/json')) {
      data = await req.json();
    } else {
      return NextResponse.json({ success: false, message: 'Unsupported content type. Please send JSON data or form-data with JSON file.' }, { status: 415 });
    }

    // Validate data is an array
    if (!Array.isArray(data)) {
      return NextResponse.json({ success: false, message: 'Data must be an array of resources' }, { status: 400 });
    }

    // Process each resource entry
    const results = [];
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    const operations = [];
    
    for (const resource of data) {
      try {
        // Validate required fields
        if (!resource.title || !resource.type) {
          results.push({
            title: resource.title || 'unknown',
            status: 'error',
            message: 'Missing required fields (title, type)'
          });
          errors++;
          continue;
        }
        
        // Create a new object to avoid mutating the original
        const processedResource = { ...resource };
        
        // Convert string _id to ObjectId if present
        if (processedResource._id) {
          processedResource._id = toObjectId(processedResource._id);
        } else {
          processedResource._id = new mongoose.Types.ObjectId();
        }
        
        // Convert related IDs to ObjectIds
        if (processedResource.relatedCourses) {
          processedResource.relatedCourses = convertIdsToObjectIds(processedResource.relatedCourses);
        }
        
        if (processedResource.relatedCareers) {
          processedResource.relatedCareers = convertIdsToObjectIds(processedResource.relatedCareers);
        }
        
        if (processedResource.relatedDegreePrograms) {
          processedResource.relatedDegreePrograms = convertIdsToObjectIds(processedResource.relatedDegreePrograms);
        }
        
        // Convert addedBy to ObjectId if present
        if (processedResource.addedBy) {
          processedResource.addedBy = toObjectId(processedResource.addedBy);
        }
        
        // Convert ratings.userId to ObjectId if present
        if (processedResource.ratings && Array.isArray(processedResource.ratings)) {
          processedResource.ratings = processedResource.ratings.map(rating => {
            if (rating.userId) {
              return { ...rating, userId: toObjectId(rating.userId) };
            }
            return rating;
          });
        }
        
        // Prepare upsert operation
        operations.push({
          updateOne: {
            filter: { 
              $or: [
                { _id: processedResource._id },
                { title: processedResource.title, type: processedResource.type }
              ]
            },
            update: { $set: processedResource },
            upsert: true
          }
        });
        
        results.push({
          title: processedResource.title,
          status: 'processed',
          message: 'Resource processed successfully'
        });
      } catch (error) {
        results.push({
          title: resource.title || 'unknown',
          status: 'error',
          message: error.message
        });
        errors++;
      }
    }
    
    // Execute bulk operations
    if (operations.length > 0) {
      const bulkResult = await Resource.bulkWrite(operations);
      created = bulkResult.upsertedCount || 0;
      updated = bulkResult.modifiedCount || 0;
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${data.length} resources`,
      data: {
        total: data.length,
        created,
        updated,
        errors,
        results
      }
    });

  } catch (error) {
    console.error('Error importing resources:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to process resources", 
      error: error.message 
    }, { status: 500 });
  }
}