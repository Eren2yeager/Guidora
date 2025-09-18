import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Stream from '@/models/Stream.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    const contentType = req.headers.get('content-type') || '';
    
    // Handle JSON data
    if (contentType.includes('application/json')) {
      const data = await req.json();
      
      // Validate data is an array
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: 'Data must be an array of streams' }, { status: 400 });
      }

      // Process each stream entry
      const results = [];
      for (const stream of data) {
        try {
          // Validate required fields
          if (!stream.name || !stream.slug) {
            results.push({
              slug: stream.slug || 'unknown',
              status: 'error',
              message: 'Missing required fields (name, slug)'
            });
            continue;
          }

          // Helper function to convert string IDs to ObjectId
          const toObjectId = (id) => {
            try {
              return new ObjectId(id);
            } catch (error) {
              return id; // Return original if conversion fails
            }
          };
          
          // Format the stream data according to the model
          const streamData = {
            name: stream.name,
            slug: stream.slug,
            description: stream.description || '',
            typicalSubjects: stream.typicalSubjects || [],
            // Convert career IDs to ObjectId if they are strings
            careers: Array.isArray(stream.careers) 
              ? stream.careers.map(id => typeof id === 'string' ? toObjectId(id) : id)
              : [],
            isActive: stream.isActive !== undefined ? stream.isActive : true,
            source: stream.source || 'admin-import',
            sourceUrl: stream.sourceUrl || '',
            lastUpdated: new Date()
          };

          // Check if stream already exists
          const existingStream = await Stream.findOne({ slug: stream.slug });
          
          if (existingStream) {
            // Update existing stream
            await Stream.updateOne({ _id: existingStream._id }, { $set: streamData });
            results.push({
              slug: stream.slug,
              status: 'updated',
              message: 'Stream updated successfully'
            });
          } else {
            // Create new stream
            const newStream = new Stream(streamData);
            await newStream.save();
            results.push({
              slug: stream.slug,
              status: 'created',
              message: 'Stream created successfully'
            });
          }
        } catch (error) {
          results.push({
            slug: stream.slug || 'unknown',
            status: 'error',
            message: error.message
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Processed ${data.length} streams`,
        results
      });
    }
    
    // If not JSON format
    return NextResponse.json({ error: 'Unsupported content type. Please send JSON data.' }, { status: 415 });
  } catch (error) {
    console.error('Error importing streams:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}