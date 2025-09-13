'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCollege() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Government',
    affiliation: '',
    address: {
      line1: '',
      district: '',
      state: '',
      pincode: ''
    },
    location: {
      coordinates: [0, 0]
    },
    facilities: {
      hostel: false,
      lab: false,
      library: false,
      internet: false,
      medium: []
    },
    contacts: {
      phone: '',
      email: '',
      website: ''
    },
    meta: {
      rank: '',
      establishedYear: ''
    },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/colleges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create college');
      }

      router.push('/admin/colleges');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Add New College</h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the details to add a new college to the system.
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
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Basic Information */}
          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">College Name *</label>
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
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">College Code *</label>
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
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              id="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700">Affiliation</label>
            <input
              type="text"
              name="affiliation"
              id="affiliation"
              value={formData.affiliation}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Address</h3>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="address.line1" className="block text-sm font-medium text-gray-700">Address Line</label>
            <input
              type="text"
              name="address.line1"
              id="address.line1"
              value={formData.address.line1}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="address.district" className="block text-sm font-medium text-gray-700">District *</label>
            <input
              type="text"
              name="address.district"
              id="address.district"
              required
              value={formData.address.district}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">State *</label>
            <input
              type="text"
              name="address.state"
              id="address.state"
              required
              value={formData.address.state}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              name="address.pincode"
              id="address.pincode"
              value={formData.address.pincode}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Facilities */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Facilities</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="facilities.hostel"
                  id="facilities.hostel"
                  checked={formData.facilities.hostel}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="facilities.hostel" className="ml-2 block text-sm text-gray-700">Hostel</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="facilities.lab"
                  id="facilities.lab"
                  checked={formData.facilities.lab}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="facilities.lab" className="ml-2 block text-sm text-gray-700">Lab</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="facilities.library"
                  id="facilities.library"
                  checked={formData.facilities.library}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="facilities.library" className="ml-2 block text-sm text-gray-700">Library</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="facilities.internet"
                  id="facilities.internet"
                  checked={formData.facilities.internet}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="facilities.internet" className="ml-2 block text-sm text-gray-700">Internet</label>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Contact Information</h3>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="contacts.phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="contacts.phone"
              id="contacts.phone"
              value={formData.contacts.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="contacts.email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="contacts.email"
              id="contacts.email"
              value={formData.contacts.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="contacts.website" className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              name="contacts.website"
              id="contacts.website"
              value={formData.contacts.website}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Meta Information */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Information</h3>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="meta.rank" className="block text-sm font-medium text-gray-700">Rank</label>
            <input
              type="number"
              name="meta.rank"
              id="meta.rank"
              value={formData.meta.rank}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="meta.establishedYear" className="block text-sm font-medium text-gray-700">Established Year</label>
            <input
              type="number"
              name="meta.establishedYear"
              id="meta.establishedYear"
              value={formData.meta.establishedYear}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

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

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/colleges')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create College'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}