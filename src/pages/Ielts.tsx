import { useState } from 'react';
import {
  Languages,
  Headphones,
  Mic,
  BookOpen,
  PenTool,
  BookMarked,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Plus,
  Settings,
  X,
  Trash2,
  Edit3,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  History,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useIeltsStore } from '../store/useIeltsStore';
import { formatDate } from '../utils/date';

export default function Ielts() {
  const {
    modules,
    studyRecords,
    checkInRecords,
    hasCheckedInToday,
    checkIn,
    uncheckIn,
    getCheckInRecord,
    overallTargetScore,
    examDate,
    updateOverallTarget,
    updateExamDate,
    updateModuleScore,
    addStudyRecord,
    deleteStudyRecord,
    clearAllData,
  } = useIeltsStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [animatingModule, setAnimatingModule] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [calendarAnimatingDate, setCalendarAnimatingDate] = useState<string | null>(null);
  const isCheckedIn = hasCheckedInToday();

  const [newRecord, setNewRecord] = useState({
    module: 'listening',
    duration: 30,
    content: '',
  });

  const [editScores, setEditScores] = useState({
    currentScore: 0,
    targetScore: 0,
  });

  const moduleIcons: Record<string, typeof Headphones> = {
    listening: Headphones,
    speaking: Mic,
    reading: BookOpen,
    writing: PenTool,
    vocabulary: BookMarked,
  };

  const moduleColors: Record<string, string> = {
    listening: 'from-blue-400 to-purple-400',
    speaking: 'from-pink-400 to-rose-400',
    reading: 'from-green-400 to-teal-400',
    writing: 'from-orange-400 to-yellow-400',
    vocabulary: 'from-purple-400 to-indigo-400',
  };

  const moduleBgColors: Record<string, string> = {
    listening: 'bg-blue-400',
    speaking: 'bg-pink-400',
    reading: 'bg-green-400',
    writing: 'bg-orange-400',
    vocabulary: 'bg-purple-400',
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = getCheckInRecord(todayStr);
  const todayCheckedModules = todayRecord?.modules || [];

  const streakDays = () => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const record = checkInRecords.find((r) => r.date === dateStr);
      if (record?.completed) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayRecords = studyRecords.filter((r) => r.date === dateStr);
    const totalMinutes = dayRecords.reduce((sum, r) => sum + r.duration, 0);
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    weeklyData.push({
      day: dayNames[date.getDay()],
      minutes: totalMinutes,
    });
  }

  const totalHours = Math.round(
    studyRecords.reduce((sum, r) => sum + r.duration, 0) / 60
  );

  const currentOverallScore =
    modules.reduce((sum, m) => sum + m.currentScore, 0) / modules.length;

  const handleModuleClick = (moduleId: string) => {
    setAnimatingModule(moduleId);
    setTimeout(() => setAnimatingModule(null), 600);

    const isModuleChecked = todayCheckedModules.includes(moduleId);
    let newModules: string[];

    if (isModuleChecked) {
      newModules = todayCheckedModules.filter((m) => m !== moduleId);
    } else {
      newModules = [...todayCheckedModules, moduleId];
    }

    if (newModules.length > 0) {
      checkIn(newModules);
      if (!isCheckedIn) {
        triggerConfetti();
      }
    } else {
      uncheckIn();
    }
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const calendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const record = checkInRecords.find((r) => r.date === dateStr);
      days.push({
        date: dateStr,
        day: date.getDate(),
        completed: record?.completed || false,
        isToday: i === 0,
        modules: record?.modules || [],
      });
    }
    return days;
  };

  const handleCalendarClick = (date: string) => {
    const record = getCheckInRecord(date);
    const isCompleted = record?.completed || false;

    setCalendarAnimatingDate(date);
    setTimeout(() => setCalendarAnimatingDate(null), 600);

    if (isCompleted) {
      uncheckIn(date);
    } else {
      const defaultModules = modules.map((m) => m.id);
      checkIn(defaultModules, date);
      triggerConfetti();
    }
  };

  const handleAddRecord = () => {
    if (!newRecord.content.trim()) return;
    addStudyRecord({
      date: new Date().toISOString().split('T')[0],
      module: newRecord.module,
      duration: newRecord.duration,
      content: newRecord.content,
    });
    setNewRecord({ module: 'listening', duration: 30, content: '' });
    setShowAddRecord(false);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('确定要删除这条学习记录吗？')) {
      deleteStudyRecord(id);
    }
  };

  const startEditModule = (mod: typeof modules[0]) => {
    setEditScores({
      currentScore: mod.currentScore,
      targetScore: mod.targetScore,
    });
    setEditingModule(mod.id);
  };

  const saveModuleScore = () => {
    if (editingModule) {
      updateModuleScore(editingModule, editScores.currentScore, editScores.targetScore);
      setEditingModule(null);
    }
  };

  const daysUntilExam = () => {
    if (!examDate) return null;
    const today = new Date();
    const exam = new Date(examDate);
    const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const studyMethods = [
    { title: '听力', tips: ['精听练习：每天1篇，逐句听写', '泛听磨耳朵：吃饭、通勤时听BBC', '场景词汇积累：按话题分类记忆', '跟读模仿：提高发音和语感'] },
    { title: '口语', tips: ['Part 1题库练习：每天5个话题', 'Part 2素材积累：准备20个万能故事', 'Part 3逻辑训练：使用结构化回答', '录音回听：发现自己的问题'] },
    { title: '阅读', tips: ['平行阅读法：提高做题速度', '同义替换积累：高频考点词', '长难句分析：理解复杂句型', '计时训练：严格控制时间'] },
    { title: '写作', tips: ['小作文模板：各类图表都要练', '大作文结构：开头+主体+结尾', '观点库积累：按话题分类', '真题练习：每周至少2篇'] },
    { title: '单词', tips: ['艾宾浩斯记忆法：科学复习', '词根词缀：举一反三', '语境记忆：在阅读中记单词', '口语输出：用新词造句子'] },
  ];

  const groupedRecords = studyRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, typeof studyRecords>);

  const sortedDates = Object.keys(groupedRecords).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  const confettiColors = ['#A855F7', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  const Confetti = () => {
    const pieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      size: Math.random() * 8 + 6,
      duration: Math.random() * 1 + 1.5,
    }));

    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className="confetti-piece rounded-sm"
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {showConfetti && <Confetti />}

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-soft-lg">
            <Languages className="w-7 h-7 text-white icon-glow" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold gradient-text">雅思学习</h2>
            <p className="text-dream-blue-500 text-sm">
              目标分 {overallTargetScore} · 已连续打卡 {streakDays()} 天
              {examDate && ` · 考试还有 ${daysUntilExam()} 天`}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors active:scale-95"
          >
            <Settings className="w-5 h-5 text-dream-blue-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl text-center">
            <Target className="w-6 h-6 text-dream-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-display font-bold gradient-text">{overallTargetScore}</p>
            <p className="text-xs text-dream-blue-500">目标分数</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl text-center">
            <TrendingUp className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-display font-bold gradient-text">{currentOverallScore.toFixed(1)}</p>
            <p className="text-xs text-dream-blue-500">当前水平</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-mint-50 to-green-50 rounded-2xl text-center">
            <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-display font-bold gradient-text">{totalHours}h</p>
            <p className="text-xs text-dream-blue-500">累计学习</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-lavender-50 to-purple-50 rounded-2xl text-center">
            <Calendar className="w-6 h-6 text-dream-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-display font-bold gradient-text">{streakDays()}</p>
            <p className="text-xs text-dream-blue-500">连续打卡</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dream-slate-800 font-display">今日打卡</h3>
          {isCheckedIn && (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium animate-check-in">
              <CheckCircle2 className="w-4 h-4" />
              今日已打卡
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {modules.map((mod, index) => {
            const Icon = moduleIcons[mod.id];
            const isChecked = todayCheckedModules.includes(mod.id);
            const isAnimating = animatingModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleModuleClick(mod.id)}
                className={`p-4 rounded-2xl transition-all duration-300 relative overflow-hidden animate-fade-in-up stagger-${index + 1} ${
                  isChecked
                    ? `bg-gradient-to-br ${moduleColors[mod.id]} text-white shadow-soft-lg`
                    : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100 hover:shadow-soft'
                } hover:scale-105 active:scale-95 cursor-pointer`}
              >
                {isAnimating && (
                  <div
                    className={`pulse-ring ${isChecked ? 'bg-white/30' : 'bg-purple-300/30'}`}
                  />
                )}
                <Icon className={`w-8 h-8 mx-auto mb-2 transition-all duration-300 ${
                  isAnimating ? 'animate-check-in' : ''
                }`} />
                <p className="font-medium text-sm">{mod.name}</p>
                <p className="text-xs mt-1 opacity-75">{mod.totalHours}h</p>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (isCheckedIn) {
                uncheckIn();
              } else {
                const allModules = modules.map((m) => m.id);
                checkIn(allModules);
                triggerConfetti();
              }
            }}
            className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 active:scale-98 ${
              isCheckedIn
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'gradient-btn text-white'
            }`}
          >
            {isCheckedIn ? '取消今日打卡' : '一键打卡全部'}
          </button>
          <button
            onClick={() => setShowAddRecord(true)}
            className="px-6 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl font-medium hover:bg-dream-blue-200 transition-colors flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            添加记录
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-2">
          <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-dream-blue-500" />
            本周学习时长
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
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
                <Bar dataKey="minutes" fill="url(#ieltsGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="ieltsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#E9D5FF" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-3">
          <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            分数进度
          </h3>
          <div className="space-y-4">
            {modules.map((mod) => {
              const progress = (mod.currentScore / mod.targetScore) * 100;
              return (
                <div key={mod.id} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-dream-slate-700 font-medium">{mod.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-dream-blue-500">
                        {mod.currentScore} / {mod.targetScore}
                      </span>
                      <button
                        onClick={() => startEditModule(mod)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dream-blue-100 rounded transition-all active:scale-90"
                      >
                        <Edit3 className="w-3 h-3 text-dream-blue-400" />
                      </button>
                    </div>
                  </div>
                  <div className="h-3 bg-dream-blue-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${moduleColors[mod.id]} rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-4">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          学习方法
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {studyMethods.map((method, index) => {
            const Icon = moduleIcons[method.title === '单词' ? 'vocabulary' : method.title === '听力' ? 'listening' : method.title === '口语' ? 'speaking' : method.title === '阅读' ? 'reading' : 'writing'];
            const colorKeys = ['listening', 'speaking', 'reading', 'writing', 'vocabulary'];
            return (
              <div
                key={method.title}
                className={`p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl animate-fade-in-up stagger-${index + 1}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${moduleColors[colorKeys[index]]} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-medium text-dream-slate-700 text-sm">{method.title}</p>
                </div>
                <ul className="space-y-1">
                  {method.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-dream-blue-500 flex items-start gap-1">
                      <span className="text-lavender-400 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-5">
        <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-dream-blue-500" />
          打卡日历
          <span className="text-xs font-normal text-dream-blue-400 ml-2">点击日期可补卡/取消补卡</span>
        </h3>
        <div className="grid grid-cols-10 gap-2">
          {calendarDays().map((day) => (
            <button
              key={day.date}
              onClick={() => handleCalendarClick(day.date)}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-300 calendar-day-hover relative ${
                day.completed
                  ? 'gradient-bg text-white shadow-soft'
                  : day.isToday
                    ? 'bg-dream-blue-100 text-dream-slate-600 ring-2 ring-dream-blue-400'
                    : 'bg-dream-blue-50/50 text-dream-blue-400 hover:bg-dream-blue-100'
              } ${calendarAnimatingDate === day.date ? 'animate-check-in' : ''}`}
              title={day.isToday ? '今天' : `点击${day.completed ? '取消' : '补'}打卡 - ${formatDate(day.date)}`}
            >
              {day.day}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-dream-blue-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded gradient-bg" />
            已打卡
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-dream-blue-100 ring-2 ring-dream-blue-400" />
            今天
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-dream-blue-50/50" />
            未打卡
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="font-semibold text-dream-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-dream-blue-500" />
            学习记录
            <span className="text-xs font-normal text-dream-blue-400">({studyRecords.length} 条)</span>
          </h3>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-dream-blue-400 transition-transform" />
          ) : (
            <ChevronDown className="w-5 h-5 text-dream-blue-400 transition-transform" />
          )}
        </button>

        {showHistory && (
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin pr-2">
            {sortedDates.length === 0 ? (
              <div className="text-center py-8 text-dream-blue-400 text-sm">
                暂无学习记录
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="animate-slide-in-right">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${moduleBgColors[groupedRecords[date][0]?.module] || 'bg-purple-400'}`} />
                    <span className="text-sm font-medium text-dream-slate-700">
                      {formatDate(date)}
                    </span>
                    <span className="text-xs text-dream-blue-400">
                      {groupedRecords[date].length} 条记录
                    </span>
                  </div>
                  <div className="space-y-2 ml-4 pl-4 border-l-2 border-dream-blue-100">
                    {groupedRecords[date].map((record) => {
                      const Icon = moduleIcons[record.module] || BookOpen;
                      const moduleName = modules.find((m) => m.id === record.module)?.name || record.module;
                      return (
                        <div
                          key={record.id}
                          className="group p-3 bg-dream-blue-50/50 rounded-xl hover:bg-dream-blue-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${moduleColors[record.module] || 'from-purple-400 to-indigo-400'} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-dream-slate-700">
                                  {moduleName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-dream-blue-500">
                                    {record.duration} 分钟
                                  </span>
                                  <button
                                    onClick={() => handleDeleteRecord(record.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all active:scale-90"
                                    title="删除记录"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-dream-blue-500 mt-1 line-clamp-2">
                                {record.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div className="glass-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in scrollbar-thin" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-dream-slate-800 text-lg">雅思设置</h3>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors active:scale-95">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">目标总分</label>
                <div className="grid grid-cols-5 gap-2">
                  {[6, 6.5, 7, 7.5, 8].map((score) => (
                    <button
                      key={score}
                      onClick={() => updateOverallTarget(score)}
                      className={`py-2 text-sm rounded-xl transition-all active:scale-95 ${overallTargetScore === score
                          ? 'gradient-bg text-white shadow-soft'
                          : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                        }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">考试日期</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => updateExamDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                />
              </div>
              <div className="pt-4 border-t border-dream-blue-100/50">
                <p className="text-sm font-medium text-dream-slate-700 mb-3">数据管理</p>
                <button
                  onClick={() => {
                    if (confirm('确定要清空所有雅思数据吗？此操作不可恢复。')) {
                      clearAllData();
                      setShowSettings(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors active:scale-98"
                >
                  <Trash2 className="w-4 h-4" />
                  清空所有数据
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddRecord(false)}>
          <div className="glass-card rounded-3xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">添加学习记录</h3>
              <button onClick={() => setShowAddRecord(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors active:scale-95">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">学习模块</label>
                <div className="grid grid-cols-5 gap-2">
                  {modules.map((mod) => {
                    const Icon = moduleIcons[mod.id];
                    return (
                      <button
                        key={mod.id}
                        onClick={() => setNewRecord({ ...newRecord, module: mod.id })}
                        className={`p-2 rounded-xl transition-all active:scale-95 ${newRecord.module === mod.id
                            ? `bg-gradient-to-br ${moduleColors[mod.id]} text-white shadow-soft`
                            : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                          }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <p className="text-xs">{mod.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">学习时长（分钟）</label>
                <input
                  type="number"
                  value={newRecord.duration}
                  onChange={(e) => setNewRecord({ ...newRecord, duration: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">学习内容</label>
                <textarea
                  value={newRecord.content}
                  onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
                  placeholder="今天学了什么..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddRecord(false)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors active:scale-98"
                >
                  取消
                </button>
                <button
                  onClick={handleAddRecord}
                  disabled={!newRecord.content.trim()}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    newRecord.content.trim()
                      ? 'gradient-btn text-white active:scale-98'
                      : 'bg-dream-blue-100 text-dream-blue-400 cursor-not-allowed'
                  }`}
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingModule(null)}>
          <div className="glass-card rounded-3xl w-full max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">编辑分数</h3>
              <button onClick={() => setEditingModule(null)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors active:scale-95">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">当前分数</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={editScores.currentScore}
                  onChange={(e) => setEditScores({ ...editScores, currentScore: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">目标分数</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={editScores.targetScore}
                  onChange={(e) => setEditScores({ ...editScores, targetScore: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingModule(null)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors active:scale-98"
                >
                  取消
                </button>
                <button
                  onClick={saveModuleScore}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium active:scale-98"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
