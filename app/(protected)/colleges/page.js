'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  BookmarkIcon, 
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeModernIcon,
  BeakerIcon,
  BookOpenIcon,
  WifiIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { gradients } from '@/lib/design-tokens';

// Facility icons mapping
const facilityIcons = {
  hostel: HomeModernIcon,
  lab: BeakerIcon,
  library: BookOpenIcon,
  internet: WifiIcon,
};

// Gradient colors for college icons
const iconGradients = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600',
];

export default function CollegesPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [state, setState] = useState('Jammu and Kashmir');
  const [district, setDistrict] = useState('');
  const [collegeType, setCollegeType] = useState('');
  const [facilities, setFacilities] = useState({ hostel: false, lab: false, library: false, internet: false });
  const [near, setNear] = useState('');
  const [radiusKm, setRadiusKm] = useState('25');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedColleges, setSavedColleges] = useState(new Set());
  const [savingColleges, setSavingColleges] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedSearch = useDebounce(q, 300);

  // Fetch saved colleges on mount
  useEffect(() => {
    const fetchSavedColleges = async () => {
      try {
        const res = await fetch('/api/user/saved-colleges');
        if (res.ok) {
          const data = await res.json();
          setSavedColleges(new Set(data.savedColleges || []));
        }
      } catch (e) {
        console.error('Error fetching saved colleges:', e);
      }
    };
    fetchSavedColleges();
  }, []);

  // Build querystring based on selected filters
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (state) params.set('state', state);
    if (district) params.set('district', district);
    const selectedFacilities = Object.entries(facilities)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(',');
    if (selectedFacilities) params.set('facilities', selectedFacilities);
    if (near) {
      params.set('near', near);
      params.set('radiusKm', radiusKm || '25');
    }
    return params.toString();
  }, [q, state, district, facilities, near, radiusKm]);

  // Fetch colleges whenever filters change (using debounced search)
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query with debounced search
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('q', debouncedSearch);
        if (state) params.set('state', state);
        if (district) params.set('district', district);
        if (collegeType) params.set('type', collegeType);
        const selectedFacilities = Object.entries(facilities)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(',');
        if (selectedFacilities) params.set('facilities', selectedFacilities);
        if (near) {
          params.set('near', near);
          params.set('radiusKm', radiusKm || '25');
        }
        
        console.log('Fetching colleges:', `/api/colleges?${params.toString()}`);
        const res = await fetch(`/api/colleges?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch colleges');
        const data = await res.json();
        console.log('Received colleges:', data.items?.length, 'items');
        setItems(data.items || []);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Error fetching colleges:', e);
          setError('Failed to load colleges. Please try again.');
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [debouncedSearch, state, district, collegeType, facilities, near, radiusKm]);

  // Ask for geolocation and set `near` filter
  const getMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setNear(`${latitude.toFixed(5)},${longitude.toFixed(5)}`);
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setQ('');
    setState('Jammu and Kashmir');
    setDistrict('');
    setCollegeType('');
    setFacilities({ hostel: false, lab: false, library: false, internet: false });
    setNear('');
    setRadiusKm('25');
  };

  // Check if any filters are active
  const hasActiveFilters = q || district || collegeType || Object.values(facilities).some(v => v) || near;
  
  // Active filters count
  const activeFiltersCount = [q, district, collegeType, ...Object.values(facilities).filter(Boolean), near].filter(Boolean).length;
  
  // Get gradient for college icon based on index
  const getIconGradient = (index) => iconGradients[index % iconGradients.length];

  // Handle save/unsave college
  const handleSaveCollege = async (collegeId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isSaved = savedColleges.has(collegeId);
    setSavingColleges(prev => new Set(prev).add(collegeId));
    
    try {
      const res = await fetch('/api/user/saved-colleges', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId }),
      });
      
      if (res.ok) {
        setSavedColleges(prev => {
          const newSet = new Set(prev);
          if (isSaved) {
            newSet.delete(collegeId);
          } else {
            newSet.add(collegeId);
          }
          return newSet;
        });
      } else {
        console.error('Failed to save/unsave college');
      }
    } catch (e) {
      console.error('Error saving college:', e);
    } finally {
      setSavingColleges(prev => {
        const newSet = new Set(prev);
        newSet.delete(collegeId);
        return newSet;
      });
    }
  };

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
              <BuildingLibraryIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Explore Colleges</h1>
              <p className="text-gray-600 mt-1">Find the perfect college in Jammu & Kashmir</p>
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
                  className=" text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent  placeholder-gray-500"
                  placeholder="Search colleges by name or location..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                {q && q !== debouncedSearch && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600" />
                  </div>
                )}
              </div>

              {/* Filter Toggle and Location Button */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
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
                  
                  <Button
                    variant={near ? 'primary' : 'outline'}
                    size="sm"
                    leftIcon={<MapPinIcon className="h-4 w-4" />}
                    onClick={getMyLocation}
                  >
                    {near ? 'Location Active' : 'Near Me'}
                  </Button>
                </div>
                
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

              {/* Location Info */}
              {near && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="success" dot size="sm">
                      Using your location
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span>Radius:</span>
                      <input
                        type="number"
                        className="w-16 border text-black border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={radiusKm}
                        onChange={(e) => setRadiusKm(e.target.value)}
                        min="1"
                        max="500"
                      />
                      <span>km</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setNear('')}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </motion.div>
              )}

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
                      {/* Location Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="State"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            District
                          </label>
                          <input
                            type="text"
                            className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="District"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                          </label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            value={collegeType}
                            onChange={(e) => setCollegeType(e.target.value)}
                          >
                            <option value="">All Types</option>
                            <option value="Government">Government</option>
                            <option value="Private">Private</option>
                          </select>
                        </div>
                      </div>

                      {/* Facility Filters */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facilities
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(facilityIcons).map(([key, Icon]) => (
                            <Button
                              key={key}
                              variant={facilities[key] ? 'primary' : 'outline'}
                              size="sm"
                              leftIcon={<Icon className="h-4 w-4" />}
                              onClick={() => setFacilities((f) => ({ ...f, [key]: !f[key] }))}
                            >
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </Button>
                          ))}
                        </div>
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
            Found <span className="font-semibold text-gray-900">{items.length}</span> college{items.length !== 1 ? 's' : ''}
            {near && <span className="ml-1">(sorted by distance)</span>}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Colleges</h3>
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
                <BuildingLibraryIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Colleges Found</h3>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((college, index) => (
              <motion.div key={college._id} variants={fadeInUp}>
                <Card 
                  variant="elevated" 
                  padding="none" 
                  hover 
                  hoverEffect="lift"
                  className="h-full overflow-hidden group relative"
                >
                  {/* Save button */}
                  <button
                    onClick={(e) => handleSaveCollege(college._id, e)}
                    disabled={savingColleges.has(college._id)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    title={savedColleges.has(college._id) ? 'Remove from saved' : 'Save college'}
                  >
                    {savingColleges.has(college._id) ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600" />
                    ) : savedColleges.has(college._id) ? (
                      <BookmarkSolidIcon className="h-5 w-5 text-blue-600" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                    )}
                  </button>

                  {/* College Icon Header */}
                  <div className={`h-32 bg-gradient-to-br ${getIconGradient(index)} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-5xl font-bold opacity-90">
                        {String(college.name || '?').slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    {/* Type Badge */}
                    {college.type && (
                      <div className="absolute top-3 left-3">
                        <Badge 
                          variant={college.type === 'Government' ? 'solid-success' : 'solid-secondary'}
                          size="sm"
                        >
                          {college.type}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <Link href={`/colleges/${college._id}`} className="block">
                    {/* College Content */}
                    <CardContent className="p-5">
                      <CardHeader className="mb-3">
                        <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {college.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 text-gray-500" />
                          <span>{college.address?.district}, {college.address?.state}</span>
                        </div>
                        {near && college.distance !== undefined && (
                          <div className="text-xs text-blue-600 font-medium mt-1 flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {college.distance < 1 
                              ? `${(college.distance * 1000).toFixed(0)}m away`
                              : `${college.distance.toFixed(1)}km away`
                            }
                          </div>
                        )}
                      </CardHeader>

                      {/* Facilities */}
                      {college.facilities && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(facilityIcons)
                              .filter(([key]) => college.facilities[key])
                              .slice(0, 4)
                              .map(([key, Icon]) => (
                                <Badge key={key} variant="primary" size="sm">
                                  <Icon className="h-3 w-3 mr-1 inline" />
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </Badge>
                              ))}
                            {Object.values(college.facilities).filter(Boolean).length > 4 && (
                              <Badge variant="default" size="sm">
                                +{Object.values(college.facilities).filter(Boolean).length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Additional Info */}
                      {(college.meta?.establishedYear || college.feesRange) && (
                        <div className="text-xs text-gray-500 space-y-1">
                          {college.meta?.establishedYear && (
                            <div>Est. {college.meta.establishedYear}</div>
                          )}
                          {college.feesRange && (
                            <div>Fees: {college.feesRange}</div>
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