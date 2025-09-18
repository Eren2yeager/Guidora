import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/rbac.js';
import connectToDatabase  from '@/lib/mongodb';
import mongoose from 'mongoose';
import QuizQuestion from '@/models/QuizQuestion';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
/**
 * Converts a string ID to MongoDB ObjectId
 * @param {string|Object} id - The ID to convert
 * @returns {Object} MongoDB ObjectId
 */
const toObjectId = (id) => {
  if (!id) return null;
  if (typeof id === 'string') {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

/**
 * Converts an array of string IDs to MongoDB ObjectIds
 * @param {Array} ids - Array of IDs to convert
 * @returns {Array} Array of MongoDB ObjectIds
 */
const convertIdsToObjectIds = (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) return [];
  return ids.map(id => toObjectId(id)).filter(id => id !== null);
};

export async function POST(request) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    const isAdmin = await isAdminSession(session);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Parse request body
    const { questions } = await request.json();

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid request: questions array is required' },
        { status: 400 }
      );
    }

    // Process each question
    const processedQuestions = questions.map(question => {
      // Create a new object to avoid mutating the original
      const processedQuestion = { ...question };
      
      // Ensure _id is an ObjectId
      if (!processedQuestion._id) {
        processedQuestion._id = new mongoose.Types.ObjectId();
      } else {
        processedQuestion._id = toObjectId(processedQuestion._id);
      }

      // Convert string IDs to ObjectIds
      processedQuestion.relatedCourses = convertIdsToObjectIds(processedQuestion.relatedCourses);
      processedQuestion.relatedCareers = convertIdsToObjectIds(processedQuestion.relatedCareers);
      // Convert remaining reference fields
      processedQuestion.relatedStreams = convertIdsToObjectIds(processedQuestion.relatedStreams);
      processedQuestion.interestTags = convertIdsToObjectIds(processedQuestion.interestTags);

      return processedQuestion;
    });

    // Insert questions using bulk operation with upsert option
    const bulkOps = processedQuestions.map(question => ({
      updateOne: {
        filter: { _id: question._id },
        update: { $set: question },
        upsert: true
      }
    }));

    const result = await QuizQuestion.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      message: `Successfully imported quiz questions`,
      data: {
        inserted: result.insertedCount || 0,
        modified: result.modifiedCount || 0,
        upserted: result.upsertedCount || 0,
        total: processedQuestions.length
      }
    });
  } catch (error) {
    console.error('Error importing quiz questions:', error);
    
    // Check for duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Duplicate entries found. Some questions may already exist.',
          error: error.message
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to import quiz questions', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}