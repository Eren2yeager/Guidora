'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ComprehensiveQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState('intro'); // intro, quiz, loading
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  // Fetch questions when starting the quiz
  const startQuiz = async () => {
    setStep('loading');
    try {
      const response = await fetch('/api/quizzes/questions?category=comprehensive');
      if (!response.ok) throw new Error('Failed to fetch questions');
      
      const data = await response.json();
      if (!data || data.length === 0) throw new Error('No questions available');
      
      setQuestions(data);
      setStep('quiz');
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to load questions');
      setStep('intro'); // Go back to intro on error
    }
  };

  // Handle answer selection
  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        submitQuiz();
      }
    }, 500);
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
      // Organize answers by category
      const categorizedAnswers = {};
      
      // Process answers and categorize them
      questions.forEach((question, index) => {
        const answer = answers[question.id];
        if (answer) {
          if (!categorizedAnswers[question.category]) {
            categorizedAnswers[question.category] = {
              total: 0,
              count: 0
            };
          }
          categorizedAnswers[question.category].total += answer;
          categorizedAnswers[question.category].count += 1;
        }
      });
      
      // Calculate average scores for each category
      const categoryScores = {};
      Object.entries(categorizedAnswers).forEach(([category, data]) => {
        categoryScores[category] = Math.round((data.total / data.count) * 100) / 100;
      });
      
      // Submit results to API
      const response = await fetch('/api/quizzes/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizType: 'comprehensive',
          answers,
          results: categoryScores,
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
          <h1 className="text-3xl font-bold text-center mb-6 text-green-800">Comprehensive Assessment</h1>
          
          <div className="mb-8 text-center">
            <p className="text-lg text-gray-700 mb-4">
              Get a complete picture of your interests, aptitudes, and personality traits.
            </p>
            <p className="text-gray-600">
              This comprehensive assessment combines questions from all our quiz types to provide you with the most detailed and personalized recommendations.
            </p>
          </div>
          
          <div className="mb-8 bg-green-50 p-4 rounded-lg">
            <h2 className="font-semibold text-green-800 mb-2">How it works:</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>This assessment includes questions about your interests, aptitudes, and personality</li>
              <li>For each statement, rate how strongly you agree on a scale of 1-5</li>
              <li>Answer honestly - there are no right or wrong answers</li>
              <li>The quiz takes approximately 15-20 minutes to complete</li>
              <li>You'll receive detailed recommendations based on your unique profile</li>
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
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-md transition-colors"
            >
              Start Comprehensive Assessment
            </button>
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
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render quiz questions
  if (step === 'quiz' && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    
    // Determine question type color
    let questionTypeColor = 'bg-gray-100';
    let progressColor = 'bg-gray-600';
    
    if (currentQ?.category === 'STEM' || currentQ?.category === 'Arts' || currentQ?.category === 'Medical' || 
        currentQ?.category === 'Engineering' || currentQ?.category === 'Social') {
      questionTypeColor = 'bg-red-100';
      progressColor = 'bg-red-600';
    } else if (currentQ?.category === 'Analytical' || currentQ?.category === 'Spatial' || 
               currentQ?.category === 'Memory' || currentQ?.category === 'Verbal' || 
               currentQ?.category === 'Numerical') {
      questionTypeColor = 'bg-blue-100';
      progressColor = 'bg-blue-600';
    } else if (currentQ?.category === 'Social' || currentQ?.category === 'Planning' || 
               currentQ?.category === 'Leadership' || currentQ?.category === 'Practical' || 
               currentQ?.category === 'Adaptability') {
      questionTypeColor = 'bg-purple-100';
      progressColor = 'bg-purple-600';
    }
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${progressColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
        
        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className={`${questionTypeColor} rounded-lg shadow-lg p-6 mb-8 text-black`}
        >
          <div className="mb-4">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white">
              {currentQ?.category}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold mb-6">{currentQ.text}</h2>
          
          {/* Answer options */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleAnswer(currentQ.id, value)}
                className={`w-full p-4 rounded-md border transition-colors bg-white ${answers[currentQ.id] === value ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-center">
                  <span>
                    {value === 1 && 'Strongly Disagree'}
                    {value === 2 && 'Disagree'}
                    {value === 3 && 'Neutral'}
                    {value === 4 && 'Agree'}
                    {value === 5 && 'Strongly Agree'}
                  </span>
                  <span className="text-lg font-semibold">{value}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
        
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