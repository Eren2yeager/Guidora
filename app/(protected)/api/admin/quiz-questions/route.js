import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/rbac.js';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import QuizQuestion from '@/models/QuizQuestion';

/**
 * Helper function to convert string IDs to MongoDB ObjectIds
 * @param {string|any} id - The ID to convert
 * @returns {ObjectId|null} - Converted ObjectId or null if invalid
 */
const toObjectId = (id) => {
  if (!id) return null;
  if (typeof id === 'string') {
    try {
      return new mongoose.Types.ObjectId(id);
    } catch (error) {
      console.log(`Invalid ObjectId format: ${error.message}`);
      return null;
    }
  }
  return id;
};

/**
 * Helper function to convert arrays of IDs to ObjectIds
 * @param {Array} ids - Array of IDs to convert
 * @returns {Array} - Array with converted ObjectIds
 */
const convertIdsToObjectIds = (ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.map(id => typeof id === 'string' ? toObjectId(id) : id).filter(id => id !== null);
};

/**
 * Process question data to convert all string IDs to ObjectIds
 * @param {Object} question - Question data to process
 * @returns {Object} - Processed question data with converted ObjectIds
 */
const processQuestionData = (question) => {
  // Create a copy to avoid mutating the original
  const processedQuestion = { ...question };
  
  // Convert _id if it's a string
  if (processedQuestion._id && typeof processedQuestion._id === 'string') {
    processedQuestion._id = toObjectId(processedQuestion._id);
  }
  
  // Convert array reference fields
  const arrayRefs = ['relatedCourses', 'relatedCareers', 'relatedStreams', 'interestTags'];
  arrayRefs.forEach(field => {
    if (processedQuestion[field]) {
      processedQuestion[field] = convertIdsToObjectIds(processedQuestion[field]);
    }
  });
  
  return processedQuestion;
};

export async function GET(request) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query['text.en'] = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    // Execute query with pagination
    const [questions, total] = await Promise.all([
      QuizQuestion.find(query)
        .populate('relatedCourses', 'name')
        .populate('relatedCareers', 'name')
        .populate('relatedStreams', 'name')
        .populate('interestTags', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      QuizQuestion.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Quiz questions retrieved successfully',
      data: {
        questions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch quiz questions',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!isAdminSession(session)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Admin access required'
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.text || !body.category) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: text and category are required'
      }, { status: 400 });
    }

    // Process question data to convert IDs to ObjectIds
    const processedData = processQuestionData(body);

    // Create new question
    const question = new QuizQuestion(processedData);
    await question.save();

    return NextResponse.json({
      success: true,
      message: 'Quiz question created successfully',
      data: { question }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz question:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create quiz question',
      error: error.message
    }, { status: 500 });
  }
}