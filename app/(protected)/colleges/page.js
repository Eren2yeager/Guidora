"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Enhanced pill component for filter toggles
function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        `px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 flex items-center ` +
        (active
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400')
      }
    >
      {active && (
        <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

export default function CollegesPage() {
  // Query state
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [state, setState] = useState('Jammu and Kashmir');
  const [district, setDistrict] = useState('');
  const [facilities, setFacilities] = useState({ hostel: false, lab: false, library: false, internet: false });
  const [near, setNear] = useState(""); // "lat,lng" string if set
  const [radiusKm, setRadiusKm] = useState('25');
  const [loading, setLoading] = useState(false);

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

  // Fetch colleges whenever filters change
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/colleges?${queryString}` , { signal: controller.signal });
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

  // Ask for geolocation and set `near` filter
  const getMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setNear(`${latitude.toFixed(5)},${longitude.toFixed(5)}`);
    });
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page header with clear contrast on gradient background from SecureLayout */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">Explore Colleges</h1>
        <p className="text-lg text-gray-600 mt-2">Browse colleges in Jammu & Kashmir with filters and near‑me search.</p>
      </motion.div>

      {/* Filters card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Colleges</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Keyword search */}
          <div className="space-y-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                id="search"
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name or location"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* State (preselected) */}
          <div className="space-y-2">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
            <input
              id="state"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          
          {/* District */}
          <div className="space-y-2">
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">District</label>
            <input
              id="district"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>
        </div>

        {/* Facility toggles */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Facilities</h3>
          <div className="flex flex-wrap items-center gap-2">
            {(['hostel','lab','library','internet']).map((key) => (
              <Pill
                key={key}
                active={facilities[key]}
                onClick={() => setFacilities((f) => ({ ...f, [key]: !f[key] }))}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Pill>
            ))}
          </div>
        </div>

        {/* Near me controls */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={getMyLocation}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${near ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Near me
            </button>
            
            {near && (
              <div className="flex items-center gap-2">
                <div className="w-32">
                  <input
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Radius km"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Using: {near}</span>
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={() => setNear("")}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Results grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : items.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="col-span-full bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center"
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-gray-700 text-lg font-medium mt-4 mb-1">No colleges found</div>
            <div className="text-gray-500">Try adjusting your filters or search criteria</div>
          </motion.div>
        ) : (
          items.map((c, index) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <Link href={`/colleges/${c._id}`} className="block">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {String(c.name || '?').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{c.name}</h3>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {c.address?.district}, {c.address?.state}
                      </div>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {['hostel','lab','library','internet'].filter((k) => c.facilities?.[k]).map((k) => (
                        <span
                          key={k}
                          className="inline-flex items-center bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                          {k.charAt(0).toUpperCase() + k.slice(1)}
                        </span>
                      ))}
                      {(!c.facilities || !(['hostel','lab','library','internet'].some((k) => c.facilities[k]))) && (
                        <span className="text-xs text-gray-500">No facilities listed</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <span className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
                      View details
                      <svg className="inline-block ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}