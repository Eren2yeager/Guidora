'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { fadeIn, slideInLeftFull } from '@/lib/animations';

/**
 * Navbar Component
 * Main navigation bar with gradient option and mobile menu
 */
export default function Navbar({ 
  variant = 'default', // 'default' | 'gradient' | 'transparent'
  onMenuClick,
  showMenuButton = false,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Programs', href: '/programs' },
    { name: 'Colleges', href: '/colleges' },
    { name: 'Careers', href: '/careers' },
    { name: 'Scholarships', href: '/scholarships' },
    { name: 'Counselors', href: '/counselors' },
    { name: 'Quizzes', href: '/quizzes' },
    // { name: 'Saved', href: '/saved' },
  ];

  // Variant styles
  const variants = {
    default: 'bg-white shadow-sm border-b border-gray-100',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg',
    transparent: 'bg-transparent',
  };

  const textColors = {
    default: {
      logo: 'text-blue-600',
      link: 'text-gray-700 hover:text-blue-600',
      activeLink: 'text-blue-600 font-semibold',
      button: 'text-gray-700 hover:text-blue-600',
    },
    gradient: {
      logo: 'text-white',
      link: 'text-white/80 hover:text-white',
      activeLink: 'text-white font-semibold',
      button: 'text-white/80 hover:text-white',
    },
    transparent: {
      logo: 'text-gray-900',
      link: 'text-gray-700 hover:text-blue-600',
      activeLink: 'text-blue-600 font-semibold',
      button: 'text-gray-700 hover:text-blue-600',
    },
  };

  const colors = textColors[variant];

  return (
    <nav className={cn('sticky top-0 z-50', variants[variant])}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button (for dashboard) */}
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className={cn(
                  'lg:hidden p-2 rounded-lg transition-colors',
                  variant === 'gradient' 
                    ? 'hover:bg-white/10' 
                    : 'hover:bg-gray-100'
                )}
              >
                <Bars3Icon className={cn('h-6 w-6', colors.button)} />
              </button>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center shadow-md',
                variant === 'gradient'
                  ? 'bg-white/20 backdrop-blur-sm'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700'
              )}>
                <AcademicCapIcon className={cn(
                  'h-5 w-5',
                  variant === 'gradient' ? 'text-white' : 'text-white'
                )} />
              </div>
              <span className={cn('text-xl font-bold', colors.logo)}>
                Guidora
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || 
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive ? colors.activeLink : colors.link,
                    isActive && variant === 'default' && 'bg-blue-50',
                    isActive && variant === 'gradient' && 'bg-white/10'
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            {status === 'authenticated' ? (
              <>
                {/* Notifications */}
                <button className={cn(
                  'p-2 rounded-lg transition-colors relative',
                  variant === 'gradient' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                )}>
                  <BellIcon className={cn('h-5 w-5', colors.button)} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* Profile */}
                {/* <Link
                  href="/profile"
                  className={cn(
                    'flex items-center gap-2 p-1.5 rounded-lg transition-colors',
                    variant === 'gradient' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </Link> */}

                {/* Dashboard button */}
                <Link
                  href="/dashboard"
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    variant === 'gradient'
                      ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-md'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-lg'
                  )}
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-colors',
                    colors.link
                  )}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    variant === 'gradient'
                      ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-md'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-lg'
                  )}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={toggleMenu}
              className={cn(
                'p-2 rounded-lg transition-colors',
                variant === 'gradient' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              )}
            >
              <span className="sr-only">Open menu</span>
              {isMenuOpen ? (
                <XMarkIcon className={cn('h-6 w-6', colors.button)} />
              ) : (
                <Bars3Icon className={cn('h-6 w-6', colors.button)} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="lg:hidden bg-white border-t border-gray-100 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      'block px-3 py-2.5 rounded-lg text-base font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-gray-100">
              {status === 'authenticated' ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2.5 rounded-lg text-center font-medium bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2.5 rounded-lg text-center font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2.5 rounded-lg text-center font-medium bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
