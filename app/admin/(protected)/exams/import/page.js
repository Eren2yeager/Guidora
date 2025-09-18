'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImportExams() {
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

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/json') {
      setFile(droppedFile);
      setError(null);
      setResults(null);
    } else {
      setError('Please upload a JSON file');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/json') {
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/import/exams', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        setTimeout(() => {
          router.push('/admin/exams');
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Import Exams</h1>
      
      <form onSubmit={handleSubmit}>
        <div 
          className={`border-2 border-dashed p-8 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="mb-4">Drag and drop a JSON file here, or</p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="fileInput"
          />
          <label 
            htmlFor="fileInput"
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
          >
            Select File
          </label>
          {file && (
            <p className="mt-4 text-green-600">
              Selected file: {file.name}
            </p>
          )}
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