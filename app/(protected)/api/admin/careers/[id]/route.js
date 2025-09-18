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

// GET - Retrieve a specific career by ID
export async function GET(req, { params }) {
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

    // Get career ID from params
    const { id } = params;
    
    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid career ID' 
      }, { status: 400 });
    }

    // Find career by ID
    const career = await Career.findById(id)
      .populate('typicalDegrees')
      .populate('typicalCourses')
      .populate('exams')
      .populate('relatedScholarships')
      .populate('relatedCareers')
      .populate('interestTags');

    if (!career) {
      return NextResponse.json({ 
        success: false, 
        message: 'Career not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Career retrieved successfully',
      data: career
    });
  } catch (error) {
    console.error('Error retrieving career:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error retrieving career',
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update a specific career by ID
export async function PUT(req, { params }) {
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

    // Get career ID from params
    const { id } = params;
    
    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid career ID' 
      }, { status: 400 });
    }

    // Parse request body
    const careerData = await req.json();

    // Validate required fields
    if (!careerData.name || !careerData.slug) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: name and slug are required' 
      }, { status: 400 });
    }

    // Check if career exists
    const existingCareer = await Career.findById(id);
    if (!existingCareer) {
      return NextResponse.json({ 
        success: false, 
        message: 'Career not found' 
      }, { status: 404 });
    }

    // Check if slug is already used by another career
    if (careerData.slug !== existingCareer.slug) {
      const slugExists = await Career.findOne({ 
        slug: careerData.slug,
        _id: { $ne: id }
      });
      
      if (slugExists) {
        return NextResponse.json({ 
          success: false, 
          message: 'A career with this slug already exists' 
        }, { status: 409 });
      }
    }

    // Process career data to ensure proper ObjectId conversion
    const processedCareer = processCareerData(careerData);
    
    // Set lastUpdated to current date
    processedCareer.lastUpdated = new Date();

    // Update career
    const updatedCareer = await Career.findByIdAndUpdate(
      id,
      { $set: processedCareer },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Career updated successfully',
      data: updatedCareer
    });
  } catch (error) {
    console.error('Error updating career:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error updating career',
      error: error.message
    }, { status: 500 });
  }
}

// PATCH - Update specific fields of a career by ID
export async function PATCH(req, { params }) {
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

    // Get career ID from params
    const { id } = params;
    
    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid career ID' 
      }, { status: 400 });
    }

    // Parse request body
    const updates = await req.json();

    // Check if career exists
    const existingCareer = await Career.findById(id);
    if (!existingCareer) {
      return NextResponse.json({ 
        success: false, 
        message: 'Career not found' 
      }, { status: 404 });
    }

    // Check if slug is being updated and is already used by another career
    if (updates.slug && updates.slug !== existingCareer.slug) {
      const slugExists = await Career.findOne({ 
        slug: updates.slug,
        _id: { $ne: id }
      });
      
      if (slugExists) {
        return NextResponse.json({ 
          success: false, 
          message: 'A career with this slug already exists' 
        }, { status: 409 });
      }
    }

    // Process updates to ensure proper ObjectId conversion
    const processedUpdates = {};
    Object.keys(updates).forEach(key => {
      if (key.includes('typicalDegrees') || 
          key.includes('typicalCourses') || 
          key.includes('exams') || 
          key.includes('relatedScholarships') || 
          key.includes('relatedCareers') || 
          key.includes('interestTags')) {
        
        // Handle array operations
        if (Array.isArray(updates[key])) {
          processedUpdates[key] = updates[key].map(id => {
            if (typeof id === 'string') {
              return toObjectId(id);
            }
            return id;
          }).filter(id => id !== null);
        } else {
          processedUpdates[key] = updates[key];
        }
      } else {
        processedUpdates[key] = updates[key];
      }
    });

    // Set lastUpdated to current date
    processedUpdates.lastUpdated = new Date();

    // Update career
    const updatedCareer = await Career.findByIdAndUpdate(
      id,
      { $set: processedUpdates },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Career updated successfully',
      data: updatedCareer
    });
  } catch (error) {
    console.error('Error updating career:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error updating career',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete a specific career by ID
export async function DELETE(req, { params }) {
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

    // Get career ID from params
    const { id } = params;
    
    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid career ID' 
      }, { status: 400 });
    }

    // Check if career exists
    const existingCareer = await Career.findById(id);
    if (!existingCareer) {
      return NextResponse.json({ 
        success: false, 
        message: 'Career not found' 
      }, { status: 404 });
    }

    // Delete career
    await Career.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Career deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting career:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error deleting career',
      error: error.message
    }, { status: 500 });
  }
}