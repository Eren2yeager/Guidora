import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import DegreeProgram from '@/models/DegreeProgram.js';
import College from '@/models/College.js';
import Course from '@/models/Course.js';
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

      // cache codes->ids
      const collegeCodeToId = new Map();
      const courseCodeToId = new Map();

      const ops = [];
      for (const r of records) {
        const collegeCode = r.collegeCode;
        const courseCode = r.courseCode;

        if (!collegeCodeToId.has(collegeCode)) {
          const college = await College.findOne({ code: collegeCode }, { _id: 1 });
          if (!college) throw new Error(`College not found for code: ${collegeCode}`);
          collegeCodeToId.set(collegeCode, college._id);
        }
        if (!courseCodeToId.has(courseCode)) {
          const course = await Course.findOne({ code: courseCode }, { _id: 1 });
          if (!course) throw new Error(`Course not found for code: ${courseCode}`);
          courseCodeToId.set(courseCode, course._id);
        }

        const doc = {
          collegeId: collegeCodeToId.get(collegeCode),
          courseId: courseCodeToId.get(courseCode),
          durationYears: parseInt(r.durationYears || '3', 10),
          medium: (r.medium || '').split('|').filter(Boolean),
          intakeMonths: (r.intakeMonths || '').split('|').map((m) => parseInt(m, 10)).filter((n) => !Number.isNaN(n)),
          seats: parseInt(r.seats || '0', 10),
          cutoff: { lastYear: parseFloat(r.cutoffLastYear || '0') || 0 },
          fees: {
            tuitionPerYear: parseFloat(r.tuitionPerYear || '0') || 0,
            hostelPerYear: parseFloat(r.hostelPerYear || '0') || 0,
            misc: parseFloat(r.misc || '0') || 0,
            currency: r.currency || 'INR',
          },
          source: r.source || 'csv-import',
          sourceUrl: r.sourceUrl || '',
          lastUpdated: new Date(),
        };

        ops.push({ insertOne: { document: doc } });
      }

      if (dryRun) {
        return NextResponse.json({ dryRun: true, count: ops.length });
      }

      const res = await DegreeProgram.bulkWrite(ops, { ordered: false });
      return NextResponse.json({ ok: true, result: res });
    }

    return NextResponse.json({ error: 'Unsupported content-type' }, { status: 400 });
  } catch (err) {
    console.error('POST /api/admin/import/programs error', err);
    return NextResponse.json({ error: 'Failed to import programs' }, { status: 500 });
  }
}
