'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { fadeInUp, staggerContainer } from '@/lib/animations';

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
        // Normalize results: ensure results.topCategories and results.categoryScores[] exist
        const normalized = { ...data };
        const raw = data?.results || {};
        let topCategories = raw?.topCategories;
        let categoryScores = raw?.categoryScores;

        // If missing, compute from object map like { STEM: 4.2, Arts: 3.1 }
        if (!Array.isArray(categoryScores) && raw && typeof raw === 'object' && !Array.isArray(raw)) {
          categoryScores = Object.entries(raw).map(([category, score]) => ({ category, average: Number(score) || 0 }));
        }
        if (!Array.isArray(topCategories) && Array.isArray(categoryScores)) {
          const sorted = [...categoryScores].sort((a, b) => (b.average || 0) - (a.average || 0));
          topCategories = sorted.slice(0, 3).map((x) => x.category);
        }
        normalized.results = {
          ...raw,
          topCategories: topCategories || [],
          categoryScores: categoryScores || [],
        };
        setResults(normalized);
        
        // Fetch recommendations based on results
        const recResponse = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizType: data.quizType,
            topCategories: data.results.topCategories,
            resultId, // allow API to resolve and persist Recommendation linked to this result
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
                // Use Interest IDs from recommendations if available; otherwise, pass slugs as strings
                interests: Array.isArray(recData?.interests) && recData.interests.length > 0
                  ? recData.interests.map((i) => i.id)
                  : normalized.results.topCategories,
                // Pass Mongo ObjectId of QuizResult, not the UUID resultId
                quizResultId: normalized._id
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Success Banner */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Assessment Complete!
          </h1>
          <p className="text-lg text-gray-600">
            Your {results.quizType.charAt(0).toUpperCase() + results.quizType.slice(1)} Assessment Results
          </p>
        </motion.div>

        {/* Results Summary */}
        <motion.div variants={fadeInUp}>
          <Card variant="elevated" padding="lg" className="mb-8 bg-white">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} rounded-t-xl`}></div>
            
            <div className="text-center mb-8 pt-4">
              <p className="text-gray-600">
                Based on your responses, we've identified your top areas and prepared personalized recommendations.
              </p>
            </div>
            
            {/* Top Categories with Medals */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Top Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.results.topCategories.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      variant="default" 
                      padding="md" 
                      className="relative overflow-hidden hover:shadow-lg transition-shadow"
                      animated
                    >
                      {/* Medal Badge */}
                      <div className="absolute top-3 right-3">
                        {index === 0 && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold">1</span>
                          </div>
                        )}
                        {index === 1 && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold">2</span>
                          </div>
                        )}
                        {index === 2 && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold">3</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={`text-xl font-bold ${colors.highlight} mb-2`}>{category}</div>
                      <p className="text-sm text-gray-600">
                        {getCategoryDescription(category)}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Category Scores with Animation */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Detailed Score Breakdown</h2>
              <div className="space-y-4">
                {results.results.categoryScores.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{item.category}</span>
                      <Badge variant="primary">{item.average.toFixed(1)}/5</Badge>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.average / 5) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.05, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Recommendations */}
        {recommendations && (
          <motion.div variants={fadeInUp}>
            <Card variant="elevated" padding="lg" className="mb-8 bg-white">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} rounded-t-xl`}></div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2 pt-4 text-center">Your Personalized Recommendations</h2>
              <p className="text-gray-600 text-center mb-8">Based on your assessment results, here are paths tailored for you</p>
              
              {/* Courses */}
              {recommendations.courses && recommendations.courses.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800">Recommended Courses</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.courses.map((course, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card variant="default" padding="md" animated className="h-full">
                          <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                          <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                          <Link 
                            href={`/courses/${course.code}`}
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Learn more
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Careers */}
              {recommendations.careers && recommendations.careers.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800">Recommended Careers</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.careers.map((career, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card variant="default" padding="md" animated className="h-full">
                          <h4 className="font-semibold text-gray-900 mb-2">{career.title}</h4>
                          <p className="text-sm text-gray-600 mb-4">{career.description}</p>
                          <Link 
                            href={`/careers/${career.slug}`}
                            className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800"
                          >
                            Learn more
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Programs */}
              {recommendations.programs && recommendations.programs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800">Recommended Programs</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.programs.map((program, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card variant="default" padding="md" animated className="h-full">
                          <h4 className="font-semibold text-gray-900 mb-2">{program.title}</h4>
                          <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                          <Link 
                            href={`/programs/${program.id}`}
                            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-800"
                          >
                            Learn more
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
        
        {/* Next Steps */}
        <motion.div variants={fadeInUp}>
          <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-white to-blue-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What's Next?</h2>
            <div className="space-y-6">
              <motion.div 
                className="flex items-start gap-4"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Explore Your Recommended Paths</h3>
                  <p className="text-gray-600">Click on any of the recommendations above to learn more about courses, careers, and programs that match your profile.</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-4"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Take Additional Assessments</h3>
                  <p className="text-gray-600">Complete our aptitude and personality assessments for a more comprehensive understanding of your educational fit.</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-4"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Connect with Counselors</h3>
                  <p className="text-gray-600">Schedule a session with our expert counselors to discuss your results and create a personalized education plan.</p>
                </div>
              </motion.div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" gradient asChild>
                <Link href="/quizzes">
                  Take Another Quiz
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
            
            {interestsSaved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center"
              >
                <p className="text-emerald-800 font-medium">
                  ✓ Your interests have been saved to your profile!
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
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