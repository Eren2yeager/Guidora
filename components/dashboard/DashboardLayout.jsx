'use client';

import { useState } from 'react';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ 
  children, 
  activeTab = 'dashboard', 
  user, 
  notifications = 0,
  title,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = title || activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      <Sidebar user={user} />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user}
        isMobile 
      />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                <BellIcon className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
