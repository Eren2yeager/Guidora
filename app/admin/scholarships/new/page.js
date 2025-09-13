'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewScholarship() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    provider: 'Gov',
    description: '',
    eligibility: {
      minMarks: 0,
      incomeCap: 0,
      state: '',
      stream: '',
      reservation: ''
    },
    benefits: {
      amount: 0,
      coverage: ''
    },
    deadlines: [{
      startDate: '',
      endDate: '',
      link: ''
    }],
    tags: '',
    isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDeadlineChange = (index, field, value) => {
    setFormData(prev => {
      const newDeadlines = [...prev.deadlines];
      newDeadlines[index] = {
        ...newDeadlines[index],
        [field]: value
      };
      return { ...prev, deadlines: newDeadlines };
    });
  };

  const addDeadline = () => {
    setFormData(prev => ({
      ...prev,
      deadlines: [...prev.deadlines, { startDate: '', endDate: '', link: '' }]
    }));
  };

  const removeDeadline = (index) => {
    setFormData(prev => ({
      ...prev,
      deadlines: prev.deadlines.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const processedData = {
        ...formData,
        eligibility: {
          ...formData.eligibility,
          reservation: formData.eligibility.reservation.split(',').map(item => item.trim()).filter(Boolean)
        },
        benefits: {
          ...formData.benefits,
          coverage: formData.benefits.coverage.split(',').map(item => item.trim()).filter(Boolean)
        },
        tags: formData.tags.split(',').map(item => item.trim()).filter(Boolean),
        lastUpdated: new Date()
      };

      const response = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create scholarship');
      }

      router.push('/admin/scholarships');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Add New Scholarship</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Provider</label>
          <select
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Gov">Government</option>
            <option value="College">College</option>
            <option value="NGO">NGO</option>
            <option value="Private">Private</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Marks</label>
            <input
              type="number"
              name="eligibility.minMarks"
              value={formData.eligibility.minMarks}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Income Cap</label>
            <input
              type="number"
              name="eligibility.incomeCap"
              value={formData.eligibility.incomeCap}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              name="eligibility.state"
              value={formData.eligibility.state}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stream</label>
            <input
              type="text"
              name="eligibility.stream"
              value={formData.eligibility.stream}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reservation Categories (comma-separated)</label>
          <input
            type="text"
            name="eligibility.reservation"
            value={formData.eligibility.reservation}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Scholarship Amount</label>
            <input
              type="number"
              name="benefits.amount"
              value={formData.benefits.amount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Coverage (comma-separated)</label>
            <input
              type="text"
              name="benefits.coverage"
              value={formData.benefits.coverage}
              onChange={handleChange}
              placeholder="tuition, hostel, books"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deadlines</label>
          {formData.deadlines.map((deadline, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500">Start Date</label>
                <input
                  type="date"
                  value={deadline.startDate}
                  onChange={(e) => handleDeadlineChange(index, 'startDate', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">End Date</label>
                <input
                  type="date"
                  value={deadline.endDate}
                  onChange={(e) => handleDeadlineChange(index, 'endDate', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Link</label>
                <div className="flex">
                  <input
                    type="url"
                    value={deadline.link}
                    onChange={(e) => handleDeadlineChange(index, 'link', e.target.value)}
                    className="mt-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeDeadline(index)}
                      className="mt-1 px-3 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addDeadline}
            className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Add Deadline
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Active</label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/scholarships')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Scholarship'}
          </button>
        </div>
      </form>
    </div>
  );
}