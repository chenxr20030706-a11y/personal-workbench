import { create } from 'zustand';
import { storage } from '../utils/storage';

export type Language = 'zh-CN' | 'en';
export type ThemeStyle = 'light' | 'dark' | 'purple';
export type FontStyle = 'default' | 'serif' | 'round';
export type AccentColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'teal';

interface UserSettings {
  userName: string;
  avatar: string;
  avatarImage: string;
  workspaceName: string;
  language: Language;
  themeStyle: ThemeStyle;
  fontStyle: FontStyle;
  customGreeting: string;
  useDailyQuote: boolean;
  sidebarCollapsed: boolean;
  accentColor: AccentColor;
  glassOpacity: number;
  animationsEnabled: boolean;
  setUserName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setAvatarImage: (image: string) => void;
  setWorkspaceName: (name: string) => void;
  setLanguage: (lang: Language) => void;
  setThemeStyle: (theme: ThemeStyle) => void;
  setFontStyle: (font: FontStyle) => void;
  setCustomGreeting: (greeting: string) => void;
  setUseDailyQuote: (use: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAccentColor: (color: AccentColor) => void;
  setGlassOpacity: (opacity: number) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  exportAllData: () => string;
  importAllData: (data: string) => boolean;
}

const STORAGE_KEY = 'user-settings';

const defaultSettings = {
  userName: '同学',
  avatar: 'S',
  avatarImage: '',
  workspaceName: '个人工作台',
  language: 'zh-CN' as Language,
  themeStyle: 'purple' as ThemeStyle,
  fontStyle: 'default' as FontStyle,
  customGreeting: '',
  useDailyQuote: true,
  sidebarCollapsed: false,
  accentColor: 'purple' as AccentColor,
  glassOpacity: 80,
  animationsEnabled: true,
};

const dailyQuotes = [
  '今天也要元气满满哦 ✨',
  '科研顺利，心情美丽 🌸',
  '每一天都是新的开始 🌅',
  '慢慢来，比较快 🐢',
  '你超棒的，继续加油 💪',
  '今天的你也闪闪发光 ✨',
  '保持热爱，奔赴山海 🏔️',
  '好好吃饭，好好睡觉 😴',
  '学无止境，气有浩然 📚',
  '生活明朗，万物可爱 🌻',
];

export const getDailyQuote = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyQuotes[dayOfYear % dailyQuotes.length];
};

export const useSettingsStore = create<UserSettings>((set) => ({
  ...storage.get(STORAGE_KEY, defaultSettings),

  setUserName: (name) =>
    set((state) => {
      const newState = { ...state, userName: name };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setAvatar: (avatar) =>
    set((state) => {
      const newState = { ...state, avatar };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setWorkspaceName: (name) =>
    set((state) => {
      const newState = { ...state, workspaceName: name };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setLanguage: (lang) =>
    set((state) => {
      const newState = { ...state, language: lang };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setThemeStyle: (theme) =>
    set((state) => {
      const newState = { ...state, themeStyle: theme };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setFontStyle: (font) =>
    set((state) => {
      const newState = { ...state, fontStyle: font };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setCustomGreeting: (greeting) =>
    set((state) => {
      const newState = { ...state, customGreeting: greeting };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setUseDailyQuote: (use) =>
    set((state) => {
      const newState = { ...state, useDailyQuote: use };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setAvatarImage: (image) =>
    set((state) => {
      const newState = { ...state, avatarImage: image };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  toggleSidebar: () =>
    set((state) => {
      const newState = { ...state, sidebarCollapsed: !state.sidebarCollapsed };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setSidebarCollapsed: (collapsed) =>
    set((state) => {
      const newState = { ...state, sidebarCollapsed: collapsed };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setAccentColor: (color) =>
    set((state) => {
      const newState = { ...state, accentColor: color };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setGlassOpacity: (opacity) =>
    set((state) => {
      const newState = { ...state, glassOpacity: opacity };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  setAnimationsEnabled: (enabled) =>
    set((state) => {
      const newState = { ...state, animationsEnabled: enabled };
      storage.set(STORAGE_KEY, newState);
      return newState;
    }),

  exportAllData: () => {
    const allData: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          allData[key] = value ? JSON.parse(value) : null;
        } catch {
          allData[key] = localStorage.getItem(key);
        }
      }
    }
    return JSON.stringify(allData, null, 2);
  },

  importAllData: (data) => {
    try {
      const parsed = JSON.parse(data) as Record<string, unknown>;
      Object.entries(parsed).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      return true;
    } catch {
      return false;
    }
  },
}));
