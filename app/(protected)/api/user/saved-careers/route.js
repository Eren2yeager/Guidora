import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// GET /api/user/saved-careers - Get current user's saved careers
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

    const user = await User.findOne(query).select('goals.careers');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      savedCareers: user.goals?.careers || [] 
    });
  } catch (error) {
    console.error('Error fetching saved careers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user/saved-careers - Save a career
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { careerId } = await request.json();

    if (!careerId) {
      return NextResponse.json({ error: 'Career ID is required' }, { status: 400 });
    }

    await connectDB();

    const query = {};
    if (session.user.email) query.email = session.user.email;
    if (session.user.phone) query.phone = session.user.phone;

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize goals.careers if it doesn't exist
    if (!user.goals) {
      user.goals = { careers: [] };
    }
    if (!user.goals.careers) {
      user.goals.careers = [];
    }

    // Check if already saved
    const isAlreadySaved = user.goals.careers.some(
      id => id.toString() === careerId
    );

    if (isAlreadySaved) {
      return NextResponse.json({ 
        message: 'Career already saved',
        savedCareers: user.goals.careers 
      });
    }

    // Fix invalid geo data if present
    if (user.location?.geo && (!user.location.geo.coordinates || user.location.geo.coordinates.length === 0)) {
      user.location.geo = undefined;
    }

    // Add career to saved list
    user.goals.careers.push(careerId);
    await user.save({ validateModifiedOnly: true });

    return NextResponse.json({ 
      message: 'Career saved successfully',
      savedCareers: user.goals.careers 
    });
  } catch (error) {
    console.error('Error saving career:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/saved-careers - Unsave a career
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { careerId } = await request.json();

    if (!careerId) {
      return NextResponse.json({ error: 'Career ID is required' }, { status: 400 });
    }

    await connectDB();

    const query = {};
    if (session.user.email) query.email = session.user.email;
    if (session.user.phone) query.phone = session.user.phone;

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fix invalid geo data if present
    if (user.location?.geo && (!user.location.geo.coordinates || user.location.geo.coordinates.length === 0)) {
      user.location.geo = undefined;
    }

    // Remove career from saved list
    if (user.goals?.careers) {
      user.goals.careers = user.goals.careers.filter(
        id => id.toString() !== careerId
      );
      await user.save({ validateModifiedOnly: true });
    }

    return NextResponse.json({ 
      message: 'Career removed from saved list',
      savedCareers: user.goals?.careers || [] 
    });
  } catch (error) {
    console.error('Error removing saved career:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
