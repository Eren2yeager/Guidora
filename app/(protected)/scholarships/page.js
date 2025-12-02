"use client";
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  AcademicCapIcon,
  BookmarkIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { gradients } from '@/lib/design-tokens';
import { calculateDeadlineUrgency, checkScholarshipEligibility } from '@/lib/utils';

// Gradient colors for scholarship icons
const iconGradients = [
  'from-emerald-500 to-teal-600',
  'from-green-500 to-emerald-600',
  'from-teal-500 to-cyan-600',
  'from-lime-500 to-green-600',
  'from-cyan-500 to-blue-600',
  'from-blue-500 to-indigo-600',
];

export default function ScholarshipsPage() {
  const { data: session } = useSession();
  
  // Filters
  const [q, setQ] = useState('');
  const [providerType, setProviderType] = useState('');
  const [state, setState] = useState('');
  const [stream, setStream] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [savedScholarships, setSavedScholarships] = useState(new Set());
  const [savingScholarships, setSavingScholarships] = useState(new Set());

  // Fetch user profile for eligibility checking
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }
      } catch (e) {
        console.error('Error fetching user profile:', e);
      }
    };
    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  // Fetch saved scholarships on mount
  useEffect(() => {
    const fetchSavedScholarships = async () => {
      try {
        const res = await fetch('/api/user/saved-scholarships');
        if (res.ok) {
          const data = await res.json();
          setSavedScholarships(new Set(data.savedScholarships || []));
        }
      } catch (e) {
        console.error('Error fetching saved scholarships:', e);
      }
    };
    if (session?.user) {
      fetchSavedScholarships();
    }
  }, [session]);

  // Build query string for API
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (providerType) params.set('providerType', providerType);
    if (state) params.set('state', state);
    if (stream) params.set('stream', stream);
    if (minAmount) params.set('minAmount', minAmount);
    return params.toString();
  }, [q, providerType, state, stream, minAmount]);

  // Load scholarships
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching scholarships:', `/api/scholarships?${queryString}`);
        const res = await fetch(`/api/scholarships?${queryString}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch scholarships');
        const data = await res.json();
        console.log('Received scholarships:', data.items?.length, 'items');
        setItems(data.items || []);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Error fetching scholarships:', e);
          setError('Failed to load scholarships. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [queryString]);

  // Filter scholarships by eligibility
  const filteredItems = useMemo(() => {
    if (!showEligibleOnly || !userProfile) {
      return items;
    }
    return items.filter(scholarship => 
      checkScholarshipEligibility(scholarship, userProfile)
    );
  }, [items, showEligibleOnly, userProfile]);

  // Handle save/unsave scholarship
  const handleSaveScholarship = async (scholarshipId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isSaved = savedScholarships.has(scholarshipId);
    setSavingScholarships(prev => new Set(prev).add(scholarshipId));
    
    try {
      console.log('Saving/unsaving scholarship:', scholarshipId);
      const res = await fetch('/api/user/saved-scholarships', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scholarshipId }),
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Save response:', data);
        setSavedScholarships(prev => {
          const newSet = new Set(prev);
          if (isSaved) {
            newSet.delete(scholarshipId);
          } else {
            newSet.add(scholarshipId);
          }
          return newSet;
        });
      } else {
        const errorData = await res.json();
        console.error('Failed to save/unsave scholarship:', errorData);
      }
    } catch (e) {
      console.error('Error saving scholarship:', e);
    } finally {
      setSavingScholarships(prev => {
        const newSet = new Set(prev);
        newSet.delete(scholarshipId);
        return newSet;
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setQ('');
    setProviderType('');
    setState('');
    setStream('');
    setMinAmount('');
    setShowEligibleOnly(false);
  };

  // Check if any filters are active
  const hasActiveFilters = q || providerType || state || stream || minAmount || showEligibleOnly;
  const activeFiltersCount = [q, providerType, state, stream, minAmount, showEligibleOnly].filter(Boolean).length;

  // Get gradient for scholarship icon based on index
  const getIconGradient = (index) => iconGradients[index % iconGradients.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients.success} text-white shadow-lg`}>
              <AcademicCapIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Explore Scholarships</h1>
              <p className="text-gray-600 mt-1">Find financial support for your education journey</p>
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
                  className="w-full text-black pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Search scholarships by name or description..."
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
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Provider Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Provider Type
                          </label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                            value={providerType}
                            onChange={(e) => setProviderType(e.target.value)}
                          >
                            <option value="">All Providers</option>
                            <option value="College">College</option>
                            <option value="University">University</option>
                            <option value="NGO">NGO</option>
                          </select>
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="e.g., Jammu and Kashmir"
                          />
                        </div>

                        {/* Stream */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stream
                          </label>
                          <input
                            type="text"
                            className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                            value={stream}
                            onChange={(e) => setStream(e.target.value)}
                            placeholder="e.g., Science, Arts"
                          />
                        </div>

                        {/* Minimum Amount */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Amount (₹)
                          </label>
                          <input
                            type="number"
                            className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            placeholder="Min scholarship amount"
                          />
                        </div>
                      </div>

                      {/* Eligibility Filter Toggle */}
                      {userProfile && (
                        <div className="pt-4 border-t border-gray-200">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showEligibleOnly}
                              onChange={(e) => setShowEligibleOnly(e.target.checked)}
                              className="w-4 h-4 text-black text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Show only scholarships I'm eligible for
                            </span>
                          </label>
                        </div>
                      )}
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
            Found <span className="font-semibold text-gray-900">{filteredItems.length}</span> scholarship{filteredItems.length !== 1 ? 's' : ''}
            {showEligibleOnly && ' (eligible for you)'}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Scholarships</h3>
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
        {!loading && !error && filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="text-gray-400 mb-4">
                <AcademicCapIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scholarships Found</h3>
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
        {!loading && !error && filteredItems.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredItems.map((scholarship, index) => {
              const isEligible = userProfile ? checkScholarshipEligibility(scholarship, userProfile) : null;
              const nextDeadline = scholarship.deadlines?.[0]?.endDate 
                ? new Date(scholarship.deadlines[0].endDate) 
                : null;
              const urgency = nextDeadline ? calculateDeadlineUrgency(nextDeadline) : null;

              return (
                <motion.div key={scholarship._id} variants={fadeInUp}>
                  <Card 
                    variant="elevated" 
                    padding="none" 
                    hover 
                    hoverEffect="lift"
                    className="h-full overflow-hidden group relative"
                  >
                    {/* Save button */}
                    <button
                      onClick={(e) => handleSaveScholarship(scholarship._id, e)}
                      disabled={savingScholarships.has(scholarship._id)}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                      title={savedScholarships.has(scholarship._id) ? 'Remove from saved' : 'Save scholarship'}
                    >
                      {savingScholarships.has(scholarship._id) ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-emerald-600" />
                      ) : savedScholarships.has(scholarship._id) ? (
                        <BookmarkSolidIcon className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <BookmarkIcon className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
                      )}
                    </button>

                    {/* Scholarship Icon Header */}
                    <div className={`h-32 bg-gradient-to-br ${getIconGradient(index)} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-5xl font-bold opacity-90">
                          {scholarship.providerType?.slice(0, 2).toUpperCase() || '??'}
                        </div>
                      </div>
                      {/* Urgency Badge */}
                      {urgency && (
                        <div className="absolute top-3 left-3">
                          <Badge 
                            variant={
                              urgency === 'urgent' ? 'solid-danger' : 
                              urgency === 'soon' ? 'solid-warning' : 
                              'solid-primary'
                            }
                            size="sm"
                          >
                            {urgency === 'urgent' && '🔥 Urgent'}
                            {urgency === 'soon' && '⚠️ Soon'}
                            {urgency === 'normal' && 'Open'}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <Link href={`/scholarships/${scholarship._id}`} className="block">
                      {/* Scholarship Content */}
                      <CardContent className="p-5">
                        <CardHeader className="mb-3">
                          <CardTitle className="text-xl line-clamp-2 group-hover:text-emerald-600 transition-colors">
                            {scholarship.name}
                          </CardTitle>
                          {scholarship.description && (
                            <CardDescription className="line-clamp-2 mt-2">
                              {scholarship.description}
                            </CardDescription>
                          )}
                        </CardHeader>

                        {/* Amount and Provider */}
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          {scholarship.benefits?.amount > 0 && (
                            <Badge variant="solid-success" size="sm">
                              <CurrencyRupeeIcon className="h-3 w-3 mr-1 inline" />
                              {scholarship.benefits.amount.toLocaleString()}
                            </Badge>
                          )}
                          {scholarship.providerType && (
                            <Badge variant="primary" size="sm">
                              {scholarship.providerType}
                            </Badge>
                          )}
                          {isEligible !== null && (
                            <Badge variant={isEligible ? 'solid-success' : 'default'} size="sm">
                              {isEligible ? <CheckCircleIcon className="h-3 w-3 mr-1 inline" /> : <XCircleIcon className="h-3 w-3 mr-1 inline" />}
                              {isEligible ? 'Eligible' : 'Not Eligible'}
                            </Badge>
                          )}
                        </div>

                        {/* Deadline */}
                        {nextDeadline && (
                          <div className={`mb-3 p-3 rounded-lg border flex items-center gap-2 ${
                            urgency === 'urgent' 
                              ? 'bg-red-50 border-red-200' 
                              : urgency === 'soon' 
                              ? 'bg-amber-50 border-amber-200' 
                              : 'bg-blue-50 border-blue-200'
                          }`}>
                            <ClockIcon className={`h-4 w-4 ${
                              urgency === 'urgent' 
                                ? 'text-red-600' 
                                : urgency === 'soon' 
                                ? 'text-amber-600' 
                                : 'text-blue-600'
                            }`} />
                            <div className="flex-1">
                              <div className={`text-xs font-medium ${
                                urgency === 'urgent' 
                                  ? 'text-red-700' 
                                  : urgency === 'soon' 
                                  ? 'text-amber-700' 
                                  : 'text-blue-700'
                              }`}>
                                Deadline: {nextDeadline.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Eligibility Info */}
                        {scholarship.eligibility && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-1.5">Eligibility</div>
                            <div className="flex flex-wrap gap-1.5">
                              {scholarship.eligibility.stream && (
                                <Badge variant="secondary" size="sm">
                                  {scholarship.eligibility.stream}
                                </Badge>
                              )}
                              {scholarship.eligibility.minMarks > 0 && (
                                <Badge variant="secondary" size="sm">
                                  Min {scholarship.eligibility.minMarks}%
                                </Badge>
                              )}
                              {scholarship.eligibility.state && (
                                <Badge variant="secondary" size="sm">
                                  {scholarship.eligibility.state}
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
                          className="w-full group-hover:bg-emerald-50 group-hover:border-emerald-600 group-hover:text-emerald-600 transition-colors"
                        >
                          View Details
                        </Button>
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
