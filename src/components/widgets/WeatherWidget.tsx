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
    const interval = setInterval(fetchWeather, 600000); // 10분마다 갱신
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">날씨 - 서울</h3>
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-gray-400">{error}</div>
      ) : weather ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {weather.temp}°C
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {weather.description}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              최저 {weather.tempMin}° / 최고 {weather.tempMax}°
            </div>
          </div>
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
            className="h-16 w-16"
          />
        </div>
      ) : null}
    </div>
  );
}
