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
    <div className="glass-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-xs">📰</span>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">뉴스</h3>
        </div>
        <div className="flex rounded-lg bg-gray-900/5 p-0.5 dark:bg-white/5">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                category === c.key
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-white/10 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-28 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-gray-400">{error}</div>
      ) : (
        <ul className="space-y-1.5">
          {news.map((item, i) => (
            <li key={i}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-gray-900/[0.03] dark:hover:bg-white/[0.03]"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-indigo-500/10 text-[10px] font-semibold text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400">
                  {i + 1}
                </span>
                <span className="text-gray-700 group-hover:text-indigo-600 dark:text-gray-300 dark:group-hover:text-indigo-400 line-clamp-1">
                  {item.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 text-right text-[10px] text-gray-300 dark:text-gray-600">
        {CATEGORY_INFO[category].source}
      </div>
    </div>
  );
}
