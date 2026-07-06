import { create } from 'zustand';
import type { Todo } from '../types';
import { storage } from '../utils/storage';
import { generateId, getTodayStr } from '../utils/date';

interface TodoState {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  updatePriority: (id: string, priority: Todo['priority']) => void;
  clearCompleted: () => void;
  getTodayTodos: () => Todo[];
  getTodayCompletedCount: () => number;
  getTodayTotalCount: () => number;
  getTodayProgress: () => number;
}

const STORAGE_KEY = 'todo-list';

const getDefaultTodos = (): Todo[] => {
  const today = getTodayStr();
  return [
    {
      id: generateId(),
      text: '阅读30分钟',
      completed: false,
      createdAt: today,
      priority: 'medium',
      category: '阅读',
    },
    {
      id: generateId(),
      text: '雅思听力练习',
      completed: false,
      createdAt: today,
      priority: 'high',
      category: '雅思',
    },
    {
      id: generateId(),
      text: '文献精读1篇',
      completed: false,
      createdAt: today,
      priority: 'high',
      category: '科研',
    },
    {
      id: generateId(),
      text: '背单词50个',
      completed: false,
      createdAt: today,
      priority: 'medium',
      category: '雅思',
    },
    {
      id: generateId(),
      text: '运动30分钟',
      completed: false,
      createdAt: today,
      priority: 'low',
      category: '健康',
    },
  ];
};

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: storage.get<Todo[]>(STORAGE_KEY, getDefaultTodos()),

  addTodo: (todo) => {
    const newTodo: Todo = {
      ...todo,
      id: generateId(),
      createdAt: getTodayStr(),
      completed: false,
    };
    set((state) => {
      const todos = [newTodo, ...state.todos];
      storage.set(STORAGE_KEY, todos);
      return { todos };
    });
  },

  deleteTodo: (id) => {
    set((state) => {
      const todos = state.todos.filter((t) => t.id !== id);
      storage.set(STORAGE_KEY, todos);
      return { todos };
    });
  },

  toggleTodo: (id) => {
    set((state) => {
      const todos = state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      storage.set(STORAGE_KEY, todos);
      return { todos };
    });
  },

  editTodo: (id, text) => {
    set((state) => {
      const todos = state.todos.map((t) =>
        t.id === id ? { ...t, text } : t
      );
      storage.set(STORAGE_KEY, todos);
      return { todos };
    });
  },

  updatePriority: (id, priority) => {
    set((state) => {
      const todos = state.todos.map((t) =>
        t.id === id ? { ...t, priority } : t
      );
      storage.set(STORAGE_KEY, todos);
      return { todos };
    });
  },

  clearCompleted: () => {
    set((state) => {
      const todos = state.todos.filter((t) => !t.completed);
      storage.set(STORAGE_KEY, todos);
      return { todos };
    });
  },

  getTodayTodos: () => {
    const today = getTodayStr();
    return get().todos.filter((t) => t.createdAt === today);
  },

  getTodayCompletedCount: () => {
    return get().getTodayTodos().filter((t) => t.completed).length;
  },

  getTodayTotalCount: () => {
    return get().getTodayTodos().length;
  },

  getTodayProgress: () => {
    const total = get().getTodayTotalCount();
    if (total === 0) return 0;
    const completed = get().getTodayCompletedCount();
    return Math.round((completed / total) * 100);
  },
}));
