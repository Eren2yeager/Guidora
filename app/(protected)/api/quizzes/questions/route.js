import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import QuizQuestion from '@/models/QuizQuestion';

// GET /api/quizzes/questions - Get quiz questions by category
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
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
    
    // Get questions
    const questions = await QuizQuestion.find(query)
      .sort({ order: 1 })
      .lean();
    
    // If no questions found, use mock data
    if (questions.length === 0) {
      return NextResponse.json(getMockQuestions(category));
    }
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    );
  }
}

// Helper function to get mock questions if database is empty
function getMockQuestions(category) {
  // Mock interest questions
  const interestQuestions = [
    {
      id: 'q1',
      text: 'I enjoy solving complex mathematical problems.',
      category: 'STEM',
    },
    {
      id: 'q2',
      text: 'I like to write stories or essays.',
      category: 'Arts',
    },
    {
      id: 'q3',
      text: 'I am interested in how the human body works.',
      category: 'Medical',
    },
    {
      id: 'q4',
      text: 'I enjoy building or fixing things.',
      category: 'Engineering',
    },
    {
      id: 'q5',
      text: 'I like to help others with their problems.',
      category: 'Social',
    },
  ];
  
  // Mock aptitude questions
  const aptitudeQuestions = [
    {
      id: 'q6',
      text: 'I can quickly identify patterns in complex data.',
      category: 'Analytical',
    },
    {
      id: 'q7',
      text: 'I am good at visualizing three-dimensional objects.',
      category: 'Spatial',
    },
    {
      id: 'q8',
      text: 'I can easily remember facts and details.',
      category: 'Memory',
    },
    {
      id: 'q9',
      text: 'I am skilled at explaining complex concepts to others.',
      category: 'Verbal',
    },
    {
      id: 'q10',
      text: 'I can quickly solve mathematical problems in my head.',
      category: 'Numerical',
    },
  ];
  
  // Mock personality questions
  const personalityQuestions = [
    {
      id: 'q11',
      text: 'I prefer working in teams rather than independently.',
      category: 'Social',
    },
    {
      id: 'q12',
      text: 'I like to plan things in advance rather than be spontaneous.',
      category: 'Planning',
    },
    {
      id: 'q13',
      text: 'I enjoy taking on leadership roles.',
      category: 'Leadership',
    },
    {
      id: 'q14',
      text: 'I prefer practical tasks over theoretical discussions.',
      category: 'Practical',
    },
    {
      id: 'q15',
      text: 'I am comfortable with change and new situations.',
      category: 'Adaptability',
    },
  ];
  
  // Return questions based on category
  switch (category) {
    case 'interest':
      return interestQuestions;
    case 'aptitude':
      return aptitudeQuestions;
    case 'personality':
      return personalityQuestions;
    case 'comprehensive':
      return [...interestQuestions, ...aptitudeQuestions, ...personalityQuestions];
    default:
      return [];
  }
}