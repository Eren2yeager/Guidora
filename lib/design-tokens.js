/**
 * Design Tokens for Guidora Platform
 * Centralized design system with colors, spacing, shadows, and typography
 */

// Color Palette
export const colors = {
  // Primary Blue Scale
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Secondary Purple Scale
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  // Accent Colors
  accent: {
    pink: '#ec4899',
    rose: '#f43f5e',
    emerald: '#10b981',
    teal: '#14b8a6',
    amber: '#f59e0b',
    orange: '#f97316',
    cyan: '#06b6d4',
    indigo: '#6366f1',
  },
  // Neutral Gray Scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Semantic Colors
  success: {
    light: '#d1fae5',
    DEFAULT: '#10b981',
    dark: '#059669',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },
};

// Gradient Definitions (Tailwind class format)
export const gradients = {
  // Primary Gradients
  primary: 'from-blue-600 to-indigo-700',
  primaryLight: 'from-blue-500 to-indigo-600',
  primaryDark: 'from-blue-700 to-indigo-800',
  
  // Secondary Gradients
  secondary: 'from-purple-500 to-pink-500',
  secondaryLight: 'from-purple-400 to-pink-400',
  
  // Accent Gradients
  success: 'from-emerald-500 to-teal-600',
  warm: 'from-amber-500 to-orange-600',
  cool: 'from-cyan-500 to-blue-600',
  rose: 'from-pink-500 to-rose-600',
  
  // Background Gradients
  bgLight: 'from-blue-50 to-indigo-100',
  bgSubtle: 'from-gray-50 to-blue-50',
  bgDark: 'from-gray-900 to-indigo-950',
  
  // Card/Feature Gradients
  cardBlue: 'from-blue-500 to-indigo-600',
  cardPurple: 'from-purple-500 to-indigo-600',
  cardPink: 'from-pink-500 to-rose-600',
  cardGreen: 'from-emerald-500 to-teal-600',
  cardAmber: 'from-amber-500 to-orange-600',
  cardCyan: 'from-cyan-500 to-blue-600',
};

// Spacing Scale (rem values)
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
};

// Shadow Definitions
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Glow effects for interactive elements
  glow: {
    blue: '0 0 20px rgb(59 130 246 / 0.3)',
    purple: '0 0 20px rgb(139 92 246 / 0.3)',
    pink: '0 0 20px rgb(236 72 153 / 0.3)',
    emerald: '0 0 20px rgb(16 185 129 / 0.3)',
  },
  // Card hover shadows
  card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  cardElevated: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

// Typography
export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
    mono: 'var(--font-geist-mono), ui-monospace, monospace',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],        // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],       // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
  },
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Transition Durations
export const transitions = {
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// Z-Index Scale
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '100',
  sticky: '200',
  modal: '300',
  popover: '400',
  tooltip: '500',
};

// Breakpoints (for reference, Tailwind handles these)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Component-specific tokens
export const components = {
  button: {
    sizes: {
      sm: { px: '0.75rem', py: '0.375rem', fontSize: '0.875rem' },
      md: { px: '1rem', py: '0.5rem', fontSize: '0.875rem' },
      lg: { px: '1.5rem', py: '0.75rem', fontSize: '1rem' },
    },
  },
  input: {
    sizes: {
      sm: { px: '0.75rem', py: '0.375rem', fontSize: '0.875rem' },
      md: { px: '1rem', py: '0.625rem', fontSize: '1rem' },
      lg: { px: '1rem', py: '0.75rem', fontSize: '1.125rem' },
    },
  },
  card: {
    padding: {
      none: '0',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
  },
};

// Export all tokens as default
const designTokens = {
  colors,
  gradients,
  spacing,
  shadows,
  typography,
  borderRadius,
  transitions,
  zIndex,
  breakpoints,
  components,
};

export default designTokens;
