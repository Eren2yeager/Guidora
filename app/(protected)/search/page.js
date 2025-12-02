'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  BookOpenIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const typeFilters = [
  { id: 'all', name: 'All Results', icon: MagnifyingGlassIcon },
  { id: 'courses', name: 'Courses', icon: BookOpenIcon },
  { id: 'careers', name: 'Careers', icon: BriefcaseIcon },
  { id: 'programs', name: 'Programs', icon: AcademicCapIcon },
  { id: 'colleges', name: 'Colleges', icon: BuildingLibraryIcon },
  { id: 'scholarships', name: 'Scholarships', icon: BanknotesIcon },
];

const typeColors = {
  Course: 'blue',
  Career: 'purple',
  Program: 'indigo',
  College: 'emerald',
  Scholarship: 'amber',
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Perform search
  const performSearch = async (query, type = 'all') => {
    if (!query || query.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ q: query.trim() });
      if (type !== 'all') params.set('type', type);
      
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search on mount and when query changes
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery, activeFilter);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    if (searchQuery.trim()) {
      performSearch(searchQuery, filterId);
    }
  };

  // Get filtered results for display
  const getFilteredResults = () => {
    if (!searchResults) return [];
    
    if (activeFilter === 'all') {
      return [
        ...searchResults.results.courses,
        ...searchResults.results.careers,
        ...searchResults.results.programs,
        ...searchResults.results.colleges,
        ...searchResults.results.scholarships,
      ];
    }
    
    return searchResults.results[activeFilter] || [];
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
              <MagnifyingGlassIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Search Results</h1>
              <p className="text-gray-600 mt-1">Find courses, careers, programs and more</p>
            </div>
          </div>

          {/* Search Form */}
          <Card variant="elevated" padding="md">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, careers, programs, colleges..."
                  className="w-full px-4 py-3 border  text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button type="submit" className={"bg-blue-700"} variant="solid" size="lg">
                {/* <MagnifyingGlassIcon className="h-5 w-5 mr-2" /> */}
                Search
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Results Stats */}
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="text-sm text-gray-600">
              Found <span className="font-semibold text-gray-900">{searchResults.stats.total}</span> results for 
              <span className="font-semibold text-blue-600"> &quot;{searchResults.query}&quot;</span>
            </div>
          </motion.div>
        )}

        {/* Filter Tabs */}
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card variant="elevated" padding="sm">
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeFilter === filter.id;
                  const count = filter.id === 'all' 
                    ? searchResults.stats.total 
                    : searchResults.stats[filter.id] || 0;
                  
                  return (
                    <button
                      key={filter.id}
                      onClick={() => handleFilterChange(filter.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{filter.name}</span>
                      <Badge variant={isActive ? 'solid-white' : 'default'} size="sm">
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
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

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="text-red-500 mb-4">
                <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Failed</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => performSearch(searchQuery, activeFilter)}>
                Try Again
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && searchResults && filteredResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="elevated" padding="lg" className="text-center">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-4">
                No {activeFilter === 'all' ? 'results' : activeFilter} found for &quot;{searchResults.query}&quot;
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setActiveFilter('all')}
                >
                  Show All Results
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults(null);
                  }}
                >
                  Clear Search
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Results Grid */}
        {!loading && !error && filteredResults.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredResults.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item._id}`}
                  variants={fadeInUp}
                  layout
                >
                  <Card
                    variant="elevated"
                    padding="md"
                    hover
                    hoverEffect="lift"
                    className="h-full cursor-pointer"
                    onClick={() => router.push(item.link)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <Badge 
                          variant={`outline-${typeColors[item.type]}`} 
                          size="sm"
                        >
                          {item.type}
                        </Badge>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                          {item.name || item.title}
                        </h3>
                        
                        {item.code && (
                          <p className="text-xs text-gray-500 mb-2 font-mono">{item.code}</p>
                        )}

                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {item.description}
                          </p>
                        )}

                        {/* Type-specific info */}
                        {item.type === 'Program' && item.collegeId && (
                          <p className="text-sm text-gray-600 mb-2">
                            <BuildingLibraryIcon className="h-4 w-4 inline mr-1" />
                            {item.collegeId.name}
                          </p>
                        )}

                        {item.type === 'Course' && item.stream && (
                          <p className="text-sm text-gray-600 mb-2">
                            Stream: {item.stream.name}
                          </p>
                        )}

                        {item.type === 'Scholarship' && item.amount && (
                          <p className="text-sm font-semibold text-emerald-600 mb-2">
                            ₹{item.amount.toLocaleString()}
                          </p>
                        )}

                        {item.type === 'College' && item.address && (
                          <p className="text-sm text-gray-600 mb-2">
                            {item.address.city}, {item.address.state}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Initial State */}
        {!loading && !error && !searchResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="elevated" padding="lg" className="text-center">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Search</h3>
              <p className="text-gray-600 mb-4">
                Enter a search term to find courses, careers, programs, colleges, and more.
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
