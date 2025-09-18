import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// POST /api/user/update-interests - Update user interests based on quiz results
export async function POST(request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { interests, quizResultId } = await request.json();
    
    // Validate request
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: 'Interests array is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email or phone
    const query = {};
    if (session.user.email) query.email = session.user.email;
    if (session.user.phone) query.phone = session.user.phone;

    // Update user interests
    const updatedUser = await User.findOneAndUpdate(
      query,
      { 
        $set: { interests },
        $push: { quizResults: quizResultId } // Optional: track which quiz result led to these interests
      },
      { new: true }
    ).select('-password -resetPasswordOTP -resetPasswordExpiry -phoneResetOTP -phoneResetExpiry -phoneVerificationOTP -phoneVerificationExpiry');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User interests updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user interests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}