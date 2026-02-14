import { NextResponse } from 'next/server';

interface StockResult {
  name: string;
  value: string;
  change: number;
}

const INDICES = [
  { symbol: '^KS11', name: 'KOSPI' },
  { symbol: '^KQ11', name: 'KOSDAQ' },
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ' },
];

async function fetchQuote(symbol: string): Promise<{
  price: number;
  changePercent: number;
} | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const changePercent =
      prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0;

    return { price, changePercent };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const quotes = await Promise.all(
      INDICES.map(async (idx) => {
        const quote = await fetchQuote(idx.symbol);
        if (quote) {
          return {
            name: idx.name,
            value: quote.price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            change: parseFloat(quote.changePercent.toFixed(2)),
          };
        }
        return { name: idx.name, value: '-', change: 0 };
      })
    );

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Stock API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
