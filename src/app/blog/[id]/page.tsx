'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useBlogStore, { BlogPost } from '@/stores/useBlogStore';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { posts, loadPosts, deletePost } = useBlogStore();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (params.id && posts.length > 0) {
      const found = posts.find((p) => p.id === params.id);
      setPost(found || null);
    }
  }, [params.id, posts]);

  const handleDelete = () => {
    if (post) {
      deletePost(post.id);
      router.push('/blog');
    }
  };

  if (!post) {
    return (
      <div className="py-20 text-center text-gray-400">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  const statusIcon = post.status === 'published' ? '📢' : post.status === 'private' ? '🔒' : '📝';
  const statusLabel = post.status === 'published' ? '공개' : post.status === 'private' ? '비공개' : '임시저장';

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/blog"
          className="text-sm text-gray-400 transition-colors hover:text-indigo-500"
        >
          ← 목록으로
        </Link>
      </div>

      <article className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 md:p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {statusIcon} {statusLabel}
            </span>
            <span>|</span>
            <span>{format(new Date(post.publishedAt || post.createdAt), 'yyyy.MM.dd')}</span>
            {post.tags.length > 0 && (
              <>
                <span>|</span>
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href={`/blog/write?id=${post.id}`}
              className="text-sm text-gray-400 transition-colors hover:text-indigo-500"
            >
              수정
            </Link>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-400">정말 삭제할까요?</span>
                <button
                  onClick={handleDelete}
                  className="text-sm font-medium text-red-500 hover:text-red-600"
                >
                  확인
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm text-gray-400 hover:text-gray-500"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-gray-400 transition-colors hover:text-red-500"
              >
                삭제
              </button>
            )}
          </div>
        </header>

        <hr className="mb-6 border-gray-200 dark:border-gray-800" />

        <div className="prose-custom text-gray-800 dark:text-gray-200">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
