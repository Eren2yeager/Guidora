import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Course from '@/models/Course.js';
import Stream from '@/models/Stream.js';
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

    const contentType = req.headers.get('content-type') || '';
    
    // Handle JSON data
    if (contentType.includes('application/json')) {
      const data = await req.json();
      
      // Validate data is an array
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: 'Data must be an array of courses' }, { status: 400 });
      }

      // Get all streams for reference
      const streams = await Stream.find({});
      const streamMap = {};
      streams.forEach(stream => {
        streamMap[stream.slug] = stream._id;
      });

      // Process each course entry
      const results = [];
      for (const course of data) {
        try {
          // Validate required fields
          if (!course.code || !course.name || !course.streamId) {
            results.push({
              code: course.code || 'unknown',
              status: 'error',
              message: 'Missing required fields (code, name, streamId)'
            });
            continue;
          }

          // Format the course data according to the model
          const courseData = {
            code: course.code,
            name: course.name,
            streamId: course.streamId,
            level: course.level || 'UG',
            description: course.description || '',
            eligibility: {
              minMarks: course.eligibility?.minMarks || 0,
              requiredSubjects: course.eligibility?.requiredSubjects || []
            },
            outcomes: {
              careers: course.outcomes?.careers || [],
              govtExams: course.outcomes?.govtExams || [],
              privateJobs: course.outcomes?.privateJobs || [],
              higherStudies: course.outcomes?.higherStudies || [],
              entrepreneurship: course.outcomes?.entrepreneurship || []
            },
            tags: course.tags || [],
            media: {
              iconUrl: course.media?.iconUrl || '',
              bannerUrl: course.media?.bannerUrl || ''
            },
            isActive: course.isActive !== undefined ? course.isActive : true,
            source: course.source || 'admin-import',
            sourceUrl: course.sourceUrl || '',
            lastUpdated: new Date()
          };

          // Check if course already exists
          const existingCourse = await Course.findOne({ code: course.code });
          
          if (existingCourse) {
            // Update existing course
            await Course.updateOne({ _id: existingCourse._id }, { $set: courseData });
            results.push({
              code: course.code,
              status: 'updated',
              message: 'Course updated successfully'
            });
          } else {
            // Create new course
            const newCourse = new Course(courseData);
            await newCourse.save();
            results.push({
              code: course.code,
              status: 'created',
              message: 'Course created successfully'
            });
          }
        } catch (error) {
          results.push({
            code: course.code || 'unknown',
            status: 'error',
            message: error.message
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Processed ${data.length} courses`,
        results
      });
    }
    
    // If not JSON format
    return NextResponse.json({ error: 'Unsupported content type. Please send JSON data.' }, { status: 415 });
  } catch (error) {
    console.error('Error importing courses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}