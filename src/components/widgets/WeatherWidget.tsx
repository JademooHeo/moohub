'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface WeatherData {
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
}

interface DailyForecast {
  date: string;
  day: string;
  tempMin: number;
  tempMax: number;
  icon: string;
  description: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
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

        // 현재 날씨 + 5일 예보 동시 요청
        const [currentRes, forecastRes] = await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${apiKey}&units=metric&lang=kr`
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=${apiKey}&units=metric&lang=kr`
          ),
        ]);

        if (!currentRes.ok) throw new Error('날씨 정보를 가져올 수 없습니다');
        const currentData = await currentRes.json();
        setWeather({
          temp: Math.round(currentData.main.temp),
          tempMin: Math.round(currentData.main.temp_min),
          tempMax: Math.round(currentData.main.temp_max),
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
        });

        // 5일 예보 데이터 → 일별로 집계
        if (forecastRes.ok) {
          const forecastData = await forecastRes.json();
          const dailyMap: Record<
            string,
            { temps: number[]; icons: string[]; descs: string[] }
          > = {};

          forecastData.list.forEach(
            (item: {
              dt_txt: string;
              main: { temp: number };
              weather: { icon: string; description: string }[];
            }) => {
              const dateKey = item.dt_txt.split(' ')[0];
              const today = new Date().toISOString().split('T')[0];
              if (dateKey === today) return; // 오늘은 제외

              if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = { temps: [], icons: [], descs: [] };
              }
              dailyMap[dateKey].temps.push(item.main.temp);
              dailyMap[dateKey].icons.push(item.weather[0].icon);
              dailyMap[dateKey].descs.push(item.weather[0].description);
            }
          );

          const dailyForecasts: DailyForecast[] = Object.entries(dailyMap)
            .slice(0, 5)
            .map(([dateKey, data]) => {
              // 낮 시간대(12시) 아이콘 우선, 없으면 가장 많이 나온 아이콘
              const noonIdx = Math.floor(data.icons.length / 2);
              return {
                date: dateKey,
                day: format(parseISO(dateKey), 'EEE', { locale: ko }),
                tempMin: Math.round(Math.min(...data.temps)),
                tempMax: Math.round(Math.max(...data.temps)),
                icon: data.icons[noonIdx] || data.icons[0],
                description: data.descs[noonIdx] || data.descs[0],
              };
            });

          setForecast(dailyForecasts);
        }
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
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-xs">
          🌤️
        </span>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          날씨 - 서울
        </h3>
      </div>
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-gray-400">{error}</div>
      ) : weather ? (
        <div>
          {/* 현재 날씨 */}
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

          {/* 주간 예보 */}
          {forecast.length > 0 && (
            <div className="mt-4 border-t border-gray-200/30 pt-3 dark:border-white/5">
              <div className="flex justify-between">
                {forecast.map((day) => (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <span className="text-[11px] font-medium text-gray-400">
                      {day.day}
                    </span>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                      alt={day.description}
                      className="h-8 w-8"
                    />
                    <div className="flex flex-col items-center text-[11px]">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {day.tempMax}°
                      </span>
                      <span className="text-gray-400">{day.tempMin}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
