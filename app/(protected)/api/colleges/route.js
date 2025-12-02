import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import College from '@/models/College.js';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const params = url.searchParams;

    const state = params.get('state') || undefined;
    const district = params.get('district') || undefined;
    const type = params.get('type') || undefined;
    const q = params.get('q') || undefined;
    const facilities = params.get('facilities') ? params.get('facilities').split(',').filter(Boolean) : [];
    const near = params.get('near'); // lat,lng
    const radiusKm = parseFloat(params.get('radiusKm') || '50');

    const page = Math.max(parseInt(params.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(params.get('limit') || '50', 10), 1), 100);
    const skip = (page - 1) * limit;

    console.log('Colleges API - Filters:', { state, district, type, q, facilities, near, radiusKm });

    const filter = { isActive: true };

    if (state) filter['address.state'] = state;
    if (district) filter['address.district'] = district;
    if (type) filter.type = type;

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

    let items = [];
    let total = 0;
    let useNear = false;

    if (near) {
      const [latStr, lngStr] = near.split(',');
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        console.log('Using location-based search:', { lat, lng, radiusKm });
        
        try {
          // Try using MongoDB's geospatial query first
          const geoFilter = { ...filter };
          geoFilter.location = {
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: Math.round(radiusKm * 1000),
            },
          };

          console.log('Attempting geospatial query...');
          
          // For $near queries, we can't use skip() reliably, so we fetch and slice
          const allNearbyItems = await College.find(geoFilter).limit(100).lean();
          
          // Calculate distance for each item
          const itemsWithDistance = allNearbyItems.map(item => {
            if (item.location && item.location.coordinates) {
              const [itemLng, itemLat] = item.location.coordinates;
              const distance = calculateDistance(lat, lng, itemLat, itemLng);
              return { ...item, distance };
            }
            return item;
          });

          // Apply pagination
          items = itemsWithDistance.slice(skip, skip + limit);
          total = itemsWithDistance.length;
          useNear = true;
          
          console.log(`Geospatial query successful: found ${total} colleges`);
        } catch (geoError) {
          console.error('Geospatial query failed, falling back to manual distance calculation:', geoError.message);
          
          // Fallback: Fetch all colleges and calculate distance manually
          const allColleges = await College.find(filter).lean();
          
          // Calculate distance for each college
          const collegesWithDistance = allColleges
            .map(college => {
              if (college.location && college.location.coordinates) {
                const [itemLng, itemLat] = college.location.coordinates;
                const distance = calculateDistance(lat, lng, itemLat, itemLng);
                return { ...college, distance };
              }
              return null;
            })
            .filter(c => c !== null && c.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);

          // Apply pagination
          items = collegesWithDistance.slice(skip, skip + limit);
          total = collegesWithDistance.length;
          useNear = true;
          
          console.log(`Manual distance calculation: found ${total} colleges within ${radiusKm}km`);
        }
      }
    }

    if (!useNear) {
      console.log('Using standard query with filter:', JSON.stringify(filter, null, 2));

      // Build the cursor with standard sort
      const cursor = College.find(filter).skip(skip).limit(limit).sort({ name: 1 }).lean();

      [items, total] = await Promise.all([
        cursor,
        College.countDocuments(filter),
      ]);
    }

    console.log(`Found ${items.length} colleges out of ${total} total`);

    return NextResponse.json({ items, page, limit, total });
  } catch (err) {
    console.error('GET /api/colleges error', err);
    return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 });
  }
}