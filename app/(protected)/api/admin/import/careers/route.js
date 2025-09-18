import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb.js';
import Career from '@/models/Career.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';

/**
 * Convert string IDs to MongoDB ObjectIds
 * @param {string|object} id - ID to convert
 * @returns {mongoose.Types.ObjectId|null} - Converted ObjectId or null if invalid
 */
const toObjectId = (id) => {
  if (!id) return null;
  try {
    return new mongoose.Types.ObjectId(id);
  } catch (error) {
    return null;
  }
};

/**
 * Process career data to ensure proper ObjectId conversion for references
 * @param {object} career - Career data to process
 * @returns {object} - Processed career data with proper ObjectId conversions
 */
const processCareerData = (career) => {
  // Convert _id if it exists and is a string
  if (career._id && typeof career._id === 'string') {
    career._id = toObjectId(career._id);
  }

  // Convert reference arrays if they exist
  const referenceFields = [
    'typicalDegrees', 
    'typicalCourses', 
    'exams', 
    'relatedScholarships', 
    'relatedCareers', 
    'interestTags'
  ];

  referenceFields.forEach(field => {
    if (Array.isArray(career[field])) {
      career[field] = career[field].map(id => {
        if (typeof id === 'string') {
          return toObjectId(id);
        }
        return id;
      }).filter(id => id !== null);
    }
  });

  return career;
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
        message: 'Data must be an array of careers' 
      }, { status: 400 });
    }

    // Process each career entry
    const results = {
      success: 0,
      errors: []
    };

    for (const careerData of data) {
      try {
        // Validate required fields
        if (!careerData.name || !careerData.slug) {
          results.errors.push({
            name: careerData.name || 'unknown',
            message: 'Missing required fields: name and slug are required'
          });
          continue;
        }

        // Process career data to ensure proper ObjectId conversion
        const processedCareer = processCareerData(careerData);
        
        // Set lastUpdated to current date
        processedCareer.lastUpdated = new Date();

        // Check if career already exists by slug
        const existingCareer = await Career.findOne({ slug: processedCareer.slug });

        if (existingCareer) {
          // Update existing career
          await Career.updateOne(
            { _id: existingCareer._id },
            { $set: processedCareer }
          );
        } else {
          // Create new career
          await Career.create(processedCareer);
        }

        results.success++;
      } catch (error) {
        results.errors.push({
          name: careerData.name || 'unknown',
          message: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${results.success} careers with ${results.errors.length} errors`,
      data: results
    });
  } catch (error) {
    console.error('Error processing careers import:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error processing import',
      error: error.message
    }, { status: 500 });
  }
}