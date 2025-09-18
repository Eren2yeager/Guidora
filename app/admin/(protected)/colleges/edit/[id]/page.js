"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCollege() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "Government",
    affiliation: "",
    address: {
      line1: "",
      district: "",
      state: "",
      pincode: "",
    },
    location: {
      coordinates: [0, 0],
    },
    facilities: {
      hostel: false,
      lab: false,
      library: false,
      internet: false,
      medium: [],
    },
    contacts: {
      phone: "",
      email: "",
      website: "",
    },
    meta: {
      rank: "",
      establishedYear: "",
    },
    isActive: true,
  });

  useEffect(() => {
    fetchCollege();
  }, [id]);

  const fetchCollege = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/admin/colleges/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch college");
      }

      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error("Error fetching college:", error);
      setError("Failed to load college. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/colleges/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update college");
      }

      router.push("/admin/colleges");
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
        <h1 className="text-2xl font-semibold text-gray-900">Edit College</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update the college information below.
        </p>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6"
      >
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Basic Information */}
          <div className="sm:col-span-3">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              College Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              College Code *
            </label>
            <input
              type="text"
              name="code"
              id="code"
              required
              value={formData.code}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type
            </label>
            <select
              name="type"
              id="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            >
              <option className="text-black rounded-md" value="Government">
                Government
              </option>
              <option className="text-black rounded-md" value="Private">
                Private
              </option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="affiliation"
              className="block text-sm font-medium text-gray-700"
            >
              Affiliation
            </label>
            <input
              type="text"
              name="affiliation"
              id="affiliation"
              value={formData.affiliation}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Address
            </h3>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="address.line1"
              className="block text-sm font-medium text-gray-700"
            >
              Address Line
            </label>
            <input
              type="text"
              name="address.line1"
              id="address.line1"
              value={formData.address.line1}
              onChange={handleChange}
              placeholder="Enter complete address"
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="address.district"
              className="block text-sm font-medium text-gray-700"
            >
              District *
            </label>
            <input
              type="text"
              name="address.district"
              id="address.district"
              required
              value={formData.address.district}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="address.state"
              className="block text-sm font-medium text-gray-700"
            >
              State *
            </label>
            <input
              type="text"
              name="address.state"
              id="address.state"
              required
              value={formData.address.state}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address.pincode"
              className="block text-sm font-medium text-gray-700"
            >
              Pincode
            </label>
            <input
              type="text"
              name="address.pincode"
              id="address.pincode"
              value={formData.address.pincode}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          {/* Facilities */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Facilities
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 transition-all duration-200">
                <input
                  type="checkbox"
                  name="facilities.hostel"
                  id="facilities.hostel"
                  checked={formData.facilities.hostel}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200 cursor-pointer"
                />
                <label
                  htmlFor="facilities.hostel"
                  className="ml-3 flex items-center text-gray-700 cursor-pointer select-none"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  Hostel
                </label>
              </div>

              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 transition-all duration-200">
                <input
                  type="checkbox"
                  name="facilities.lab"
                  id="facilities.lab"
                  checked={formData.facilities.lab}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200 cursor-pointer"
                />
                <label
                  htmlFor="facilities.lab"
                  className="ml-3 flex items-center text-gray-700 cursor-pointer select-none"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                  Lab
                </label>
              </div>

              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 transition-all duration-200">
                <input
                  type="checkbox"
                  name="facilities.library"
                  id="facilities.library"
                  checked={formData.facilities.library}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200 cursor-pointer"
                />
                <label
                  htmlFor="facilities.library"
                  className="ml-3 flex items-center text-gray-700 cursor-pointer select-none"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  Library
                </label>
              </div>

              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 transition-all duration-200">
                <input
                  type="checkbox"
                  name="facilities.internet"
                  id="facilities.internet"
                  checked={formData.facilities.internet}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200 cursor-pointer"
                />
                <label
                  htmlFor="facilities.internet"
                  className="ml-3 flex items-center text-gray-700 cursor-pointer select-none"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                  </svg>
                  Internet
                </label>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Contact Information
            </h3>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="contacts.phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              name="contacts.phone"
              id="contacts.phone"
              value={formData.contacts.phone}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="contacts.email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="contacts.email"
              id="contacts.email"
              value={formData.contacts.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="contacts.website"
              className="block text-sm font-medium text-gray-700"
            >
              Website
            </label>
            <input
              type="url"
              name="contacts.website"
              id="contacts.website"
              value={formData.contacts.website}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          {/* Meta Information */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Additional Information
            </h3>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="meta.rank"
              className="block text-sm font-medium text-gray-700"
            >
              Rank
            </label>
            <input
              type="number"
              name="meta.rank"
              id="meta.rank"
              value={formData.meta.rank}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="meta.establishedYear"
              className="block text-sm font-medium text-gray-700"
            >
              Established Year
            </label>
            <input
              type="number"
              name="meta.establishedYear"
              id="meta.establishedYear"
              value={formData.meta.establishedYear}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg text-black border border-gray-300 
                       bg-white shadow-sm transition duration-150 ease-in-out
                       hover:border-blue-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400 placeholder:text-sm"
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
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-700"
              >
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/colleges")}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
