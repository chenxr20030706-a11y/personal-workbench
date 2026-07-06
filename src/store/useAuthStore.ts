import { create } from 'zustand';
import { storage } from '../utils/storage';
import { supabaseAuth, isSupabaseConfigured, type SupabaseSession } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthState {
  isLoggedIn: boolean;
  isGuest: boolean;
  currentUser: User | null;
  loading: boolean;
  configured: boolean;
  sendCode: (email: string, isRegister: boolean) => Promise<{ success: boolean; error?: string }>;
  verifyAndRegister: (email: string, code: string, password: string, nickname: string) => Promise<{ success: boolean; error?: string }>;
  verifyAndLogin: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  initAuth: () => Promise<void>;
}

const STORAGE_KEY_SESSION = 'sb-session';
const STORAGE_KEY_GUEST = 'guest-user';

function mapUser(session: SupabaseSession, nicknameOverride?: string): User {
  const nickname = nicknameOverride || session.user.user_metadata?.nickname || session.user.email?.split('@')[0] || '用户';
  return {
    id: session.user.id,
    email: session.user.email || '',
    nickname,
    avatar: nickname.charAt(0).toUpperCase(),
    createdAt: session.user.created_at || new Date().toISOString(),
    lastLoginAt: session.user.last_sign_in_at || new Date().toISOString(),
  };
}

function saveSession(session: SupabaseSession) {
  storage.set(STORAGE_KEY_SESSION, session);
}

function clearSession() {
  storage.remove(STORAGE_KEY_SESSION);
}

function getSavedSession(): SupabaseSession | null {
  return storage.get<SupabaseSession | null>(STORAGE_KEY_SESSION, null);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isGuest: false,
  currentUser: null,
  loading: true,
  configured: isSupabaseConfigured(),

  initAuth: async () => {
    const savedGuest = storage.get<User | null>(STORAGE_KEY_GUEST, null);
    if (savedGuest) {
      set({ isLoggedIn: true, isGuest: true, currentUser: savedGuest, loading: false });
      return;
    }

    if (!isSupabaseConfigured()) {
      set({ loading: false });
      return;
    }

    const saved = getSavedSession();
    if (saved?.access_token) {
      try {
        const user = await supabaseAuth.getUser(saved.access_token);
        const nickname = user.user_metadata?.nickname || user.email?.split('@')[0] || '用户';
        set({
          isLoggedIn: true,
          currentUser: {
            id: user.id,
            email: user.email || '',
            nickname,
            avatar: nickname.charAt(0).toUpperCase(),
            createdAt: user.created_at || new Date().toISOString(),
            lastLoginAt: user.last_sign_in_at || new Date().toISOString(),
          },
          loading: false,
        });
        return;
      } catch {
        // token 过期，尝试刷新
        if (saved.refresh_token) {
          try {
            const newSession = await supabaseAuth.refreshSession(saved.refresh_token);
            saveSession(newSession);
            set({ isLoggedIn: true, currentUser: mapUser(newSession), loading: false });
            return;
          } catch {
            clearSession();
          }
        }
      }
    }
    set({ loading: false });
  },

  sendCode: async (email, isRegister) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: '邮件服务未配置' };
    }

    try {
      await supabaseAuth.sendOtp(email, isRegister);
      return { success: true };
    } catch (err: any) {
      console.error('sendCode 错误:', err);
      const msg = err?.message || String(err);
      if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
        return { success: false, error: '发送过于频繁，请稍后再试' };
      }
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || err?.name === 'TypeError') {
        return { success: false, error: '无法连接服务器，请检查网络后重试' };
      }
      return { success: false, error: msg };
    }
  },

  verifyAndRegister: async (email, code, password, nickname) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: '邮件服务未配置' };
    }

    try {
      const session = await supabaseAuth.verifyOtp(email, code);
      
      // 设置密码和昵称
      try {
        await supabaseAuth.updateUser(session.access_token, {
          password,
          data: { nickname },
        });
      } catch (e) {
        console.warn('更新用户信息失败:', e);
      }

      saveSession(session);
      set({ isLoggedIn: true, currentUser: mapUser(session, nickname) });
      return { success: true };
    } catch (err: any) {
      console.error('verifyAndRegister 错误:', err);
      const msg = err?.message || String(err);
      if (msg.includes('Token has expired') || msg.includes('invalid')) {
        return { success: false, error: '验证码错误或已过期' };
      }
      return { success: false, error: msg };
    }
  },

  verifyAndLogin: async (email, code) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: '邮件服务未配置' };
    }

    try {
      const session = await supabaseAuth.verifyOtp(email, code);
      saveSession(session);
      set({ isLoggedIn: true, currentUser: mapUser(session) });
      return { success: true };
    } catch (err: any) {
      console.error('verifyAndLogin 错误:', err);
      const msg = err?.message || String(err);
      if (msg.includes('Token has expired') || msg.includes('invalid')) {
        return { success: false, error: '验证码错误或已过期' };
      }
      return { success: false, error: msg };
    }
  },

  loginWithPassword: async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: '邮件服务未配置' };
    }

    try {
      const session = await supabaseAuth.signInWithPassword(email, password);
      saveSession(session);
      set({ isLoggedIn: true, currentUser: mapUser(session) });
      return { success: true };
    } catch (err: any) {
      console.error('loginWithPassword 错误:', err);
      const msg = err?.message || String(err);
      if (msg.includes('Invalid login') || msg.includes('invalid')) {
        return { success: false, error: '邮箱或密码错误' };
      }
      return { success: false, error: msg };
    }
  },

  loginAsGuest: () => {
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      email: '',
      nickname: '游客',
      avatar: '游',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEY_GUEST, guestUser);
    set({ isLoggedIn: true, isGuest: true, currentUser: guestUser });
  },

  logout: () => {
    clearSession();
    storage.remove(STORAGE_KEY_GUEST);
    set({ isLoggedIn: false, isGuest: false, currentUser: null });
  },

  updateProfile: (updates) => {
    const { currentUser, isGuest } = get();
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    set({ currentUser: updatedUser });

    if (isGuest) {
      storage.set(STORAGE_KEY_GUEST, updatedUser);
      return;
    }

    const saved = getSavedSession();
    if (saved?.access_token && updates.nickname) {
      supabaseAuth.updateUser(saved.access_token, { data: { nickname: updates.nickname } }).catch(() => {});
    }
  },
}));
