import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

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
  loadBookmarks: () => void;
  addFolder: (name: string) => string;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  toggleFolder: (id: string) => void;
  addBookmark: (data: { title: string; url: string; folderId: string }) => void;
  updateBookmark: (id: string, data: { title: string; url: string }) => void;
  deleteBookmark: (id: string) => void;
  moveBookmark: (bookmarkId: string, targetFolderId: string) => void;
  reorderFolders: (folderIds: string[]) => void;
}

const BOOKMARKS_KEY = 'moohub-bookmarks';
const FOLDERS_KEY = 'moohub-bookmark-folders';

const saveFolders = (folders: BookmarkFolder[]) => {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
};

const saveBookmarks = (bookmarks: Bookmark[]) => {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
};

const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  folders: [],

  loadBookmarks: () => {
    if (typeof window === 'undefined') return;
    const storedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
    const storedFolders = localStorage.getItem(FOLDERS_KEY);
    set({
      bookmarks: storedBookmarks ? JSON.parse(storedBookmarks) : [],
      folders: storedFolders ? JSON.parse(storedFolders) : [],
    });
  },

  addFolder: (name: string) => {
    const id = uuidv4();
    const { folders } = get();
    const newFolder: BookmarkFolder = {
      id,
      name,
      order: folders.length,
      collapsed: false,
    };
    const updated = [...folders, newFolder];
    saveFolders(updated);
    set({ folders: updated });
    return id;
  },

  renameFolder: (id: string, name: string) => {
    const updated = get().folders.map((f) =>
      f.id === id ? { ...f, name } : f
    );
    saveFolders(updated);
    set({ folders: updated });
  },

  deleteFolder: (id: string) => {
    const updatedFolders = get().folders.filter((f) => f.id !== id);
    const updatedBookmarks = get().bookmarks.filter((b) => b.folderId !== id);
    saveFolders(updatedFolders);
    saveBookmarks(updatedBookmarks);
    set({ folders: updatedFolders, bookmarks: updatedBookmarks });
  },

  toggleFolder: (id: string) => {
    const updated = get().folders.map((f) =>
      f.id === id ? { ...f, collapsed: !f.collapsed } : f
    );
    saveFolders(updated);
    set({ folders: updated });
  },

  addBookmark: (data) => {
    const { bookmarks } = get();
    const folderBookmarks = bookmarks.filter((b) => b.folderId === data.folderId);
    const newBookmark: Bookmark = {
      id: uuidv4(),
      title: data.title,
      url: data.url.startsWith('http') ? data.url : `https://${data.url}`,
      folderId: data.folderId,
      order: folderBookmarks.length,
      createdAt: new Date().toISOString(),
    };
    const updated = [...bookmarks, newBookmark];
    saveBookmarks(updated);
    set({ bookmarks: updated });
  },

  updateBookmark: (id: string, data) => {
    const updated = get().bookmarks.map((b) =>
      b.id === id
        ? { ...b, title: data.title, url: data.url.startsWith('http') ? data.url : `https://${data.url}` }
        : b
    );
    saveBookmarks(updated);
    set({ bookmarks: updated });
  },

  deleteBookmark: (id: string) => {
    const updated = get().bookmarks.filter((b) => b.id !== id);
    saveBookmarks(updated);
    set({ bookmarks: updated });
  },

  moveBookmark: (bookmarkId: string, targetFolderId: string) => {
    const updated = get().bookmarks.map((b) =>
      b.id === bookmarkId ? { ...b, folderId: targetFolderId } : b
    );
    saveBookmarks(updated);
    set({ bookmarks: updated });
  },

  reorderFolders: (folderIds: string[]) => {
    const { folders } = get();
    const updated = folderIds.map((id, index) => {
      const folder = folders.find((f) => f.id === id)!;
      return { ...folder, order: index };
    });
    saveFolders(updated);
    set({ folders: updated });
  },
}));

export default useBookmarkStore;
