import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/bookmarks/items - 북마크 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, url, folderId } = await req.json();

  // 폴더 소유권 확인
  const folder = await prisma.bookmarkFolder.findFirst({
    where: { id: folderId, userId: session.user.id },
  });
  if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 });

  const count = await prisma.bookmark.count({ where: { folderId } });

  const bookmark = await prisma.bookmark.create({
    data: {
      title,
      url: url.startsWith('http') ? url : `https://${url}`,
      folderId,
      order: count,
      userId: session.user.id,
    },
  });

  return NextResponse.json(bookmark, { status: 201 });
}
