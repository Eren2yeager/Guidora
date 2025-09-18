'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function QuizzesPage() {
  const router = useRouter();
  
  // Quiz categories with descriptions
  const quizCategories = [
    {
      id: 'interest',
      title: 'Interest Assessment',
      description: 'Discover which subjects and fields align with your personal interests and passions.',
      image: '/images/deciding.svg',
      color: 'from-pink-500 to-rose-600',
      buttonColor: 'bg-rose-600 hover:bg-rose-700',
    },
    {
      id: 'aptitude',
      title: 'Aptitude Assessment',
      description: "Identify your natural strengths and abilities to find courses where you'll excel.",
      image: '/images/scholarship.svg',
      color: 'from-purple-500 to-indigo-600',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      id: 'personality',
      title: 'Personality Assessment',
      description: 'Understand your working style and preferences to find the right career path.',
      image: '/images/university.svg',
      color: 'from-blue-500 to-cyan-600',
      buttonColor: 'bg-cyan-600 hover:bg-cyan-700',
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Career Assessment',
      description: 'Complete all assessments for a full personalized education and career recommendation.',
      image: '/images/deciding.svg',
      color: 'from-emerald-500 to-teal-600',
      buttonColor: 'bg-teal-600 hover:bg-teal-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Discover Your Perfect</span>
            <span className="block text-blue-600">Educational Path</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Take our personalized quizzes to find courses, colleges, and careers that match your interests, aptitudes, and personality.
          </p>
        </div>
      </div>

      {/* Quiz categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Choose an Assessment</h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {quizCategories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className={`h-3 bg-gradient-to-r ${category.color}`}></div>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-16 w-16"
                      src={category.image}
                      alt={category.title}
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">{category.description}</p>
                <div className="mt-6">
                  <Link 
                    href={`/quizzes/${category.id}`}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${category.buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    Start Assessment
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Take Our Assessments?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Make informed decisions about your educational journey
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-blue-600 text-2xl font-bold mb-2">Personalized Insights</div>
              <p className="text-gray-700">Get recommendations tailored to your unique combination of interests, aptitudes, and personality traits.</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-purple-600 text-2xl font-bold mb-2">Discover New Paths</div>
              <p className="text-gray-700">Explore career options you might not have considered that match your natural strengths and preferences.</p>
            </div>
            <div className="bg-rose-50 rounded-lg p-6">
              <div className="text-rose-600 text-2xl font-bold mb-2">Make Confident Choices</div>
              <p className="text-gray-700">Reduce uncertainty and anxiety by making educational decisions based on data and self-awareness.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to find your path?</span>
            <span className="block text-blue-200">Start with our comprehensive assessment.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/quizzes/comprehensive"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}