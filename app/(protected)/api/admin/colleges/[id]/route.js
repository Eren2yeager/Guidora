import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import College from '@/models/College.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';
import mongoose from 'mongoose';

/**
 * Helper function to convert string IDs to MongoDB ObjectIds
 * @param {string|any} id - The ID to convert
 * @returns {ObjectId|null} - Converted ObjectId or null if invalid
 */
const toObjectId = (id) => {
  if (!id) return null;
  if (typeof id === 'string') {
    try {
      return new mongoose.Types.ObjectId(id);
    } catch (error) {
      console.log(`Invalid ObjectId format: ${error.message}`);
      return null;
    }
  }
  return id;
};

/**
 * Process college data to convert all string IDs to ObjectIds
 * @param {Object} college - College data to process
 * @returns {Object} - Processed college data with converted ObjectIds
 */
const processCollegeData = (college) => {
  // Convert _id if it's a string
  if (college._id && typeof college._id === 'string') {
    college._id = toObjectId(college._id);
  }
  
  // Convert single reference fields
  const singleRefs = ['university'];
  singleRefs.forEach(field => {
    if (college[field] && typeof college[field] === 'string') {
      college[field] = toObjectId(college[field]);
    }
  });
  
  // Convert array reference fields
  const arrayRefs = [
    'degreePrograms',
    'courses',
    'streams',
    'examsAccepted',
    'collegeAdvisors',
    'studentAdvisors',
    'interestTags'
  ];
  
  arrayRefs.forEach(field => {
    if (college[field] && Array.isArray(college[field])) {
      college[field] = college[field].map(item => {
        if (typeof item === 'string') {
          return toObjectId(item);
        } else if (item && typeof item === 'object' && item._id && typeof item._id === 'string') {
          item._id = toObjectId(item._id);
          return item;
        }
        return item;
      }).filter(item => item !== null);
    }
  });
  
  return college;
};

// GET /api/admin/colleges/[id]
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

    const { id } = params;
    
    // Convert id to ObjectId if needed
    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid college ID format' 
      }, { status: 400 });
    }

    // Find college by ID with populated references
    const college = await College.findById(objectId)
      .populate('university')
      .populate('degreePrograms')
      .populate('courses')
      .populate('streams')
      .populate('examsAccepted')
      .populate('interestTags');
      
    if (!college) {
      return NextResponse.json({ 
        success: false, 
        message: 'College not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: college
    });
  } catch (error) {
    console.error('Error fetching college:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT /api/admin/colleges/[id]
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

    const { id } = params;
    const data = await req.json();
    
    // Convert id to ObjectId if needed
    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid college ID format' 
      }, { status: 400 });
    }

    // Validate required fields
    if (!data.name || !data.code || !data.address?.district || !data.address?.state) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields (name, code, district, state)' 
      }, { status: 400 });
    }

    // Check if college exists
    const college = await College.findById(objectId);
    if (!college) {
      return NextResponse.json({ 
        success: false, 
        message: 'College not found' 
      }, { status: 404 });
    }

    // Check for duplicate code (excluding current college)
    const existingCollege = await College.findOne({ 
      code: data.code,
      _id: { $ne: objectId }
    });
    if (existingCollege) {
      return NextResponse.json({ 
        success: false, 
        message: 'Another college with this code already exists' 
      }, { status: 409 });
    }
    
    // Process ObjectId references
    const processedData = processCollegeData(data);

    // Update college
    const updatedCollege = await College.findByIdAndUpdate(
      objectId,
      { 
        ...processedData,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'College updated successfully',
      data: updatedCollege
    });
  } catch (error) {
    console.error('Error updating college:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PATCH /api/admin/colleges/[id]
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

    const { id } = params;
    const data = await req.json();
    
    // Convert id to ObjectId if needed
    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid college ID format' 
      }, { status: 400 });
    }

    // Check if college exists
    const college = await College.findById(objectId);
    if (!college) {
      return NextResponse.json({ 
        success: false, 
        message: 'College not found' 
      }, { status: 404 });
    }

    // If code is being updated, check for duplicates
    if (data.code && data.code !== college.code) {
      const existingCollege = await College.findOne({ 
        code: data.code,
        _id: { $ne: objectId }
      });
      if (existingCollege) {
        return NextResponse.json({ 
          success: false, 
          message: 'Another college with this code already exists' 
        }, { status: 409 });
      }
    }
    
    // Process ObjectId references
    const processedData = processCollegeData(data);

    // Update college with partial data
    const updatedCollege = await College.findByIdAndUpdate(
      objectId,
      { 
        ...processedData,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'College updated successfully',
      data: updatedCollege
    });
  } catch (error) {
    console.error('Error updating college:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/admin/colleges/[id]
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
    
    const { id } = params;
    
    // Convert id to ObjectId if needed
    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid college ID format' 
      }, { status: 400 });
    }

    // Check if college exists
    const college = await College.findById(objectId);
    if (!college) {
      return NextResponse.json({ 
        success: false, 
        message: 'College not found' 
      }, { status: 404 });
    }

    // Delete college
    await College.findByIdAndDelete(objectId);

    return NextResponse.json({
      success: true,
      message: 'College deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting college:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}