'use client';

import ClockWidget from '@/components/widgets/ClockWidget';
import WeatherWidget from '@/components/widgets/WeatherWidget';
import ExchangeWidget from '@/components/widgets/ExchangeWidget';
import StockWidget from '@/components/widgets/StockWidget';
import QuickMemoWidget from '@/components/widgets/QuickMemoWidget';
import NewsWidget from '@/components/widgets/NewsWidget';

export default function Home() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">대시보드</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ClockWidget />
        <WeatherWidget />
        <ExchangeWidget />
        <StockWidget />
        <QuickMemoWidget />
        <NewsWidget />
      </div>
    </div>
  );
}
