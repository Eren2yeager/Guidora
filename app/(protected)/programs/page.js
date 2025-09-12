"use client";
import { useEffect, useState } from 'react';

export default function ProgramsPage() {
  const [items, setItems] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [medium, setMedium] = useState('');
  const [maxFees, setMaxFees] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (courseId) params.set('courseId', courseId);
        if (medium) params.set('medium', medium);
        if (maxFees) params.set('maxFees', maxFees);
        const res = await fetch(`/api/programs?${params.toString()}`, { signal: controller.signal });
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
  }, [courseId, medium, maxFees]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Programs</h1>
      <div className="flex gap-2">
        <input className="border p-2" placeholder="Course ID" value={courseId} onChange={(e) => setCourseId(e.target.value)} />
        <input className="border p-2" placeholder="Medium (EN,HI)" value={medium} onChange={(e) => setMedium(e.target.value)} />
        <input className="border p-2" placeholder="Max Fees" value={maxFees} onChange={(e) => setMaxFees(e.target.value)} />
      </div>
      {loading ? <p>Loading...</p> : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((p) => (
            <li key={p._id} className="border rounded p-4">
              <div className="font-medium">{p.courseId?.name} — {p.collegeId?.name}</div>
              <div className="text-sm text-gray-600">Cutoff last year: {p.cutoff?.lastYear ?? '—'} | Fees/yr: {p.fees?.tuitionPerYear ?? '—'} {p.fees?.currency}</div>
              <div className="text-sm">Medium: {(p.medium || []).join(', ') || '—'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
