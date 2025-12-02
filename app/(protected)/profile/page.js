'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserCircleIcon, PencilIcon, AcademicCapIcon, HeartIcon, BellIcon } from '@heroicons/react/24/solid';
import { useToast } from '@/contexts/ToastContext';
import PageContainer from '@/components/layout/PageContainer';
import { Card, Input, Button, Badge } from '@/components/ui';
import { fadeInUp } from '@/lib/animations';
import { calculateProfileCompletion } from '@/lib/utils';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    classLevel: '12',
    district: '',
    state: '',
    pincode: '',
    tenthScore: '',
    tenthBoard: '',
    tenthYear: '',
    twelfthScore: '',
    twelfthBoard: '',
    twelfthYear: '',
    interests: [],
    notificationPreferences: {
      deadlines: true,
      recommendations: true
    }
  });
  
  // Fetch user data when session is available
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const userData = await response.json();
            
            // Calculate profile completion
            const completion = calculateProfileCompletion(userData);
            setProfileCompletion(completion);
            
            // Identify missing fields
            const missing = [];
            if (!userData.name) missing.push({ field: 'Name', section: 'personal' });
            if (!userData.gender) missing.push({ field: 'Gender', section: 'personal' });
            if (!userData.dob) missing.push({ field: 'Date of Birth', section: 'personal' });
            if (!userData.location?.state) missing.push({ field: 'State', section: 'personal' });
            if (!userData.location?.district) missing.push({ field: 'District', section: 'personal' });
            if (!userData.academics?.twelfth?.score) missing.push({ field: '12th Score', section: 'education' });
            if (!userData.interests || userData.interests.length === 0) missing.push({ field: 'Interests', section: 'interests' });
            setMissingFields(missing);
            
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              gender: userData.gender || '',
              dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
              classLevel: userData.classLevel || '12',
              district: userData.location?.district || '',
              state: userData.location?.state || '',
              pincode: userData.location?.pincode || '',
              tenthScore: userData.academics?.tenth?.score || '',
              tenthBoard: userData.academics?.tenth?.board || '',
              tenthYear: userData.academics?.tenth?.year || '',
              twelfthScore: userData.academics?.twelfth?.score || '',
              twelfthBoard: userData.academics?.twelfth?.board || '',
              twelfthYear: userData.academics?.twelfth?.year || '',
              interests: userData.interests || [],
              notificationPreferences: userData.notificationPreferences || {
                deadlines: true,
                recommendations: true
              }
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      
      fetchUserProfile();
    }
  }, [status, router, session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (field) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [field]: !prev.notificationPreferences[field]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender,
          dob: formData.dob,
          classLevel: formData.classLevel,
          location: {
            district: formData.district,
            state: formData.state,
            pincode: formData.pincode
          },
          academics: {
            tenth: {
              score: formData.tenthScore,
              board: formData.tenthBoard,
              year: formData.tenthYear
            },
            twelfth: {
              score: formData.twelfthScore,
              board: formData.twelfthBoard,
              year: formData.twelfthYear
            }
          },
          interests: formData.interests,
          notificationPreferences: formData.notificationPreferences
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        // Recalculate profile completion
        const completion = calculateProfileCompletion(updatedData);
        setProfileCompletion(completion);
        
        // Trigger recommendation refresh
        try {
          await fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (err) {
          console.error('Error refreshing recommendations:', err);
        }
        
        toast('Profile updated successfully! Recommendations are being refreshed.');
        setIsEditing(false);
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast('An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PageContainer
      title="My Profile"
      description="Manage your personal information and preferences"
    >
      {/* Profile Completion Card */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-6">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
              <p className="text-sm text-gray-600 mt-1">
                Complete your profile to get better recommendations
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{profileCompletion}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>

          {missingFields.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Missing fields:</p>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((item, idx) => (
                  <Badge key={idx} variant="default">
                    {item.field}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Profile Form */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card variant="default" padding="lg">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UserCircleIcon className="h-6 w-6 text-blue-600" />
                Personal Information
              </h2>
              <div className="grid text-black grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  disabled={true}
                />
                <Input
                  label="Phone *"
                  value={formData.phone}
                  disabled={true}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Input
                  label="Date of Birth *"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Level *</label>
                  <select
                    name="classLevel"
                    value={formData.classLevel}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="10">10th</option>
                    <option value="12">12th</option>
                    <option value="UG">Undergraduate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., Jammu and Kashmir"
                />
                <Input
                  label="District"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., Srinagar"
                />
                <Input
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., 190001"
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                Academic Information
              </h2>
              
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-3">10th Standard</h3>
                <div className=" text-black grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Score/Percentage"
                    name="tenthScore"
                    value={formData.tenthScore}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., 85"
                  />
                  <Input
                    label="Board"
                    name="tenthBoard"
                    value={formData.tenthBoard}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., JKBOSE"
                  />
                  <Input
                    label="Year"
                    type="number"
                    name="tenthYear"
                    value={formData.tenthYear}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., 2020"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">12th Standard</h3>
                <div className=" text-black grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Score/Percentage"
                    name="twelfthScore"
                    value={formData.twelfthScore}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., 90"
                  />
                  <Input
                    label="Board"
                    name="twelfthBoard"
                    value={formData.twelfthBoard}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., JKBOSE"
                  />
                  <Input
                    label="Year"
                    type="number"
                    name="twelfthYear"
                    value={formData.twelfthYear}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., 2022"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BellIcon className="h-6 w-6 text-blue-600" />
                Notification Preferences
              </h2>
              <div className="space-y-3">
                <label className=" text-black flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences.deadlines}
                    onChange={() => handleNotificationChange('deadlines')}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Deadline Notifications</div>
                    <div className="text-xs text-gray-500">Get notified about upcoming scholarship and application deadlines</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificationPreferences.recommendations}
                    onChange={() => handleNotificationChange('recommendations')}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Recommendation Updates</div>
                    <div className="text-xs text-gray-500">Get notified when new recommendations are available</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                  leftIcon={<PencilIcon className="h-4 w-4" />}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </Card>
      </motion.div>
    </PageContainer>
  );
}
