'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  NewspaperIcon,
  BanknotesIcon,
  ScaleIcon,
  UserGroupIcon,
  BellIcon,
  ArrowRightIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // This will prevent flash of content before redirect
  }

  const dashboardItems = [
    {
      title: 'My Courses',
      description: 'View and manage your enrolled courses',
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      link: '/courses',
      category: 'learning'
    },
    {
      title: 'Saved Colleges',
      description: 'Colleges you have saved for later',
      icon: BuildingLibraryIcon,
      color: 'bg-green-500',
      link: '/colleges',
      category: 'education'
    },
    {
      title: 'Career Paths',
      description: 'Explore potential career paths',
      icon: BriefcaseIcon,
      color: 'bg-purple-500',
      link: '/careers',
      category: 'career'
    },
    {
      title: 'Programs',
      description: 'View recommended programs',
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      link: '/programs',
      category: 'education'
    },
    {
      title: 'Recent Activity',
      description: 'Your recent activity on the platform',
      icon: ClockIcon,
      color: 'bg-pink-500',
      link: '#',
      category: 'activity'
    },
    {
      title: 'Articles',
      description: 'Educational articles and resources',
      icon: NewspaperIcon,
      color: 'bg-indigo-500',
      link: '/articles',
      category: 'resources'
    },
    {
      title: 'Scholarships',
      description: 'Find scholarships matching your profile',
      icon: BanknotesIcon,
      color: 'bg-emerald-500',
      link: '/scholarships',
      category: 'financial'
    },
    {
      title: 'Compare Colleges',
      description: 'Compare different educational institutions',
      icon: ScaleIcon,
      color: 'bg-amber-500',
      link: '/compare',
      category: 'education'
    },
    {
      title: 'Performance',
      description: 'Track your academic performance',
      icon: ChartBarIcon,
      color: 'bg-red-500',
      link: '/performance',
      category: 'learning'
    },
    {
      title: 'Community',
      description: 'Connect with other students',
      icon: UserGroupIcon,
      color: 'bg-cyan-500',
      link: '/community',
      category: 'social'
    },
  ];
  
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'education', name: 'Education' },
    { id: 'learning', name: 'Learning' },
    { id: 'career', name: 'Career' },
    { id: 'resources', name: 'Resources' },
    { id: 'financial', name: 'Financial' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header section with user info and notifications */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {session.user.name || 'Student'}!</h1>
            <p className="mt-2 text-lg text-gray-600">Here's your educational journey at a glance</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4 md:mt-0 flex items-center space-x-4"
          >
            <div className="relative">
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                <BellIcon className="h-6 w-6 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
            <Link href="/profile" className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md hover:bg-gray-50 transition-colors">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                {session.user.image ? (
                  <img src={session.user.image} alt="Profile" className="h-8 w-8 rounded-full" />
                ) : (
                  <span className="text-blue-500 font-medium">{session.user.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">My Profile</span>
            </Link>
          </motion.div>
        </div>

        {/* Category filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 overflow-x-auto pb-2"
        >
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === category.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dashboard items grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardItems
            .filter(item => activeCategory === 'all' || item.category === activeCategory)
            .map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-center p-4">
                <div className={`p-3 rounded-lg ${item.color} text-white mr-4`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
              <div className="px-4 pb-4 pt-0 flex justify-between items-center">
                <Link 
                  href={item.link} 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  View details
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
                <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <StarIcon className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
              View all <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Activity items */}
            <div className="space-y-6">
              {/* Activity item 1 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">You completed <span className="font-semibold">Career Assessment Test</span></p>
                  <p className="text-sm text-gray-500">Your results suggest interests in Technology and Design</p>
                  <p className="mt-1 text-xs text-gray-400">2 hours ago</p>
                </div>
                <button className="ml-4 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5">
                  <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Activity item 2 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <BuildingLibraryIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">You saved <span className="font-semibold">Delhi Technical University</span> to your list</p>
                  <p className="text-sm text-gray-500">Compare with other saved colleges</p>
                  <p className="mt-1 text-xs text-gray-400">Yesterday</p>
                </div>
                <button className="ml-4 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5">
                  <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Activity item 3 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <AcademicCapIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">You updated your <span className="font-semibold">Educational Profile</span></p>
                  <p className="text-sm text-gray-500">Profile completion increased to 85%</p>
                  <p className="mt-1 text-xs text-gray-400">3 days ago</p>
                </div>
                <button className="ml-4 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5">
                  <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}