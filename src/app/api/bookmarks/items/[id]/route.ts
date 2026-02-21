import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/bookmarks/items/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.bookmark.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const bookmark = await prisma.bookmark.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.url !== undefined && {
        url: body.url.startsWith('http') ? body.url : `https://${body.url}`,
      }),
      ...(body.folderId !== undefined && { folderId: body.folderId }),
      ...(body.order !== undefined && { order: body.order }),
    },
  });

  return NextResponse.json(bookmark);
}

// DELETE /api/bookmarks/items/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.bookmark.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.bookmark.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
