import { NextRequest, NextResponse } from 'next/server';

const RSS_URLS: Record<string, string> = {
  tech: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNRGRqTVhZU0FtdHZLQUFQAQ?hl=ko&gl=KR&ceid=KR:ko',
  economy: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko',
  general: 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'tech';
  const rssUrl = RSS_URLS[category];

  if (!rssUrl) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  try {
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 300 }, // 5분 캐시
    });

    if (!res.ok) {
      throw new Error(`RSS fetch failed: ${res.status}`);
    }

    const xml = await res.text();
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch RSS' },
      { status: 500 }
    );
  }
}
