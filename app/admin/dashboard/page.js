'use client';

import { useState, useEffect } from 'react';
import { 
  BuildingLibraryIcon, 
  BookOpenIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BriefcaseIcon,
  BeakerIcon,
  BanknotesIcon,
  DocumentIcon,
  UserIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    colleges: { count: 0, loading: true },
    courses: { count: 0, loading: true },
    programs: { count: 0, loading: true },
    streams: { count: 0, loading: true },
    careers: { count: 0, loading: true },
    exams: { count: 0, loading: true },
    scholarships: { count: 0, loading: true },
    resources: { count: 0, loading: true },
    counselors: { count: 0, loading: true },
    timelineEvents: { count: 0, loading: true },
    quizQuestions: { count: 0, loading: true }
  });

  useEffect(() => {
    // Fetch statistics from the backend
    const fetchStats = async () => {
      try {
        // Simulate API calls for now
        // In a real implementation, you would fetch from your API
        setTimeout(() => {
          setStats({
            colleges: { count: 125, loading: false, change: 5 },
            courses: { count: 350, loading: false, change: 12 },
            programs: { count: 780, loading: false, change: -3 },
            streams: { count: 5, loading: false, change: 0 },
            careers: { count: 42, loading: false, change: 2 },
            exams: { count: 28, loading: false, change: 0 },
            scholarships: { count: 95, loading: false, change: 15 },
            resources: { count: 120, loading: false, change: 8 },
            counselors: { count: 15, loading: false, change: 3 },
            timelineEvents: { count: 35, loading: false, change: 5 },
            quizQuestions: { count: 150, loading: false, change: 10 }
          });
        }, 1000);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Colleges', count: stats.colleges.count, icon: BuildingLibraryIcon, loading: stats.colleges.loading, change: stats.colleges.change, href: '/admin/colleges', bgColor: 'bg-blue-500' },
    { name: 'Courses', count: stats.courses.count, icon: BookOpenIcon, loading: stats.courses.loading, change: stats.courses.change, href: '/admin/courses', bgColor: 'bg-green-500' },
    { name: 'Programs', count: stats.programs.count, icon: DocumentTextIcon, loading: stats.programs.loading, change: stats.programs.change, href: '/admin/programs', bgColor: 'bg-purple-500' },
    { name: 'Streams', count: stats.streams.count, icon: UserGroupIcon, loading: stats.streams.loading, change: stats.streams.change, href: '/admin/streams', bgColor: 'bg-orange-500' },
    { name: 'Careers', count: stats.careers.count, icon: BriefcaseIcon, loading: stats.careers.loading, change: stats.careers.change, href: '/admin/careers', bgColor: 'bg-red-500' },
    { name: 'Exams', count: stats.exams.count, icon: BeakerIcon, loading: stats.exams.loading, change: stats.exams.change, href: '/admin/exams', bgColor: 'bg-yellow-500' },
    { name: 'Scholarships', count: stats.scholarships.count, icon: BanknotesIcon, loading: stats.scholarships.loading, change: stats.scholarships.change, href: '/admin/scholarships', bgColor: 'bg-indigo-500' },
    { name: 'Resources', count: stats.resources.count, icon: DocumentIcon, loading: stats.resources.loading, change: stats.resources.change, href: '/admin/resources', bgColor: 'bg-pink-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Overview of your educational advisor system</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${card.bgColor}`}>
                  <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd>
                      {card.loading ? (
                        <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1"></div>
                      ) : (
                        <div className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{card.count}</div>
                          {card.change !== 0 && (
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {card.change > 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                              <span className="sr-only">{card.change > 0 ? 'Increased' : 'Decreased'} by</span>
                              {Math.abs(card.change)}
                            </div>
                          )}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href={card.href} className="font-medium text-blue-700 hover:text-blue-900">
                  View all
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a href="/admin/colleges/import" className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="text-md font-medium text-gray-900">Import Colleges</h3>
            <p className="mt-1 text-sm text-gray-500">Upload JSON or CSV data to add new colleges</p>
          </a>
          <a href="/admin/courses/import" className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="text-md font-medium text-gray-900">Import Courses</h3>
            <p className="mt-1 text-sm text-gray-500">Upload JSON or CSV data to add new courses</p>
          </a>
          <a href="/admin/programs/import" className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="text-md font-medium text-gray-900">Import Programs</h3>
            <p className="mt-1 text-sm text-gray-500">Upload JSON or CSV data to add new programs</p>
          </a>
          <a href="/admin/careers/import" className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="text-md font-medium text-gray-900">Import Careers</h3>
            <p className="mt-1 text-sm text-gray-500">Upload JSON or CSV data to add new careers</p>
          </a>
          <a href="/admin/exams/import" className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="text-md font-medium text-gray-900">Import Exams</h3>
            <p className="mt-1 text-sm text-gray-500">Upload JSON or CSV data to add new exams</p>
          </a>
          <a href="/admin/scholarships/import" className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="text-md font-medium text-gray-900">Import Scholarships</h3>
            <p className="mt-1 text-sm text-gray-500">Upload JSON or CSV data to add new scholarships</p>
          </a>
        </div>
      </div>
    </div>
  );
}