'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
          setError('API 키가 설정되지 않았습니다');
          setLoading(false);
          return;
        }
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${apiKey}&units=metric&lang=kr`
        );
        if (!res.ok) throw new Error('날씨 정보를 가져올 수 없습니다');
        const data = await res.json();
        setWeather({
          temp: Math.round(data.main.temp),
          tempMin: Math.round(data.main.temp_min),
          tempMax: Math.round(data.main.temp_max),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-xs">🌤️</span>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">날씨 - 서울</h3>
      </div>
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-gray-400">{error}</div>
      ) : weather ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {weather.temp}
              <span className="text-lg font-normal text-gray-400">°C</span>
            </div>
            <div className="mt-1.5 inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              {weather.description}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <span className="text-blue-400">↓{weather.tempMin}°</span>
              <span className="text-red-400">↑{weather.tempMax}°</span>
            </div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400/10 to-sky-300/10 dark:from-blue-400/5 dark:to-sky-300/5">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="h-14 w-14"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
