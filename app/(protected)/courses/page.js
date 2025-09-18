"use client";
import { useEffect, useMemo, useState } from 'react';

function Tag({ text }) {
  return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">{text}</span>;
}

export default function CoursesPage() {
  // Filters
  const [q, setQ] = useState('');
  const [stream, setStream] = useState('');
  const [tags, setTags] = useState('');

  // Data state
  const [streams, setStreams] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Build query string for API
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (stream) params.set('stream', stream);
    if (tags) params.set('tags', tags);
    return params.toString();
  }, [q, stream, tags]);

  // Load streams for filter dropdown
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/streams', { signal: controller.signal });
        const data = await res.json();
        setStreams(data.items || []);
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      }
    })();
    return () => controller.abort();
  }, []);

  // Load courses
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/courses?${queryString}`, { signal: controller.signal });
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [queryString]);

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-600">Search by keyword, stream, or tags.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="border text-black border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search courses"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border text-black border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={stream}
          onChange={(e) => setStream(e.target.value)}
        >
          <option value="">All streams</option>
          {streams.map((s) => (
            <option key={s._id} value={s.name}>{s.name}</option>
          ))}
        </select>
        <input
          className="border text-black border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 text-center text-gray-600">No courses found.</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((c) => (
            <li key={c._id} className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                {/* Left colorful icon substitute */}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow">
                  {String(c.name || '?').slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{c.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{(c.description || '').slice(0, 120)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(c.tags || []).slice(0, 6).map((t) => <Tag key={t} text={t} />)}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
