'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * Component to handle post-signup quiz redirection
 * This component checks if a user is newly registered and redirects them to the quiz flow
 */
export default function QuizRedirect({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Only proceed if the user is authenticated
    if (status === 'authenticated' && session?.user) {
      // Check if user has already dismissed the prompt
      const hasSkipped = localStorage.getItem('quiz-prompt-skipped');
      
      if (hasSkipped) {
        setHasChecked(true);
        return;
      }
      
      // Check if the user has completed a quiz before
      const checkUserQuizStatus = async () => {
        try {
          // Get user profile to check if they have interests set
          const profileResponse = await fetch('/api/user/profile');
          const profileData = await profileResponse.json();
          
          // Check if user has interests set
          const hasInterests = profileData?.interests && profileData.interests.length > 0;
          
          // If no interests are set, check if they've taken a quiz
          if (!hasInterests) {
            const quizResponse = await fetch('/api/quizzes/results');
            const quizData = await quizResponse.json();
            
            // If no quiz results and no interests, show the prompt
            if (!quizData || quizData.length === 0) {
              setIsNewUser(true);
              setShowPrompt(true);
            }
          }
          
          setHasChecked(true);
        } catch (error) {
          console.error('Error checking user quiz status:', error);
          setHasChecked(true); // Still mark as checked to avoid infinite loading
        }
      };
      
      checkUserQuizStatus();
    } else if (status !== 'loading') {
      // If not authenticated and not loading, mark as checked
      setHasChecked(true);
    }
  }, [session, status]);

  const handleStartQuiz = () => {
    router.push('/quizzes/interest');
    localStorage.setItem('quiz-prompt-skipped', 'true');
    setShowPrompt(false);
  };

  const handleSkip = () => {
    // Save to localStorage so it doesn't show again
    localStorage.setItem('quiz-prompt-skipped', 'true');
    setShowPrompt(false);
  };

  // If still checking or not a new user, render children
  if (!showPrompt || !hasChecked) {
    return <>{children}</>;
  }

  // Show quiz prompt for new users
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-2xl bg-opacity-50"
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Educational Advisor!</h2>
          
          <p className="text-gray-600 mb-6">
            To provide you with personalized recommendations for courses, careers, and educational paths,
            we recommend taking a quick interest assessment quiz.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleStartQuiz}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Take Interest Quiz Now
            </button>
            
            <button
              onClick={handleSkip}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            You can always take quizzes later from the Quizzes section in the navigation menu.
          </p>
        </div>
      </motion.div>
      {children}
    </>
  );
}