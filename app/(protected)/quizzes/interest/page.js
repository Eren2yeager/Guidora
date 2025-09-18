'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function InterestQuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Sample interest assessment questions
  const questions = [
    {
      id: 'q1',
      text: 'I enjoy solving complex mathematical problems.',
      category: 'STEM',
    },
    {
      id: 'q2',
      text: 'I like to write stories or essays.',
      category: 'Arts',
    },
    {
      id: 'q3',
      text: 'I am interested in how the human body works.',
      category: 'Medical',
    },
    {
      id: 'q4',
      text: 'I enjoy building or fixing things.',
      category: 'Engineering',
    },
    {
      id: 'q5',
      text: 'I like to help others with their problems.',
      category: 'Social',
    },
    {
      id: 'q6',
      text: 'I enjoy analyzing data and finding patterns.',
      category: 'STEM',
    },
    {
      id: 'q7',
      text: 'I am interested in different cultures and languages.',
      category: 'Humanities',
    },
    {
      id: 'q8',
      text: 'I like to debate and discuss different viewpoints.',
      category: 'Law',
    },
    {
      id: 'q9',
      text: 'I enjoy creating visual art or design.',
      category: 'Arts',
    },
    {
      id: 'q10',
      text: 'I am interested in how businesses operate.',
      category: 'Business',
    },
    {
      id: 'q11',
      text: 'I enjoy working with computers and technology.',
      category: 'Technology',
    },
    {
      id: 'q12',
      text: 'I like to study living organisms and ecosystems.',
      category: 'Science',
    },
    {
      id: 'q13',
      text: 'I enjoy teaching or explaining concepts to others.',
      category: 'Education',
    },
    {
      id: 'q14',
      text: 'I am interested in psychology and human behavior.',
      category: 'Social',
    },
    {
      id: 'q15',
      text: 'I like to plan and organize events or projects.',
      category: 'Management',
    },
  ];

  const handleAnswer = (value) => {
    const updatedAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(updatedAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz(updatedAnswers);
    }
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
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Interest Assessment</h1>
                <span className="text-sm font-medium text-gray-500">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                <div 
                  className="bg-rose-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
                  <p className="mt-4 text-gray-600">Processing your results...</p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">
                      {questions[currentQuestion].text}
                    </h2>
                    
                    <div className="grid grid-cols-5 gap-3 mt-6">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <motion.button
                          key={value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAnswer(value)}
                          className={`py-3 rounded-md font-medium transition-colors
                            ${value === 1 ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : ''}
                            ${value === 2 ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}
                            ${value === 3 ? 'bg-gray-300 text-gray-800 hover:bg-gray-400' : ''}
                            ${value === 4 ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' : ''}
                            ${value === 5 ? 'bg-rose-500 text-white hover:bg-rose-600' : ''}
                          `}
                        >
                          {value === 1 && 'Strongly Disagree'}
                          {value === 2 && 'Disagree'}
                          {value === 3 && 'Neutral'}
                          {value === 4 && 'Agree'}
                          {value === 5 && 'Strongly Agree'}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}