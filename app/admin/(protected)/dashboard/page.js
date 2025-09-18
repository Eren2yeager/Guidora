'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ArrowDownIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Import our reusable components
import StatCard from '@/components/admin/StatCard';
import ActionCard from '@/components/admin/ActionCard';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    colleges: { count: 0, loading: true },
    scholarships: { count: 0, loading: true },
    resources: { count: 0, loading: true },
    timelineEvents: { count: 0, loading: true },
    quizQuestions: { count: 0, loading: true },
    ngos: { count: 0, loading: true },
    courses: { count: 0, loading: true },
    programs: { count: 0, loading: true },
    streams: { count: 0, loading: true },
    careers: { count: 0, loading: true },
    exams: { count: 0, loading: true },
    counselors: { count: 0, loading: true }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const fetchData = async (endpoint) => {
          try {
            const res = await fetch(`/api/admin/${endpoint}?limit=1`);
            if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
            const data = await res.json();
            return { count: data.data.total || 0, loading: false, change: 0 };
          } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return { count: 0, loading: false, change: 0 };
          }
        };

        const endpoints = [
          'colleges',
          'scholarships',
          'resources',
          'timeline-events',
          'quiz-questions',
          'ngos',
          'courses',
          'programs',
          'streams',
          'careers',
          'exams',
          'counselors'
        ];

        const results = await Promise.all(
          endpoints.map(endpoint => fetchData(endpoint))
        );

        setStats({
          colleges: results[0],
          scholarships: results[1],
          resources: results[2],
          timelineEvents: results[3],
          quizQuestions: results[4],
          ngos: results[5],
          courses: results[6],
          programs: results[7],
          streams: results[8],
          careers: results[9],
          exams: results[10],
          counselors: results[11]
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Colleges', count: stats.colleges?.count || 0, icon: BuildingLibraryIcon, loading: stats.colleges?.loading, change: stats.colleges?.change, href: '/admin/colleges', bgColor: 'bg-blue-500' },
    { name: 'Scholarships', count: stats.scholarships?.count || 0, icon: BanknotesIcon, loading: stats.scholarships?.loading, change: stats.scholarships?.change, href: '/admin/scholarships', bgColor: 'bg-indigo-500' },
    { name: 'Resources', count: stats.resources?.count || 0, icon: DocumentIcon, loading: stats.resources?.loading, change: stats.resources?.change, href: '/admin/resources', bgColor: 'bg-pink-500' },
    { name: 'Timeline Events', count: stats.timelineEvents?.count || 0, icon: CalendarIcon, loading: stats.timelineEvents?.loading, change: stats.timelineEvents?.change, href: '/admin/timeline-events', bgColor: 'bg-emerald-500' },
    { name: 'Quiz Questions', count: stats.quizQuestions?.count || 0, icon: QuestionMarkCircleIcon, loading: stats.quizQuestions?.loading, change: stats.quizQuestions?.change, href: '/admin/quiz-questions', bgColor: 'bg-amber-500' },
    { name: 'NGOs', count: stats.ngos?.count || 0, icon: UserGroupIcon, loading: stats.ngos?.loading, change: stats.ngos?.change, href: '/admin/ngos', bgColor: 'bg-teal-500' },
    { name: 'Courses', count: stats.courses?.count || 0, icon: BookOpenIcon, loading: stats.courses?.loading, change: stats.courses?.change, href: '/admin/courses', bgColor: 'bg-green-500' },
    { name: 'Programs', count: stats.programs?.count || 0, icon: DocumentTextIcon, loading: stats.programs?.loading, change: stats.programs?.change, href: '/admin/programs', bgColor: 'bg-purple-500' },
    { name: 'Streams', count: stats.streams?.count || 0, icon: GlobeAltIcon, loading: stats.streams?.loading, change: stats.streams?.change, href: '/admin/streams', bgColor: 'bg-red-500' },
    { name: 'Careers', count: stats.careers?.count || 0, icon: BriefcaseIcon, loading: stats.careers?.loading, change: stats.careers?.change, href: '/admin/careers', bgColor: 'bg-yellow-500' },
    { name: 'Exams', count: stats.exams?.count || 0, icon: BeakerIcon, loading: stats.exams?.loading, change: stats.exams?.change, href: '/admin/exams', bgColor: 'bg-cyan-500' },
    { name: 'Counselors', count: stats.counselors?.count || 0, icon: UserIcon, loading: stats.counselors?.loading, change: stats.counselors?.change, href: '/admin/counselors', bgColor: 'bg-orange-500' }
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
          {statCards.map((card) => (
            <a key={card.name} href={`${card.href}/new`} className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="text-md font-medium text-gray-900">Add New {card.name.replace(/s$/, '')}</h3>
              <p className="mt-1 text-sm text-gray-500">Create a new {card.name.toLowerCase().replace(/s$/, '')} entry</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}