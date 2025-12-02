'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  BriefcaseIcon,
  DocumentTextIcon,
  BookmarkIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { toast } from 'react-hot-toast';

const levelConfig = {
  'PreU': { variant: 'primary', label: 'Pre-University' },
  'UG': { variant: 'success', label: 'Undergraduate' },
  'PG': { variant: 'secondary', label: 'Postgraduate' },
  'Diploma': { variant: 'warning', label: 'Diploma' },
  'Certificate': { variant: 'info', label: 'Certificate' },
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const code = params.code;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);

  // Fetch course details
  useEffect(() => {
    if (!code) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${code}`);
        if (!res.ok) throw new Error('Course not found');
        
        const data = await res.json();
        setCourse(data);
        setIsSaved(data.isSaved || false);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [code]);

  // Handle save/unsave
  const handleSaveToggle = async () => {
    if (!session) {
      toast.error('Please sign in to save courses');
      return;
    }

    setSavingState(true);
    try {
      const res = await fetch('/api/user/saved-courses', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course._id }),
      });

      if (!res.ok) throw new Error('Failed to update saved status');

      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Course removed from saved items' : 'Course saved successfully');
    } catch (err) {
      console.error('Error toggling save:', err);
      toast.error('Failed to update saved status');
    } finally {
      setSavingState(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The course you are looking for does not exist.'}</p>
            <Button onClick={() => router.push('/courses')}>
              Back to Courses
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            onClick={() => router.push('/courses')}
          >
            Back to Courses
          </Button>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Header Card */}
          <motion.div variants={fadeInUp}>
            <Card variant="elevated" padding="lg">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                      <BookOpenIcon className="h-10 w-10" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
                        {course.level && levelConfig[course.level] && (
                          <Badge variant={`solid-${levelConfig[course.level].variant}`}>
                            {levelConfig[course.level].label}
                          </Badge>
                        )}
                      </div>
                      {course.code && (
                        <p className="text-sm text-gray-500 font-mono mb-2">Code: {course.code}</p>
                      )}
                      {course.stream && (
                        <Badge variant="outline-primary" size="md">
                          {course.stream.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {course.description && (
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex-shrink-0">
                  <Button
                    variant={isSaved ? 'solid' : 'outline'}
                    size="lg"
                    leftIcon={isSaved ? <BookmarkSolidIcon className="h-5 w-5" /> : <BookmarkIcon className="h-5 w-5" />}
                    onClick={handleSaveToggle}
                    disabled={savingState}
                    className={isSaved ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {savingState ? 'Saving...' : isSaved ? 'Saved' : 'Save Course'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Eligibility Requirements */}
          {(course.eligibility?.minMarks > 0 || course.eligibility?.requiredSubjects?.length > 0) && (
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" padding="lg">
                <CardHeader className="mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                    <CardTitle>Eligibility Requirements</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.eligibility.minMarks > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700 font-medium">Minimum Marks:</span>
                        <Badge variant="solid-success" size="md">
                          {course.eligibility.minMarks}%
                        </Badge>
                      </div>
                    )}
                    {course.eligibility.requiredSubjects?.length > 0 && (
                      <div>
                        <span className="text-gray-700 font-medium block mb-2">Required Subjects:</span>
                        <div className="flex flex-wrap gap-2">
                          {course.eligibility.requiredSubjects.map((subject, idx) => (
                            <Badge key={idx} variant="outline-primary" size="md">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Career Outcomes */}
          {course.outcomes?.careers?.length > 0 && (
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" padding="lg">
                <CardHeader className="mb-4">
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="h-6 w-6 text-purple-600" />
                    <CardTitle>Career Opportunities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.outcomes.careers.map((career) => (
                      <div
                        key={career._id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => router.push(`/careers/${career.slug}`)}
                      >
                        <h4 className="font-semibold text-gray-900 mb-1">{career.name}</h4>
                        {career.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{career.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Entrance Exams */}
          {course.outcomes?.Exams?.length > 0 && (
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" padding="lg">
                <CardHeader className="mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-amber-600" />
                    <CardTitle>Entrance Exams</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.outcomes.Exams.map((exam) => (
                      <div
                        key={exam._id}
                        className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                      >
                        <h4 className="font-semibold text-gray-900">{exam.name}</h4>
                        {exam.code && (
                          <p className="text-xs text-gray-500 font-mono mt-1">{exam.code}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Higher Studies */}
          {course.outcomes?.higherStudies?.length > 0 && (
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" padding="lg">
                <CardHeader className="mb-4">
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                    <CardTitle>Higher Studies Options</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.outcomes.higherStudies.map((higherCourse) => (
                      <div
                        key={higherCourse._id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => router.push(`/courses/${higherCourse.code}`)}
                      >
                        <h4 className="font-semibold text-gray-900 mb-1">{higherCourse.name}</h4>
                        {higherCourse.level && levelConfig[higherCourse.level] && (
                          <Badge variant={`outline-${levelConfig[higherCourse.level].variant}`} size="sm">
                            {levelConfig[higherCourse.level].label}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Interest Tags */}
          {course.interestTags?.length > 0 && (
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" padding="lg">
                <CardHeader className="mb-4">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-6 w-6 text-cyan-600" />
                    <CardTitle>Related Interests</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.interestTags.map((tag) => (
                      <Badge key={tag._id} variant="default" size="md">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
