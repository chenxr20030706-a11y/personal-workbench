import { create } from 'zustand';
import type { MediaItem } from '../types';
import { mockMediaItems } from '../data/mockData';
import { storage } from '../utils/storage';
import { generateId, getTodayStr } from '../utils/date';

const gradientPairs = [
  ['#f87171', '#ef4444'],
  ['#fb923c', '#f97316'],
  ['#fbbf24', '#f59e0b'],
  ['#a3e635', '#84cc16'],
  ['#34d399', '#10b981'],
  ['#22d3ee', '#06b6d4'],
  ['#60a5fa', '#3b82f6'],
  ['#a78bfa', '#8b5cf6'],
  ['#f472b6', '#ec4899'],
  ['#fb7185', '#f43f5e'],
];

const generatePosterUrl = (title: string, type: 'movie' | 'tv'): string => {
  const displayTitle = title.trim() || (type === 'movie' ? '电影' : '剧集');
  const colorIndex = displayTitle.length % gradientPairs.length;
  const [c1, c2] = gradientPairs[colorIndex];
  const icon = type === 'movie' ? '🎬' : '📺';
  const fontSize = displayTitle.length > 8 ? 28 : displayTitle.length > 4 ? 36 : 44;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${c2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="300" height="450" fill="url(#bg)"/>
      <text x="150" y="200" text-anchor="middle" font-size="64">${icon}</text>
      <text x="150" y="280" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" style="text-shadow: 0 2px 10px rgba(0,0,0,0.2)">
        <tspan x="150" dy="0">${displayTitle.slice(0, 6)}</tspan>
        ${displayTitle.length > 6 ? `<tspan x="150" dy="${fontSize + 8}">${displayTitle.slice(6, 12)}</tspan>` : ''}
        ${displayTitle.length > 12 ? `<tspan x="150" dy="${fontSize + 8}">${displayTitle.slice(12, 18)}...</tspan>` : ''}
      </text>
      <text x="150" y="410" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="rgba(255,255,255,0.7)">
        ${type === 'movie' ? 'MOVIE' : 'TV SERIES'}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

interface MediaState {
  items: MediaItem[];
  filter: 'all' | 'movie' | 'tv';
  customTags: string[];
  setFilter: (filter: 'all' | 'movie' | 'tv') => void;
  addItem: (item: Omit<MediaItem, 'id' | 'watchCount' | 'lastWatchedDate'>) => void;
  rateItem: (id: string, rating: number) => void;
  incrementWatchCount: (id: string) => void;
  deleteItem: (id: string) => void;
  updateItemReview: (id: string, review: string) => void;
  addCustomTag: (tag: string) => void;
  deleteCustomTag: (tag: string) => void;
  clearAllData: () => void;
  generatePoster: (title: string, type: 'movie' | 'tv') => string;
}

const STORAGE_KEY = 'media-items';
const STORAGE_KEY_TAGS = 'media-tags';

const defaultCustomTags = ['科幻', '剧情', '悬疑', '喜剧', '动画', '传记', '历史', '爱情'];

export const useMediaStore = create<MediaState>((set, get) => ({
  items: storage.get<MediaItem[]>(STORAGE_KEY, mockMediaItems),
  filter: 'all',
  customTags: storage.get<string[]>(STORAGE_KEY_TAGS, defaultCustomTags),

  setFilter: (filter) => set({ filter }),

  addItem: (item) => {
    const newItem: MediaItem = {
      ...item,
      poster: item.poster || generatePosterUrl(item.title, item.type),
      id: generateId(),
      watchCount: 1,
      lastWatchedDate: getTodayStr(),
    };
    set((state) => {
      const items = [newItem, ...state.items];
      storage.set(STORAGE_KEY, items);
      return { items };
    });
  },

  rateItem: (id, rating) => {
    set((state) => {
      const items = state.items.map((i) => (i.id === id ? { ...i, rating } : i));
      storage.set(STORAGE_KEY, items);
      return { items };
    });
  },

  incrementWatchCount: (id) => {
    set((state) => {
      const items = state.items.map((i) =>
        i.id === id
          ? { ...i, watchCount: i.watchCount + 1, lastWatchedDate: getTodayStr() }
          : i
      );
      storage.set(STORAGE_KEY, items);
      return { items };
    });
  },

  deleteItem: (id) => {
    set((state) => {
      const items = state.items.filter((i) => i.id !== id);
      storage.set(STORAGE_KEY, items);
      return { items };
    });
  },

  updateItemReview: (id, review) => {
    set((state) => {
      const items = state.items.map((i) => (i.id === id ? { ...i, review } : i));
      storage.set(STORAGE_KEY, items);
      return { items };
    });
  },

  addCustomTag: (tag) => {
    set((state) => {
      if (state.customTags.includes(tag)) return state;
      const customTags = [...state.customTags, tag];
      storage.set(STORAGE_KEY_TAGS, customTags);
      return { customTags };
    });
  },

  deleteCustomTag: (tag) => {
    set((state) => {
      const customTags = state.customTags.filter((t) => t !== tag);
      storage.set(STORAGE_KEY_TAGS, customTags);
      return { customTags };
    });
  },

  clearAllData: () => {
    storage.remove(STORAGE_KEY);
    storage.remove(STORAGE_KEY_TAGS);
    set({
      items: mockMediaItems,
      customTags: defaultCustomTags,
    });
  },

  generatePoster: (title, type) => generatePosterUrl(title, type),
}));
