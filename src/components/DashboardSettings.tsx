'use client';

import { useState, useRef } from 'react';
import { WidgetConfig } from '@/hooks/useDashboardConfig';

interface Props {
  widgets: WidgetConfig[];
  onToggle: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function DashboardSettings({
  widgets,
  onToggle,
  onReorder,
  onReset,
  onClose,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragRef.current = index;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragRef.current !== null && dragRef.current !== index) {
      onReorder(dragRef.current, index);
    }
    dragRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    dragRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  // Touch drag support
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const touchStartY = useRef<number>(0);
  const listRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setTouchDragIndex(index);
    dragRef.current = index;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragRef.current === null || !listRef.current) return;
    const touch = e.touches[0];
    const items = listRef.current.querySelectorAll('[data-widget-index]');
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        setOverIndex(i);
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    if (dragRef.current !== null && overIndex !== null && dragRef.current !== overIndex) {
      onReorder(dragRef.current, overIndex);
    }
    dragRef.current = null;
    setTouchDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="glass-card relative z-10 w-full max-w-md p-6" style={{ transform: 'none' }}>
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              대시보드 설정
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-900/5 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="mb-4 text-xs text-gray-400">
          드래그하여 순서를 바꾸고, 토글로 위젯을 표시/숨기기 할 수 있어요
        </p>

        {/* Widget List */}
        <div ref={listRef} className="space-y-1.5">
          {widgets.map((widget, index) => (
            <div
              key={widget.id}
              data-widget-index={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(index, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                dragIndex === index || touchDragIndex === index
                  ? 'scale-[1.02] bg-indigo-500/10 shadow-lg'
                  : overIndex === index
                    ? 'bg-indigo-500/5'
                    : 'hover:bg-gray-900/[0.03] dark:hover:bg-white/[0.03]'
              }`}
              style={{ cursor: 'grab' }}
            >
              {/* Drag Handle */}
              <div className="flex shrink-0 flex-col gap-0.5 text-gray-300 dark:text-gray-600">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="6" r="1.5" />
                  <circle cx="15" cy="6" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="18" r="1.5" />
                  <circle cx="15" cy="18" r="1.5" />
                </svg>
              </div>

              {/* Icon + Label */}
              <span className="text-base">{widget.icon}</span>
              <span
                className={`flex-1 text-sm font-medium ${
                  widget.visible
                    ? 'text-gray-800 dark:text-gray-200'
                    : 'text-gray-400 line-through dark:text-gray-500'
                }`}
              >
                {widget.label}
              </span>

              {/* Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(widget.id);
                }}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  widget.visible
                    ? 'bg-indigo-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    widget.visible ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-gray-200/30 pt-4 dark:border-white/5">
          <button
            onClick={onReset}
            className="rounded-lg px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-900/5 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            기본값으로 초기화
          </button>
          <button
            onClick={onClose}
            className="glass-btn rounded-lg px-5 py-1.5 text-sm font-medium text-white"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
