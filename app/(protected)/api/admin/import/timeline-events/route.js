import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import mongoose from 'mongoose';
import TimelineEvent from '@/models/TimelineEvent.js';
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
      return NextResponse.json({ success: false, message: 'Data must be an array of timeline events' }, { status: 400 });
    }

    // Process each timeline event entry
    const results = [];
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    const operations = [];
    
    for (const event of data) {
      try {
        // Validate required fields
        if (!event.title || !event.startDate) {
          results.push({
            title: event.title || 'unknown',
            status: 'error',
            message: 'Missing required fields (title, startDate)'
          });
          errors++;
          continue;
        }
        
        // Create a new object to avoid mutating the original
        const processedEvent = { ...event };
        
        // Convert string _id to ObjectId if present
        if (processedEvent._id) {
          processedEvent._id = toObjectId(processedEvent._id);
        } else {
          processedEvent._id = new mongoose.Types.ObjectId();
        }
        
        // Convert related IDs to ObjectIds
        if (processedEvent.related) {
          if (processedEvent.related.collegeId) {
            processedEvent.related.collegeId = toObjectId(processedEvent.related.collegeId);
          }
          if (processedEvent.related.courseId) {
            processedEvent.related.courseId = toObjectId(processedEvent.related.courseId);
          }
          if (processedEvent.related.programId) {
            processedEvent.related.programId = toObjectId(processedEvent.related.programId);
          }
          if (processedEvent.related.examId) {
            processedEvent.related.examId = toObjectId(processedEvent.related.examId);
          }
        }
        
        // Convert interestTags to ObjectIds
        if (processedEvent.interestTags) {
          processedEvent.interestTags = convertIdsToObjectIds(processedEvent.interestTags);
        }
        
        // Prepare upsert operation
        operations.push({
          updateOne: {
            filter: { 
              $or: [
                { _id: processedEvent._id },
                { title: processedEvent.title, startDate: processedEvent.startDate }
              ]
            },
            update: { $set: processedEvent },
            upsert: true
          }
        });
        
        results.push({
          title: processedEvent.title,
          status: 'processed',
          message: 'Timeline event processed successfully'
        });
      } catch (error) {
        results.push({
          title: event.title || 'unknown',
          status: 'error',
          message: error.message
        });
        errors++;
      }
    }
    
    // Execute bulk operations
    if (operations.length > 0) {
      const bulkResult = await TimelineEvent.bulkWrite(operations);
      created = bulkResult.upsertedCount || 0;
      updated = bulkResult.modifiedCount || 0;
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${data.length} timeline events`,
      data: {
        total: data.length,
        created,
        updated,
        errors,
        results
      }
    });

  } catch (error) {
    console.error('Error importing timeline events:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to import timeline events', 
      error: error.message 
    }, { status: 500 });
  }
}