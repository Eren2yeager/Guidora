"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "@/contexts/ToastContext";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";

/**
 * Phone reset password page component
 */
export default function PhoneResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <PhoneResetPasswordPageContent />
    </Suspense>
  );
}

/**
 * OTP Input component with 6 boxes, supports typing, backspace, and paste.
 */
import { useRef } from "react";

function OtpInput({ value, onChange, disabled = false, autoFocus = false }) {
  const inputsRef = Array.from({ length: 6 }, () => useRef(null));

  // Helper to focus next/prev input
  const focusInput = (idx) => {
    if (inputsRef[idx] && inputsRef[idx].current) {
      inputsRef[idx].current.focus();
    }
  };

  // Handle input change
  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      // If cleared, update value
      const newOtp = value.substring(0, idx) + "" + value.substring(idx + 1);
      onChange(newOtp);
      return;
    }
    let chars = val.split("");
    let newOtp = value.split("");
    for (let i = 0; i < chars.length && idx + i < 6; i++) {
      newOtp[idx + i] = chars[i];
    }
    onChange(newOtp.join("").slice(0, 6));
    // Focus next input if available
    if (idx + chars.length < 6) {
      focusInput(idx + chars.length);
    }
  };

  // Handle keydown for backspace and arrow navigation
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        // Clear current box
        const newOtp = value.substring(0, idx) + "" + value.substring(idx + 1);
        onChange(newOtp);
      } else if (idx > 0) {
        // Move to previous box
        focusInput(idx - 1);
        // Also clear previous box
        const newOtp = value.substring(0, idx - 1) + "" + value.substring(idx);
        onChange(newOtp);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      focusInput(idx - 1);
      e.preventDefault();
    } else if (e.key === "ArrowRight" && idx < 5) {
      focusInput(idx + 1);
      e.preventDefault();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (paste) {
      onChange(paste.padEnd(6, ""));
      // Focus last filled input
      const lastIdx = Math.min(paste.length, 5);
      setTimeout(() => focusInput(lastIdx), 0);
    }
    e.preventDefault();
  };

  return (
    <div className="flex justify-center space-x-2">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={inputsRef[idx]}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoFocus={autoFocus && idx === 0}
          disabled={disabled}
          className="w-10 h-12 text-center text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black font-mono tracking-widest"
          value={value[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          aria-label={`OTP digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}

/**
 * Phone reset password page content component
 */
function PhoneResetPasswordPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [phone, setPhone] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      router.push("/home");
    }

    // Get phone and verificationId from URL params
    const phoneParam = searchParams.get("phone");
    const vidParam = searchParams.get("vid");
    if (phoneParam && vidParam) {
      setPhone(phoneParam);
      setVerificationId(vidParam);
    } else {
      router.push("/auth/phone-forgot-password");
    }
  }, [session, status, router, searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Confirm OTP using Firebase
      const auth = getFirebaseAuth();
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);

      // Get Firebase ID token to prove phone ownership
      const idToken = await result.user.getIdToken();

      // Send to server to update password
      const response = await fetch("/api/auth/phone-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          idToken,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password");
        toast({ text: data.error || "Failed to reset password" });
        return;
      }

      setIsSuccess(true);
      toast({ text: "Password reset successfully! You can now sign in." });

      // Auto redirect to signin after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError(error?.message || "An unexpected error occurred. Please try again.");
      toast({ text: error?.message || "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Go back to forgot page to re-initiate reCAPTCHA flow
    router.push("/auth/phone-forgot-password");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 lg:h-32 lg:w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  if (isSuccess) {
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
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Password Reset Successfully!
            </h2>

            <p className="text-gray-600 mb-6">
              Your password has been updated successfully. You'll be redirected
              to the sign-in page shortly.
            </p>

            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
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
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-full flex items-center justify-center mb-6 shadow-lg"
          >
            <AcademicCapIcon className="h-10 w-10 text-white" />
          </motion.div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Reset Password
          </h2>
          <p className="text-gray-700 mb-8 text-base">
            Enter the 6-digit code sent to <strong>{phone}</strong> and your new
            password.
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
                Enter reset code and new password
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

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reset Code (6 digits)
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                  autoFocus={true}
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-500 underline disabled:opacity-50"
                  >
                    Resend
                  </button>
                </p>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    className="w-full px-3 py-2 text-black pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 pr-10 border text_black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => router.push("/auth/phone-forgot-password")}
                className="text-blue-600 hover:text-blue-500 text-sm underline flex items_center justify-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Forgot Password
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
            Remember your password?{" "}
            <button
              onClick={() => router.push("/auth/signin")}
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
