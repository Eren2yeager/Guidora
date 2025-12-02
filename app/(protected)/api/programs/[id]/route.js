import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import DegreeProgram from '@/models/DegreeProgram';
import College from '@/models/College';
import Course from '@/models/Course';
import Interest from '@/models/Interest';
import SavedItem from '@/models/SavedItem';
import User from '@/models/User';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!id) {
      return NextResponse.json(
        { error: 'Program ID is required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find program and populate related data
    const program = await DegreeProgram.findById(id)
      .populate('collegeId', 'name code address')
      .populate('courseId', 'name code level')
      .populate('interestTags', 'name')
      .populate('eligibilityOverrides.requiredSubjects', 'name')
      .lean();

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Check if user has saved this program
    if (session?.user) {
      const query = {};
      if (session.user.email) query.email = session.user.email;
      if (session.user.phone) query.phone = session.user.phone;

      const user = await User.findOne(query);
      
      if (user) {
        const savedItem = await SavedItem.findOne({
          userId: user._id,
          itemType: 'Program',
          itemId: program._id,
        });
        program.isSaved = !!savedItem;
      } else {
        program.isSaved = false;
      }
    } else {
      program.isSaved = false;
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program details' },
      { status: 500 }
    );
  }
}
