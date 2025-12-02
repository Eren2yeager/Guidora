/**
 * Framer Motion Animation Variants for Guidora Platform
 * Reusable animation presets for consistent motion design
 */

// ============================================
// FADE ANIMATIONS
// ============================================

// Fade in from bottom (most common)
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Fade in from top
export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// Simple fade
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Fade with scale
export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// ============================================
// SLIDE ANIMATIONS
// ============================================

// Slide in from left
export const slideInLeft = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

// Slide in from right
export const slideInRight = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

// Slide in from left (full width - for sidebars/drawers)
export const slideInLeftFull = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

// Slide in from right (full width)
export const slideInRightFull = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

// ============================================
// STAGGER CONTAINERS
// ============================================

// Container for staggered children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Faster stagger for lists
export const staggerContainerFast = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Slower stagger for hero sections
export const staggerContainerSlow = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// Stagger with delay
export const staggerContainerDelayed = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

// ============================================
// HOVER & TAP ANIMATIONS
// ============================================

// Scale on hover (for cards)
export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

// Subtle scale on hover
export const scaleOnHoverSubtle = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.99 },
};

// Lift on hover (scale + shadow effect via y)
export const liftOnHover = {
  whileHover: { y: -4, scale: 1.01 },
  whileTap: { y: 0, scale: 0.99 },
};

// Button press effect
export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.95 },
};

// Icon hover rotation
export const rotateOnHover = {
  whileHover: { rotate: 15 },
  whileTap: { rotate: 0 },
};

// ============================================
// PAGE TRANSITIONS
// ============================================

// Default page transition
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// Page transition with slide
export const pageTransitionSlide = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 },
};

// ============================================
// MODAL & OVERLAY ANIMATIONS
// ============================================

// Modal backdrop
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// Modal content
export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

// Dropdown menu
export const dropdownMenu = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
  transition: { duration: 0.15 },
};

// ============================================
// SKELETON & LOADING ANIMATIONS
// ============================================

// Pulse animation for skeletons
export const skeletonPulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Shimmer effect (use with gradient background)
export const skeletonShimmer = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Spinner rotation
export const spinnerRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================
// SPECIAL EFFECTS
// ============================================

// Bounce in
export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  exit: { opacity: 0, scale: 0.3 },
};

// Spring pop
export const springPop = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

// Attention shake
export const shake = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

// Success checkmark
export const checkmark = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ============================================
// TRANSITION PRESETS
// ============================================

export const transitions = {
  // Default spring
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  // Bouncy spring
  springBouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  },
  // Smooth ease
  smooth: {
    duration: 0.3,
    ease: 'easeInOut',
  },
  // Quick
  quick: {
    duration: 0.15,
    ease: 'easeOut',
  },
  // Slow
  slow: {
    duration: 0.5,
    ease: 'easeInOut',
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create a stagger container with custom timing
 * @param {number} staggerTime - Time between each child animation
 * @param {number} delayTime - Initial delay before animations start
 */
export const createStaggerContainer = (staggerTime = 0.1, delayTime = 0) => ({
  animate: {
    transition: {
      staggerChildren: staggerTime,
      delayChildren: delayTime,
    },
  },
});

/**
 * Create a fade animation with custom direction
 * @param {'up' | 'down' | 'left' | 'right'} direction - Direction to fade from
 * @param {number} distance - Distance to travel in pixels
 */
export const createFadeIn = (direction = 'up', distance = 20) => {
  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const value = direction === 'up' || direction === 'left' ? distance : -distance;
  
  return {
    initial: { opacity: 0, [axis]: value },
    animate: { opacity: 1, [axis]: 0 },
    exit: { opacity: 0, [axis]: -value },
  };
};

/**
 * Create a delayed animation variant
 * @param {object} variant - Base animation variant
 * @param {number} delay - Delay in seconds
 */
export const withDelay = (variant, delay) => ({
  ...variant,
  animate: {
    ...variant.animate,
    transition: {
      ...variant.animate?.transition,
      delay,
    },
  },
});

// Export all animations as default
const animations = {
  fadeInUp,
  fadeInDown,
  fadeIn,
  fadeInScale,
  slideInLeft,
  slideInRight,
  slideInLeftFull,
  slideInRightFull,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerContainerDelayed,
  scaleOnHover,
  scaleOnHoverSubtle,
  liftOnHover,
  buttonPress,
  rotateOnHover,
  pageTransition,
  pageTransitionSlide,
  modalBackdrop,
  modalContent,
  dropdownMenu,
  skeletonPulse,
  skeletonShimmer,
  spinnerRotate,
  bounceIn,
  springPop,
  shake,
  checkmark,
  transitions,
  createStaggerContainer,
  createFadeIn,
  withDelay,
};

export default animations;
