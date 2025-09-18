'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImportCareers() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
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
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/json') {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/import/careers', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/admin/careers');
      } else {
        const error = await response.json();
        console.error('Import failed:', error);
      }
    } catch (error) {
      console.error('Error during import:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Import Careers</h1>
      
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

        <button
          type="submit"
          disabled={!file}
          className={`mt-4 px-4 py-2 rounded ${file ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Import
        </button>
      </form>
    </div>
  );
}