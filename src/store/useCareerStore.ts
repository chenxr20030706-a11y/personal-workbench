import { create } from 'zustand';
import type { JobPosition, InterviewExperience } from '../types';
import { mockJobPositions, mockInterviewExperiences } from '../data/mockData';
import { storage } from '../utils/storage';
import { generateId } from '../utils/date';

interface CareerState {
  positions: JobPosition[];
  experiences: InterviewExperience[];
  addPosition: (position: Omit<JobPosition, 'id'>) => void;
  updatePosition: (id: string, position: Partial<JobPosition>) => void;
  updatePositionStatus: (id: string, status: JobPosition['status']) => void;
  deletePosition: (id: string) => void;
  addExperience: (experience: Omit<InterviewExperience, 'id'>) => void;
  deleteExperience: (id: string) => void;
  getStats: () => { total: number; interested: number; applied: number; interview: number; offer: number; rejected: number };
  getAIAdvice: () => string[];
  clearAllData: () => void;
}

const STORAGE_KEY_POSITIONS = 'career-positions';
const STORAGE_KEY_EXPERIENCES = 'career-experiences';

export const useCareerStore = create<CareerState>((set, get) => ({
  positions: storage.get<JobPosition[]>(STORAGE_KEY_POSITIONS, mockJobPositions),
  experiences: storage.get<InterviewExperience[]>(STORAGE_KEY_EXPERIENCES, mockInterviewExperiences),

  addPosition: (position) => {
    const newPosition: JobPosition = {
      ...position,
      id: generateId(),
    };
    set((state) => {
      const positions = [newPosition, ...state.positions];
      storage.set(STORAGE_KEY_POSITIONS, positions);
      return { positions };
    });
  },

  updatePosition: (id, position) => {
    set((state) => {
      const positions = state.positions.map((p) =>
        p.id === id ? { ...p, ...position } : p
      );
      storage.set(STORAGE_KEY_POSITIONS, positions);
      return { positions };
    });
  },

  updatePositionStatus: (id, status) => {
    set((state) => {
      const positions = state.positions.map((p) =>
        p.id === id ? { ...p, status } : p
      );
      storage.set(STORAGE_KEY_POSITIONS, positions);
      return { positions };
    });
  },

  deletePosition: (id) => {
    set((state) => {
      const positions = state.positions.filter((p) => p.id !== id);
      storage.set(STORAGE_KEY_POSITIONS, positions);
      return { positions };
    });
  },

  addExperience: (experience) => {
    const newExperience: InterviewExperience = {
      ...experience,
      id: generateId(),
    };
    set((state) => {
      const experiences = [newExperience, ...state.experiences];
      storage.set(STORAGE_KEY_EXPERIENCES, experiences);
      return { experiences };
    });
  },

  deleteExperience: (id) => {
    set((state) => {
      const experiences = state.experiences.filter((e) => e.id !== id);
      storage.set(STORAGE_KEY_EXPERIENCES, experiences);
      return { experiences };
    });
  },

  getStats: () => {
    const positions = get().positions;
    return {
      total: positions.length,
      interested: positions.filter((p) => p.status === 'interested').length,
      applied: positions.filter((p) => p.status === 'applied').length,
      interview: positions.filter((p) => p.status === 'interview').length,
      offer: positions.filter((p) => p.status === 'offer').length,
      rejected: positions.filter((p) => p.status === 'rejected').length,
    };
  },

  getAIAdvice: () => {
    const { positions, experiences } = get();
    const stats = get().getStats();
    const advice: string[] = [];

    if (stats.total === 0) {
      advice.push('🎯 开始添加你的第一个岗位，建立求职追踪清单');
      advice.push('📝 建议先从感兴趣的岗位开始记录，逐步完善投递计划');
      advice.push('💡 可以按照公司、职位、地点等维度整理岗位信息');
      return advice;
    }

    const offerRate = stats.total > 0 ? (stats.offer / stats.total) * 100 : 0;
    const interviewRate = stats.applied > 0 ? (stats.interview / stats.applied) * 100 : 0;
    const rejectionRate = stats.applied > 0 ? (stats.rejected / stats.applied) * 100 : 0;

    if (stats.interested > stats.applied * 2) {
      advice.push('🚀 你收藏了很多感兴趣的岗位，建议加快投递节奏，每周投递 3-5 个');
    }

    if (stats.applied > 0 && interviewRate < 20) {
      advice.push('📄 简历可能需要优化，建议针对不同岗位定制简历内容');
      advice.push('🔍 投递前仔细阅读岗位要求，确保经验匹配度较高');
    }

    if (stats.interview > 0 && offerRate < 10) {
      advice.push('💪 面试通过率有提升空间，建议多刷算法题和专业基础知识');
      advice.push('🎤 可以找朋友进行模拟面试，练习表达和应变能力');
    }

    if (experiences.length === 0 && stats.interview > 0) {
      advice.push('📝 建议每次面试后及时记录面试问题和经验总结');
      advice.push('🔄 定期复盘面试经验，找出薄弱环节针对性提升');
    }

    if (experiences.length > 0) {
      const allTags = experiences.flatMap((e) => e.tags);
      const tagCount: Record<string, number> = {};
      allTags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
      const topTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([tag]) => tag);
      if (topTags.length > 0) {
        advice.push(`📊 你的面试主要集中在${topTags.join('、')}方向，继续深耕这些领域`);
      }
    }

    const categories = [...new Set(positions.map((p) => p.category))];
    if (categories.length > 0) {
      const topCategory = categories.reduce((a, b) =>
        positions.filter((p) => p.category === a).length >=
        positions.filter((p) => p.category === b).length
          ? a
          : b
      );
      advice.push(`🎯 重点关注${topCategory}类岗位，你的经验匹配度较高`);
    }

    if (rejectionRate > 50) {
      advice.push('💡 拒绝率较高，建议调整投递策略，选择更匹配的岗位');
      advice.push('📈 可以考虑降低目标公司层级，先积累面试经验');
    }

    if (stats.offer > 0) {
      advice.push('🎉 恭喜拿到 Offer！可以对比各方面因素做出最佳选择');
      advice.push('💰 谈薪时可以综合考虑薪资、成长、平台、团队等因素');
    }

    if (advice.length < 4) {
      advice.push('✅ 继续保持当前的求职节奏，稳扎稳打');
      advice.push('📚 利用碎片时间学习新知识，保持竞争力');
      advice.push('🤝 多拓展人脉，内推往往比海投效率更高');
    }

    return advice.slice(0, 6);
  },

  clearAllData: () => {
    storage.remove(STORAGE_KEY_POSITIONS);
    storage.remove(STORAGE_KEY_EXPERIENCES);
    set({
      positions: mockJobPositions,
      experiences: mockInterviewExperiences,
    });
  },
}));
