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

export async function GET(req, { params }) {
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

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const populate = searchParams.get('populate') || '';

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid interest ID' 
      }, { status: 400 });
    }

    // Create base query
    let interestQuery = Interest.findById(toObjectId(id));
    
    // Handle population of related fields if requested
    if (populate) {
      const fieldsToPopulate = populate.split(',');
      
      fieldsToPopulate.forEach(field => {
        if (['streams', 'careers', 'courses', 'degreePrograms', 'colleges', 'universities', 'exams'].includes(field)) {
          interestQuery = interestQuery.populate(field, 'name');
        }
      });
    }
    
    // Execute query
    const interest = await interestQuery;

    if (!interest) {
      return NextResponse.json({ 
        success: false, 
        message: 'Interest not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Interest retrieved successfully',
      data: interest
    });

  } catch (error) {
    console.error('Error fetching interest:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
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

    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid interest ID' 
      }, { status: 400 });
    }

    // Get interest data from request
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.category) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields (name, category)' 
      }, { status: 400 });
    }

    // Check if interest exists
    const existingInterest = await Interest.findById(toObjectId(id));
    if (!existingInterest) {
      return NextResponse.json({ 
        success: false, 
        message: 'Interest not found' 
      }, { status: 404 });
    }

    // Check if name is being changed and if it conflicts with another interest
    if (data.name !== existingInterest.name) {
      const nameConflict = await Interest.findOne({ 
        name: data.name,
        _id: { $ne: toObjectId(id) }
      });
      if (nameConflict) {
        return NextResponse.json({ 
          success: false, 
          message: 'Interest with this name already exists' 
        }, { status: 409 });
      }
    }

    // Process interest data to convert all relevant fields to ObjectId
    const processedData = processInterestData(data);
    
    // Add lastUpdated timestamp
    processedData.lastUpdated = new Date();

    // Update interest
    const updatedInterest = await Interest.findByIdAndUpdate(
      toObjectId(id),
      { $set: processedData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Interest updated successfully',
      data: updatedInterest
    });

  } catch (error) {
    console.error('Error updating interest:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
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

    const { id } = params;
    const data = await req.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid interest ID' 
      }, { status: 400 });
    }

    // Check if interest exists
    const existingInterest = await Interest.findById(toObjectId(id));
    if (!existingInterest) {
      return NextResponse.json({ 
        success: false, 
        message: 'Interest not found' 
      }, { status: 404 });
    }

    // Check if name is being changed and if it conflicts with another interest
    if (data.name && data.name !== existingInterest.name) {
      const nameConflict = await Interest.findOne({ 
        name: data.name,
        _id: { $ne: toObjectId(id) }
      });
      if (nameConflict) {
        return NextResponse.json({ 
          success: false, 
          message: 'Interest with this name already exists' 
        }, { status: 409 });
      }
    }

    // Process interest data to convert all relevant fields to ObjectId
    const processedData = processInterestData(data);
    
    // Add lastUpdated timestamp
    processedData.lastUpdated = new Date();

    // Update interest
    const updatedInterest = await Interest.findByIdAndUpdate(
      toObjectId(id), 
      { $set: processedData }, 
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Interest updated successfully',
      data: updatedInterest
    });

  } catch (error) {
    console.error('Error updating interest:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
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

    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid interest ID' 
      }, { status: 400 });
    }

    // Delete interest
    const deletedInterest = await Interest.findByIdAndDelete(toObjectId(id));
    
    if (!deletedInterest) {
      return NextResponse.json({ 
        success: false, 
        message: 'Interest not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Interest deleted successfully',
      data: null
    });

  } catch (error) {
    console.error('Error deleting interest:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}