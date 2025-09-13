import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import DegreeProgram from '@/models/DegreeProgram.js';
import College from '@/models/College.js';
import Course from '@/models/Course.js';
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
        return NextResponse.json({ error: 'Data must be an array of programs' }, { status: 400 });
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
      for (const program of data) {
        try {
          // Validate required fields and references
          if (!program.collegeId || !program.courseId) {
            results.push({
              code: program.code || 'unknown',
              status: 'error',
              message: 'Missing required fields (collegeId, courseId)'
            });
            continue;
          }

          // Format the program data according to the model
          const programData = {
            collegeId: program.collegeId,
            courseId: program.courseId,
            code: program.code || `${program.collegeId}-${program.courseId}`,
            durationYears: program.durationYears || 3,
            medium: program.medium || [],
            intakeMonths: program.intakeMonths || [],
            seats: program.seats || 0,
            cutoff: {
              lastYear: program.cutoff?.lastYear || 0,
              categoryWise: program.cutoff?.categoryWise || []
            },
            fees: {
              tuitionPerYear: program.fees?.tuitionPerYear || 0,
              hostelPerYear: program.fees?.hostelPerYear || 0,
              misc: program.fees?.misc || 0,
              currency: program.fees?.currency || 'INR'
            },
            eligibilityOverrides: {
              minMarks: program.eligibilityOverrides?.minMarks || null,
              requiredSubjects: program.eligibilityOverrides?.requiredSubjects || []
            },
            isActive: program.isActive !== undefined ? program.isActive : true,
            source: program.source || 'admin-import',
            sourceUrl: program.sourceUrl || '',
            lastUpdated: new Date()
          };

          // Check if program already exists
          const existingProgram = await DegreeProgram.findOne({
            collegeId: program.collegeId,
            courseId: program.courseId
          });
          
          if (existingProgram) {
            // Update existing program
            await DegreeProgram.updateOne({ _id: existingProgram._id }, { $set: programData });
            results.push({
              code: program.code || `${program.collegeId}-${program.courseId}`,
              status: 'updated',
              message: 'Program updated successfully'
            });
          } else {
            // Create new program
            const newProgram = new DegreeProgram(programData);
            await newProgram.save();
            results.push({
              code: program.code || `${program.collegeId}-${program.courseId}`,
              status: 'created',
              message: 'Program created successfully'
            });
          }
        } catch (error) {
          results.push({
            code: program.code || 'unknown',
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
    return NextResponse.json({ error: 'Unsupported content type. Please send JSON data.' }, { status: 415 });
  } catch (error) {
    console.error('Error importing programs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}