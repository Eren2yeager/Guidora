import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Career from '@/models/Career.js';
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
      return NextResponse.json({ error: 'Data must be an array of careers' }, { status: 400 });
    }

    // Process each career entry
    const results = {
      success: 0,
      errors: []
    };

    for (const career of data) {
      try {
        // Validate required fields
        if (!career.title) {
          results.errors.push({
            title: career.title || 'unknown',
            message: 'Missing required field: title'
          });
          continue;
        }

        // Check if career already exists
        const existingCareer = await Career.findOne({ title: career.title });

        if (existingCareer) {
          // Update existing career
          await Career.updateOne(
            { _id: existingCareer._id },
            { $set: career }
          );
        } else {
          // Create new career
          await Career.create(career);
        }

        results.success++;
      } catch (error) {
        results.errors.push({
          title: career.title || 'unknown',
          message: error.message
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing careers import:', error);
    return NextResponse.json({ error: 'Server error processing import' }, { status: 500 });
  }
}