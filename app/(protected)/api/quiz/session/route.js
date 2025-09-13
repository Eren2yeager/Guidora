import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Stream from '@/models/Stream.js';
import Course from '@/models/Course.js';

// Simple scoring: expects payload { answers: [{ key: string, value: number }], profile?: { classLevel?: string } }
// Maps keys to streams; in real use this should be data-driven.
const KEY_TO_STREAM = {
  science_interest: 'Science',
  maths_confidence: 'Science',
  commerce_interest: 'Commerce',
  business_aptitude: 'Commerce',
  arts_creativity: 'Arts',
  social_sciences: 'Arts',
};

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const answers = Array.isArray(body?.answers) ? body.answers : [];

    const scores = new Map();
    for (const ans of answers) {
      const streamName = KEY_TO_STREAM[ans?.key];
      if (!streamName) continue;
      const current = scores.get(streamName) || 0;
      const val = typeof ans?.value === 'number' ? ans.value : 0;
      scores.set(streamName, current + val);
    }

    // Normalize scores 0..1
    const max = Math.max(1, ...Array.from(scores.values()));
    const ranked = Array.from(scores.entries())
      .map(([name, s]) => ({ name, score: Number((s / max).toFixed(2)) }))
      .sort((a, b) => b.score - a.score);

    // Fetch top streams and sample courses per stream
    const topNames = ranked.slice(0, 3).map(r => r.name);
    const streams = await Stream.find({ name: { $in: topNames }, isActive: true }).lean();
    const streamIdByName = new Map(streams.map(s => [s.name, s._id.toString()]));

    const courses = await Course.find({ streamId: { $in: streams.map(s => s._id) }, isActive: true })
      .select('name code streamId')
      .limit(30)
      .lean();

    const coursesByStream = courses.reduce((acc, c) => {
      const key = c.streamId.toString();
      if (!acc[key]) acc[key] = [];
      if (acc[key].length < 5) acc[key].push({ code: c.code, name: c.name });
      return acc;
    }, {});

    const recommendations = ranked.slice(0, 3).map(r => {
      const streamId = streamIdByName.get(r.name);
      return {
        stream: r.name,
        score: r.score,
        rationale: `Based on your responses indicating fit for ${r.name}.`,
        sampleCourses: streamId ? (coursesByStream[streamId] || []) : [],
      };
    });

    return NextResponse.json({ recommendations, debug: { ranked } });
  } catch (err) {
    console.error('POST /api/quiz/session error', err);
    return NextResponse.json({ error: 'Failed to score quiz' }, { status: 500 });
  }
}

export async function GET() {
  // Provide a minimal quiz definition to drive the client
  return NextResponse.json({
    items: [
      { key: 'science_interest', text: 'I enjoy experiments and science topics.' },
      { key: 'maths_confidence', text: 'I feel confident solving math problems.' },
      { key: 'commerce_interest', text: 'I like markets, finance, and business news.' },
      { key: 'business_aptitude', text: 'I enjoy organizing, selling, or entrepreneurship ideas.' },
      { key: 'arts_creativity', text: 'I enjoy creative expression (writing, design, performing).' },
      { key: 'social_sciences', text: 'I am curious about society, history, and culture.' },
    ],
    scale: { min: 0, max: 4, labels: ['No', 'Low', 'Some', 'High', 'Very High'] },
  });
}


