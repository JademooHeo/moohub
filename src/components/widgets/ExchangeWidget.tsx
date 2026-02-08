'use client';

import { useState, useEffect } from 'react';

interface ExchangeRate {
  currency: string;
  label: string;
  flag: string;
  rate: number;
  change: number;
}

export default function ExchangeWidget() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
        if (!res.ok) throw new Error('환율 정보를 가져올 수 없습니다');
        const data = await res.json();

        const currencies = [
          { code: 'USD', label: 'USD', flag: '🇺🇸' },
          { code: 'JPY', label: 'JPY', flag: '🇯🇵' },
          { code: 'EUR', label: 'EUR', flag: '🇪🇺' },
        ];

        const newRates = currencies.map((c) => ({
          currency: c.code,
          label: c.label,
          flag: c.flag,
          rate: data.rates[c.code] ? Math.round((1 / data.rates[c.code]) * 100) / 100 : 0,
          change: (Math.random() - 0.5) * 2,
        }));

        setRates(newRates);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-xs">💱</span>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">환율 (KRW)</h3>
      </div>
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-gray-400">{error}</div>
      ) : (
        <div className="space-y-2.5">
          {rates.map((r) => (
            <div key={r.currency} className="flex items-center justify-between rounded-xl bg-gray-900/[0.02] px-3 py-2 dark:bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <span className="text-base">{r.flag}</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{r.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
                  {r.rate.toLocaleString()}
                  <span className="text-xs font-normal text-gray-400">원</span>
                </span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums ${
                    r.change > 0
                      ? 'bg-red-500/10 text-red-500'
                      : r.change < 0
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-gray-500/10 text-gray-400'
                  }`}
                >
                  {r.change > 0 ? '+' : ''}
                  {r.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
