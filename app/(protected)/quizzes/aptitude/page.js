'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizProgressIndicator } from '@/components/quiz';
import { fadeInUp } from '@/lib/animations';

export default function AptitudeQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState('intro'); // intro, quiz, loading
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Fetch questions when starting the quiz
  const startQuiz = async () => {
    setStep('loading');
    setError('');
    try {
      const response = await fetch('/api/quizzes/questions?category=aptitude');
      if (!response.ok) throw new Error('Failed to fetch questions');
      
      const data = await response.json();
      if (!data || data.length === 0) throw new Error('No questions available');
      
      setQuestions(data);
      setStep('quiz');
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to load questions');
      setStep('error'); // Go to error state
    }
  };

  // Retry loading questions
  const retryLoadQuestions = () => {
    startQuiz();
  };

  // Handle answer selection
  const handleAnswer = (questionId, value) => {
    setSelectedAnswer(value);
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Show feedback briefly before moving to next question
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        submitQuiz();
      }
    }, 600);
  };

  // Calculate progress whenever current question changes
  useEffect(() => {
    if (questions.length > 0) {
      setProgress(((currentQuestion + 1) / questions.length) * 100);
    }
  }, [currentQuestion, questions.length]);

  // Submit quiz answers
  const submitQuiz = async () => {
    setStep('loading');
    try {
      // Calculate category scores
      const categoryScores = {};
      const categoryCounts = {};
      
      // Process answers and calculate scores
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          const section = question.section || question.category;
          if (!categoryScores[section]) {
            categoryScores[section] = 0;
            categoryCounts[section] = 0;
          }
          categoryScores[section] += answer;
          categoryCounts[section] += 1;
        }
      });
      
      // Calculate averages and format results
      const categoryScoresArray = Object.entries(categoryScores).map(([category, total]) => ({
        category,
        average: total / categoryCounts[category],
        total,
        count: categoryCounts[category]
      }));
      
      // Sort by average score and get top 3 categories
      const sortedCategories = [...categoryScoresArray].sort((a, b) => b.average - a.average);
      const topCategories = sortedCategories.slice(0, 3).map(item => item.category);
      
      // Submit results to API
      const response = await fetch('/api/quizzes/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizType: 'aptitude',
          answers,
          results: {
            categoryScores: categoryScoresArray,
            topCategories
          },
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit quiz');
      
      const data = await response.json();
      
      // Redirect to results page
      router.push(`/quizzes/results?id=${data.resultId}`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message || 'Failed to submit quiz');
      setStep('quiz'); // Go back to quiz on error
    }
  };

  // Render intro screen
  if (step === 'intro') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">Aptitude Assessment</h1>
          
          <div className="mb-8 text-center">
            <p className="text-lg text-gray-700 mb-4">
              Discover your natural abilities and strengths with our aptitude assessment.
            </p>
            <p className="text-gray-600">
              This quiz will help identify your cognitive strengths across different domains including analytical, spatial, memory, verbal, and numerical abilities.
            </p>
          </div>
          
          <div className="mb-8 bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold text-blue-800 mb-2">How it works:</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>The assessment contains questions measuring different aptitude areas</li>
              <li>For each statement, rate how strongly you agree on a scale of 1-5</li>
              <li>Answer honestly - there are no right or wrong answers</li>
              <li>The quiz takes approximately 5-10 minutes to complete</li>
            </ul>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="text-center">
            <button
              onClick={startQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition-colors"
            >
              Start Assessment
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render error state
  if (step === 'error') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Quiz</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={retryLoadQuestions}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/quizzes')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-md transition-colors"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render loading state
  if (step === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render quiz questions
  if (step === 'quiz' && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <QuizProgressIndicator
            answered={currentQuestion + 1}
            total={questions.length}
            variant="detailed"
            color="purple"
            showPercentage={true}
            animated={true}
          />
        </div>
        
        {/* Question with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="bg-white text-black rounded-lg shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-6">{currentQ.text}</h2>
            
            {/* Answer options */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = selectedAnswer === value;
                return (
                  <motion.button
                    key={value}
                    whileHover={!selectedAnswer ? { scale: 1.01 } : {}}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => !selectedAnswer && handleAnswer(currentQ.id, value)}
                    disabled={selectedAnswer !== null}
                    className={`relative w-full p-4 rounded-md border transition-all duration-300
                      ${isSelected ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300 hover:bg-gray-50'}
                      ${selectedAnswer && !isSelected ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <span>
                        {value === 1 && 'Strongly Disagree'}
                        {value === 2 && 'Disagree'}
                        {value === 3 && 'Neutral'}
                        {value === 4 && 'Agree'}
                        {value === 5 && 'Strongly Agree'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{value}</span>
                        {/* Checkmark animation */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, type: 'spring' }}
                          >
                            <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Fallback
  return null;
}