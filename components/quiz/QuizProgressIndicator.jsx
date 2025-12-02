'use client';

import { motion } from 'framer-motion';
import { calculateQuizProgress } from '@/lib/utils';

/**
 * QuizProgressIndicator Component
 * Displays quiz progress with animated progress bar and question counter
 * 
 * @param {number} answered - Number of questions answered
 * @param {number} total - Total number of questions
 * @param {string} variant - Visual variant ('default' | 'compact' | 'detailed')
 * @param {string} color - Color theme ('blue' | 'purple' | 'pink' | 'emerald' | 'amber')
 * @param {boolean} showPercentage - Whether to show percentage
 * @param {boolean} animated - Whether to animate the progress bar
 */
export default function QuizProgressIndicator({
  answered = 0,
  total = 0,
  variant = 'default',
  color = 'blue',
  showPercentage = true,
  animated = true,
}) {
  const progress = calculateQuizProgress(answered, total);
  
  // Color configurations
  const colorClasses = {
    blue: {
      bg: 'bg-blue-600',
      text: 'text-blue-600',
      lightBg: 'bg-blue-100',
      gradient: 'from-blue-500 to-indigo-600',
    },
    purple: {
      bg: 'bg-purple-600',
      text: 'text-purple-600',
      lightBg: 'bg-purple-100',
      gradient: 'from-purple-500 to-indigo-600',
    },
    pink: {
      bg: 'bg-rose-600',
      text: 'text-rose-600',
      lightBg: 'bg-rose-100',
      gradient: 'from-pink-500 to-rose-600',
    },
    emerald: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-600',
      lightBg: 'bg-emerald-100',
      gradient: 'from-emerald-500 to-teal-600',
    },
    amber: {
      bg: 'bg-amber-600',
      text: 'text-amber-600',
      lightBg: 'bg-amber-100',
      gradient: 'from-amber-500 to-orange-600',
    },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;
  
  // Compact variant - minimal display
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
            initial={animated ? { width: 0 } : { width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
          {answered}/{total}
        </span>
      </div>
    );
  }
  
  // Detailed variant - with labels and percentage
  if (variant === 'detailed') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Quiz Progress</span>
            {progress === 100 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                Complete
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {showPercentage && (
              <span className={`text-lg font-bold ${colors.text}`}>
                {progress}%
              </span>
            )}
            <span className="text-sm font-medium text-gray-500">
              {answered} of {total} questions
            </span>
          </div>
        </div>
        
        <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.gradient} rounded-full shadow-sm`}
            initial={animated ? { width: 0 } : { width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {/* Shimmer effect */}
          {animated && progress < 100 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
            />
          )}
        </div>
        
        {progress < 100 && (
          <p className="text-xs text-gray-500">
            {total - answered} question{total - answered !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>
    );
  }
  
  // Default variant - standard display
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Question {answered} of {total}
        </span>
        {showPercentage && (
          <span className={`text-sm font-semibold ${colors.text}`}>
            {progress}%
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
          initial={animated ? { width: 0 } : { width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
