'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import useMemoStore from '@/stores/useMemoStore';

export default function QuickMemoWidget() {
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const { addMemo, loadMemos } = useMemoStore();

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  const handleSave = () => {
    if (!content.trim()) return;
    addMemo(content.trim());
    setContent('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">빠른 메모</h3>
        <span className="text-xs text-gray-400">
          {format(new Date(), 'yyyy.MM.dd (EEE)', { locale: ko })}
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘의 메모를 작성하세요..."
        className="h-24 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
      />
      <div className="mt-3 flex items-center justify-between">
        {saved && (
          <span className="text-xs text-green-500">저장되었습니다!</span>
        )}
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          저장
        </button>
      </div>
    </div>
  );
}
