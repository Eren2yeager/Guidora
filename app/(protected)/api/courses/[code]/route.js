import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Course from '@/models/Course';
import Stream from '@/models/Stream';
import Career from '@/models/Career';
import Exam from '@/models/Exam';
import Interest from '@/models/Interest';
import SavedItem from '@/models/SavedItem';
import User from '@/models/User';

export async function GET(request, context) {
  try {
    const { code } = await context.params;
    const session = await getServerSession(authOptions);

    if (!code) {
      return NextResponse.json(
        { error: 'Course code is required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find course and populate related data
    const course = await Course.findOne({ code, isActive: true })
      .populate('streamId', 'name')
      .populate('outcomes.careers', 'name slug description')
      .populate('outcomes.Exams', 'name code')
      .populate('outcomes.higherStudies', 'name code level')
      .populate('interestTags', 'name')
      .lean();

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Rename streamId to stream for cleaner API response
    const formattedCourse = {
      ...course,
      stream: course.streamId,
      streamId: undefined,
    };
    delete formattedCourse.streamId;

    // Check if user has saved this course
    if (session?.user) {
      // Find user by email or phone
      const query = {};
      if (session.user.email) query.email = session.user.email;
      if (session.user.phone) query.phone = session.user.phone;

      const user = await User.findOne(query);
      
      if (user) {
        const savedItem = await SavedItem.findOne({
          userId: user._id,
          itemType: 'Course',
          itemId: course._id,
        });
        formattedCourse.isSaved = !!savedItem;
      } else {
        formattedCourse.isSaved = false;
      }
    } else {
      formattedCourse.isSaved = false;
    }

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}
