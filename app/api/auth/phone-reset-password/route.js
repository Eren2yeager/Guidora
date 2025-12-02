import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';
import { formatPhoneNumber } from '@/lib/smsService';
import { verifyIdToken } from '@/lib/firebaseAdmin';

export async function POST(request) {
	try {
		const { phone, idToken, newPassword } = await request.json();

		// Validate input
		if (!phone || !idToken || !newPassword) {
			return NextResponse.json(
				{ error: 'Phone number, idToken, and new password are required' },
				{ status: 400 }
			);
		}

		if (newPassword.length < 6) {
			return NextResponse.json(
				{ error: 'Password must be at least 6 characters long' },
				{ status: 400 }
			);
		}

		// Verify Firebase ID token
		const decoded = await verifyIdToken(idToken);
		if (!decoded || !decoded.phone_number) {
			return NextResponse.json(
				{ error: 'Invalid Firebase token' },
				{ status: 401 }
			);
		}

		// Ensure token phone matches request phone
		const formattedPhoneFromClient = formatPhoneNumber(phone);
		const formattedPhoneFromToken = formatPhoneNumber(decoded.phone_number);
		if (formattedPhoneFromClient !== formattedPhoneFromToken) {
			return NextResponse.json(
				{ error: 'Phone number mismatch' },
				{ status: 400 }
			);
		}

		// Connect to database
		await connectDB();

		// Find user
		const user = await User.findOne({ phone: formattedPhoneFromClient });
		if (!user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 12);

		// Update password (clear any server-side reset flags if present)
		await User.findOneAndUpdate(
			{ phone: formattedPhoneFromClient },
			{
				$set: {
					password: hashedPassword,
				},
				$unset: {
					phoneResetOTP: 1,
					phoneResetExpiry: 1,
				},
			}
		);

		return NextResponse.json(
			{ message: 'Password reset successfully' },
			{ status: 200 }
		);

	} catch (error) {
		console.error('Phone reset password error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
