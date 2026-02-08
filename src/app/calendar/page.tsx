'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import type { CalendarEvent } from '@/types/calendar';

function getEventTime(event: CalendarEvent): string {
  if (event.start.date) return '종일';
  if (event.start.dateTime) {
    return format(parseISO(event.start.dateTime), 'HH:mm');
  }
  return '';
}

function getEventEndTime(event: CalendarEvent): string {
  if (event.end.dateTime) {
    return format(parseISO(event.end.dateTime), 'HH:mm');
  }
  return '';
}

function getEventDate(event: CalendarEvent): string {
  if (event.start.dateTime)
    return format(parseISO(event.start.dateTime), 'yyyy-MM-dd');
  if (event.start.date) return event.start.date;
  return '';
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // 달력 그리드 생성
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // 이벤트 fetch
  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const res = await fetch(
          `/api/calendar?timeMin=${calStart.toISOString()}&timeMax=${calEnd.toISOString()}&maxResults=50`
        );
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setEvents(data);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [status, currentMonth]);

  // 날짜별 이벤트 맵
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      const dateKey = getEventDate(event);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(event);
    });
    return map;
  }, [events]);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedEvents = eventsByDate[selectedDateKey] || [];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  if (status !== 'authenticated') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="text-5xl">📅</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          캘린더
        </h1>
        <p className="text-gray-400">
          Google 캘린더를 연동하면 일정을 확인할 수 있어요
        </p>
        <button
          onClick={() => signIn('google')}
          className="glass-btn mt-2 flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium text-white"
        >
          Google 로그인
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          📅 캘린더
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/40 dark:hover:bg-white/5"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="min-w-[120px] text-center text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentMonth, 'yyyy년 MM월', { locale: ko })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/40 dark:hover:bg-white/5"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDate(new Date());
            }}
            className="ml-2 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-400"
          >
            오늘
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200/50 dark:border-white/5">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`py-3 text-center text-xs font-semibold ${
                i === 0
                  ? 'text-red-400'
                  : i === 6
                  ? 'text-blue-400'
                  : 'text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const dayOfWeek = day.getDay();

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[90px] cursor-pointer border-b border-r border-gray-200/30 p-2 transition-colors dark:border-white/5 ${
                    isSelected
                      ? 'bg-indigo-500/5 ring-2 ring-inset ring-indigo-500/30'
                      : 'hover:bg-gray-900/[0.02] dark:hover:bg-white/[0.02]'
                  } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                      isToday(day)
                        ? 'bg-indigo-500 font-bold text-white'
                        : dayOfWeek === 0
                        ? 'text-red-400'
                        : dayOfWeek === 6
                        ? 'text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="truncate rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] leading-tight text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400"
                      >
                        {event.summary}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="px-1 text-[10px] text-gray-400">
                        +{dayEvents.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Date Detail */}
      <div className="mt-5 glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}
          {isToday(selectedDate) && (
            <span className="ml-2 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              오늘
            </span>
          )}
        </h2>

        {selectedEvents.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            이 날의 일정이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((event) => (
              <a
                key={event.id}
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-xl bg-gray-900/[0.02] p-4 transition-colors hover:bg-gray-900/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
              >
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-indigo-500" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {event.summary}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    {getEventTime(event)}
                    {getEventEndTime(event) &&
                      ` ~ ${getEventEndTime(event)}`}
                  </div>
                  {event.description && (
                    <div className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {event.description}
                    </div>
                  )}
                </div>
                <svg
                  className="mt-1 h-4 w-4 shrink-0 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
