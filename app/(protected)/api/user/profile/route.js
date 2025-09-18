import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// GET /api/user/profile - Get current user's profile
export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Find user by email or phone
    const query = {};
    if (session.user.email) query.email = session.user.email;
    if (session.user.phone) query.phone = session.user.phone;

    // Get user data
    const user = await User.findOne(query).select(' -password -resetPasswordOTP -resetPasswordExpiry -phoneResetOTP -phoneResetExpiry -phoneVerificationOTP -phoneVerificationExpiry');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update current user's profile
export async function PUT(request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const updateData = await request.json();

    // Connect to database
    await connectDB();

    // Find user by email or phone
    const query = {};
    if (session.user.email) query.email = session.user.email;
    if (session.user.phone) query.phone = session.user.phone;

    // Get user data
    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update allowed fields only
    const allowedFields = [
      'name',
      'gender',
      'dob',
      'classLevel',
      'location',
      'academics',
      'interests',
      'goals',
      'image'
    ];

    // Create update object with only allowed fields
    const updateObj = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateObj[field] = updateData[field];
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateObj },
      { new: true }
    ).select('-password -resetPasswordOTP -resetPasswordExpiry -phoneResetOTP -phoneResetExpiry -phoneVerificationOTP -phoneVerificationExpiry');

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}