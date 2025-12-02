import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// GET /api/user/saved-scholarships - Get current user's saved scholarships
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

    const user = await User.findOne(query).select('goals.scholarships');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      savedScholarships: user.goals?.scholarships || [] 
    });
  } catch (error) {
    console.error('Error fetching saved scholarships:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user/saved-scholarships - Save a scholarship
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scholarshipId } = await request.json();

    if (!scholarshipId) {
      return NextResponse.json({ error: 'Scholarship ID is required' }, { status: 400 });
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

    // Initialize goals.scholarships if it doesn't exist
    if (!user.goals) {
      user.goals = { scholarships: [] };
    }
    if (!user.goals.scholarships) {
      user.goals.scholarships = [];
    }

    // Check if already saved
    const isAlreadySaved = user.goals.scholarships.some(
      id => id.toString() === scholarshipId
    );

    if (isAlreadySaved) {
      return NextResponse.json({ 
        message: 'Scholarship already saved',
        savedScholarships: user.goals.scholarships 
      });
    }

    // Add scholarship to saved list
    user.goals.scholarships.push(scholarshipId);
    await user.save({ validateModifiedOnly: true });

    return NextResponse.json({ 
      message: 'Scholarship saved successfully',
      savedScholarships: user.goals.scholarships 
    });
  } catch (error) {
    console.error('Error saving scholarship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/saved-scholarships - Unsave a scholarship
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scholarshipId } = await request.json();

    if (!scholarshipId) {
      return NextResponse.json({ error: 'Scholarship ID is required' }, { status: 400 });
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

    // Remove scholarship from saved list
    if (user.goals?.scholarships) {
      user.goals.scholarships = user.goals.scholarships.filter(
        id => id.toString() !== scholarshipId
      );
      await user.save({ validateModifiedOnly: true });
    }

    return NextResponse.json({ 
      message: 'Scholarship removed from saved list',
      savedScholarships: user.goals?.scholarships || [] 
    });
  } catch (error) {
    console.error('Error removing saved scholarship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
