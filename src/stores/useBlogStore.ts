import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

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
  loadPosts: () => void;
  addPost: (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>) => string;
  updatePost: (id: string, data: Partial<Omit<BlogPost, 'id' | 'createdAt'>>) => void;
  deletePost: (id: string) => void;
  getPost: (id: string) => BlogPost | undefined;
  saveDraft: (id: string | null, data: { title: string; content: string; tags: string[]; status: PostStatus }) => string;
}

const STORAGE_KEY = 'moohub-blog-posts';

const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  loadPosts: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      set({ posts: JSON.parse(stored) });
    }
  },
  addPost: (post) => {
    const now = new Date().toISOString();
    const id = uuidv4();
    const newPost: BlogPost = {
      ...post,
      id,
      createdAt: now,
      updatedAt: now,
      publishedAt: post.status !== 'draft' ? now : null,
    };
    set((state) => {
      const updated = [newPost, ...state.posts];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { posts: updated };
    });
    return id;
  },
  updatePost: (id, data) =>
    set((state) => {
      const updated = state.posts.map((p) => {
        if (p.id !== id) return p;
        const updatedPost = { ...p, ...data, updatedAt: new Date().toISOString() };
        if (data.status && data.status !== 'draft' && !p.publishedAt) {
          updatedPost.publishedAt = new Date().toISOString();
        }
        return updatedPost;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { posts: updated };
    }),
  deletePost: (id) =>
    set((state) => {
      const updated = state.posts.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { posts: updated };
    }),
  getPost: (id) => {
    return get().posts.find((p) => p.id === id);
  },
  saveDraft: (id, data) => {
    const now = new Date().toISOString();
    if (id) {
      // Update existing
      set((state) => {
        const updated = state.posts.map((p) =>
          p.id === id ? { ...p, ...data, updatedAt: now } : p
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return { posts: updated };
      });
      return id;
    } else {
      // Create new draft
      const newId = uuidv4();
      const newPost: BlogPost = {
        id: newId,
        title: data.title,
        content: data.content,
        tags: data.tags,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
      };
      set((state) => {
        const updated = [newPost, ...state.posts];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return { posts: updated };
      });
      return newId;
    }
  },
}));

export default useBlogStore;
