import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import QuizQuestion from '@/models/QuizQuestion';

export async function GET(request, { params }) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    const { id } = params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid quiz question ID format' },
        { status: 400 }
      );
    }

    // Find quiz question by ID
    const quizQuestion = await QuizQuestion.findById(id)
      .populate('relatedCourses', 'name')
      .populate('relatedCareers', 'name')
      .populate('relatedStreams', 'name')
      .populate('interestTags', 'name');

    if (!quizQuestion) {
      return NextResponse.json(
        { error: 'Quiz question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quizQuestion);
  } catch (error) {
    console.error('Error fetching quiz question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz question' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    const { id } = params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid quiz question ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Convert string IDs to ObjectIds
    if (data.relatedCourses && data.relatedCourses.length > 0) {
      data.relatedCourses = data.relatedCourses.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }
    if (data.relatedCareers && data.relatedCareers.length > 0) {
      data.relatedCareers = data.relatedCareers.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }
    if (data.relatedStreams && data.relatedStreams.length > 0) {
      data.relatedStreams = data.relatedStreams.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }
    if (data.interestTags && data.interestTags.length > 0) {
      data.interestTags = data.interestTags.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    // Update quiz question
    const updatedQuizQuestion = await QuizQuestion.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedQuizQuestion) {
      return NextResponse.json(
        { error: 'Quiz question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Quiz question updated successfully',
      quizQuestion: updatedQuizQuestion,
    });
  } catch (error) {
    console.error('Error updating quiz question:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz question' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    const { id } = params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid quiz question ID format' },
        { status: 400 }
      );
    }

    // Delete quiz question
    const deletedQuizQuestion = await QuizQuestion.findByIdAndDelete(id);

    if (!deletedQuizQuestion) {
      return NextResponse.json(
        { error: 'Quiz question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Quiz question deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quiz question:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz question' },
      { status: 500 }
    );
  }
}