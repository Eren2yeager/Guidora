import { NextResponse } from 'next/server';
import  connectDB from '@/lib/mongodb';
import Stream from '@/models/Stream';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/streams - List all streams with optional search
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const filter = query
      ? {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { slug: { $regex: query, $options: 'i' } },
          ],
        }
      : {};

    await connectDB();
    
    const [streams, total] = await Promise.all([
      Stream.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Stream.countDocuments(filter),
    ]);

    return NextResponse.json({
      streams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/admin/streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streams' },
      { status: 500 }
    );
  }
}

// POST /api/admin/streams - Create new stream
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, typicalSubjects, careers } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for duplicate slug
    const existingStream = await Stream.findOne({ slug });
    if (existingStream) {
      return NextResponse.json(
        { error: 'Stream with this slug already exists' },
        { status: 400 }
      );
    }

    const stream = new Stream({
      name,
      slug,
      description,
      typicalSubjects,
      careers,
      isActive: true,
      lastUpdated: new Date(),
    });

    await stream.save();

    return NextResponse.json(stream, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/streams:', error);
    return NextResponse.json(
      { error: 'Failed to create stream' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/streams/[id] - Update stream
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, slug, description, typicalSubjects, careers, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if stream exists
    const stream = await Stream.findById(id);
    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Check for duplicate slug (excluding current stream)
    const existingStream = await Stream.findOne({
      slug,
      _id: { $ne: id },
    });
    if (existingStream) {
      return NextResponse.json(
        { error: 'Stream with this slug already exists' },
        { status: 400 }
      );
    }

    const updatedStream = await Stream.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description,
        typicalSubjects,
        careers,
        isActive,
        lastUpdated: new Date(),
      },
      { new: true }
    );

    return NextResponse.json(updatedStream);
  } catch (error) {
    console.error('Error in PUT /api/admin/streams:', error);
    return NextResponse.json(
      { error: 'Failed to update stream' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/streams/[id] - Delete stream
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await connectDB();

    // Check if stream exists
    const stream = await Stream.findById(id);
    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    await Stream.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Stream deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/streams:', error);
    return NextResponse.json(
      { error: 'Failed to delete stream' },
      { status: 500 }
    );
  }
}