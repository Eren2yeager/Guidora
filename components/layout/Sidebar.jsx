'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  UserCircleIcon, 
  BookOpenIcon,
  BuildingLibraryIcon,
  BriefcaseIcon,
  BanknotesIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { slideInLeftFull, fadeIn } from '@/lib/animations';

// Navigation items configuration
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  { name: 'Quizzes', href: '/quizzes', icon: ClipboardDocumentListIcon },
  { name: 'Courses', href: '/courses', icon: BookOpenIcon },
  { name: 'Colleges', href: '/colleges', icon: BuildingLibraryIcon },
  { name: 'Careers', href: '/careers', icon: BriefcaseIcon },
  { name: 'Scholarships', href: '/scholarships', icon: BanknotesIcon },
  { name: 'Counselors', href: '/counselors', icon: AcademicCapIcon },
];

const bottomNavItems = [
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

/**
 * Check if a route is active
 * @param {string} href - Navigation item href
 * @param {string} pathname - Current pathname
 * @returns {boolean} - Whether the route is active
 */
function isRouteActive(href, pathname) {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname.startsWith(href);
}

/**
 * Sidebar Component
 * Navigation sidebar with active route highlighting and mobile support
 */
export default function Sidebar({
  isOpen = true,
  onClose,
  user,
  isMobile = false,
}) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Guidora
          </span>
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = isRouteActive(item.href, pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-blue-600' : 'text-gray-400'
                )}
              />
              <span>{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-2 border-t border-gray-200">
        {bottomNavItems.map((item) => {
          const isActive = isRouteActive(item.href, pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/profile"
            onClick={isMobile ? onClose : undefined}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email || 'Student'}
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );

  // Mobile sidebar with overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={onClose}
              {...fadeIn}
            />
            {/* Sidebar */}
            <motion.aside
              className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-50 md:hidden"
              {...slideInLeftFull}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar
  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        {sidebarContent}
      </div>
    </aside>
  );
}

/**
 * Export navigation items for use in other components
 */
export { navItems, bottomNavItems, isRouteActive };
