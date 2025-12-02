import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.js';
import connectDB from '@/lib/mongodb.js';
import User from '@/models/User.js';
import Progress from '@/models/Progress.js';

// GET /api/user/progress -> returns or initializes progress for user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({
      $or: [{ email: session.user.email }, { phone: session.user.phone }],
    }).select('_id').lean();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let progress = await Progress.findOne({ userId: user._id }).lean();
    if (!progress) {
      progress = (await Progress.create({ userId: user._id, overall: 0, milestones: [] })).toObject();
    }
    return NextResponse.json(progress);
  } catch (err) {
    console.error('GET /api/user/progress error', err);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

// PUT /api/user/progress -> update overall or milestones
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const user = await User.findOne({
      $or: [{ email: session.user.email }, { phone: session.user.phone }],
    }).select('_id').lean();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();

    const update = {};
    if (typeof body?.overall === 'number') update.overall = Math.max(0, Math.min(100, body.overall));
    if (Array.isArray(body?.milestones)) update.milestones = body.milestones;

    const updated = await Progress.findOneAndUpdate(
      { userId: user._id },
      { $set: update },
      { upsert: true, new: true }
    );

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/user/progress error', err);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}


