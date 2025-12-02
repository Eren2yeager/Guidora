import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Counselor from "@/models/CounselorSchema";

/**
 * GET handler for counselors
 * Fetches all active counselors or filters by expertise/interests
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

    // Parse query parameters
    const url = new URL(req.url);
    const interestTag = url.searchParams.get("interestTag");
    const expertise = url.searchParams.get("expertise");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    
    if (interestTag) {
      query.interestTags = interestTag;
    }
    
    if (expertise) {
      query.expertise = { $regex: expertise, $options: "i" };
    }

    // Fetch counselors with pagination
    const counselors = await Counselor.find(query)
      .populate("interestTags", "name")
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Counselor.countDocuments(query);

    return Response.json({
      success: true,
      data: counselors,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error("Counselors API Error:", err);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}