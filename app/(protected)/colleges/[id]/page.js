"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  HomeModernIcon,
  BeakerIcon,
  BookOpenIcon,
  WifiIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
  UserGroupIcon
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

// Facility icon component
const FacilityIcon = ({ name, available }) => {
  const icons = {
    hostel: HomeModernIcon,
    lab: BeakerIcon,
    library: BookOpenIcon,
    internet: WifiIcon,
  };

  const Icon = icons[name];

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${
      available 
        ? 'bg-blue-50 border-blue-200 text-blue-700' 
        : 'bg-gray-50 border-gray-200 text-gray-400'
    }`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{name.charAt(0).toUpperCase() + name.slice(1)}</span>
      {available ? (
        <CheckCircleIcon className="w-4 h-4 ml-auto text-green-500" />
      ) : (
        <XCircleIcon className="w-4 h-4 ml-auto" />
      )}
    </div>
  );
};

export default function CollegeDetailPage() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerError, setBannerError] = useState(false);
  const [iconError, setIconError] = useState(false);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        console.log('Fetching college:', id);
        const res = await fetch(`/api/colleges/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch college details');
        }
        const data = await res.json();
        console.log('College data:', data);
        setCollege(data.data);
      } catch (err) {
        console.error('Error fetching college:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCollege();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <Card variant="elevated" padding="lg" className="max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading College</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/colleges">
            <Button variant="primary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Colleges
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <Card variant="elevated" padding="lg" className="max-w-md text-center">
          <div className="text-gray-400 mb-4">
            <BuildingLibraryIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">College Not Found</h2>
          <p className="text-gray-600 mb-6">The college you're looking for doesn't exist or has been removed.</p>
          <Link href="/colleges">
            <Button variant="primary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Colleges
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/colleges">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeftIcon className="h-4 w-4" />} className="mb-6">
              Back to Colleges
            </Button>
          </Link>
        </motion.div>

        {/* College Header */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="none" className="overflow-hidden mb-8">
            <div className="relative h-64 w-full">
              {college.media?.bannerUrl && !bannerError ? (
                <Image 
                  src={college.media.bannerUrl} 
                  alt={college.name}
                  fill
                  className="object-cover"
                  onError={() => setBannerError(true)}
                  priority
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-r ${gradients.primary}`}></div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                <div className="p-6 sm:p-8 w-full">
                  <div className="flex items-center gap-4">
                    {college.media?.iconUrl && !iconError ? (
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-white p-2 flex-shrink-0 shadow-lg">
                        <Image 
                          src={college.media.iconUrl} 
                          alt={`${college.name} logo`} 
                          width={80}
                          height={80}
                          className="object-contain w-full h-full"
                          onError={() => setIconError(true)}
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-white flex-shrink-0 flex items-center justify-center shadow-lg">
                        <BuildingLibraryIcon className="w-12 h-12 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 line-clamp-2">{college.name}</h1>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge 
                          variant={college.type === 'Government' ? 'solid-success' : 'solid-secondary'}
                          size="md"
                        >
                          {college.type}
                        </Badge>
                        <div className="flex items-center text-white text-sm gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{college.address.district}, {college.address.state}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* College Details */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Overview */}
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" padding="lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Established</h3>
                      <p className="text-lg font-semibold text-gray-900">{college.meta?.establishedYear || 'Not available'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">College Code</h3>
                      <p className="text-lg font-semibold text-gray-900 font-mono">{college.code}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Rank</h3>
                      <p className="text-lg font-semibold text-gray-900">{college.meta?.rank ? `#${college.meta.rank}` : 'Not ranked'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Fees Range</h3>
                      <p className="text-lg font-semibold text-gray-900">{college.feesRange || 'Not available'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Facilities */}
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" padding="lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
                    Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <FacilityIcon name="hostel" available={college.facilities?.hostel} />
                    <FacilityIcon name="lab" available={college.facilities?.lab} />
                    <FacilityIcon name="library" available={college.facilities?.library} />
                    <FacilityIcon name="internet" available={college.facilities?.internet} />
                  </div>
                  {college.facilities?.medium && college.facilities.medium.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Medium of Instruction</h3>
                      <div className="flex flex-wrap gap-2">
                        {college.facilities.medium.map((medium, index) => (
                          <Badge key={index} variant="default">
                            {medium}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Placement */}
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" padding="lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CurrencyRupeeIcon className="h-6 w-6 text-blue-600" />
                    Placement Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 text-center">
                      <h3 className="text-xs font-medium text-gray-600 mb-2">Average Package</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {college.placement?.averagePackage ? `₹${college.placement.averagePackage.toLocaleString('en-IN')}` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100 text-center">
                      <h3 className="text-xs font-medium text-gray-600 mb-2">Highest Package</h3>
                      <p className="text-2xl font-bold text-emerald-600">
                        {college.placement?.highestPackage ? `₹${college.placement.highestPackage.toLocaleString('en-IN')}` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100 text-center">
                      <h3 className="text-xs font-medium text-gray-600 mb-2">Placement Rate</h3>
                      <p className="text-2xl font-bold text-purple-600">
                        {college.placement?.placementRate ? `${college.placement.placementRate}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Contact & Additional Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" padding="lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PhoneIcon className="h-6 w-6 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {college.contacts?.phone && (
                      <li className="flex items-start gap-3">
                        <PhoneIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                          <a href={`tel:${college.contacts.phone}`} className="text-gray-900 hover:text-blue-600">
                            {college.contacts.phone}
                          </a>
                        </div>
                      </li>
                    )}
                    {college.contacts?.email && (
                      <li className="flex items-start gap-3">
                        <EnvelopeIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Email</p>
                          <a href={`mailto:${college.contacts.email}`} className="text-gray-900 hover:text-blue-600 break-all">
                            {college.contacts.email}
                          </a>
                        </div>
                      </li>
                    )}
                    {college.contacts?.website && (
                      <li className="flex items-start gap-3">
                        <GlobeAltIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Website</p>
                          <a 
                            href={college.contacts.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline break-all"
                          >
                            {college.contacts.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </li>
                    )}
                    <li className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Address</p>
                        <span className="text-gray-900">
                          {college.address.line1 && <>{college.address.line1}, <br /></>}
                          {college.address.district}, {college.address.state}
                          {college.address.pincode && <>, {college.address.pincode}</>}
                        </span>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interest Tags */}
            {college.interestTags && college.interestTags.length > 0 && (
              <motion.div variants={fadeInUp}>
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      Interest Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {college.interestTags.map((tag, index) => (
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
                gradient={gradients.primary}
                padding="lg"
                className="text-white"
              >
                <h2 className="text-xl font-bold mb-2">Interested in this college?</h2>
                <p className="mb-4 text-blue-50">Connect with a counselor to learn more about admission process and eligibility.</p>
                <Button 
                  variant="outline" 
                  className="w-full bg-white text-blue-700 border-white hover:bg-blue-50"
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