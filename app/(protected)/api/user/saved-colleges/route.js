import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// GET /api/user/saved-colleges - Get current user's saved colleges
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const query = {};
    if (session.user.email) query.email = session.user.email;
    if (session.user.phone) query.phone = session.user.phone;

    const user = await User.findOne(query).select('goals.colleges');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      savedColleges: user.goals?.colleges || [] 
    });
  } catch (error) {
    console.error('Error fetching saved colleges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user/saved-colleges - Save a college
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collegeId } = await request.json();

    if (!collegeId) {
      return NextResponse.json({ error: 'College ID is required' }, { status: 400 });
    }

    await connectDB();

    const query = {};
    if (session.user.email) query.email = session.user.email;
    if (session.user.phone) query.phone = session.user.phone;

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize goals.colleges if it doesn't exist
    if (!user.goals) {
      user.goals = { colleges: [] };
    }
    if (!user.goals.colleges) {
      user.goals.colleges = [];
    }

    // Check if already saved
    const isAlreadySaved = user.goals.colleges.some(
      id => id.toString() === collegeId
    );

    if (isAlreadySaved) {
      return NextResponse.json({ 
        message: 'College already saved',
        savedColleges: user.goals.colleges 
      });
    }

    // Add college to saved list
    user.goals.colleges.push(collegeId);
    await user.save();

    return NextResponse.json({ 
      message: 'College saved successfully',
      savedColleges: user.goals.colleges 
    });
  } catch (error) {
    console.error('Error saving college:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/saved-colleges - Unsave a college
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collegeId } = await request.json();

    if (!collegeId) {
      return NextResponse.json({ error: 'College ID is required' }, { status: 400 });
    }

    await connectDB();

    const query = {};
    if (session.user.email) query.email = session.user.email;
    if (session.user.phone) query.phone = session.user.phone;

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove college from saved list
    if (user.goals?.colleges) {
      user.goals.colleges = user.goals.colleges.filter(
        id => id.toString() !== collegeId
      );
      await user.save();
    }

    return NextResponse.json({ 
      message: 'College removed from saved list',
      savedColleges: user.goals?.colleges || [] 
    });
  } catch (error) {
    console.error('Error removing saved college:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
