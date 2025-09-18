'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserCircleIcon, PencilIcon, AcademicCapIcon, BookOpenIcon, HeartIcon, StarIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/contexts/ToastContext';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    image : '',
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
    subjects: [],
    interests: [],
    goals: []
  });
  
  // Fetch user data when session is available
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user) {
      // Fetch user profile data
      const fetchUserProfile = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const userData = await response.json();
            setFormData({
              name: userData.name || '',
              image : userData.image || '',
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
              subjects: userData.academics?.subjects || [],
              interests: userData.interests || [],
              goals: userData.goals || []
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

  const handleArrayChange = (e, field) => {
    const values = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [field]: values
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
          image : formData.image,
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
            },
            subjects: formData.subjects
          },
          interests: formData.interests,
          goals: formData.goals
        }),
      });

      if (response.ok) {
        toast('Profile updated successfully');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // This will prevent flash of content before redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt={formData.name || 'User'}
                    className="h-28 w-28 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full border-4 border-white shadow-lg bg-blue-100 flex items-center justify-center">
                    <UserCircleIcon className="h-20 w-20 text-blue-500" />
                  </div>
                )}
                <button 
                  className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
                  onClick={() => toast('Profile picture upload coming soon!')}
                >
                  <PencilIcon className="h-5 w-5 text-blue-600" />
                </button>
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold">{formData.name || session.user.name || 'User Profile'}</h1>
                <p className="text-blue-100 mt-1">
                  {session.user.email || session.user.phone || 'No contact information'}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.interests && formData.interests.length > 0 && (
                    <div className="bg-blue-700/50 text-white text-xs px-3 py-1 rounded-full">
                      {formData.interests.length} Interests
                    </div>
                  )}
                  {formData.goals && formData.goals.length > 0 && (
                    <div className="bg-blue-700/50 text-white text-xs px-3 py-1 rounded-full">
                      {formData.goals.length} Goals
                    </div>
                  )}
                  {formData.classLevel && (
                    <div className="bg-blue-700/50 text-white text-xs px-3 py-1 rounded-full">
                      Class {formData.classLevel}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-blue-100">
                  Complete your profile to get personalized recommendations
                </div>
              </div>
            </div>
          </div>

          {/* Profile completion indicator */}
          <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-yellow-800">Why complete your profile?</div>
                </div>
                <div className="mt-1">
                  <ul className="list-disc pl-5 text-xs text-yellow-700 space-y-1">
                    <li>Complete your profile to get job matches</li>
                    <li>Find the best education options based on your interests</li>
                    <li>Scholarship search: Find scholarships that match your profile</li>
                    <li>Bookmark colleges: Save colleges to easily compare them later</li>
                  </ul>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-xs font-medium text-yellow-800">67% complete</div>
                <div className="mt-1 w-24 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'personal' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Personal Info</span>
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'education' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <AcademicCapIcon className="h-5 w-5" />
                <span>Education</span>
              </button>
              <button
                onClick={() => setActiveTab('interests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'interests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <HeartIcon className="h-5 w-5" />
                <span>Interests & Goals</span>
              </button>
            </nav>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled={true} // Email should not be editable
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 rounded-l-md border border-r-0 border-gray-300">
                        +91
                      </span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        disabled={true} // Phone should not be editable
                        className="flex-1 border border-gray-300 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700 mb-1">Class/Level *</label>
                    <select
                      id="classLevel"
                      name="classLevel"
                      value={formData.classLevel}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    >
                      <option value="10">10th</option>
                      <option value="12">12th</option>
                      <option value="UG">Undergraduate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">10th Standard</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="tenthScore" className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                        <input
                          type="text"
                          id="tenthScore"
                          name="tenthScore"
                          value={formData.tenthScore}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="tenthBoard" className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                        <input
                          type="text"
                          id="tenthBoard"
                          name="tenthBoard"
                          value={formData.tenthBoard}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="tenthYear" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="number"
                          id="tenthYear"
                          name="tenthYear"
                          value={formData.tenthYear}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">12th Standard</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="twelfthScore" className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                        <input
                          type="text"
                          id="twelfthScore"
                          name="twelfthScore"
                          value={formData.twelfthScore}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="twelfthBoard" className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                        <input
                          type="text"
                          id="twelfthBoard"
                          name="twelfthBoard"
                          value={formData.twelfthBoard}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="twelfthYear" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="number"
                          id="twelfthYear"
                          name="twelfthYear"
                          value={formData.twelfthYear}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
                    <input
                      type="text"
                      id="subjects"
                      name="subjects"
                      value={formData.subjects.join(', ')}
                      onChange={(e) => handleArrayChange(e, 'subjects')}
                      disabled={!isEditing}
                      placeholder="Physics, Chemistry, Mathematics"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate subjects with commas</p>
                  </div>
                </div>
              </div>

              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Emergency Contact</h2>
                <p className="text-sm text-gray-600 mb-4">Contact this person for emergency information for your academic application</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="emergencyName"
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      id="emergencyPhone"
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Documents</h2>
                <p className="text-sm text-gray-600 mb-4">Complete this section for better college application</p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <p className="text-sm text-gray-700">No documents uploaded yet</p>
                  </div>
                </div>
              </div>

              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Preferences</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                    <input
                      type="text"
                      id="interests"
                      name="interests"
                      value={formData.interests.join(', ')}
                      onChange={(e) => handleArrayChange(e, 'interests')}
                      disabled={!isEditing}
                      placeholder="Science, Technology, Arts"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate interests with commas</p>
                  </div>
                  <div>
                    <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-1">Career Goals</label>
                    <input
                      type="text"
                      id="goals"
                      name="goals"
                      value={formData.goals.join(', ')}
                      onChange={(e) => handleArrayChange(e, 'goals')}
                      disabled={!isEditing}
                      placeholder="govt_exam, private_job, entrepreneurship, higher_study"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate goals with commas</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
                      >
                        <XCircleIcon className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="ml-3 px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Update</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </motion.div>


      </div>
    </div>
  );
}