'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/contexts/ToastContext';
import { getFirebaseAuth, RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/firebaseClient';
import { formatPhoneNumber, validatePhoneNumber } from '@/lib/smsService';

/**
 * Phone forgot password page component
 */
export default function PhoneForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <PhoneForgotPasswordPageContent />
    </Suspense>
  );
}

/**
 * Phone forgot password page content component
 */
function PhoneForgotPasswordPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [isSmsSent, setIsSmsSent] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.push('/home');
    }
  }, [session, status, router]);

  const setupRecaptcha = () => {
    const auth = getFirebaseAuth();
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
    return window.recaptchaVerifier;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }

    const formatted = formatPhoneNumber(phone);
    if (!validatePhoneNumber(formatted)) {
      setError('Please enter a valid phone number.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const auth = getFirebaseAuth();
      const verifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, formatted, verifier);

      setIsSmsSent(true);
      toast({text: 'Reset code sent! Check your phone.'});

      // Navigate to reset page with verificationId
      router.push(`/auth/phone-reset-password?phone=${encodeURIComponent(formatted)}&vid=${encodeURIComponent(confirmation.verificationId)}`);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err?.message || 'Failed to send reset code');
      toast({text: err?.message || 'Failed to send reset code'});
      try { window.recaptchaVerifier?.clear(); } catch (_) {}
      window.recaptchaVerifier = undefined;
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 lg:h-32 lg:w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  if (isSmsSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center py-2 px-2 sm:py-4 sm:px-4 lg:py-8 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Phone
            </h2>
            
            <p className="text-gray-600 mb-6">
              We've sent a 6-digit reset code to <strong>{phone}</strong>. 
              Please check your phone and enter the code to reset your password.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => router.push(`/auth/phone-reset-password?phone=${encodeURIComponent(phone)}`)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Enter Reset Code
              </button>
              
              <button
                onClick={() => {
                  setIsSmsSent(false);
                  setPhone('');
                }}
                className="w-full text-gray-600 hover:text-gray-800 text-sm underline"
              >
                Try a different phone number
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-2 px-2 sm:py-4 sm:px-4 lg:py-8 lg:px-8 overflow-y-auto">
      <div className="max-w-md w-full space-y-4 sm:space-y-6 py-4 sm:py-8">
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
            Forgot Password?
          </h2>
          <p className="text-gray-700 mb-8 text-base">
            No worries! Enter your phone number and we'll send you a reset code.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8"
        >
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Enter your phone number
              </h3>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div id="recaptcha-container"></div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-blue-600 hover:text-blue-500 text-sm underline flex items-center justify-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Sign In
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center px-4"
        >
          <p className="text-sm text-gray-500 leading-relaxed">
            Remember your password?{' '}
            <button 
              onClick={() => router.push('/auth/signin')}
              className="text-blue-700 font-medium hover:text-blue-600 underline"
            >
              Sign in here
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
