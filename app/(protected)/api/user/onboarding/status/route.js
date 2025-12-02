import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.js';
import connectDB from '@/lib/mongodb.js';
import User from '@/models/User.js';
import QuizResult from '@/models/QuizResult.js';
import Progress from '@/models/Progress.js';

function scoreBoolean(ok) {
  return ok ? 1 : 0;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const user = await User.findOne({
      $or: [{ email: session.user.email }, { phone: session.user.phone }],
    }).lean();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const latestQuiz = await QuizResult.findOne({ userId: user._id }).sort({ createdAt: -1 }).lean();
    const progress = await Progress.findOne({ userId: user._id }).lean();

    const profileComplete = Boolean(user.name && user.classLevel && user.location?.state);
    const assessmentDone = Boolean(latestQuiz);
    const interestsSet = Array.isArray(user.interests) && user.interests.length > 0;
    const progressValue = typeof progress?.overall === 'number' ? Math.max(0, Math.min(100, progress.overall)) : 0;

    const parts = [
      scoreBoolean(profileComplete),
      scoreBoolean(assessmentDone),
      scoreBoolean(interestsSet),
      progressValue / 100,
    ];
    const overall = Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);

    return NextResponse.json({
      profileComplete,
      assessmentDone,
      interestsSet,
      progress: progressValue,
      overall,
    });
  } catch (err) {
    console.error('GET /api/user/onboarding/status error', err);
    return NextResponse.json({ error: 'Failed to compute status' }, { status: 500 });
  }
}


