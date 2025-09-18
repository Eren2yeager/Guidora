'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AptitudeQuizPage() {
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
      const response = await fetch('/api/quizzes/questions?category=aptitude');
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
      // Calculate category scores
      const categoryScores = {};
      
      // Process answers and calculate scores
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          if (!categoryScores[question.category]) {
            categoryScores[question.category] = 0;
          }
          categoryScores[question.category] += answer;
        }
      });
      
      // Submit results to API
      const response = await fetch('/api/quizzes/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizType: 'aptitude',
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
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600" 
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
          className="bg-white text-black rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">{currentQ.text}</h2>
          
          {/* Answer options */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleAnswer(currentQ.id, value)}
                className={`w-full p-4 rounded-md border transition-colors ${answers[currentQ.id] === value ? 'bg-blue-100 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}
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