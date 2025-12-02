'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeIn } from '@/lib/animations';

/**
 * Input Component
 * A versatile input field with label, error state, and icon support
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  className,
  containerClassName,
  id,
  type = 'text',
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Base input styles
  const baseStyles = `
    w-full rounded-lg border
    text-gray-900 placeholder-gray-400
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
  `;

  // Variant styles
  const variants = {
    default: cn(
      'bg-white border-gray-300',
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : 'focus:border-blue-500 focus:ring-blue-500/20'
    ),
    filled: cn(
      'bg-gray-50 border-gray-200',
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : 'focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white'
    ),
  };

  // Size styles
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  // Icon padding adjustments
  const iconPadding = {
    left: {
      sm: 'pl-9',
      md: 'pl-10',
      lg: 'pl-11',
    },
    right: {
      sm: 'pr-9',
      md: 'pr-10',
      lg: 'pr-11',
    },
  };

  // Icon sizes
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // Icon positions
  const iconPositions = {
    left: {
      sm: 'left-3',
      md: 'left-3',
      lg: 'left-3.5',
    },
    right: {
      sm: 'right-3',
      md: 'right-3',
      lg: 'right-3.5',
    },
  };

  return (
    <div className={cn('w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium mb-1.5',
            error ? 'text-red-600' : 'text-gray-700'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div
            className={cn(
              'absolute inset-y-0 flex items-center pointer-events-none',
              iconPositions.left[size],
              error ? 'text-red-400' : isFocused ? 'text-blue-500' : 'text-gray-400'
            )}
          >
            <span className={iconSizes[size]}>{leftIcon}</span>
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={cn(
            baseStyles,
            variants[variant],
            sizes[size],
            leftIcon && iconPadding.left[size],
            rightIcon && iconPadding.right[size],
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <div
            className={cn(
              'absolute inset-y-0 flex items-center',
              iconPositions.right[size],
              error ? 'text-red-400' : isFocused ? 'text-blue-500' : 'text-gray-400'
            )}
          >
            <span className={iconSizes[size]}>{rightIcon}</span>
          </div>
        )}

        {/* Focus ring animation */}
        <AnimatePresence>
          {isFocused && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-lg ring-2 ring-blue-500/20 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            exit={fadeIn.exit}
            className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
