'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import type { CalendarEvent } from '@/types/calendar';

function getEventTime(event: CalendarEvent): string {
  if (event.start.date) return '종일';
  if (event.start.dateTime) {
    return format(parseISO(event.start.dateTime), 'HH:mm');
  }
  return '';
}

function getEventDate(event: CalendarEvent): Date {
  if (event.start.dateTime) return parseISO(event.start.dateTime);
  if (event.start.date) return parseISO(event.start.date);
  return new Date();
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return '오늘';
  if (isTomorrow(date)) return '내일';
  return format(date, 'M.dd (EEE)', { locale: ko });
}

export default function CalendarWidget() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        const now = new Date();
        const weekLater = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        const res = await fetch(
          `/api/calendar?timeMin=${now.toISOString()}&timeMax=${weekLater.toISOString()}&maxResults=10`
        );
        if (!res.ok) throw new Error('일정을 가져올 수 없습니다');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 300000);
    return () => clearInterval(interval);
  }, [status]);

  // 날짜별로 이벤트 그룹핑
  const groupedEvents = events.reduce<Record<string, CalendarEvent[]>>(
    (acc, event) => {
      const date = getEventDate(event);
      const key = format(date, 'yyyy-MM-dd');
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    },
    {}
  );

  const dateKeys = Object.keys(groupedEvents).sort();
  const displayEvents = events.slice(0, 5);
  const remainingCount = events.length - 5;

  return (
    <div className="glass-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/10 text-xs">
            📅
          </span>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            다가오는 일정
          </h3>
        </div>
        {status === 'authenticated' && (
          <Link
            href="/calendar"
            className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400"
          >
            전체 보기
          </Link>
        )}
      </div>

      {status === 'loading' || loading ? (
        <div className="flex h-24 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
        </div>
      ) : status !== 'authenticated' ? (
        <div className="flex flex-col items-center justify-center gap-3 py-6">
          <p className="text-sm text-gray-400">
            Google 캘린더를 연동하세요
          </p>
          <button
            onClick={() => signIn('google')}
            className="glass-btn flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google 로그인
          </button>
        </div>
      ) : error ? (
        <div className="py-4 text-center text-sm text-gray-400">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400">
          예정된 일정이 없습니다
        </div>
      ) : (
        <div className="space-y-1">
          {dateKeys.map((dateKey) => {
            const dayEvents = groupedEvents[dateKey].slice(
              0,
              5 - displayEvents.indexOf(groupedEvents[dateKey][0])
            );
            const date = parseISO(dateKey);
            return (
              <div key={dateKey}>
                <div className="mt-2 mb-1 first:mt-0 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {getDateLabel(date)}
                </div>
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-900/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] tabular-nums text-gray-400">
                          {getEventTime(event)}
                        </span>
                        <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                          {event.summary}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {remainingCount > 0 && (
            <Link
              href="/calendar"
              className="mt-2 block text-center text-xs text-indigo-500 hover:text-indigo-600"
            >
              +{remainingCount}개 더 보기
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
