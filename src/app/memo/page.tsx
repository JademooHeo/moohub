'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import useMemoStore, { Memo } from '@/stores/useMemoStore';

export default function MemoPage() {
  const { memos, loadMemos, updateMemo, deleteMemo } = useMemoStore();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  const filtered = useMemo(() => {
    if (!search.trim()) return memos;
    const q = search.toLowerCase();
    return memos.filter((m) => m.content.toLowerCase().includes(q));
  }, [memos, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Memo[]> = {};
    filtered.forEach((m) => {
      const date = m.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(m);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const startEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setEditContent(memo.content);
  };

  const saveEdit = () => {
    if (editingId && editContent.trim()) {
      updateMemo(editingId, editContent.trim());
    }
    setEditingId(null);
    setEditContent('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = (id: string) => {
    deleteMemo(id);
    setDeleteConfirmId(null);
    if (expandedId === id) setExpandedId(null);
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">메모 아카이브</h1>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="메모 검색..."
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

      {/* Memo List */}
      {grouped.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          {search ? '검색 결과가 없습니다.' : '아직 메모가 없습니다. 대시보드에서 빠른 메모를 작성해보세요!'}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, dateMemos]) => (
            <div key={date}>
              <h2 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                {date === today
                  ? `${format(new Date(date), 'yyyy.MM.dd', { locale: ko })} (오늘)`
                  : format(new Date(date), 'yyyy.MM.dd (EEE)', { locale: ko })}
              </h2>
              <div className="space-y-2">
                {dateMemos.map((memo) => (
                  <div
                    key={memo.id}
                    className="glass-card p-4"
                  >
                    {editingId === memo.id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="glass-input h-32 w-full resize-none"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="glass-btn rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                          >
                            저장
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-lg bg-gray-900/[0.03] px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-900/[0.06] dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          className="cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                          onClick={() => setExpandedId(expandedId === memo.id ? null : memo.id)}
                        >
                          {expandedId === memo.id ? (
                            <div className="whitespace-pre-wrap">{memo.content}</div>
                          ) : (
                            <div className="line-clamp-2">{memo.content}</div>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {format(new Date(memo.createdAt), 'HH:mm')}
                            {memo.updatedAt !== memo.createdAt && ' (수정됨)'}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(memo)}
                              className="text-xs text-gray-400 hover:text-indigo-500"
                            >
                              수정
                            </button>
                            {deleteConfirmId === memo.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-red-400">삭제할까요?</span>
                                <button
                                  onClick={() => handleDelete(memo.id)}
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
                                onClick={() => setDeleteConfirmId(memo.id)}
                                className="text-xs text-gray-400 hover:text-red-500"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
