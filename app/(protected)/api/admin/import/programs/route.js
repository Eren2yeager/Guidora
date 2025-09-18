import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import DegreeProgram from '@/models/DegreeProgram.js';
import College from '@/models/College.js';
import Course from '@/models/Course.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isAdminSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * Convert string ID to MongoDB ObjectId
 * @param {string} id - The ID to convert
 * @returns {ObjectId} MongoDB ObjectId
 */
const toObjectId = (id) => {
  if (!id) return null;
  return new ObjectId(id);
};

/**
 * Process program data to convert string IDs to ObjectIds
 * @param {Object} programData - The program data to process
 * @returns {Object} Processed program data with ObjectIds
 */
const processProgramData = (programData) => {
  if (!programData) return null;
  
  const processed = { ...programData };
  
  // Convert main IDs
  if (processed._id) processed._id = toObjectId(processed._id);
  if (processed.collegeId) processed.collegeId = toObjectId(processed.collegeId);
  if (processed.courseId) processed.courseId = toObjectId(processed.courseId);
  
  // Convert arrays of IDs
  if (processed.interestTags && Array.isArray(processed.interestTags)) {
    processed.interestTags = processed.interestTags.map(tag => toObjectId(tag));
  }
  
  // Convert eligibilityOverrides.requiredSubjects if it exists
  if (processed.eligibilityOverrides && processed.eligibilityOverrides.requiredSubjects) {
    processed.eligibilityOverrides.requiredSubjects = 
      processed.eligibilityOverrides.requiredSubjects.map(subject => toObjectId(subject));
  }
  
  return processed;
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

    const contentType = req.headers.get('content-type') || '';
    
    // Handle JSON data
    if (contentType.includes('application/json')) {
      const data = await req.json();
      
      // Validate data is an array
      if (!Array.isArray(data)) {
        return NextResponse.json({ 
          success: false, 
          message: 'Data must be an array of programs' 
        }, { status: 400 });
      }

      // Get all colleges and courses for reference
      const colleges = await College.find({}, { code: 1 });
      const courses = await Course.find({}, { code: 1 });
      
      const collegeMap = {};
      colleges.forEach(college => {
        collegeMap[college.code] = college._id;
      });
      
      const courseMap = {};
      courses.forEach(course => {
        courseMap[course.code] = course._id;
      });

      // Process each program entry
      const results = [];
      for (const programData of data) {
        try {
          // Validate required fields and references
          if (!programData.collegeId || !programData.courseId) {
            results.push({
              code: programData.code || 'unknown',
              status: 'error',
              message: 'Missing required fields (collegeId, courseId)'
            });
            continue;
          }

          // Process the program data to convert string IDs to ObjectIds
          const processedData = processProgramData({
            ...programData,
            code: programData.code || `${programData.collegeId}-${programData.courseId}`,
            durationYears: programData.durationYears || 3,
            medium: programData.medium || [],
            intakeMonths: programData.intakeMonths || [],
            seats: programData.seats || 0,
            cutoff: {
              lastYear: programData.cutoff?.lastYear || 0,
              categoryWise: programData.cutoff?.categoryWise || []
            },
            fees: {
              tuitionPerYear: programData.fees?.tuitionPerYear || 0,
              hostelPerYear: programData.fees?.hostelPerYear || 0,
              misc: programData.fees?.misc || 0,
              currency: programData.fees?.currency || 'INR'
            },
            eligibilityOverrides: {
              minMarks: programData.eligibilityOverrides?.minMarks || null,
              requiredSubjects: programData.eligibilityOverrides?.requiredSubjects || []
            },
            isActive: programData.isActive !== undefined ? programData.isActive : true,
            source: programData.source || 'admin-import',
            sourceUrl: programData.sourceUrl || '',
            lastUpdated: new Date()
          });

          // Check if program already exists
          const existingProgram = await DegreeProgram.findOne({
            collegeId: processedData.collegeId,
            courseId: processedData.courseId
          });
          
          if (existingProgram) {
            // Update existing program
            await DegreeProgram.updateOne({ _id: existingProgram._id }, { $set: processedData });
            results.push({
              code: processedData.code,
              status: 'updated',
              message: 'Program updated successfully'
            });
          } else {
            // Create new program
            const newProgram = new DegreeProgram(processedData);
            await newProgram.save();
            results.push({
              code: processedData.code,
              status: 'created',
              message: 'Program created successfully'
            });
          }
        } catch (error) {
          results.push({
            code: programData.code || 'unknown',
            status: 'error',
            message: error.message
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Processed ${data.length} programs`,
        results
      });
    }
    
    // If not JSON format
    return NextResponse.json({ 
      success: false, 
      message: 'Unsupported content type. Please send JSON data.' 
    }, { status: 415 });
  } catch (error) {
    console.error('Error importing programs:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}