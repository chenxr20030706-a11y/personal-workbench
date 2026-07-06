import { create } from 'zustand';
import type { Book, ReadingStats } from '../types';
import { mockBooks, mockReadingStats } from '../data/mockData';
import { storage } from '../utils/storage';
import { generateId, getTodayStr } from '../utils/date';
import {
  WEREAD_API_KEY_STORAGE,
  WeReadApiError,
  callWeReadApi,
  searchWeReadBooks,
  syncWeReadShelf,
  getWeReadNotebooks,
  getWeReadBookmarks,
  getWeReadThoughts,
  getWeReadReviews,
  getWeReadRecommendations,
  getWeReadReadStats,
  isValidWeReadApiKey,
  type WeReadSearchBook,
  type WeReadShelfBook,
  type WeReadNotebook,
  type WeReadBookmark,
  type WeReadThought,
  type WeReadReview,
  type WeReadRecommendation,
  type WeReadReadStats,
  type WeReadConnectionStatus,
} from '../utils/wereadApi';

export interface RecommendedBook extends Book {
  recommendationReason: string;
  matchScore: number;
}

interface SyncStep {
  key: string;
  label: string;
  completed: boolean;
  inProgress: boolean;
}

interface WechatSyncState {
  connected: boolean;
  connecting: boolean;
  syncing: boolean;
  progress: number;
  currentStep: string;
  currentStepIndex: number;
  steps: SyncStep[];
  lastSyncTime?: string;
  syncedBookCount: number;
}

interface WeReadAsyncState {
  loading: boolean;
  error: string | null;
  lastFetchedAt?: string;
}

interface ReadingState {
  books: Book[];
  stats: ReadingStats;
  customTags: string[];
  wechatSync: WechatSyncState;
  recommendedBooks: RecommendedBook[];

  // WeRead API 集成
  wereadApiKey: string;
  wereadConnected: WeReadConnectionStatus;
  wereadAsync: WeReadAsyncState;
  searchResults: WeReadSearchBook[];
  searchKeyword: string;
  wereadShelf: WeReadShelfBook[];
  notebooks: WeReadNotebook[];
  bookmarks: WeReadBookmark[];
  thoughts: WeReadThought[];
  reviews: WeReadReview[];
  wereadRecommendations: WeReadRecommendation[];
  readStats: WeReadReadStats | null;

  // 当前在笔记 tab 选中的笔记本 / 书籍
  selectedNotebookBookId: string | null;
  // 当前在搜索 tab 选中的书籍详情
  selectedSearchBookId: string | null;

  addBook: (book: Omit<Book, 'id' | 'thoughts' | 'progress'>) => void;
  updateBookProgress: (id: string, progress: number) => void;
  toggleReread: (id: string) => void;
  rateBook: (id: string, rating: number) => void;
  updateBookStatus: (id: string, status: Book['status']) => void;
  deleteBook: (id: string) => void;
  addCustomTag: (tag: string) => void;
  deleteCustomTag: (tag: string) => void;
  clearAllData: () => void;
  connectWechat: () => Promise<void>;
  disconnectWechat: () => void;
  startWechatSync: () => Promise<void>;
  generateRecommendations: () => void;
  addRecommendedBookToShelf: (bookId: string) => void;

  // WeRead API 方法
  setWeReadApiKey: (key: string) => void;
  clearWeReadApiKey: () => void;
  testWeReadConnection: () => Promise<boolean>;
  callWeReadApi: <T = unknown>(apiName: string, params?: Record<string, unknown>) => Promise<T>;
  searchWeReadBooks: (keyword: string, count?: number) => Promise<void>;
  syncWeReadShelf: () => Promise<void>;
  loadWeReadNotebooks: () => Promise<void>;
  loadWeReadBookmarks: (bookId: string) => Promise<void>;
  loadWeReadThoughts: (bookId: string) => Promise<void>;
  loadWeReadReviews: (bookId: string, sort?: 'recommend' | 'latest') => Promise<void>;
  loadWeReadRecommendations: (count?: number) => Promise<void>;
  loadWeReadReadStats: () => Promise<void>;
  addWeReadSearchBookToShelf: (bookId: string) => void;
  setSelectedNotebookBookId: (bookId: string | null) => void;
  setSelectedSearchBookId: (bookId: string | null) => void;
}

const STORAGE_KEY_BOOKS = 'reading-books';
const STORAGE_KEY_STATS = 'reading-stats';
const STORAGE_KEY_TAGS = 'reading-tags';
const STORAGE_KEY_WECHAT = 'reading-wechat';

const defaultCustomTags = ['专业书', '心理学', '自我提升', '历史', '小说', '科幻', '哲学', '传记'];

const defaultSteps: SyncStep[] = [
  { key: 'shelf', label: '书架同步', completed: false, inProgress: false },
  { key: 'progress', label: '阅读进度同步', completed: false, inProgress: false },
  { key: 'notes', label: '笔记同步', completed: false, inProgress: false },
  { key: 'duration', label: '阅读时长同步', completed: false, inProgress: false },
];

const defaultWechatSync: WechatSyncState = {
  connected: false,
  connecting: false,
  syncing: false,
  progress: 0,
  currentStep: '',
  currentStepIndex: -1,
  steps: defaultSteps,
  syncedBookCount: 0,
};

const defaultWeReadAsync: WeReadAsyncState = {
  loading: false,
  error: null,
};

const mockWeReadReadStats: WeReadReadStats = {
  todayMinutes: 65,
  weekMinutes: 480,
  monthMinutes: 1820,
  yearMinutes: 18560,
  readDays: 28,
  totalReadDays: 312,
  categories: [
    { name: '专业书', minutes: 180 },
    { name: '心理学', minutes: 120 },
    { name: '自我提升', minutes: 90 },
    { name: '历史', minutes: 60 },
    { name: '小说', minutes: 30 },
  ],
  dailyMinutes: [
    { date: '周一', minutes: 60 },
    { date: '周二', minutes: 45 },
    { date: '周三', minutes: 75 },
    { date: '周四', minutes: 50 },
    { date: '周五', minutes: 30 },
    { date: '周六', minutes: 90 },
    { date: '周日', minutes: 70 },
  ],
};

const mockWeReadShelf: WeReadShelfBook[] = [
  {
    bookId: 'mock-wr-1',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    progress: 100,
    finished: true,
    lastReadTime: '2026-06-15',
    format: 'book',
    category: '小说',
  },
  {
    bookId: 'mock-wr-2',
    title: '明朝那些事儿（全集）',
    author: '当年明月',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
    progress: 45,
    finished: false,
    lastReadTime: '2026-06-28',
    format: 'book',
    category: '历史',
  },
  {
    bookId: 'mock-wr-3',
    title: '三体（全集）',
    author: '刘慈欣',
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=400&fit=crop',
    progress: 100,
    finished: true,
    lastReadTime: '2026-03-20',
    format: 'book',
    category: '科幻',
  },
  {
    bookId: 'mock-wr-4',
    title: '活着',
    author: '余华',
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    progress: 100,
    finished: true,
    lastReadTime: '2026-05-25',
    format: 'audio',
    category: '小说',
  },
  {
    bookId: 'mock-wr-5',
    title: '刻意练习',
    author: '安德斯·艾利克森',
    cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
    progress: 65,
    finished: false,
    lastReadTime: '2026-06-27',
    format: 'book',
    category: '自我提升',
  },
];

const mockNotebooks: WeReadNotebook[] = [
  {
    bookId: 'mock-wr-1',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    noteCount: 8,
    bookmarkCount: 24,
    reviewCount: 3,
  },
  {
    bookId: 'mock-wr-3',
    title: '三体（全集）',
    author: '刘慈欣',
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=400&fit=crop',
    noteCount: 12,
    bookmarkCount: 41,
    reviewCount: 5,
  },
  {
    bookId: 'mock-wr-5',
    title: '刻意练习',
    author: '安德斯·艾利克森',
    cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
    noteCount: 4,
    bookmarkCount: 18,
    reviewCount: 1,
  },
];

const mockBookmarks: WeReadBookmark[] = [
  {
    bookmarkId: 'bm-1',
    bookId: 'mock-wr-1',
    chapterTitle: '第一章 创始家族',
    chapterUid: 1,
    content: '多年以后，奥雷里亚诺·布恩迪亚上校面对行刑队，准会想起父亲带他去见识冰块的那个遥远的下午。',
    style: 0,
    createTime: '2026-04-10T08:00:00Z',
  },
  {
    bookmarkId: 'bm-2',
    bookId: 'mock-wr-1',
    chapterTitle: '第三章',
    chapterUid: 3,
    content: '布恩迪亚家族的孤独，是命中注定的孤独，他们无论走到哪里，都无法摆脱。',
    style: 1,
    createTime: '2026-04-12T10:30:00Z',
  },
  {
    bookmarkId: 'bm-3',
    bookId: 'mock-wr-3',
    chapterTitle: '黑暗森林',
    chapterUid: 12,
    content: '宇宙就是一座黑暗森林，每个文明都是带枪的猎人，像幽灵般潜行于林间……',
    style: 2,
    createTime: '2026-03-15T22:00:00Z',
  },
  {
    bookmarkId: 'bm-4',
    bookId: 'mock-wr-3',
    chapterTitle: '降维打击',
    chapterUid: 18,
    content: '弱小和无知不是生存的障碍，傲慢才是。',
    style: 0,
    createTime: '2026-03-18T19:00:00Z',
  },
  {
    bookmarkId: 'bm-5',
    bookId: 'mock-wr-5',
    chapterTitle: '第三章 大脑的适应能力',
    chapterUid: 3,
    content: '走出舒适区，才能迫使大脑和身体去适应新的挑战，进而建立新的心理表征。',
    style: 0,
    createTime: '2026-06-20T20:00:00Z',
  },
];

const mockThoughts: WeReadThought[] = [
  {
    reviewId: 'th-1',
    bookId: 'mock-wr-1',
    chapterTitle: '第一章 创始家族',
    content: '马尔克斯的开篇太经典了，一句话拉开了百年的孤独序幕。',
    createTime: '2026-04-10T08:10:00Z',
  },
  {
    reviewId: 'th-2',
    bookId: 'mock-wr-3',
    chapterTitle: '黑暗森林',
    content: '黑暗森林法则虽然残酷，但给人一种对宇宙未知的敬畏。',
    createTime: '2026-03-15T22:15:00Z',
  },
  {
    reviewId: 'th-3',
    bookId: 'mock-wr-5',
    chapterTitle: '第三章',
    content: '刻意练习和重复练习最大的区别在于是否有反馈和突破舒适区。',
    createTime: '2026-06-20T20:30:00Z',
  },
];

const mockReviews: WeReadReview[] = [
  {
    reviewId: 'rv-1',
    bookId: 'mock-wr-3',
    title: '中国科幻的巅峰',
    content: '刘慈欣用宏大的叙事把人类的命运放在了宇宙的尺度上，三体三部曲读完久久不能平静。黑暗森林法则、降维打击这些概念已成了科幻的经典。',
    author: '星海漫游者',
    rating: 5,
    likes: 2341,
    createTime: '2026-04-01T10:00:00Z',
    recommended: true,
  },
  {
    reviewId: 'rv-2',
    bookId: 'mock-wr-3',
    title: '硬科幻的入门必读',
    content: '虽然是硬科幻，但故事性很强。叶文洁的悲剧线让整部作品有了人性的厚度。',
    author: '读书人小李',
    rating: 5,
    likes: 1203,
    createTime: '2026-05-12T14:30:00Z',
    recommended: true,
  },
  {
    reviewId: 'rv-3',
    bookId: 'mock-wr-1',
    title: '魔幻现实主义的极致',
    content: '布恩迪亚家族七代人的孤独，是一种宿命般的循环。马尔克斯的语言如诗如画。',
    author: '热带雨林',
    rating: 5,
    likes: 1820,
    createTime: '2026-03-22T09:15:00Z',
    recommended: true,
  },
];

const mockWeReadRecommendations: WeReadRecommendation[] = [
  {
    bookId: 'rec-wr-1',
    title: '认知觉醒',
    author: '周岭',
    cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=400&fit=crop',
    rating: 5,
    intro: '开启自我改变的觉醒之书。',
    reason: '基于你阅读的「自我提升」类书籍推荐',
    category: '自我提升',
  },
  {
    bookId: 'rec-wr-2',
    title: '思考，快与慢',
    author: '丹尼尔·卡尼曼',
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    rating: 5,
    intro: '诺贝尔经济学奖得主的思维经典。',
    reason: '与《刻意练习》一起读，能更全面理解思维与学习',
    category: '心理学',
  },
  {
    bookId: 'rec-wr-3',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop',
    rating: 4,
    intro: '从认知革命到人工智能的宏大叙事。',
    reason: '基于你阅读的「历史」类书籍推荐',
    category: '历史',
  },
  {
    bookId: 'rec-wr-4',
    title: '当下的力量',
    author: '埃克哈特·托利',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop',
    rating: 5,
    intro: '回归当下，找到内在的宁静。',
    reason: '读者关注度持续走高',
    category: '哲学',
  },
];

const recommendedBooksPool: RecommendedBook[] = [
  {
    id: 'rec-1',
    title: '认知觉醒',
    author: '周岭',
    cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=400&fit=crop',
    rating: 5,
    status: 'want-to-read',
    isPhysical: false,
    needReread: false,
    tags: ['自我提升', '认知科学', '心理学'],
    thoughts: [],
    progress: 0,
    recommendationReason: '与你喜欢的「自我提升」和「心理学」主题高度匹配，帮助你提升认知能力',
    matchScore: 95,
  },
  {
    id: 'rec-2',
    title: '思考，快与慢',
    author: '丹尼尔·卡尼曼',
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    rating: 5,
    status: 'want-to-read',
    isPhysical: true,
    needReread: false,
    tags: ['心理学', '哲学', '思维方法'],
    thoughts: [],
    progress: 0,
    recommendationReason: '诺贝尔经济学奖得主经典著作，深入探讨人类思维的两个系统',
    matchScore: 92,
  },
  {
    id: 'rec-3',
    title: '化学简史',
    author: 'J.R.帕廷顿',
    cover: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=400&fit=crop',
    rating: 4,
    status: 'want-to-read',
    isPhysical: false,
    needReread: false,
    tags: ['化学', '历史', '专业书'],
    thoughts: [],
    progress: 0,
    recommendationReason: '基于你的化学专业背景，了解化学发展史有助于拓宽专业视野',
    matchScore: 88,
  },
  {
    id: 'rec-4',
    title: '当下的力量',
    author: '埃克哈特·托利',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop',
    rating: 5,
    status: 'want-to-read',
    isPhysical: false,
    needReread: false,
    tags: ['哲学', '心理学', '自我提升'],
    thoughts: [],
    progress: 0,
    recommendationReason: '与你读过的「被讨厌的勇气」有相似的哲学深度，帮助你活在当下',
    matchScore: 90,
  },
  {
    id: 'rec-5',
    title: '三体',
    author: '刘慈欣',
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=400&fit=crop',
    rating: 5,
    status: 'want-to-read',
    isPhysical: true,
    needReread: false,
    tags: ['科幻', '小说', '硬科幻'],
    thoughts: [],
    progress: 0,
    recommendationReason: '中国科幻巅峰之作，适合喜欢思考和探索的你',
    matchScore: 85,
  },
  {
    id: 'rec-6',
    title: '习惯的力量',
    author: '查尔斯·都希格',
    cover: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&h=400&fit=crop',
    rating: 4,
    status: 'want-to-read',
    isPhysical: false,
    needReread: false,
    tags: ['自我提升', '习惯养成', '心理学'],
    thoughts: [],
    progress: 0,
    recommendationReason: '你正在读「原子习惯」，这本书能帮你更深入理解习惯的底层逻辑',
    matchScore: 93,
  },
];

/** 预置的默认 WeRead API Key */
const DEFAULT_WEREAD_API_KEY = 'wrk-SeUo0I7RS36N39CJp0_RBQAA';

/** 加载 WeRead API Key（同时校验格式） */
const loadInitialApiKey = (): string => {
  const key = storage.get<string>(WEREAD_API_KEY_STORAGE, DEFAULT_WEREAD_API_KEY);
  return typeof key === 'string' && isValidWeReadApiKey(key) ? key : '';
};

export const useReadingStore = create<ReadingState>((set, get) => ({
  books: storage.get<Book[]>(STORAGE_KEY_BOOKS, mockBooks),
  stats: storage.get<ReadingStats>(STORAGE_KEY_STATS, mockReadingStats),
  customTags: storage.get<string[]>(STORAGE_KEY_TAGS, defaultCustomTags),
  wechatSync: storage.get<WechatSyncState>(STORAGE_KEY_WECHAT, defaultWechatSync),
  recommendedBooks: [],

  // WeRead API 初始状态
  wereadApiKey: loadInitialApiKey(),
  wereadConnected: loadInitialApiKey() ? 'connected' : 'disconnected',
  wereadAsync: { ...defaultWeReadAsync },
  searchResults: [],
  searchKeyword: '',
  wereadShelf: [],
  notebooks: [],
  bookmarks: [],
  thoughts: [],
  reviews: [],
  wereadRecommendations: [],
  readStats: null,
  selectedNotebookBookId: null,
  selectedSearchBookId: null,

  addBook: (book) => {
    const todayStr = getTodayStr();
    const newBook: Book = {
      ...book,
      id: generateId(),
      thoughts: [],
      progress: book.status === 'finished' ? 100 : 0,
      startedDate: book.status === 'reading' || book.status === 'finished' ? todayStr : undefined,
      finishedDate: book.status === 'finished' ? todayStr : undefined,
    };
    set((state) => {
      const books = [newBook, ...state.books];
      storage.set(STORAGE_KEY_BOOKS, books);
      return { books };
    });
  },

  updateBookProgress: (id, progress) => {
    set((state) => {
      const books = state.books.map((b) =>
        b.id === id ? { ...b, progress, status: progress >= 100 ? 'finished' : b.status } : b
      );
      storage.set(STORAGE_KEY_BOOKS, books);
      return { books };
    });
  },

  toggleReread: (id) => {
    set((state) => {
      const books = state.books.map((b) =>
        b.id === id ? { ...b, needReread: !b.needReread } : b
      );
      storage.set(STORAGE_KEY_BOOKS, books);
      return { books };
    });
  },

  rateBook: (id, rating) => {
    set((state) => {
      const books = state.books.map((b) => (b.id === id ? { ...b, rating } : b));
      storage.set(STORAGE_KEY_BOOKS, books);
      return { books };
    });
  },

  updateBookStatus: (id, status) => {
    const todayStr = getTodayStr();
    set((state) => {
      const books = state.books.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          status,
          progress: status === 'finished' ? 100 : b.progress,
          finishedDate: status === 'finished' ? todayStr : undefined,
          startedDate: (status === 'reading' || status === 'finished') && !b.startedDate ? todayStr : b.startedDate,
        };
      });
      storage.set(STORAGE_KEY_BOOKS, books);
      return { books };
    });
  },

  deleteBook: (id) => {
    set((state) => {
      const books = state.books.filter((b) => b.id !== id);
      storage.set(STORAGE_KEY_BOOKS, books);
      return { books };
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
    storage.remove(STORAGE_KEY_BOOKS);
    storage.remove(STORAGE_KEY_STATS);
    storage.remove(STORAGE_KEY_TAGS);
    storage.remove(STORAGE_KEY_WECHAT);
    set({
      books: mockBooks,
      stats: mockReadingStats,
      customTags: defaultCustomTags,
      wechatSync: { ...defaultWechatSync, steps: [...defaultSteps] },
      recommendedBooks: [],
      wereadShelf: [],
      notebooks: [],
      bookmarks: [],
      thoughts: [],
      reviews: [],
      wereadRecommendations: [],
      readStats: null,
      searchResults: [],
      searchKeyword: '',
      selectedNotebookBookId: null,
      selectedSearchBookId: null,
    });
  },

  connectWechat: async () => {
    set({ wechatSync: { ...get().wechatSync, connecting: true, currentStep: '正在连接微信读书...' } });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newState: WechatSyncState = {
      connected: true,
      connecting: false,
      syncing: false,
      progress: 100,
      currentStep: '连接成功',
      currentStepIndex: -1,
      steps: defaultSteps,
      lastSyncTime: getTodayStr(),
      syncedBookCount: get().wechatSync.syncedBookCount,
    };
    set({ wechatSync: newState });
    storage.set(STORAGE_KEY_WECHAT, newState);
  },

  disconnectWechat: () => {
    set({ wechatSync: defaultWechatSync });
    storage.remove(STORAGE_KEY_WECHAT);
  },

  startWechatSync: async () => {
    const { wechatSync, books, wereadApiKey } = get();
    if (!wechatSync.connected) return;

    const stepConfigs = [
      { key: 'shelf', label: '正在同步书架信息...', progressStart: 0, progressEnd: 25 },
      { key: 'progress', label: '正在同步阅读进度...', progressStart: 25, progressEnd: 50 },
      { key: 'notes', label: '正在同步阅读笔记...', progressStart: 50, progressEnd: 75 },
      { key: 'duration', label: '正在同步阅读时长...', progressStart: 75, progressEnd: 100 },
    ];

    const newSteps = defaultSteps.map(s => ({ ...s, completed: false, inProgress: false }));

    set({
      wechatSync: {
        ...wechatSync,
        syncing: true,
        progress: 0,
        currentStep: stepConfigs[0].label,
        currentStepIndex: 0,
        steps: newSteps.map((s, i) => i === 0 ? { ...s, inProgress: true } : s),
      },
    });

    let shelfBooks: WeReadShelfBook[] = [];

    // 若配置了 WeRead API Key，则真正调用 /shelf/sync 拉取书架
    if (wereadApiKey) {
      try {
        for (let i = 0; i < stepConfigs.length; i++) {
          const step = stepConfigs[i];
          set((state) => ({
            wechatSync: {
              ...state.wechatSync,
              currentStep: step.label,
            },
          }));

          if (step.key === 'shelf') {
            shelfBooks = await syncWeReadShelf(wereadApiKey);
            set({ wereadShelf: shelfBooks });
          } else if (step.key === 'notes') {
            try {
              const notebooks = await getWeReadNotebooks(wereadApiKey);
              set({ notebooks });
            } catch {
              // 静默忽略子步骤错误
            }
          } else if (step.key === 'duration') {
            try {
              const readStats = await getWeReadReadStats(wereadApiKey);
              set({ readStats });
            } catch {
              // 静默忽略子步骤错误
            }
          }

          const progress = step.progressEnd;
          set((state) => ({
            wechatSync: {
              ...state.wechatSync,
              progress,
              steps: state.wechatSync.steps.map((s, idx) => {
                if (idx === i) return { ...s, completed: true, inProgress: false };
                if (idx === i + 1) return { ...s, inProgress: true };
                return s;
              }),
              currentStepIndex: i + 1,
            },
          }));
        }
      } catch (err) {
        set({
          wereadAsync: {
            loading: false,
            error: err instanceof Error ? err.message : '同步失败',
          },
        });
      }
    } else {
      // 没有配置 API Key，沿用模拟同步流程
      for (let i = 0; i < stepConfigs.length; i++) {
        const step = stepConfigs[i];
        const totalSteps = 10;
        for (let j = 1; j <= totalSteps; j++) {
          await new Promise((resolve) => setTimeout(resolve, 60));
          const progress = Math.round(step.progressStart + (step.progressEnd - step.progressStart) * (j / totalSteps));
          set((state) => ({
            wechatSync: {
              ...state.wechatSync,
              progress,
              currentStep: step.label,
            },
          }));
        }

        set((state) => ({
          wechatSync: {
            ...state.wechatSync,
            steps: state.wechatSync.steps.map((s, idx) => {
              if (idx === i) return { ...s, completed: true, inProgress: false };
              if (idx === i + 1) return { ...s, inProgress: true };
              return s;
            }),
            currentStepIndex: i + 1,
          },
        }));
      }

      // 模拟书架数据
      shelfBooks = mockWeReadShelf;
      set({
        wereadShelf: shelfBooks,
        notebooks: mockNotebooks,
        readStats: mockWeReadReadStats,
      });
    }

    // 将 WeRead 书架中的书合并到本地 books（去重）
    const existingTitles = new Set(books.map((b) => b.title));
    const newBooks: Book[] = shelfBooks
      .filter((b) => !existingTitles.has(b.title))
      .map((sb) => ({
        id: generateId(),
        title: sb.title,
        author: sb.author,
        cover: sb.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
        rating: 0,
        status: sb.finished ? 'finished' : sb.progress > 0 ? 'reading' : 'want-to-read',
        isPhysical: false,
        needReread: false,
        tags: sb.category ? [sb.category] : [],
        thoughts: [],
        progress: sb.progress,
        startedDate: sb.lastReadTime,
        finishedDate: sb.finished ? sb.lastReadTime : undefined,
      }));

    if (newBooks.length > 0) {
      set((state) => {
        const updatedBooks = [...newBooks, ...state.books];
        storage.set(STORAGE_KEY_BOOKS, updatedBooks);
        return { books: updatedBooks };
      });
    }

    const finalState: WechatSyncState = {
      connected: true,
      connecting: false,
      syncing: false,
      progress: 100,
      currentStep: `同步完成，新增 ${newBooks.length} 本书`,
      currentStepIndex: -1,
      steps: newSteps.map(s => ({ ...s, completed: true, inProgress: false })),
      lastSyncTime: getTodayStr(),
      syncedBookCount: wechatSync.syncedBookCount + newBooks.length,
    };
    set({ wechatSync: finalState });
    storage.set(STORAGE_KEY_WECHAT, finalState);
  },

  generateRecommendations: () => {
    const { books } = get();

    const finishedBooks = books.filter((b) => b.status === 'finished');
    const readingBooks = books.filter((b) => b.status === 'reading');
    const allReadBooks = [...finishedBooks, ...readingBooks];

    const tagCount: Record<string, number> = {};
    allReadBooks.forEach((book) => {
      book.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + (book.rating || 3);
      });
    });

    const existingTitles = new Set(books.map((b) => b.title));

    const scoredBooks = recommendedBooksPool
      .filter((book) => !existingTitles.has(book.title))
      .map((book) => {
        let score = 50;
        book.tags.forEach((tag) => {
          if (tagCount[tag]) {
            score += tagCount[tag] * 3;
          }
        });
        score += book.rating * 5;
        return { ...book, matchScore: Math.min(99, Math.round(score)) };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    set({ recommendedBooks: scoredBooks.slice(0, 6) });
  },

  addRecommendedBookToShelf: (bookId) => {
    const { recommendedBooks, addBook } = get();
    const book = recommendedBooks.find((b) => b.id === bookId);
    if (!book) return;

    addBook({
      title: book.title,
      author: book.author,
      cover: book.cover,
      rating: book.rating,
      status: 'want-to-read',
      isPhysical: book.isPhysical,
      needReread: false,
      tags: book.tags,
    });

    set((state) => ({
      recommendedBooks: state.recommendedBooks.filter((b) => b.id !== bookId),
    }));
  },

  // ============ WeRead API 方法 ============

  setWeReadApiKey: (key) => {
    const trimmed = key.trim();
    if (trimmed) {
      storage.set(WEREAD_API_KEY_STORAGE, trimmed);
    } else {
      storage.remove(WEREAD_API_KEY_STORAGE);
    }
    set({
      wereadApiKey: trimmed,
      wereadConnected: trimmed ? get().wereadConnected : 'disconnected',
    });
  },

  clearWeReadApiKey: () => {
    storage.remove(WEREAD_API_KEY_STORAGE);
    set({
      wereadApiKey: '',
      wereadConnected: 'disconnected',
      wereadAsync: { ...defaultWeReadAsync },
      searchResults: [],
      wereadShelf: [],
      notebooks: [],
      bookmarks: [],
      thoughts: [],
      reviews: [],
      wereadRecommendations: [],
      readStats: null,
    });
  },

  testWeReadConnection: async () => {
    const { wereadApiKey } = get();
    if (!wereadApiKey) {
      set({ wereadConnected: 'disconnected' });
      return false;
    }
    set({
      wereadAsync: { loading: true, error: null },
      wereadConnected: get().wereadConnected === 'disconnected' ? 'disconnected' : get().wereadConnected,
    });
    try {
      const shelf = await syncWeReadShelf(wereadApiKey);
      set({
        wereadConnected: 'connected',
        wereadShelf: shelf,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
      return true;
    } catch (err) {
      const message = err instanceof WeReadApiError ? err.message : '连接失败';
      set({
        wereadConnected: 'error',
        wereadAsync: { loading: false, error: message },
      });
      return false;
    }
  },

  callWeReadApi: async <T = unknown>(apiName: string, params: Record<string, unknown> = {}) => {
    const { wereadApiKey } = get();
    return callWeReadApi<T>(wereadApiKey, apiName, params);
  },

  searchWeReadBooks: async (keyword, count = 12) => {
    const trimmed = keyword.trim();
    set({
      searchKeyword: trimmed,
      wereadAsync: { loading: true, error: null },
    });
    const { wereadApiKey } = get();
    if (!wereadApiKey) {
      // 无 API Key，回退到本地模拟搜索
      const mockResults: WeReadSearchBook[] = [
        { bookId: 'ms-1', title: '三体', author: '刘慈欣', cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=400&fit=crop', rating: 5, intro: '中国科幻巅峰之作', category: '科幻' },
        { bookId: 'ms-2', title: '三体二：黑暗森林', author: '刘慈欣', cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop', rating: 5, intro: '黑暗森林法则的诞生', category: '科幻' },
        { bookId: 'ms-3', title: '三体三：死神永生', author: '刘慈欣', cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop', rating: 5, intro: '宇宙的最终命运', category: '科幻' },
      ].filter(b => !trimmed || b.title.includes(trimmed) || b.author.includes(trimmed));
      await new Promise((resolve) => setTimeout(resolve, 300));
      set({
        searchResults: mockResults,
        wereadAsync: { loading: false, error: null },
      });
      return;
    }
    try {
      const results = await searchWeReadBooks(wereadApiKey, trimmed || '推荐', count);
      set({
        searchResults: results,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
    } catch (err) {
      const message = err instanceof WeReadApiError ? err.message : '搜索失败';
      set({
        wereadAsync: { loading: false, error: message },
      });
    }
  },

  syncWeReadShelf: async () => {
    const { wereadApiKey } = get();
    set({ wereadAsync: { loading: true, error: null } });
    if (!wereadApiKey) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      set({
        wereadShelf: mockWeReadShelf,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
      return;
    }
    try {
      const shelf = await syncWeReadShelf(wereadApiKey);
      set({
        wereadShelf: shelf,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
    } catch (err) {
      const message = err instanceof WeReadApiError ? err.message : '同步失败';
      set({
        wereadAsync: { loading: false, error: message },
      });
    }
  },

  loadWeReadNotebooks: async () => {
    const { wereadApiKey } = get();
    set({ wereadAsync: { loading: true, error: null } });
    if (!wereadApiKey) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      set({
        notebooks: mockNotebooks,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
      return;
    }
    try {
      const notebooks = await getWeReadNotebooks(wereadApiKey);
      set({
        notebooks,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
    } catch (err) {
      const message = err instanceof WeReadApiError ? err.message : '加载笔记本失败';
      set({
        wereadAsync: { loading: false, error: message },
      });
    }
  },

  loadWeReadBookmarks: async (bookId) => {
    const { wereadApiKey } = get();
    set({ wereadAsync: { loading: true, error: null } });
    if (!wereadApiKey) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set({
        bookmarks: mockBookmarks.filter(b => b.bookId === bookId),
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
      return;
    }
    try {
      const bookmarks = await getWeReadBookmarks(wereadApiKey, bookId);
      set({
        bookmarks,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
    } catch (err) {
      const message = err instanceof WeReadApiError ? err.message : '加载划线失败';
      set({
        wereadAsync: { loading: false, error: message },
      });
    }
  },

  loadWeReadThoughts: async (bookId) => {
    const { wereadApiKey } = get();
    set({ wereadAsync: { loading: true, error: null } });
    if (!wereadApiKey) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set({
        thoughts: mockThoughts.filter(t => t.bookId === bookId),
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
      return;
    }
    try {
      const thoughts = await getWeReadThoughts(wereadApiKey, bookId);
      set({
        thoughts,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
    } catch (err) {
      const message = err instanceof WeReadApiError ? err.message : '加载想法失败';
      set({
        wereadAsync: { loading: false, error: message },
      });
    }
  },

  loadWeReadReviews: async (bookId, sort = 'recommend') => {
    const { wereadApiKey } = get();
    set({ wereadAsync: { loading: true, error: null } });
    if (!wereadApiKey) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let list = mockReviews.filter(r => r.bookId === bookId);
      if (sort === 'latest') {
        list = [...list].sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
      } else {
        list = [...list].sort((a, b) => b.likes - a.likes);
      }
      set({
        reviews: list,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
      return;
    }
    try {
      const reviews = await getWeReadReviews(wereadApiKey, bookId, { sort });
      set({
        reviews,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
    } catch (err) {
      const message = err instanceof WeReadApiError ? err.message : '加载书评失败';
      set({
        wereadAsync: { loading: false, error: message },
      });
    }
  },

  loadWeReadRecommendations: async (count = 10) => {
    const { wereadApiKey } = get();
    set({ wereadAsync: { loading: true, error: null } });
    if (!wereadApiKey) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      set({
        wereadRecommendations: mockWeReadRecommendations,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
      return;
    }
    try {
      const recommendations = await getWeReadRecommendations(wereadApiKey, count);
      set({
        wereadRecommendations: recommendations,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
    } catch (err) {
      const message = err instanceof WeReadApiError ? err.message : '加载推荐失败';
      set({
        wereadAsync: { loading: false, error: message },
      });
    }
  },

  loadWeReadReadStats: async () => {
    const { wereadApiKey } = get();
    set({ wereadAsync: { loading: true, error: null } });
    if (!wereadApiKey) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      set({
        readStats: mockWeReadReadStats,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
      return;
    }
    try {
      const readStats = await getWeReadReadStats(wereadApiKey);
      set({
        readStats,
        wereadAsync: { loading: false, error: null, lastFetchedAt: new Date().toISOString() },
      });
    } catch (err) {
      const message = err instanceof WeReadApiError ? err.message : '加载统计失败';
      set({
        wereadAsync: { loading: false, error: message },
      });
    }
  },

  addWeReadSearchBookToShelf: (bookId) => {
    const { searchResults, addBook } = get();
    const sb = searchResults.find((b) => b.bookId === bookId);
    if (!sb) return;
    const existing = get().books.find(b => b.title === sb.title);
    if (existing) return;
    addBook({
      title: sb.title,
      author: sb.author,
      cover: sb.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      rating: sb.rating || 0,
      status: 'want-to-read',
      isPhysical: false,
      needReread: false,
      tags: sb.category ? [sb.category] : [],
    });
  },

  setSelectedNotebookBookId: (bookId) => set({ selectedNotebookBookId: bookId }),
  setSelectedSearchBookId: (bookId) => set({ selectedSearchBookId: bookId }),
}));
