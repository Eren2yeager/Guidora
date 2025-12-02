"use client";

import { motion } from "framer-motion";
import BookedSessions from "@/components/counselors/BookedSessions";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function CounselingDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="mr-4">
            <ArrowLeftIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Your Counseling Sessions</h1>
        </div>
        
        <div className="mb-8">
          <BookedSessions />
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Need More Guidance?</h2>
          <p className="text-gray-700 mb-4">
            Our counselors are here to help you navigate your educational journey. Book a session with one of our experts today.
          </p>
          <Link href="/counselors">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Counselors
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}