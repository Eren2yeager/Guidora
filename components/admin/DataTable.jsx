'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

/**
 * Reusable DataTable component for admin interfaces
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Array of column definitions with title and key
 * @param {number} props.total - Total number of items (for pagination)
 * @param {number} props.currentPage - Current page number
 * @param {number} props.pageSize - Number of items per page
 * @param {Function} props.onPageChange - Function to call when page changes
 * @param {string} props.basePath - Base path for edit/view/delete actions
 * @param {boolean} props.loading - Whether data is loading
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 */
export default function DataTable({
  data = [],
  columns = [],
  total = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  basePath = '',
  loading = false,
  onDelete,
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, total);
  
  // Handle checkbox selection
  const toggleSelectAll = () => {
    if (selectedItems.length === data.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data.map(item => item._id));
    }
  };
  
  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={selectedItems.length === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading state
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={`loading-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  {columns.map((column, colIndex) => (
                    <td key={`loading-col-${colIndex}`} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-10 text-center text-sm text-gray-500">
                  No items found
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => toggleSelectItem(item._id)}
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={`${item._id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link href={`${basePath}/${item._id}`} className="text-blue-600 hover:text-blue-900">
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link href={`${basePath}/${item._id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => onDelete && onDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange && onPageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}