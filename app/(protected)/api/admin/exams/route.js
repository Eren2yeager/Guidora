import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Exam from '@/models/Exam.js';
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
    const exams = await Exam.find().sort({ date: 1 });
    return NextResponse.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
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
    if (!data.name || !data.type || !data.date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if exam already exists
    const existingExam = await Exam.findOne({ name: data.name });
    if (existingExam) {
      return NextResponse.json({ error: 'Exam with this name already exists' }, { status: 400 });
    }

    const exam = await Exam.create(data);
    return NextResponse.json(exam);
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}