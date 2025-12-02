import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import QuizQuestion from '@/models/QuizQuestion';
import Course from '@/models/Course';
import Career from '@/models/Career';
import Stream from '@/models/Stream';
import Interest from '@/models/Interest';

// GET /api/quizzes/questions - Get quiz questions by category
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    console.log('Quiz Questions API - Category:', category);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }
    
    await connectMongo();
    
    // Validate category
    if (!['interest', 'aptitude', 'personality', 'comprehensive'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }
    
    let query = { isActive: true };
    
    // If category is not comprehensive, filter by category
    if (category !== 'comprehensive') {
      query.category = category;
    }
    
    console.log('Quiz query:', JSON.stringify(query));
    
    // Get questions
    const questions = await QuizQuestion.find(query)
      .sort({ order: 1 })
      .lean();
    
    console.log(`Found ${questions.length} questions for category: ${category}`);

    // Always return DB results only (no mock fallback)
    const normalized = questions.map((q) => ({
      id: q._id?.toString?.() || q._id,
      category: q.category,
      section: q.section || '',
      order: q.order ?? 0,
      text: (q.text && (q.text.get ? q.text.get('en') : q.text.en)) || '',
      options: Array.isArray(q.options)
        ? q.options.map((opt) => ({
            key: opt.key,
            text:
              (opt.text && (opt.text.get ? opt.text.get('en') : opt.text.en)) || '',
            weight: opt.weight ?? 1,
            tags: opt.tags || [],
          }))
        : [],
      relatedCourses: q.relatedCourses || [],
      relatedCareers: q.relatedCareers || [],
      relatedStreams: q.relatedStreams || [],
      interestTags: q.interestTags || [],
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    );
  }
}

// Removed mock questions; API now only serves database-backed content