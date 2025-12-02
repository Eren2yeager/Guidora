"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  AcademicCapIcon, 
  StarIcon, 
  UserGroupIcon, 
  CalendarIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function CounselorsPage() {
  const router = useRouter();
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  
  // Expertise filter options
  const expertiseOptions = [
    "Career Guidance",
    "College Selection",
    "Academic Planning",
    "Study Abroad",
    "Skill Development",
    "Mental Health"
  ];

  useEffect(() => {
    fetchCounselors();
  }, [selectedExpertise]);

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      let url = "/api/counselors";
      if (selectedExpertise) {
        url += `?expertise=${encodeURIComponent(selectedExpertise)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch counselors");
      }
      
      const data = await response.json();
      if (data.success) {
        setCounselors(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch counselors");
      }
    } catch (err) {
      console.error("Error fetching counselors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCounselorClick = (id) => {
    router.push(`/counselors/${id}`);
  };

  // Filter counselors based on search term
  const filteredCounselors = counselors.filter(counselor => 
    counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    counselor.expertise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Connect with Expert Counselors
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get personalized guidance from experienced professionals to help you navigate your educational journey.
        </p>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block text-black w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by name or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
            >
              <option value="">All Expertise</option>
              {expertiseOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Counselors Grid */}
      {loading ? (
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading counselors...</p>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchCounselors}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCounselors.length > 0 ? (
            filteredCounselors.map((counselor) => (
              <motion.div
                key={counselor._id}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition-all hover:shadow-lg"
                onClick={() => handleCounselorClick(counselor._id)}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                      {counselor.profilePicture ? (
                        <img 
                          src={counselor.profilePicture} 
                          alt={counselor.name}
                          className="h-12 w-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-white text-lg font-semibold">
                          {counselor.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{counselor.name}</h3>
                      <p className="text-sm text-blue-600">{counselor.expertise}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {counselor.bio || "Experienced counselor ready to help you with your educational journey."}
                  </p>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center text-amber-500">
                        <StarIcon className="h-4 w-4 mr-1" />
                        <span>{counselor.averageRating || "New"}</span>
                        {counselor.totalRatings > 0 && (
                          <span className="text-gray-500 ml-1">({counselor.totalRatings})</span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        <span>{counselor.sessionCount || 0} sessions</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{counselor.availability || "Available"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No counselors found</h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}