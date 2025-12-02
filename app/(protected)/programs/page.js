"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  AcademicCapIcon, 
  FunnelIcon, 
  BuildingLibraryIcon,
  CurrencyRupeeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { gradients } from '@/lib/design-tokens';

const iconGradients = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600',
];

export default function ProgramsPage() {
  const router = useRouter();
  
  // Filters
  const [courseId, setCourseId] = useState('');
  const [medium, setMedium] = useState('');
  const [maxFees, setMaxFees] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [courses, setCourses] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Course search
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [selectedCourseName, setSelectedCourseName] = useState('');

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (courseId) params.set('courseId', courseId);
    if (medium) params.set('medium', medium);
    if (maxFees) params.set('maxFees', maxFees);
    params.set('page', page.toString());
    params.set('limit', '20');
    return params.toString();
  }, [courseId, medium, maxFees, page]);

  // Load courses for filter dropdown
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

  // Load programs
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/programs?${queryString}`;
        console.log('Fetching programs:', url);
        
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch programs');
        const data = await res.json();
        
        console.log('Received programs:', data.items?.length, 'items');
        setItems(data.items || []);
        setTotal(data.total || 0);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Fetch error:', e);
          setError('Failed to load programs. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [queryString]);

  // Handle course selection
  const handleCourseSelect = (course) => {
    setCourseId(course._id);
    setSelectedCourseName(course.name);
    setShowCourseDropdown(false);
    setCourseSearchQuery('');
    setPage(1);
  };

  // Get gradient for icon
  const getIconGradient = (index) => iconGradients[index % iconGradients.length];

  // Active filters count
  const activeFiltersCount = [courseId, medium, maxFees].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients.primary} text-white shadow-lg`}>
              <AcademicCapIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Degree Programs</h1>
              <p className="text-gray-600 mt-1">Find the perfect program at top colleges</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="elevated" padding="md" className="mb-6">
            <div className="space-y-4">
              {/* Filter Toggle Button */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FunnelIcon className="h-4 w-4" />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="solid-primary" size="sm" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCourseId('');
                      setSelectedCourseName('');
                      setMedium('');
                      setMaxFees('');
                      setPage(1);
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Expandable Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      {/* Course Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course
                        </label>
                        <div className="relative">
                          <input
                            className="w-full text-black border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Search for a course"
                            value={courseSearchQuery}
                            onChange={(e) => {
                              setCourseSearchQuery(e.target.value);
                              setShowCourseDropdown(true);
                            }}
                            onFocus={() => setShowCourseDropdown(true)}
                          />
                          
                          {showCourseDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                              {isLoadingCourses ? (
                                <div className="p-4 text-center text-gray-500">
                                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                                  Loading...
                                </div>
                              ) : courses.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                  No courses found
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

                      {/* Medium Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medium
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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

                      {/* Max Fees Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Annual Fees (₹)
                        </label>
                        <input
                          type="number"
                          className="w-full text-black border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="e.g., 100000"
                          value={maxFees}
                          onChange={(e) => setMaxFees(e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Results Count */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-sm text-gray-600"
          >
            Found <span className="font-semibold text-gray-900">{total}</span> program{total !== 1 ? 's' : ''}
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Programs</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <SkeletonCard hasImage={false} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="text-gray-400 mb-4">
                <AcademicCapIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Programs Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters to find what you're looking for.
              </p>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCourseId('');
                    setSelectedCourseName('');
                    setMedium('');
                    setMaxFees('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          </motion.div>
        )}

        {/* Results Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {items.map((program, index) => (
                <motion.div key={program._id} variants={fadeInUp}>
                  <Card 
                    variant="elevated" 
                    padding="none" 
                    hover 
                    hoverEffect="lift"
                    className="h-full overflow-hidden group cursor-pointer"
                    onClick={() => router.push(`/programs/${program._id}`)}
                  >
                    {/* Header with cutoff badge */}
                    <div className={`h-32 bg-gradient-to-br ${getIconGradient(index)} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-4xl font-bold opacity-90">
                            {Math.round(program.cutoff?.lastYear ?? 0)}%
                          </div>
                          <div className="text-sm opacity-75">Cutoff</div>
                        </div>
                      </div>
                      {program.durationYears && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="solid-white" size="sm">
                            {program.durationYears} {program.durationYears === 1 ? 'year' : 'years'}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="p-5">
                      <CardHeader className="mb-3">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {program.courseId?.name || 'Unknown Course'}
                        </CardTitle>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <BuildingLibraryIcon className="h-4 w-4 mr-1" />
                          <span className="truncate">{program.collegeId?.name || 'Unknown College'}</span>
                        </div>
                      </CardHeader>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        {program.medium && program.medium.length > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Medium:</span>
                            <span>{program.medium.join(', ')}</span>
                          </div>
                        )}
                        
                        {program.fees?.tuitionPerYear > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                            <span className="font-semibold text-gray-900">
                              ₹{program.fees.tuitionPerYear.toLocaleString()}/year
                            </span>
                          </div>
                        )}
                      </div>

                      {/* View Details */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:bg-blue-50 group-hover:border-blue-600 group-hover:text-blue-600 transition-colors"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {total > 20 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600 px-4">
                    Page {page} of {Math.ceil(total / 20)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total / 20)}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
