"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  LightBulbIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TrophyIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { gradients } from '@/lib/design-tokens';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function CareerDetailPage() {
  const { slug } = useParams();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerError, setBannerError] = useState(false);
  const [iconError, setIconError] = useState(false);

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        console.log('Fetching career:', slug);
        const res = await fetch(`/api/careers/${slug}`);
        if (!res.ok) {
          throw new Error('Failed to fetch career details');
        }
        const data = await res.json();
        console.log('Career data:', data);
        setCareer(data.data);
      } catch (err) {
        console.error('Error fetching career:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCareer();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton width="120px" height="40px" className="mb-6" />
          <Card variant="elevated" padding="none" className="mb-8">
            <Skeleton height="256px" className="rounded-none" />
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card variant="elevated" padding="lg">
                <SkeletonText lines={4} />
              </Card>
              <Card variant="elevated" padding="lg">
                <SkeletonText lines={3} />
              </Card>
            </div>
            <div className="space-y-6">
              <Card variant="elevated" padding="lg">
                <SkeletonText lines={5} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 flex items-center justify-center">
        <Card variant="elevated" padding="lg" className="max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Career</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/careers">
            <Button variant="primary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Careers
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 flex items-center justify-center">
        <Card variant="elevated" padding="lg" className="max-w-md text-center">
          <div className="text-gray-400 mb-4">
            <BriefcaseIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Career Not Found</h2>
          <p className="text-gray-600 mb-6">The career you're looking for doesn't exist or has been removed.</p>
          <Link href="/careers">
            <Button variant="primary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Careers
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/careers">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeftIcon className="h-4 w-4" />} className="mb-6">
              Back to Careers
            </Button>
          </Link>
        </motion.div>

        {/* Career Header */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="none" className="overflow-hidden mb-8">
            <div className="relative h-64 w-full">
              {career.media?.bannerUrl && !bannerError ? (
                <Image 
                  src={career.media.bannerUrl} 
                  alt={career.name}
                  fill
                  className="object-cover"
                  onError={() => setBannerError(true)}
                  priority
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-r ${gradients.secondary}`}></div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                <div className="p-6 sm:p-8 w-full">
                  <div className="flex items-center gap-4">
                    {career.media?.iconUrl && !iconError ? (
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-white p-2 shrink-0 shadow-lg">
                        <Image 
                          src={career.media.iconUrl} 
                          alt={`${career.name} icon`} 
                          width={80}
                          height={80}
                          className="object-contain w-full h-full"
                          onError={() => setIconError(true)}
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-white shrink-0 flex items-center justify-center shadow-lg">
                        <BriefcaseIcon className="w-12 h-12 text-purple-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 line-clamp-2">{career.name}</h1>
                      <div className="flex flex-wrap items-center gap-2">
                        {career.growthTrend && (
                          <Badge 
                            variant={
                              career.growthTrend === 'Growing' ? 'solid-success' : 
                              career.growthTrend === 'Declining' ? 'solid-danger' : 
                              'solid-warning'
                            }
                            size="md"
                          >
                            {career.growthTrend}
                          </Badge>
                        )}
                        {career.medianPayBand && career.medianPayBand.max > 0 && (
                          <Badge variant="solid-success" size="md">
                            <CurrencyRupeeIcon className="h-4 w-4 mr-1 inline" />
                            {career.medianPayBand.min.toLocaleString()} - {career.medianPayBand.max.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Career Details */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {career.description && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LightBulbIcon className="h-6 w-6 text-purple-600" />
                      About This Career
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{career.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Sectors */}
            {career.sectors && career.sectors.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                      Industry Sectors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {career.sectors.map((sector) => (
                        <Badge key={sector} variant="primary">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Skills Required */}
            {career.skillsRequired && career.skillsRequired.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrophyIcon className="h-6 w-6 text-purple-600" />
                      Key Skills Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {career.skillsRequired.map((skill) => (
                        <div key={skill} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                          <span className="text-sm font-medium text-gray-900">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Entry Roles */}
            {career.entryRoles && career.entryRoles.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserGroupIcon className="h-6 w-6 text-purple-600" />
                      Entry-Level Roles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {career.entryRoles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Typical Courses */}
            {career.typicalCourses && career.typicalCourses.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                      Recommended Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {career.typicalCourses.map((course, idx) => (
                        <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                          <BookOpenIcon className="h-5 w-5 text-purple-600 mb-2" />
                          <h4 className="font-semibold text-gray-900">
                            {typeof course === 'string' ? course : course.name || 'Course'}
                          </h4>
                          {course.code && (
                            <p className="text-xs text-gray-500 font-mono mt-1">{course.code}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Salary Information */}
            {career.medianPayBand && career.medianPayBand.max > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
                      Salary Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 text-center">
                      <p className="text-sm text-gray-600 mb-2">Median Pay Band</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {career.medianPayBand.currency} {career.medianPayBand.min.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 my-2">to</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {career.medianPayBand.currency} {career.medianPayBand.max.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-3">per annum</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Growth Trend */}
            {career.growthTrend && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartBarIcon className="h-6 w-6 text-purple-600" />
                      Career Outlook
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`p-4 rounded-lg border ${
                      career.growthTrend === 'Growing' ? 'bg-emerald-50 border-emerald-200' :
                      career.growthTrend === 'Declining' ? 'bg-red-50 border-red-200' :
                      'bg-amber-50 border-amber-200'
                    }`}>
                      <p className="text-sm font-medium text-gray-900 mb-1">Growth Trend</p>
                      <p className={`text-2xl font-bold ${
                        career.growthTrend === 'Growing' ? 'text-emerald-600' :
                        career.growthTrend === 'Declining' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {career.growthTrend}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Related Careers */}
            {career.relatedCareers && career.relatedCareers.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BriefcaseIcon className="h-6 w-6 text-purple-600" />
                      Related Careers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {career.relatedCareers.map((relatedCareer) => (
                        <Link 
                          key={relatedCareer._id} 
                          href={`/careers/${relatedCareer.slug}`}
                          className="block p-3 bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 hover:text-purple-600">
                            {relatedCareer.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Interest Tags */}
            {career.interestTags && career.interestTags.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LightBulbIcon className="h-6 w-6 text-purple-600" />
                      Interest Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {career.interestTags.map((tag, index) => (
                        <Badge key={index} variant="primary">
                          {tag.name || tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Call to Action */}
            <motion.div variants={fadeInUp}>
              <Card 
                variant="gradient" 
                gradient={gradients.secondary}
                padding="lg"
                className="text-white"
              >
                <h2 className="text-xl font-bold mb-2">Interested in this career?</h2>
                <p className="mb-4 text-purple-50">Connect with a counselor to learn more about the path to this career.</p>
                <Button 
                  variant="outline" 
                  className="w-full bg-white text-purple-700 border-white hover:bg-purple-50"
                >
                  Talk to a Counselor
                </Button>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
