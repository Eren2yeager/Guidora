import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import College from '@/models/College.js';
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

      const ops = [];
      for (const r of records) {
        const lng = parseFloat(r.lng);
        const lat = parseFloat(r.lat);
        const doc = {
          name: r.name,
          code: r.code,
          type: r.type || 'Government',
          affiliation: r.affiliation || '',
          address: {
            line1: r.address || '',
            district: r.district,
            state: r.state,
            pincode: r.pincode || '',
          },
          location: { type: 'Point', coordinates: [lng, lat] },
          facilities: {
            hostel: r.hostel === 'true',
            lab: r.lab === 'true',
            library: r.library === 'true',
            internet: r.internet === 'true',
            medium: (r.medium || '').split('|').filter(Boolean),
          },
          contacts: {
            phone: r.phone || '',
            email: r.email || '',
            website: r.website || '',
          },
          source: r.source || 'csv-import',
          sourceUrl: r.sourceUrl || '',
          lastUpdated: new Date(),
        };
        ops.push({ updateOne: { filter: { code: doc.code }, update: { $set: doc }, upsert: true } });
      }

      if (dryRun) {
        return NextResponse.json({ dryRun: true, count: ops.length });
      }

      const res = await College.bulkWrite(ops, { ordered: false });
      return NextResponse.json({ ok: true, result: res });
    }

    return NextResponse.json({ error: 'Unsupported content-type' }, { status: 400 });
  } catch (err) {
    console.error('POST /api/admin/import/colleges error', err);
    return NextResponse.json({ error: 'Failed to import colleges' }, { status: 500 });
  }
}
