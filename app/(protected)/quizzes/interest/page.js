'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { QuizProgressIndicator } from '@/components/quiz';
import { fadeInUp } from '@/lib/animations';

export default function InterestQuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const loadQuestions = async () => {
    setIsLoadingQuestions(true);
    setError(null);
    try {
      const res = await fetch('/api/quizzes/questions?category=interest');
      if (!res.ok) throw new Error('Failed to load questions');
      const data = await res.json();
      if (!data || data.length === 0) {
        throw new Error('No questions available');
      }
      setQuestions(data);
    } catch (e) {
      console.error('Error loading questions:', e);
      setError(e.message || 'Unable to load quiz questions');
      toast.error('Failed to load quiz questions. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (!quizStarted) return;
    loadQuestions();
  }, [quizStarted]);

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswer = (value) => {
    setSelectedAnswer(value);
    const updatedAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(updatedAnswers);
    
    // Show feedback briefly before moving to next question
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        submitQuiz(updatedAnswers);
      }
    }, 600);
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    try {
      // Calculate category scores
      const categoryScores = {};
      
      questions.forEach(question => {
        const answer = finalAnswers[question.id] || 0;
        if (!categoryScores[question.category]) {
          categoryScores[question.category] = { total: 0, count: 0 };
        }
        categoryScores[question.category].total += answer;
        categoryScores[question.category].count += 1;
      });
      
      // Calculate averages and find top categories
      const categoryAverages = Object.entries(categoryScores).map(([category, data]) => ({
        category,
        average: data.total / data.count
      }));
      
      categoryAverages.sort((a, b) => b.average - a.average);
      const topCategories = categoryAverages.slice(0, 3).map(item => item.category);
      
      // Save results to API
      const response = await fetch('/api/quizzes/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizType: 'interest',
          answers: finalAnswers,
          results: {
            categoryScores: categoryAverages,
            topCategories,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save quiz results');
      }
      
      const data = await response.json();
      
      // Redirect to results page
      router.push(`/quizzes/results?id=${data.resultId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {!quizStarted ? (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 h-2"></div>
            <div className="px-6 py-8">
              <h1 className="text-3xl font-bold text-gray-900 text-center">Interest Assessment Quiz</h1>
              <p className="mt-4 text-gray-600 text-center">
                This quiz will help identify your interests and suggest educational paths that align with them.
              </p>
              
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">How it works:</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>You'll answer 15 questions about your interests and preferences</li>
                  <li>For each statement, rate how much you agree on a scale of 1-5</li>
                  <li>Be honest - there are no right or wrong answers</li>
                  <li>At the end, you'll receive personalized recommendations</li>
                </ul>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={startQuiz}
                  className="px-6 py-3 bg-rose-600 text-white font-medium rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 h-2"></div>
            <div className="px-6 py-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Interest Assessment</h1>
                
                {/* Progress indicator */}
                {questions.length > 0 && (
                  <QuizProgressIndicator
                    answered={currentQuestion + 1}
                    total={questions.length}
                    variant="detailed"
                    color="pink"
                    showPercentage={true}
                    animated={true}
                  />
                )}
              </div>
              
              {error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Questions</h3>
                  <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
                  <button
                    onClick={loadQuestions}
                    disabled={isLoadingQuestions}
                    className="px-6 py-3 bg-rose-600 text-white font-medium rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingQuestions ? 'Loading...' : 'Try Again'}
                  </button>
                </div>
              ) : loading || isLoadingQuestions || questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
                  <p className="mt-4 text-gray-600">
                    {loading ? 'Processing your results...' : 'Loading questions...'}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                  >
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      {questions[currentQuestion].text}
                    </h2>
                    
                    <div className="grid grid-cols-5 gap-3 mt-6">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const isSelected = selectedAnswer === value;
                        return (
                          <motion.button
                            key={value}
                            whileHover={!selectedAnswer ? { scale: 1.05 } : {}}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => !selectedAnswer && handleAnswer(value)}
                            disabled={selectedAnswer !== null}
                            className={`relative py-3 rounded-md font-medium transition-all duration-300
                              ${isSelected ? 'ring-2 ring-rose-500 ring-offset-2' : ''}
                              ${value === 1 ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : ''}
                              ${value === 2 ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}
                              ${value === 3 ? 'bg-gray-300 text-gray-800 hover:bg-gray-400' : ''}
                              ${value === 4 ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' : ''}
                              ${value === 5 ? 'bg-rose-500 text-white hover:bg-rose-600' : ''}
                              ${selectedAnswer && !isSelected ? 'opacity-50' : ''}
                            `}
                          >
                            <span className="block">
                              {value === 1 && 'Strongly Disagree'}
                              {value === 2 && 'Disagree'}
                              {value === 3 && 'Neutral'}
                              {value === 4 && 'Agree'}
                              {value === 5 && 'Strongly Agree'}
                            </span>
                            {/* Checkmark animation */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, type: 'spring' }}
                                className="absolute top-1 right-1"
                              >
                                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}