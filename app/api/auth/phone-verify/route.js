import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';
import { formatPhoneNumber } from '@/lib/smsService';

export async function POST(request) {
  try {
    const { phone, otp } = await request.json();

    // Validate input
    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    // Find user
    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      return NextResponse.json(
        { message: 'Phone number is already verified' },
        { status: 200 }
      );
    }

    // Check if OTP exists and is not expired
    if (!user.phoneVerificationOTP || !user.phoneVerificationExpiry) {
      return NextResponse.json(
        { error: 'No verification request found. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > user.phoneVerificationExpiry) {
      // Clean up expired OTP
      await User.findOneAndUpdate(
        { phone: formattedPhone },
        {
          $unset: {
            phoneVerificationOTP: 1,
            phoneVerificationExpiry: 1,
          },
        }
      );
      
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.phoneVerificationOTP !== otp) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark phone as verified and remove OTP
    await User.findOneAndUpdate(
      { phone: formattedPhone },
      {
        $set: {
          isPhoneVerified: true,
        },
        $unset: {
          phoneVerificationOTP: 1,
          phoneVerificationExpiry: 1,
        },
      }
    );

    return NextResponse.json(
      { message: 'Phone number verified successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

