"use client";
import { useEffect, useState } from 'react';

export default function CollegesPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [state, setState] = useState('Jammu and Kashmir');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (state) params.set('state', state);
        if (district) params.set('district', district);
        const res = await fetch(`/api/colleges?${params.toString()}`, { signal: controller.signal });
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
  }, [q, state, district]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Government Colleges in Jammu & Kashmir</h1>
      <div className="flex gap-2">
        <input className="border p-2 flex-1" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <input className="border p-2" placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
      </div>
      {loading ? <p>Loading...</p> : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((c) => (
            <li key={c._id} className="border rounded p-4">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-600">{c.address?.district}, {c.address?.state}</div>
              <div className="text-sm">Facilities: {['hostel','lab','library','internet'].filter(k => c.facilities?.[k]).join(', ') || '—'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
