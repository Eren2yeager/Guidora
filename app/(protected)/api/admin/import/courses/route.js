import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Course from '@/models/Course.js';
import Stream from '@/models/Stream.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isAdminSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * Helper function to convert string IDs to ObjectId
 * @param {string} id - The ID to convert
 * @returns {ObjectId} - MongoDB ObjectId
 */
const toObjectId = (id) => {
  try {
    return typeof id === 'string' ? new ObjectId(id) : id;
  } catch (error) {
    return id;
  }
};

/**
 * Process course data to convert all relevant fields to ObjectId
 * @param {Object} data - The course data to process
 * @returns {Object} - Processed course data with ObjectId conversions
 */
const processCourseData = (data) => {
  const processedData = { ...data };
  
  // Convert streamId to ObjectId
  if (processedData.streamId) {
    processedData.streamId = toObjectId(processedData.streamId);
  }
  
  // Convert interestTags array to ObjectIds
  if (processedData.interestTags && Array.isArray(processedData.interestTags)) {
    processedData.interestTags = processedData.interestTags.map(tag => toObjectId(tag));
  }
  
  // Convert outcomes references to ObjectIds
  if (processedData.outcomes) {
    if (processedData.outcomes.careers && Array.isArray(processedData.outcomes.careers)) {
      processedData.outcomes.careers = processedData.outcomes.careers.map(career => toObjectId(career));
    }
    
    if (processedData.outcomes.Exams && Array.isArray(processedData.outcomes.Exams)) {
      processedData.outcomes.Exams = processedData.outcomes.Exams.map(exam => toObjectId(exam));
    }
    
    if (processedData.outcomes.higherStudies && Array.isArray(processedData.outcomes.higherStudies)) {
      processedData.outcomes.higherStudies = processedData.outcomes.higherStudies.map(course => toObjectId(course));
    }
  }
  
  return processedData;
};

export async function POST(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const contentType = req.headers.get('content-type') || '';
    
    // Handle JSON data
    if (contentType.includes('application/json')) {
      const data = await req.json();
      
      // Validate data is an array
      if (!Array.isArray(data)) {
        return NextResponse.json({ 
          success: false, 
          message: 'Data must be an array of courses' 
        }, { status: 400 });
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
              Exams: course.outcomes?.Exams || [],
              higherStudies: course.outcomes?.higherStudies || []
            },
            interestTags: course.interestTags || [],
            media: {
              iconUrl: course.media?.iconUrl || '',
              bannerUrl: course.media?.bannerUrl || ''
            },
            isActive: course.isActive !== undefined ? course.isActive : true,
            source: course.source || 'admin-import',
            sourceUrl: course.sourceUrl || ''
          };

          // Process all ObjectId references
          const processedCourseData = processCourseData(courseData);

          // Check if course already exists
          const existingCourse = await Course.findOne({ code: course.code });
          
          if (existingCourse) {
            // Update existing course
            await Course.updateOne({ _id: existingCourse._id }, { $set: processedCourseData });
            results.push({
              code: course.code,
              status: 'updated',
              message: 'Course updated successfully'
            });
          } else {
            // Create new course
            const newCourse = new Course(processedCourseData);
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
        data: { results }
      });
    }
    
    // If not JSON format
    return NextResponse.json({ 
      success: false, 
      message: 'Unsupported content type. Please send JSON data.' 
    }, { status: 415 });
  } catch (error) {
    console.error('Error importing courses:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}