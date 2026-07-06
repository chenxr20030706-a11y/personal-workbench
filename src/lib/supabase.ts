const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase 配置检查:', { 
  url: SUPABASE_URL ? '已设置' : '未设置', 
  key: SUPABASE_ANON_KEY ? `已设置(${SUPABASE_ANON_KEY.slice(0, 10)}...)` : '未设置',
});

export const isSupabaseConfigured = (): boolean => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
};

// 通过 Vite 代理访问 Supabase，绕过浏览器网络限制
const API_BASE = '/supabase';

async function sbFetch(path: string, options: RequestInit = {}, accessToken?: string) {
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const msg = data?.msg || data?.message || data?.error_description || data?.error || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: SupabaseUser;
}

export interface SupabaseUser {
  id: string;
  email: string;
  user_metadata?: { nickname?: string };
  created_at: string;
  last_sign_in_at: string;
}

export const supabaseAuth = {
  // 发送验证码
  async sendOtp(email: string, shouldCreateUser: boolean): Promise<void> {
    await sbFetch('/auth/v1/otp', {
      method: 'POST',
      body: JSON.stringify({ email, options: { shouldCreateUser } }),
    });
  },

  // 验证验证码
  async verifyOtp(email: string, token: string): Promise<SupabaseSession> {
    return await sbFetch('/auth/v1/verify', {
      method: 'POST',
      body: JSON.stringify({ email, token, type: 'email' }),
    });
  },

  // 密码登录
  async signInWithPassword(email: string, password: string): Promise<SupabaseSession> {
    return await sbFetch('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // 获取用户信息
  async getUser(accessToken: string): Promise<SupabaseUser> {
    return await sbFetch('/auth/v1/user', {}, accessToken);
  },

  // 更新用户（设置密码、昵称）
  async updateUser(accessToken: string, updates: { password?: string; data?: { nickname?: string } }): Promise<SupabaseUser> {
    return await sbFetch('/auth/v1/user', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, accessToken);
  },

  // 刷新 token
  async refreshSession(refreshToken: string): Promise<SupabaseSession> {
    return await sbFetch('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
};
