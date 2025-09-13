'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

export default function StreamsPage() {
  const router = useRouter();
  const toast = useToast();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `/api/admin/streams?query=${searchQuery}&page=${page}&limit=10`
      );
      if (!response.ok) throw new Error('Failed to fetch streams');
      
      const data = await response.json();
      setStreams(data.streams);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load streams. Please try again.');
      toast.error('Failed to load streams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, [searchQuery, page]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this stream?')) return;

    try {
      const response = await fetch(`/api/admin/streams/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete stream');

      toast.success('Stream deleted successfully');
      fetchStreams();
    } catch (err) {
      toast.error('Failed to delete stream');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Streams Management</h1>
        <button
          onClick={() => router.push('/admin/streams/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Stream
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search streams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Last Updated</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {streams.map((stream) => (
              <tr key={stream._id} className="border-t">
                <td className="p-3">{stream.name}</td>
                <td className="p-3">{stream.slug}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      stream.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {stream.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(stream.lastUpdated).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <button
                    onClick={() =>
                      router.push(`/admin/streams/edit/${stream._id}`)
                    }
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(stream._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}