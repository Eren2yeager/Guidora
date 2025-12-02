import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.js';
import connectDB from '@/lib/mongodb.js';
import Roadmap from '@/models/Roadmap.js';
import User from '@/models/User.js';
import QuizResult from '@/models/QuizResult.js';

// GET /api/roadmap
// Returns latest roadmap for current user; if missing, generates a basic one
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({
      $or: [{ email: session.user.email }, { phone: session.user.phone }],
    })
      .select('classLevel interests goals name')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clean up any malformed roadmaps first
    try {
      await Roadmap.deleteMany({ userId: user._id, _id: null });
    } catch (cleanupErr) {
      console.warn('Cleanup warning:', cleanupErr.message);
    }

    let roadmap = await Roadmap.findOne({ userId: user._id }).sort({ createdAt: -1 }).lean();

    if (!roadmap) {
      // Try to generate a simple roadmap using latest quiz result, if any
      const latestQuiz = await QuizResult.findOne({ userId: user._id })
        .sort({ createdAt: -1 })
        .lean();

      const steps = buildDefaultSteps(user, latestQuiz);
      
      // Create new roadmap document using plain object
      try {
        const created = await Roadmap.create({
          userId: user._id,
          generatedFrom: {
            quizResultId: latestQuiz?._id,
            rationale: 'Auto-generated initial roadmap',
          },
          steps,
        });
        roadmap = created.toObject();
      } catch (createErr) {
        console.error('Error creating roadmap:', createErr);
        // Return a basic roadmap even if save fails
        return NextResponse.json({
          userId: user._id,
          steps,
          generatedFrom: { rationale: 'Auto-generated initial roadmap' }
        });
      }
    }

    return NextResponse.json(roadmap);
  } catch (err) {
    console.error('GET /api/roadmap error', err);
    return NextResponse.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
  }
}

// POST /api/roadmap
// Accepts { steps?, quizResultId? } to regenerate/save roadmap
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({
      $or: [{ email: session.user.email }, { phone: session.user.phone }],
    }).select('_id classLevel interests goals').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const quiz = body?.quizResultId
      ? await QuizResult.findById(body.quizResultId).lean()
      : await QuizResult.findOne({ userId: user._id }).sort({ createdAt: -1 }).lean();

    const steps = Array.isArray(body?.steps) && body.steps.length > 0
      ? body.steps
      : buildDefaultSteps(user, quiz);

    try {
      const created = await Roadmap.create({
        userId: user._id,
        generatedFrom: { quizResultId: quiz?._id, rationale: 'User-triggered generation' },
        steps,
      });
      return NextResponse.json(created);
    } catch (createErr) {
      console.error('Error creating roadmap:', createErr);
      // Return a basic roadmap even if save fails
      return NextResponse.json({
        userId: user._id,
        steps,
        generatedFrom: { quizResultId: quiz?._id, rationale: 'User-triggered generation' }
      });
    }
  } catch (err) {
    console.error('POST /api/roadmap error', err);
    return NextResponse.json({ error: 'Failed to save roadmap' }, { status: 500 });
  }
}

function buildDefaultSteps(user, quiz) {
  const steps = [];
  steps.push({ key: 'onboarding', title: 'Complete Profile', description: 'Fill your profile details', category: 'onboarding', weight: 1 });
  steps.push({ key: 'assessment', title: 'Take Assessment', description: 'Complete interest and aptitude quiz', category: 'assessment', weight: 1 });

  if (quiz?.recommendedStreams?.length > 0) {
    const top = quiz.recommendedStreams.slice(0, 3).map(s => s.stream || 'Stream');
    steps.push({ key: 'review-results', title: 'Review Results', description: `Top fit: ${top.join(', ')}`, category: 'analysis', weight: 0.9 });
  }

  steps.push({ key: 'shortlist', title: 'Shortlist Colleges & Programs', description: 'Pick a few programs to apply', category: 'planning', weight: 0.8 });
  steps.push({ key: 'mentor', title: 'Connect with Mentor', description: 'Book a session with an advisor', category: 'mentor', weight: 0.6 });
  steps.push({ key: 'apply', title: 'Apply to Programs', description: 'Submit applications before deadlines', category: 'execution', weight: 0.7 });
  steps.push({ key: 'track', title: 'Track Progress', description: 'Update milestones as you proceed', category: 'progress', weight: 0.5 });
  return steps;
}


