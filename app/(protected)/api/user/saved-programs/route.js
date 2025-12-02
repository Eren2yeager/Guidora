import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import SavedItem from '@/models/SavedItem';
import DegreeProgram from '@/models/DegreeProgram';
import User from '@/models/User';
import mongoose from 'mongoose';

// POST - Save a program
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { programId } = await request.json();

    if (!programId) {
      return NextResponse.json(
        { error: 'Program ID is required' },
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

    // Verify program exists
    const program = await DegreeProgram.findById(programId);
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const existing = await SavedItem.findOne({
      userId: user._id,
      itemType: 'Program',
      itemId: programId,
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Program already saved', savedItem: existing },
        { status: 200 }
      );
    }

    // Create saved item
    const savedItem = await SavedItem.create({
      _id: new mongoose.Types.ObjectId(),
      userId: user._id,
      itemType: 'Program',
      itemId: programId,
    });

    return NextResponse.json(
      { message: 'Program saved successfully', savedItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving program:', error);
    return NextResponse.json(
      { error: 'Failed to save program' },
      { status: 500 }
    );
  }
}

// DELETE - Unsave a program
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { programId } = await request.json();

    if (!programId) {
      return NextResponse.json(
        { error: 'Program ID is required' },
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
      itemType: 'Program',
      itemId: programId,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Saved program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Program removed from saved items' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing saved program:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved program' },
      { status: 500 }
    );
  }
}

// GET - Get all saved programs for the current user
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

    // Find all saved programs
    const savedItems = await SavedItem.find({
      userId: user._id,
      itemType: 'Program',
    })
      .populate('itemId')
      .sort({ createdAt: -1 })
      .lean();

    // Format response
    const programs = savedItems
      .filter(item => item.itemId) // Filter out any null references
      .map(item => ({
        ...item.itemId,
        savedAt: item.createdAt,
      }));

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching saved programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved programs' },
      { status: 500 }
    );
  }
}
