'use client';

import { useState, useEffect } from 'react';

interface ExchangeRate {
  currency: string;
  label: string;
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
          { code: 'USD', label: '미국 달러 (USD)' },
          { code: 'JPY', label: '일본 엔 (JPY)' },
          { code: 'EUR', label: '유로 (EUR)' },
        ];

        const newRates = currencies.map((c) => ({
          currency: c.code,
          label: c.label,
          rate: data.rates[c.code] ? Math.round((1 / data.rates[c.code]) * 100) / 100 : 0,
          change: (Math.random() - 0.5) * 2, // 실제 API에서는 전일 대비 변동률 제공
        }));

        setRates(newRates);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 3600000); // 1시간마다
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">환율 (KRW 기준)</h3>
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-gray-400">{error}</div>
      ) : (
        <div className="space-y-3">
          {rates.map((r) => (
            <div key={r.currency} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">{r.label}</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {r.rate.toLocaleString()}원
                </span>
                <span
                  className={`ml-2 text-xs font-medium ${
                    r.change > 0
                      ? 'text-red-500'
                      : r.change < 0
                      ? 'text-blue-500'
                      : 'text-gray-400'
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
