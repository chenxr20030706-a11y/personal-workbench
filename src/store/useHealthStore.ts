import { create } from 'zustand';
import type { HealthData, MealRecord, Supplement, FitnessGoal, AINutritionAdvice, NutrientSummary } from '../types';
import { mockHealthData, mockMealRecords, mockSupplements, mockFitnessGoals } from '../data/mockData';
import { storage } from '../utils/storage';
import { generateId, getTodayStr } from '../utils/date';

interface HealthState {
  healthData: HealthData[];
  meals: MealRecord[];
  supplements: Supplement[];
  goals: FitnessGoal[];
  initialWeight: number;
  targetWeight: number;
  bodyFat: number;
  muscleMass: number;
  targetBodyFat: number;
  calorieGoal: number;
  proteinGoal: number;
  addMeal: (meal: Omit<MealRecord, 'id'>) => void;
  deleteMeal: (id: string) => void;
  toggleSupplement: (id: string, date: string) => void;
  addSupplement: (supplement: Omit<Supplement, 'id' | 'takenDates'>) => void;
  deleteSupplement: (id: string) => void;
  addHealthData: (data: HealthData) => void;
  updateTodayWeight: (weight: number) => void;
  updateBodyComposition: (bodyFat: number, muscleMass: number) => void;
  addGoal: (goal: Omit<FitnessGoal, 'id' | 'startValue' | 'startDate' | 'currentValue'>) => void;
  deleteGoal: (id: string) => void;
  getTodayMeals: () => MealRecord[];
  getTodayTotalCalories: () => number;
  getTodayNutrients: () => NutrientSummary;
  getAverageSleep: (days: number) => number;
  getSleepQuality: () => string;
  getAverageSteps: (days: number) => number;
  getAverageExercise: (days: number) => number;
  getWeightChange: (days: number) => number;
  getBodyFatChange: (days: number) => number;
  getAINutritionAdvice: () => AINutritionAdvice;
  updateSettings: (settings: Partial<{
    initialWeight: number;
    targetWeight: number;
    targetBodyFat: number;
    calorieGoal: number;
    proteinGoal: number;
  }>) => void;
  clearAllData: () => void;
}

const STORAGE_KEY_DATA = 'health-data';
const STORAGE_KEY_MEALS = 'health-meals';
const STORAGE_KEY_SUPPLEMENTS = 'health-supplements';
const STORAGE_KEY_GOALS = 'health-goals';
const STORAGE_KEY_INITIAL_WEIGHT = 'health-initial-weight';
const STORAGE_KEY_TARGET_WEIGHT = 'health-target-weight';
const STORAGE_KEY_BODY_FAT = 'health-body-fat';
const STORAGE_KEY_MUSCLE = 'health-muscle';
const STORAGE_KEY_TARGET_BODY_FAT = 'health-target-body-fat';
const STORAGE_KEY_CALORIE_GOAL = 'health-calorie-goal';
const STORAGE_KEY_PROTEIN_GOAL = 'health-protein-goal';

const defaultInitialWeight = 58;
const defaultTargetWeight = 52;
const defaultBodyFat = 25;
const defaultMuscleMass = 40;
const defaultTargetBodyFat = 20;
const defaultCalorieGoal = 1500;
const defaultProteinGoal = 80;

export const useHealthStore = create<HealthState>((set, get) => ({
  healthData: storage.get<HealthData[]>(STORAGE_KEY_DATA, mockHealthData),
  meals: storage.get<MealRecord[]>(STORAGE_KEY_MEALS, mockMealRecords),
  supplements: storage.get<Supplement[]>(STORAGE_KEY_SUPPLEMENTS, mockSupplements),
  goals: storage.get<FitnessGoal[]>(STORAGE_KEY_GOALS, mockFitnessGoals),
  initialWeight: storage.get<number>(STORAGE_KEY_INITIAL_WEIGHT, defaultInitialWeight),
  targetWeight: storage.get<number>(STORAGE_KEY_TARGET_WEIGHT, defaultTargetWeight),
  bodyFat: storage.get<number>(STORAGE_KEY_BODY_FAT, defaultBodyFat),
  muscleMass: storage.get<number>(STORAGE_KEY_MUSCLE, defaultMuscleMass),
  targetBodyFat: storage.get<number>(STORAGE_KEY_TARGET_BODY_FAT, defaultTargetBodyFat),
  calorieGoal: storage.get<number>(STORAGE_KEY_CALORIE_GOAL, defaultCalorieGoal),
  proteinGoal: storage.get<number>(STORAGE_KEY_PROTEIN_GOAL, defaultProteinGoal),

  addMeal: (meal) => {
    const newMeal: MealRecord = {
      ...meal,
      id: generateId(),
    };
    set((state) => {
      const meals = [newMeal, ...state.meals];
      storage.set(STORAGE_KEY_MEALS, meals);
      return { meals };
    });
  },

  deleteMeal: (id) => {
    set((state) => {
      const meals = state.meals.filter((m) => m.id !== id);
      storage.set(STORAGE_KEY_MEALS, meals);
      return { meals };
    });
  },

  toggleSupplement: (id, date) => {
    set((state) => {
      const supplements = state.supplements.map((s) => {
        if (s.id !== id) return s;
        const hasTaken = s.takenDates.includes(date);
        return {
          ...s,
          takenDates: hasTaken
            ? s.takenDates.filter((d) => d !== date)
            : [...s.takenDates, date],
        };
      });
      storage.set(STORAGE_KEY_SUPPLEMENTS, supplements);
      return { supplements };
    });
  },

  addSupplement: (supplement) => {
    const newSupplement: Supplement = {
      ...supplement,
      id: generateId(),
      takenDates: [],
    };
    set((state) => {
      const supplements = [...state.supplements, newSupplement];
      storage.set(STORAGE_KEY_SUPPLEMENTS, supplements);
      return { supplements };
    });
  },

  deleteSupplement: (id) => {
    set((state) => {
      const supplements = state.supplements.filter((s) => s.id !== id);
      storage.set(STORAGE_KEY_SUPPLEMENTS, supplements);
      return { supplements };
    });
  },

  addHealthData: (data) => {
    set((state) => {
      const existingIndex = state.healthData.findIndex(
        (d) => d.date === data.date
      );
      let newData = [...state.healthData];
      if (existingIndex >= 0) {
        newData[existingIndex] = data;
      } else {
        newData = [data, ...newData];
      }
      storage.set(STORAGE_KEY_DATA, newData);
      return { healthData: newData };
    });
  },

  updateTodayWeight: (weight) => {
    const today = getTodayStr();
    set((state) => {
      const existingIndex = state.healthData.findIndex((d) => d.date === today);
      let newData = [...state.healthData];
      if (existingIndex >= 0) {
        newData[existingIndex] = { ...newData[existingIndex], weight };
      } else {
        newData = [{ date: today, weight }, ...newData];
      }
      storage.set(STORAGE_KEY_DATA, newData);
      return { healthData: newData };
    });
  },

  updateBodyComposition: (bodyFat, muscleMass) => {
    const today = getTodayStr();
    storage.set(STORAGE_KEY_BODY_FAT, bodyFat);
    storage.set(STORAGE_KEY_MUSCLE, muscleMass);
    set((state) => {
      const existingIndex = state.healthData.findIndex((d) => d.date === today);
      let newData = [...state.healthData];
      if (existingIndex >= 0) {
        newData[existingIndex] = { ...newData[existingIndex], bodyFat, muscleMass };
      } else {
        newData = [{ date: today, bodyFat, muscleMass }, ...newData];
      }
      storage.set(STORAGE_KEY_DATA, newData);
      return { healthData: newData, bodyFat, muscleMass };
    });
  },

  addGoal: (goal) => {
    const todayStr = getTodayStr();
    const todayData = get().healthData.find((d) => d.date === todayStr);
    let startValue = 0;
    if (goal.type === 'weight') {
      startValue = todayData?.weight || get().initialWeight;
    } else if (goal.type === 'body-fat') {
      startValue = todayData?.bodyFat || get().bodyFat;
    } else if (goal.type === 'muscle') {
      startValue = todayData?.muscleMass || get().muscleMass;
    }

    const newGoal: FitnessGoal = {
      ...goal,
      id: generateId(),
      startValue,
      currentValue: startValue,
      startDate: todayStr,
    };
    set((state) => {
      const goals = [...state.goals, newGoal];
      storage.set(STORAGE_KEY_GOALS, goals);
      return { goals };
    });
  },

  deleteGoal: (id) => {
    set((state) => {
      const goals = state.goals.filter((g) => g.id !== id);
      storage.set(STORAGE_KEY_GOALS, goals);
      return { goals };
    });
  },

  getTodayMeals: () => {
    const today = getTodayStr();
    return get().meals.filter((m) => m.date === today);
  },

  getTodayTotalCalories: () => {
    return get().getTodayMeals().reduce((sum, m) => sum + m.calories, 0);
  },

  getTodayNutrients: () => {
    const todayMeals = get().getTodayMeals();
    return todayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  },

  getAverageSleep: (days = 7) => {
    const data = get().healthData.slice(0, days);
    const sleepData = data.filter((d) => d.sleepHours !== undefined);
    if (sleepData.length === 0) return 0;
    return sleepData.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / sleepData.length;
  },

  getSleepQuality: () => {
    const avgSleep = get().getAverageSleep(7);
    if (avgSleep >= 8) return '优秀';
    if (avgSleep >= 7) return '良好';
    if (avgSleep >= 6) return '一般';
    return '不足';
  },

  getAverageSteps: (days = 7) => {
    const data = get().healthData.slice(0, days);
    const stepsData = data.filter((d) => d.steps !== undefined);
    if (stepsData.length === 0) return 0;
    return Math.round(stepsData.reduce((sum, d) => sum + (d.steps || 0), 0) / stepsData.length);
  },

  getAverageExercise: (days = 7) => {
    const data = get().healthData.slice(0, days);
    const exerciseData = data.filter((d) => d.exerciseMinutes !== undefined);
    if (exerciseData.length === 0) return 0;
    return Math.round(exerciseData.reduce((sum, d) => sum + (d.exerciseMinutes || 0), 0) / exerciseData.length);
  },

  getWeightChange: (days = 7) => {
    const data = get().healthData;
    if (data.length < 2) return 0;
    const latestWeight = data[0].weight;
    const daysAgoData = data[Math.min(days - 1, data.length - 1)];
    if (latestWeight === undefined || daysAgoData.weight === undefined) return 0;
    return parseFloat((latestWeight - daysAgoData.weight).toFixed(1));
  },

  getBodyFatChange: (days = 7) => {
    const data = get().healthData;
    if (data.length < 2) return 0;
    const latestBodyFat = data[0].bodyFat;
    const daysAgoData = data[Math.min(days - 1, data.length - 1)];
    if (latestBodyFat === undefined || daysAgoData.bodyFat === undefined) return 0;
    return parseFloat((latestBodyFat - daysAgoData.bodyFat).toFixed(1));
  },

  getAINutritionAdvice: (): AINutritionAdvice => {
    const state = get();
    const nutrients = state.getTodayNutrients();
    const todayHealth = state.healthData[0];
    const avgSleep = state.getAverageSleep(7);
    const avgSteps = state.getAverageSteps(7);
    const avgExercise = state.getAverageExercise(7);
    const weightChange = state.getWeightChange(7);
    const bodyFatChange = state.getBodyFatChange(7);

    const suggestions: string[] = [];
    const warnings: string[] = [];
    let score = 70;

    const calorieRatio = nutrients.calories / state.calorieGoal;
    if (calorieRatio < 0.7) {
      warnings.push('今日热量摄入不足，可能影响基础代谢');
      score -= 10;
    } else if (calorieRatio > 1.1) {
      warnings.push('今日热量摄入超标，注意控制饮食');
      score -= 8;
    } else {
      suggestions.push('热量摄入控制良好，继续保持');
      score += 10;
    }

    const proteinRatio = nutrients.protein / state.proteinGoal;
    if (proteinRatio < 0.7) {
      warnings.push('蛋白质摄入不足，建议增加鸡蛋、鸡胸肉等高蛋白食物');
      score -= 8;
    } else if (proteinRatio >= 1) {
      suggestions.push('蛋白质摄入充足，有助于肌肉合成和脂肪燃烧');
      score += 10;
    } else {
      suggestions.push('蛋白质摄入尚可，可以适当增加');
    }

    if (avgSleep < 7) {
      warnings.push('近期睡眠不足，睡眠不足会影响减脂效果');
      score -= 5;
    } else {
      suggestions.push('睡眠质量良好，有助于身体恢复');
      score += 5;
    }

    if (avgSteps < 6000) {
      warnings.push('日均步数偏低，建议多走路增加日常消耗');
      score -= 5;
    } else if (avgSteps >= 8000) {
      suggestions.push('日常活动量充足，继续保持');
      score += 5;
    }

    if (avgExercise < 30) {
      suggestions.push('建议增加每周运动次数，每周至少3次力量训练');
    } else {
      suggestions.push('运动习惯很好，力量训练有助于增肌减脂');
      score += 5;
    }

    if (weightChange < 0) {
      suggestions.push(`近7天体重下降 ${Math.abs(weightChange)}kg，减重趋势良好`);
      score += 5;
    } else if (weightChange > 0.5) {
      warnings.push(`近7天体重上升 ${weightChange}kg，注意饮食控制`);
      score -= 5;
    }

    if (bodyFatChange < 0) {
      suggestions.push(`近7天体脂率下降 ${Math.abs(bodyFatChange)}%，体脂控制优秀`);
      score += 5;
    }

    if (nutrients.carbs > 150) {
      suggestions.push('可以适当减少精制碳水，增加全谷物和蔬菜');
    }

    if (nutrients.fat < 30) {
      suggestions.push('健康脂肪摄入不足，建议增加坚果、鱼油等优质脂肪');
    }

    suggestions.push('每天饮水 2000ml 以上，保持身体代谢正常');
    suggestions.push('晚餐建议在8点前完成，避免睡前进食');

    score = Math.max(0, Math.min(100, Math.round(score)));

    let overall = '';
    if (score >= 85) {
      overall = '你的健康管理做得非常棒！继续保持良好的饮食、运动和睡眠习惯。';
    } else if (score >= 70) {
      overall = '整体健康状况良好，在某些方面还有提升空间，继续加油！';
    } else if (score >= 55) {
      overall = '健康状况一般，建议关注饮食均衡和规律运动，逐步改善。';
    } else {
      overall = '健康状况需要重视，建议从调整饮食和作息开始，循序渐进改善。';
    }

    return {
      overall,
      suggestions: suggestions.slice(0, 6),
      warnings,
      score,
    };
  },

  updateSettings: (settings) => {
    set((state) => {
      const newState = { ...state, ...settings };
      if (settings.initialWeight !== undefined) {
        storage.set(STORAGE_KEY_INITIAL_WEIGHT, settings.initialWeight);
      }
      if (settings.targetWeight !== undefined) {
        storage.set(STORAGE_KEY_TARGET_WEIGHT, settings.targetWeight);
      }
      if (settings.targetBodyFat !== undefined) {
        storage.set(STORAGE_KEY_TARGET_BODY_FAT, settings.targetBodyFat);
      }
      if (settings.calorieGoal !== undefined) {
        storage.set(STORAGE_KEY_CALORIE_GOAL, settings.calorieGoal);
      }
      if (settings.proteinGoal !== undefined) {
        storage.set(STORAGE_KEY_PROTEIN_GOAL, settings.proteinGoal);
      }
      return newState;
    });
  },

  clearAllData: () => {
    storage.remove(STORAGE_KEY_DATA);
    storage.remove(STORAGE_KEY_MEALS);
    storage.remove(STORAGE_KEY_SUPPLEMENTS);
    storage.remove(STORAGE_KEY_GOALS);
    storage.remove(STORAGE_KEY_INITIAL_WEIGHT);
    storage.remove(STORAGE_KEY_TARGET_WEIGHT);
    storage.remove(STORAGE_KEY_BODY_FAT);
    storage.remove(STORAGE_KEY_MUSCLE);
    storage.remove(STORAGE_KEY_TARGET_BODY_FAT);
    storage.remove(STORAGE_KEY_CALORIE_GOAL);
    storage.remove(STORAGE_KEY_PROTEIN_GOAL);
    set({
      healthData: mockHealthData,
      meals: mockMealRecords,
      supplements: mockSupplements,
      goals: mockFitnessGoals,
      initialWeight: defaultInitialWeight,
      targetWeight: defaultTargetWeight,
      bodyFat: defaultBodyFat,
      muscleMass: defaultMuscleMass,
      targetBodyFat: defaultTargetBodyFat,
      calorieGoal: defaultCalorieGoal,
      proteinGoal: defaultProteinGoal,
    });
  },
}));
