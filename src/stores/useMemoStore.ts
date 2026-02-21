import { create } from 'zustand';

export interface Memo {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface MemoState {
  memos: Memo[];
  isLoading: boolean;
  loadMemos: () => Promise<void>;
  addMemo: (content: string) => Promise<void>;
  updateMemo: (id: string, content: string) => Promise<void>;
  deleteMemo: (id: string) => Promise<void>;
}

const useMemoStore = create<MemoState>((set) => ({
  memos: [],
  isLoading: false,

  loadMemos: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/memo');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      set({ memos: data });
    } catch (e) {
      console.error('loadMemos error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addMemo: async (content: string) => {
    const res = await fetch('/api/memo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const newMemo = await res.json();
    set((state) => ({ memos: [newMemo, ...state.memos] }));
  },

  updateMemo: async (id: string, content: string) => {
    const res = await fetch(`/api/memo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const updated = await res.json();
    set((state) => ({
      memos: state.memos.map((m) => (m.id === id ? updated : m)),
    }));
  },

  deleteMemo: async (id: string) => {
    await fetch(`/api/memo/${id}`, { method: 'DELETE' });
    set((state) => ({ memos: state.memos.filter((m) => m.id !== id) }));
  },
}));

export default useMemoStore;
