import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

function loadUsers() {
  if (!existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

const codeStore = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(userId) {
  const payload = { userId, ts: Date.now() };
  const str = JSON.stringify(payload);
  return Buffer.from(str).toString('base64url') + '.' + crypto.createHmac('sha256', process.env.JWT_SECRET || 'workbench_jwt_secret_2024').update(str).digest('hex');
}

function verifyToken(token) {
  if (!token) return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;
  try {
    const expectedSig = crypto.createHmac('sha256', process.env.JWT_SECRET || 'workbench_jwt_secret_2024').update(Buffer.from(payloadB64, 'base64url').toString()).digest('hex');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    return payload;
  } catch {
    return null;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/auth/check-email', (req, res) => {
  const email = (req.query.email || '').toString().trim().toLowerCase();
  if (!email) return res.json({ registered: false });
  const users = loadUsers();
  const exists = users.some(u => u.email === email);
  res.json({ registered: exists });
});

app.post('/api/auth/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '请输入正确的邮箱地址' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const code = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  codeStore.set(normalizedEmail, { code, expiresAt });

  console.log(`📧 验证码生成成功: ${normalizedEmail} -> ${code}`);
  res.json({ success: true, code, message: '验证码已生成' });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, nickname, code } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: '请输入正确的邮箱地址' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: '密码至少6位' });
  }
  if (!nickname || !nickname.trim()) {
    return res.status(400).json({ error: '请输入昵称' });
  }
  if (!code || code.length !== 6) {
    return res.status(400).json({ error: '请输入6位验证码' });
  }

  const stored = codeStore.get(normalizedEmail);
  if (!stored || stored.code !== code) {
    return res.status(400).json({ error: '验证码错误' });
  }
  if (Date.now() > stored.expiresAt) {
    codeStore.delete(normalizedEmail);
    return res.status(400).json({ error: '验证码已过期，请重新获取' });
  }

  const users = loadUsers();
  if (users.some(u => u.email === normalizedEmail)) {
    return res.status(400).json({ error: '该邮箱已注册，请直接登录' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    nickname: nickname.trim(),
    passwordHash,
    avatar: nickname.trim().charAt(0).toUpperCase(),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  codeStore.delete(normalizedEmail);

  const token = generateToken(newUser.id);
  res.json({
    success: true,
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      nickname: newUser.nickname,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      lastLoginAt: newUser.lastLoginAt,
    },
  });
});

app.post('/api/auth/login-password', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: '请输入邮箱和密码' });
  }

  const users = loadUsers();
  const user = users.find(u => u.email === normalizedEmail);
  if (!user) {
    return res.status(400).json({ error: '该邮箱未注册，请先注册' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(400).json({ error: '密码错误' });
  }

  user.lastLoginAt = new Date().toISOString();
  saveUsers(users);

  const token = generateToken(user.id);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

app.post('/api/auth/login-code', async (req, res) => {
  const { email, code } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail || !code || code.length !== 6) {
    return res.status(400).json({ error: '请输入邮箱和6位验证码' });
  }

  const stored = codeStore.get(normalizedEmail);
  if (!stored || stored.code !== code) {
    return res.status(400).json({ error: '验证码错误' });
  }
  if (Date.now() > stored.expiresAt) {
    codeStore.delete(normalizedEmail);
    return res.status(400).json({ error: '验证码已过期，请重新获取' });
  }

  const users = loadUsers();
  const user = users.find(u => u.email === normalizedEmail);
  if (!user) {
    return res.status(400).json({ error: '该邮箱未注册，请先注册' });
  }

  user.lastLoginAt = new Date().toISOString();
  saveUsers(users);
  codeStore.delete(normalizedEmail);

  const token = generateToken(user.id);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

app.get('/api/auth/verify', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.json({ valid: false });
  }
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.json({ valid: false });
  }
  const users = loadUsers();
  const user = users.find(u => u.id === payload.userId);
  if (!user) {
    return res.json({ valid: false });
  }
  res.json({
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ 后端服务已启动: http://localhost:${PORT}`);
  console.log('📧 开发模式：验证码会打印到控制台');
});
