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

// GET /api/admin/colleges
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const sortField = searchParams.get('sortField') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const sortOptions = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Build search query
    const query = searchTerm ? {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } },
        { 'address.state': { $regex: searchTerm, $options: 'i' } },
        { 'address.district': { $regex: searchTerm, $options: 'i' } }
      ]
    } : {};

    // Fetch colleges with pagination
    const totalColleges = await College.countDocuments(query);
    const colleges = await College.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: colleges,
      pagination: {
        total: totalColleges,
        page,
        limit,
        pages: Math.ceil(totalColleges / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// POST /api/admin/colleges
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

    // Get request body
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.code || !data.address?.district || !data.address?.state) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields (name, code, district, state)' 
      }, { status: 400 });
    }

    // Check for duplicate code
    const existingCollege = await College.findOne({ code: data.code });
    if (existingCollege) {
      return NextResponse.json({ 
        success: false, 
        message: 'College with this code already exists' 
      }, { status: 409 });
    }

    // Process ObjectId references
    const processedData = processCollegeData(data);

    // Create new college
    const college = new College({
      ...processedData,
      lastUpdated: new Date()
    });
    await college.save();

    return NextResponse.json({
      success: true,
      message: 'College created successfully',
      data: college
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating college:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT /api/admin/colleges/[id]
// export async function PUT(req, { params }) {
//   try {
//     // Secure admin authentication check
//     const session = await getServerSession(authOptions);
//     if (!isAdminSession(session)) {
//       return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
//     }

//     // Connect to database
//     await connectDB();

//     const { id } =await  params;
//     const data = await req.json();

//     // Validate required fields
//     if (!data.name || !data.code || !data.address?.district || !data.address?.state) {
//       return NextResponse.json({ 
//         error: 'Missing required fields (name, code, district, state)' 
//       }, { status: 400 });
//     }

//     // Check if college exists
//     const college = await College.findById(id);
//     if (!college) {
//       return NextResponse.json({ error: 'College not found' }, { status: 404 });
//     }

//     // Check for duplicate code (excluding current college)
//     const existingCollege = await College.findOne({ 
//       code: data.code,
//       _id: { $ne: id }
//     });
//     if (existingCollege) {
//       return NextResponse.json({ 
//         error: 'Another college with this code already exists' 
//       }, { status: 409 });
//     }

//     // Update college
//     const updatedCollege = await College.findByIdAndUpdate(
//       id,
//       { 
//         ...data,
//         lastUpdated: new Date()
//       },
//       { new: true, runValidators: true }
//     );

//     return NextResponse.json(updatedCollege);
//   } catch (error) {
//     console.error('Error updating college:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // DELETE /api/admin/colleges/[id]
// export async function DELETE(req, { params }) {
//   try {
//     // Secure admin authentication check
//     const session = await getServerSession(authOptions);
//     if (!isAdminSession(session)) {
//       return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
//     }

//     // Connect to database
//     await connectDB();

//     const { id } =await params;

//     // Check if college exists
//     const college = await College.findById(id);
//     if (!college) {
//       return NextResponse.json({ error: 'College not found' }, { status: 404 });
//     }

//     // Delete college
//     await College.findByIdAndDelete(id);

//     return NextResponse.json({ message: 'College deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting college:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }