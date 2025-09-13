import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Stream from '@/models/Stream.js';

export async function GET() {
  try {
    await connectDB();
    const items = await Stream.find({ isActive: true }).sort({ name: 1 }).lean();
    return NextResponse.json({ items });
  } catch (err) {
    console.error('GET /api/streams error', err);
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
  }
}