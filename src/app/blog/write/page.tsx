'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import TurndownService from 'turndown';
import { marked } from 'marked';
import useBlogStore from '@/stores/useBlogStore';

// Turndown 인스턴스 (HTML → Markdown)
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// 테이블 등 커스텀 규칙 없이 기본 사용

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
  const isSettingContent = useRef(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [urlModal, setUrlModal] = useState<{ type: 'link' | 'image'; value: string } | null>(null);

  const colorPresets = [
    { label: '기본', color: '' },
    { label: '빨강', color: '#ef4444' },
    { label: '주황', color: '#f97316' },
    { label: '노랑', color: '#eab308' },
    { label: '초록', color: '#22c55e' },
    { label: '파랑', color: '#3b82f6' },
    { label: '남색', color: '#6366f1' },
    { label: '보라', color: '#a855f7' },
    { label: '분홍', color: '#ec4899' },
    { label: '회색', color: '#6b7280' },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: 'code-block' } },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'editor-link' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'editor-image' },
      }),
      Placeholder.configure({
        placeholder: '내용을 작성하세요...',
      }),
      TextStyle,
      Color,
    ],
    editorProps: {
      attributes: {
        class: 'prose-custom tiptap-editor',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (isSettingContent.current) return;
      const html = ed.getHTML();
      const md = turndown.turndown(html);
      setContent(md);
    },
  });

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
        // 마크다운 → HTML 변환 후 에디터에 로드
        if (editor && post.content) {
          isSettingContent.current = true;
          const html = marked.parse(post.content) as string;
          editor.commands.setContent(html);
          isSettingContent.current = false;
        }
      }
      setLoaded(true);
    } else if (!editId) {
      setLoaded(true);
    }
  }, [editId, posts, loaded, editor]);

  // Auto-save every 30 seconds
  const doAutoSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;
    const id = await saveDraft(draftId, {
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

  const handlePublish = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (draftId) {
      await updatePost(draftId, {
        title,
        content,
        tags: parsedTags,
        status,
      });
      router.push(`/blog/${draftId}`);
    } else {
      const id = await addPost({
        title,
        content,
        tags: parsedTags,
        status,
      });
      router.push(`/blog/${id}`);
    }
  };

  // Toolbar
  const handleLink = () => {
    if (!editor) return;
    setUrlModal({ type: 'link', value: 'https://' });
  };

  const handleImage = () => {
    if (!editor) return;
    setUrlModal({ type: 'image', value: '' });
  };

  const handleUrlSubmit = () => {
    if (!editor || !urlModal || !urlModal.value.trim()) return;
    if (urlModal.type === 'link') {
      editor.chain().focus().setLink({ href: urlModal.value.trim() }).run();
    } else {
      editor.chain().focus().setImage({ src: urlModal.value.trim() }).run();
    }
    setUrlModal(null);
  };

  if (!editor) return null;

  const toolbarGroups = [
    {
      items: [
        { label: 'H1', title: '제목 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
        { label: 'H2', title: '제목 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
        { label: 'H3', title: '제목 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }) },
      ],
    },
    {
      items: [
        { label: 'B', title: '굵게', action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), bold: true },
        { label: 'I', title: '기울임', action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), italic: true },
        { label: 'S', title: '취소선', action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), strike: true },
      ],
    },
    {
      items: [
        { label: '"', title: '인용', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote') },
        { label: '•', title: '목록', action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList') },
        { label: '1.', title: '번호 목록', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList') },
      ],
    },
    {
      items: [
        { label: '<>', title: '인라인 코드', action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code') },
        { label: '{ }', title: '코드 블록', action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive('codeBlock') },
        { label: '─', title: '구분선', action: () => editor.chain().focus().setHorizontalRule().run(), isActive: false },
      ],
    },
    {
      items: [
        { label: '🔗', title: '링크', action: handleLink, isActive: editor.isActive('link') },
        { label: '📷', title: '이미지', action: handleImage, isActive: false },
      ],
    },
  ];

  const currentColor = editor.getAttributes('textStyle').color || '';

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
        onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
        placeholder="제목을 입력하세요"
        className={`glass-input mb-1 w-full text-lg font-semibold ${titleError ? 'ring-2 ring-red-400/50' : ''}`}
      />
      {titleError && (
        <p className="mb-3 text-xs text-red-400">제목을 입력해주세요.</p>
      )}
      {!titleError && <div className="mb-3" />}

      {/* Tags */}
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="태그 (쉼표로 구분: JavaScript, React, ...)"
        className="glass-input mb-4 w-full"
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

      {/* WYSIWYG Editor */}
      <div className="mb-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-white/20 bg-gray-900/[0.02] px-2 py-1.5 dark:border-white/[0.08] dark:bg-white/[0.03]">
          {toolbarGroups.map((group, gi) => (
            <div key={gi} className="flex items-center gap-0.5">
              {gi > 0 && (
                <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
              )}
              {group.items.map((item) => (
                <button
                  key={item.title}
                  onClick={item.action}
                  title={item.title}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    item.isActive
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                  } ${'bold' in item && item.bold ? 'font-bold' : ''} ${'italic' in item && item.italic ? 'italic' : ''} ${'strike' in item && item.strike ? 'line-through' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}

          {/* Color Picker */}
          <div className="relative ml-1 flex items-center">
            <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="글자색"
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                showColorPicker
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span>A</span>
              <span
                className="h-2 w-4 rounded-sm border border-gray-300 dark:border-gray-600"
                style={{ background: currentColor || 'var(--foreground)' }}
              />
            </button>
            {showColorPicker && (
              <div className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="flex gap-1">
                  {colorPresets.map((c) => (
                    <button
                      key={c.label}
                      onClick={() => {
                        if (c.color) {
                          editor.chain().focus().setColor(c.color).run();
                        } else {
                          editor.chain().focus().unsetColor().run();
                        }
                        setShowColorPicker(false);
                      }}
                      title={c.label}
                      className={`flex h-6 w-6 items-center justify-center rounded-sm transition-transform hover:scale-110 ${
                        currentColor === c.color ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                      }`}
                    >
                      {c.color ? (
                        <span
                          className="h-5 w-5 rounded-sm border border-gray-200 dark:border-gray-600"
                          style={{ background: c.color }}
                        />
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-300 text-[10px] text-gray-500 dark:border-gray-600 dark:text-gray-400">
                          ✕
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="glass-card min-h-[500px] rounded-t-none">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => router.push('/blog')}
          className="rounded-lg bg-gray-900/[0.03] px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-900/[0.06] dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]"
        >
          취소
        </button>
        <button
          onClick={handleManualSave}
          className="rounded-lg border border-indigo-500/30 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
        >
          임시저장
        </button>
        <button
          onClick={handlePublish}
          className="glass-btn rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          발행
        </button>
      </div>

      {/* URL Input Modal (replaces window.prompt) */}
      {urlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-sm p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              {urlModal.type === 'link' ? '🔗 링크 URL' : '📷 이미지 URL'}
            </h3>
            <input
              type="text"
              value={urlModal.value}
              onChange={(e) => setUrlModal({ ...urlModal, value: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleUrlSubmit(); if (e.key === 'Escape') setUrlModal(null); }}
              placeholder={urlModal.type === 'link' ? 'https://example.com' : 'https://example.com/image.png'}
              autoFocus
              className="glass-input mb-3 w-full"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setUrlModal(null)}
                className="rounded-lg bg-gray-900/[0.03] px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-900/[0.06] dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]"
              >
                취소
              </button>
              <button
                onClick={handleUrlSubmit}
                disabled={!urlModal.value.trim()}
                className="glass-btn rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
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
