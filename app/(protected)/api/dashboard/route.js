import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";
import College from "@/models/College";
import Scholarship from "@/models/Scholarship";

/**
 * GET handler for dashboard data
 * Fetches user-specific dashboard data including profile completion, saved items, and activity
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

    // Get user data with populated references
    const user = await User.findOne({ "auth.email": session.user.email })
      .select("-auth.password")
      .lean();

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate profile completion percentage
    const profileCompletion = calculateProfileCompletion(user);

    // Get user's saved colleges
    const savedColleges = await College.find(
      { _id: { $in: user.savedColleges || [] } },
      "name location media"
    ).limit(5);

    // Get user's enrolled courses
    const enrolledCourses = await Course.find(
      { _id: { $in: user.enrolledCourses || [] } },
      "title description progress"
    ).limit(5);

    // Get user's saved scholarships
    const savedScholarships = await Scholarship.find(
      { _id: { $in: user.savedScholarships || [] } },
      "title organization amount deadline"
    ).limit(5);

    // Get recent activity (mock data for now)
    const recentActivity = generateRecentActivity(user);

    // Compile dashboard data
    const dashboardData = {
      success: true,
      profileCompletion,
      stats: {
        savedColleges: user.savedColleges?.length || 0,
        enrolledCourses: user.enrolledCourses?.length || 0,
        savedScholarships: user.savedScholarships?.length || 0,
        completedQuizzes: user.completedQuizzes?.length || 0,
      },
      savedColleges,
      enrolledCourses,
      savedScholarships,
      recentActivity,
    };

    return Response.json(dashboardData);
  } catch (err) {
    console.error("Dashboard API Error:", err);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Calculate profile completion percentage based on filled fields
 */
function calculateProfileCompletion(user) {
  // Define important fields to check
  const fields = [
    user.name,
    user.auth?.email,
    user.auth?.phone,
    user.media?.iconUrl,
    user.studentProfile?.gender,
    user.studentProfile?.dob,
    user.studentProfile?.classLevel,
    user.studentProfile?.location?.city,
    user.studentProfile?.location?.state,
    user.studentProfile?.location?.country,
    user.studentProfile?.academic?.currentInstitution,
    user.studentProfile?.academic?.currentClass,
    user.studentProfile?.academic?.stream,
    user.studentProfile?.academic?.board,
    user.studentProfile?.goal?.shortTerm,
    user.studentProfile?.goal?.longTerm,
    user.studentProfile?.interests?.length > 0,
    user.studentProfile?.skills?.length > 0,
  ];

  // Count filled fields
  const filledFields = fields.filter(field => field).length;
  
  // Calculate percentage (rounded to nearest integer)
  return Math.round((filledFields / fields.length) * 100);
}

/**
 * Generate recent activity data
 * In a real app, this would come from an activity log collection
 */
function generateRecentActivity(user) {
  // Mock activity data
  const activities = [
    {
      type: "assessment",
      title: "Career Assessment Test",
      description: "Your results suggest interests in Technology and Design",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: "DocumentTextIcon",
      color: "blue",
    },
    {
      type: "college",
      title: "Delhi Technical University",
      description: "Compare with other saved colleges",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: "BuildingLibraryIcon",
      color: "green",
    },
    {
      type: "profile",
      title: "Educational Profile",
      description: `Profile completion increased to ${calculateProfileCompletion(user)}%`,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      icon: "AcademicCapIcon",
      color: "purple",
    },
  ];

  return activities;
}