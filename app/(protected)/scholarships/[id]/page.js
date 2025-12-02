"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingLibraryIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CalendarIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { gradients } from '@/lib/design-tokens';
import { calculateDeadlineUrgency } from '@/lib/utils';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ScholarshipDetailPage() {
  const { id } = useParams();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerError, setBannerError] = useState(false);
  const [iconError, setIconError] = useState(false);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        console.log('Fetching scholarship:', id);
        const res = await fetch(`/api/scholarships/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch scholarship details');
        }
        const data = await res.json();
        console.log('Scholarship data:', data);
        setScholarship(data.data);
      } catch (err) {
        console.error('Error fetching scholarship:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchScholarship();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center">
        <Card variant="elevated" padding="lg" className="max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Scholarship</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/scholarships">
            <Button variant="primary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Scholarships
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center">
        <Card variant="elevated" padding="lg" className="max-w-md text-center">
          <div className="text-gray-400 mb-4">
            <AcademicCapIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Scholarship Not Found</h2>
          <p className="text-gray-600 mb-6">The scholarship you're looking for doesn't exist or has been removed.</p>
          <Link href="/scholarships">
            <Button variant="primary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Scholarships
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const nextDeadline = scholarship.deadlines?.[0]?.endDate 
    ? new Date(scholarship.deadlines[0].endDate) 
    : null;
  const urgency = nextDeadline ? calculateDeadlineUrgency(nextDeadline) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/scholarships">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeftIcon className="h-4 w-4" />} className="mb-6">
              Back to Scholarships
            </Button>
          </Link>
        </motion.div>

        {/* Scholarship Header */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="none" className="overflow-hidden mb-8">
            <div className="relative h-64 w-full">
              {scholarship.media?.bannerUrl && !bannerError ? (
                <Image 
                  src={scholarship.media.bannerUrl} 
                  alt={scholarship.name}
                  fill
                  className="object-cover"
                  onError={() => setBannerError(true)}
                  priority
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-r ${gradients.success}`}></div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                <div className="p-6 sm:p-8 w-full">
                  <div className="flex items-center gap-4">
                    {scholarship.media?.iconUrl && !iconError ? (
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-white p-2 shrink-0 shadow-lg">
                        <Image 
                          src={scholarship.media.iconUrl} 
                          alt={`${scholarship.name} icon`} 
                          width={80}
                          height={80}
                          className="object-contain w-full h-full"
                          onError={() => setIconError(true)}
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-white shrink-0 flex items-center justify-center shadow-lg">
                        <AcademicCapIcon className="w-12 h-12 text-emerald-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 line-clamp-2">{scholarship.name}</h1>
                      <div className="flex flex-wrap items-center gap-2">
                        {scholarship.providerType && (
                          <Badge variant="solid-primary" size="md">
                            {scholarship.providerType}
                          </Badge>
                        )}
                        {scholarship.benefits?.amount > 0 && (
                          <Badge variant="solid-success" size="md">
                            <CurrencyRupeeIcon className="h-4 w-4 mr-1 inline" />
                            {scholarship.benefits.amount.toLocaleString()}
                          </Badge>
                        )}
                        {urgency && (
                          <Badge 
                            variant={
                              urgency === 'urgent' ? 'solid-danger' : 
                              urgency === 'soon' ? 'solid-warning' : 
                              'solid-primary'
                            }
                            size="md"
                          >
                            {urgency === 'urgent' && '🔥 Urgent'}
                            {urgency === 'soon' && '⚠️ Closing Soon'}
                            {urgency === 'normal' && 'Open'}
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

        {/* Scholarship Details */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {scholarship.description && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AcademicCapIcon className="h-6 w-6 text-emerald-600" />
                      About This Scholarship
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{scholarship.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Benefits */}
            {scholarship.benefits && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CurrencyRupeeIcon className="h-6 w-6 text-emerald-600" />
                      Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scholarship.benefits.amount > 0 && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 text-center">
                          <p className="text-sm text-gray-600 mb-2">Scholarship Amount</p>
                          <p className="text-4xl font-bold text-emerald-600">
                            {scholarship.benefits.currency} {scholarship.benefits.amount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {scholarship.benefits.coverage && scholarship.benefits.coverage.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Coverage Includes:</p>
                          <div className="flex flex-wrap gap-2">
                            {scholarship.benefits.coverage.map((item, idx) => (
                              <Badge key={idx} variant="success">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {scholarship.benefits.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Additional Notes:</p>
                          <p className="text-gray-600">{scholarship.benefits.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Eligibility */}
            {scholarship.eligibility && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                      Eligibility Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {scholarship.eligibility.minMarks > 0 && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-sm text-gray-600 mb-1">Minimum Marks</p>
                          <p className="text-xl font-bold text-emerald-600">{scholarship.eligibility.minMarks}%</p>
                        </div>
                      )}
                      {scholarship.eligibility.incomeCap > 0 && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-sm text-gray-600 mb-1">Income Cap</p>
                          <p className="text-xl font-bold text-emerald-600">₹{scholarship.eligibility.incomeCap.toLocaleString()}</p>
                        </div>
                      )}
                      {scholarship.eligibility.state && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-sm text-gray-600 mb-1">State</p>
                          <p className="text-lg font-semibold text-gray-900">{scholarship.eligibility.state}</p>
                        </div>
                      )}
                      {scholarship.eligibility.stream && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-sm text-gray-600 mb-1">Stream</p>
                          <p className="text-lg font-semibold text-gray-900">{scholarship.eligibility.stream}</p>
                        </div>
                      )}
                      {scholarship.eligibility.gender && scholarship.eligibility.gender !== 'Any' && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-sm text-gray-600 mb-1">Gender</p>
                          <p className="text-lg font-semibold text-gray-900">{scholarship.eligibility.gender}</p>
                        </div>
                      )}
                      {scholarship.eligibility.ageLimit && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-sm text-gray-600 mb-1">Age Limit</p>
                          <p className="text-lg font-semibold text-gray-900">{scholarship.eligibility.ageLimit} years</p>
                        </div>
                      )}
                    </div>
                    {scholarship.eligibility.reservation && scholarship.eligibility.reservation.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Reservation Categories:</p>
                        <div className="flex flex-wrap gap-2">
                          {scholarship.eligibility.reservation.map((cat) => (
                            <Badge key={cat} variant="secondary">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Related Colleges */}
            {scholarship.relatedColleges && scholarship.relatedColleges.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BuildingLibraryIcon className="h-6 w-6 text-emerald-600" />
                      Related Colleges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {scholarship.relatedColleges.map((college) => (
                        <div key={college._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{college.name}</p>
                          {college.address && (
                            <p className="text-xs text-gray-500 mt-1">{college.address.district}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Related Careers */}
            {scholarship.relatedCareers && scholarship.relatedCareers.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BriefcaseIcon className="h-6 w-6 text-emerald-600" />
                      Related Careers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {scholarship.relatedCareers.map((career) => (
                        <Link 
                          key={career._id} 
                          href={`/careers/${career.slug}`}
                          className="block p-3 bg-gray-50 hover:bg-emerald-50 rounded-lg border border-gray-200 hover:border-emerald-200 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 hover:text-emerald-600">
                            {career.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Deadlines & Additional Info */}
          <div className="space-y-6">
            {/* Deadlines */}
            {scholarship.deadlines && scholarship.deadlines.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-6 w-6 text-emerald-600" />
                      Important Dates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scholarship.deadlines.map((deadline, idx) => {
                        const endDate = deadline.endDate ? new Date(deadline.endDate) : null;
                        const startDate = deadline.startDate ? new Date(deadline.startDate) : null;
                        const deadlineUrgency = endDate ? calculateDeadlineUrgency(endDate) : null;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-lg border ${
                              deadlineUrgency === 'urgent' 
                                ? 'bg-red-50 border-red-200' 
                                : deadlineUrgency === 'soon' 
                                ? 'bg-amber-50 border-amber-200' 
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            {startDate && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-600">Start Date</p>
                                <p className="text-sm font-semibold text-gray-900">{startDate.toLocaleDateString()}</p>
                              </div>
                            )}
                            {endDate && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-600">End Date</p>
                                <p className={`text-sm font-semibold ${
                                  deadlineUrgency === 'urgent' 
                                    ? 'text-red-700' 
                                    : deadlineUrgency === 'soon' 
                                    ? 'text-amber-700' 
                                    : 'text-blue-700'
                                }`}>
                                  {endDate.toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            {deadline.link && (
                              <a 
                                href={deadline.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <LinkIcon className="h-3 w-3" />
                                Application Link
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Interest Tags */}
            {scholarship.interestTags && scholarship.interestTags.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserGroupIcon className="h-6 w-6 text-emerald-600" />
                      Interest Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {scholarship.interestTags.map((tag, index) => (
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
                gradient={gradients.success}
                padding="lg"
                className="text-white"
              >
                <h2 className="text-xl font-bold mb-2">Ready to Apply?</h2>
                <p className="mb-4 text-emerald-50">Connect with a counselor to get help with your application.</p>
                <Button 
                  variant="outline" 
                  className="w-full bg-white text-emerald-700 border-white hover:bg-emerald-50"
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
