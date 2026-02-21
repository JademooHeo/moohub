import { create } from 'zustand';

export type PostStatus = 'published' | 'private' | 'draft';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface BlogState {
  posts: BlogPost[];
  isLoading: boolean;
  loadPosts: () => Promise<void>;
  addPost: (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>) => Promise<string>;
  updatePost: (id: string, data: Partial<Omit<BlogPost, 'id' | 'createdAt'>>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  getPost: (id: string) => BlogPost | undefined;
  saveDraft: (id: string | null, data: { title: string; content: string; tags: string[]; status: PostStatus }) => Promise<string>;
}

const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  isLoading: false,

  loadPosts: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/blog');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      set({ posts: data });
    } catch (e) {
      console.error('loadPosts error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addPost: async (post) => {
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    const newPost = await res.json();
    set((state) => ({ posts: [newPost, ...state.posts] }));
    return newPost.id;
  },

  updatePost: async (id, data) => {
    const res = await fetch(`/api/blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? updated : p)),
    }));
  },

  deletePost: async (id) => {
    await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
  },

  getPost: (id) => get().posts.find((p) => p.id === id),

  saveDraft: async (id, data) => {
    if (id) {
      await get().updatePost(id, data);
      return id;
    } else {
      return await get().addPost({ ...data, status: 'draft' });
    }
  },
}));

export default useBlogStore;
