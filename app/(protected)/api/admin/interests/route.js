import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import mongoose from 'mongoose';
import Interest from '@/models/Interest.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { isAdminSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * Helper function to convert string IDs to ObjectId
 * @param {string} id - The ID to convert
 * @returns {ObjectId} - MongoDB ObjectId
 */
const toObjectId = (id) => {
  try {
    return typeof id === 'string' ? new ObjectId(id) : id;
  } catch (error) {
    return id;
  }
};

/**
 * Process interest data to convert all relevant fields to ObjectId
 * @param {Object} data - The interest data to process
 * @returns {Object} - Processed interest data with ObjectId conversions
 */
const processInterestData = (data) => {
  const processedData = { ...data };
  
  // Convert _id to ObjectId if present
  if (processedData._id) {
    processedData._id = toObjectId(processedData._id);
  }
  
  // Convert streams array to ObjectIds
  if (processedData.streams && Array.isArray(processedData.streams)) {
    processedData.streams = processedData.streams.map(stream => toObjectId(stream));
  }
  
  // Convert careers array to ObjectIds
  if (processedData.careers && Array.isArray(processedData.careers)) {
    processedData.careers = processedData.careers.map(career => toObjectId(career));
  }
  
  // Convert courses array to ObjectIds
  if (processedData.courses && Array.isArray(processedData.courses)) {
    processedData.courses = processedData.courses.map(course => toObjectId(course));
  }
  
  // Convert degreePrograms array to ObjectIds
  if (processedData.degreePrograms && Array.isArray(processedData.degreePrograms)) {
    processedData.degreePrograms = processedData.degreePrograms.map(program => toObjectId(program));
  }
  
  // Convert colleges array to ObjectIds
  if (processedData.colleges && Array.isArray(processedData.colleges)) {
    processedData.colleges = processedData.colleges.map(college => toObjectId(college));
  }
  
  // Convert universities array to ObjectIds
  if (processedData.universities && Array.isArray(processedData.universities)) {
    processedData.universities = processedData.universities.map(university => toObjectId(university));
  }
  
  // Convert exams array to ObjectIds
  if (processedData.exams && Array.isArray(processedData.exams)) {
    processedData.exams = processedData.exams.map(exam => toObjectId(exam));
  }
  
  return processedData;
};

export async function GET(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const populate = searchParams.get('populate') || '';
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Create base query
    let interestsQuery = Interest.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(limit);
    
    // Handle population of related fields if requested
    if (populate) {
      const fieldsToPopulate = populate.split(',');
      
      fieldsToPopulate.forEach(field => {
        if (['streams', 'careers', 'courses', 'degreePrograms', 'colleges', 'universities', 'exams'].includes(field)) {
          interestsQuery = interestsQuery.populate(field, 'name');
        }
      });
    }
    
    // Execute query
    const interests = await interestsQuery;

    // Get total count for pagination
    const total = await Interest.countDocuments(query);

    return NextResponse.json({
      success: true,
      message: 'Interests retrieved successfully',
      data: {
        interests,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching interests:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Secure admin authentication check
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized access' 
      }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get interest data from request
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.category) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields (name, category)' 
      }, { status: 400 });
    }

    // Process interest data to convert all relevant fields to ObjectId
    const processedData = processInterestData(data);
    
    // Add lastUpdated timestamp
    processedData.lastUpdated = new Date();

    // Check if interest already exists
    const existingInterest = await Interest.findOne({ name: processedData.name });
    if (existingInterest) {
      return NextResponse.json({ 
        success: false, 
        message: 'Interest with this name already exists' 
      }, { status: 409 });
    }

    // Create new interest
    const newInterest = new Interest(processedData);
    await newInterest.save();

    return NextResponse.json({
      success: true,
      message: 'Interest created successfully',
      data: newInterest
    });

  } catch (error) {
    console.error('Error creating interest:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}