'use client';

import ClockWidget from '@/components/widgets/ClockWidget';
import WeatherWidget from '@/components/widgets/WeatherWidget';
import ExchangeWidget from '@/components/widgets/ExchangeWidget';
import StockWidget from '@/components/widgets/StockWidget';
import QuickMemoWidget from '@/components/widgets/QuickMemoWidget';
import NewsWidget from '@/components/widgets/NewsWidget';
import CalendarWidget from '@/components/widgets/CalendarWidget';

export default function Home() {
  return (
    <div className="relative">
      {/* Background decorative orbs */}
      <div className="bg-orb" style={{ width: 400, height: 400, top: -100, right: -100, background: 'linear-gradient(135deg, #6366f1, #a855f7)' }} />
      <div className="bg-orb" style={{ width: 300, height: 300, bottom: 100, left: -80, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }} />
      <div className="bg-orb" style={{ width: 200, height: 200, top: 300, right: 200, background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }} />

      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              대시보드
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            오늘 하루를 한눈에 확인하세요
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ClockWidget />
          <WeatherWidget />
          <CalendarWidget />
          <ExchangeWidget />
          <StockWidget />
          <QuickMemoWidget />
          <NewsWidget />
        </div>
      </div>
    </div>
  );
}
