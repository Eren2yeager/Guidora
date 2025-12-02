/**
 * Utility Functions for Guidora Platform
 * Core business logic and helper functions
 */

// ============================================
// PROFILE UTILITIES
// ============================================

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-notation path (e.g., 'academicBackground.stream')
 * @returns {*} - Value at path or undefined
 */
export function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/**
 * Calculate profile completion percentage
 * @param {Object} profile - User profile object
 * @returns {number} - Completion percentage (0-100)
 */
export function calculateProfileCompletion(profile) {
  if (!profile) return 0;
  
  const requiredFields = [
    'name',
    'email',
    'phone',
    'location.state',
    'location.district',
    'academics.twelfth.score',
    'interests',
  ];
  
  const completedFields = requiredFields.filter((field) => {
    const value = getNestedValue(profile, field);
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });
  
  return Math.round((completedFields.length / requiredFields.length) * 100);
}

/**
 * Get list of missing profile fields
 * @param {Object} profile - User profile object
 * @returns {Array<{field: string, label: string}>} - Array of missing fields
 */
export function getMissingProfileFields(profile) {
  const fieldLabels = {
    'name': 'Full Name',
    'email': 'Email Address',
    'phone': 'Phone Number',
    'academicBackground.currentClass': 'Current Class',
    'academicBackground.stream': 'Stream',
    'location.state': 'State',
    'location.district': 'District',
    'interests': 'Interests',
  };
  
  return Object.entries(fieldLabels)
    .filter(([field]) => {
      const value = getNestedValue(profile, field);
      if (value === undefined || value === null || value === '') return true;
      if (Array.isArray(value)) return value.length === 0;
      return false;
    })
    .map(([field, label]) => ({ field, label }));
}

// ============================================
// QUIZ UTILITIES
// ============================================

/**
 * Calculate quiz progress percentage
 * @param {number} answered - Number of questions answered
 * @param {number} total - Total number of questions
 * @returns {number} - Progress percentage (0-100)
 */
export function calculateQuizProgress(answered, total) {
  if (total === 0 || total === undefined || total === null) return 0;
  if (answered < 0) answered = 0;
  if (answered > total) answered = total;
  return Math.round((answered / total) * 100);
}

/**
 * Calculate quiz scores from answers
 * @param {Array} answers - Array of answer objects with tags and weights
 * @returns {Object} - Scores by category/tag
 */
export function calculateQuizScores(answers) {
  if (!Array.isArray(answers)) return {};
  
  const scores = {};
  
  answers.forEach((answer) => {
    const tags = answer.tags || [];
    const weight = answer.weight || 1;
    
    tags.forEach((tag) => {
      scores[tag] = (scores[tag] || 0) + weight;
    });
  });
  
  return scores;
}

// ============================================
// DATE & DEADLINE UTILITIES
// ============================================

/**
 * Calculate deadline urgency level
 * @param {Date|string} deadline - Deadline date
 * @param {Date} now - Current date (defaults to now)
 * @returns {'urgent' | 'soon' | 'normal'} - Urgency level
 */
export function calculateDeadlineUrgency(deadline, now = new Date()) {
  const deadlineDate = new Date(deadline);
  const currentDate = new Date(now);
  
  // Reset time to compare dates only
  deadlineDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);
  
  const diffMs = deadlineDate - currentDate;
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (daysUntil <= 3) return 'urgent';
  if (daysUntil <= 7) return 'soon';
  return 'normal';
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-IN', { ...defaultOptions, ...options });
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 * @param {Date|string} date - Date to compare
 * @param {Date} now - Current date (defaults to now)
 * @returns {string} - Relative time string
 */
export function getRelativeTime(date, now = new Date()) {
  const targetDate = new Date(date);
  const currentDate = new Date(now);
  const diffMs = targetDate - currentDate;
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (Math.abs(diffMins) < 1) return 'Just now';
  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins} min` : `${Math.abs(diffMins)} min ago`;
  }
  if (Math.abs(diffHrs) < 24) {
    return diffHrs > 0 ? `in ${diffHrs} hr` : `${Math.abs(diffHrs)} hr ago`;
  }
  if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
  }
  return formatDate(date);
}

// ============================================
// COLLEGE UTILITIES
// ============================================

/**
 * Calculate Haversine distance between two coordinates
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} - Distance in kilometers
 */
export function calculateHaversineDistance(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
    return Infinity;
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Filter colleges by criteria
 * @param {Array} colleges - Array of college objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered colleges
 */
export function filterColleges(colleges, filters = {}) {
  if (!Array.isArray(colleges)) return [];
  
  return colleges.filter((college) => {
    // State filter
    if (filters.state && college.address?.state !== filters.state) {
      return false;
    }
    
    // District filter
    if (filters.district && college.address?.district !== filters.district) {
      return false;
    }
    
    // Facilities filter (comma-separated string)
    if (filters.facilities) {
      const required = filters.facilities.split(',').map(f => f.trim()).filter(Boolean);
      if (!required.every((f) => college.facilities?.[f])) {
        return false;
      }
    }
    
    // Search query filter
    if (filters.q) {
      const query = filters.q.toLowerCase().trim();
      const searchable = `${college.name || ''} ${college.address?.district || ''} ${college.address?.city || ''}`.toLowerCase();
      if (!searchable.includes(query)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Sort colleges by distance from coordinates
 * @param {Array} colleges - Array of college objects with location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} maxRadius - Maximum radius in km (optional)
 * @returns {Array} - Sorted colleges with distance property
 */
export function sortByDistance(colleges, lat, lng, maxRadius = Infinity) {
  if (!Array.isArray(colleges)) return [];
  
  return colleges
    .map((college) => {
      const collegeLat = college.location?.coordinates?.[1];
      const collegeLng = college.location?.coordinates?.[0];
      const distance = calculateHaversineDistance(lat, lng, collegeLat, collegeLng);
      return { ...college, distance };
    })
    .filter((college) => college.distance <= maxRadius)
    .sort((a, b) => a.distance - b.distance);
}

// ============================================
// SCHOLARSHIP UTILITIES
// ============================================

/**
 * Check scholarship eligibility based on user profile
 * @param {Object} scholarship - Scholarship object with eligibility criteria
 * @param {Object} profile - User profile
 * @returns {boolean} - Whether user is eligible
 */
export function checkScholarshipEligibility(scholarship, profile) {
  if (!scholarship?.eligibility || !profile) return true;
  
  const criteria = scholarship.eligibility;
  
  // Check minimum marks (supports both minMarks and minPercentage)
  if (criteria.minMarks != null) {
    const userMarks = profile.academics?.twelfth?.score || profile.academicBackground?.percentage;
    if (userMarks == null || userMarks < criteria.minMarks) {
      return false;
    }
  }
  
  if (criteria.minPercentage != null) {
    const userPercentage = profile.academicBackground?.percentage;
    if (userPercentage == null || userPercentage < criteria.minPercentage) {
      return false;
    }
  }
  
  // Check allowed streams
  if (criteria.streams?.length > 0) {
    const userStream = profile.academicBackground?.stream;
    if (!userStream || !criteria.streams.includes(userStream)) {
      return false;
    }
  }
  
  // Check allowed states
  if (criteria.states?.length > 0) {
    const userState = profile.location?.state;
    if (!userState || !criteria.states.includes(userState)) {
      return false;
    }
  }
  
  // Check class/grade level
  if (criteria.classes?.length > 0) {
    const userClass = profile.academicBackground?.currentClass;
    if (!userClass || !criteria.classes.includes(userClass)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Filter scholarships by eligibility
 * @param {Array} scholarships - Array of scholarship objects
 * @param {Object} profile - User profile
 * @returns {Array} - Filtered scholarships with eligibility status
 */
export function filterScholarshipsByEligibility(scholarships, profile) {
  if (!Array.isArray(scholarships)) return [];
  
  return scholarships.map((scholarship) => ({
    ...scholarship,
    isEligible: checkScholarshipEligibility(scholarship, profile),
  }));
}

// ============================================
// TIMELINE UTILITIES
// ============================================

/**
 * Sort timeline events by date
 * @param {Array} events - Array of event objects with date field
 * @returns {Array} - Sorted events in ascending order
 */
export function sortTimelineEvents(events) {
  if (!Array.isArray(events)) return [];
  
  return [...events].sort((a, b) => {
    const dateA = new Date(a.startDate || a.date);
    const dateB = new Date(b.startDate || b.date);
    return dateA - dateB;
  });
}

/**
 * Group timeline events by month
 * @param {Array} events - Array of event objects with date field
 * @returns {Object} - Events grouped by month key (YYYY-MM)
 */
export function groupEventsByMonth(events) {
  if (!Array.isArray(events)) return {};
  
  return events.reduce((groups, event) => {
    const date = new Date(event.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
    return groups;
  }, {});
}

// ============================================
// STATISTICS UTILITIES
// ============================================

/**
 * Calculate platform statistics
 * @param {Object} data - Object containing arrays of colleges, courses, scholarships
 * @returns {Object} - Statistics object with counts
 */
export function calculateStatistics(data) {
  return {
    collegeCount: Array.isArray(data?.colleges) ? data.colleges.length : 0,
    courseCount: Array.isArray(data?.courses) ? data.courses.length : 0,
    scholarshipCount: Array.isArray(data?.scholarships) ? data.scholarships.length : 0,
    careerCount: Array.isArray(data?.careers) ? data.careers.length : 0,
  };
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials (max 2 characters)
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Slugify a string
 * @param {string} text - Text to slugify
 * @returns {string} - URL-safe slug
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================
// CLASS NAME UTILITIES
// ============================================

/**
 * Conditionally join class names
 * @param {...(string|Object|Array)} args - Class names or conditional objects
 * @returns {string} - Joined class names
 */
export function cn(...args) {
  return args
    .flat()
    .filter(Boolean)
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object') {
        return Object.entries(arg)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

// Export all utilities
const utils = {
  getNestedValue,
  calculateProfileCompletion,
  getMissingProfileFields,
  calculateQuizProgress,
  calculateQuizScores,
  calculateDeadlineUrgency,
  formatDate,
  getRelativeTime,
  calculateHaversineDistance,
  filterColleges,
  sortByDistance,
  checkScholarshipEligibility,
  filterScholarshipsByEligibility,
  sortTimelineEvents,
  groupEventsByMonth,
  calculateStatistics,
  truncateText,
  getInitials,
  slugify,
  cn,
};

export default utils;
