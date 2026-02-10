'use client';

import { useState, useEffect } from 'react';

interface Genre {
  id: string;
  label: string;
  emoji: string;
  // YouTube playlist IDs (shuffle=1 will randomize)
  playlists: string[];
}

const GENRES: Genre[] = [
  {
    id: 'lofi',
    label: 'Lo-fi',
    emoji: '☕',
    playlists: [
      'PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo', // lofi hip hop
      'PLofht4PTcKYnaH8w5olJCI-wUVxuoMHqM', // lofi beats
      'PL6NdkXsPL07KiewBDpJC1R5h7TlnC_ob1', // chillhop
    ],
  },
  {
    id: 'kpop',
    label: 'K-POP',
    emoji: '🇰🇷',
    playlists: [
      'PLmtapKaZsgZt4N8gWEMOs0JOmXU6OBgSM', // K-pop hits
      'PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj', // K-pop 2024
      'PLgSlAiGiPn93EMqAROE8NIzHiatyP-7Ag', // K-pop playlist
    ],
  },
  {
    id: 'pop',
    label: '팝',
    emoji: '🎤',
    playlists: [
      'PLDcnymzs18LU4Kexrs91TVdfnplU3I5zs', // top pop hits
      'PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj', // pop hits
      'PLgzTt0k8mXzEk586JgKDPnmbS1J7MoGcB', // pop music
    ],
  },
  {
    id: 'classical',
    label: '클래식',
    emoji: '🎻',
    playlists: [
      'PLVXcIDt53MpyAciiSbyBqFaFAqMqzTBfx', // classical music
      'PLRYL9Mzq1wYKiaLGpK3vZp_L3gTMk1b9Y', // classical essentials
      'PLJ7QPuvv91JsEudIVWKOEMQRW4VLwGmus', // classical piano
    ],
  },
  {
    id: 'jazz',
    label: '재즈',
    emoji: '🎷',
    playlists: [
      'PLLBnAEo0cR1MotVNwNj7JkL5F4IjeNbKS', // jazz classics
      'PL8F6B0753B2CCA128', // jazz playlist
      'PLrpyDacBCh7Bs_SDGBPJq7F1mx-q4VYX3', // smooth jazz
    ],
  },
  {
    id: 'ambient',
    label: '앰비언트',
    emoji: '🌿',
    playlists: [
      'PLMIbGmCR7FqclGEVx3gOC-R0n_Mtka7Fx', // ambient music
      'PLQ_PIlf6OzqI6M0ButFnPqyfCTaeVIVYv', // nature sounds
      'PLYwg0MZRZS3hGYjQSRXHG6hvCFLkn9B0p', // rain sounds
    ],
  },
];

const STORAGE_KEY = 'moohub-youtube-genre';

export default function YoutubeWidget() {
  const [selectedGenre, setSelectedGenre] = useState<string>('lofi');
  const [playlistId, setPlaylistId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && GENRES.some((g) => g.id === saved)) {
      setSelectedGenre(saved);
    }
  }, []);

  const pickRandomPlaylist = (genreId: string) => {
    const genre = GENRES.find((g) => g.id === genreId);
    if (!genre) return;
    const random = genre.playlists[Math.floor(Math.random() * genre.playlists.length)];
    setPlaylistId(random);
    setIsPlaying(true);
  };

  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(genreId);
    localStorage.setItem(STORAGE_KEY, genreId);
    setIsPlaying(false);
    setPlaylistId('');
  };

  const handleShuffle = () => {
    pickRandomPlaylist(selectedGenre);
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
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-0.5 animate-pulse rounded-full bg-indigo-500" style={{ animationDelay: '0ms' }} />
            <span className="inline-block h-3 w-0.5 animate-pulse rounded-full bg-indigo-500" style={{ animationDelay: '150ms' }} />
            <span className="inline-block h-1.5 w-0.5 animate-pulse rounded-full bg-indigo-500" style={{ animationDelay: '300ms' }} />
            <span className="inline-block h-2.5 w-0.5 animate-pulse rounded-full bg-indigo-500" style={{ animationDelay: '450ms' }} />
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
      {isPlaying && playlistId ? (
        <div className="mb-3 overflow-hidden rounded-xl">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&shuffle=1&autoplay=1&rel=0`}
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
            아래 버튼을 눌러 랜덤 재생하세요
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleShuffle}
          className="glass-btn flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isPlaying ? '다른 플리 듣기' : '랜덤 재생'}
        </button>
        {isPlaying && (
          <button
            onClick={() => {
              setIsPlaying(false);
              setPlaylistId('');
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
