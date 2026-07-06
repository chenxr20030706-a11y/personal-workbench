import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  BarChart3,
  ListFilter,
  Star,
  BookMarked,
  TrendingUp,
  Clock,
  Award,
  RefreshCw,
  Plus,
  X,
  Link as LinkIcon,
  Trash2,
  Tag,
  Settings,
  Check,
  Zap,
  Target,
  Sparkles,
  Loader2,
  ChevronRight,
  Search,
  NotebookPen,
  Quote,
  MessageSquare,
  ExternalLink,
  AlertCircle,
  Download,
  Headphones,
  BookText,
  ThumbsUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useReadingStore } from '../store/useReadingStore';
import type { Book } from '../types';
import type { RecommendedBook } from '../store/useReadingStore';
import {
  buildWeReadDeeplink,
  buildWeReadWebLink,
  formatReadMinutes,
} from '../utils/wereadApi';

type TabType = 'shelf' | 'search' | 'notes' | 'stats' | 'recommendations';

export default function Reading() {
  const [activeTab, setActiveTab] = useState<TabType>('shelf');
  const {
    books,
    stats,
    customTags,
    wechatSync,
    recommendedBooks,
    addBook,
    updateBookStatus,
    deleteBook,
    toggleReread,
    clearAllData,
    connectWechat,
    disconnectWechat,
    startWechatSync,
    generateRecommendations,
    addRecommendedBookToShelf,

    // WeRead API
    wereadApiKey,
    wereadConnected,
    wereadAsync,
    searchResults,
    searchKeyword,
    wereadShelf,
    notebooks,
    bookmarks,
    thoughts,
    reviews,
    wereadRecommendations,
    readStats,
    selectedNotebookBookId,
    selectedSearchBookId,
    searchWeReadBooks,
    syncWeReadShelf,
    loadWeReadNotebooks,
    loadWeReadBookmarks,
    loadWeReadThoughts,
    loadWeReadReviews,
    loadWeReadRecommendations,
    loadWeReadReadStats,
    addWeReadSearchBookToShelf,
    setSelectedNotebookBookId,
    setSelectedSearchBookId,
  } = useReadingStore();
  const [filter, setFilter] = useState<'all' | 'reading' | 'finished' | 'want-to-read'>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWeChatSync, setShowWeChatSync] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  // 搜索
  const [searchInput, setSearchInput] = useState('');
  const [reviewSort, setReviewSort] = useState<'recommend' | 'latest'>('recommend');
  const [showReviewsForBook, setShowReviewsForBook] = useState<string | null>(null);
  const [exportedNotice, setExportedNotice] = useState<string | null>(null);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    cover: '',
    status: 'want-to-read' as Book['status'],
    isPhysical: false,
    rating: 0,
    tags: '',
  });

  useEffect(() => {
    generateRecommendations();
  }, [books]);

  // 进入页面时自动加载书架（仅首次）
  useEffect(() => {
    if (wereadShelf.length === 0 && !wereadAsync.loading) {
      syncWeReadShelf();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 切换 tab 时自动加载对应数据
  useEffect(() => {
    if (activeTab === 'shelf' && wereadShelf.length === 0 && !wereadAsync.loading) {
      syncWeReadShelf();
    }
    if (activeTab === 'search' && searchResults.length === 0 && !wereadAsync.loading) {
      searchWeReadBooks('');
    }
    if (activeTab === 'notes' && notebooks.length === 0 && !wereadAsync.loading) {
      loadWeReadNotebooks();
    }
    if (activeTab === 'stats' && !readStats && !wereadAsync.loading) {
      loadWeReadReadStats();
    }
    if (activeTab === 'recommendations' && wereadRecommendations.length === 0 && !wereadAsync.loading) {
      loadWeReadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 选中笔记本时加载划线/想法
  useEffect(() => {
    if (selectedNotebookBookId) {
      loadWeReadBookmarks(selectedNotebookBookId);
      loadWeReadThoughts(selectedNotebookBookId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNotebookBookId]);

  // 展开书评时加载书评
  useEffect(() => {
    if (showReviewsForBook) {
      loadWeReadReviews(showReviewsForBook, reviewSort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReviewsForBook, reviewSort]);

  const handleConnectWechat = async () => {
    await connectWechat();
  };

  const handleStartSync = async () => {
    await startWechatSync();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchWeReadBooks(searchInput);
  };

  const tabs = [
    { id: 'shelf', label: '我的书架', icon: BookOpen },
    { id: 'search', label: '搜索书籍', icon: Search },
    { id: 'notes', label: '我的笔记', icon: NotebookPen },
    { id: 'stats', label: '阅读统计', icon: BarChart3 },
    { id: 'recommendations', label: '书单推荐', icon: Award },
  ] as const;

  let filteredBooks = books.filter((b) => filter === 'all' || b.status === filter);
  if (tagFilter) {
    filteredBooks = filteredBooks.filter((b) => b.tags.includes(tagFilter));
  }

  // 优先使用 WeRead readStats；若没有则用本地 stats
  const effectiveDailyMinutes = useMemo(() => {
    if (readStats && readStats.dailyMinutes.length > 0) {
      return readStats.dailyMinutes.map(d => ({ day: d.date, minutes: d.minutes }));
    }
    return stats.dailyMinutes;
  }, [readStats, stats]);

  const effectiveCategoryData = useMemo(() => {
    if (readStats && readStats.categories.length > 0) {
      return readStats.categories.map(c => ({ name: c.name, value: c.minutes }));
    }
    return Object.entries(stats.categories).map(([name, value]) => ({ name, value }));
  }, [readStats, stats]);

  const COLORS = ['#A78BFA', '#F472B6', '#2DD4BF', '#FBBF24', '#60A5FA', '#34D399'];

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            onClick={() => interactive && onRate?.(star)}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-purple-200'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          />
        ))}
      </div>
    );
  };

  const statusLabels: Record<string, string> = {
    reading: '在读',
    finished: '已读完',
    'want-to-read': '想读',
  };

  const allTags = [...new Set(books.flatMap((b) => b.tags))];

  const handleAddBook = () => {
    if (!newBook.title.trim()) return;
    addBook({
      title: newBook.title,
      author: newBook.author,
      cover: newBook.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      rating: newBook.rating,
      status: newBook.status,
      isPhysical: newBook.isPhysical,
      needReread: false,
      tags: newBook.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
    });
    setNewBook({ title: '', author: '', cover: '', status: 'want-to-read', isPhysical: false, rating: 0, tags: '' });
    setShowAddBook(false);
  };

  const handleExportNotes = (bookId: string) => {
    const notebook = notebooks.find(n => n.bookId === bookId);
    if (!notebook) return;
    const nb = bookmarks.filter(b => b.bookId === bookId);
    const th = thoughts.filter(t => t.bookId === bookId);
    const lines: string[] = [];
    lines.push(`# ${notebook.title}`);
    lines.push(`作者：${notebook.author}`);
    lines.push(`导出时间：${new Date().toLocaleString('zh-CN')}`);
    lines.push('');
    lines.push(`## 划线 (${nb.length})`);
    nb.forEach((b, i) => {
      lines.push(`\n${i + 1}. [${b.chapterTitle || '未知章节'}]`);
      lines.push(`   ${b.content}`);
    });
    lines.push('');
    lines.push(`## 想法 (${th.length})`);
    th.forEach((t, i) => {
      lines.push(`\n${i + 1}. [${t.chapterTitle || '未知章节'}]`);
      lines.push(`   ${t.content}`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notebook.title}-笔记.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportedNotice(`已导出《${notebook.title}》笔记`);
    setTimeout(() => setExportedNotice(null), 2400);
  };

  const WeChatSyncModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowWeChatSync(false)}>
      <div className="glass-card rounded-3xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-dream-slate-800 text-lg">微信读书同步</h3>
          </div>
          <button onClick={() => setShowWeChatSync(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-dream-blue-500" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-dream-slate-700">连接状态</p>
              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${wechatSync.connected ? 'bg-green-100 text-green-600' : wereadConnected === 'error' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                {wechatSync.connected ? <Check className="w-3 h-3" /> : wereadConnected === 'error' ? <AlertCircle className="w-3 h-3" /> : null}
                {wechatSync.connected ? '已连接' : wereadConnected === 'error' ? '连接失败' : '未连接'}
              </span>
            </div>
            {wereadApiKey ? (
              <p className="text-xs text-dream-blue-500">API Key 已配置（{wereadApiKey.slice(0, 8)}…）</p>
            ) : (
              <p className="text-xs text-dream-blue-500">未配置 API Key，将使用模拟数据同步</p>
            )}
            {wechatSync.lastSyncTime && (
              <p className="text-xs text-dream-blue-500">上次同步：{wechatSync.lastSyncTime}</p>
            )}
            {wechatSync.syncedBookCount > 0 && (
              <p className="text-xs text-dream-blue-500 mt-1">已同步书籍：{wechatSync.syncedBookCount} 本</p>
            )}
          </div>

          {wechatSync.connected && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-dream-slate-700">同步内容</p>
              {wechatSync.steps.map((step, index) => (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    step.completed
                      ? 'bg-green-50'
                      : step.inProgress
                      ? 'bg-dream-blue-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : step.inProgress
                        ? 'bg-dream-blue-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.completed ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : step.inProgress ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      step.completed
                        ? 'text-green-600'
                        : step.inProgress
                        ? 'text-dream-slate-700 font-medium'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {wechatSync.syncing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dream-slate-600">{wechatSync.currentStep}</span>
                <span className="text-sm font-medium text-dream-blue-600">{wechatSync.progress}%</span>
              </div>
              <div className="w-full h-2 bg-dream-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${wechatSync.progress}%` }}
                />
              </div>
            </div>
          )}

          {!wechatSync.connected ? (
            <button
              onClick={handleConnectWechat}
              disabled={wechatSync.connecting}
              className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {wechatSync.connecting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 连接中...</>
              ) : (
                <><Zap className="w-4 h-4" /> {wereadApiKey ? '连接微信读书 API' : '模拟连接微信读书'}</>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleStartSync}
                disabled={wechatSync.syncing}
                className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {wechatSync.syncing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> 同步中...</>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> 立即同步</>
                )}
              </button>
              <button
                onClick={() => {
                  if (confirm('确定要断开微信读书连接吗？')) {
                    disconnectWechat();
                  }
                }}
                disabled={wechatSync.syncing || wechatSync.connecting}
                className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                断开连接
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
      <div className="glass-card rounded-3xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-dream-slate-800 text-lg">读书设置</h3>
          </div>
          <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-dream-blue-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-dream-slate-700 mb-2">自定义标签</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {customTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-dream-blue-100/80 text-dream-blue-600 rounded-full text-xs"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-dream-blue-400">在添加书籍时可使用这些标签</p>
          </div>
          <div className="pt-4 border-t border-dream-blue-100/50">
            <p className="text-sm font-medium text-dream-slate-700 mb-3">数据管理</p>
            <button
              onClick={() => {
                if (confirm('确定要清空所有读书数据吗？此操作不可恢复。')) {
                  clearAllData();
                  setShowSettings(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空所有数据
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const finishedCount = books.filter((b) => b.status === 'finished').length;
  const readingCount = books.filter((b) => b.status === 'reading').length;
  const wantToReadCount = books.filter((b) => b.status === 'want-to-read').length;

  return (
    <div className="space-y-6">
      {exportedNotice && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-up flex items-center gap-2">
          <Check className="w-5 h-5" />
          {exportedNotice}
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-soft-lg">
            <BookOpen className="w-7 h-7 text-white icon-glow" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold gradient-text">读书空间</h2>
            <p className="text-dream-blue-500 text-sm">
              共 {books.length} 本书 · 已读 {finishedCount} 本 · 在读 {readingCount} 本
              {wereadApiKey && <span className="ml-2 text-green-500">· WeRead 已连接</span>}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 hover:bg-dream-blue-100 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5 text-dream-blue-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
            <p className="text-xl font-display font-bold gradient-text">{books.length}</p>
            <p className="text-xs text-dream-blue-500">总书籍</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
            <p className="text-xl font-display font-bold text-green-600">{finishedCount}</p>
            <p className="text-xs text-dream-blue-500">已读完</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center">
            <p className="text-xl font-display font-bold text-cyan-600">{readingCount}</p>
            <p className="text-xs text-dream-blue-500">在读</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl text-center">
            <p className="text-xl font-display font-bold text-orange-500">{wantToReadCount}</p>
            <p className="text-xs text-dream-blue-500">想读</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${activeTab === tab.id
                    ? 'gradient-bg text-white shadow-soft-lg scale-105'
                    : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100 hover:scale-102'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: 我的书架 */}
      {activeTab === 'shelf' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 bg-gradient-to-r from-green-50/50 to-emerald-50/50 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-dream-slate-800">微信读书同步</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${wechatSync.connected ? 'bg-green-100 text-green-600' : wereadConnected === 'error' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {wechatSync.connected ? '已连接' : wereadConnected === 'error' ? '连接失败' : '未连接'}
                  </span>
                  {wereadApiKey && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-dream-blue-100 text-dream-blue-600">API Key 已配置</span>
                  )}
                </div>
                <p className="text-xs text-dream-blue-500">
                  {wechatSync.connected
                    ? wechatSync.syncing
                      ? wechatSync.currentStep
                      : `上次同步：${wechatSync.lastSyncTime || '刚刚'}`
                    : '一键同步你的阅读进度和书架'}
                </p>
              </div>
              <button
                onClick={() => setShowWeChatSync(true)}
                className="flex items-center gap-1 px-4 py-2 bg-white/80 text-green-600 rounded-xl text-sm font-medium hover:bg-white hover:shadow-md transition-all"
              >
                {wechatSync.connected ? (
                  <><RefreshCw className={`w-4 h-4 ${wechatSync.syncing ? 'animate-spin' : ''}`} /> 同步</>
                ) : (
                  <>去连接 <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
            {wechatSync.syncing && (
              <div className="mt-4">
                <div className="w-full h-1.5 bg-green-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${wechatSync.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* WeRead 书架（如已同步过） */}
          {wereadShelf.length > 0 && (
            <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dream-slate-800 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-green-500" />
                  微信读书书架（{wereadShelf.length}）
                </h3>
                <button
                  onClick={() => syncWeReadShelf()}
                  disabled={wereadAsync.loading}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${wereadAsync.loading ? 'animate-spin' : ''}`} />
                  刷新
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wereadShelf.map((sb) => (
                  <div key={sb.bookId} className="flex gap-3 p-3 bg-dream-blue-50/40 rounded-xl hover:bg-dream-blue-50/80 transition-colors">
                    <img src={sb.cover} alt={sb.title} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dream-slate-800 line-clamp-1">{sb.title}</p>
                      <p className="text-xs text-dream-blue-500 mb-1">{sb.author}</p>
                      <div className="flex items-center gap-1.5 mb-1">
                        {sb.format === 'audio' ? (
                          <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded flex items-center gap-1">
                            <Headphones className="w-3 h-3" /> 有声书
                          </span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded flex items-center gap-1">
                            <BookText className="w-3 h-3" /> 电子书
                          </span>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded ${sb.finished ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {sb.finished ? '已读完' : `阅读 ${sb.progress}%`}
                        </span>
                      </div>
                      {sb.lastReadTime && (
                        <p className="text-xs text-dream-blue-400">最近：{sb.lastReadTime}</p>
                      )}
                      <a
                        href={buildWeReadDeeplink(sb.bookId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-xs text-dream-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        在 WeRead 中打开
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'reading', 'finished', 'want-to-read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === f
                      ? 'bg-dream-blue-100 text-lavender-700'
                      : 'text-dream-blue-500 hover:bg-dream-blue-50/80'
                    }`}
                >
                  <ListFilter className="w-4 h-4" />
                  {statusLabels[f] || '全部'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddBook(true)}
                className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                添加书籍
              </button>
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTagFilter(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!tagFilter
                    ? 'gradient-bg text-white'
                    : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                  }`}
              >
                全部标签
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${tagFilter === tag
                      ? 'gradient-bg text-white'
                      : 'bg-dream-blue-100/80 text-dream-blue-600 hover:bg-lavender-200'
                    }`}
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book, index) => (
              <div
                key={book.id}
                className={`glass-card glass-card-hover rounded-2xl overflow-hidden animate-fade-in-up stagger-${(index % 4) + 1}`}
              >
                <div
                  className="relative h-48 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedBook(selectedBook === book.id ? null : book.id)}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${book.status === 'reading'
                        ? 'bg-mint-400/90 text-white'
                        : book.status === 'finished'
                          ? 'bg-lavender-400/90 text-white'
                          : 'bg-pink-400/90 text-white'
                      }`}>
                      {statusLabels[book.status]}
                    </span>
                  </div>
                  {book.status === 'reading' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-dream-blue-100">
                      <div
                        className="h-full gradient-bg transition-all duration-500"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-dream-slate-800 mb-1 line-clamp-1">
                    {book.title}
                  </h4>
                  <p className="text-sm text-dream-blue-500 mb-3">{book.author}</p>
                  <div className="flex items-center justify-between">
                    {renderStars(book.rating)}
                    <div className="flex items-center gap-1">
                      {book.needReread && (
                        <RefreshCw className="w-4 h-4 text-pink-400" />
                      )}
                      {book.isPhysical && (
                        <span className="text-xs text-dream-blue-400">📚</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedBook === book.id && (
                  <div className="p-4 border-t border-dream-blue-100/50 space-y-3 animate-fade-in">
                    <div className="flex flex-wrap gap-1">
                      {book.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-dream-blue-50 text-dream-blue-500 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateBookStatus(book.id, 'reading')}
                        className={`py-2 text-xs rounded-lg transition-colors ${book.status === 'reading'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                          }`}
                      >
                        在读
                      </button>
                      <button
                        onClick={() => updateBookStatus(book.id, 'finished')}
                        className={`py-2 text-xs rounded-lg transition-colors ${book.status === 'finished'
                            ? 'bg-dream-blue-100 text-dream-blue-600'
                            : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                          }`}
                      >
                        读完
                      </button>
                      <button
                        onClick={() => updateBookStatus(book.id, 'want-to-read')}
                        className={`py-2 text-xs rounded-lg transition-colors ${book.status === 'want-to-read'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                          }`}
                      >
                        想读
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleReread(book.id)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-lg transition-colors ${book.needReread
                            ? 'bg-red-100 text-red-600'
                            : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                          }`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        {book.needReread ? '已标记重读' : '标记重读'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定要删除这本书吗？')) {
                            deleteBook(book.id);
                            setSelectedBook(null);
                          }
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        删除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: 搜索书籍 */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-dream-blue-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={wereadApiKey ? '搜索书名 / 作者 / 关键词（WeRead API）' : '搜索书名 / 作者 / 关键词（模拟数据，可在设置中配置 API Key）'}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400"
                />
              </div>
              <button
                type="submit"
                disabled={wereadAsync.loading}
                className="px-6 py-3 gradient-btn text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {wereadAsync.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                搜索
              </button>
            </form>

            {!wereadApiKey && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  当前为模拟数据模式。前往「设置」填入 WeRead API Key（格式 <code className="px-1 bg-yellow-100 rounded">wrk-xxx</code>）即可调用真实微信读书搜索接口。
                </p>
              </div>
            )}
            {wereadAsync.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{wereadAsync.error}</p>
              </div>
            )}

            {searchKeyword && (
              <p className="mt-4 text-xs text-dream-blue-500">
                搜索「{searchKeyword}」共找到 {searchResults.length} 条结果
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((sb, index) => {
              const inShelf = books.some(b => b.title === sb.title);
              const expanded = selectedSearchBookId === sb.bookId;
              return (
                <div
                  key={sb.bookId}
                  className={`glass-card glass-card-hover rounded-2xl overflow-hidden animate-fade-in-up stagger-${(index % 4) + 1}`}
                >
                  <div
                    className="relative h-48 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedSearchBookId(expanded ? null : sb.bookId)}
                  >
                    <img src={sb.cover} alt={sb.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold text-dream-slate-700">{sb.rating || '-'}</span>
                    </div>
                    {sb.category && (
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-purple-900/60 text-white text-xs rounded">
                        {sb.category}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-dream-slate-800 mb-1 line-clamp-1">{sb.title}</h4>
                    <p className="text-sm text-dream-blue-500 mb-2">{sb.author}</p>
                    {sb.intro && (
                      <p className="text-xs text-dream-blue-400 line-clamp-2 min-h-[2rem]">{sb.intro}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => addWeReadSearchBookToShelf(sb.bookId)}
                        disabled={inShelf}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-lg transition-all ${inShelf
                            ? 'bg-green-100 text-green-600 cursor-default'
                            : 'gradient-btn text-white hover:shadow-lg'
                          }`}
                      >
                        {inShelf ? <><Check className="w-3 h-3" /> 已在书架</> : <><Plus className="w-3 h-3" /> 加入书架</>}
                      </button>
                      <a
                        href={buildWeReadWebLink(sb.bookId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-dream-blue-50 text-dream-blue-500 rounded-lg hover:bg-dream-blue-100 transition-colors"
                        title="在 WeRead 中查看"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {expanded && (
                      <div className="mt-3 pt-3 border-t border-dream-blue-100/50 space-y-2 animate-fade-in">
                        <button
                          onClick={() => setShowReviewsForBook(showReviewsForBook === sb.bookId ? null : sb.bookId)}
                          className="flex items-center gap-1 text-xs text-dream-blue-600 hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {showReviewsForBook === sb.bookId ? '收起书评' : '查看公开书评'}
                        </button>
                        <a
                          href={buildWeReadDeeplink(sb.bookId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          深度链接打开 App
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {showReviewsForBook && reviews.length > 0 && (
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dream-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-dream-blue-500" />
                  公开书评（{reviews.length}）
                </h3>
                <div className="flex gap-1">
                  {(['recommend', 'latest'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setReviewSort(s)}
                      className={`px-3 py-1 text-xs rounded-lg transition-all ${reviewSort === s ? 'gradient-bg text-white' : 'bg-dream-blue-50 text-dream-blue-500'}`}
                    >
                      {s === 'recommend' ? '推荐' : '最新'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {reviews.map(rv => (
                  <div key={rv.reviewId} className="p-4 bg-dream-blue-50/40 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                          {rv.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dream-slate-700">{rv.author}</p>
                          <div className="flex items-center gap-1">
                            {renderStars(rv.rating)}
                            {rv.createTime && <span className="text-xs text-dream-blue-400 ml-1">{rv.createTime.slice(0, 10)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-500">
                        <ThumbsUp className="w-3 h-3" />
                        {rv.likes}
                      </div>
                    </div>
                    {rv.title && <p className="text-sm font-semibold text-dream-slate-800 mb-1">{rv.title}</p>}
                    <p className="text-sm text-dream-slate-600 leading-relaxed">{rv.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && !wereadAsync.loading && (
            <div className="glass-card rounded-2xl p-12 text-center animate-fade-in-up">
              <Search className="w-16 h-16 text-dream-blue-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-dream-slate-700 mb-2">暂无搜索结果</h4>
              <p className="text-dream-blue-500 text-sm">输入书名或作者，开启你的阅读之旅</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: 我的笔记 */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-400 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-200">
                  <NotebookPen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-dream-slate-800">我的笔记本</h3>
                  <p className="text-xs text-dream-blue-500">
                    {wereadApiKey ? 'WeRead API · ' : '模拟数据 · '}
                    共 {notebooks.length} 本笔记
                  </p>
                </div>
              </div>
              <button
                onClick={() => loadWeReadNotebooks()}
                disabled={wereadAsync.loading}
                className="flex items-center gap-1 px-4 py-2 bg-white/80 text-dream-blue-600 rounded-xl text-sm font-medium hover:bg-white hover:shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${wereadAsync.loading ? 'animate-spin' : ''}`} />
                刷新
              </button>
            </div>
            {wereadAsync.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{wereadAsync.error}</p>
              </div>
            )}
          </div>

          {notebooks.length === 0 && !wereadAsync.loading && (
            <div className="glass-card rounded-2xl p-12 text-center animate-fade-in-up">
              <NotebookPen className="w-16 h-16 text-dream-blue-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-dream-slate-700 mb-2">暂无笔记</h4>
              <p className="text-dream-blue-500 text-sm">在微信读书中标注的内容会同步到这里</p>
            </div>
          )}

          {notebooks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notebooks.map(nb => {
                const isSelected = selectedNotebookBookId === nb.bookId;
                return (
                  <div
                    key={nb.bookId}
                    className={`glass-card rounded-2xl p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-dream-blue-400' : 'glass-card-hover'}`}
                    onClick={() => setSelectedNotebookBookId(isSelected ? null : nb.bookId)}
                  >
                    <div className="flex gap-3">
                      <img src={nb.cover} alt={nb.title} className="w-16 h-22 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-dream-slate-800 line-clamp-1">{nb.title}</h4>
                        <p className="text-xs text-dream-blue-500 mb-2">{nb.author}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs px-2 py-0.5 bg-dream-blue-100 text-dream-blue-600 rounded flex items-center gap-1">
                            <Quote className="w-3 h-3" /> 划线 {nb.bookmarkCount}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> 想法 {nb.reviewCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedNotebookBookId && (
            <div className="space-y-4">
              {(() => {
                const nb = notebooks.find(n => n.bookId === selectedNotebookBookId);
                if (!nb) return null;
                return (
                  <div className="glass-card rounded-2xl p-5 animate-fade-in-up bg-gradient-to-r from-lavender-50/50 to-pink-50/50">
                    <div className="flex items-center gap-3">
                      <img src={nb.cover} alt={nb.title} className="w-12 h-16 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-dream-slate-800">{nb.title}</h3>
                        <p className="text-xs text-dream-blue-500">{nb.author}</p>
                      </div>
                      <button
                        onClick={() => handleExportNotes(nb.bookId)}
                        className="flex items-center gap-1 px-3 py-2 bg-white/80 text-dream-blue-600 rounded-xl text-xs font-medium hover:bg-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        导出笔记
                      </button>
                      <a
                        href={buildWeReadDeeplink(nb.bookId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        App 打开
                      </a>
                    </div>
                  </div>
                );
              })()}

              {wereadAsync.loading && (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <Loader2 className="w-8 h-8 text-dream-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-dream-blue-500">加载笔记中...</p>
                </div>
              )}

              {/* 划线 */}
              <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
                <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
                  <Quote className="w-5 h-5 text-dream-blue-500" />
                  划线（{bookmarks.length}）
                </h3>
                {bookmarks.length === 0 ? (
                  <p className="text-sm text-dream-blue-400 text-center py-6">暂无划线</p>
                ) : (
                  <div className="space-y-3">
                    {bookmarks.map(bm => (
                      <div key={bm.bookmarkId} className="p-4 bg-dream-blue-50/40 rounded-xl border-l-4 border-lavender-400">
                        <p className="text-sm text-dream-slate-700 leading-relaxed mb-2">{bm.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-dream-blue-400">📖 {bm.chapterTitle || '未知章节'}</span>
                          {bm.createTime && (
                            <span className="text-xs text-dream-blue-400">{bm.createTime.slice(0, 10)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 想法 */}
              <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
                <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                  想法（{thoughts.length}）
                </h3>
                {thoughts.length === 0 ? (
                  <p className="text-sm text-dream-blue-400 text-center py-6">暂无想法</p>
                ) : (
                  <div className="space-y-3">
                    {thoughts.map(th => (
                      <div key={th.reviewId} className="p-4 bg-red-50/40 rounded-xl border-l-4 border-pink-400">
                        <p className="text-sm text-dream-slate-700 leading-relaxed mb-2">{th.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-dream-blue-400">📖 {th.chapterTitle || '未知章节'}</span>
                          {th.createTime && (
                            <span className="text-xs text-dream-blue-400">{th.createTime.slice(0, 10)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: 阅读统计 */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 bg-gradient-to-r from-purple-50/50 to-pink-50/50 animate-fade-in-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-200">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-dream-slate-800">阅读数据统计</h3>
                  <p className="text-xs text-dream-blue-500">
                    {wereadApiKey ? 'WeRead API · ' : '模拟数据 · '}
                    {readStats ? `今日阅读 ${formatReadMinutes(readStats.todayMinutes)}` : '加载中...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => loadWeReadReadStats()}
                disabled={wereadAsync.loading}
                className="flex items-center gap-1 px-4 py-2 bg-white/80 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-white hover:shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${wereadAsync.loading ? 'animate-spin' : ''}`} />
                刷新统计
              </button>
            </div>
            {wereadAsync.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{wereadAsync.error}</p>
              </div>
            )}
          </div>

          {readStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card rounded-2xl p-5 text-center animate-fade-in-up">
                <Clock className="w-8 h-8 text-dream-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-display font-bold gradient-text">{formatReadMinutes(readStats.todayMinutes)}</p>
                <p className="text-xs text-dream-blue-500 mt-1">今日时长</p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center animate-fade-in-up stagger-1">
                <TrendingUp className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-display font-bold gradient-text">{formatReadMinutes(readStats.weekMinutes)}</p>
                <p className="text-xs text-dream-blue-500 mt-1">本周时长</p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center animate-fade-in-up stagger-2">
                <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-display font-bold gradient-text">{formatReadMinutes(readStats.monthMinutes)}</p>
                <p className="text-xs text-dream-blue-500 mt-1">本月时长</p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center animate-fade-in-up stagger-3">
                <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-display font-bold gradient-text">{formatReadMinutes(readStats.yearMinutes)}</p>
                <p className="text-xs text-dream-blue-500 mt-1">今年时长</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
              <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-dream-blue-500" />
                阅读时长趋势
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={effectiveDailyMinutes.map(d => ({ day: d.day, minutes: d.minutes }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                    <XAxis dataKey="day" stroke="#A78BFA" fontSize={12} />
                    <YAxis stroke="#A78BFA" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: '1px solid #E9D5FF',
                        borderRadius: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="#A78BFA"
                      strokeWidth={3}
                      dot={{ fill: '#A78BFA', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-2">
              <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-500" />
                分类占比
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={effectiveCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {effectiveCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: '1px solid #E9D5FF',
                        borderRadius: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {effectiveCategoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-dream-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 lg:col-span-2 animate-fade-in-up stagger-3">
              <h3 className="font-semibold text-dream-slate-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-dream-blue-500" />
                每日时长明细
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={effectiveDailyMinutes.map(d => ({ day: d.day, minutes: d.minutes }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                    <XAxis dataKey="day" stroke="#A78BFA" fontSize={12} />
                    <YAxis stroke="#A78BFA" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: '1px solid #E9D5FF',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="minutes" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A78BFA" />
                        <stop offset="100%" stopColor="#C4B5FD" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {readStats && (
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-4">
              <h3 className="font-semibold text-dream-slate-800 mb-4">阅读天数</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-dream-blue-50/80 rounded-2xl">
                  <Clock className="w-8 h-8 text-dream-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-display font-bold gradient-text">{readStats.readDays}</p>
                  <p className="text-xs text-dream-blue-500">本月阅读天数</p>
                </div>
                <div className="text-center p-4 bg-red-50/80 rounded-2xl">
                  <Award className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                  <p className="text-2xl font-display font-bold gradient-text">{readStats.totalReadDays}</p>
                  <p className="text-xs text-dream-blue-500">累计阅读天数</p>
                </div>
                <div className="text-center p-4 bg-green-50/80 rounded-2xl">
                  <TrendingUp className="w-8 h-8 text-mint-400 mx-auto mb-2" />
                  <p className="text-2xl font-display font-bold gradient-text">
                    {readStats.readDays > 0 ? Math.round(readStats.monthMinutes / readStats.readDays) : 0}
                  </p>
                  <p className="text-xs text-dream-blue-500">日均分钟数</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: 书单推荐 */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg shadow-yellow-200">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold gradient-text mb-1">
                  书单推荐
                </h3>
                <p className="text-dream-blue-500 text-sm">
                  {wereadApiKey
                    ? `WeRead API 个性化推荐 · ${wereadRecommendations.length} 本好书`
                    : `本地智能推荐 ${recommendedBooks.length} 本，配置 API Key 可解锁 WeRead 个性化推荐`}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {wereadApiKey && (
                  <button
                    onClick={() => loadWeReadRecommendations()}
                    disabled={wereadAsync.loading}
                    className="flex items-center gap-1 px-4 py-2 bg-white/80 text-orange-500 rounded-xl text-sm font-medium hover:bg-white hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${wereadAsync.loading ? 'animate-spin' : ''}`} />
                    刷新 WeRead
                  </button>
                )}
                <button
                  onClick={generateRecommendations}
                  className="flex items-center gap-1 px-4 py-2 bg-white/80 text-dream-blue-500 rounded-xl text-sm font-medium hover:bg-white hover:shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  生成本地推荐
                </button>
              </div>
            </div>
          </div>

          {/* WeRead 个性化推荐 */}
          {wereadApiKey && (
            <div className="space-y-4">
              <h3 className="font-semibold text-dream-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                WeRead 个性化推荐
              </h3>
              {wereadAsync.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">{wereadAsync.error}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wereadRecommendations.map((book, index) => (
                  <div
                    key={book.bookId}
                    className={`glass-card glass-card-hover rounded-2xl overflow-hidden animate-fade-in-up stagger-${(index % 4) + 1}`}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-purple-900/20 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-orange-600">{book.rating || '-'}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="font-semibold text-white mb-1 line-clamp-1">{book.title}</h4>
                        <p className="text-sm text-purple-200">{book.author}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {book.intro && (
                        <p className="text-sm text-dream-slate-600 line-clamp-2 min-h-[2.5rem]">{book.intro}</p>
                      )}
                      {book.reason && (
                        <div className="p-2 bg-orange-50/80 rounded-lg flex items-start gap-1.5">
                          <Target className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-orange-700">{book.reason}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            addWeReadSearchBookToShelf(book.bookId);
                            // 复用 addBook 流程，因为推荐书也可能在 searchResults 之外
                            if (!useReadingStore.getState().books.some(b => b.title === book.title)) {
                              addBook({
                                title: book.title,
                                author: book.author,
                                cover: book.cover,
                                rating: book.rating || 0,
                                status: 'want-to-read',
                                isPhysical: false,
                                needReread: false,
                                tags: book.category ? [book.category] : [],
                              });
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-2 gradient-btn text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          加入书架
                        </button>
                        <a
                          href={buildWeReadWebLink(book.bookId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-dream-blue-50 text-dream-blue-500 rounded-xl hover:bg-dream-blue-100 transition-colors"
                          title="在 WeRead 中查看"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {wereadRecommendations.length === 0 && !wereadAsync.loading && (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <p className="text-sm text-dream-blue-500">点击「刷新 WeRead」获取个性化推荐</p>
                </div>
              )}
            </div>
          )}

          {/* 本地智能推荐 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-dream-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-dream-blue-500" />
              本地智能推荐
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedBooks.map((book: RecommendedBook, index: number) => (
                <div
                  key={book.id}
                  className={`glass-card glass-card-hover rounded-2xl overflow-hidden animate-fade-in-up stagger-${(index % 4) + 1}`}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-purple-900/20 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                        <Target className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-semibold text-orange-600">{book.matchScore}%</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="font-semibold text-white mb-1 line-clamp-1">{book.title}</h4>
                      <p className="text-sm text-purple-200">{book.author}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-purple-200'}`}
                          />
                        ))}
                      </div>
                      {book.isPhysical && <span className="text-xs text-dream-blue-400">📚 纸质书</span>}
                    </div>
                    <p className="text-sm text-dream-slate-600 line-clamp-2 min-h-[2.5rem]">
                      {book.recommendationReason}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {book.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-dream-blue-100/60 text-dream-blue-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => addRecommendedBookToShelf(book.id)}
                      className="w-full gradient-btn py-2.5 rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      加入书架
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {recommendedBooks.length === 0 && (
              <div className="glass-card rounded-2xl p-12 text-center animate-fade-in-up">
                <BookMarked className="w-16 h-16 text-dream-blue-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-dream-slate-700 mb-2">暂无推荐</h4>
                <p className="text-dream-blue-500 text-sm mb-4">添加更多书籍到你的书架，获取更精准的推荐</p>
                <button
                  onClick={generateRecommendations}
                  className="px-6 py-2 gradient-btn text-white rounded-xl text-sm font-medium"
                >
                  重新生成推荐
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddBook(false)}>
          <div className="glass-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">添加书籍</h3>
              <button onClick={() => setShowAddBook(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">书名 *</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="输入书名"
                  className="w-full px-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">作者</label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  placeholder="作者名称"
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">封面图片链接</label>
                <input
                  type="text"
                  value={newBook.cover}
                  onChange={(e) => setNewBook({ ...newBook, cover: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">阅读状态</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['want-to-read', 'reading', 'finished'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setNewBook({ ...newBook, status })}
                      className={`py-2 text-sm rounded-xl transition-all ${newBook.status === status
                          ? 'gradient-bg text-white'
                          : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                        }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBook.isPhysical}
                    onChange={(e) => setNewBook({ ...newBook, isPhysical: e.target.checked })}
                    className="w-4 h-4 text-dream-blue-500 rounded focus:ring-dream-blue-400"
                  />
                  <span className="text-sm text-dream-slate-600">纸质书</span>
                </label>
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">评分</label>
                {renderStars(newBook.rating, true, (r) => setNewBook({ ...newBook, rating: r }))}
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={newBook.tags}
                  onChange={(e) => setNewBook({ ...newBook, tags: e.target.value })}
                  placeholder="例如：心理学, 自我提升"
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddBook(false)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddBook}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWeChatSync && <WeChatSyncModal />}
      {showSettings && <SettingsModal />}
    </div>
  );
}
