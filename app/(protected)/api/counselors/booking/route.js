import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CounselingSession from "@/models/CounselingSession";
import CounselingBooking from "@/models/CounselingBooking";
import Counselor from "@/models/CounselorSchema";
import User from "@/models/User";
import mongoose from "mongoose";

/**
 * POST handler for booking a counseling session
 * Creates a new counseling session between student and counselor
 */
export async function POST(req) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await req.json();
    const { counselorId, date, time, topic, message } = body;

    // Validate required fields
    if (!counselorId || !date || !time || !topic) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate counselor ID
    if (!mongoose.Types.ObjectId.isValid(counselorId)) {
      return Response.json(
        { success: false, error: "Invalid counselor ID" },
        { status: 400 }
      );
    }

    // Check if counselor exists
    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return Response.json(
        { success: false, error: "Counselor not found" },
        { status: 404 }
      );
    }

    // Get user from session
    const user = await User.findOne({ "email": session.user.email });
    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Create scheduled date from date and time
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    const scheduledAt = new Date(year, month - 1, day, 
      parseInt(hours), parseInt(minutes.replace(/[^\d]/g, '')));
    
    // Create booking first
    const bookingId = new mongoose.Types.ObjectId();
    const newBooking = new CounselingBooking({
      _id: bookingId,
      userId: user._id,
      counselorId: counselorId,
      scheduledAt: scheduledAt,
      mode: "video",
      status: "pending",
      notes: message || ""
    });
    
    await newBooking.save();
    
    // Create new counseling session
    const newSession = new CounselingSession({
      _id: new mongoose.Types.ObjectId(),
      bookingId: bookingId,
      userId: user._id,
      counselorId: counselorId,
      scheduledAt: scheduledAt,
      status: "scheduled"
    });

    await newSession.save();

    return Response.json({
      success: true,
      data: newSession,
      message: "Counseling session booked successfully",
    });
  } catch (err) {
    console.error("Booking API Error:", err);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET handler for fetching user's counseling sessions
 * Returns all sessions for the current user
 */
export async function GET(req) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user from session
    const user = await User.findOne({ "auth.email": session.user.email });
    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build query
    let query = { student: user._id };
    if (status) {
      query.status = status;
    }

    // Fetch sessions with populated counselor data
    const sessions = await CounselingSession.find(query)
      .populate("counselor", "name profilePicture expertise")
      .sort({ scheduledDate: -1, scheduledTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await CounselingSession.countDocuments(query);

    return Response.json({
      success: true,
      data: sessions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error("Sessions API Error:", err);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}