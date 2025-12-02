'use client';

import { cn } from '@/lib/utils';

/**
 * Skeleton Component
 * Loading placeholder with pulse or wave animation
 */
export  function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className,
  ...props
}) {
  // Base styles
  const baseStyles = 'bg-gray-200';

  // Animation styles
  const animations = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  // Variant styles
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  // Default dimensions based on variant
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: '100%', height: '1rem' };
      case 'circular':
        return { width: '3rem', height: '3rem' };
      case 'rectangular':
        return { width: '100%', height: '6rem' };
      case 'card':
        return { width: '100%', height: '12rem' };
      default:
        return {};
    }
  };

  const defaultDimensions = getDefaultDimensions();

  return (
    <div
      className={cn(
        baseStyles,
        animations[animation],
        variants[variant],
        className
      )}
      style={{
        width: width || defaultDimensions.width,
        height: height || defaultDimensions.height,
      }}
      {...props}
    />
  );
}

/**
 * Skeleton Text Component
 * Multiple lines of text skeleton
 */
export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
  spacing = 'md',
  animation = 'pulse',
  className,
}) {
  const spacings = {
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4',
  };

  return (
    <div className={cn(spacings[spacing], className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          animation={animation}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Avatar Component
 * Circular skeleton for profile images
 */
export function SkeletonAvatar({
  size = 'md',
  animation = 'pulse',
  className,
}) {
  const sizes = {
    sm: { width: '2rem', height: '2rem' },
    md: { width: '3rem', height: '3rem' },
    lg: { width: '4rem', height: '4rem' },
    xl: { width: '5rem', height: '5rem' },
  };

  return (
    <Skeleton
      variant="circular"
      animation={animation}
      width={sizes[size].width}
      height={sizes[size].height}
      className={className}
    />
  );
}

/**
 * Skeleton Card Component
 * Pre-built card skeleton with image, title, and description
 */
export function SkeletonCard({
  hasImage = true,
  imageHeight = '10rem',
  animation = 'pulse',
  className,
}) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden', className)}>
      {hasImage && (
        <Skeleton
          variant="rectangular"
          animation={animation}
          width="100%"
          height={imageHeight}
          className="rounded-none"
        />
      )}
      <div className="p-4 space-y-3">
        <Skeleton variant="text" animation={animation} width="70%" height="1.25rem" />
        <SkeletonText lines={2} animation={animation} />
        <div className="flex items-center gap-2 pt-2">
          <SkeletonAvatar size="sm" animation={animation} />
          <Skeleton variant="text" animation={animation} width="40%" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton List Item Component
 * For list/table row loading states
 */
export function SkeletonListItem({
  hasAvatar = true,
  hasAction = false,
  animation = 'pulse',
  className,
}) {
  return (
    <div className={cn('flex items-center gap-4 p-4', className)}>
      {hasAvatar && <SkeletonAvatar size="md" animation={animation} />}
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" animation={animation} width="60%" height="1rem" />
        <Skeleton variant="text" animation={animation} width="40%" height="0.875rem" />
      </div>
      {hasAction && (
        <Skeleton variant="rectangular" animation={animation} width="5rem" height="2rem" />
      )}
    </div>
  );
}

/**
 * Skeleton Dashboard Stats Component
 * For dashboard stat cards
 */
export function SkeletonStats({
  count = 4,
  animation = 'pulse',
  className,
}) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
          <Skeleton variant="text" animation={animation} width="40%" height="0.875rem" />
          <Skeleton variant="text" animation={animation} width="60%" height="1.5rem" className="mt-2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Profile Component
 * For profile header loading state
 */
export function SkeletonProfile({
  animation = 'pulse',
  className,
}) {
  return (
    <div className={cn('flex items-start gap-6', className)}>
      <SkeletonAvatar size="xl" animation={animation} />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" animation={animation} width="50%" height="1.5rem" />
        <Skeleton variant="text" animation={animation} width="30%" height="1rem" />
        <div className="flex gap-4 pt-2">
          <Skeleton variant="rectangular" animation={animation} width="6rem" height="2rem" />
          <Skeleton variant="rectangular" animation={animation} width="6rem" height="2rem" />
        </div>
      </div>
    </div>
  );
}
