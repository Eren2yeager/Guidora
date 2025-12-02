"use client";
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BriefcaseIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { gradients } from '@/lib/design-tokens';

// Gradient colors for career icons
const iconGradients = [
  'from-purple-500 to-indigo-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-purple-600',
];

export default function CareersPage() {
  // Filters
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedCareers, setSavedCareers] = useState(new Set());
  const [savingCareers, setSavingCareers] = useState(new Set());

  // Fetch saved careers on mount
  useEffect(() => {
    const fetchSavedCareers = async () => {
      try {
        const res = await fetch('/api/user/saved-careers');
        if (res.ok) {
          const data = await res.json();
          setSavedCareers(new Set(data.savedCareers || []));
        }
      } catch (e) {
        console.error('Error fetching saved careers:', e);
      }
    };
    fetchSavedCareers();
  }, []);

  // Build query string for API
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (sector) params.set('sector', sector);
    return params.toString();
  }, [q, sector]);

  // Load careers
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching careers:', `/api/careers?${queryString}`);
        const res = await fetch(`/api/careers?${queryString}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch careers');
        const data = await res.json();
        console.log('Received careers:', data.items?.length, 'items');
        setItems(data.items || []);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Error fetching careers:', e);
          setError('Failed to load careers. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [queryString]);

  // Handle save/unsave career
  const handleSaveCareer = async (careerId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isSaved = savedCareers.has(careerId);
    setSavingCareers(prev => new Set(prev).add(careerId));
    
    try {
      console.log('Saving/unsaving career:', careerId, 'isSaved:', isSaved);
      const res = await fetch('/api/user/saved-careers', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId }),
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Save response:', data);
        setSavedCareers(prev => {
          const newSet = new Set(prev);
          if (isSaved) {
            newSet.delete(careerId);
          } else {
            newSet.add(careerId);
          }
          return newSet;
        });
      } else {
        const errorData = await res.json();
        console.error('Failed to save/unsave career:', errorData);
      }
    } catch (e) {
      console.error('Error saving career:', e);
    } finally {
      setSavingCareers(prev => {
        const newSet = new Set(prev);
        newSet.delete(careerId);
        return newSet;
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setQ('');
    setSector('');
  };

  // Check if any filters are active
  const hasActiveFilters = q || sector;
  const activeFiltersCount = [q, sector].filter(Boolean).length;

  // Get gradient for career icon based on index
  const getIconGradient = (index) => iconGradients[index % iconGradients.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients.secondary} text-white shadow-lg`}>
              <BriefcaseIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Explore Careers</h1>
              <p className="text-gray-600 mt-1">Discover career paths that match your interests and skills</p>
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
                  className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Search careers by name, skills, or description..."
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
                
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
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
                    <div className="pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sector
                        </label>
                        <input
                          type="text"
                          className="w-full border  text-black border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          placeholder="e.g., Healthcare, IT, Education"
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
            Found <span className="font-semibold text-gray-900">{items.length}</span> career{items.length !== 1 ? 's' : ''}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Careers</h3>
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                <BriefcaseIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Careers Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {items.map((career, index) => (
              <motion.div key={career._id} variants={fadeInUp}>
                <Card 
                  variant="elevated" 
                  padding="none" 
                  hover 
                  hoverEffect="lift"
                  className="h-full overflow-hidden group relative"
                >
                  {/* Save button */}
                  <button
                    onClick={(e) => handleSaveCareer(career._id, e)}
                    disabled={savingCareers.has(career._id)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    title={savedCareers.has(career._id) ? 'Remove from saved' : 'Save career'}
                  >
                    {savingCareers.has(career._id) ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-purple-600" />
                    ) : savedCareers.has(career._id) ? (
                      <BookmarkSolidIcon className="h-5 w-5 text-purple-600" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5 text-gray-400 hover:text-purple-600" />
                    )}
                  </button>

                  {/* Career Icon Header */}
                  <div className={`h-32 bg-gradient-to-br ${getIconGradient(index)} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-5xl font-bold opacity-90">
                        {String(career.name || '?').slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <Link href={`/careers/${career.slug}`} className="block">
                    {/* Career Content */}
                    <CardContent className="p-5">
                      <CardHeader className="mb-3">
                        <CardTitle className="text-xl line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {career.name}
                        </CardTitle>
                        {career.description && (
                          <CardDescription className="line-clamp-2 mt-2">
                            {career.description}
                          </CardDescription>
                        )}
                      </CardHeader>

                      {/* Salary Range */}
                      {career.medianPayBand && career.medianPayBand.max > 0 && (
                        <div className="mb-3 flex items-center gap-2">
                          <CurrencyRupeeIcon className="h-4 w-4 text-emerald-600" />
                          <Badge variant="solid-success" size="sm">
                            {career.medianPayBand.currency} {career.medianPayBand.min.toLocaleString()} - {career.medianPayBand.max.toLocaleString()}
                          </Badge>
                        </div>
                      )}

                      {/* Sectors */}
                      {career.sectors && career.sectors.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1.5">Sectors</div>
                          <div className="flex flex-wrap gap-1.5">
                            {career.sectors.slice(0, 3).map((sector) => (
                              <Badge key={sector} variant="primary" size="sm">
                                {sector}
                              </Badge>
                            ))}
                            {career.sectors.length > 3 && (
                              <Badge variant="default" size="sm">
                                +{career.sectors.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {career.skillsRequired && career.skillsRequired.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1.5">Key Skills</div>
                          <div className="flex flex-wrap gap-1.5">
                            {career.skillsRequired.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" size="sm">
                                {skill}
                              </Badge>
                            ))}
                            {career.skillsRequired.length > 3 && (
                              <Badge variant="default" size="sm">
                                +{career.skillsRequired.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Related Courses */}
                      {career.typicalCourses && career.typicalCourses.length > 0 && (
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <AcademicCapIcon className="h-4 w-4 text-purple-600" />
                            <div className="text-xs font-medium text-purple-700">Related Courses</div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {career.typicalCourses.slice(0, 2).map((course, idx) => (
                              <Badge key={idx} variant="outline-secondary" size="sm">
                                {typeof course === 'string' ? course : course.name || 'Course'}
                              </Badge>
                            ))}
                            {career.typicalCourses.length > 2 && (
                              <Badge variant="default" size="sm">
                                +{career.typicalCourses.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    {/* View Details Button */}
                    <div className="px-5 pb-5">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:bg-purple-50 group-hover:border-purple-600 group-hover:text-purple-600 transition-colors"
                      >
                        View Details
                      </Button>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
