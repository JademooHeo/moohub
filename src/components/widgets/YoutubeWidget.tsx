'use client';

import { useState, useEffect } from 'react';

interface SavedVideo {
  id: string;
  videoId: string;
  title: string;
}

const STORAGE_KEY = 'moohub-youtube';

function loadVideos(): SavedVideo[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveVideos(videos: SavedVideo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
}

function extractVideoId(url: string): string | null {
  // youtube.com/watch?v=ID
  const match1 = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (match1) return match1[1];
  // youtu.be/ID
  const match2 = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match2) return match2[1];
  // youtube.com/embed/ID
  const match3 = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match3) return match3[1];
  // youtube.com/shorts/ID
  const match4 = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (match4) return match4[1];
  // just the ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

export default function YoutubeWidget() {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [input, setInput] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loaded = loadVideos();
    setVideos(loaded);
    if (loaded.length > 0) {
      setCurrentVideoId(loaded[0].videoId);
    }
  }, []);

  const addVideo = () => {
    const videoId = extractVideoId(input.trim());
    if (!videoId) {
      setError('유효한 유튜브 URL을 입력해주세요');
      return;
    }
    // 중복 체크
    if (videos.some((v) => v.videoId === videoId)) {
      setCurrentVideoId(videoId);
      setInput('');
      setError('');
      return;
    }
    const newVideo: SavedVideo = {
      id: Date.now().toString(),
      videoId,
      title: `영상 ${videos.length + 1}`,
    };
    const updated = [newVideo, ...videos];
    setVideos(updated);
    saveVideos(updated);
    setCurrentVideoId(videoId);
    setInput('');
    setError('');
  };

  const removeVideo = (id: string, videoId: string) => {
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    saveVideos(updated);
    if (currentVideoId === videoId) {
      setCurrentVideoId(updated.length > 0 ? updated[0].videoId : null);
    }
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🎵</span>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          유튜브
        </h2>
        {videos.length > 0 && (
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-bold tabular-nums text-red-500">
            {videos.length}
          </span>
        )}
      </div>

      {/* Player */}
      {currentVideoId ? (
        <div className="mb-3 overflow-hidden rounded-xl">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${currentVideoId}?rel=0`}
              title="YouTube player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="mb-3 flex flex-col items-center justify-center rounded-xl bg-gray-900/[0.03] py-8 dark:bg-white/[0.03]">
          <span className="mb-2 text-3xl">▶️</span>
          <p className="text-xs text-gray-400">유튜브 URL을 추가해보세요</p>
        </div>
      )}

      {/* URL Input */}
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && addVideo()}
          placeholder="유튜브 URL 붙여넣기"
          className="glass-input flex-1 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
        />
        <button
          onClick={addVideo}
          disabled={!input.trim()}
          className="glass-btn shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:transform-none disabled:shadow-none"
        >
          추가
        </button>
      </div>
      {error && (
        <p className="mb-2 text-[11px] text-red-400">{error}</p>
      )}

      {/* Playlist */}
      {videos.length > 1 && (
        <div className="max-h-28 space-y-0.5 overflow-y-auto">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                currentVideoId === video.videoId
                  ? 'bg-red-500/10'
                  : 'hover:bg-gray-900/[0.03] dark:hover:bg-white/[0.03]'
              }`}
              onClick={() => setCurrentVideoId(video.videoId)}
            >
              {/* Thumbnail */}
              <img
                src={`https://img.youtube.com/vi/${video.videoId}/default.jpg`}
                alt=""
                className="h-8 w-11 shrink-0 rounded object-cover"
              />
              <span
                className={`flex-1 truncate text-xs ${
                  currentVideoId === video.videoId
                    ? 'font-medium text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {video.title}
              </span>
              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeVideo(video.id, video.videoId);
                }}
                className="shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400 dark:text-gray-600"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
