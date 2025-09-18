'use client';

import Link from 'next/link';

/**
 * ActionCard component for quick action links in admin dashboard
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.description - Short description
 * @param {string} props.href - Link destination
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.bgColor - Background color class
 */
export default function ActionCard({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  bgColor = 'bg-white' 
}) {
  return (
    <Link 
      href={href}
      className={`block ${bgColor} rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden`}
    >
      <div className="p-5">
        <div className="flex items-center">
          {Icon && (
            <div className="flex-shrink-0 mr-3">
              <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}