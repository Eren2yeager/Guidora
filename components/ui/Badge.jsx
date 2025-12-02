'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge Component
 * A small label for status, categories, or counts
 */
const Badge = forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className,
  ...props
}, ref) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center font-medium rounded-full
    transition-colors duration-200
  `;

  // Variant styles
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-purple-100 text-purple-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-cyan-100 text-cyan-700',
    // Solid variants
    'solid-primary': 'bg-blue-600 text-white',
    'solid-secondary': 'bg-purple-600 text-white',
    'solid-success': 'bg-emerald-600 text-white',
    'solid-warning': 'bg-amber-600 text-white',
    'solid-danger': 'bg-red-600 text-white',
    // Outline variants
    'outline-primary': 'border border-blue-600 text-blue-600 bg-transparent',
    'outline-secondary': 'border border-purple-600 text-purple-600 bg-transparent',
    'outline-success': 'border border-emerald-600 text-emerald-600 bg-transparent',
    'outline-warning': 'border border-amber-600 text-amber-600 bg-transparent',
    'outline-danger': 'border border-red-600 text-red-600 bg-transparent',
  };

  // Size styles
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  };

  // Dot colors
  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
  };

  // Get base variant for dot color
  const getBaseVariant = () => {
    if (variant.startsWith('solid-') || variant.startsWith('outline-')) {
      return variant.split('-')[1];
    }
    return variant;
  };

  return (
    <span
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {/* Status dot */}
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            dotColors[getBaseVariant()]
          )}
        />
      )}

      {/* Badge content */}
      {children}

      {/* Remove button */}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
});

Badge.displayName = 'Badge';

/**
 * Badge Group Component
 * For displaying multiple badges together
 */
export function BadgeGroup({ children, className }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {children}
    </div>
  );
}

/**
 * Status Badge Component
 * Pre-configured badge for common status indicators
 */
export function StatusBadge({ status, className }) {
  const statusConfig = {
    active: { variant: 'success', label: 'Active', dot: true },
    inactive: { variant: 'default', label: 'Inactive', dot: true },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    completed: { variant: 'success', label: 'Completed', dot: true },
    cancelled: { variant: 'danger', label: 'Cancelled', dot: true },
    draft: { variant: 'default', label: 'Draft', dot: true },
    published: { variant: 'primary', label: 'Published', dot: true },
    urgent: { variant: 'danger', label: 'Urgent', dot: true },
    soon: { variant: 'warning', label: 'Soon', dot: true },
    normal: { variant: 'default', label: 'Normal', dot: true },
  };

  const config = statusConfig[status] || { variant: 'default', label: status, dot: false };

  return (
    <Badge variant={config.variant} dot={config.dot} className={className}>
      {config.label}
    </Badge>
  );
}

export default Badge;
