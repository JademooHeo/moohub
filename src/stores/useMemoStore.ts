import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Memo {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface MemoState {
  memos: Memo[];
  loadMemos: () => void;
  addMemo: (content: string) => void;
  updateMemo: (id: string, content: string) => void;
  deleteMemo: (id: string) => void;
}

const STORAGE_KEY = 'moohub-memos';

const useMemoStore = create<MemoState>((set) => ({
  memos: [],
  loadMemos: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      set({ memos: JSON.parse(stored) });
    }
  },
  addMemo: (content: string) =>
    set((state) => {
      const now = new Date().toISOString();
      const newMemo: Memo = {
        id: uuidv4(),
        date: now.split('T')[0],
        content,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newMemo, ...state.memos];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { memos: updated };
    }),
  updateMemo: (id: string, content: string) =>
    set((state) => {
      const updated = state.memos.map((m) =>
        m.id === id ? { ...m, content, updatedAt: new Date().toISOString() } : m
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { memos: updated };
    }),
  deleteMemo: (id: string) =>
    set((state) => {
      const updated = state.memos.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { memos: updated };
    }),
}));

export default useMemoStore;
