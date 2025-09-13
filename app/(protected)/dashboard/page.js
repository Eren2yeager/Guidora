'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
      link: '/courses'
    },
    {
      title: 'Saved Colleges',
      description: 'Colleges you have saved for later',
      icon: BuildingLibraryIcon,
      color: 'bg-green-500',
      link: '/colleges'
    },
    {
      title: 'Career Paths',
      description: 'Explore potential career paths',
      icon: BriefcaseIcon,
      color: 'bg-purple-500',
      link: '/careers'
    },
    {
      title: 'Programs',
      description: 'View recommended programs',
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      link: '/programs'
    },
    {
      title: 'Recent Activity',
      description: 'Your recent activity on the platform',
      icon: ClockIcon,
      color: 'bg-pink-500',
      link: '#'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {session.user.name || 'Student'}!</h1>
          <p className="mt-2 text-lg text-gray-600">Here's your educational journey at a glance</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              onClick={() => router.push(item.link)}
            >
              <div className="p-6 cursor-pointer">
                <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Educational Progress</h2>
            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-gray-600">Your personalized educational journey and progress will be displayed here.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}