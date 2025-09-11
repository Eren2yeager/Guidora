import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';
import { formatPhoneNumber } from '@/lib/smsService';
import { verifyIdToken } from '@/lib/firebaseAdmin';

export async function POST(request) {
	try {
		const { phone, password, name, idToken } = await request.json();

		// Validate input
		if (!phone || !password || !idToken) {
			return NextResponse.json(
				{ error: 'Phone, password and idToken are required' },
				{ status: 400 }
			);
		}
		if (password.length < 6) {
			return NextResponse.json(
				{ error: 'Password must be at least 6 characters' },
				{ status: 400 }
			);
		}

		// Verify Firebase token
		const decoded = await verifyIdToken(idToken);
		if (!decoded || !decoded.phone_number) {
			return NextResponse.json(
				{ error: 'Invalid Firebase token' },
				{ status: 401 }
			);
		}

		const formattedPhone = formatPhoneNumber(phone);
		const tokenPhone = formatPhoneNumber(decoded.phone_number);
		if (formattedPhone !== tokenPhone) {
			return NextResponse.json(
				{ error: 'Phone number mismatch' },
				{ status: 400 }
			);
		}

		// Connect to database
		await connectDB();

		// Check if user already exists
		const existingUser = await User.findOne({ phone: formattedPhone });
		if (existingUser) {
			return NextResponse.json(
				{ error: 'User already exists with this phone number' },
				{ status: 400 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create user (phone already verified by Firebase)
		const user = await User.create({
			phone: formattedPhone,
			password: hashedPassword,
			name: name || '',
			isPhoneVerified: true,
		});

		const { password: _pw, ...userWithoutPassword } = user.toObject();
		return NextResponse.json(
			{ message: 'User created successfully', user: userWithoutPassword },
			{ status: 201 }
		);
	} catch (error) {
		console.error('Phone registration error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
