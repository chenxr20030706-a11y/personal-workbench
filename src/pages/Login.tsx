import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Settings,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

type Mode = 'login' | 'register';
type LoginMethod = 'password' | 'code';

export default function Login() {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    configured,
    sendCode,
    verifyAndRegister,
    verifyAndLogin,
    loginWithPassword,
    loginAsGuest,
  } = useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');

  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSendCode = async () => {
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('请输入正确的邮箱地址');
      return;
    }

    setIsSending(true);
    const result = await sendCode(email, mode === 'register');
    setIsSending(false);

    if (result.success) {
      setCountdown(60);
      setSuccess('验证码已发送到您的邮箱，请查收（注意检查垃圾邮件）');
    } else {
      setError(result.error || '验证码发送失败');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('请输入正确的邮箱地址');
      return;
    }

    if (mode === 'register') {
      if (!nickname.trim()) {
        setError('请输入昵称');
        return;
      }
      if (!password || password.length < 6) {
        setError('密码至少6位');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
      if (!code || code.length !== 6) {
        setError('请输入6位验证码');
        return;
      }

      setIsSubmitting(true);
      const result = await verifyAndRegister(email, code, password, nickname.trim());
      setIsSubmitting(false);

      if (result.success) {
        setSuccess('注册成功，正在进入...');
        setTimeout(() => navigate('/'), 800);
      } else {
        setError(result.error || '注册失败');
      }
    } else {
      if (loginMethod === 'password') {
        if (!password) {
          setError('请输入密码');
          return;
        }
        setIsSubmitting(true);
        const result = await loginWithPassword(email, password);
        setIsSubmitting(false);

        if (result.success) {
          setSuccess('登录成功，正在进入...');
          setTimeout(() => navigate('/'), 800);
        } else {
          setError(result.error || '登录失败');
        }
      } else {
        if (!code || code.length !== 6) {
          setError('请输入6位验证码');
          return;
        }
        setIsSubmitting(true);
        const result = await verifyAndLogin(email, code);
        setIsSubmitting(false);

        if (result.success) {
          setSuccess('登录成功，正在进入...');
          setTimeout(() => navigate('/'), 800);
        } else {
          setError(result.error || '登录失败');
        }
      }
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
    setCode('');
    setNickname('');
    setCountdown(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dream-blue-100 via-dream-cream-100 to-dream-blue-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-dream-blue-300/25 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-dream-gold-200/25 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-dream-blue-200/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 shadow-soft-lg animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-glow-soft">
              <Sparkles className="w-8 h-8 text-white icon-glow" />
            </div>
            <h1 className="text-2xl font-display font-bold gradient-text mb-2">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-dream-blue-500 text-sm">
              {mode === 'login' ? '登录您的个人工作台' : '开启您的个性化之旅'}
            </p>
          </div>

          {!configured && (
            <div className="mb-5 p-4 bg-dream-gold-50 border border-dream-gold-200 rounded-xl">
              <div className="flex items-start gap-2 mb-2">
                <Settings className="w-5 h-5 text-dream-gold-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-dream-gold-700 mb-1">需要配置邮件服务</p>
                  <p className="text-xs text-dream-gold-600 leading-relaxed">
                    验证码将通过 Supabase 发送到用户邮箱。请创建免费项目并配置：
                  </p>
                  <ol className="text-xs text-dream-gold-600 mt-2 space-y-1 list-decimal list-inside">
                    <li>访问 <a href="https://supabase.com" target="_blank" rel="noopener" className="underline">supabase.com</a> 注册（可GitHub登录）</li>
                    <li>创建新项目（免费，50000月活用户）</li>
                    <li>进入 Project Settings → API</li>
                    <li>复制 Project URL 和 anon key</li>
                    <li>填入项目根目录 <code className="bg-dream-gold-100 px-1 rounded">.env</code> 文件</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 p-1 bg-dream-blue-50/80 rounded-xl mb-6">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === 'login' ? 'gradient-bg text-white shadow-soft' : 'text-dream-blue-500 hover:bg-dream-blue-100'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === 'register' ? 'gradient-bg text-white shadow-soft' : 'text-dream-blue-500 hover:bg-dream-blue-100'
              }`}
            >
              注册
            </button>
          </div>

          {mode === 'login' && (
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => { setLoginMethod('password'); setError(''); setSuccess(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  loginMethod === 'password' ? 'bg-dream-blue-100 text-dream-blue-600' : 'text-dream-blue-500 hover:bg-dream-blue-50'
                }`}
              >
                <Lock className="w-4 h-4" />
                密码登录
              </button>
              <button
                onClick={() => { setLoginMethod('code'); setError(''); setSuccess(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  loginMethod === 'code' ? 'bg-dream-blue-100 text-dream-blue-600' : 'text-dream-blue-500 hover:bg-dream-blue-50'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                验证码登录
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-green-600">{success}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-dream-slate-600 mb-2 block">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dream-blue-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="请输入邮箱地址"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-dream-blue-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-dream-blue-400"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">昵称</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dream-blue-400" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="请输入昵称"
                    maxLength={20}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-dream-blue-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-dream-blue-400"
                  />
                </div>
              </div>
            )}

            {(mode === 'register' || (mode === 'login' && loginMethod === 'password')) && (
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dream-blue-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder={mode === 'register' ? '至少6位密码' : '请输入密码'}
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-dream-blue-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-dream-blue-400"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-dream-blue-100 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-dream-blue-400" /> : <Eye className="w-4 h-4 text-dream-blue-400" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">确认密码</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dream-blue-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="再次输入密码"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-dream-blue-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-dream-blue-400"
                  />
                </div>
              </div>
            )}

            {(mode === 'register' || (mode === 'login' && loginMethod === 'code')) && (
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">验证码</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dream-blue-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="请输入邮箱收到的6位验证码"
                    className="w-full pl-12 pr-32 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-dream-blue-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-dream-blue-400 tracking-widest"
                  />
                  <button
                    onClick={handleSendCode}
                    disabled={countdown > 0 || isSending || !configured}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                      countdown > 0 || isSending || !configured
                        ? 'bg-dream-blue-100 text-dream-blue-400 cursor-not-allowed'
                        : 'gradient-bg text-white hover:shadow-soft'
                    }`}
                  >
                    {isSending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      '获取验证码'
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !configured}
              className="w-full py-3.5 gradient-btn text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-soft-lg transition-all duration-300 group disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  {mode === 'login' ? '登录' : '注册并登录'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dream-blue-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-dream-blue-400 bg-white/60 backdrop-blur-sm">或者</span>
              </div>
            </div>

            <button
              onClick={() => { loginAsGuest(); navigate('/'); }}
              className="w-full py-3 bg-white/80 border border-dream-blue-200 text-dream-blue-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white hover:shadow-soft transition-all duration-300 group"
            >
              <Zap className="w-5 h-5" />
              游客模式直接进入
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-dream-slate-500">
              {mode === 'login' ? '还没有账号？' : '已有账号？'}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-dream-blue-500 hover:text-dream-blue-600 font-medium ml-1"
              >
                {mode === 'login' ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-dream-blue-100/50">
            <p className="text-xs text-center text-dream-blue-400">
              <ShieldCheck className="w-3 h-3 inline mr-1" />
              邮箱验证码 · 密码加密存储 · 安全登录
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
