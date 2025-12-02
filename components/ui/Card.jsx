'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { scaleOnHover, liftOnHover, fadeInUp } from '@/lib/animations';

/**
 * Card Component
 * A versatile card container with multiple variants and hover effects
 */
const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  hoverEffect = 'scale', // 'scale' | 'lift' | 'glow'
  gradient,
  animated = false,
  className,
  onClick,
  as: Component = 'div',
  ...props
}, ref) => {
  // Base styles
  const baseStyles = `
    rounded-xl overflow-hidden
    transition-all duration-300
  `;

  // Variant styles
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-md border border-gray-100',
    outline: 'bg-white border-2 border-gray-200',
    ghost: 'bg-transparent',
    gradient: gradient
      ? `bg-gradient-to-br ${gradient} text-white`
      : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg',
  };

  // Padding styles
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Hover styles
  const hoverStyles = hover
    ? {
        scale: 'hover:shadow-lg',
        lift: 'hover:shadow-xl hover:-translate-y-1',
        glow: 'hover:shadow-lg hover:shadow-blue-500/20',
      }[hoverEffect]
    : '';

  // Get hover animation variant
  const getHoverAnimation = () => {
    if (!hover) return {};
    switch (hoverEffect) {
      case 'lift':
        return liftOnHover;
      case 'scale':
        return scaleOnHover;
      default:
        return scaleOnHover;
    }
  };

  // Determine if we should use motion component
  const shouldAnimate = hover || animated;
  const MotionComponent = shouldAnimate ? motion[Component] || motion.div : Component;

  // Animation props
  const animationProps = shouldAnimate
    ? {
        ...(animated ? fadeInUp : {}),
        ...(hover ? getHoverAnimation() : {}),
      }
    : {};

  return (
    <MotionComponent
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        hoverStyles,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {children}
    </MotionComponent>
  );
});

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export const CardHeader = forwardRef(({
  children,
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('mb-4', className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

/**
 * Card Title Component
 */
export const CardTitle = forwardRef(({
  children,
  className,
  as: Component = 'h3',
  ...props
}, ref) => (
  <Component
    ref={ref}
    className={cn('text-lg font-semibold text-gray-900', className)}
    {...props}
  >
    {children}
  </Component>
));

CardTitle.displayName = 'CardTitle';

/**
 * Card Description Component
 */
export const CardDescription = forwardRef(({
  children,
  className,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500 mt-1', className)}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

/**
 * Card Content Component
 */
export const CardContent = forwardRef(({
  children,
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('', className)}
    {...props}
  >
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

/**
 * Card Footer Component
 */
export const CardFooter = forwardRef(({
  children,
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('mt-4 pt-4 border-t border-gray-100 flex items-center', className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

/**
 * Card Image Component
 */
export const CardImage = forwardRef(({
  src,
  alt,
  className,
  aspectRatio = 'video', // 'video' | 'square' | 'wide'
  ...props
}, ref) => {
  const aspectRatios = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
  };

  return (
    <div className={cn('overflow-hidden -mx-6 -mt-6 mb-4', className)}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn(
          'w-full object-cover',
          aspectRatios[aspectRatio]
        )}
        {...props}
      />
    </div>
  );
});

CardImage.displayName = 'CardImage';

export default Card;
