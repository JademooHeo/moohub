import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const timeMin =
    searchParams.get('timeMin') || new Date().toISOString();
  const timeMax =
    searchParams.get('timeMax') ||
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const maxResults = searchParams.get('maxResults') || '20';

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        new URLSearchParams({
          timeMin,
          timeMax,
          maxResults,
          singleEvents: 'true',
          orderBy: 'startTime',
        }),
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error?.message || 'Calendar API 호출 실패'
      );
    }

    const data = await res.json();
    return NextResponse.json(data.items || []);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '일정을 가져올 수 없습니다',
      },
      { status: 500 }
    );
  }
}
