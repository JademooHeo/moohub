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
    <div className="glass-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 text-xs">📝</span>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">빠른 메모</h3>
        </div>
        <span className="rounded-full bg-gray-900/5 px-2.5 py-0.5 text-xs text-gray-400 dark:bg-white/5">
          {format(new Date(), 'MM.dd EEE', { locale: ko })}
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘의 메모를 작성하세요..."
        className="glass-input h-24 w-full resize-none rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white dark:placeholder-gray-500"
      />
      <div className="mt-3 flex items-center justify-between">
        {saved ? (
          <span className="flex items-center gap-1 text-xs text-emerald-500">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            저장됨
          </span>
        ) : (
          <div />
        )}
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className="glass-btn rounded-xl px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          저장
        </button>
      </div>
    </div>
  );
}
