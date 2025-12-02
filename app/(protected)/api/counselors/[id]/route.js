import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Counselor from "@/models/CounselorSchema";
import mongoose from "mongoose";

/**
 * GET handler for a specific counselor
 * Fetches detailed information about a counselor by ID
 */
export async function GET(req, { params }) {
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

    // Validate ID format
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, error: "Invalid counselor ID" },
        { status: 400 }
      );
    }

    // Fetch counselor with populated interest tags
    const counselor = await Counselor.findById(id)
      .populate("interestTags", "name")
      .lean();

    if (!counselor) {
      return Response.json(
        { success: false, error: "Counselor not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
    let averageRating = 0;
    if (counselor.ratings && counselor.ratings.length > 0) {
      const sum = counselor.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = sum / counselor.ratings.length;
    }

    // Add average rating to response
    const counselorWithRating = {
      ...counselor,
      averageRating,
      totalRatings: counselor.ratings ? counselor.ratings.length : 0,
    };

    return Response.json({
      success: true,
      data: counselorWithRating,
    });
  } catch (err) {
    console.error("Counselor Detail API Error:", err);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}