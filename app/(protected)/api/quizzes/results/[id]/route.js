import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import QuizResult from '@/models/QuizResult';
import Course from '@/models/Course';
import Stream from '@/models/Stream';

// GET /api/quizzes/results/[id] - Get a specific quiz result
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Result ID is required' },
        { status: 400 }
      );
    }
    
    await connectMongo();
    
    // Find the quiz result by resultId
    const result = await QuizResult.findOne({ resultId: id }).lean();
    
    if (!result) {
      return NextResponse.json(
        { error: 'Quiz result not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz result' },
      { status: 500 }
    );
  }
}