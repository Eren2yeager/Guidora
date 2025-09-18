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
      setStreams(data.streams);
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
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading course data...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update the course information below
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Basic Information */}
          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Course Name *</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Course Code *</label>
            <input
              type="text"
              name="code"
              id="code"
              required
              value={formData.code}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="streamId" className="block text-sm font-medium text-gray-700">Stream *</label>
            <select
              name="streamId"
              id="streamId"
              required
              value={formData.streamId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a stream</option>
              {streams.map((stream) => (
                <option key={stream._id} value={stream._id}>{stream.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="level" className="block text-sm font-medium text-gray-700">Level *</label>
            <select
              name="level"
              id="level"
              required
              value={formData.level}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="PreU">Pre-University</option>
              <option value="UG">Undergraduate</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Eligibility */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Eligibility</h3>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="eligibility.minMarks" className="block text-sm font-medium text-gray-700">Minimum Marks (%)</label>
            <input
              type="number"
              name="eligibility.minMarks"
              id="eligibility.minMarks"
              min="0"
              max="100"
              value={formData.eligibility.minMarks}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="eligibility.requiredSubjects" className="block text-sm font-medium text-gray-700">Required Subjects</label>
            <input
              type="text"
              name="eligibility.requiredSubjects"
              id="eligibility.requiredSubjects"
              value={formData.eligibility.requiredSubjects.join(', ')}
              onChange={(e) => handleArrayChange('eligibility.requiredSubjects', e.target.value)}
              placeholder="Enter subjects separated by commas"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Outcomes */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Career Outcomes</h3>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="outcomes.careers" className="block text-sm font-medium text-gray-700">Careers</label>
            <input
              type="text"
              name="outcomes.careers"
              id="outcomes.careers"
              value={formData.outcomes.careers.join(', ')}
              onChange={(e) => handleArrayChange('outcomes.careers', e.target.value)}
              placeholder="Enter careers separated by commas"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="outcomes.govtExams" className="block text-sm font-medium text-gray-700">Government Exams</label>
            <input
              type="text"
              name="outcomes.govtExams"
              id="outcomes.govtExams"
              value={formData.outcomes.govtExams.join(', ')}
              onChange={(e) => handleArrayChange('outcomes.govtExams', e.target.value)}
              placeholder="Enter exams separated by commas"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="outcomes.privateJobs" className="block text-sm font-medium text-gray-700">Private Jobs</label>
            <input
              type="text"
              name="outcomes.privateJobs"
              id="outcomes.privateJobs"
              value={formData.outcomes.privateJobs.join(', ')}
              onChange={(e) => handleArrayChange('outcomes.privateJobs', e.target.value)}
              placeholder="Enter jobs separated by commas"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="outcomes.higherStudies" className="block text-sm font-medium text-gray-700">Higher Studies</label>
            <input
              type="text"
              name="outcomes.higherStudies"
              id="outcomes.higherStudies"
              value={formData.outcomes.higherStudies.join(', ')}
              onChange={(e) => handleArrayChange('outcomes.higherStudies', e.target.value)}
              placeholder="Enter higher studies options separated by commas"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="outcomes.entrepreneurship" className="block text-sm font-medium text-gray-700">Entrepreneurship Opportunities</label>
            <input
              type="text"
              name="outcomes.entrepreneurship"
              id="outcomes.entrepreneurship"
              value={formData.outcomes.entrepreneurship.join(', ')}
              onChange={(e) => handleArrayChange('outcomes.entrepreneurship', e.target.value)}
              placeholder="Enter opportunities separated by commas"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Tags */}
          <div className="sm:col-span-6">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => handleArrayChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Media */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Media</h3>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="media.iconUrl" className="block text-sm font-medium text-gray-700">Icon URL</label>
            <input
              type="url"
              name="media.iconUrl"
              id="media.iconUrl"
              value={formData.media.iconUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="media.bannerUrl" className="block text-sm font-medium text-gray-700">Banner URL</label>
            <input
              type="url"
              name="media.bannerUrl"
              id="media.bannerUrl"
              value={formData.media.bannerUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Status */}
          <div className="sm:col-span-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Active</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={() => router.push('/admin/courses')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}