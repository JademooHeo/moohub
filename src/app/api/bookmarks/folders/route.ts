import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/bookmarks/folders - 폴더 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();
  const count = await prisma.bookmarkFolder.count({ where: { userId: session.user.id } });

  const folder = await prisma.bookmarkFolder.create({
    data: {
      name,
      order: count,
      userId: session.user.id,
    },
  });

  return NextResponse.json(folder, { status: 201 });
}
