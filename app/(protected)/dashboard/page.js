'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  PencilIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui';
import { SkeletonProfile, SkeletonStats } from '@/components/ui/Skeleton';
import { calculateProfileCompletion } from '@/lib/utils';

import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import RoadmapWidget from '@/components/dashboard/RoadmapWidget';
import ProgressWidget from '@/components/dashboard/ProgressWidget';
import Timeline from '@/components/dashboard/Timeline';
import ChatInterface from '@/components/dashboard/ChatInterface';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch user data when session is available
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user) {
      fetchUserData();
    }
  }, [status, router, session]);

  // Fetch dashboard data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile first
      const profileRes = await fetch('/api/user/profile');
      let profileData = {};
      
      if (profileRes.ok) {
        profileData = await profileRes.json();
      } else {
        console.error('Failed to fetch profile', profileRes.status);
      }
      
      // Fetch saved items
      let savedItemsData = null;
      try {
        const savedItemsRes = await fetch('/api/user/saved-items');
        if (savedItemsRes.ok) {
          savedItemsData = await savedItemsRes.json();
        }
      } catch (err) {
        console.warn('Saved items API not available');
      }

      // Try to fetch dashboard data, but don't fail if it's not available
      let dashboardData = { stats: {}, profileCompletion: 0 };
      try {
        const dashboardRes = await fetch('/api/dashboard');
        if (dashboardRes.ok) {
          dashboardData = await dashboardRes.json();
        }
      } catch (dashErr) {
        console.warn('Dashboard API not available, using defaults');
      }
      
      // Combine the data properly
      setUserData({
        name: profileData.name || session?.user?.name,
        email: profileData.email || session?.user?.email,
        ...profileData,
        stats: {
          savedColleges: savedItemsData?.stats?.colleges || 0,
          enrolledCourses: savedItemsData?.stats?.courses || 0,
          savedScholarships: savedItemsData?.stats?.scholarships || 0,
          completedQuizzes: dashboardData.stats?.completedQuizzes || 0,
        },
        profileCompletion: dashboardData.profileCompletion || 0,
        savedColleges: dashboardData.savedColleges || [],
        enrolledCourses: dashboardData.enrolledCourses || [],
        savedScholarships: dashboardData.savedScholarships || [],
        savedItems: savedItemsData ? {
          ...savedItemsData,
          total: savedItemsData.stats?.total || 0,
        } : null,
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      // Set basic user data from session even if API fails
      setUserData({
        name: session?.user?.name,
        email: session?.user?.email,
        stats: {},
        profileCompletion: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <SkeletonProfile />
          <SkeletonStats count={4} />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Onboarding checklist */}
        {/* <OnboardingChecklist /> */}

        {/* Profile summary section */}
        <Card
          variant="elevated"
          padding="lg"
          className="mb-8 bg-linear-to-br from-white to-blue-50/30"
          animated
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Avatar */}
            <div className="shrink-0">
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden">
                  {userData?.media?.iconUrl ? (
                    <img 
                      src={userData.media.iconUrl} 
                      alt="Profile" 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <span className="text-white text-3xl font-bold">
                      {userData?.name?.charAt(0) || session.user.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 truncate">
                    {userData?.name || session.user.name || 'User'}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1 truncate">
                    {userData?.email || session.user.email || ''}
                  </p>
                  {userData?.academicBackground?.stream && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {userData.academicBackground.stream} • Class {userData.academicBackground.currentClass || '?'}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link 
                    href="/profile" 
                    className="shrink-0 inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="shrink-0 inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                    title="Sign Out"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
              
              {/* Profile completion */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
                    {calculateProfileCompletion(userData) === 100 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                        Complete
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {calculateProfileCompletion(userData) || userData?.profileCompletion || 0}%
                  </span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProfileCompletion(userData) || userData?.profileCompletion || 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  />
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
                  />
                </div>
                {calculateProfileCompletion(userData) < 100 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Complete your profile to get better recommendations
                  </p>
                )}
              </div>
              
              {/* Quick stats */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <motion.div 
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BuildingLibraryIcon className="h-4 w-4 text-blue-500" />
                    <p className="text-xs font-medium text-gray-500">Colleges</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userData?.stats?.savedColleges || 0}
                  </p>
                </motion.div>
                <motion.div 
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpenIcon className="h-4 w-4 text-purple-500" />
                    <p className="text-xs font-medium text-gray-500">Courses</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userData?.stats?.enrolledCourses || 0}
                  </p>
                </motion.div>
                <motion.div 
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BanknotesIcon className="h-4 w-4 text-emerald-500" />
                    <p className="text-xs font-medium text-gray-500">Scholarships</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userData?.stats?.savedScholarships || 0}
                  </p>
                </motion.div>
                <motion.div 
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AcademicCapIcon className="h-4 w-4 text-amber-500" />
                    <p className="text-xs font-medium text-gray-500">Quizzes</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userData?.stats?.completedQuizzes || 0}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </Card>

        {/* Saved Items Section */}
        {userData?.savedItems && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Saved Items</h3>
                </div>
                <Link 
                  href="/saved"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View All →
                </Link>
              </div>

              {userData.savedItems.total === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <BookOpenIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No saved items yet</p>
                  <Link 
                    href="/courses"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Explore Courses
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Courses */}
                  {userData.savedItems.courses?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-blue-500" />
                        Courses ({userData.savedItems.courses.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {userData.savedItems.courses.slice(0, 3).map((course) => (
                          <Link
                            key={course._id}
                            href={`/courses/${course.code}`}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
                          >
                            <h5 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {course.name}
                            </h5>
                            {course.code && (
                              <p className="text-xs text-gray-500 mt-1">{course.code}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Careers */}
                  {userData.savedItems.careers?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <BriefcaseIcon className="h-4 w-4 text-purple-500" />
                        Careers ({userData.savedItems.careers.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {userData.savedItems.careers.slice(0, 3).map((career) => (
                          <Link
                            key={career._id}
                            href={`/careers/${career.slug}`}
                            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group"
                          >
                            <h5 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                              {career.name}
                            </h5>
                            {career.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{career.description}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Programs */}
                  {userData.savedItems.programs?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <AcademicCapIcon className="h-4 w-4 text-indigo-500" />
                        Programs ({userData.savedItems.programs.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {userData.savedItems.programs.slice(0, 3).map((program) => (
                          <Link
                            key={program._id}
                            href={`/programs/${program._id}`}
                            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group"
                          >
                            <h5 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {program.courseId?.name || program.name}
                            </h5>
                            {program.collegeId?.name && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{program.collegeId.name}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scholarships */}
                  {userData.savedItems.scholarships?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <BanknotesIcon className="h-4 w-4 text-emerald-500" />
                        Scholarships ({userData.savedItems.scholarships.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {userData.savedItems.scholarships.slice(0, 3).map((scholarship) => (
                          <Link
                            key={scholarship._id}
                            href={`/scholarships/${scholarship._id}`}
                            className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all group"
                          >
                            <h5 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                              {scholarship.name || scholarship.title}
                            </h5>
                            {scholarship.amount && (
                              <p className="text-xs text-gray-600 mt-1">₹{scholarship.amount.toLocaleString()}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Roadmap & Progress row */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RoadmapWidget />
          <ProgressWidget />
        </div>

        {/* Timeline Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Timeline limit={5} showUpcomingOnly={true} />
        </motion.div>
      </div>

      {/* Chat button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <AcademicCapIcon className="h-6 w-6" />
      </motion.button>

      {/* Chat interface */}
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
