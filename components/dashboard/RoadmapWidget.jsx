'use client';

import { useEffect, useState } from 'react';

export default function RoadmapWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/roadmap');
        if (!res.ok) {
          // If GET fails, try to regenerate
          const postRes = await fetch('/api/roadmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          if (!postRes.ok) throw new Error('Failed to load roadmap');
          setData(await postRes.json());
        } else {
          setData(await res.json());
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Personalized Roadmap</h3>
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const res = await fetch('/api/roadmap', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
              });
              if (!res.ok) throw new Error('Failed to regenerate roadmap');
              setData(await res.json());
            } catch (e) {
              setError(e.message);
            } finally {
              setLoading(false);
            }
          }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Regenerate
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && data?.steps?.length > 0 && (
        <ol className="space-y-3">
          {data.steps.slice(0, 6).map((s, idx) => (
            <li key={idx} className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mr-3">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{s.title}</p>
                {s.description ? (
                  <p className="text-xs text-gray-500">{s.description}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
      {!loading && (!data || !data.steps || data.steps.length === 0) && (
        <p className="text-gray-500 text-sm">No steps yet.</p>
      )}
    </div>
  );
}


