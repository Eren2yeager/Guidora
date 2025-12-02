import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import TimelineEvent from '@/models/TimelineEvent';
import User from '@/models/User';
import Scholarship from '@/models/Scholarship';
import connectDB from '@/lib/mongodb';

// GET /api/timeline-events - Get timeline events for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user profile to filter relevant events
    const query = {};
    if (session.user.email) query.email = session.user.email;
    if (session.user.phone) query.phone = session.user.phone;

    const user = await User.findOne(query).select('location.state goals.scholarships');

    // Build filter for timeline events
    const eventFilter = {
      isActive: true,
      startDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Events from last 30 days onwards
    };

    // Filter by user's state if available
    if (user?.location?.state) {
      eventFilter.$or = [
        { 'related.state': user.location.state },
        { 'related.state': { $exists: false } },
        { 'related.state': '' }
      ];
    }

    // Fetch timeline events
    const timelineEvents = await TimelineEvent.find(eventFilter)
      .sort({ startDate: 1 })
      .limit(50)
      .lean();

    // Fetch saved scholarships deadlines
    let scholarshipEvents = [];
    if (user?.goals?.scholarships && user.goals.scholarships.length > 0) {
      const scholarships = await Scholarship.find({
        _id: { $in: user.goals.scholarships },
        isActive: true
      })
        .select('name description deadlines')
        .lean();

      scholarshipEvents = scholarships.flatMap(scholarship => 
        (scholarship.deadlines || []).map(deadline => ({
          _id: `scholarship-${scholarship._id}-${deadline.endDate}`,
          type: 'scholarship',
          title: `${scholarship.name} - Application Deadline`,
          description: scholarship.description || '',
          startDate: deadline.startDate || deadline.endDate,
          endDate: deadline.endDate,
          link: deadline.link || '',
          related: {},
          isActive: true
        }))
      );
    }

    // Combine and sort all events
    const allEvents = [...timelineEvents, ...scholarshipEvents];
    
    return NextResponse.json({ 
      events: allEvents,
      total: allEvents.length
    });
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
