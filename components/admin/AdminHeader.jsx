'use client';

/**
 * AdminHeader component for page headers in admin interface
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Optional page description
 * @param {React.ReactNode} props.actions - Optional action buttons
 */
export default function AdminHeader({ title, description, actions }) {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
        {actions && (
          <div className="mt-4 md:mt-0 flex-shrink-0 flex space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}