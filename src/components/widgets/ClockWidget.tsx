'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = format(now, 'HH');
  const minutes = format(now, 'mm');
  const seconds = format(now, 'ss');

  return (
    <div className="glass-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-xs">⏰</span>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">시계</h3>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="inline-block rounded-lg bg-gray-900/5 px-3 py-2 text-4xl font-bold tabular-nums tracking-tight text-gray-900 dark:bg-white/5 dark:text-white">
            {hours}
          </span>
          <span className="text-3xl font-light text-indigo-400 animate-pulse">:</span>
          <span className="inline-block rounded-lg bg-gray-900/5 px-3 py-2 text-4xl font-bold tabular-nums tracking-tight text-gray-900 dark:bg-white/5 dark:text-white">
            {minutes}
          </span>
          <span className="text-3xl font-light text-indigo-400 animate-pulse">:</span>
          <span className="inline-block rounded-lg bg-indigo-500/10 px-3 py-2 text-4xl font-bold tabular-nums tracking-tight text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            {seconds}
          </span>
        </div>
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {format(now, 'yyyy년 MM월 dd일 EEEE', { locale: ko })}
        </div>
      </div>
    </div>
  );
}
