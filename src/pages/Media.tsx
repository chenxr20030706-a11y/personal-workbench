import { useState, useEffect } from 'react';
import {
  Film,
  Tv,
  Star,
  Tag,
  Plus,
  ListFilter,
  Play,
  Clock,
  MessageSquare,
  X,
  Settings,
  Trash2,
  Edit3,
  Image,
  RefreshCw,
} from 'lucide-react';
import { useMediaStore } from '../store/useMediaStore';
import type { MediaItem } from '../types';

export default function Media() {
  const { items, filter, setFilter, addItem, incrementWatchCount, deleteItem, customTags, clearAllData, generatePoster, rateItem, updateItemReview } = useMediaStore();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  const [newItem, setNewItem] = useState({
    title: '',
    type: 'movie' as 'movie' | 'tv',
    poster: '',
    rating: 0,
    review: '',
    tags: '',
    year: new Date().getFullYear(),
  });

  const [editForm, setEditForm] = useState({
    title: '',
    type: 'movie' as 'movie' | 'tv',
    poster: '',
    rating: 0,
    review: '',
    tags: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (showAddItem && newItem.title.trim()) {
      const autoPoster = generatePoster(newItem.title, newItem.type);
      setNewItem((prev) => ({ ...prev, poster: autoPoster }));
    }
  }, [newItem.title, newItem.type, showAddItem, generatePoster]);

  useEffect(() => {
    if (editingItem) {
      setEditForm({
        title: editingItem.title,
        type: editingItem.type,
        poster: editingItem.poster,
        rating: editingItem.rating,
        review: editingItem.review,
        tags: editingItem.tags.join(', '),
        year: editingItem.year,
      });
    }
  }, [editingItem]);

  const filters = [
    { id: 'all', label: '全部', icon: ListFilter },
    { id: 'movie', label: '电影', icon: Film },
    { id: 'tv', label: '剧集', icon: Tv },
  ];

  let filteredItems = items.filter((i) => filter === 'all' || i.type === filter);
  if (tagFilter) {
    filteredItems = filteredItems.filter((i) => i.tags.includes(tagFilter));
  }

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            onClick={() => interactive && onRate?.(star)}
            className={`w-4 h-4 transition-all duration-200 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-purple-200'} ${interactive ? 'cursor-pointer hover:scale-125 hover:drop-shadow-sm' : ''}`}
          />
        ))}
      </div>
    );
  };

  const allTags = [...new Set(items.flatMap((i) => i.tags))];

  const handleAddItem = () => {
    if (!newItem.title.trim()) return;
    addItem({
      title: newItem.title,
      type: newItem.type,
      poster: newItem.poster,
      rating: newItem.rating,
      review: newItem.review,
      tags: newItem.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      year: newItem.year,
    });
    setNewItem({ title: '', type: 'movie', poster: '', rating: 0, review: '', tags: '', year: new Date().getFullYear() });
    setShowAddItem(false);
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editForm.title.trim()) return;
    rateItem(editingItem.id, editForm.rating);
    updateItemReview(editingItem.id, editForm.review);
    setEditingItem(null);
  };

  const handleRegeneratePoster = () => {
    if (newItem.title.trim()) {
      const randomSuffix = Math.random().toString(36).substring(7);
      const newPoster = generatePoster(newItem.title + randomSuffix, newItem.type);
      setNewItem((prev) => ({ ...prev, poster: newPoster }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-soft-lg">
            <Film className="w-7 h-7 text-white icon-glow" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold gradient-text">影音收藏</h2>
            <p className="text-dream-blue-500 text-sm">共收藏 {items.length} 部作品</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 hover:bg-dream-blue-100 rounded-xl transition-all duration-200 active:scale-95"
            title="设置"
          >
            <Settings className="w-5 h-5 text-dream-blue-500" />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-2">
            {filters.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as 'all' | 'movie' | 'tv')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 active:scale-95 ${filter === f.id
                      ? 'gradient-bg text-white shadow-soft-lg'
                      : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100 hover:shadow-sm'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{f.label}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowAddItem(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium active:scale-95 transition-all duration-200 hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            添加作品
          </button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-1">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${!tagFilter
                  ? 'gradient-bg text-white shadow-sm'
                  : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                }`}
            >
              全部标签
            </button>
            {allTags.slice(0, 15).map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${tagFilter === tag
                    ? 'gradient-bg text-white shadow-sm'
                    : 'bg-dream-blue-100/80 text-dream-blue-600 hover:bg-lavender-200'
                  }`}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
            className={`glass-card glass-card-hover rounded-2xl overflow-hidden cursor-pointer animate-fade-in-up stagger-${(index % 6) + 1} transition-all duration-300 ${
              selectedItem === item.id ? 'ring-2 ring-dream-blue-400 shadow-lg scale-[1.02]' : ''
            }`}
          >
            <div className="relative aspect-[2/3] overflow-hidden group">
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between mb-2">
                    {renderStars(item.rating)}
                    <span className="text-xs text-white bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full font-medium">
                      {item.type === 'movie' ? '电影' : '剧集'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        incrementWatchCount(item.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs hover:bg-white/30 transition-all duration-200 active:scale-95 font-medium"
                    >
                      <Play className="w-3.5 h-3.5" />
                      再看一次
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-dream-slate-600 shadow-sm">
                  <Play className="w-3 h-3" />
                  {item.watchCount}
                </span>
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-semibold text-dream-slate-800 text-sm line-clamp-1 mb-1">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-dream-blue-400">
                <span>{item.year}</span>
                <span>·</span>
                {renderStars(item.rating)}
              </div>
            </div>

            {selectedItem === item.id && (
              <div className="p-3 border-t border-dream-blue-100/50 animate-fade-in space-y-3">
                <div className="flex items-start gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-dream-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-dream-slate-600 line-clamp-3">{item.review || '暂无观后感'}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.tags.length > 0 ? (
                    item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-dream-blue-50 text-dream-blue-500 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-dream-blue-300">暂无标签</span>
                  )}
                </div>
                {item.lastWatchedDate && (
                  <div className="flex items-center gap-1 text-xs text-dream-blue-400">
                    <Clock className="w-3 h-3" />
                    上次观看：{item.lastWatchedDate}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(item);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-lg bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100 transition-all duration-200 active:scale-95 font-medium"
                  >
                    <Edit3 className="w-3 h-3" />
                    编辑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定要删除这个作品吗？')) {
                        deleteItem(item.id);
                        setSelectedItem(null);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-200 active:scale-95 font-medium"
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

      {filteredItems.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-dream-blue-50 flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 text-dream-blue-300" />
          </div>
          <p className="text-dream-blue-400 mb-4">暂无收藏的作品</p>
          <button
            onClick={() => setShowAddItem(true)}
            className="inline-flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            添加第一部作品
          </button>
        </div>
      )}

      {showAddItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddItem(false)}>
          <div className="glass-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h3 className="font-semibold text-dream-slate-800 text-lg">添加作品</h3>
              <button onClick={() => setShowAddItem(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-all duration-200 active:scale-90">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm text-dream-slate-600 mb-1.5 block font-medium">标题 *</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="输入作品名称"
                  className="w-full px-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-purple-400"
                />
              </div>

              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block font-medium">类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['movie', 'tv'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewItem({ ...newItem, type })}
                      className={`py-2.5 text-sm rounded-xl transition-all duration-200 active:scale-95 font-medium ${newItem.type === type
                          ? 'gradient-bg text-white shadow-md'
                          : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                        }`}
                    >
                      {type === 'movie' ? '电影' : '剧集'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-dream-slate-600 font-medium">海报预览</label>
                  <button
                    onClick={handleRegeneratePoster}
                    disabled={!newItem.title.trim()}
                    className="flex items-center gap-1 text-xs text-dream-blue-500 hover:text-dream-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-3 h-3" />
                    换一张
                  </button>
                </div>
                <div className="aspect-[2/3] max-w-[140px] mx-auto rounded-xl overflow-hidden bg-dream-blue-50 border border-dream-blue-100 mb-2">
                  {newItem.poster ? (
                    <img
                      src={newItem.poster}
                      alt="海报预览"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-dream-blue-300">
                      <Image className="w-8 h-8 mb-1" />
                      <span className="text-xs">输入标题自动生成</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-dream-blue-400 text-center">
                  或输入自定义图片链接
                </div>
                <input
                  type="text"
                  value={newItem.poster}
                  onChange={(e) => setNewItem({ ...newItem, poster: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 mt-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1.5 block font-medium">年份</label>
                  <input
                    type="number"
                    value={newItem.year}
                    onChange={(e) => setNewItem({ ...newItem, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-2 block font-medium">评分</label>
                  <div className="pt-1.5">
                    {renderStars(newItem.rating, true, (r) => setNewItem({ ...newItem, rating: r }))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-dream-slate-600 mb-1.5 block font-medium">观后感</label>
                <textarea
                  value={newItem.review}
                  onChange={(e) => setNewItem({ ...newItem, review: e.target.value })}
                  placeholder="写下你的观后感..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-sm text-dream-slate-600 mb-1.5 block font-medium">标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={newItem.tags}
                  onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                  placeholder="例如：科幻, 悬疑, 诺兰"
                  className="w-full px-4 py-2.5 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-all duration-200 active:scale-98"
                >
                  取消
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.title.trim()}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium active:scale-98 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingItem(null)}>
          <div className="glass-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h3 className="font-semibold text-dream-slate-800 text-lg">编辑作品</h3>
              <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-all duration-200 active:scale-90">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm text-dream-slate-600 mb-1.5 block font-medium">标题</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700"
                />
              </div>

              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block font-medium">类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['movie', 'tv'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setEditForm({ ...editForm, type })}
                      className={`py-2.5 text-sm rounded-xl transition-all duration-200 active:scale-95 font-medium ${editForm.type === type
                          ? 'gradient-bg text-white shadow-md'
                          : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                        }`}
                    >
                      {type === 'movie' ? '电影' : '剧集'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1.5 block font-medium">年份</label>
                  <input
                    type="number"
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-2 block font-medium">评分</label>
                  <div className="pt-1.5">
                    {renderStars(editForm.rating, true, (r) => setEditForm({ ...editForm, rating: r }))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-dream-slate-600 mb-1.5 block font-medium">观后感</label>
                <textarea
                  value={editForm.review}
                  onChange={(e) => setEditForm({ ...editForm, review: e.target.value })}
                  placeholder="写下你的观后感..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-all duration-200 active:scale-98"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editForm.title.trim()}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium active:scale-98 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div className="glass-card rounded-3xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-dream-slate-800 text-lg">影音设置</h3>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-all duration-200 active:scale-90">
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
                      className="flex items-center gap-1 px-3 py-1 bg-dream-blue-100/80 text-dream-blue-600 rounded-full text-xs font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-dream-blue-400">在添加作品时可使用这些标签</p>
              </div>
              <div className="pt-4 border-t border-dream-blue-100/50">
                <p className="text-sm font-medium text-dream-slate-700 mb-3">数据管理</p>
                <button
                  onClick={() => {
                    if (confirm('确定要清空所有影音数据吗？此操作不可恢复。')) {
                      clearAllData();
                      setShowSettings(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-all duration-200 active:scale-98"
                >
                  <Trash2 className="w-4 h-4" />
                  清空所有数据
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
