'use client';

import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-900 drop-shadow-lg text-center">
        Demo: Session Data
      </h1>
      <div className="bg-white/90 shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-blue-200 backdrop-blur-md">
        <div className="mb-6 flex items-center gap-2">
          <span className="font-semibold text-blue-800">Session status:</span>
          <span
            className={`px-3 py-1 rounded-full font-medium text-sm ${
              status === 'authenticated'
                ? 'bg-green-100 text-green-700'
                : status === 'loading'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {status}
          </span>
        </div>
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-gray-500 animate-pulse">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Loading session...
          </div>
        )}
        {status === 'unauthenticated' && (
          <div className="text-red-600 font-semibold text-center">
            <svg className="inline w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
            No session found. Please sign in.
          </div>
        )}
        {status === 'authenticated' && (
          <div>
            <div className="mb-4">
              <span className="font-semibold text-blue-700">User:</span>
              <pre className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2 text-sm overflow-x-auto text-blue-900">
                {JSON.stringify(session.user, null, 2)}
              </pre>
            </div>
            <div>
              <span className="font-semibold text-blue-700">Full Session Object:</span>
              <pre className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2 text-xs overflow-x-auto text-blue-900">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
