import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import College from '@/models/College.js';

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const params = url.searchParams;

    const state = params.get('state') || undefined;
    const district = params.get('district') || undefined;
    const q = params.get('q') || undefined;
    const facilities = params.get('facilities') ? params.get('facilities').split(',').filter(Boolean) : [];
    const near = params.get('near'); // lat,lng
    const radiusKm = parseFloat(params.get('radiusKm') || '50');

    const page = Math.max(parseInt(params.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(params.get('limit') || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (state) filter['address.state'] = state;
    if (district) filter['address.district'] = district;

    if (q) {
      filter['$or'] = [
        { name: { $regex: q, $options: 'i' } },
        { 'address.district': { $regex: q, $options: 'i' } },
        { 'address.state': { $regex: q, $options: 'i' } },
      ];
    }

    if (facilities.length > 0) {
      facilities.forEach((key) => {
        if (['hostel', 'lab', 'library', 'internet'].includes(key)) {
          filter[`facilities.${key}`] = true;
        }
      });
    }

    if (near) {
      const [latStr, lngStr] = near.split(',');
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        filter.location = {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: Math.round(radiusKm * 1000),
          },
        };
      }
    }

    const [items, total] = await Promise.all([
      College.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      College.countDocuments(filter),
    ]);

    return NextResponse.json({ items, page, limit, total });
  } catch (err) {
    console.error('GET /api/colleges error', err);
    return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 });
  }
}
