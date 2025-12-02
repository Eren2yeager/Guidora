'use client';

import { useEffect, useState } from 'react';

export default function OnboardingChecklist() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/user/onboarding/status');
        setData(await res.json());
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return null;
  if (!data || data.error) return null;

  const items = [
    { label: 'Complete profile', ok: data.profileComplete, href: '/profile' },
    { label: 'Complete assessment', ok: data.assessmentDone, href: '/quizzes' },
    { label: 'Set interests', ok: data.interestsSet, href: '/profile' },
  ];

  const pending = items.filter(i => !i.ok);
  if (pending.length === 0 && data.progress >= 70) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-indigo-900 font-medium">Getting started checklist</p>
          <p className="text-xs text-indigo-700">Overall readiness: {data.overall}%</p>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((i, idx) => (
          <li key={idx} className="flex items-center text-sm">
            <span className={`h-4 w-4 rounded-full mr-2 ${i.ok ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
            <a href={i.href} className="text-indigo-800 hover:underline">{i.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}


