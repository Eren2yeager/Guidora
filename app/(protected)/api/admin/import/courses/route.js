import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import Course from '@/models/Course.js';
import Stream from '@/models/Stream.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(',').map((h) => h.trim());
  return rows.map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i] || ''));
    return obj;
  });
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const contentType = req.headers.get('content-type') || '';
    const dryRun = (new URL(req.url)).searchParams.get('dryRun') === 'true';

    if (contentType.includes('text/csv')) {
      const text = await req.text();
      const records = parseCsv(text);

      // ensure streams exist
      const streamNameToId = new Map();

      const ops = [];
      for (const r of records) {
        const streamName = r.stream;
        if (!streamNameToId.has(streamName)) {
          const s = await Stream.findOneAndUpdate(
            { name: streamName },
            { $setOnInsert: { name: streamName, description: '' } },
            { upsert: true, new: true }
          );
          streamNameToId.set(streamName, s._id);
        }

        const doc = {
          code: r.code,
          name: r.name,
          streamId: streamNameToId.get(streamName),
          level: r.level || 'UG',
          description: r.description || '',
          eligibility: {
            minMarks: parseFloat(r.minMarks || '0') || 0,
            requiredSubjects: (r.requiredSubjects || '').split('|').filter(Boolean),
          },
          outcomes: {
            careers: (r.careers || '').split('|').filter(Boolean),
            govtExams: (r.govtExams || '').split('|').filter(Boolean),
            privateJobs: (r.privateJobs || '').split('|').filter(Boolean),
            higherStudies: (r.higherStudies || '').split('|').filter(Boolean),
            entrepreneurship: (r.entrepreneurship || '').split('|').filter(Boolean),
          },
          tags: (r.tags || '').split('|').filter(Boolean),
          media: { iconUrl: r.iconUrl || '', bannerUrl: r.bannerUrl || '' },
          source: r.source || 'csv-import',
          sourceUrl: r.sourceUrl || '',
          lastUpdated: new Date(),
        };

        ops.push({ updateOne: { filter: { code: doc.code }, update: { $set: doc }, upsert: true } });
      }

      if (dryRun) {
        return NextResponse.json({ dryRun: true, count: ops.length });
      }

      const res = await Course.bulkWrite(ops, { ordered: false });
      return NextResponse.json({ ok: true, result: res });
    }

    return NextResponse.json({ error: 'Unsupported content-type' }, { status: 400 });
  } catch (err) {
    console.error('POST /api/admin/import/courses error', err);
    return NextResponse.json({ error: 'Failed to import courses' }, { status: 500 });
  }
}
