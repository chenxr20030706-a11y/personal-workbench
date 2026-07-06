import { useState, useRef } from 'react';
import {
  Settings,
  User,
  Palette,
  Type,
  Globe,
  Sparkles,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Edit3,
  Moon,
  Sun,
  Droplets,
  Upload,
  Trash2,
  Download,
  Info,
  Zap,
  Layers,
  Heart,
  Github,
  Mail,
  BookOpen,
  Key,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Share2,
  SquareArrowOutUpRight,
  PlusSquare,
} from 'lucide-react';
import { useSettingsStore, getDailyQuote } from '../store/useSettingsStore';
import type { Language, ThemeStyle, FontStyle, AccentColor } from '../store/useSettingsStore';
import { storage } from '../utils/storage';
import { useReadingStore } from '../store/useReadingStore';
import { isValidWeReadApiKey } from '../utils/wereadApi';

const languageOptions: { value: Language; label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: 'English' },
];

const themeOptions: { value: ThemeStyle; label: string; icon: typeof Sun; color: string }[] = [
  { value: 'light', label: '浅色模式', icon: Sun, color: 'from-yellow-200 to-orange-200' },
  { value: 'dark', label: '深色模式', icon: Moon, color: 'from-slate-400 to-slate-600' },
  { value: 'purple', label: '紫色主题', icon: Droplets, color: 'from-purple-400 to-pink-400' },
];

const fontOptions: { value: FontStyle; label: string; example: string }[] = [
  { value: 'default', label: '默认无衬线', example: 'Aa 你好' },
  { value: 'serif', label: '衬线字体', example: 'Aa 你好' },
  { value: 'round', label: '圆角字体', example: 'Aa 你好' },
];

const accentColorOptions: { value: AccentColor; label: string; color: string; ring: string }[] = [
  { value: 'purple', label: '紫色', color: 'from-purple-400 to-pink-400', ring: 'ring-purple-400' },
  { value: 'blue', label: '蓝色', color: 'from-blue-400 to-indigo-400', ring: 'ring-blue-400' },
  { value: 'green', label: '绿色', color: 'from-green-400 to-emerald-400', ring: 'ring-green-400' },
  { value: 'orange', label: '橙色', color: 'from-orange-400 to-amber-400', ring: 'ring-orange-400' },
  { value: 'pink', label: '粉色', color: 'from-pink-400 to-rose-400', ring: 'ring-pink-400' },
  { value: 'teal', label: '青色', color: 'from-teal-400 to-cyan-400', ring: 'ring-teal-400' },
];

const avatarColors = [
  'from-dream-blue-400 to-dream-blue-500',
  'from-dream-blue-300 to-dream-blue-400',
  'from-dream-gold-300 to-dream-gold-400',
  'from-green-400 to-emerald-400',
  'from-dream-gold-400 to-orange-400',
  'from-dream-blue-400 to-dream-blue-600',
];

export default function SettingsPage() {
  const {
    userName,
    avatar,
    avatarImage,
    workspaceName,
    language,
    themeStyle,
    fontStyle,
    customGreeting,
    useDailyQuote,
    accentColor,
    glassOpacity,
    animationsEnabled,
    setUserName,
    setAvatar,
    setAvatarImage,
    setWorkspaceName,
    setLanguage,
    setThemeStyle,
    setFontStyle,
    setCustomGreeting,
    setUseDailyQuote,
    setAccentColor,
    setGlassOpacity,
    setAnimationsEnabled,
    exportAllData,
    importAllData,
  } = useSettingsStore();

  const {
    wereadApiKey,
    wereadConnected,
    wereadAsync,
    setWeReadApiKey,
    clearWeReadApiKey,
    testWeReadConnection,
  } = useReadingStore();

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [editingWorkspace, setEditingWorkspace] = useState(false);
  const [tempWorkspace, setTempWorkspace] = useState(workspaceName);
  const [editingGreeting, setEditingGreeting] = useState(false);
  const [tempGreeting, setTempGreeting] = useState(customGreeting);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [showImportError, setShowImportError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // WeRead API Key 设置相关
  const [tempApiKey, setTempApiKey] = useState(wereadApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    if (!trimmed || !isValidWeReadApiKey(trimmed)) return;
    setWeReadApiKey(trimmed);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const ok = await testWeReadConnection();
    setTesting(false);
    setTestResult(ok ? 'success' : 'error');
  };

  const handleClearApiKey = () => {
    clearWeReadApiKey();
    setTempApiKey('');
    setTestResult(null);
    setShowClearConfirm(false);
  };

  const handleResetData = () => {
    const keys = [
      'workspace-modules',
      'research-papers',
      'research-notes',
      'research-chat',
      'reading-books',
      'reading-stats',
      'reading-tags',
      'media-items',
      'media-tags',
      'career-positions',
      'career-experiences',
      'ielts-modules',
      'ielts-records',
      'ielts-checkins',
      'ielts-target',
      'ielts-exam',
      'health-data',
      'health-meals',
      'health-supplements',
      'health-goals',
      'health-initial-weight',
      'health-target-weight',
      'health-body-fat',
      'health-muscle',
    ];
    keys.forEach((key) => storage.remove(key));
    window.location.reload();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (confirm('确定要移除头像吗？')) {
      setAvatarImage('');
    }
  };

  const handleExportData = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const success = importAllData(result);
      if (success) {
        setShowImportSuccess(true);
        setTimeout(() => setShowImportSuccess(false), 3000);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setShowImportError(true);
        setTimeout(() => setShowImportError(false), 3000);
      }
    };
    reader.readAsText(file);
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-8">
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-soft-lg">
            <Settings className="w-7 h-7 text-white icon-glow" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold gradient-text">设置</h2>
            <p className="text-dream-blue-500 text-sm">个性化你的工作台</p>
          </div>
        </div>
      </div>

      {showImportSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-up flex items-center gap-2">
          <Check className="w-5 h-5" />
          数据导入成功，正在刷新页面...
        </div>
      )}

      {showImportError && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-up flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          数据导入失败，请检查文件格式
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-1">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-dream-blue-500" />
          个人信息
        </h3>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-dream-slate-600 mb-3 block">头像</label>
            <div className="flex items-start gap-6">
              <div className="relative group">
                {avatarImage ? (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-purple-200 shadow-soft">
                    <img
                      src={avatarImage}
                      alt="头像"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-white font-bold text-2xl shadow-soft">
                    {avatar}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    上传头像
                  </button>
                  {avatarImage && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-pink-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      移除
                    </button>
                  )}
                </div>
                <p className="text-xs text-dream-blue-400">
                  支持 JPG、PNG 格式，大小不超过 2MB
                </p>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-dream-blue-100/50">
                  <span className="text-xs text-dream-blue-400">或选择颜色头像：</span>
                  {avatarColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setAvatar(userName.charAt(0).toUpperCase());
                        setAvatarImage('');
                      }}
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm transition-all duration-300 hover:scale-110 ${
                        !avatarImage && avatar === userName.charAt(0).toUpperCase() && index === 0
                          ? 'ring-2 ring-dream-blue-400 ring-offset-2'
                          : ''
                      }`}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-dream-slate-600 mb-2 block">昵称</label>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (tempName.trim()) {
                      setUserName(tempName.trim());
                      setAvatar(tempName.trim().charAt(0).toUpperCase());
                    }
                    setEditingName(false);
                  }}
                  className="gradient-btn px-4 py-2 rounded-xl text-white text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempName(userName);
                  setEditingName(true);
                }}
                className="flex items-center justify-between p-3 bg-dream-blue-50/50 rounded-xl cursor-pointer hover:bg-dream-blue-50 transition-colors"
              >
                <span className="text-dream-slate-700 font-medium">{userName}</span>
                <Edit3 className="w-4 h-4 text-dream-blue-400" />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-dream-slate-600 mb-2 block">工作台名称</label>
            {editingWorkspace ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempWorkspace}
                  onChange={(e) => setTempWorkspace(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (tempWorkspace.trim()) {
                      setWorkspaceName(tempWorkspace.trim());
                    }
                    setEditingWorkspace(false);
                  }}
                  className="gradient-btn px-4 py-2 rounded-xl text-white text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempWorkspace(workspaceName);
                  setEditingWorkspace(true);
                }}
                className="flex items-center justify-between p-3 bg-dream-blue-50/50 rounded-xl cursor-pointer hover:bg-dream-blue-50 transition-colors"
              >
                <span className="text-dream-slate-700 font-medium">{workspaceName}</span>
                <Edit3 className="w-4 h-4 text-dream-blue-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-2">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-500" />
          首页问候语
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-dream-slate-700">使用每日激励语</span>
            <button
              onClick={() => setUseDailyQuote(!useDailyQuote)}
              className={`w-12 h-6 rounded-full transition-all duration-300 ${
                useDailyQuote ? 'gradient-bg' : 'bg-dream-blue-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                  useDailyQuote ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-sm text-dream-slate-600 mb-2 block">自定义问候语（可选）</label>
            {editingGreeting ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempGreeting}
                  onChange={(e) => setTempGreeting(e.target.value)}
                  placeholder="输入你喜欢的问候语..."
                  className="flex-1 px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setCustomGreeting(tempGreeting.trim());
                    setEditingGreeting(false);
                  }}
                  className="gradient-btn px-4 py-2 rounded-xl text-white text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempGreeting(customGreeting);
                  setEditingGreeting(true);
                }}
                className="flex items-center justify-between p-3 bg-dream-blue-50/50 rounded-xl cursor-pointer hover:bg-dream-blue-50 transition-colors"
              >
                <span className="text-dream-slate-600">
                  {customGreeting || '点击设置自定义问候语'}
                </span>
                <Edit3 className="w-4 h-4 text-dream-blue-400" />
              </div>
            )}
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <p className="text-xs text-dream-blue-500 mb-2">今日激励语预览：</p>
            <p className="text-dream-slate-700 font-medium">
              {useDailyQuote ? getDailyQuote() : customGreeting || '欢迎回来'}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-3">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-dream-blue-500" />
          主题风格
        </h3>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-dream-slate-600 mb-3 block">主题模式</label>
            <div className="grid grid-cols-3 gap-4">
              {themeOptions.map((theme) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.value}
                    onClick={() => setThemeStyle(theme.value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      themeStyle === theme.value
                        ? 'border-lavender-400 bg-lavender-50/50'
                        : 'border-transparent bg-dream-blue-50/30 hover:bg-dream-blue-50/60'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.color} flex items-center justify-center mx-auto mb-2`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-dream-slate-700 font-medium">{theme.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm text-dream-slate-600 mb-3 block">主题强调色</label>
            <div className="flex flex-wrap gap-3">
              {accentColorOptions.map((accent) => (
                <button
                  key={accent.value}
                  onClick={() => setAccentColor(accent.value)}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent.color} transition-all duration-300 hover:scale-110 ${
                    accentColor === accent.value
                      ? `ring-2 ${accent.ring} ring-offset-2`
                      : ''
                  }`}
                  title={accent.label}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-dream-slate-600">玻璃态透明度</label>
              <span className="text-sm text-dream-blue-500 font-medium">{glassOpacity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={glassOpacity}
              onChange={(e) => setGlassOpacity(Number(e.target.value))}
              className="w-full h-2 bg-dream-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-dream-blue-400 mt-1">
              <span>透明</span>
              <span>不透明</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-dream-slate-700">动画效果</span>
            </div>
            <button
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              className={`w-12 h-6 rounded-full transition-all duration-300 ${
                animationsEnabled ? 'gradient-bg' : 'bg-dream-blue-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                  animationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-4">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-green-500" />
          字体样式
        </h3>

        <div className="space-y-2">
          {fontOptions.map((font) => (
            <button
              key={font.value}
              onClick={() => setFontStyle(font.value)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                fontStyle === font.value
                  ? 'bg-gradient-to-r from-lavender-100 to-purple-100 ring-2 ring-dream-blue-300'
                  : 'bg-dream-blue-50/30 hover:bg-dream-blue-50/60'
              }`}
            >
              <span className="text-dream-slate-700 font-medium">{font.label}</span>
              <span
                className={`text-lg ${
                  font.value === 'serif' ? 'font-display' : ''
                }`}
              >
                {font.example}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-5">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          语言
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {languageOptions.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className={`p-4 rounded-xl transition-all duration-300 ${
                language === lang.value
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 ring-2 ring-blue-300'
                  : 'bg-dream-blue-50/30 hover:bg-dream-blue-50/60'
              }`}
            >
              <p className="text-dream-slate-700 font-medium">{lang.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-6">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          数据管理
        </h3>

        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 w-full py-3 gradient-btn text-white rounded-xl hover:opacity-90 transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">导出全部数据</span>
          </button>

          <button
            onClick={() => importInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full py-3 border border-dream-blue-200 text-dream-slate-600 rounded-xl hover:bg-dream-blue-50 transition-all duration-300"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">导入数据</span>
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />

          <p className="text-xs text-dream-blue-400 text-center">
            导出为 JSON 格式备份，可随时导入恢复
          </p>

          <div className="pt-3 border-t border-dream-blue-100/50">
            {showResetConfirm ? (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-700 mb-3">
                  ⚠️ 确定要清空所有数据吗？此操作不可撤销！
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetData}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
                  >
                    确认清空
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2 bg-dream-blue-100 text-dream-slate-600 rounded-lg text-sm font-medium hover:bg-dream-blue-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center justify-center gap-2 w-full py-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all duration-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">清空所有数据</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-6">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-500" />
          微信读书 API
        </h3>

        <div className="space-y-4">
          <p className="text-xs text-dream-blue-500 leading-relaxed">
            配置 WeRead API Key 后，可同步微信读书书架、搜索书籍、查看笔记与划线、阅读统计与个性化推荐。未配置时阅读模块将使用模拟数据。Key 仅保存在本地浏览器中。
          </p>

          {/* 连接状态徽章 */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${
              wereadConnected === 'connected'
                ? 'bg-green-50/60 border-green-200'
                : wereadConnected === 'error'
                ? 'bg-red-50/60 border-red-200'
                : 'bg-dream-blue-50/40 border-dream-blue-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  wereadConnected === 'connected'
                    ? 'bg-mint-400 animate-pulse-soft'
                    : wereadConnected === 'error'
                    ? 'bg-pink-400'
                    : 'bg-purple-300'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  wereadConnected === 'connected'
                    ? 'text-mint-700'
                    : wereadConnected === 'error'
                    ? 'text-red-600'
                    : 'text-dream-blue-500'
                }`}
              >
                {wereadConnected === 'connected'
                  ? '已连接微信读书'
                  : wereadConnected === 'error'
                  ? '连接失败'
                  : '未连接（模拟数据模式）'}
              </span>
            </div>
            {wereadAsync.lastFetchedAt && (
              <span className="text-xs text-dream-blue-400">
                {new Date(wereadAsync.lastFetchedAt).toLocaleString('zh-CN')}
              </span>
            )}
          </div>

          {/* API Key 输入 */}
          <div>
            <label className="text-sm text-dream-slate-600 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveApiKey();
                  }}
                  placeholder="wrk-xxxxxxxx"
                  className="w-full px-4 py-2 pr-10 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dream-blue-400 hover:text-dream-slate-600 transition-colors"
                  aria-label={showApiKey ? '隐藏' : '显示'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleSaveApiKey}
                disabled={
                  !tempApiKey.trim() ||
                  !isValidWeReadApiKey(tempApiKey.trim()) ||
                  tempApiKey.trim() === wereadApiKey
                }
                className="gradient-btn px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Check className="w-4 h-4" />
                保存
              </button>
            </div>
            {tempApiKey.trim() && !isValidWeReadApiKey(tempApiKey.trim()) && (
              <p className="text-xs text-red-500 mt-1">格式不正确，应以 wrk- 开头</p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleTestConnection}
              disabled={!wereadApiKey || testing || !isValidWeReadApiKey(wereadApiKey)}
              className="flex items-center gap-2 px-4 py-2 border border-dream-blue-200 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              {testing ? '测试中...' : '测试连接'}
            </button>

            {wereadApiKey && (
              showClearConfirm ? (
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-red-600">确定清除？</span>
                  <button
                    onClick={handleClearApiKey}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-pink-600 transition-colors"
                  >
                    确认
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1.5 bg-dream-blue-100 text-dream-slate-600 rounded-lg text-xs font-medium hover:bg-dream-blue-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清除
                </button>
              )
            )}

            <a
              href="https://weread.qq.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-dream-blue-500 rounded-xl text-sm font-medium hover:bg-dream-blue-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              前往微信读书
            </a>
          </div>

          {/* 测试结果提示 */}
          {testResult === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50/60 text-mint-700 rounded-xl text-sm animate-fade-in-up">
              <Check className="w-4 h-4" />
              连接成功！已成功同步书架数据。
            </div>
          )}
          {testResult === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50/60 text-red-600 rounded-xl text-sm animate-fade-in-up">
              <AlertCircle className="w-4 h-4" />
              {wereadAsync.error || '连接失败，请检查 API Key 是否正确'}
            </div>
          )}
          {wereadConnected === 'error' && !testResult && wereadAsync.error && (
            <div className="flex items-center gap-2 p-3 bg-red-50/60 text-red-600 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4" />
              {wereadAsync.error}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-7">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-dream-blue-500" />
          安装到桌面
        </h3>

        <div className="space-y-4">
          <p className="text-sm text-dream-slate-600 leading-relaxed">
            将工作台安装到手机或电脑桌面，像原生应用一样使用。无需打开浏览器，一键直达，支持离线访问。
          </p>

          {/* iOS Safari */}
          <div className="p-4 bg-dream-blue-50/80 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-dream-blue-500" />
              <h4 className="font-medium text-dream-slate-700 text-sm">iPhone / iPad (Safari)</h4>
            </div>
            <ol className="space-y-2 text-sm text-dream-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>点击底部工具栏中间的 <Share2 className="w-3.5 h-3.5 inline text-dream-blue-500" /> <strong>分享</strong> 按钮</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>在弹出的菜单中向上滑动，找到并点击 <PlusSquare className="w-3.5 h-3.5 inline text-dream-blue-500" /> <strong>添加到主屏幕</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>点击右上角 <strong>添加</strong> 即可</span>
              </li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className="p-4 bg-dream-blue-50/80 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Tablet className="w-4 h-4 text-dream-blue-500" />
              <h4 className="font-medium text-dream-slate-700 text-sm">Android (Chrome)</h4>
            </div>
            <ol className="space-y-2 text-sm text-dream-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>点击右上角 <span className="inline-flex items-center px-1.5 py-0.5 bg-white rounded text-xs border border-dream-blue-200">⋮</span> <strong>菜单</strong> 按钮</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>选择 <strong>安装应用</strong> 或 <strong>添加到主屏幕</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>在弹出的对话框中点击 <strong>安装</strong> 即可</span>
              </li>
            </ol>
          </div>

          {/* Desktop Chrome/Edge */}
          <div className="p-4 bg-dream-blue-50/80 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4 text-dream-blue-500" />
              <h4 className="font-medium text-dream-slate-700 text-sm">电脑 (Chrome / Edge)</h4>
            </div>
            <ol className="space-y-2 text-sm text-dream-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>点击地址栏右侧的 <SquareArrowOutUpRight className="w-3.5 h-3.5 inline text-dream-blue-500" /> <strong>安装图标</strong>（如果没有，点击右上角 ⋮ 菜单）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>选择 <strong>安装个人工作台</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>点击 <strong>安装</strong>，桌面会出现应用图标</span>
              </li>
            </ol>
          </div>

          <div className="p-3 bg-dream-gold-50 rounded-xl flex items-start gap-2">
            <Zap className="w-4 h-4 text-dream-gold-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-dream-gold-600">
              安装后，应用会自动保持更新。下次有新功能时，打开应用即可自动同步最新版本。
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-8">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-dream-blue-500" />
          关于
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-soft">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-dream-slate-800 text-lg">个人工作台</h4>
              <p className="text-sm text-dream-blue-500">Version 1.0.0</p>
            </div>
          </div>

          <p className="text-sm text-dream-slate-600 leading-relaxed">
            一款集科研管理、阅读追踪、媒体库、职业规划、雅思学习和健康管理于一体的个人效率工具。
            让你的生活井井有条，每一天都充满动力 ✨
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href="mailto:hello@example.com"
              className="flex items-center justify-center gap-2 py-3 bg-dream-blue-50 text-dream-slate-600 rounded-xl hover:bg-dream-blue-100 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">联系我们</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 bg-dream-blue-50 text-dream-slate-600 rounded-xl hover:bg-dream-blue-100 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
          </div>

          <div className="flex items-center justify-center gap-1 pt-2 text-xs text-dream-blue-400">
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
            <span>用心打造，为你而来</span>
          </div>
        </div>
      </div>
    </div>
  );
}
