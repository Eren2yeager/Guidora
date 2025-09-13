'use client';

import { useState } from 'react';
import { ArrowUpTrayIcon, DocumentTextIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ImportColleges() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
      setUploadError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setUploadResult(null);
      setUploadError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/import/colleges', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to import colleges');
      }

      setUploadResult(result);
      setFile(null);
      // Reset file input
      document.getElementById('file-upload').value = '';
    } catch (error) {
      console.error('Error importing colleges:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import Colleges</h1>
        <p className="mt-1 text-sm text-gray-600">Upload JSON or CSV file to import colleges</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div 
              className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="space-y-1 text-center">
                <div className="flex flex-col items-center">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".json,.csv" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    JSON or CSV up to 10MB
                  </p>
                </div>

                {file && (
                  <div className="mt-4 flex items-center justify-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 font-medium">{file.name}</span>
                    <button
                      type="button"
                      className="ml-2 text-gray-400 hover:text-gray-500"
                      onClick={() => setFile(null)}
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={!file || isUploading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!file || isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : 'Upload and Import'}
              </button>
            </div>
          </form>

          {uploadResult && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Import successful</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Successfully imported {uploadResult.imported} colleges.</p>
                    {uploadResult.updated > 0 && (
                      <p className="mt-1">Updated {uploadResult.updated} existing colleges.</p>
                    )}
                    {uploadResult.skipped > 0 && (
                      <p className="mt-1">Skipped {uploadResult.skipped} colleges due to validation errors.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Import failed</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{uploadError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}