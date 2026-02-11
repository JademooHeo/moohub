'use client';

import { useState, useEffect, useCallback } from 'react';

interface Genre {
  id: string;
  label: string;
  emoji: string;
  // Individual video IDs (long mixes, compilations, live streams)
  videos: string[];
}

// 각 장르별 검증된 유명 유튜브 영상 ID들 (긴 믹스/컴필레이션/라이브)
const GENRES: Genre[] = [
  {
    id: 'lofi',
    label: 'Lo-fi',
    emoji: '☕',
    videos: [
      'jfKfPfyJRdk', // Lofi Girl - lofi hip hop radio (live)
      'rUxyKA_-grg', // Lofi Girl - synthwave radio
      '4xDzrJKXOOY', // Lofi Girl - sleep/chill radio
      'TURbeWK2wwg', // Lofi Geek - chill beats
      'kgx4WGK0oNU', // Chillhop - jazz vibes
      '5qap5aO4i9A', // Lofi Girl - relax/study beats
      'yIQd2Ya0Ziw', // Coffee shop ambience lofi
      'lTRiuFIWV54', // 1 hour lofi beats
    ],
  },
  {
    id: 'kpop',
    label: 'K-POP',
    emoji: '🇰🇷',
    videos: [
      'gQlMMD8auMs', // BLACKPINK - 인기곡 모음
      'CIjXULpV5y4', // BTS playlist
      'gdZLi9oWNZg', // IU best songs
      'KDdOscnBJKQ', // aespa playlist
      '4TWR90KJl84', // NewJeans playlist
      'vdrqUq5mXMQ', // Stray Kids mix
      'McjJr7OJvSM', // SEVENTEEN hits
      'eXBvCpPJOXs', // TWICE best songs
    ],
  },
  {
    id: 'pop',
    label: '팝',
    emoji: '🎤',
    videos: [
      'ktvTqknDobU', // Imagine Dragons radioactive
      'RgKAFK5djSk', // Wiz Khalifa - See You Again
      'JGwWNGJdvx8', // Ed Sheeran - Shape of You
      'CevxZvSJLk8', // Katy Perry - Roar
      '09R8_2nJtjg', // Maroon 5 - Sugar
      'YqeW9_5kURI', // Major Lazer - Lean On
      'OPf0YbXqDm0', // Mark Ronson - Uptown Funk
      'e-ORhEE9VVg', // Taylor Swift - Blank Space
      'fRh_vgS2dFE', // Justin Bieber - Sorry
    ],
  },
  {
    id: 'classical',
    label: '클래식',
    emoji: '🎻',
    videos: [
      'mIYzp5rcTvU', // Best of Classical Music - Mozart, Beethoven, Bach
      'jgpJVI3tDbY', // Classical music for studying
      'rrVDATvUitA', // Chopin - Complete Nocturnes
      'K-4Hfaz-sxo', // Vivaldi - Four Seasons
      'pnMLzKAdfMg', // Bach - Cello Suite
      'GYwqiy_JvIg', // Debussy - Clair de Lune
      'ho9rZjlsyYY', // Beethoven - Moonlight Sonata full
      'VbxgYlcNxE8', // Beethoven - 5th Symphony
    ],
  },
  {
    id: 'jazz',
    label: '재즈',
    emoji: '🎷',
    videos: [
      'Dx5qFachd3A', // Jazz in coffee shop
      'fEvM-OUbaKs', // Relaxing jazz piano music
      'mOO5qRjVFLw', // Soft jazz for study/work
      'N7GBDtel0Sg', // Jazz cafe music
      'neV3EPgvZ3g', // Jazz piano bar
      'DSGyEsJ17cI', // Autumn jazz coffee shop
      'dWgxKsWlVIQ', // Jazz relaxing music
    ],
  },
  {
    id: 'ambient',
    label: '자연/빗소리',
    emoji: '🌿',
    videos: [
      'q76bMs-NwRk', // Rain sound 10 hours
      'jfKfPfyJRdk', // Lofi ambience
      '1ZYbU82GVz4', // Fireplace 10 hours
      'eKFTSSKCzWA', // Ocean waves
      'sGkh1W5cbH4', // Forest birds
      'HMnrl0tmd3k', // Rain on window
      'nDqP7kcr-sc', // Thunder storm
      'wKnUBDfGS_8', // Campfire crackling
    ],
  },
];

const STORAGE_KEY = 'moohub-youtube-genre';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function YoutubeWidget() {
  const [selectedGenre, setSelectedGenre] = useState<string>('lofi');
  const [currentVideoId, setCurrentVideoId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && GENRES.some((g) => g.id === saved)) {
      setSelectedGenre(saved);
    }
  }, []);

  const pickRandom = useCallback(
    (genreId: string) => {
      const genre = GENRES.find((g) => g.id === genreId);
      if (!genre) return;

      // 아직 안 나온 영상 중에서 랜덤 선택
      let available = genre.videos.filter((v) => !playedIds.has(v));
      if (available.length === 0) {
        // 전부 나왔으면 리셋
        setPlayedIds(new Set());
        available = genre.videos;
      }

      const shuffled = shuffle(available);
      const picked = shuffled[0];

      setPlayedIds((prev) => new Set([...prev, picked]));
      setCurrentVideoId(picked);
      setIsPlaying(true);
    },
    [playedIds]
  );

  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(genreId);
    localStorage.setItem(STORAGE_KEY, genreId);
    setIsPlaying(false);
    setCurrentVideoId('');
    setPlayedIds(new Set());
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
        {isPlaying && (
          <div className="flex items-center gap-0.5">
            {[0, 150, 300, 450].map((delay, i) => (
              <span
                key={i}
                className="inline-block w-0.5 rounded-full bg-indigo-500"
                style={{
                  height: `${8 + (i % 3) * 4}px`,
                  animation: 'pulse 1s ease-in-out infinite',
                  animationDelay: `${delay}ms`,
                }}
              />
            ))}
          </div>
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
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                : 'bg-gray-900/[0.03] text-gray-500 hover:bg-gray-900/[0.06] dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-white/[0.06]'
            }`}
          >
            {genre.emoji} {genre.label}
          </button>
        ))}
      </div>

      {/* Player */}
      {isPlaying && currentVideoId ? (
        <div className="mb-3 overflow-hidden rounded-xl">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              key={currentVideoId}
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0`}
              title="Music player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="mb-3 flex flex-col items-center justify-center rounded-xl bg-gray-900/[0.03] py-8 dark:bg-white/[0.03]">
          <span className="mb-2 text-3xl">{currentGenre.emoji}</span>
          <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            {currentGenre.label}
          </p>
          <p className="text-[11px] text-gray-400">
            버튼을 눌러 랜덤 재생하세요
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => pickRandom(selectedGenre)}
          className="glass-btn flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isPlaying ? '다음 곡' : '랜덤 재생'}
        </button>
        {isPlaying && (
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentVideoId('');
            }}
            className="shrink-0 rounded-lg bg-gray-900/5 px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-900/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
          >
            중지
          </button>
        )}
      </div>
    </div>
  );
}
