import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import College from '@/models/College.js';
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
      return NextResponse.json({ error: 'Data must be an array of colleges' }, { status: 400 });
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

        // Format the college data according to the model
        const collegeData = {
          name: college.name,
          code: college.code,
          type: college.type || 'Government',
          affiliation: college.affiliation || '',
          address: {
            line1: college.address?.line1 || '',
            district: college.address.district,
            state: college.address.state,
            pincode: college.address?.pincode || ''
          },
          location: {
            type: 'Point',
            coordinates: college.location?.coordinates || [0, 0]
          },
          facilities: {
            hostel: college.facilities?.hostel || false,
            lab: college.facilities?.lab || false,
            library: college.facilities?.library || false,
            internet: college.facilities?.internet || false,
            medium: college.facilities?.medium || []
          },
          contacts: {
            phone: college.contacts?.phone || '',
            email: college.contacts?.email || '',
            website: college.contacts?.website || ''
          },
          meta: {
            rank: college.meta?.rank || null,
            establishedYear: college.meta?.establishedYear || null
          },
          isActive: college.isActive !== undefined ? college.isActive : true,
          source: college.source || 'admin-import',
          sourceUrl: college.sourceUrl || '',
          lastUpdated: new Date()
        };

        // Check if college already exists
        const existingCollege = await College.findOne({ code: college.code });
        
        if (existingCollege) {
          // Update existing college
          await College.updateOne({ _id: existingCollege._id }, { $set: collegeData });
          results.push({
            code: college.code,
            status: 'updated',
            message: 'College updated successfully'
          });
        } else {
          // Create new college
          const newCollege = new College(collegeData);
          await newCollege.save();
          results.push({
            code: college.code,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}