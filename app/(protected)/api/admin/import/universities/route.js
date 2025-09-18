import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import mongoose from 'mongoose';
import University from '@/models/University.js';
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
      return NextResponse.json({ error: 'Data must be an array of universities' }, { status: 400 });
    }

    // Process each university entry
    const results = [];
    for (const university of data) {
      try {
        // Validate required fields
        if (!university.name || !university.location?.state) {
          results.push({
            name: university.name || 'unknown',
            status: 'error',
            message: 'Missing required fields (name, location.state)'
          });
          continue;
        }

        // Helper function to convert string IDs to ObjectIds
        const toObjectId = (id) => {
          return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
        };

        // Convert string _id to ObjectId if present
        if (university._id) {
          university._id = toObjectId(university._id);
        }

        // Convert reference fields to ObjectIds
        if (university.degreePrograms && Array.isArray(university.degreePrograms)) {
          university.degreePrograms = university.degreePrograms.map(toObjectId);
        }

        if (university.courses && Array.isArray(university.courses)) {
          university.courses = university.courses.map(toObjectId);
        }

        if (university.universityAdvisors && Array.isArray(university.universityAdvisors)) {
          university.universityAdvisors = university.universityAdvisors.map(toObjectId);
        }

        if (university.studentAdvisors && Array.isArray(university.studentAdvisors)) {
          university.studentAdvisors = university.studentAdvisors.map(toObjectId);
        }

        // Convert affiliated colleges to ObjectIds if present
        if (university.affiliatedColleges && Array.isArray(university.affiliatedColleges)) {
          university.affiliatedColleges = university.affiliatedColleges.map(toObjectId);
        }

        // Check if university already exists
        const existingUniversity = await University.findOne({ name: university.name });
        
        if (existingUniversity) {
          // Update existing university
          await University.updateOne({ _id: existingUniversity._id }, { $set: university });
          results.push({
            name: university.name,
            status: 'updated',
            message: 'University updated successfully'
          });
        } else {
          // Create new university
          const newUniversity = new University(university);
          await newUniversity.save();
          results.push({
            name: university.name,
            status: 'created',
            message: 'University created successfully'
          });
        }
      } catch (error) {
        results.push({
          name: university.name || 'unknown',
          status: 'error',
          message: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${data.length} universities`,
      results
    });

  } catch (error) {
    console.error('Error importing universities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}