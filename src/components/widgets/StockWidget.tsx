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
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchStocks = async () => {
    try {
      const res = await fetch('/api/stocks');
      if (!res.ok) throw new Error('fetch failed');
      const data: StockIndex[] = await res.json();
      if (data.length > 0) {
        setStocks(data);
        setError(false);
        const now = new Date();
        setLastUpdated(
          `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        );
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    // 5분마다 갱신
    const interval = setInterval(fetchStocks, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-xs">
            📈
          </span>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            증시
          </h3>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-gray-400">
            {lastUpdated} 기준
          </span>
        )}
      </div>
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-4 text-center">
          <p className="text-sm text-gray-400">증시 데이터를 불러올 수 없습니다</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchStocks();
            }}
            className="mt-2 text-xs text-indigo-500 hover:text-indigo-600"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {stocks.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between rounded-xl bg-gray-900/[0.02] px-3 py-2 dark:bg-white/[0.03]"
            >
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {s.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
                  {s.value}
                </span>
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
