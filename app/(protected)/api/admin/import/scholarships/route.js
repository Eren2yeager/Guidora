import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Scholarship from '@/models/Scholarship.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';

export async function POST(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
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
      return NextResponse.json({ error: 'Data must be an array of scholarships' }, { status: 400 });
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

        // Check if scholarship already exists
        const existingScholarship = await Scholarship.findOne({ name: scholarship.name });
        
        if (existingScholarship) {
          // Update existing scholarship
          await Scholarship.updateOne({ _id: existingScholarship._id }, { $set: scholarship });
          results.push({
            name: scholarship.name,
            status: 'updated',
            message: 'Scholarship updated successfully'
          });
        } else {
          // Create new scholarship
          await Scholarship.create(scholarship);
          results.push({
            name: scholarship.name,
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
      results
    });

  } catch (error) {
    console.error('Error processing scholarships import:', error);
    return NextResponse.json({ error: 'Server error processing import' }, { status: 500 });
  }
}