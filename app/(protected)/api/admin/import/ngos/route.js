import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import mongoose from 'mongoose';
import Ngo from '@/models/Ngo.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';

// Helper function to convert string IDs to ObjectIds safely
const toObjectId = (id) => {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch (error) {
    return null;
  }
};

// Helper function to convert arrays of IDs to ObjectIds
const convertIdsToObjectIds = (ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.map(id => typeof id === 'string' ? toObjectId(id) : id).filter(id => id !== null);
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
        message: 'Data must be an array of NGOs' 
      }, { status: 400 });
    }

    // Process each NGO entry
    const results = [];
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    const operations = [];
    
    for (const ngo of data) {
      try {
        // Validate required fields
        if (!ngo.name || !ngo.description) {
          results.push({
            name: ngo.name || 'unknown',
            status: 'error',
            message: 'Missing required fields (name, description)'
          });
          errors++;
          continue;
        }
        
        // Create a new object to avoid mutating the original
        const processedNgo = { ...ngo };
        
        // Convert string _id to ObjectId if present
        if (processedNgo._id) {
          processedNgo._id = toObjectId(processedNgo._id);
        } else {
          processedNgo._id = new mongoose.Types.ObjectId();
        }
        
        // Convert programs array to ObjectIds if present
        if (processedNgo.programs) {
          processedNgo.programs = convertIdsToObjectIds(processedNgo.programs);
        }
        
        // Convert interestTags array to ObjectIds if present
        if (processedNgo.interestTags) {
          processedNgo.interestTags = convertIdsToObjectIds(processedNgo.interestTags);
        }
        
        // Prepare upsert operation
        operations.push({
          updateOne: {
            filter: { 
              $or: [
                { _id: processedNgo._id },
                { name: processedNgo.name }
              ]
            },
            update: { $set: processedNgo },
            upsert: true
          }
        });
        
        results.push({
          name: processedNgo.name,
          status: 'processed',
          message: 'NGO processed successfully'
        });
      } catch (error) {
        results.push({
          name: ngo.name || 'unknown',
          status: 'error',
          message: error.message
        });
        errors++;
      }
    }
    
    // Execute bulk operations
    if (operations.length > 0) {
      const bulkResult = await Ngo.bulkWrite(operations);
      created = bulkResult.upsertedCount || 0;
      updated = bulkResult.modifiedCount || 0;
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${data.length} NGOs`,
      data: {
        total: data.length,
        created,
        updated,
        errors,
        results
      }
    });

  } catch (error) {
    console.error('Error importing NGOs:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to process NGOs", 
      error: error.message 
    }, { status: 500 });
  }
}