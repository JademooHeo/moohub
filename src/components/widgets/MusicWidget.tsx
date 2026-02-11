'use client';

import { useState, useEffect } from 'react';

interface Genre {
  id: string;
  label: string;
  emoji: string;
  // Spotify playlist/album IDs (from open.spotify.com/playlist/ID)
  playlists: { id: string; name: string }[];
}

// Spotify 공식/인기 플레이리스트 ID들
const GENRES: Genre[] = [
  {
    id: 'lofi',
    label: 'Lo-fi',
    emoji: '☕',
    playlists: [
      { id: '0vvXsWCC9xrXsKd4FyS8kM', name: 'Lofi Girl' },
      { id: '37i9dQZF1DXc8kgYqQLMfH', name: 'Lofi Beats' },
      { id: '37i9dQZF1DX8Uebhn9wzrS', name: 'Chill Lofi Study Beats' },
      { id: '37i9dQZF1DWWQRwui0ExPn', name: 'Lofi Café' },
    ],
  },
  {
    id: 'kpop',
    label: 'K-POP',
    emoji: '🇰🇷',
    playlists: [
      { id: '37i9dQZF1DX9tPFwDMOaN1', name: 'K-Pop ON!' },
      { id: '37i9dQZF1DX4FcAKI5Nhzq', name: 'K-Pop Daebak' },
      { id: '37i9dQZF1DXe5W6diBL5N4', name: 'K-Pop Rising' },
      { id: '37i9dQZF1DX0b1hHYQtJjp', name: 'K-Pop Hits' },
    ],
  },
  {
    id: 'pop',
    label: '팝',
    emoji: '🎤',
    playlists: [
      { id: '37i9dQZF1DXcBWIGoYBM5M', name: "Today's Top Hits" },
      { id: '37i9dQZF1DX0kbJZpiYdZl', name: 'Hot Hits' },
      { id: '37i9dQZF1DWUa8ZRTfalHk', name: 'Pop Rising' },
      { id: '37i9dQZF1DX1lNMfMQ5Q6f', name: 'All Out 2020s' },
    ],
  },
  {
    id: 'classical',
    label: '클래식',
    emoji: '🎻',
    playlists: [
      { id: '37i9dQZF1DWWEJlAGA9gs0', name: 'Classical Essentials' },
      { id: '37i9dQZF1DX7K31D69s4M1', name: 'Piano 100' },
      { id: '37i9dQZF1DX561TnfYJcMV', name: 'Classical Focus' },
      { id: '37i9dQZF1DX8NTLI2TtZa6', name: 'Classical New Releases' },
    ],
  },
  {
    id: 'jazz',
    label: '재즈',
    emoji: '🎷',
    playlists: [
      { id: '37i9dQZF1DXbITWG1ZJKYt', name: 'Jazz Vibes' },
      { id: '37i9dQZF1DX0SM0LYsmbMT', name: 'Jazz for Study' },
      { id: '37i9dQZF1DWV7EzJMK2FUI', name: 'Jazz in the Background' },
      { id: '37i9dQZF1DX4wta20wlRSq', name: 'Late Night Jazz' },
    ],
  },
  {
    id: 'chill',
    label: '칠/릴렉스',
    emoji: '🌿',
    playlists: [
      { id: '37i9dQZF1DX4WYpdgoIcn6', name: 'Chill Hits' },
      { id: '37i9dQZF1DWTvNyxOwkztu', name: 'Deep Focus' },
      { id: '37i9dQZF1DX3Ogo9pFvBkY', name: 'Peaceful Piano' },
      { id: '37i9dQZF1DWZd79rJ6a7lp', name: 'Sleep' },
    ],
  },
];

const STORAGE_KEY = 'moohub-music-genre';

export default function MusicWidget() {
  const [selectedGenre, setSelectedGenre] = useState<string>('lofi');
  const [currentPlaylist, setCurrentPlaylist] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && GENRES.some((g) => g.id === saved)) {
      setSelectedGenre(saved);
    }
  }, []);

  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(genreId);
    localStorage.setItem(STORAGE_KEY, genreId);
    setCurrentPlaylist(null);
  };

  const pickRandom = () => {
    const genre = GENRES.find((g) => g.id === selectedGenre);
    if (!genre) return;
    // 현재 재생 중인 것과 다른 플레이리스트 선택
    const available = genre.playlists.filter(
      (p) => p.id !== currentPlaylist?.id
    );
    const list = available.length > 0 ? available : genre.playlists;
    const picked = list[Math.floor(Math.random() * list.length)];
    setCurrentPlaylist(picked);
  };

  const currentGenre = GENRES.find((g) => g.id === selectedGenre)!;

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎵</span>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            뮤직
          </h2>
        </div>
        {currentPlaylist && (
          <span className="max-w-[140px] truncate rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
            ♫ {currentPlaylist.name}
          </span>
        )}
      </div>

      {/* Genre Tabs */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreChange(genre.id)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
              selectedGenre === genre.id
                ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                : 'bg-gray-900/[0.03] text-gray-500 hover:bg-gray-900/[0.06] dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-white/[0.06]'
            }`}
          >
            {genre.emoji} {genre.label}
          </button>
        ))}
      </div>

      {/* Spotify Player */}
      {currentPlaylist ? (
        <div className="mb-3 overflow-hidden rounded-xl">
          <iframe
            key={currentPlaylist.id}
            src={`https://open.spotify.com/embed/playlist/${currentPlaylist.id}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl border-0"
          />
        </div>
      ) : (
        <div className="mb-3 flex flex-col items-center justify-center rounded-xl bg-gray-900/[0.03] py-8 dark:bg-white/[0.03]">
          <span className="mb-2 text-3xl">{currentGenre.emoji}</span>
          <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            {currentGenre.label}
          </p>
          <p className="text-[11px] text-gray-400">
            버튼을 눌러 플레이리스트를 불러오세요
          </p>
        </div>
      )}

      {/* Controls */}
      <button
        onClick={pickRandom}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1DB954]/90 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1DB954] active:scale-[0.98]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        {currentPlaylist ? '다른 플레이리스트' : '랜덤 재생'}
      </button>
    </div>
  );
}
