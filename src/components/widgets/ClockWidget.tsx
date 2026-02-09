'use client';

import { useState, useEffect } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DDay {
  id: string;
  label: string;
  date: string; // yyyy-MM-dd
}

const STORAGE_KEY = 'moohub-ddays';

function loadDDays(): DDay[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveDDays(ddays: DDay[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ddays));
}

export default function ClockWidget() {
  const [now, setNow] = useState(new Date());
  const [ddays, setDDays] = useState<DDay[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setDDays(loadDDays());
  }, []);

  const hours = format(now, 'HH');
  const minutes = format(now, 'mm');
  const seconds = format(now, 'ss');

  const handleAdd = () => {
    if (!newLabel.trim() || !newDate) return;
    const newDDay: DDay = {
      id: Date.now().toString(),
      label: newLabel.trim(),
      date: newDate,
    };
    const updated = [...ddays, newDDay];
    setDDays(updated);
    saveDDays(updated);
    setNewLabel('');
    setNewDate('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const updated = ddays.filter((d) => d.id !== id);
    setDDays(updated);
    saveDDays(updated);
  };

  const getDDayText = (dateStr: string) => {
    const target = parseISO(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = differenceInDays(target, today);
    if (diff === 0) return 'D-Day';
    if (diff > 0) return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  };

  const getDDayColor = (dateStr: string) => {
    const target = parseISO(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = differenceInDays(target, today);
    if (diff === 0) return 'text-red-500 bg-red-500/10';
    if (diff > 0 && diff <= 7) return 'text-amber-500 bg-amber-500/10';
    if (diff > 0) return 'text-indigo-500 bg-indigo-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };

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

      {/* D-Day 카운터 */}
      <div className="mt-4 border-t border-gray-200/30 pt-3 dark:border-white/5">
        {ddays.length === 0 && !showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full rounded-lg py-2 text-center text-xs text-gray-400 transition-colors hover:bg-gray-900/[0.03] hover:text-gray-600 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          >
            + D-Day 추가하기
          </button>
        ) : (
          <div className="space-y-1.5">
            {ddays.map((dday) => (
              <div
                key={dday.id}
                className="group flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-900/[0.03] dark:hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums ${getDDayColor(dday.date)}`}
                  >
                    {getDDayText(dday.date)}
                  </span>
                  <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                    {dday.label}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(dday.id)}
                  className="shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400 dark:text-gray-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {!showAdd && (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full rounded-lg py-1 text-center text-[11px] text-gray-400 transition-colors hover:text-indigo-500"
              >
                + 추가
              </button>
            )}
          </div>
        )}

        {/* 추가 폼 */}
        {showAdd && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="이름 (예: 여행, 시험)"
              className="glass-input w-full rounded-lg px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="glass-input w-full rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none dark:text-white dark:[color-scheme:dark]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewLabel('');
                  setNewDate('');
                }}
                className="flex-1 rounded-lg bg-gray-900/5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-900/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={!newLabel.trim() || !newDate}
                className="glass-btn flex-1 rounded-lg py-1.5 text-xs font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                추가
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
