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

// GET all careers with optional filtering
export async function GET(req) {
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const sector = searchParams.get('sector') || '';
    const growthTrend = searchParams.get('growthTrend') || '';
    const isActive = searchParams.get('isActive') !== null 
      ? searchParams.get('isActive') === 'true' 
      : null;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (sector) {
      query.sectors = { $in: [sector] };
    }
    
    if (growthTrend) {
      query.growthTrend = growthTrend;
    }
    
    if (isActive !== null) {
      query.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const careers = await Career.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Career.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      message: 'Careers retrieved successfully',
      data: {
        careers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error retrieving careers:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error retrieving careers',
      error: error.message
    }, { status: 500 });
  }
}

// POST - Create a new career
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

    // Parse request body
    const careerData = await req.json();

    // Validate required fields
    if (!careerData.name || !careerData.slug) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: name and slug are required' 
      }, { status: 400 });
    }

    // Check if slug already exists
    const existingCareer = await Career.findOne({ slug: careerData.slug });
    if (existingCareer) {
      return NextResponse.json({ 
        success: false, 
        message: 'A career with this slug already exists' 
      }, { status: 409 });
    }

    // Process career data to ensure proper ObjectId conversion
    const processedCareer = processCareerData(careerData);
    
    // Set lastUpdated to current date
    processedCareer.lastUpdated = new Date();

    // Create new career
    const newCareer = await Career.create(processedCareer);

    return NextResponse.json({
      success: true,
      message: 'Career created successfully',
      data: newCareer
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating career:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error creating career',
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update all careers (bulk update)
export async function PUT(req) {
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

    // Parse request body
    const { careers } = await req.json();

    // Validate careers array
    if (!Array.isArray(careers) || careers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid request: careers must be a non-empty array' 
      }, { status: 400 });
    }

    // Process each career
    const results = {
      success: 0,
      errors: []
    };

    for (const careerData of careers) {
      try {
        // Validate required fields
        if (!careerData._id) {
          results.errors.push({
            name: careerData.name || 'unknown',
            message: 'Missing required field: _id'
          });
          continue;
        }

        // Convert _id to ObjectId if it's a string
        const careerId = typeof careerData._id === 'string' 
          ? toObjectId(careerData._id) 
          : careerData._id;

        // Process career data to ensure proper ObjectId conversion
        const processedCareer = processCareerData(careerData);
        
        // Set lastUpdated to current date
        processedCareer.lastUpdated = new Date();

        // Update career
        await Career.updateOne(
          { _id: careerId },
          { $set: processedCareer }
        );

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
      message: `Successfully updated ${results.success} careers with ${results.errors.length} errors`,
      data: results
    });
  } catch (error) {
    console.error('Error updating careers:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error updating careers',
      error: error.message
    }, { status: 500 });
  }
}

// PATCH - Update specific fields of all careers matching a query
export async function PATCH(req) {
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

    // Parse request body
    const { query, update } = await req.json();

    // Validate query and update
    if (!query || !update) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid request: query and update are required' 
      }, { status: 400 });
    }

    // Process update data to ensure proper ObjectId conversion
    const processedUpdate = {};
    Object.keys(update).forEach(key => {
      if (key.includes('typicalDegrees') || 
          key.includes('typicalCourses') || 
          key.includes('exams') || 
          key.includes('relatedScholarships') || 
          key.includes('relatedCareers') || 
          key.includes('interestTags')) {
        
        // Handle array operations
        if (Array.isArray(update[key])) {
          processedUpdate[key] = update[key].map(id => {
            if (typeof id === 'string') {
              return toObjectId(id);
            }
            return id;
          }).filter(id => id !== null);
        } else {
          processedUpdate[key] = update[key];
        }
      } else {
        processedUpdate[key] = update[key];
      }
    });

    // Set lastUpdated to current date
    processedUpdate.lastUpdated = new Date();

    // Update careers
    const result = await Career.updateMany(
      query,
      { $set: processedUpdate }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} careers`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error updating careers:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error updating careers',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete careers matching a query
export async function DELETE(req) {
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');

    // Validate ids
    if (!ids) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid request: ids parameter is required' 
      }, { status: 400 });
    }

    // Convert ids to array of ObjectIds
    const careerIds = ids.split(',').map(id => toObjectId(id)).filter(id => id !== null);

    if (careerIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid request: no valid ids provided' 
      }, { status: 400 });
    }

    // Delete careers
    const result = await Career.deleteMany({ _id: { $in: careerIds } });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} careers`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting careers:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error deleting careers',
      error: error.message
    }, { status: 500 });
  }
}