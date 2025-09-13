'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FeaturedCards() {
  const [activeTab, setActiveTab] = useState('courses');

  const featuredItems = {
    courses: [
      {
        id: 1,
        title: 'UPSC Free Crash Course',
        description: 'Comprehensive preparation for civil services',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        link: '/courses/upsc-crash-course',
        badge: 'FREE',
      },
      {
        id: 2,
        title: 'Pre-JEE / NEET 2024 Preparation',
        description: 'Get ready for engineering and medical entrance exams',
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        link: '/courses/jee-neet-prep',
        badge: 'POPULAR',
      },
      {
        id: 3,
        title: 'Future Ready Skills',
        description: 'Learn in-demand tech and soft skills',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        link: '/courses/future-ready-skills',
        badge: 'NEW',
      },
    ],
    colleges: [
      {
        id: 1,
        title: 'IIT Delhi',
        description: 'Premier engineering institution in India',
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        link: '/colleges/iit-delhi',
        badge: 'TOP RANKED',
      },
      {
        id: 2,
        title: 'AIIMS New Delhi',
        description: 'Leading medical institution',
        image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        link: '/colleges/aiims-delhi',
        badge: 'MEDICAL',
      },
      {
        id: 3,
        title: 'Delhi University',
        description: 'Renowned for arts and humanities',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        link: '/colleges/delhi-university',
        badge: 'ARTS & SCIENCE',
      },
    ],
    scholarships: [
      {
        id: 1,
        title: 'National Scholarship Portal',
        description: 'Government scholarships for all students',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        link: '/scholarships/national-portal',
        badge: 'GOVT',
      },
      {
        id: 2,
        title: 'Merit Scholarships 2024',
        description: 'For academically excellent students',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        link: '/scholarships/merit',
        badge: 'MERIT',
      },
      {
        id: 3,
        title: 'Women in STEM Scholarship',
        description: 'Supporting women in science and technology',
        image: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        link: '/scholarships/women-stem',
        badge: 'WOMEN',
      },
    ],
  };

  const tabs = [
    { id: 'courses', label: 'Featured Courses' },
    { id: 'colleges', label: 'Top Colleges' },
    { id: 'scholarships', label: 'Scholarships' },
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Key Highlights</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover opportunities that match your interests and goals
          </p>
        </div>

        <div className="mt-12">
          <div className="flex justify-center mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredItems[activeTab].map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex-shrink-0 relative">
                  <img className="h-48 w-full object-cover" src={item.image} alt={item.title} />
                  {item.badge && (
                    <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 m-2 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <Link href={item.link} className="block">
                      <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-3 text-base text-gray-500">{item.description}</p>
                    </Link>
                  </div>
                  <div className="mt-6">
                    <Link
                      href={item.link}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Learn more
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href={`/${activeTab}`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View all {activeTab}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}