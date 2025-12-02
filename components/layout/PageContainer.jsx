'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';

/**
 * PageContainer Component
 * Consistent page layout wrapper with title, description, breadcrumbs, and actions
 */
export default function PageContainer({
  children,
  title,
  description,
  breadcrumbs,
  actions,
  maxWidth = '7xl', // 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  padding = true,
  animated = true,
  className,
}) {
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const Container = animated ? motion.div : 'div';
  const animationProps = animated ? { ...staggerContainer, initial: 'initial', animate: 'animate' } : {};

  return (
    <Container
      className={cn(
        'mx-auto w-full',
        maxWidths[maxWidth],
        padding && 'px-4 sm:px-6 lg:px-8 py-6',
        className
      )}
      {...animationProps}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} animated={animated} />
      )}

      {/* Page Header */}
      {(title || description || actions) && (
        <PageHeader
          title={title}
          description={description}
          actions={actions}
          animated={animated}
          hasBreadcrumbs={breadcrumbs && breadcrumbs.length > 0}
        />
      )}

      {/* Page Content */}
      {animated ? (
        <motion.div variants={fadeInUp}>
          {children}
        </motion.div>
      ) : (
        children
      )}
    </Container>
  );
}

/**
 * Breadcrumbs Component
 */
function Breadcrumbs({ items, animated }) {
  const Wrapper = animated ? motion.nav : 'nav';
  const wrapperProps = animated ? { variants: fadeInUp } : {};

  return (
    <Wrapper
      className="mb-4"
      aria-label="Breadcrumb"
      {...wrapperProps}
    >
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HomeIcon className="h-4 w-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href || index} className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-300 mx-1" />
            {index === items.length - 1 ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </Wrapper>
  );
}

/**
 * PageHeader Component
 */
function PageHeader({ title, description, actions, animated, hasBreadcrumbs }) {
  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated ? { variants: fadeInUp } : {};

  return (
    <Wrapper
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
        hasBreadcrumbs ? 'mb-6' : 'mb-8'
      )}
      {...wrapperProps}
    >
      <div>
        {title && (
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {title}
          </h1>
        )}
        {description && (
          <p className="mt-1 text-gray-600">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </Wrapper>
  );
}

/**
 * PageSection Component
 * For organizing content within a page
 */
export function PageSection({
  children,
  title,
  description,
  actions,
  className,
}) {
  return (
    <section className={cn('mb-8', className)}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * EmptyState Component
 * For displaying when there's no content
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-gray-500 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
