'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditCourse() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [streams, setStreams] = useState([]);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    streamId: '',
    level: 'UG',
    description: '',
    eligibility: {
      minMarks: 0,
      requiredSubjects: []
    },
    outcomes: {
      careers: [],
      govtExams: [],
      privateJobs: [],
      higherStudies: [],
      entrepreneurship: []
    },
    tags: [],
    media: {
      iconUrl: '',
      bannerUrl: ''
    },
    isActive: true
  });

  useEffect(() => {
    Promise.all([
      fetchStreams(),
      fetchCourse()
    ]);
  }, [id]);

  const fetchStreams = async () => {
    try {
      const response = await fetch('/api/admin/streams');
      if (!response.ok) {
        throw new Error('Failed to fetch streams');
      }
      const data = await response.json();
      setStreams(data);
    } catch (error) {
      console.error('Error fetching streams:', error);
      setError('Failed to load streams. Please try again.');
    }
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/admin/courses/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    const values = value.split(',').map(item => item.trim()).filter(Boolean);
    const [parent, child] = field.split('.');
    
    if (child) {
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: values
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: values
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update course');
      }

      router.push('/admin/courses');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Course</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update the course information below.
        </p>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        {/* Form fields are identical to the NewCourse component */}
        {/* Copy all form fields from NewCourse and paste them here */}
        {/* The only differences are the page title, submit button text, and initial data loading */}
      </form>
    </div>
  );
}