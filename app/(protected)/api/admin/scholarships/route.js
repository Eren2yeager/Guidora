import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Scholarship from '@/models/Scholarship.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    await connectDB();
    const scholarships = await Scholarship.find().sort({ name: 1 });
    return NextResponse.json(scholarships);
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    await connectDB();
    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }

    // Validate provider enum if provided
    if (data.provider && !['Gov', 'College', 'NGO', 'Private', 'Other'].includes(data.provider)) {
      return NextResponse.json({ error: 'Invalid provider value' }, { status: 400 });
    }

    // Add lastUpdated timestamp
    data.lastUpdated = new Date();

    const scholarship = await Scholarship.create(data);
    return NextResponse.json(scholarship);
  } catch (error) {
    console.error('Error creating scholarship:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}