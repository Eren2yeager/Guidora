import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import SavedItem from '@/models/SavedItem';
import Course from '@/models/Course';
import User from '@/models/User';
import mongoose from 'mongoose';

// POST - Save a course
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
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

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const existing = await SavedItem.findOne({
      userId: user._id,
      itemType: 'Course',
      itemId: courseId,
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Course already saved', savedItem: existing },
        { status: 200 }
      );
    }

    // Create saved item
    const savedItem = await SavedItem.create({
      _id: new mongoose.Types.ObjectId(),
      userId: user._id,
      itemType: 'Course',
      itemId: courseId,
    });

    return NextResponse.json(
      { message: 'Course saved successfully', savedItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving course:', error);
    return NextResponse.json(
      { error: 'Failed to save course' },
      { status: 500 }
    );
  }
}

// DELETE - Unsave a course
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
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

    // Delete saved item
    const result = await SavedItem.findOneAndDelete({
      userId: user._id,
      itemType: 'Course',
      itemId: courseId,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Saved course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Course removed from saved items' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing saved course:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved course' },
      { status: 500 }
    );
  }
}

// GET - Get all saved courses for the current user
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

    // Find all saved courses
    const savedItems = await SavedItem.find({
      userId: user._id,
      itemType: 'Course',
    })
      .populate('itemId')
      .sort({ createdAt: -1 })
      .lean();

    // Format response
    const courses = savedItems
      .filter(item => item.itemId) // Filter out any null references
      .map(item => ({
        ...item.itemId,
        savedAt: item.createdAt,
      }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching saved courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved courses' },
      { status: 500 }
    );
  }
}
