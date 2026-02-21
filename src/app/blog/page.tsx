'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useSession, signIn } from 'next-auth/react';
import useBlogStore, { PostStatus } from '@/stores/useBlogStore';

type FilterType = 'all' | PostStatus;

export default function BlogPage() {
  const { data: session, status } = useSession();
  const { posts, loadPosts, deletePost } = useBlogStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (session) loadPosts();
  }, [session, loadPosts]);

  const filtered = useMemo(() => {
    let result = posts;
    if (filter !== 'all') {
      result = result.filter((p) => p.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [posts, filter, search]);

  const statusIcon = (status: PostStatus) => {
    switch (status) {
      case 'published':
        return '📢';
      case 'private':
        return '🔒';
      case 'draft':
        return '📝';
    }
  };

  const statusLabel = (status: PostStatus) => {
    switch (status) {
      case 'published':
        return '공개';
      case 'private':
        return '비공개';
      case 'draft':
        return '임시저장';
    }
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'published', label: '공개 📢' },
    { key: 'private', label: '비공개 🔒' },
    { key: 'draft', label: '임시저장 📝' },
  ];

  const handleDelete = (id: string) => {
    deletePost(id);
    setDeleteConfirmId(null);
  };

  if (status === 'loading') {
    return <div className="py-20 text-center text-gray-400">로딩 중...</div>;
  }

  if (!session) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-gray-500 dark:text-gray-400">블로그를 보려면 로그인이 필요해요.</p>
        <button
          onClick={() => signIn('google')}
          className="glass-btn rounded-lg px-5 py-2.5 text-sm font-medium text-white"
        >
          Google로 로그인
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">블로그</h1>
        <Link
          href="/blog/write"
          className="glass-btn rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          새 글 작성
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                : 'bg-gray-900/[0.03] text-gray-600 hover:bg-gray-900/[0.06] dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-white/[0.06]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목, 내용, 태그 검색..."
            className="glass-input w-full pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      {/* Post List */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          {search || filter !== 'all' ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="glass-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={post.status === 'draft' ? `/blog/write?id=${post.id}` : `/blog/${post.id}`}
                    className="group"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-500 dark:text-white">
                      {statusIcon(post.status)}{' '}
                      {post.title || '(제목 없음)'}
                      {post.status === 'draft' && (
                        <span className="ml-2 text-sm font-normal text-gray-400">(작성 중)</span>
                      )}
                    </h2>
                  </Link>
                  {post.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="glass-badge rounded-md px-2 py-0.5 text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-400">
                    {post.status === 'draft'
                      ? `마지막 저장: ${formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true, locale: ko })}`
                      : format(new Date(post.publishedAt || post.createdAt), 'yyyy.MM.dd')}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  {post.status === 'draft' ? (
                    <Link
                      href={`/blog/write?id=${post.id}`}
                      className="text-xs text-gray-400 hover:text-indigo-500"
                    >
                      이어쓰기
                    </Link>
                  ) : (
                    <Link
                      href={`/blog/write?id=${post.id}`}
                      className="text-xs text-gray-400 hover:text-indigo-500"
                    >
                      수정
                    </Link>
                  )}
                  {deleteConfirmId === post.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-400">삭제?</span>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-xs text-gray-400 hover:text-gray-500"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(post.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
