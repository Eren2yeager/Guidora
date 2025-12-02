"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

// Available time slots
const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", 
  "03:00 PM", "04:00 PM", "05:00 PM"
];

// Topic options
const topicOptions = [
  "Career Guidance",
  "College Selection",
  "Academic Planning",
  "Study Abroad",
  "Skill Development",
  "Mental Health",
  "Other"
];

export default function BookingForm({ counselor, isOpen, onClose }) {
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    topic: "",
    message: ""
  });
  
  const [bookingStatus, setBookingStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!bookingData.date || !bookingData.time || !bookingData.topic) {
      setBookingStatus({
        loading: false,
        success: false,
        error: "Please fill all required fields"
      });
      return;
    }
    
    setBookingStatus({
      loading: true,
      success: false,
      error: null
    });
    
    try {
      const response = await fetch("/api/counselors/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          counselorId: counselor._id,
          ...bookingData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookingStatus({
          loading: false,
          success: true,
          error: null
        });
        
        // Reset form after successful booking
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to book session");
      }
    } catch (err) {
      console.error("Error booking session:", err);
      setBookingStatus({
        loading: false,
        success: false,
        error: err.message
      });
    }
  };

  const resetForm = () => {
    onClose();
    setBookingData({
      date: "",
      time: "",
      topic: "",
      message: ""
    });
    setBookingStatus({
      loading: false,
      success: false,
      error: null
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {bookingStatus.success ? (
            <div className="p-6 text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Successful!</h3>
              <p className="text-gray-600 mb-6">
                Your session with {counselor.name} has been booked successfully. You can view your upcoming sessions in your dashboard.
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={resetForm}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Book a Session with {counselor.name}</h3>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleBookSession} className="p-6">
                {bookingStatus.error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                    {bookingStatus.error}
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="date">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="time">
                    Time *
                  </label>
                  <select
                    id="time"
                    name="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bookingData.time}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="topic">
                    Topic *
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bookingData.topic}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a topic</option>
                    {topicOptions.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="message">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Share any specific questions or concerns you'd like to discuss..."
                    value={bookingData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors mr-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    disabled={bookingStatus.loading}
                  >
                    {bookingStatus.loading ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></span>
                        Booking...
                      </>
                    ) : (
                      <>
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        Book Session
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}