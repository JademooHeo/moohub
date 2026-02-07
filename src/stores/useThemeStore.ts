import { create } from 'zustand';

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: (typeof window !== 'undefined' && localStorage.getItem('moohub-theme') as 'dark' | 'light') || 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('moohub-theme', newTheme);
      return { theme: newTheme };
    }),
  setTheme: (theme) => {
    localStorage.setItem('moohub-theme', theme);
    set({ theme });
  },
}));

export default useThemeStore;
