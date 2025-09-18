"use client";
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProgramsPage() {
  // Filters and list state
  const [items, setItems] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [medium, setMedium] = useState('');
  const [maxFees, setMaxFees] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Course dropdown state
  const [courses, setCourses] = useState([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [selectedCourseName, setSelectedCourseName] = useState('');

  // Fetch courses for dropdown
  useEffect(() => {
    if (!courseSearchQuery && !showCourseDropdown) return;
    
    const controller = new AbortController();
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const params = new URLSearchParams();
        if (courseSearchQuery) params.set('q', courseSearchQuery);
        params.set('limit', '10');
        
        const res = await fetch(`/api/courses?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        setCourses(data.items || []);
      } catch (e) {
        if (e.name !== 'AbortError') console.error('Error fetching courses:', e);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    
    fetchCourses();
    return () => controller.abort();
  }, [courseSearchQuery, showCourseDropdown]);
  
  // Build a query string when filters change
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (courseId) params.set('courseId', courseId);
    if (medium) params.set('medium', medium);
    if (maxFees) params.set('maxFees', maxFees);
    return params.toString();
  }, [courseId, medium, maxFees]);
  
  // Handle course selection
  const handleCourseSelect = (course) => {
    setCourseId(course._id);
    setSelectedCourseName(course.name);
    setShowCourseDropdown(false);
    setCourseSearchQuery('');
  };

  // Fetch programs
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/programs?${queryString}`, { signal: controller.signal });
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [queryString]);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Programs</h1>
        <p className="text-lg text-gray-600">Find the perfect program based on your preferences</p>
      </motion.div>

      {/* Filters card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Course dropdown */}
          <div className="space-y-2">
            <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course</label>
            <div className="relative">
              <input
                id="course"
                className="w-full border text-black border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for a course"
                value={courseSearchQuery}
                onChange={(e) => {
                  setCourseSearchQuery(e.target.value);
                  setShowCourseDropdown(true);
                }}
                onFocus={() => setShowCourseDropdown(true)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Course dropdown */}
              {showCourseDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  {isLoadingCourses ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                      Loading courses...
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No courses found. Try a different search.
                    </div>
                  ) : (
                    <ul>
                      {courses.map((course) => (
                        <li 
                          key={course._id} 
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 border-b border-gray-100 last:border-b-0"
                          onClick={() => handleCourseSelect(course)}
                        >
                          <div className="font-medium">{course.name}</div>
                          <div className="text-xs text-gray-500">{course.code}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              
              {selectedCourseName && (
                <div className="mt-2 flex items-center">
                  <span className="text-sm text-blue-600 font-medium">{selectedCourseName}</span>
                  <button 
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setCourseId('');
                      setSelectedCourseName('');
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Medium */}
          <div className="space-y-2">
            <label htmlFor="medium" className="block text-sm font-medium text-gray-700">Medium</label>
            <select
              id="medium"
              className="w-full border text-black border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
            >
              <option value="">All Languages</option>
              <option value="EN">English</option>
              <option value="HI">Hindi</option>
              <option value="TA">Tamil</option>
              <option value="TE">Telugu</option>
              <option value="KN">Kannada</option>
              <option value="ML">Malayalam</option>
            </select>
          </div>
          
          {/* Max Fees */}
          <div className="space-y-2">
            <label htmlFor="maxFees" className="block text-sm font-medium text-gray-700">Maximum Annual Fees (₹)</label>
            <input
              id="maxFees"
              type="number"
              className="w-full border text-black border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 100000"
              value={maxFees}
              onChange={(e) => setMaxFees(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {!loading && (
              <span>Programs {items.length > 0 ? <span className="text-blue-600">({items.length})</span> : ''}</span>
            )}
          </h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-lg bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center"
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-gray-700 text-lg font-medium mt-4 mb-1">No programs found</div>
            <div className="text-gray-500">Try adjusting your filters or search criteria</div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p, index) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link href={`/programs/${p._id}`} className="block">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Left: colored chip based on cutoff */}
                      <div className={
                        `h-14 w-14 rounded-lg text-white flex items-center justify-center font-bold text-lg shadow-sm ` +
                        ((p.cutoff?.lastYear || 0) >= 75 ? 'bg-gradient-to-br from-green-500 to-green-600' : 
                         (p.cutoff?.lastYear || 0) >= 60 ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 
                         'bg-gradient-to-br from-gray-500 to-gray-600')
                      }>
                        {Math.round(p.cutoff?.lastYear ?? 0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{p.courseId?.name || 'Unknown Course'}</h3>
                        <div className="flex items-center mt-1">
                          <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="text-sm text-gray-600 truncate">{p.collegeId?.name || 'Unknown College'}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {p.medium && p.medium.length > 0 && (
                            <span className="inline-flex items-center bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                              {(p.medium || []).join(', ')}
                            </span>
                          )}
                          
                          {p.durationYears && (
                            <span className="inline-flex items-center bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
                              {p.durationYears} {p.durationYears === 1 ? 'year' : 'years'}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="text-sm">
                            <span className="text-gray-500">Annual Fees:</span> 
                            <span className="font-semibold text-gray-900 ml-1">
                              ₹{p.fees?.tuitionPerYear?.toLocaleString() ?? '—'}
                            </span>
                          </div>
                          
                          <span className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
                            Details
                            <svg className="inline-block ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}