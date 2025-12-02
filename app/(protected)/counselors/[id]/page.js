"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
// import img from "next/img";
import { motion } from "framer-motion";
import {
  StarIcon,
  CalendarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import BookingForm from "@/components/counselors/BookingForm";

export default function CounselorDetailPage() {
  const { id } = useParams();
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchCounselor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/counselors/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch counselor details");
        }

        const data = await response.json();

        if (data.success) {
          setCounselor(data.data);
        } else {
          throw new Error(data.error || "Failed to fetch counselor details");
        }
      } catch (err) {
        console.error("Error fetching counselor:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCounselor();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2">Counselor Not Found</h3>
          <p>
            The counselor you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl overflow-hidden shadow-lg mb-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0 p-6 md:p-8 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-white shadow-md"
              >
                <img
                  src={
                    counselor.profileimg ||
                    "https://via.placeholder.com/200?text=Counselor"
                  }
                  alt={counselor.name}
                  className="object-cover"
                />
              </motion.div>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {counselor.name}
                </h1>
                <p className="text-lg text-gray-600 mb-4">{counselor.title}</p>

                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(counselor.averageRating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {counselor.averageRating?.toFixed(1) || "New"} (
                    {counselor.totalReviews || 0} reviews)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {counselor.interestTags?.map((tag) => (
                    <span
                      key={tag._id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBookingForm(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Book a Session
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="md:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {counselor.bio}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Expertise
                </h2>
                <div className="space-y-4">
                  {counselor.expertise?.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <AcademicCapIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {counselor.reviews && counselor.reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Reviews
                  </h2>
                  <div className="space-y-6">
                    {counselor.reviews.map((review) => (
                      <div
                        key={review._id}
                        className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="md:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Experience
                </h2>
                <div className="space-y-4">
                  {counselor.experience?.map((exp, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <BriefcaseIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-base font-medium text-gray-900">
                          {exp.position}
                        </h3>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Education
                </h2>
                <div className="space-y-4">
                  {counselor.education?.map((edu, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-base font-medium text-gray-900">
                          {edu.degree}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {edu.institution}
                        </p>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Availability
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-700">
                      {counselor.availability?.days?.join(", ") || "Weekdays"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {counselor.availability?.hours || "9:00 AM - 5:00 PM"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Booking Form Modal */}
        {showBookingForm && (
          <BookingForm
            counselor={counselor}
            isOpen={showBookingForm}
            onClose={() => setShowBookingForm(false)}
          />
        )}
      </motion.div>
    </>
  );
}
