'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { dropdownMenu } from '@/lib/animations';

/**
 * Select Component
 * A styled dropdown select with custom options
 */
const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  size = 'md',
  className,
  containerClassName,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Find selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Size styles
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const handleSelect = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={cn('relative w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label
          className={cn(
            'block text-sm font-medium mb-1.5',
            error ? 'text-red-600' : 'text-gray-700'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select trigger */}
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full rounded-lg border bg-white text-left',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60',
          'flex items-center justify-between',
          sizes[size],
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',
          isOpen && 'ring-2 ring-blue-500/20 border-blue-500',
          className
        )}
        {...props}
      >
        <span className={cn(
          selectedOption ? 'text-gray-900' : 'text-gray-400'
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={cn(
            'h-5 w-5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            {...dropdownMenu}
          >
            <ul className="max-h-60 overflow-auto py-1">
              {options.length === 0 ? (
                <li className="px-4 py-2 text-sm text-gray-500">No options available</li>
              ) : (
                options.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option)}
                      disabled={option.disabled}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm transition-colors',
                        'hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        option.value === value
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {option.value === value && (
                          <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      {option.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
