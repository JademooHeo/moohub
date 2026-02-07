'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useBlogStore, { PostStatus } from '@/stores/useBlogStore';

function BlogWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const { posts, loadPosts, addPost, updatePost, saveDraft } = useBlogStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'private'>('published');
  const [draftId, setDraftId] = useState<string | null>(editId);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loaded, setLoaded] = useState(false);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const text = selected || placeholder;
    const newContent = content.substring(0, start) + before + text + after + content.substring(end);
    setContent(newContent);
    // 커서 위치 조정
    setTimeout(() => {
      ta.focus();
      const cursorPos = start + before.length + text.length;
      ta.setSelectionRange(
        selected ? cursorPos + after.length : start + before.length,
        selected ? cursorPos + after.length : start + before.length + text.length
      );
    }, 0);
  };

  const toolbarItems = [
    { label: 'H1', title: '제목 1', action: () => insertMarkdown('# ', '\n', '제목') },
    { label: 'H2', title: '제목 2', action: () => insertMarkdown('## ', '\n', '제목') },
    { label: 'H3', title: '제목 3', action: () => insertMarkdown('### ', '\n', '제목') },
    { label: 'B', title: '굵게', action: () => insertMarkdown('**', '**', '굵은 텍스트'), bold: true },
    { label: 'I', title: '기울임', action: () => insertMarkdown('*', '*', '기울인 텍스트'), italic: true },
    { label: '~', title: '취소선', action: () => insertMarkdown('~~', '~~', '취소선 텍스트') },
    { label: '"', title: '인용', action: () => insertMarkdown('> ', '\n', '인용문') },
    { label: '-', title: '목록', action: () => insertMarkdown('- ', '\n', '항목') },
    { label: '1.', title: '번호 목록', action: () => insertMarkdown('1. ', '\n', '항목') },
    { label: '<>', title: '인라인 코드', action: () => insertMarkdown('`', '`', '코드') },
    { label: '```', title: '코드 블록', action: () => insertMarkdown('```\n', '\n```\n', '코드를 입력하세요') },
    { label: '---', title: '구분선', action: () => insertMarkdown('\n---\n', '') },
    { label: '🔗', title: '링크', action: () => insertMarkdown('[', '](https://)', '링크 텍스트') },
    { label: '📷', title: '이미지', action: () => insertMarkdown('![', '](이미지URL)', '이미지 설명') },
  ];

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (posts.length === 0 && !loaded) return;
    if (editId && !loaded) {
      const post = posts.find((p) => p.id === editId);
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags.join(', '));
        if (post.status !== 'draft') {
          setStatus(post.status as 'published' | 'private');
        }
        setDraftId(post.id);
      }
      setLoaded(true);
    } else if (!editId) {
      setLoaded(true);
    }
  }, [editId, posts, loaded]);

  // Auto-save every 30 seconds
  const doAutoSave = useCallback(() => {
    if (!title.trim() && !content.trim()) return;
    const id = saveDraft(draftId, {
      title,
      content,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'draft',
    });
    if (!draftId) setDraftId(id);
    setLastSaved(new Date());
  }, [title, content, tags, draftId, saveDraft]);

  useEffect(() => {
    if (!loaded) return;
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    autoSaveRef.current = setInterval(doAutoSave, 30000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [doAutoSave, loaded]);

  const handleManualSave = () => {
    doAutoSave();
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (draftId) {
      updatePost(draftId, {
        title,
        content,
        tags: parsedTags,
        status,
      });
      router.push(`/blog/${draftId}`);
    } else {
      const id = addPost({
        title,
        content,
        tags: parsedTags,
        status,
      });
      router.push(`/blog/${id}`);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {editId ? '글 수정' : '새 글 작성'}
        </h1>
        {lastSaved && (
          <span className="text-xs text-gray-400">
            마지막 저장: {lastSaved.toLocaleTimeString('ko-KR')}
          </span>
        )}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="mb-4 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg font-semibold text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
      />

      {/* Tags */}
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="태그 (쉼표로 구분: JavaScript, React, ...)"
        className="mb-4 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
      />

      {/* Status */}
      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">상태:</span>
        <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="radio"
            name="status"
            checked={status === 'published'}
            onChange={() => setStatus('published')}
            className="accent-indigo-600"
          />
          공개
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="radio"
            name="status"
            checked={status === 'private'}
            onChange={() => setStatus('private')}
            className="accent-indigo-600"
          />
          비공개
        </label>
      </div>

      {/* Editor & Preview */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Editor */}
        <div>
          <div className="mb-1 text-xs font-medium text-gray-400">마크다운</div>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
            {toolbarItems.map((item) => (
              <button
                key={item.title}
                onClick={item.action}
                title={item.title}
                className={`rounded px-2 py-1 text-xs transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  item.bold ? 'font-bold' : ''
                } ${item.italic ? 'italic' : ''} text-gray-600 dark:text-gray-300`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 작성하세요... 위 버튼을 눌러 서식을 추가할 수 있습니다."
            className="h-[500px] w-full resize-none rounded-b-lg rounded-t-none border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        {/* Preview */}
        <div>
          <div className="mb-1 text-xs font-medium text-gray-400">미리보기</div>
          <div className="prose-custom h-[500px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <span className="text-gray-400">미리보기가 여기에 표시됩니다...</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => router.push('/blog')}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          취소
        </button>
        <button
          onClick={handleManualSave}
          className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950"
        >
          임시저장
        </button>
        <button
          onClick={handlePublish}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          발행
        </button>
      </div>
    </div>
  );
}

export default function BlogWritePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">로딩 중...</div>}>
      <BlogWriteContent />
    </Suspense>
  );
}
