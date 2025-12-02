import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    // Validate input
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user and verify OTP
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or OTP' },
        { status: 400 }
      );
    }

    // Check if OTP exists and is not expired
    if (!user.resetPasswordOTP || !user.resetPasswordExpiry) {
      return NextResponse.json(
        { error: 'No valid reset request found. Please request a new reset code.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > user.resetPasswordExpiry) {
      // Clean up expired OTP
      await User.findOneAndUpdate(
        { email },
        {
          $unset: {
            resetPasswordOTP: 1,
            resetPasswordExpiry: 1,
          },
        }
      );
      
      return NextResponse.json(
        { error: 'Reset code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.resetPasswordOTP !== otp) {
      return NextResponse.json(
        { error: 'Invalid reset code' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and remove OTP
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetPasswordOTP: 1,
          resetPasswordExpiry: 1,
        },
      }
    );

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
