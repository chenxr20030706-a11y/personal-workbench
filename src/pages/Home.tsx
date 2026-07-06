import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  GripVertical,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ListTodo,
  Trash,
} from 'lucide-react';
import SortableModuleCard from '../components/ModuleCard/SortableModuleCard';
import { useModuleStore } from '../store/useModuleStore';
import { useSettingsStore, getDailyQuote } from '../store/useSettingsStore';
import { useTodoStore } from '../store/useTodoStore';
import type { Todo } from '../types';

export default function Home() {
  const { modules, reorderModules } = useModuleStore();
  const { useDailyQuote, customGreeting, userName } = useSettingsStore();
  const {
    getTodayTodos,
    getTodayCompletedCount,
    getTodayTotalCount,
    getTodayProgress,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
  } = useTodoStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<Todo['priority']>('medium');

  const getGreeting = () => {
    if (!useDailyQuote && customGreeting) {
      return customGreeting;
    }
    return getDailyQuote();
  };

  const todayTodos = getTodayTodos();
  const completedCount = getTodayCompletedCount();
  const totalCount = getTodayTotalCount();
  const progress = getTodayProgress();

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'medium':
        return 'bg-dream-gold-100 text-dream-gold-600 border-dream-gold-200';
      case 'low':
        return 'bg-green-100 text-green-600 border-green-200';
      default:
        return 'bg-dream-blue-100 text-dream-blue-600 border-dream-blue-200';
    }
  };

  const getPriorityLabel = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '';
    }
  };

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    addTodo({
      text: newTodoText.trim(),
      priority: newTodoPriority,
    });
    setNewTodoText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const sortedTodos = [...todayTodos].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      const newModules = arrayMove(modules, oldIndex, newIndex);
      reorderModules(newModules);
    }
  };

  const visibleModules = modules.filter((m) => m.visible);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-dream-blue-500" />
              <span className="text-dream-blue-600 font-medium">嗨，{userName} 👋</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold gradient-text mb-2">
              {getGreeting()}
            </h2>
            <p className="text-dream-slate-500">
              你有 {visibleModules.length} 个模块已启用，拖拽卡片可以调整顺序
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              isEditing
                ? 'gradient-bg text-white shadow-soft-lg'
                : 'bg-dream-blue-50 text-dream-blue-600 hover:bg-dream-blue-100'
            }`}
          >
            <GripVertical className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isEditing ? '完成编辑' : '编辑布局'}
            </span>
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up stagger-1">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-dream-slate-800">今日待办</h3>
              <p className="text-sm text-dream-blue-500">
                已完成 {completedCount} / {totalCount} 项
              </p>
            </div>
          </div>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-dream-blue-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <Trash className="w-4 h-4" />
              <span>清除已完成</span>
            </button>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dream-blue-500">完成进度</span>
            <span className="font-medium gradient-text">{progress}%</span>
          </div>
          <div className="h-2 bg-dream-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full gradient-bg rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="添加新待办..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/60 border border-dream-blue-100 text-dream-slate-700 placeholder-dream-blue-300 focus:outline-none focus:ring-2 focus:ring-dream-blue-400/50 focus:border-dream-blue-400 transition-all duration-200"
          />
          <select
            value={newTodoPriority}
            onChange={(e) => setNewTodoPriority(e.target.value as Todo['priority'])}
            className="px-3 py-2.5 rounded-xl bg-white/60 border border-dream-blue-100 text-dream-slate-700 focus:outline-none focus:ring-2 focus:ring-dream-blue-400/50 focus:border-dream-blue-400 transition-all duration-200 text-sm"
          >
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
          <button
            onClick={handleAddTodo}
            disabled={!newTodoText.trim()}
            className="gradient-btn px-4 py-2.5 rounded-xl text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">添加</span>
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-2">
          {sortedTodos.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dream-blue-50 flex items-center justify-center">
                <ListTodo className="w-8 h-8 text-dream-blue-300" />
              </div>
              <p className="text-dream-blue-400 mb-1">暂无待办事项</p>
              <p className="text-sm text-dream-blue-300">添加你的第一个待办开始高效的一天吧！</p>
            </div>
          ) : (
            sortedTodos.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  todo.completed
                    ? 'bg-dream-blue-50/50'
                    : 'bg-white/40 hover:bg-white/70 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="flex-shrink-0 transition-transform duration-200 hover:scale-110"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-dream-blue-300 group-hover:text-dream-blue-400" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm transition-all duration-200 ${
                    todo.completed
                      ? 'text-dream-blue-300 line-through'
                      : 'text-dream-slate-700'
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex items-center gap-2">
                  {todo.category && (
                    <span className="px-2 py-0.5 text-xs rounded-md bg-dream-blue-100 text-dream-blue-600 border border-dream-blue-200">
                      {todo.category}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs rounded-md border ${getPriorityColor(
                      todo.priority
                    )}`}
                  >
                    {getPriorityLabel(todo.priority)}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md text-dream-blue-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleModules.map((m) => m.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {visibleModules.map((module, index) => (
              <SortableModuleCard
                key={module.id}
                module={module}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-1">
          <p className="text-dream-blue-400 text-sm mb-2">今日步数</p>
          <p className="text-3xl font-display font-bold gradient-text">8,234</p>
          <p className="text-xs text-green-500 mt-1">↑ 比昨天多 1,200 步</p>
        </div>
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-2">
          <p className="text-dream-blue-400 text-sm mb-2">阅读时长</p>
          <p className="text-3xl font-display font-bold gradient-text">45 分钟</p>
          <p className="text-xs text-dream-blue-400 mt-1">今日目标：60 分钟</p>
        </div>
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-3">
          <p className="text-dream-blue-400 text-sm mb-2">雅思打卡</p>
          <p className="text-3xl font-display font-bold gradient-text">连续 7 天</p>
          <p className="text-xs text-green-500 mt-1">✓ 今日已完成</p>
        </div>
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-4">
          <p className="text-dream-blue-400 text-sm mb-2">待面试</p>
          <p className="text-3xl font-display font-bold gradient-text">2 个</p>
          <p className="text-xs text-red-500 mt-1">最近：7月2日</p>
        </div>
      </div>
    </div>
  );
}
