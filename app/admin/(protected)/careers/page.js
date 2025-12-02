'use client';

import { useState, useEffect } from 'react';

export default function CareersManagement() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch careers data
    const fetchCareers = async () => {
      try {
        const response = await fetch('/api/admin/careers');
        const data = await response.json();
        setCareers(data);
      } catch (error) {
        console.error('Error fetching careers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  const filteredCareers = careers.filter(career =>
    career.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Careers Management</h1>
        <a 
          href="/admin/careers/import"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Import Careers
        </a>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search careers..."
          className="w-full text-black p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredCareers.map((career) => (
            <div key={career._id} className="border p-4 rounded">
              <h2 className="text-xl font-semibold">{career.title}</h2>
              <p className="text-gray-600">{career.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}