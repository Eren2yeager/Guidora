import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import SavedItem from '@/models/SavedItem';
import User from '@/models/User';
import Course from '@/models/Course';
import Career from '@/models/Career';
import DegreeProgram from '@/models/DegreeProgram';
import College from '@/models/College';
import Scholarship from '@/models/Scholarship';

// GET - Get all saved items for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectMongo();

    // Find user by email or phone
    const query = {};
    if (session.user.email) query.email = session.user.email;
    if (session.user.phone) query.phone = session.user.phone;

    const user = await User.findOne(query);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find all saved items for this user
    const savedItems = await SavedItem.find({
      userId: user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Group by type and populate
    const itemsByType = {
      Course: [],
      Career: [],
      Program: [],
      College: [],
      Scholarship: [],
    };

    // Separate items by type
    savedItems.forEach(item => {
      if (itemsByType[item.itemType]) {
        itemsByType[item.itemType].push(item.itemId);
      }
    });

    // Fetch actual data for each type
    const [courses, careers, programs, colleges, scholarships] = await Promise.all([
      Course.find({ _id: { $in: itemsByType.Course } }).lean(),
      Career.find({ _id: { $in: itemsByType.Career } }).lean(),
      DegreeProgram.find({ _id: { $in: itemsByType.Program } })
        .populate('courseId', 'name code')
        .populate('collegeId', 'name')
        .lean(),
      College.find({ _id: { $in: itemsByType.College } }).lean(),
      Scholarship.find({ _id: { $in: itemsByType.Scholarship } }).lean(),
    ]);

    // Add savedAt timestamp to each item
    const addSavedAt = (items, type) => {
      return items.map(item => {
        const savedItem = savedItems.find(
          si => si.itemType === type && si.itemId.toString() === item._id.toString()
        );
        return {
          ...item,
          savedAt: savedItem?.createdAt,
        };
      });
    };

    return NextResponse.json({
      courses: addSavedAt(courses, 'Course'),
      careers: addSavedAt(careers, 'Career'),
      programs: addSavedAt(programs, 'Program'),
      colleges: addSavedAt(colleges, 'College'),
      scholarships: addSavedAt(scholarships, 'Scholarship'),
      stats: {
        courses: courses.length,
        careers: careers.length,
        programs: programs.length,
        colleges: colleges.length,
        scholarships: scholarships.length,
        total: savedItems.length,
      },
    });
  } catch (error) {
    console.error('Error fetching saved items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved items' },
      { status: 500 }
    );
  }
}
