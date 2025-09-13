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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const isAuthorized = status === "authenticated" && isAdminSession(session);
  useEffect(() => {
    // If not authenticated or not admin, redirect to admin login
    if (status === "unauthenticated") {
      router.push("/admin");
    } else if (status === "authenticated" && !isAdminSession(session)) {
      router.push("/admin");
    }
  }, [session, status, router]);
  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Squares2X2Icon },
    { name: "Colleges", href: "/admin/colleges", icon: BuildingLibraryIcon },
    { name: "Courses", href: "/admin/courses", icon: BookOpenIcon },
    { name: "Programs", href: "/admin/programs", icon: DocumentTextIcon },
    { name: "Streams", href: "/admin/streams", icon: UserGroupIcon },
    { name: "Careers", href: "/admin/careers", icon: BriefcaseIcon },
    { name: "Exams", href: "/admin/exams", icon: BeakerIcon },
    { name: "Scholarships", href: "/admin/scholarships", icon: BanknotesIcon },
    { name: "Resources", href: "/admin/resources", icon: DocumentIcon },
    { name: "Counselors", href: "/admin/counselors", icon: UserIcon },
    {
      name: "Timeline Events",
      href: "/admin/timeline-events",
      icon: CalendarIcon,
    },
    {
      name: "Quiz Questions",
      href: "/admin/quiz-questions",
      icon: QuestionMarkCircleIcon,
    },
    { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 text-white transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-700 flex-shrink-0">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-blue-300" />
            <span className="ml-2 text-xl font-semibold">Admin Portal</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-blue-300 hover:text-white"
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
          {navigation.map((item) => {
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
        </nav>
        <div className="flex-shrink-0 bg-blue-800 border-t border-blue-700 p-4">
          <div className="flex items-center">
            <img
              src={session?.user?.image || ""}
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

      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-0 left-0 z-40 p-4">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
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
        )}
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <main className="py-6 px-4 sm:px-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
