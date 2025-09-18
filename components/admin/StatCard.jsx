'use client';

/**
 * StatCard component for displaying statistics in admin dashboard
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main statistic value
 * @param {string} props.icon - Icon component to display
 * @param {string} props.bgColor - Background color class
 * @param {string} props.textColor - Text color class
 * @param {boolean} props.loading - Whether data is loading
 */
export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  bgColor = 'bg-blue-500', 
  textColor = 'text-white',
  loading = false 
}) {
  return (
    <div className={`rounded-lg shadow-md overflow-hidden ${bgColor}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-white bg-opacity-30 rounded-md p-3">
            {Icon && <Icon className={`h-6 w-6 ${textColor}`} aria-hidden="true" />}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className={`text-sm font-medium ${textColor} opacity-80 truncate`}>
                {title}
              </dt>
              <dd>
                {loading ? (
                  <div className="h-8 w-16 bg-white bg-opacity-20 rounded animate-pulse mt-1"></div>
                ) : (
                  <div className={`text-2xl font-semibold ${textColor}`}>
                    {value}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}