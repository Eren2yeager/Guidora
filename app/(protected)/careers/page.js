"use client";
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function Tag({ text }) {
  return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">{text}</span>;
}

export default function CareersPage() {
  // Filters
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const [tag, setTag] = useState('');

  // Data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Build query string for API
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (sector) params.set('sector', sector);
    if (tag) params.set('tag', tag);
    return params.toString();
  }, [q, sector, tag]);

  // Load careers
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/careers?${queryString}`, { signal: controller.signal });
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
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5"
      >
        <h1 className="text-3xl font-bold text-gray-900">Careers</h1>
        <p className="text-gray-600 mt-2">Explore career paths and opportunities.</p>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-5 mb-6"
      >
        <h2 className="text-lg text-black font-semibold mb-4">Filter Careers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                id="search"
                className="w-full border text-black border-gray-300 rounded-lg p-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search careers"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <input
              id="sector"
              className="w-full border text-black border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <input
              id="tag"
              className="w-full border text-black border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center"
          >
            <div className="flex flex-col items-center justify-center">
              <svg className="h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg">No careers found.</p>
              <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
            </div>
          </motion.div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((career) => (
              <motion.li 
                key={career._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Left colorful icon substitute */}
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow">
                    {String(career.title || '?').slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{career.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{career.description || 'No description available'}</p>
                    
                    {career.medianPayBand && (
                      <div className="mt-3 flex items-center">
                        <span className="text-sm text-gray-500">Salary Range:</span>
                        <span className="ml-2 bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm font-medium">
                          {career.medianPayBand.currency} {career.medianPayBand.min.toLocaleString()} - {career.medianPayBand.max.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {career.sectors && career.sectors.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Sectors:</span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {career.sectors.slice(0, 3).map((sector) => (
                            <Tag key={sector} text={sector} />
                          ))}
                          {career.sectors.length > 3 && <span className="text-xs text-gray-500">+{career.sectors.length - 3} more</span>}
                        </div>
                      </div>
                    )}
                    
                    {career.skillsRequired && career.skillsRequired.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Skills:</span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {career.skillsRequired.slice(0, 3).map((skill) => (
                            <Tag key={skill} text={skill} />
                          ))}
                          {career.skillsRequired.length > 3 && <span className="text-xs text-gray-500">+{career.skillsRequired.length - 3} more</span>}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <Link 
                        href={`/careers/${career.slug}`} 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        View details
                        <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}