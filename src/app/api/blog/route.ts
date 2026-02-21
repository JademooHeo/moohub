import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/blog - 내 글 목록
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const posts = await prisma.blogPost.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(posts);
}

// POST /api/blog - 글 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, content, tags, status } = body;

  const post = await prisma.blogPost.create({
    data: {
      title,
      content,
      tags: tags ?? [],
      status: status ?? 'draft',
      publishedAt: status !== 'draft' ? new Date() : null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
