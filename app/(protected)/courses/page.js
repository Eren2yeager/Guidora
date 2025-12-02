"use client";
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, AcademicCapIcon, FunnelIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { gradients } from '@/lib/design-tokens';

// Level badge configuration
const levelConfig = {
  'PreU': { variant: 'primary', label: 'Pre-University' },
  'UG': { variant: 'success', label: 'Undergraduate' },
  'PG': { variant: 'secondary', label: 'Postgraduate' },
  'Diploma': { variant: 'warning', label: 'Diploma' },
  'Certificate': { variant: 'info', label: 'Certificate' },
};

// Gradient colors for course icons
const iconGradients = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600',
];

export default function CoursesPage() {
  // Filters
  const [q, setQ] = useState('');
  const [stream, setStream] = useState('');
  const [level, setLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [streams, setStreams] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Build query string for API
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (stream) params.set('stream', stream);
    if (level) params.set('level', level);
    return params.toString();
  }, [q, stream, level]);

  // Load streams for filter dropdown
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/streams', { signal: controller.signal });
        const data = await res.json();
        setStreams(data.items || []);
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      }
    })();
    return () => controller.abort();
  }, []);

  // Load courses
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/courses?${queryString}`;
        console.log('Fetching courses:', url);
        console.log('Filters:', { q, stream, level });
        
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        
        console.log('Received courses:', data.items?.length, 'items');
        setItems(data.items || []);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Fetch error:', e);
          setError('Failed to load courses. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [queryString, q, stream, level]);

  // Get gradient for course icon based on index
  const getIconGradient = (index) => iconGradients[index % iconGradients.length];

  // Active filters count
  const activeFiltersCount = [q, stream, level].filter(Boolean).length;

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
              <BookOpenIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Explore Courses</h1>
              <p className="text-gray-600 mt-1">Discover programs that match your interests and career goals</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="elevated" padding="md" className="mb-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full text-black pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Search courses by name, description, or keywords..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

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
                      setQ('');
                      setStream('');
                      setLevel('');
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      {/* Stream Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stream
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          value={stream}
                          onChange={(e) => setStream(e.target.value)}
                        >
                          <option value="">All Streams</option>
                          {streams.map((s) => (
                            <option key={s._id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Level Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Level
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                        >
                          <option value="">All Levels</option>
                          <option value="PreU">Pre-University</option>
                          <option value="UG">Undergraduate</option>
                          <option value="PG">Postgraduate</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Certificate">Certificate</option>
                        </select>
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
            Found <span className="font-semibold text-gray-900">{items.length}</span> course{items.length !== 1 ? 's' : ''}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Courses</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ('');
                    setStream('');
                    setLevel('');
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
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((course, index) => (
              <motion.div key={course._id} variants={fadeInUp}>
                <Card 
                  variant="elevated" 
                  padding="none" 
                  hover 
                  hoverEffect="lift"
                  className="h-full overflow-hidden group"
                >
                  {/* Course Icon Header */}
                  <div className={`h-32 bg-gradient-to-br ${getIconGradient(index)} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-5xl font-bold opacity-90">
                        {String(course.name || '?').slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    {/* Level Badge */}
                    {course.level && levelConfig[course.level] && (
                      <div className="absolute top-3 right-3">
                        <Badge 
                          variant={`solid-${levelConfig[course.level].variant}`}
                          size="sm"
                        >
                          {levelConfig[course.level].label}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <CardContent className="p-5">
                    <CardHeader className="mb-3">
                      <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.name}
                      </CardTitle>
                      {course.code && (
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {course.code}
                        </p>
                      )}
                    </CardHeader>

                    {course.description && (
                      <CardDescription className="line-clamp-3 mb-4">
                        {course.description}
                      </CardDescription>
                    )}

                    {/* Eligibility */}
                    {course.eligibility?.minMarks > 0 && (
                      <div className="mb-3 text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Min. Marks:</span>
                        <Badge variant="outline-primary" size="sm">
                          {course.eligibility.minMarks}%
                        </Badge>
                      </div>
                    )}

                    {/* Interest Tags */}
                    {course.interestTags && course.interestTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {course.interestTags.slice(0, 4).map((tag, idx) => (
                          <Badge key={idx} variant="default" size="sm">
                            {typeof tag === 'string' ? tag : tag.name || 'Tag'}
                          </Badge>
                        ))}
                        {course.interestTags.length > 4 && (
                          <Badge variant="default" size="sm">
                            +{course.interestTags.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>

                  {/* View Details Button */}
                  <div className="px-5 pb-5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-blue-50 group-hover:border-blue-600 group-hover:text-blue-600 transition-colors"
                      onClick={() => window.location.href = `/courses/${course.code}`}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
