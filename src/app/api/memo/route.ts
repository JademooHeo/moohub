import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/memo
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const memos = await prisma.memo.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(memos);
}

// POST /api/memo
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content } = await req.json();
  const now = new Date();

  const memo = await prisma.memo.create({
    data: {
      content,
      date: now.toISOString().split('T')[0],
      userId: session.user.id,
    },
  });

  return NextResponse.json(memo, { status: 201 });
}
