import { create } from 'zustand';
import type { ModuleConfig } from '../types';
import { defaultModules } from '../data/mockData';
import { storage } from '../utils/storage';

interface ModuleState {
  modules: ModuleConfig[];
  reorderModules: (modules: ModuleConfig[]) => void;
  toggleModule: (id: string) => void;
}

const STORAGE_KEY = 'workspace-modules';

export const useModuleStore = create<ModuleState>((set) => ({
  modules: storage.get<ModuleConfig[]>(STORAGE_KEY, defaultModules),
  reorderModules: (modules) => {
    const ordered = modules.map((m, i) => ({ ...m, order: i }));
    set({ modules: ordered });
    storage.set(STORAGE_KEY, ordered);
  },
  toggleModule: (id) =>
    set((state) => {
      const modules = state.modules.map((m) =>
        m.id === id ? { ...m, visible: !m.visible } : m
      );
      storage.set(STORAGE_KEY, modules);
      return { modules };
    }),
}));
