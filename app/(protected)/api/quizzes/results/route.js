import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.js';
import connectMongo from '@/lib/mongodb';
import QuizResult from '@/models/QuizResult';
import QuizQuestion from '@/models/QuizQuestion';
import Course from '@/models/Course';
import Stream from '@/models/Stream';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

// POST /api/quizzes/results - Save quiz results
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const data = await request.json();
    
    console.log('Saving quiz results - Type:', data.quizType, 'User:', session?.user?.id);
    
    // Validate required fields
    if (!data.quizType || !data.answers || !data.results) {
      console.error('Missing required fields:', { quizType: !!data.quizType, answers: !!data.answers, results: !!data.results });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await connectMongo();
    
    // Create a unique ID for the result
    const resultId = uuidv4();
    
    // Normalize answers to match AnswerSchema
    // Accepts either object map { [questionId]: value } or array of {questionId, response}
    const normalizedAnswers = Array.isArray(data.answers)
      ? data.answers.map((a) => ({
          questionId: a.questionId,
          response: a.response ?? (a.optionKeys || a.value ? { optionKeys: a.optionKeys, value: a.value } : undefined),
          isCorrect: typeof a.isCorrect === 'boolean' ? a.isCorrect : undefined,
        }))
      : Object.entries(data.answers || {}).map(([questionId, val]) => ({
          questionId,
          response: typeof val === 'number' ? { value: val } : Array.isArray(val) ? { optionKeys: val } : val,
        }));

    // Create new quiz result
    const quizResult = new QuizResult({
      _id: new mongoose.Types.ObjectId(),
      resultId,
      userId: session?.user?.id || null, // Associate with user if logged in
      quizType: data.quizType,
      answers: normalizedAnswers,
      results: data.results,
      createdAt: new Date(),
    });
    
    await quizResult.save();
    
    console.log('Quiz result saved successfully:', resultId);
    
    return NextResponse.json({ resultId });
  } catch (error) {
    console.error('Error saving quiz results:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz results' },
      { status: 500 }
    );
  }
}

// GET /api/quizzes/results - Get all quiz results for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    await connectMongo();
    
    // Find all quiz results for the current user
    const results = await QuizResult.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select('-answers') // Exclude detailed answers for performance
      .lean();
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz results' },
      { status: 500 }
    );
  }
}