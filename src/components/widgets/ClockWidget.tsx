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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">시계</h3>
      <div className="text-center">
        <div className="text-4xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">
          {format(now, 'HH:mm:ss')}
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {format(now, 'yyyy년 MM월 dd일 EEEE', { locale: ko })}
        </div>
      </div>
    </div>
  );
}
