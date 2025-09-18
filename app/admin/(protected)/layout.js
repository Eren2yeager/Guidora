"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isAdminSession } from "@/lib/rbac";
import {
  AcademicCapIcon,
  BuildingLibraryIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  UserGroupIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
  BeakerIcon,
  BanknotesIcon,
  DocumentIcon,
  UserIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isAuthorized = status === "authenticated" && isAdminSession(session);
  useEffect(() => {
    // If not authenticated or not admin, redirect to admin login
    if (status === "unauthenticated") {
      router.push("/admin");
    } else if (status === "authenticated" && !isAdminSession(session)) {
      router.push("/admin");
    }
  }, [session, status, router]);
  // Group navigation items by category
  const navigation = [
    { 
      name: "Dashboard", 
      href: "/admin/dashboard", 
      icon: Squares2X2Icon,
      category: "main" 
    },
    // Core educational data
    { 
      name: "Colleges", 
      href: "/admin/colleges", 
      icon: BuildingLibraryIcon,
      category: "education" 
    },
    { 
      name: "Scholarships", 
      href: "/admin/scholarships", 
      icon: BanknotesIcon,
      category: "education" 
    },
    { 
      name: "Resources", 
      href: "/admin/resources", 
      icon: DocumentIcon,
      category: "education" 
    },
    { 
      name: "Timeline Events", 
      href: "/admin/timeline-events", 
      icon: CalendarIcon,
      category: "content" 
    },
    { 
      name: "Quiz Questions", 
      href: "/admin/quiz-questions", 
      icon: QuestionMarkCircleIcon,
      category: "content" 
    },
    { 
      name: "NGOs", 
      href: "/admin/ngos", 
      icon: UserGroupIcon,
      category: "partners" 
    },
    { 
      name: "Settings", 
      href: "/admin/settings", 
      icon: Cog6ToothIcon,
      category: "system" 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">


      {/* header */}
      <header className="sticky top-0 left-0 right-0 bg-white shadow-sm z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none mr-3"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center">
              <span className="h-10 w-10 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-full flex items-center justify-center shadow-md">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </span>
              <span className="ml-2 text-xl font-semibold text-blue-800">Educational Advisor Admin</span>
            </div>
          </div>
          
          {/* User info in header for larger screens */}
          <div className="hidden md:flex items-center">
            {session?.user && (
              <div className="flex items-center">
                <img
                  src={session.user.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(session.user.name || "Admin User")}
                  alt=""
                  className="h-8 w-8 rounded-full bg-blue-400"
                />
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-900">
                    {session.user.name}
                  </p>
                  <p className="text-xs font-medium text-gray-500 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex">
              {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 text-white opacity-100 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full opacity-0"
        } transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-700 flex-shrink-0"
        >
          <div className="flex items-center">
             <span className="h-10 w-10 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-full flex items-center justify-center shadow-md">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </span>
            <span className="ml-2 text-xl font-semibold">Admin Portal</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className=" text-blue-300 hover:text-white"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex-1 mt-5 px-2 overflow-y-auto">
          {/* Main navigation */}
          {navigation
            .filter((item) => item.category === "main")
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-900 text-white"
                      : "text-blue-300 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </a>
              );
            })}
          
          {/* Education section */}
          <div className="mt-8 mb-2">
            <h3 className="px-3 text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Educational Data
            </h3>
          </div>
          {navigation
            .filter((item) => item.category === "education")
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-900 text-white"
                      : "text-blue-300 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </a>
              );
            })}
            
          {/* Content section */}
          <div className="mt-8 mb-2">
            <h3 className="px-3 text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Content Management
            </h3>
          </div>
          {navigation
            .filter((item) => item.category === "content")
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-900 text-white"
                      : "text-blue-300 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </a>
              );
            })}
            
          {/* Partners section */}
          <div className="mt-8 mb-2">
            <h3 className="px-3 text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Partners
            </h3>
          </div>
          {navigation
            .filter((item) => item.category === "partners")
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-900 text-white"
                      : "text-blue-300 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </a>
              );
            })}
            
          {/* System section */}
          <div className="mt-8 mb-2">
            <h3 className="px-3 text-xs font-semibold text-blue-200 uppercase tracking-wider">
              System
            </h3>
          </div>
          {navigation
            .filter((item) => item.category === "system")
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-900 text-white"
                      : "text-blue-300 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </a>
              );
            })}
        </nav>
        <div className="flex-shrink-0 bg-blue-800 border-t border-blue-700 p-4">
          <div className="flex items-center">
            <img
              src={session?.user?.image || null}
              alt=""
              className="h-8 w-8 rounded-full bg-blue-400"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {session?.user?.name}
              </p>
              <p className="text-xs font-medium text-blue-300 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="mt-4 flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-blue-300 hover:bg-blue-700 hover:text-white"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>
        <main 
          className="py-6 px-4 sm:px-6 md:px-8 w-full transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        >
          {/* Breadcrumb or page title could go here */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
