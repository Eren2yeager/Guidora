'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Testimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      content: "Guidora helped me find the perfect engineering program. The personalized recommendations were spot on!",
      author: "Rahul Sharma",
      role: "B.Tech Student, IIT Bombay",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
    },
    {
      id: 2,
      content: "I was confused about which career path to choose. The career assessment quiz gave me clarity and direction.",
      author: "Priya Patel",
      role: "Medical Student, AIIMS Delhi",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
    },
    {
      id: 3,
      content: "Finding scholarships was always a challenge until I discovered Guidora. Now I'm studying with a full scholarship!",
      author: "Amit Kumar",
      role: "MBA Student, IIM Ahmedabad",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
    },
    {
      id: 4,
      content: "As a parent, I found the college comparison tool extremely helpful in guiding my daughter's education decisions.",
      author: "Sunita Verma",
      role: "Parent",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
    },
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Students and parents love us</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Hear from students and parents who found success with our platform
          </p>
        </div>

        <div className="mt-16">
          <div className="relative">
            <div className="relative max-w-3xl mx-auto">
              <div className="relative">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-lg p-8"
                >
                  <div className="flex items-center mb-8">
                    <img
                      className="h-12 w-12 rounded-full"
                      src={testimonials[activeTestimonial].avatar}
                      alt={testimonials[activeTestimonial].author}
                    />
                    <div className="ml-4">
                      <div className="text-lg font-medium text-gray-900">{testimonials[activeTestimonial].author}</div>
                      <div className="text-base text-gray-500">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                  <p className="text-xl text-gray-700 italic">"{testimonials[activeTestimonial].content}"</p>
                </motion.div>
              </div>

              <div className="mt-8 flex justify-center space-x-3">
                <button
                  onClick={prevTestimonial}
                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`h-2 w-2 rounded-full ${activeTestimonial === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTestimonial}
                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}