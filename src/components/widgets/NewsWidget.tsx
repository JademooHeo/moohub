'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  link: string;
  source: string;
}

type NewsCategory = 'tech' | 'economy' | 'general';

const CATEGORY_INFO: Record<NewsCategory, { label: string; source: string }> = {
  tech: { label: 'IT/테크', source: 'Google 뉴스' },
  economy: { label: '경제', source: 'Google 뉴스' },
  general: { label: '종합', source: 'Google 뉴스' },
};

function parseRSS(xml: string, source: string): NewsItem[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const items = doc.querySelectorAll('item');
    const result: NewsItem[] = [];
    items.forEach((item, i) => {
      if (i >= 5) return;
      const titleEl = item.querySelector('title');
      const linkEl = item.querySelector('link');
      const title = titleEl?.textContent?.trim() || '';
      const link = linkEl?.textContent?.trim() || '';
      // Google News 제목에서 " - 출처" 부분 제거
      const cleanTitle = title.replace(/\s*-\s*[^-]+$/, '');
      if (cleanTitle) {
        result.push({ title: cleanTitle, link, source });
      }
    });
    return result;
  } catch {
    return [];
  }
}

export default function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<NewsCategory>('tech');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/rss?category=${category}`);
        if (!res.ok) throw new Error('뉴스를 가져올 수 없습니다');
        const text = await res.text();
        const items = parseRSS(text, CATEGORY_INFO[category].source);
        if (items.length === 0) throw new Error('뉴스를 파싱할 수 없습니다');
        setNews(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 600000);
    return () => clearInterval(interval);
  }, [category]);

  const categories: { key: NewsCategory; label: string }[] = [
    { key: 'tech', label: 'IT' },
    { key: 'economy', label: '경제' },
    { key: 'general', label: '종합' },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">📰 뉴스</h3>
        <div className="flex gap-1">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                category === c.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-28 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-gray-400">{error}</div>
      ) : (
        <ul className="space-y-2">
          {news.map((item, i) => (
            <li key={i}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 text-sm"
              >
                <span className="mt-0.5 shrink-0 text-xs text-gray-300 dark:text-gray-600">
                  {i + 1}
                </span>
                <span className="text-gray-700 group-hover:text-indigo-500 dark:text-gray-300 dark:group-hover:text-indigo-400 line-clamp-1">
                  {item.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 text-right text-xs text-gray-300 dark:text-gray-600">
        {CATEGORY_INFO[category].source}
      </div>
    </div>
  );
}
