'use client';

import { useState, useEffect, useCallback } from 'react';

export interface WidgetConfig {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'clock', label: '시계 / D-Day', icon: '🕐', visible: true },
  { id: 'weather', label: '날씨', icon: '🌤️', visible: true },
  { id: 'calendar', label: '캘린더', icon: '📅', visible: true },
  { id: 'exchange', label: '환율', icon: '💱', visible: true },
  { id: 'stock', label: '주식', icon: '📈', visible: true },
  { id: 'memo', label: '빠른 메모', icon: '📝', visible: true },
  { id: 'news', label: '뉴스', icon: '📰', visible: true },
];

const STORAGE_KEY = 'moohub-dashboard-config';

function loadConfig(): WidgetConfig[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_WIDGETS;
    const saved: WidgetConfig[] = JSON.parse(data);
    // Merge with defaults to handle new widgets added after save
    const savedIds = new Set(saved.map((w) => w.id));
    const merged = [
      ...saved,
      ...DEFAULT_WIDGETS.filter((w) => !savedIds.has(w.id)),
    ];
    // Update labels/icons from defaults
    return merged.map((w) => {
      const def = DEFAULT_WIDGETS.find((d) => d.id === w.id);
      return def ? { ...w, label: def.label, icon: def.icon } : w;
    });
  } catch {
    return DEFAULT_WIDGETS;
  }
}

function saveConfig(config: WidgetConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function useDashboardConfig() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setWidgets(loadConfig());
    setLoaded(true);
  }, []);

  const toggleWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const updated = prev.map((w) =>
        w.id === id ? { ...w, visible: !w.visible } : w
      );
      saveConfig(updated);
      return updated;
    });
  }, []);

  const reorderWidgets = useCallback((fromIndex: number, toIndex: number) => {
    setWidgets((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      saveConfig(updated);
      return updated;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    saveConfig(DEFAULT_WIDGETS);
  }, []);

  const visibleWidgets = widgets.filter((w) => w.visible);

  return {
    widgets,
    visibleWidgets,
    loaded,
    toggleWidget,
    reorderWidgets,
    resetToDefault,
  };
}
