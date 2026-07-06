/**
 * WeRead (微信读书) API 封装
 *
 * 统一入口: POST https://i.weread.qq.com/api/agent/gateway
 * 鉴权方式: Header Authorization: Bearer <api_key>
 * 请求格式: JSON body，包含 api_name 与 skill_version
 */

export const WEREAD_API_ENDPOINT = '/weread/api/agent/gateway';
export const WEREAD_SKILL_VERSION = '1.0.4';
export const WEREAD_API_KEY_STORAGE = 'weread-api-key';

export type WeReadConnectionStatus = 'disconnected' | 'connected' | 'error';

/** 搜索结果书籍 */
export interface WeReadSearchBook {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  intro?: string;
  category?: string;
  price?: string;
}

/** 书架书籍（API 原始返回字段） */
interface WeReadShelfRawBook {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  finishReading?: number;
  readUpdateTime?: number;
  category?: string;
  updateTime?: number;
  secret?: number;
  deepLink?: string;
}

/** 书架书籍（前端使用） */
export interface WeReadShelfBook {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  progress: number;
  finished: boolean;
  lastReadTime?: string;
  format: 'book' | 'audio';
  category?: string;
}

/** 笔记本（包含笔记的书籍） */
export interface WeReadNotebook {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  noteCount: number;
  bookmarkCount: number;
  reviewCount: number;
}

/** 划线（书签） */
export interface WeReadBookmark {
  bookmarkId: string;
  bookId: string;
  chapterTitle: string;
  chapterUid?: number;
  content: string;
  style?: number;
  createTime?: string;
  range?: string;
}

/** 想法 / 点评（用户自己写的） */
export interface WeReadThought {
  reviewId: string;
  bookId: string;
  chapterTitle: string;
  content: string;
  createTime?: string;
  range?: string;
}

/** 书籍详情中的公开书评 */
export interface WeReadReview {
  reviewId: string;
  bookId: string;
  title?: string;
  content: string;
  author: string;
  avatar?: string;
  rating: number;
  likes: number;
  createTime?: string;
  recommended?: boolean;
}

/** 推荐书籍 */
export interface WeReadRecommendation {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  intro?: string;
  reason?: string;
  category?: string;
}

/** 阅读时长统计 */
export interface WeReadReadStats {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  yearMinutes: number;
  readDays: number;
  totalReadDays: number;
  /** 分类时长统计 */
  categories: { name: string; minutes: number }[];
  /** 最近 7 天时长趋势 */
  dailyMinutes: { date: string; minutes: number }[];
}

/** API 网关响应通用结构 */
interface WeReadGatewayResponse<T> {
  ret: number;
  msg?: string;
  data?: T;
  /** 部分接口直接平铺返回业务字段 */
  [key: string]: unknown;
}

export class WeReadApiError extends Error {
  status: number;
  code?: number;
  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = 'WeReadApiError';
    this.status = status;
    this.code = code;
  }
}

/** 判断是否为合法的 WeRead API Key 格式 */
export const isValidWeReadApiKey = (key: string): boolean => {
  if (!key) return false;
  return /^wrk-.+$/.test(key.trim());
};

/** 生成微信读书深度链接 */
export const buildWeReadDeeplink = (bookId: string, options?: { chapterUid?: number }): string => {
  if (!bookId) return 'weread://';
  if (options?.chapterUid) {
    return `weread://reading?bId=${encodeURIComponent(bookId)}&cId=${encodeURIComponent(String(options.chapterUid))}`;
  }
  return `weread://reading?bId=${encodeURIComponent(bookId)}`;
};

/** 生成微信读书网页版链接 */
export const buildWeReadWebLink = (bookId: string): string => {
  if (!bookId) return 'https://weread.qq.com/';
  return `https://weread.qq.com/web/book/${encodeURIComponent(bookId)}`;
};

/**
 * 统一的 WeRead API 调用函数
 *
 * @param apiKey WeRead API Key（wrk-xxx）
 * @param apiName 接口名（如 /store/search）
 * @param params 业务参数（不含 api_name / skill_version）
 * @returns 接口返回的 data 字段（若存在），否则完整响应
 */
export async function callWeReadApi<T = unknown>(
  apiKey: string,
  apiName: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  if (!apiKey) {
    throw new WeReadApiError('未配置 WeRead API Key', 401);
  }

  let response: Response;
  try {
    response = await fetch(WEREAD_API_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_name: apiName,
        skill_version: WEREAD_SKILL_VERSION,
        ...params,
      }),
    });
  } catch (err) {
    throw new WeReadApiError(
      `网络请求失败：${err instanceof Error ? err.message : 'unknown error'}`,
      0
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new WeReadApiError('API Key 无效或权限不足', response.status);
  }
  if (response.status === 429) {
    throw new WeReadApiError('请求过于频繁，请稍后再试', response.status);
  }
  if (!response.ok) {
    throw new WeReadApiError(`请求失败，HTTP ${response.status}`, response.status);
  }

  let json: WeReadGatewayResponse<T>;
  try {
    json = (await response.json()) as WeReadGatewayResponse<T>;
  } catch {
    throw new WeReadApiError('响应解析失败：非 JSON 格式', response.status);
  }

  // ret === 0 表示成功，部分接口可能不返回 ret，则按 HTTP 成功处理
  if (typeof json.ret === 'number' && json.ret !== 0) {
    throw new WeReadApiError(json.msg || `接口返回错误码 ${json.ret}`, response.status, json.ret);
  }

  // 优先返回 data 字段；若没有 data 字段则返回完整响应（去掉 ret/msg 元字段时由调用方处理）
  return (json.data ?? (json as unknown)) as T;
}

/** 调用 /store/search 搜索书籍 */
export async function searchWeReadBooks(
  apiKey: string,
  keyword: string,
  count = 10
): Promise<WeReadSearchBook[]> {
  const data = await callWeReadApi<{ results?: WeReadSearchBook[] } | WeReadSearchBook[]>(
    apiKey,
    '/store/search',
    { keyword, count, scope: 10 }
  );
  return normalizeList<WeReadSearchBook>(data, 'results');
}

/** 调用 /shelf/sync 同步书架 */
export async function syncWeReadShelf(apiKey: string): Promise<WeReadShelfBook[]> {
  const data = await callWeReadApi<{ books?: WeReadShelfRawBook[] }>(
    apiKey,
    '/shelf/sync'
  );
  const rawBooks = normalizeList<WeReadShelfRawBook>(data, 'books');
  return rawBooks.map((b) => ({
    bookId: b.bookId,
    title: b.title,
    author: b.author,
    cover: b.cover,
    progress: b.finishReading === 1 ? 100 : 0,
    finished: b.finishReading === 1,
    lastReadTime: b.readUpdateTime
      ? new Date(b.readUpdateTime * 1000).toISOString().slice(0, 10)
      : undefined,
    format: 'book',
    category: b.category,
  }));
}

/** 调用 /user/notebooks 获取笔记本列表 */
export async function getWeReadNotebooks(apiKey: string): Promise<WeReadNotebook[]> {
  const data = await callWeReadApi<{ books?: WeReadNotebook[] } | WeReadNotebook[]>(
    apiKey,
    '/user/notebooks',
    { count: 100 }
  );
  return normalizeList<WeReadNotebook>(data, 'books');
}

/** 调用 /book/bookmarklist 获取指定书籍的划线 */
export async function getWeReadBookmarks(
  apiKey: string,
  bookId: string
): Promise<WeReadBookmark[]> {
  const data = await callWeReadApi<{ updated?: WeReadBookmark[] } | WeReadBookmark[]>(
    apiKey,
    '/book/bookmarklist',
    { bookId }
  );
  return normalizeList<WeReadBookmark>(data, 'updated');
}

/** 调用 /review/list/mine 获取用户在某本书上的个人想法/笔记 */
export async function getWeReadThoughts(
  apiKey: string,
  bookId: string
): Promise<WeReadThought[]> {
  const data = await callWeReadApi<{ reviews?: WeReadThought[] } | WeReadThought[]>(
    apiKey,
    '/review/list/mine',
    { bookid: bookId }
  );
  return normalizeList<WeReadThought>(data, 'reviews');
}

/** 调用 /review/list 获取某本书的公开点评/想法 */
export async function getWeReadReviews(
  apiKey: string,
  bookId: string,
  options?: { sort?: 'recommend' | 'latest'; count?: number }
): Promise<WeReadReview[]> {
  const data = await callWeReadApi<{ reviews?: WeReadReview[] } | WeReadReview[]>(
    apiKey,
    '/review/list',
    {
      bookId,
      reviewListType: options?.sort === 'latest' ? 3 : 1,
      count: options?.count ?? 20,
    }
  );
  return normalizeList<WeReadReview>(data, 'reviews');
}

/** 调用 /book/recommend 获取个性化推荐 */
export async function getWeReadRecommendations(
  apiKey: string,
  count = 10
): Promise<WeReadRecommendation[]> {
  const data = await callWeReadApi<{ books?: WeReadRecommendation[] } | WeReadRecommendation[]>(
    apiKey,
    '/book/recommend',
    { count }
  );
  return normalizeList<WeReadRecommendation>(data, 'books');
}

/** 调用 /readdata/detail 获取阅读统计 */
export async function getWeReadReadStats(apiKey: string): Promise<WeReadReadStats> {
  const monthData = await callWeReadApi<Record<string, unknown>>(
    apiKey,
    '/readdata/detail',
    { mode: 'monthly' }
  );
  const yearData = await callWeReadApi<Record<string, unknown>>(
    apiKey,
    '/readdata/detail',
    { mode: 'annually' }
  ).catch(() => ({}) as Record<string, unknown>);

  const monthMinutes = Number(monthData.totalReadTime ?? 0);
  const yearMinutes = Number(yearData.totalReadTime ?? 0);
  const readDays = Number(monthData.readDays ?? 0);
  const totalReadDays = Number(yearData.readDays ?? 0);

  // readTimes 是 {时间戳: 分钟数} 的 map
  const readTimes = (monthData.readTimes ?? {}) as Record<string, number>;
  const dailyMinutes = Object.entries(readTimes).map(([ts, minutes]) => ({
    date: new Date(Number(ts) * 1000).toISOString().slice(0, 10),
    minutes: minutes,
  }));

  // 偏好分类
  const preferCategory = (monthData.preferCategory ?? []) as Array<{ category?: string; count?: number }>;
  const categories = preferCategory
    .filter((c) => c.category)
    .map((c) => ({ name: c.category!, minutes: Number(c.count ?? 0) * 60 }));

  return {
    todayMinutes: dailyMinutes.reduce((sum, d) => sum + d.minutes, 0),
    weekMinutes: 0,
    monthMinutes,
    yearMinutes,
    readDays,
    totalReadDays,
    categories,
    dailyMinutes,
    ...monthData,
    ...yearData,
  } as WeReadReadStats;
}

/** 探测式连接测试：调用书架同步（轻量），失败则抛错 */
export async function testWeReadConnection(apiKey: string): Promise<WeReadShelfBook[]> {
  return syncWeReadShelf(apiKey);
}

/**
 * 统一将接口返回归一化为数组。
 * 兼容三种形态：
 *  1) 直接是数组
 *  2) { books: [...] } / { notebooks: [...] } 等包装
 *  3) { data: { ... } } 已在 callWeReadApi 解包过
 */
function normalizeList<T>(data: unknown, listKey: string): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj[listKey])) return obj[listKey] as T[];
    // 退而求其次：寻找第一个数组字段
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

/** 格式化时长（分钟 → 1h 20m 形式） */
export const formatReadMinutes = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0 分钟';
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`;
};
