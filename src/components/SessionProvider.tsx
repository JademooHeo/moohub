'use client';

import { useEffect, useRef } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import useBlogStore from '@/stores/useBlogStore';
import useMemoStore from '@/stores/useMemoStore';
import useBookmarkStore from '@/stores/useBookmarkStore';

function StoreSync() {
  const { data: session, status } = useSession();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (status === 'loading') return;

    const currentUserId = session?.user?.id ?? null;
    const prevUserId = prevUserIdRef.current;

    // 처음 로드 시 초기화
    if (prevUserId === undefined) {
      prevUserIdRef.current = currentUserId;
      if (!currentUserId) {
        // 비로그인 상태면 스토어 초기화
        useBlogStore.setState({ posts: [] });
        useMemoStore.setState({ memos: [] });
        useBookmarkStore.setState({ bookmarks: [], folders: [] });
      }
      return;
    }

    // 유저 변경 (로그인 → 로그아웃, 로그아웃 → 로그인, 계정 전환)
    if (prevUserId !== currentUserId) {
      prevUserIdRef.current = currentUserId;
      useBlogStore.setState({ posts: [] });
      useMemoStore.setState({ memos: [] });
      useBookmarkStore.setState({ bookmarks: [], folders: [] });
    }
  }, [session, status]);

  return null;
}

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <StoreSync />
      {children}
    </SessionProvider>
  );
}
