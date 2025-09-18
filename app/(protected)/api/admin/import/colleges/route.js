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
        message: 'Data must be an array of colleges' 
      }, { status: 400 });
    }

    // Process each college entry
    const results = [];
    for (const college of data) {
      try {
        // Validate required fields
        if (!college.name || !college.code || !college.address?.district || !college.address?.state) {
          results.push({
            code: college.code || 'unknown',
            status: 'error',
            message: 'Missing required fields (name, code, district, state)'
          });
          continue;
        }
        
        // Process all ObjectId references
        const processedCollege = processCollegeData(college);

        // Format the college data according to the model
        const collegeData = {
          _id: processedCollege._id,
          name: processedCollege.name,
          code: processedCollege.code,
          type: processedCollege.type || 'Government',
          university: processedCollege.university,
          media: processedCollege.media || {
            iconUrl: "",
            bannerUrl: ""
          },
          address: {
            line1: processedCollege.address?.line1 || '',
            district: processedCollege.address.district,
            state: processedCollege.address.state,
            pincode: processedCollege.address?.pincode || ''
          },
          location: {
            type: 'Point',
            coordinates: processedCollege.location?.coordinates || [0, 0]
          },
          facilities: {
            hostel: processedCollege.facilities?.hostel || false,
            lab: processedCollege.facilities?.lab || false,
            library: processedCollege.facilities?.library || false,
            internet: processedCollege.facilities?.internet || false,
            medium: processedCollege.facilities?.medium || []
          },
          degreePrograms: processedCollege.degreePrograms || [],
          courses: processedCollege.courses || [],
          streams: processedCollege.streams || [],
          examsAccepted: processedCollege.examsAccepted || [],
          collegeAdvisors: processedCollege.collegeAdvisors || [],
          studentAdvisors: processedCollege.studentAdvisors || [],
          interestTags: processedCollege.interestTags || [],
          contacts: {
            phone: processedCollege.contacts?.phone || '',
            email: processedCollege.contacts?.email || '',
            website: processedCollege.contacts?.website || ''
          },
          meta: {
            rank: processedCollege.meta?.rank || null,
            establishedYear: processedCollege.meta?.establishedYear || null
          },
          isActive: processedCollege.isActive !== undefined ? processedCollege.isActive : true,
          source: processedCollege.source || 'admin-import',
          sourceUrl: processedCollege.sourceUrl || '',
          lastUpdated: new Date()
        };

        // Check if college already exists
        const existingCollege = await College.findOne({ code: processedCollege.code });
        
        if (existingCollege) {
          // Update existing college
          await College.updateOne({ _id: existingCollege._id }, { $set: collegeData });
          results.push({
            code: processedCollege.code,
            status: 'updated',
            message: 'College updated successfully'
          });
        } else {
          // Create new college
          const newCollege = new College(collegeData);
          await newCollege.save();
          results.push({
            code: processedCollege.code,
            status: 'created',
            message: 'College created successfully'
          });
        }
      } catch (error) {
        results.push({
          code: college.code || 'unknown',
          status: 'error',
          message: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${data.length} colleges`,
      results
    });

  } catch (error) {
    console.error('Error importing colleges:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}