'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import useBookmarkStore, { Bookmark } from '@/stores/useBookmarkStore';

export default function BookmarksPage() {
  const {
    bookmarks,
    folders,
    loadBookmarks,
    addFolder,
    renameFolder,
    deleteFolder,
    toggleFolder,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    moveBookmark,
  } = useBookmarkStore();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [addToFolderId, setAddToFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameFolderValue, setRenameFolderValue] = useState('');
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<string | null>(null);
  const [deleteBookmarkConfirm, setDeleteBookmarkConfirm] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formFolderId, setFormFolderId] = useState('');

  // Drag state
  const dragBookmarkId = useRef<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => a.order - b.order);
  }, [folders]);

  const filteredBookmarks = useMemo(() => {
    if (!search.trim()) return bookmarks;
    const q = search.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q)
    );
  }, [bookmarks, search]);

  const getBookmarksForFolder = (folderId: string) => {
    return filteredBookmarks
      .filter((b) => b.folderId === folderId)
      .sort((a, b) => a.order - b.order);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  // Folder actions
  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleRenameFolder = (id: string) => {
    if (!renameFolderValue.trim()) return;
    renameFolder(id, renameFolderValue.trim());
    setRenamingFolderId(null);
    setRenameFolderValue('');
  };

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
    setDeleteFolderConfirm(null);
  };

  // Bookmark actions
  const openAddModal = (folderId: string) => {
    setFormTitle('');
    setFormUrl('');
    setFormFolderId(folderId);
    setEditingBookmark(null);
    setShowAddModal(true);
  };

  const openEditModal = (bookmark: Bookmark) => {
    setFormTitle(bookmark.title);
    setFormUrl(bookmark.url);
    setFormFolderId(bookmark.folderId);
    setEditingBookmark(bookmark);
    setShowAddModal(true);
  };

  const handleSaveBookmark = () => {
    if (!formUrl.trim()) return;
    const title = formTitle.trim() || formUrl.trim();

    if (editingBookmark) {
      updateBookmark(editingBookmark.id, { title, url: formUrl.trim() });
    } else {
      addBookmark({ title, url: formUrl.trim(), folderId: formFolderId });
    }
    setShowAddModal(false);
    setEditingBookmark(null);
  };

  const handleDeleteBookmark = (id: string) => {
    deleteBookmark(id);
    setDeleteBookmarkConfirm(null);
  };

  // Drag & Drop
  const handleDragStart = (bookmarkId: string) => {
    dragBookmarkId.current = bookmarkId;
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = (folderId: string) => {
    if (dragBookmarkId.current) {
      moveBookmark(dragBookmarkId.current, folderId);
      dragBookmarkId.current = null;
    }
    setDragOverFolderId(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">즐겨찾기</h1>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="검색..."
              className="glass-input w-48 pl-9"
            />
            <svg
              className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          {/* Add Folder */}
          <button
            onClick={() => setShowNewFolder(true)}
            className="glass-btn rounded-lg px-3 py-2 text-sm font-medium text-white"
          >
            + 폴더 추가
          </button>
        </div>
      </div>

      {/* New Folder Input */}
      {showNewFolder && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
            placeholder="폴더 이름..."
            autoFocus
            className="glass-input flex-1"
          />
          <button
            onClick={handleAddFolder}
            className="glass-btn rounded-lg px-3 py-2 text-sm font-medium text-white"
          >
            추가
          </button>
          <button
            onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
            className="rounded-lg bg-gray-900/[0.03] px-3 py-2 text-sm text-gray-600 hover:bg-gray-900/[0.06] dark:bg-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.08]"
          >
            취소
          </button>
        </div>
      )}

      {/* Empty State */}
      {sortedFolders.length === 0 && (
        <div className="py-20 text-center text-gray-400">
          <p className="mb-2 text-lg">아직 폴더가 없습니다</p>
          <p className="text-sm">위의 &ldquo;+ 폴더 추가&rdquo; 버튼으로 시작하세요</p>
        </div>
      )}

      {/* Folders */}
      <div className="space-y-4">
        {sortedFolders.map((folder) => {
          const folderBookmarks = getBookmarksForFolder(folder.id);
          const isDropTarget = dragOverFolderId === folder.id;

          return (
            <div
              key={folder.id}
              className={`glass-card transition-colors ${
                isDropTarget
                  ? 'ring-2 ring-indigo-500/30'
                  : ''
              }`}
              onDragOver={(e) => handleDragOver(e, folder.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(folder.id)}
            >
              {/* Folder Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="text-gray-400 transition-transform hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg
                      className={`h-4 w-4 transition-transform ${folder.collapsed ? '-rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {renamingFolderId === folder.id ? (
                    <input
                      type="text"
                      value={renameFolderValue}
                      onChange={(e) => setRenameFolderValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameFolder(folder.id);
                        if (e.key === 'Escape') setRenamingFolderId(null);
                      }}
                      onBlur={() => handleRenameFolder(folder.id)}
                      autoFocus
                      className="rounded border border-gray-300 bg-transparent px-2 py-0.5 text-sm font-semibold text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:text-white"
                    />
                  ) : (
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {folder.name}
                      <span className="ml-2 text-xs font-normal text-gray-400">
                        ({folderBookmarks.length})
                      </span>
                    </h3>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openAddModal(folder.id)}
                    className="rounded px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-500 dark:hover:bg-gray-800"
                    title="북마크 추가"
                  >
                    + 북마크
                  </button>
                  <button
                    onClick={() => {
                      setRenamingFolderId(folder.id);
                      setRenameFolderValue(folder.name);
                    }}
                    className="rounded p-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    title="이름 변경"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  {deleteFolderConfirm === folder.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-400">삭제?</span>
                      <button
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => setDeleteFolderConfirm(null)}
                        className="text-xs text-gray-400"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteFolderConfirm(folder.id)}
                      className="rounded p-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
                      title="폴더 삭제"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Bookmarks Grid */}
              {!folder.collapsed && (
                <div className="border-t border-white/10 px-4 py-3 dark:border-white/5">
                  {folderBookmarks.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-400">
                      {search ? '검색 결과 없음' : '북마크를 추가해보세요'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {folderBookmarks.map((bookmark) => (
                        <div
                          key={bookmark.id}
                          draggable
                          onDragStart={() => handleDragStart(bookmark.id)}
                          className="group relative"
                        >
                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1.5 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getFaviconUrl(bookmark.url) || ''}
                              alt=""
                              className="h-8 w-8 rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
                              }}
                            />
                            <span className="w-full truncate text-center text-xs text-gray-700 dark:text-gray-300">
                              {bookmark.title}
                            </span>
                          </a>

                          {/* Hover Actions */}
                          <div className="absolute right-0.5 top-0.5 flex gap-0.5 opacity-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openEditModal(bookmark);
                              }}
                              className="rounded bg-white/90 p-0.5 text-gray-400 shadow-sm hover:text-indigo-500 dark:bg-gray-800/90"
                              title="수정"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            {deleteBookmarkConfirm === bookmark.id ? (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteBookmark(bookmark.id);
                                }}
                                className="rounded bg-red-500 p-0.5 text-white shadow-sm"
                                title="삭제 확인"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeleteBookmarkConfirm(bookmark.id);
                                  setTimeout(() => setDeleteBookmarkConfirm(null), 3000);
                                }}
                                className="rounded bg-white/90 p-0.5 text-gray-400 shadow-sm hover:text-red-500 dark:bg-gray-800/90"
                                title="삭제"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Bookmark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {editingBookmark ? '북마크 수정' : '북마크 추가'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">URL</label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://example.com"
                  autoFocus
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">이름 (비워두면 URL 사용)</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="사이트 이름"
                  className="glass-input w-full"
                />
              </div>
              {!editingBookmark && folders.length > 1 && (
                <div>
                  <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">폴더</label>
                  <select
                    value={formFolderId}
                    onChange={(e) => setFormFolderId(e.target.value)}
                    className="glass-input w-full"
                  >
                    {sortedFolders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { setShowAddModal(false); setEditingBookmark(null); }}
                className="rounded-lg bg-gray-900/[0.03] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-900/[0.06] dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]"
              >
                취소
              </button>
              <button
                onClick={handleSaveBookmark}
                disabled={!formUrl.trim()}
                className="glass-btn rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {editingBookmark ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
