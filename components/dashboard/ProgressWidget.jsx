'use client';

import { useEffect, useState } from 'react';

export default function ProgressWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/progress');
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateOverall = async (val) => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overall: val }),
      });
      setData(await res.json());
    } finally {
      setSaving(false);
    }
  };

  const pct = Math.max(0, Math.min(100, data?.overall || 0));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
        <span className="text-sm text-gray-600">{saving ? 'Saving...' : ''}</span>
      </div>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-700">Overall: {pct}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={pct}
              onChange={(e) => updateOverall(parseInt(e.target.value, 10))}
              className="w-40 text-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}


