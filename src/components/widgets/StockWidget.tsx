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
    <div className="glass-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-xs">📈</span>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">증시</h3>
      </div>
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {stocks.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-xl bg-gray-900/[0.02] px-3 py-2 dark:bg-white/[0.03]">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{s.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{s.value}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums ${
                    s.change > 0
                      ? 'bg-red-500/10 text-red-500'
                      : s.change < 0
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-gray-500/10 text-gray-400'
                  }`}
                >
                  {s.change > 0 ? '▲' : s.change < 0 ? '▼' : ''}
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
