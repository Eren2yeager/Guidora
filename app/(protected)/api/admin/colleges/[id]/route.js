import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import College from '@/models/College.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';
// GET /api/admin/colleges/[id]
export async function GET(req, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    const { id } = params;

    // Find college by ID
    const college = await College.findById(id);
    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    return NextResponse.json(college);
  } catch (error) {
    console.error('Error fetching college:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// PUT /api/admin/colleges/[id]
export async function PUT(req, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    const { id } = await  params;
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.code || !data.address?.district || !data.address?.state) {
      return NextResponse.json({ 
        error: 'Missing required fields (name, code, district, state)' 
      }, { status: 400 });
    }

    // Check if college exists
    const college = await College.findById(id);
    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // Check for duplicate code (excluding current college)
    const existingCollege = await College.findOne({ 
      code: data.code,
      _id: { $ne: id }
    });
    if (existingCollege) {
      return NextResponse.json({ 
        error: 'Another college with this code already exists' 
      }, { status: 409 });
    }

    // Update college
    const updatedCollege = await College.findByIdAndUpdate(
      id,
      { 
        ...data,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedCollege);
  } catch (error) {
    console.error('Error updating college:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/colleges/[id]
export async function DELETE(req, { params }) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Connect to database
    await connectDB();

    const { id } =await params;

    // Check if college exists
    const college = await College.findById(id);
    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // Delete college
    await College.findByIdAndDelete(id);

    return NextResponse.json({ message: 'College deleted successfully' });
  } catch (error) {
    console.error('Error deleting college:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}