import { create } from 'zustand';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  folderId: string;
  order: number;
  createdAt: string;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  order: number;
  collapsed: boolean;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  folders: BookmarkFolder[];
  isLoading: boolean;
  loadBookmarks: () => Promise<void>;
  addFolder: (name: string) => Promise<string>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  toggleFolder: (id: string) => Promise<void>;
  addBookmark: (data: { title: string; url: string; folderId: string }) => Promise<void>;
  updateBookmark: (id: string, data: { title: string; url: string }) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  moveBookmark: (bookmarkId: string, targetFolderId: string) => Promise<void>;
  reorderFolders: (folderIds: string[]) => Promise<void>;
}

const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  folders: [],
  isLoading: false,

  loadBookmarks: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/bookmarks');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      set({ folders: data.folders, bookmarks: data.bookmarks });
    } catch (e) {
      console.error('loadBookmarks error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addFolder: async (name: string) => {
    const res = await fetch('/api/bookmarks/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const newFolder = await res.json();
    set((state) => ({ folders: [...state.folders, newFolder] }));
    return newFolder.id;
  },

  renameFolder: async (id: string, name: string) => {
    await fetch(`/api/bookmarks/folders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    }));
  },

  deleteFolder: async (id: string) => {
    await fetch(`/api/bookmarks/folders/${id}`, { method: 'DELETE' });
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      bookmarks: state.bookmarks.filter((b) => b.folderId !== id),
    }));
  },

  toggleFolder: async (id: string) => {
    const folder = get().folders.find((f) => f.id === id);
    if (!folder) return;
    const collapsed = !folder.collapsed;
    await fetch(`/api/bookmarks/folders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collapsed }),
    });
    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? { ...f, collapsed } : f)),
    }));
  },

  addBookmark: async (data) => {
    const res = await fetch('/api/bookmarks/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const newBookmark = await res.json();
    set((state) => ({ bookmarks: [...state.bookmarks, newBookmark] }));
  },

  updateBookmark: async (id: string, data) => {
    const res = await fetch(`/api/bookmarks/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    set((state) => ({
      bookmarks: state.bookmarks.map((b) => (b.id === id ? updated : b)),
    }));
  },

  deleteBookmark: async (id: string) => {
    await fetch(`/api/bookmarks/items/${id}`, { method: 'DELETE' });
    set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) }));
  },

  moveBookmark: async (bookmarkId: string, targetFolderId: string) => {
    await fetch(`/api/bookmarks/items/${bookmarkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderId: targetFolderId }),
    });
    set((state) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.id === bookmarkId ? { ...b, folderId: targetFolderId } : b
      ),
    }));
  },

  reorderFolders: async (folderIds: string[]) => {
    const { folders } = get();
    const updated = folderIds.map((id, index) => {
      const folder = folders.find((f) => f.id === id)!;
      return { ...folder, order: index };
    });
    // 순서 변경을 병렬로 저장
    await Promise.all(
      updated.map((f) =>
        fetch(`/api/bookmarks/folders/${f.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: f.order }),
        })
      )
    );
    set({ folders: updated });
  },
}));

export default useBookmarkStore;
