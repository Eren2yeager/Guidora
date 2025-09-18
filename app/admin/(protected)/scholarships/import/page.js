'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function ImportScholarships() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/json') {
      setFile(droppedFile);
      setError(null);
      setResults(null);
    } else {
      setError('Please upload a JSON file');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setError(null);
      setResults(null);
    } else {
      setError('Please upload a JSON file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/import/scholarships', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        setTimeout(() => {
          router.push('/admin/scholarships');
        }, 2000);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (error) {
      setError('Error during import. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Import Scholarships</h1>

      <form onSubmit={handleSubmit}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="mb-4">Drag and drop JSON file here, or</p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Select File
          </label>
          {file && <p className="mt-4 text-sm text-gray-600">Selected: {file.name}</p>}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {results && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-semibold">Import Results:</p>
            <ul className="mt-2">
              {results.map((result, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    result.status === 'created' ? 'bg-green-500' :
                    result.status === 'updated' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`}></span>
                  {result.name}: {result.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || isLoading}
          className={`mt-4 px-4 py-2 rounded ${
            isLoading ? 'bg-gray-400 cursor-wait' :
            file ? 'bg-green-500 text-white hover:bg-green-600' :
            'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Importing...' : 'Import'}
        </button>
      </form>
    </div>
  );
}