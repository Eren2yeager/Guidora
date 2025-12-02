import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb.js';
import Course from '@/models/Course.js';
import Career from '@/models/Career.js';
import DegreeProgram from '@/models/DegreeProgram.js';
import College from '@/models/College.js';
import Scholarship from '@/models/Scholarship.js';
import Stream from '@/models/Stream.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    await connectMongo();

    const searchRegex = new RegExp(query.trim(), 'i');
    const results = {
      courses: [],
      careers: [],
      programs: [],
      colleges: [],
      scholarships: [],
      total: 0,
    };

    // Search Courses
    if (!type || type === 'courses') {
      const courses = await Course.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: searchRegex },
              { code: searchRegex },
              { description: searchRegex },
            ],
          },
        ],
      })
        .populate('streamId', 'name')
        .limit(limit)
        .lean();

      results.courses = courses.map(course => ({
        ...course,
        type: 'Course',
        link: `/courses/${course.code}`,
        stream: course.streamId,
      }));
    }

    // Search Careers
    if (!type || type === 'careers') {
      const careers = await Career.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: searchRegex },
              { description: searchRegex },
              { sectors: { $in: [searchRegex] } },
            ],
          },
        ],
      })
        .limit(limit)
        .lean();

      results.careers = careers.map(career => ({
        ...career,
        type: 'Career',
        link: `/careers/${career.slug}`,
      }));
    }

    // Search Programs
    if (!type || type === 'programs') {
      const programs = await DegreeProgram.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: searchRegex },
              { code: searchRegex },
            ],
          },
        ],
      })
        .populate('courseId', 'name code')
        .populate('collegeId', 'name')
        .limit(limit)
        .lean();

      results.programs = programs.map(program => ({
        ...program,
        type: 'Program',
        link: `/programs/${program._id}`,
      }));
    }

    // Search Colleges
    if (!type || type === 'colleges') {
      const colleges = await College.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: searchRegex },
              { code: searchRegex },
              { 'address.city': searchRegex },
              { 'address.state': searchRegex },
            ],
          },
        ],
      })
        .limit(limit)
        .lean();

      results.colleges = colleges.map(college => ({
        ...college,
        type: 'College',
        link: `/colleges/${college._id}`,
      }));
    }

    // Search Scholarships
    if (!type || type === 'scholarships') {
      const scholarships = await Scholarship.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: searchRegex },
              { title: searchRegex },
              { description: searchRegex },
              { provider: searchRegex },
            ],
          },
        ],
      })
        .limit(limit)
        .lean();

      results.scholarships = scholarships.map(scholarship => ({
        ...scholarship,
        type: 'Scholarship',
        link: `/scholarships/${scholarship._id}`,
      }));
    }

    // Calculate total results
    results.total = 
      results.courses.length +
      results.careers.length +
      results.programs.length +
      results.colleges.length +
      results.scholarships.length;

    return NextResponse.json({
      query,
      results,
      stats: {
        courses: results.courses.length,
        careers: results.careers.length,
        programs: results.programs.length,
        colleges: results.colleges.length,
        scholarships: results.scholarships.length,
        total: results.total,
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
