"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from 'next-auth/react';
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCalendarAlt, FaRupeeSign, FaUniversity, FaBook, FaTag } from "react-icons/fa";
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

// Program detail page component
export default function ProgramDetail() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);

  // Fetch program data
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await fetch(`/api/programs/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch program details');
        }
        const data = await res.json();
        setProgram(data);
        setIsSaved(data.isSaved || false);
      } catch (err) {
        console.error('Error fetching program:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProgram();
    }
  }, [id]);

  // Handle save/unsave
  const handleSaveToggle = async () => {
    if (!session) {
      toast.error('Please sign in to save programs');
      return;
    }

    setSavingState(true);
    try {
      const res = await fetch('/api/user/saved-programs', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: program._id }),
      });

      if (!res.ok) throw new Error('Failed to update saved status');

      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Program removed from saved items' : 'Program saved successfully');
    } catch (err) {
      console.error('Error toggling save:', err);
      toast.error('Failed to update saved status');
    } finally {
      setSavingState(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link href="/programs">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md transition duration-300">
              Back to Programs
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // No program found
  if (!program) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Program Not Found</h2>
          <p className="text-gray-700 mb-6">The program you're looking for doesn't exist or has been removed.</p>
          <Link href="/programs">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md transition duration-300">
              Back to Programs
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link href="/programs" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
        <FaArrowLeft className="mr-2" />
        <span>Back to Programs</span>
      </Link>

      {/* Program header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md overflow-hidden mb-8"
      >
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
          {program.media?.bannerUrl && (
            <img 
              src={program.media.bannerUrl} 
              alt={program.name} 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end justify-between">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{program.name}</h1>
              <p className="text-white text-opacity-90">{program.code}</p>
            </div>
            {/* Save Button */}
            <div className="p-6">
              <button
                onClick={handleSaveToggle}
                disabled={savingState}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isSaved 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isSaved ? (
                  <BookmarkSolidIcon className="h-5 w-5" />
                ) : (
                  <BookmarkIcon className="h-5 w-5" />
                )}
                <span>{savingState ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <FaUniversity className="mr-2 text-blue-500" />
              <span>College: {program.collegeId?.name || "Not specified"}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaBook className="mr-2 text-blue-500" />
              <span>Course: {program.courseId?.name || "Not specified"}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              <span>Duration: {program.durationYears} years</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Program details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="md:col-span-2">
          {/* Subjects section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Subjects</h2>
            {program.subjects && program.subjects.length > 0 ? (
              <div className="space-y-6">
                {program.subjects.map((semesterData, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-medium text-gray-700 mb-2">Semester {semesterData.semester}</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {semesterData.subjects.map((subject, subIndex) => (
                        <li key={subIndex}>{subject}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No subject information available</p>
            )}
          </motion.div>

          {/* Eligibility section */}
          {program.eligibilityOverrides && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 mb-8"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Eligibility</h2>
              <div className="space-y-4">
                {program.eligibilityOverrides.minMarks && (
                  <div>
                    <h3 className="font-medium text-gray-700">Minimum Marks Required</h3>
                    <p className="text-gray-600">{program.eligibilityOverrides.minMarks}%</p>
                  </div>
                )}
                
                {program.eligibilityOverrides.requiredSubjects && 
                 program.eligibilityOverrides.requiredSubjects.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700">Required Subjects</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {program.eligibilityOverrides.requiredSubjects.map((subject, index) => (
                        <li key={index}>{subject.name || "Subject information not available"}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right column */}
        <div>
          {/* Fees section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Fees</h2>
            {program.fees ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tuition (per year)</span>
                  <span className="font-medium text-gray-800">
                    <FaRupeeSign className="inline mr-1" />
                    {program.fees.tuitionPerYear.toLocaleString()} {program.fees.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hostel (per year)</span>
                  <span className="font-medium text-gray-800">
                    <FaRupeeSign className="inline mr-1" />
                    {program.fees.hostelPerYear.toLocaleString()} {program.fees.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Miscellaneous</span>
                  <span className="font-medium text-gray-800">
                    <FaRupeeSign className="inline mr-1" />
                    {program.fees.misc.toLocaleString()} {program.fees.currency}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-700">Total (per year)</span>
                    <span className="text-blue-600">
                      <FaRupeeSign className="inline mr-1" />
                      {(program.fees.tuitionPerYear + program.fees.hostelPerYear + program.fees.misc).toLocaleString()} {program.fees.currency}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Fee information not available</p>
            )}
          </motion.div>

          {/* Intake & Seats section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Admission Details</h2>
            <div className="space-y-4">
              {program.intakeMonths && program.intakeMonths.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700">Intake Months</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {program.intakeMonths.map((month, index) => {
                      const monthNames = ["January", "February", "March", "April", "May", "June", 
                                         "July", "August", "September", "October", "November", "December"];
                      return (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {monthNames[month - 1]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {program.seats > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700">Available Seats</h3>
                  <p className="text-gray-600">{program.seats}</p>
                </div>
              )}
              
              {program.cutoff && (
                <div>
                  <h3 className="font-medium text-gray-700">Cutoff</h3>
                  {program.cutoff.lastYear > 0 && (
                    <p className="text-gray-600">Last Year: {program.cutoff.lastYear}%</p>
                  )}
                  
                  {program.cutoff.categoryWise && program.cutoff.categoryWise.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Category-wise Cutoffs</h4>
                      <div className="space-y-1">
                        {program.cutoff.categoryWise.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600">{item.category}</span>
                            <span className="text-gray-800">{item.cutoff}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Interest Tags */}
          {program.interestTags && program.interestTags.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Related Interests</h2>
              <div className="flex flex-wrap gap-2">
                {program.interestTags.map((tag, index) => (
                  <div key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
                    <FaTag className="mr-1 text-xs" />
                    <span>{tag.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Apply button */}
      <div className="mt-8 text-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
          Apply for this Program
        </button>
      </div>
    </div>
  );
}