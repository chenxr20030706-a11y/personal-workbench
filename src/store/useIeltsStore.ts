import { create } from 'zustand';
import type { IeltsModule, StudyRecord, CheckInRecord } from '../types';
import { mockIeltsModules, mockStudyRecords, mockCheckInRecords } from '../data/mockData';
import { storage } from '../utils/storage';
import { generateId, getTodayStr } from '../utils/date';

interface IeltsState {
  modules: IeltsModule[];
  studyRecords: StudyRecord[];
  checkInRecords: CheckInRecord[];
  overallTargetScore: number;
  examDate: string;
  addStudyRecord: (record: Omit<StudyRecord, 'id'>) => void;
  deleteStudyRecord: (id: string) => void;
  checkIn: (modules: string[], date?: string) => void;
  uncheckIn: (date?: string) => void;
  toggleCheckIn: (modules: string[], date?: string) => void;
  hasCheckedIn: (date?: string) => boolean;
  hasCheckedInToday: () => boolean;
  getCheckInRecord: (date: string) => CheckInRecord | undefined;
  updateModuleScore: (id: string, currentScore: number, targetScore: number) => void;
  updateOverallTarget: (score: number) => void;
  updateExamDate: (date: string) => void;
  clearAllData: () => void;
}

const STORAGE_KEY_MODULES = 'ielts-modules';
const STORAGE_KEY_RECORDS = 'ielts-records';
const STORAGE_KEY_CHECKINS = 'ielts-checkins';
const STORAGE_KEY_TARGET = 'ielts-target';
const STORAGE_KEY_EXAM = 'ielts-exam-date';

const defaultTargetScore = 7.5;
const defaultExamDate = '';

export const useIeltsStore = create<IeltsState>((set, get) => ({
  modules: storage.get<IeltsModule[]>(STORAGE_KEY_MODULES, mockIeltsModules),
  studyRecords: storage.get<StudyRecord[]>(STORAGE_KEY_RECORDS, mockStudyRecords),
  checkInRecords: storage.get<CheckInRecord[]>(
    STORAGE_KEY_CHECKINS,
    mockCheckInRecords
  ),
  overallTargetScore: storage.get<number>(STORAGE_KEY_TARGET, defaultTargetScore),
  examDate: storage.get<string>(STORAGE_KEY_EXAM, defaultExamDate),

  addStudyRecord: (record) => {
    const newRecord: StudyRecord = {
      ...record,
      id: generateId(),
    };
    set((state) => {
      const records = [newRecord, ...state.studyRecords];
      storage.set(STORAGE_KEY_RECORDS, records);
      return { studyRecords: records };
    });
  },

  deleteStudyRecord: (id) => {
    set((state) => {
      const records = state.studyRecords.filter((r) => r.id !== id);
      storage.set(STORAGE_KEY_RECORDS, records);
      return { studyRecords: records };
    });
  },

  checkIn: (modules, date) => {
    const targetDate = date || getTodayStr();
    set((state) => {
      const existingIndex = state.checkInRecords.findIndex(
        (r) => r.date === targetDate
      );
      let newRecords = [...state.checkInRecords];
      if (existingIndex >= 0) {
        newRecords[existingIndex] = { date: targetDate, completed: true, modules };
      } else {
        newRecords = [{ date: targetDate, completed: true, modules }, ...newRecords];
      }
      storage.set(STORAGE_KEY_CHECKINS, newRecords);
      return { checkInRecords: newRecords };
    });
  },

  uncheckIn: (date) => {
    const targetDate = date || getTodayStr();
    set((state) => {
      const newRecords = state.checkInRecords.map((r) =>
        r.date === targetDate ? { ...r, completed: false, modules: [] } : r
      );
      storage.set(STORAGE_KEY_CHECKINS, newRecords);
      return { checkInRecords: newRecords };
    });
  },

  toggleCheckIn: (modules, date) => {
    const targetDate = date || getTodayStr();
    const isChecked = get().hasCheckedIn(targetDate);
    if (isChecked) {
      get().uncheckIn(targetDate);
    } else {
      get().checkIn(modules, targetDate);
    }
  },

  hasCheckedIn: (date) => {
    const targetDate = date || getTodayStr();
    return get().checkInRecords.some(
      (r) => r.date === targetDate && r.completed
    );
  },

  hasCheckedInToday: () => {
    return get().hasCheckedIn();
  },

  getCheckInRecord: (date) => {
    return get().checkInRecords.find((r) => r.date === date);
  },

  updateModuleScore: (id, currentScore, targetScore) => {
    set((state) => {
      const modules = state.modules.map((m) =>
        m.id === id ? { ...m, currentScore, targetScore } : m
      );
      storage.set(STORAGE_KEY_MODULES, modules);
      return { modules };
    });
  },

  updateOverallTarget: (score) => {
    storage.set(STORAGE_KEY_TARGET, score);
    set({ overallTargetScore: score });
  },

  updateExamDate: (date) => {
    storage.set(STORAGE_KEY_EXAM, date);
    set({ examDate: date });
  },

  clearAllData: () => {
    storage.remove(STORAGE_KEY_MODULES);
    storage.remove(STORAGE_KEY_RECORDS);
    storage.remove(STORAGE_KEY_CHECKINS);
    storage.remove(STORAGE_KEY_TARGET);
    storage.remove(STORAGE_KEY_EXAM);
    set({
      modules: mockIeltsModules,
      studyRecords: mockStudyRecords,
      checkInRecords: mockCheckInRecords,
      overallTargetScore: defaultTargetScore,
      examDate: defaultExamDate,
    });
  },
}));
