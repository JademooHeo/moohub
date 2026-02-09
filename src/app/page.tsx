'use client';

import { useState } from 'react';
import ClockWidget from '@/components/widgets/ClockWidget';
import WeatherWidget from '@/components/widgets/WeatherWidget';
import ExchangeWidget from '@/components/widgets/ExchangeWidget';
import StockWidget from '@/components/widgets/StockWidget';
import QuickMemoWidget from '@/components/widgets/QuickMemoWidget';
import NewsWidget from '@/components/widgets/NewsWidget';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import TodoWidget from '@/components/widgets/TodoWidget';
import YoutubeWidget from '@/components/widgets/YoutubeWidget';
import DashboardSettings from '@/components/DashboardSettings';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';

const WIDGET_MAP: Record<string, React.ComponentType> = {
  clock: ClockWidget,
  weather: WeatherWidget,
  calendar: CalendarWidget,
  exchange: ExchangeWidget,
  stock: StockWidget,
  memo: QuickMemoWidget,
  news: NewsWidget,
  todo: TodoWidget,
  youtube: YoutubeWidget,
};

export default function Home() {
  const {
    widgets,
    visibleWidgets,
    loaded,
    toggleWidget,
    reorderWidgets,
    resetToDefault,
  } = useDashboardConfig();

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative">
      {/* Background decorative orbs */}
      <div className="bg-orb" style={{ width: 400, height: 400, top: -100, right: -100, background: 'linear-gradient(135deg, #6366f1, #a855f7)' }} />
      <div className="bg-orb" style={{ width: 300, height: 300, bottom: 100, left: -80, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }} />
      <div className="bg-orb" style={{ width: 200, height: 200, top: 300, right: 200, background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }} />

      <div className="relative z-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                대시보드
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              오늘 하루를 한눈에 확인하세요
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-gray-400 transition-all hover:bg-gray-900/5 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
            title="대시보드 설정"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">설정</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {loaded &&
            visibleWidgets.map((widget) => {
              const Component = WIDGET_MAP[widget.id];
              return Component ? <Component key={widget.id} /> : null;
            })}
        </div>

        {/* Empty state */}
        {loaded && visibleWidgets.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-16 text-center" style={{ transform: 'none' }}>
            <span className="mb-3 text-4xl">🫥</span>
            <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              표시할 위젯이 없어요
            </p>
            <p className="mb-4 text-xs text-gray-400">
              설정에서 위젯을 켜주세요
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="glass-btn rounded-lg px-4 py-2 text-sm font-medium text-white"
            >
              설정 열기
            </button>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <DashboardSettings
          widgets={widgets}
          onToggle={toggleWidget}
          onReorder={reorderWidgets}
          onReset={resetToDefault}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
