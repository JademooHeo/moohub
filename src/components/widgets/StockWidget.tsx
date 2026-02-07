'use client';

import { useState, useEffect } from 'react';

interface StockIndex {
  name: string;
  value: string;
  change: number;
}

export default function StockWidget() {
  const [stocks, setStocks] = useState<StockIndex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 무료 API 제한으로 인해 시뮬레이션 데이터 사용
    // 실제 서비스에서는 Alpha Vantage 또는 Yahoo Finance API 연동
    const mockData: StockIndex[] = [
      { name: 'KOSPI', value: '2,656.33', change: 0.45 },
      { name: 'KOSDAQ', value: '856.82', change: -0.32 },
      { name: 'S&P 500', value: '6,061.48', change: 0.61 },
      { name: 'NASDAQ', value: '19,643.86', change: 0.83 },
    ];

    setTimeout(() => {
      setStocks(mockData);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">증시</h3>
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {stocks.map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{s.name}</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900 dark:text-white">{s.value}</span>
                <span
                  className={`ml-2 text-xs font-medium ${
                    s.change > 0
                      ? 'text-red-500'
                      : s.change < 0
                      ? 'text-blue-500'
                      : 'text-gray-400'
                  }`}
                >
                  {s.change > 0 ? '+' : ''}
                  {s.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
