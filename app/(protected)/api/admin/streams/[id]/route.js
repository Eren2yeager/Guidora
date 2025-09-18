import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Stream from '@/models/Stream';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminSession } from '@/lib/rbac';
import { ObjectId } from 'mongodb';

// Helper function to convert string IDs to ObjectId
const toObjectId = (id) => {
  try {
    return new ObjectId(id);
  } catch (error) {
    return id; // Return original if conversion fails
  }
};

// Helper function to process stream data
const processStreamData = (data) => {
  return {
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    typicalSubjects: data.typicalSubjects || [],
    // Convert career IDs to ObjectId if they are strings
    careers: Array.isArray(data.careers) 
      ? data.careers.map(id => typeof id === 'string' ? toObjectId(id) : id)
      : [],
    isActive: data.isActive !== undefined ? data.isActive : true,
    lastUpdated: new Date()
  };
};

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    
    await connectDB();
    
    // Convert string ID to ObjectId if needed
    const objectId = toObjectId(id);
    
    // Find stream by ID and populate careers
    const stream = await Stream.findById(objectId).populate('careers').lean();
    
    if (!stream) {
      return NextResponse.json({ 
        success: false, 
        message: 'Stream not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: stream
    });
  } catch (error) {
    console.error('Error in GET /api/admin/streams/[id]:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch stream' 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'Name and slug are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Convert string ID to ObjectId if needed
    const objectId = toObjectId(id);

    // Check if stream exists
    const stream = await Stream.findById(objectId);
    if (!stream) {
      return NextResponse.json(
        { success: false, message: 'Stream not found' },
        { status: 404 }
      );
    }

    // Check for duplicate slug (excluding current stream)
    const existingStream = await Stream.findOne({
      slug,
      _id: { $ne: objectId },
    });
    if (existingStream) {
      return NextResponse.json(
        { success: false, message: 'Stream with this slug already exists' },
        { status: 400 }
      );
    }

    // Process stream data with helper function
    const streamData = processStreamData(body);
    
    const updatedStream = await Stream.findByIdAndUpdate(
      objectId,
      streamData,
      { new: true }
    ).populate('careers').lean();

    return NextResponse.json({
      success: true,
      message: 'Stream updated successfully',
      data: updatedStream
    });
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
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    
    await connectDB();
    
    // Convert string ID to ObjectId if needed
    const objectId = toObjectId(id);

    // Check if stream exists
    const stream = await Stream.findById(objectId);
    if (!stream) {
      return NextResponse.json(
        { success: false, message: 'Stream not found' },
        { status: 404 }
      );
    }

    await Stream.findByIdAndDelete(objectId);

    return NextResponse.json({ 
      success: true,
      message: 'Stream deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/streams:', error);
    return NextResponse.json(
      { error: 'Failed to delete stream' },
      { status: 500 }
    );
  }
}