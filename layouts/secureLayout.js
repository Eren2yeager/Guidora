"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRightOnRectangleIcon , AcademicCapIcon , ArrowRightIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/solid";

function AppHeader({ user }) {
  const router = useRouter();

  return (
    <header className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 shadow-lg py-2 sm:py-4 px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <UserCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white/80 drop-shadow" />
          Advisor
        </span>
      </div>
      {user && (
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center sm:justify-start">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-white shadow"
            />
          ) : (
            <UserCircleIcon className="w-7 h-7 sm:w-9 sm:h-9 text-white/70" />
          )}
          <span className="text-white font-medium text-sm sm:text-base max-w-[120px] sm:max-w-[160px] truncate">
            {user.name || user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm shadow transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
          </button>
        </div>
      )}
    </header>
  );
}



function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200"
    >
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-700 mb-6"></div>
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Guidora</h2>
        {/* <p className="text-gray-700 text-lg">Preparing your educational dashboard...</p> */}
      </div>
    </motion.div>
  );
}

function UnauthenticatedScreen({ onSignIn }) {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-full flex items-center justify-center mb-6 shadow-lg"
          > 
            <AcademicCapIcon className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Secure Area
          </h2>
          <p className="text-gray-700 mb-8 text-base">
            This page is protected. Please sign in to access your personalized educational dashboard and resources.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="space-y-6">
            <div>

              <p className="text-gray-600 text-center mb-6">
                You must be signed in to view this content.
              </p>
            </div>
            <button
              onClick={onSignIn}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-semibold hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
               Go to Sign In Page
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">
            Only authorized users can access this area.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SecureLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Optionally, you can redirect or just show the unauthenticated screen
      // router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (!session) {
    return <UnauthenticatedScreen onSignIn={() => router.push("/auth/signin")} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col"
    >
      {/* <AppHeader user={session.user} /> */}

        {children}

    </motion.div>
  );
}
