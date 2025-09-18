'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

export default function QuizResultsPage() {
  const searchParams = useSearchParams();
  const resultId = searchParams.get('id');
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [interestsSaved, setInterestsSaved] = useState(false);

  useEffect(() => {
    if (!resultId) {
      setError('No result ID provided');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        // Fetch quiz results
        const response = await fetch(`/api/quizzes/results/${resultId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quiz results');
        }
        
        const data = await response.json();
        setResults(data);
        
        // Fetch recommendations based on results
        const recResponse = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizType: data.quizType,
            topCategories: data.results.topCategories,
          }),
        });
        
        if (!recResponse.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const recData = await recResponse.json();
        setRecommendations(recData);
        
        // If user is authenticated and this is an interest quiz, update their profile
        if (session?.user && data.quizType === 'interest') {
          try {
            // Update user profile with interests
            const updateResponse = await fetch('/api/user/update-interests', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                interests: data.results.topCategories,
                quizResultId: resultId
              }),
            });
            
            if (updateResponse.ok) {
              setInterestsSaved(true);
            }
          } catch (err) {
            console.error('Error updating user interests:', err);
            // Don't show this error to user, as it's not critical
          }
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err.message);
        toast.error('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [resultId, session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-red-600 h-2"></div>
          <div className="px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Results</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/quizzes"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-yellow-600 h-2"></div>
          <div className="px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn't find the quiz results you're looking for.</p>
            <Link 
              href="/quizzes"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine color scheme based on quiz type
  const getColorScheme = () => {
    switch (results.quizType) {
      case 'interest':
        return {
          gradient: 'from-pink-500 to-rose-600',
          button: 'bg-rose-600 hover:bg-rose-700',
          highlight: 'text-rose-600',
        };
      case 'aptitude':
        return {
          gradient: 'from-purple-500 to-indigo-600',
          button: 'bg-indigo-600 hover:bg-indigo-700',
          highlight: 'text-indigo-600',
        };
      case 'personality':
        return {
          gradient: 'from-blue-500 to-cyan-600',
          button: 'bg-cyan-600 hover:bg-cyan-700',
          highlight: 'text-cyan-600',
        };
      default:
        return {
          gradient: 'from-blue-500 to-indigo-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          highlight: 'text-blue-600',
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Results Summary */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
          <div className={`bg-gradient-to-r ${colors.gradient} h-2`}></div>
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Your {results.quizType.charAt(0).toUpperCase() + results.quizType.slice(1)} Assessment Results
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Based on your responses, we've identified your top areas of interest and prepared personalized recommendations.
            </p>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Top Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.results.topCategories.map((category, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className={`text-lg font-medium ${colors.highlight} mb-1`}>{category}</div>
                    <p className="text-sm text-gray-600">
                      {getCategoryDescription(category)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Category Scores */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Category Scores</h2>
              <div className="space-y-4">
                {results.results.categoryScores.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-32 font-medium text-gray-700">{item.category}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full bg-gradient-to-r ${colors.gradient}`}
                          style={{ width: `${(item.average / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm text-gray-600">
                      {item.average.toFixed(1)}/5
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Recommendations */}
        {recommendations && (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
            <div className={`bg-gradient-to-r ${colors.gradient} h-2`}></div>
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Paths</h2>
              
              {/* Courses */}
              {recommendations.courses && recommendations.courses.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Courses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.courses.map((course, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        <div className="mt-3">
                          <Link 
                            href={`/courses/${course.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Learn more →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Careers */}
              {recommendations.careers && recommendations.careers.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Careers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.careers.map((career, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900">{career.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{career.description}</p>
                        <div className="mt-3">
                          <Link 
                            href={`/careers/${career.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Learn more →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Programs */}
              {recommendations.programs && recommendations.programs.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Programs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.programs.map((program, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900">{program.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                        <div className="mt-3">
                          <Link 
                            href={`/programs/${program.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Learn more →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Next Steps */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className={`bg-gradient-to-r ${colors.gradient} h-2`}></div>
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Explore Your Recommended Paths</h3>
                  <p className="mt-1 text-gray-600">Click on any of the recommendations above to learn more about courses, careers, and programs that match your profile.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Take Additional Assessments</h3>
                  <p className="mt-1 text-gray-600">Complete our aptitude and personality assessments for a more comprehensive understanding of your educational fit.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Save Your Results</h3>
                  <p className="mt-1 text-gray-600">Create an account or log in to save your results and access them anytime.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link 
                href="/quizzes"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Take Another Quiz
              </Link>
              
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get category descriptions
function getCategoryDescription(category) {
  const descriptions = {
    'STEM': 'Science, Technology, Engineering, and Mathematics fields',
    'Arts': 'Creative and performing arts disciplines',
    'Medical': 'Healthcare, medicine, and related fields',
    'Engineering': 'Design, building, and maintenance of structures, machines, and systems',
    'Social': 'Fields focused on human behavior and society',
    'Humanities': 'Study of human culture, literature, philosophy, and history',
    'Law': 'Legal studies and related disciplines',
    'Business': 'Commerce, management, and entrepreneurship',
    'Technology': 'Computer science, information technology, and digital systems',
    'Science': 'Natural and physical sciences',
    'Education': 'Teaching and educational development',
    'Management': 'Organization and coordination of activities and resources',
  };
  
  return descriptions[category] || 'Fields related to this area of interest';
}