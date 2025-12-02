"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, ClockIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function BookedSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/counselors/booking");
        
        if (!response.ok) {
          throw new Error("Failed to fetch booked sessions");
        }
        
        const data = await response.json();
        
        if (data.success) {
          setSessions(data.data);
        } else {
          throw new Error(data.error || "Failed to fetch booked sessions");
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-md overflow-hidden p-6 text-center"
      >
        <div className="mb-4">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Booked Sessions</h3>
        <p className="text-gray-600">
          You haven't booked any counseling sessions yet. Browse our counselors and book a session to get started.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Booked Sessions</h2>
        <div className="space-y-4">
          {sessions.map((session) => (
            <motion.div
              key={session._id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {session.counselor.profileImage ? (
                    <img
                      src={session.counselor.profileImage}
                      alt={session.counselor.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-800 font-medium">
                        {session.counselor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Session with {session.counselor.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">Topic: {session.topic}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{session.time}</span>
                    </div>
                  </div>
                  {session.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                      <p className="font-medium mb-1">Your message:</p>
                      <p>{session.message}</p>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.status === "completed" 
                      ? "bg-green-100 text-green-800" 
                      : session.status === "cancelled" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {session.status === "completed" 
                      ? "Completed" 
                      : session.status === "cancelled" 
                      ? "Cancelled" 
                      : "Upcoming"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}