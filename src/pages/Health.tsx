import { useState, useMemo } from 'react';
import {
  HeartPulse,
  Scale,
  Footprints,
  Moon,
  Droplets,
  Dumbbell,
  UtensilsCrossed,
  Pill,
  Target,
  TrendingDown,
  TrendingUp,
  Plus,
  Camera,
  Sparkles,
  Settings,
  X,
  Trash2,
  Edit3,
  Activity,
  Zap,
  ChartLine,
  Table,
  ChevronDown,
  ChevronUp,
  Flame,
  Beef,
  Cookie,
  Droplet,
  Award,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useHealthStore } from '../store/useHealthStore';
import { getTodayStr, formatDateShort } from '../utils/date';

type TabType = 'overview' | 'diet' | 'supplements' | 'goals' | 'history';

export default function Health() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const {
    healthData,
    meals,
    supplements,
    goals,
    getTodayMeals,
    getTodayTotalCalories,
    getTodayNutrients,
    toggleSupplement,
    addSupplement,
    deleteSupplement,
    deleteMeal,
    addMeal,
    updateTodayWeight,
    updateBodyComposition,
    getAverageSleep,
    getSleepQuality,
    getAverageSteps,
    getAverageExercise,
    getWeightChange,
    getBodyFatChange,
    addGoal,
    deleteGoal,
    bodyFat,
    muscleMass,
    initialWeight,
    targetWeight,
    targetBodyFat,
    calorieGoal,
    proteinGoal,
    clearAllData,
    updateSettings,
    getAINutritionAdvice,
  } = useHealthStore();

  const todayStr = getTodayStr();
  const [showSettings, setShowSettings] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAddSupplement, setShowAddSupplement] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditWeight, setShowEditWeight] = useState(false);
  const [showEditBody, setShowEditBody] = useState(false);
  const [showHistoryTable, setShowHistoryTable] = useState(false);

  const [newWeight, setNewWeight] = useState(55);
  const [newBodyFat, setNewBodyFat] = useState(24);
  const [newMuscleMass, setNewMuscleMass] = useState(40);

  const [settingsForm, setSettingsForm] = useState({
    initialWeight: initialWeight,
    targetWeight: targetWeight,
    targetBodyFat: targetBodyFat,
    calorieGoal: calorieGoal,
    proteinGoal: proteinGoal,
  });

  const [newMeal, setNewMeal] = useState({
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    name: '',
    calories: 300,
    protein: 15,
    carbs: 30,
    fat: 10,
  });

  const [newSupplement, setNewSupplement] = useState({
    name: '',
    dosage: '',
    time: '早餐后',
  });

  const [newGoal, setNewGoal] = useState({
    type: 'weight' as 'weight' | 'body-fat' | 'muscle',
    targetValue: 52,
    targetDate: '',
    unit: 'kg',
  });

  const tabs = [
    { id: 'overview', label: '健康概览', icon: HeartPulse },
    { id: 'diet', label: '饮食记录', icon: UtensilsCrossed },
    { id: 'supplements', label: '补剂周期', icon: Pill },
    { id: 'goals', label: '目标追踪', icon: Target },
    { id: 'history', label: '历史数据', icon: Table },
  ];

  const todayHealth = healthData.find((d) => d.date === todayStr);
  const todayMeals = getTodayMeals();
  const todayCalories = getTodayTotalCalories();
  const todayNutrients = getTodayNutrients();
  const aiAdvice = getAINutritionAdvice();

  const mealTypeLabels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };

  const weightData = useMemo(() => 
    healthData
      .slice()
      .reverse()
      .map((d) => ({
        date: formatDateShort(d.date),
        weight: d.weight,
        bodyFat: d.bodyFat,
      })),
    [healthData]
  );

  const stepsData = useMemo(() =>
    healthData
      .slice()
      .reverse()
      .map((d) => ({
        date: formatDateShort(d.date),
        steps: d.steps,
        exercise: d.exerciseMinutes,
      })),
    [healthData]
  );

  const sleepData = useMemo(() =>
    healthData
      .slice()
      .reverse()
      .map((d) => ({
        date: formatDateShort(d.date),
        sleep: d.sleepHours,
      })),
    [healthData]
  );

  const goalTypeLabels: Record<string, string> = {
    weight: '体重',
    'body-fat': '体脂率',
    muscle: '肌肉量',
  };

  const goalTypeUnits: Record<string, string> = {
    weight: 'kg',
    'body-fat': '%',
    muscle: 'kg',
  };

  const handleAddMeal = () => {
    if (!newMeal.name.trim()) return;
    addMeal({
      date: todayStr,
      mealType: newMeal.mealType,
      name: newMeal.name,
      calories: newMeal.calories,
      protein: newMeal.protein,
      carbs: newMeal.carbs,
      fat: newMeal.fat,
    });
    setNewMeal({ mealType: 'breakfast', name: '', calories: 300, protein: 15, carbs: 30, fat: 10 });
    setShowAddMeal(false);
  };

  const handleAddSupplement = () => {
    if (!newSupplement.name.trim()) return;
    addSupplement(newSupplement);
    setNewSupplement({ name: '', dosage: '', time: '早餐后' });
    setShowAddSupplement(false);
  };

  const handleAddGoal = () => {
    if (!newGoal.targetDate) return;
    addGoal(newGoal);
    setNewGoal({ type: 'weight', targetValue: 52, targetDate: '', unit: 'kg' });
    setShowAddGoal(false);
  };

  const avgSleep = getAverageSleep(7);
  const sleepQuality = getSleepQuality();
  const avgSteps = getAverageSteps(7);
  const avgExercise = getAverageExercise(7);
  const weightChange = getWeightChange(7);
  const bodyFatChange = getBodyFatChange(7);

  const sleepQualityColor = {
    '优秀': 'text-green-500',
    '良好': 'text-dream-blue-500',
    '一般': 'text-yellow-500',
    '不足': 'text-red-500',
  }[sleepQuality] || 'text-dream-blue-500';

  const handleUpdateWeight = () => {
    updateTodayWeight(newWeight);
    setShowEditWeight(false);
  };

  const handleUpdateBody = () => {
    updateBodyComposition(newBodyFat, newMuscleMass);
    setShowEditBody(false);
  };

  const handleOpenSettings = () => {
    setSettingsForm({
      initialWeight,
      targetWeight,
      targetBodyFat,
      calorieGoal,
      proteinGoal,
    });
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    updateSettings(settingsForm);
    setShowSettings(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-mint-400 to-green-500';
    if (score >= 70) return 'from-lavender-400 to-purple-500';
    if (score >= 55) return 'from-yellow-400 to-orange-500';
    return 'from-pink-400 to-rose-500';
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-soft-lg">
            <HeartPulse className="w-7 h-7 text-white icon-glow animate-pulse-soft" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold gradient-text">身体管理</h2>
            <p className="text-dream-blue-500 text-sm">今日已摄入 {todayCalories} 千卡 · 健康评分 {aiAdvice.score} 分</p>
          </div>
          <button
            onClick={handleOpenSettings}
            className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5 text-dream-blue-500" />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === tab.id
                    ? 'gradient-bg text-white shadow-soft-lg'
                    : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-1 cursor-pointer hover:shadow-soft-lg transition-all"
              onClick={() => {
                setNewWeight(todayHealth?.weight || 55);
                setShowEditWeight(true);
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                  <Scale className="w-6 h-6 text-red-500" />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${weightChange < 0 ? 'bg-green-100 text-green-600' : weightChange > 0 ? 'bg-red-100 text-red-600' : 'bg-dream-blue-100 text-dream-slate-600'}`}>
                  {weightChange > 0 ? '+' : ''}{weightChange}kg
                </div>
              </div>
              <p className="text-2xl font-display font-bold gradient-text">
                {todayHealth?.weight || '--'} kg
              </p>
              <p className="text-xs text-dream-blue-500 mt-1">当前体重 · 点击修改</p>
            </div>

            <div
              className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-2 cursor-pointer hover:shadow-soft-lg transition-all"
              onClick={() => {
                setNewBodyFat(bodyFat);
                setNewMuscleMass(muscleMass);
                setShowEditBody(true);
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-100 to-purple-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-dream-blue-500" />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${bodyFatChange < 0 ? 'bg-green-100 text-green-600' : bodyFatChange > 0 ? 'bg-red-100 text-red-600' : 'bg-dream-blue-100 text-dream-slate-600'}`}>
                  {bodyFatChange > 0 ? '+' : ''}{bodyFatChange}%
                </div>
              </div>
              <p className="text-2xl font-display font-bold gradient-text">
                {bodyFat}%
              </p>
              <p className="text-xs text-dream-blue-500 mt-1">体脂率 · 点击修改</p>
            </div>

            <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-3">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mint-100 to-green-100 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-600">
                  日均 {avgExercise}min
                </div>
              </div>
              <p className="text-2xl font-display font-bold gradient-text">
                {todayHealth?.exerciseMinutes || '--'} min
              </p>
              <p className="text-xs text-dream-blue-500 mt-1">运动时长</p>
            </div>

            <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-blue-500" />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${sleepQualityColor.replace('text-', 'bg-').replace('-500', '-100')} ${sleepQualityColor}`}>
                  {sleepQuality}
                </div>
              </div>
              <p className="text-2xl font-display font-bold gradient-text">
                {todayHealth?.sleepHours || '--'} h
              </p>
              <p className="text-xs text-dream-blue-500 mt-1">睡眠时长</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dream-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-dream-blue-500" />
                身体成分
              </h3>
              <button
                onClick={() => {
                  setNewBodyFat(bodyFat);
                  setNewMuscleMass(muscleMass);
                  setShowEditBody(true);
                }}
                className="text-sm text-dream-blue-500 hover:text-dream-blue-600 font-medium flex items-center gap-1"
              >
                <Edit3 className="w-4 h-4" />
                编辑
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                <p className="text-3xl font-display font-bold gradient-text">{bodyFat}%</p>
                <p className="text-xs text-dream-blue-500 mt-1">体脂率</p>
                <p className="text-xs text-red-500 mt-1">目标 {targetBodyFat}%</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-mint-50 to-green-50 rounded-2xl">
                <p className="text-3xl font-display font-bold gradient-text">{muscleMass}kg</p>
                <p className="text-xs text-dream-blue-500 mt-1">肌肉量</p>
                <p className="text-xs text-green-500 mt-1">骨骼肌</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-lavender-50 to-purple-50 rounded-2xl">
                <p className="text-3xl font-display font-bold gradient-text">{initialWeight}kg</p>
                <p className="text-xs text-dream-blue-500 mt-1">初始体重</p>
                <p className="text-xs text-dream-blue-500 mt-1">起始点</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl">
                <p className="text-3xl font-display font-bold gradient-text">{targetWeight}kg</p>
                <p className="text-xs text-dream-blue-500 mt-1">目标体重</p>
                <p className="text-xs text-orange-500 mt-1">
                  还差 {Math.max(0, (todayHealth?.weight || initialWeight) - targetWeight)}kg
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-5">
              <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                体重与体脂趋势
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F472B6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F472B6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FCE7F3" />
                    <XAxis dataKey="date" stroke="#F472B6" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#F472B6" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#A78BFA" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: '1px solid #FCE7F3',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      name="体重(kg)"
                      stroke="#F472B6"
                      strokeWidth={3}
                      dot={{ fill: '#F472B6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bodyFat"
                      name="体脂率(%)"
                      stroke="#A78BFA"
                      strokeWidth={3}
                      dot={{ fill: '#A78BFA', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-6">
              <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-500" />
                睡眠分析
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sleepData}>
                    <defs>
                      <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                    <XAxis dataKey="date" stroke="#818CF8" fontSize={12} />
                    <YAxis stroke="#818CF8" fontSize={12} domain={[0, 12]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: '1px solid #E0E7FF',
                        borderRadius: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sleep"
                      stroke="#818CF8"
                      strokeWidth={3}
                      fill="url(#sleepGradient)"
                      name="睡眠时长(h)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-dream-slate-700">近7天平均睡眠</p>
                  <p className="text-2xl font-display font-bold gradient-text">{avgSleep.toFixed(1)} 小时</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-dream-slate-700">睡眠质量</p>
                  <p className={`text-xl font-display font-bold ${sleepQualityColor}`}>{sleepQuality}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dream-slate-800">AI 营养师建议</h3>
                <p className="text-xs text-dream-blue-400">基于体重、体脂、睡眠、运动全维度分析</p>
              </div>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor(aiAdvice.score)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                {aiAdvice.score}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl mb-4">
              <p className="text-sm text-dream-slate-700 leading-relaxed font-medium">
                {aiAdvice.overall}
              </p>
            </div>
            {aiAdvice.warnings.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                需要注意
              </p>
                <div className="space-y-2">
                  {aiAdvice.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-dream-slate-600">
                      <span className="text-pink-400">⚠️</span>
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                建议
              </p>
              <div className="space-y-2">
                {aiAdvice.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-dream-slate-600">
                    <span className="text-mint-400">✅</span>
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'diet' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-dream-slate-800 font-display">今日饮食</h3>
                <p className="text-sm text-dream-blue-500">目标：{calorieGoal} 千卡 · 已摄入 {todayCalories} 千卡</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors">
                  <Camera className="w-4 h-4" />
                  拍照识别
                </button>
                <button
                  onClick={() => setShowAddMeal(true)}
                  className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  添加餐食
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dream-slate-600">今日热量摄入</span>
                <span className="text-sm font-medium text-dream-slate-700">{todayCalories} / {calorieGoal} kcal</span>
              </div>
              <div className="h-4 bg-dream-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((todayCalories / calorieGoal) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-red-50/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Beef className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-dream-blue-500">蛋白质</span>
                </div>
                <p className="text-lg font-bold gradient-text">{todayNutrients.protein}g</p>
                <p className="text-xs text-dream-blue-400">目标 {proteinGoal}g</p>
              </div>
              <div className="text-center p-3 bg-yellow-50/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Cookie className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-dream-blue-500">碳水</span>
                </div>
                <p className="text-lg font-bold gradient-text">{todayNutrients.carbs}g</p>
                <p className="text-xs text-dream-blue-400">糖类</p>
              </div>
              <div className="text-center p-3 bg-lavender-50/50 rounded-xl">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Droplet className="w-4 h-4 text-dream-blue-500" />
                  <span className="text-xs text-dream-blue-500">脂肪</span>
                </div>
                <p className="text-lg font-bold gradient-text">{todayNutrients.fat}g</p>
                <p className="text-xs text-dream-blue-400">脂质</p>
              </div>
            </div>

            <div className="space-y-4">
              {todayMeals.map((meal, index) => (
                <div
                  key={meal.id}
                  className={`flex items-center gap-4 p-4 bg-dream-blue-50/50 rounded-2xl animate-fade-in-up stagger-${index + 1} group`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-dream-slate-700">{meal.name}</span>
                      <span className="px-2 py-0.5 bg-dream-blue-100 text-dream-slate-600 rounded-full text-xs">
                        {mealTypeLabels[meal.mealType]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-dream-blue-500">
                      <span>🔥 {meal.calories} kcal</span>
                      <span>🥩 蛋白 {meal.protein}g</span>
                      <span>🍞 碳水 {meal.carbs}g</span>
                      <span>🥑 脂肪 {meal.fat}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('确定要删除这一餐吗？')) {
                        deleteMeal(meal.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAddMeal(true)}
              className="w-full mt-4 py-3 border-2 border-dashed border-dream-blue-200 rounded-xl text-dream-blue-400 hover:border-lavender-400 hover:text-dream-blue-500 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加餐食
            </button>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-dream-slate-800">AI 营养师建议</h3>
                <p className="text-xs text-dream-blue-400">基于今日数据智能分析</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <p className="text-sm text-dream-slate-700 leading-relaxed">
                {aiAdvice.overall}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'supplements' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dream-slate-800 flex items-center gap-2">
                <Pill className="w-5 h-5 text-dream-blue-500" />
                补剂记录
              </h3>
              <button
                onClick={() => setShowAddSupplement(true)}
                className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                添加补剂
              </button>
            </div>
            <div className="space-y-4">
              {supplements.map((supplement, index) => {
                const isTakenToday = supplement.takenDates.includes(todayStr);
                return (
                  <div
                    key={supplement.id}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 animate-fade-in-up stagger-${index + 1} group ${
                      isTakenToday
                        ? 'bg-gradient-to-r from-mint-50 to-green-50 border border-green-200'
                        : 'bg-dream-blue-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isTakenToday
                            ? 'bg-gradient-to-br from-mint-200 to-green-200'
                            : 'bg-gradient-to-br from-purple-100 to-lavender-100'
                        }`}
                      >
                        <Pill
                          className={`w-6 h-6 ${
                            isTakenToday ? 'text-green-600' : 'text-dream-blue-500'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-dream-slate-800">{supplement.name}</p>
                        <p className="text-sm text-dream-blue-500">
                          {supplement.dosage} · {supplement.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSupplement(supplement.id, todayStr)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isTakenToday
                            ? 'bg-green-100 text-green-600 hover:bg-mint-200'
                            : 'gradient-bg text-white hover:shadow-soft-lg'
                        }`}
                      >
                        {isTakenToday ? '✓ 已服用' : '标记服用'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定要删除这个补剂吗？')) {
                            deleteSupplement(supplement.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-2">
            <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              补剂小贴士
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50/50 rounded-xl">
                <p className="text-sm text-dream-slate-700">💡 维生素D建议早餐后服用，有助于钙的吸收</p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-xl">
                <p className="text-sm text-dream-slate-700">💡 鱼油建议晚餐后服用，减少肠胃不适</p>
              </div>
              <div className="p-3 bg-green-50/50 rounded-xl">
                <p className="text-sm text-dream-slate-700">💡 蛋白粉建议运动后30分钟内服用效果最佳</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-dream-slate-800 font-display flex items-center gap-2">
                <Target className="w-5 h-5 text-dream-blue-500" />
                身材目标
              </h3>
              <button
                onClick={() => setShowAddGoal(true)}
                className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                新增目标
              </button>
            </div>
            <div className="space-y-6">
              {goals.map((goal, index) => {
                const progress =
                  goal.type === 'muscle'
                    ? ((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100
                    : ((goal.startValue - goal.currentValue) / (goal.startValue - goal.targetValue)) * 100;
                return (
                  <div
                    key={goal.id}
                    className={`p-6 bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-2xl animate-fade-in-up stagger-${index + 1} group`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-dream-slate-800">
                          {goalTypeLabels[goal.type]}目标
                        </h4>
                        <p className="text-sm text-dream-blue-500">
                          {goal.startValue}{goal.unit} → {goal.targetValue}{goal.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-display font-bold gradient-text">
                            {goal.currentValue}{goal.unit}
                          </p>
                          <p className="text-xs text-green-600">
                            {goal.type === 'muscle'
                              ? `已增 ${(goal.currentValue - goal.startValue).toFixed(1)}${goal.unit}`
                              : `已减 ${(goal.startValue - goal.currentValue).toFixed(1)}${goal.unit}`}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('确定要删除这个目标吗？')) {
                              deleteGoal(goal.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-dream-blue-500">进度</span>
                        <span className="text-xs font-medium text-dream-slate-700">
                          {Math.round(Math.max(0, Math.min(100, progress)))}%
                        </span>
                      </div>
                      <div className="h-3 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-dream-blue-400">
                      <span>开始：{goal.startDate}</span>
                      <span>目标：{goal.targetDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-dream-slate-800 flex items-center gap-2">
                <ChartLine className="w-5 h-5 text-dream-blue-500" />
                运动与步数趋势
              </h3>
              <button
                onClick={() => setShowHistoryTable(!showHistoryTable)}
                className="flex items-center gap-2 px-3 py-1.5 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors"
              >
                <Table className="w-4 h-4" />
                {showHistoryTable ? '隐藏表格' : '显示表格'}
                {showHistoryTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stepsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                <XAxis dataKey="date" stroke="#A78BFA" fontSize={12} />
                <YAxis yAxisId="left" stroke="#A78BFA" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#34D399" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1px solid #E9D5FF',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="steps" name="步数" fill="#A78BFA" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="exercise" name="运动(min)" fill="#34D399" radius={[4, 4, 0, 0]} />
              </BarChart>
              </ResponsiveContainer>
            </div>

            {showHistoryTable && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dream-blue-100">
                      <th className="text-left py-3 px-2 text-dream-blue-500 font-medium">日期</th>
                      <th className="text-right py-3 px-2 text-dream-blue-500 font-medium">体重</th>
                      <th className="text-right py-3 px-2 text-dream-blue-500 font-medium">体脂率</th>
                      <th className="text-right py-3 px-2 text-dream-blue-500 font-medium">肌肉量</th>
                      <th className="text-right py-3 px-2 text-dream-blue-500 font-medium">步数</th>
                      <th className="text-right py-3 px-2 text-dream-blue-500 font-medium">运动</th>
                      <th className="text-right py-3 px-2 text-dream-blue-500 font-medium">睡眠</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthData.map((item, idx) => (
                      <tr key={item.date} className={`border-b border-purple-50 ${idx % 2 === 0 ? 'bg-dream-blue-50/30' : ''}`}>
                        <td className="py-3 px-2 text-dream-slate-700">{item.date}</td>
                        <td className="text-right py-3 px-2 text-dream-slate-700">{item.weight || '--'} kg</td>
                        <td className="text-right py-3 px-2 text-red-600">{item.bodyFat || '--'}%</td>
                        <td className="text-right py-3 px-2 text-green-600">{item.muscleMass || '--'} kg</td>
                        <td className="text-right py-3 px-2 text-dream-slate-700">{item.steps?.toLocaleString() || '--'}</td>
                        <td className="text-right py-3 px-2 text-dream-slate-700">{item.exerciseMinutes || 0} min</td>
                        <td className="text-right py-3 px-2 text-blue-600">{item.sleepHours || '--'} h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-3">
                <Scale className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-dream-blue-500 mb-1">近7天体重变化</p>
              <p className={`text-2xl font-display font-bold ${weightChange < 0 ? 'text-green-500' : weightChange > 0 ? 'text-red-500' : 'text-dream-blue-500'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange} kg
              </p>
            </div>
            <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-100 to-purple-100 flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-dream-blue-500" />
              </div>
              <p className="text-sm text-dream-blue-500 mb-1">近7天体脂变化</p>
              <p className={`text-2xl font-display font-bold ${bodyFatChange < 0 ? 'text-green-500' : bodyFatChange > 0 ? 'text-red-500' : 'text-dream-blue-500'}`}>
                {bodyFatChange > 0 ? '+' : ''}{bodyFatChange}%
              </p>
            </div>
            <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mint-100 to-green-100 flex items-center justify-center mb-3">
                <Footprints className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm text-dream-blue-500 mb-1">近7天日均步数</p>
              <p className="text-2xl font-display font-bold gradient-text">
                {avgSteps.toLocaleString()}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-3">
                <Flame className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm text-dream-blue-500 mb-1">近7天日均运动</p>
              <p className="text-2xl font-display font-bold gradient-text">
                {avgExercise} min
              </p>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div className="glass-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-dream-slate-800 text-lg">健康设置</h3>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">初始体重 (kg)</label>
                  <input
                    type="number"
                    value={settingsForm.initialWeight}
                    onChange={(e) => setSettingsForm({ ...settingsForm, initialWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">目标体重 (kg)</label>
                  <input
                    type="number"
                    value={settingsForm.targetWeight}
                    onChange={(e) => setSettingsForm({ ...settingsForm, targetWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">目标体脂率 (%)</label>
                  <input
                    type="number"
                    value={settingsForm.targetBodyFat}
                    onChange={(e) => setSettingsForm({ ...settingsForm, targetBodyFat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">热量目标 (kcal)</label>
                  <input
                    type="number"
                    value={settingsForm.calorieGoal}
                    onChange={(e) => setSettingsForm({ ...settingsForm, calorieGoal: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">蛋白质目标 (g)</label>
                <input
                  type="number"
                  value={settingsForm.proteinGoal}
                  onChange={(e) => setSettingsForm({ ...settingsForm, proteinGoal: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium"
                >
                  保存
                </button>
              </div>
              <div className="pt-4 border-t border-dream-blue-100/50">
                <p className="text-sm font-medium text-dream-slate-700 mb-3">数据管理</p>
                <button
                  onClick={() => {
                    if (confirm('确定要清空所有健康数据吗？此操作不可恢复。')) {
                      clearAllData();
                      setShowSettings(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清空所有数据
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddMeal(false)}>
          <div className="glass-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">添加餐食</h3>
              <button onClick={() => setShowAddMeal(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">餐次</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewMeal({ ...newMeal, mealType: type })}
                      className={`py-2 text-sm rounded-xl transition-all ${newMeal.mealType === type
                          ? 'gradient-bg text-white'
                          : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                        }`}
                    >
                      {mealTypeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">食物名称 *</label>
                <input
                  type="text"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  placeholder="例如：鸡胸肉沙拉"
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">热量 (kcal)</label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">蛋白质 (g)</label>
                  <input
                    type="number"
                    value={newMeal.protein}
                    onChange={(e) => setNewMeal({ ...newMeal, protein: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">碳水 (g)</label>
                  <input
                    type="number"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal({ ...newMeal, carbs: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">脂肪 (g)</label>
                  <input
                    type="number"
                    value={newMeal.fat}
                    onChange={(e) => setNewMeal({ ...newMeal, fat: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddMeal(false)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddMeal}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddSupplement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddSupplement(false)}>
          <div className="glass-card rounded-3xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">添加补剂</h3>
              <button onClick={() => setShowAddSupplement(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">名称 *</label>
                <input
                  type="text"
                  value={newSupplement.name}
                  onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                  placeholder="例如：维生素D"
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">剂量</label>
                <input
                  type="text"
                  value={newSupplement.dosage}
                  onChange={(e) => setNewSupplement({ ...newSupplement, dosage: e.target.value })}
                  placeholder="例如：1000IU"
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">服用时间</label>
                <input
                  type="text"
                  value={newSupplement.time}
                  onChange={(e) => setNewSupplement({ ...newSupplement, time: e.target.value })}
                  placeholder="例如：早餐后"
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddSupplement(false)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddSupplement}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddGoal(false)}>
          <div className="glass-card rounded-3xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">新增目标</h3>
              <button onClick={() => setShowAddGoal(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">目标类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['weight', 'body-fat', 'muscle'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setNewGoal({
                          ...newGoal,
                          type,
                          unit: goalTypeUnits[type],
                        })
                      }
                      className={`py-2 text-sm rounded-xl transition-all ${newGoal.type === type
                          ? 'gradient-bg text-white'
                          : 'bg-dream-blue-50 text-dream-blue-500 hover:bg-dream-blue-100'
                        }`}
                    >
                      {goalTypeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">目标值 ({newGoal.unit})</label>
                <input
                  type="number"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">目标日期</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddGoal}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditWeight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditWeight(false)}>
          <div className="glass-card rounded-3xl w-full max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">记录体重</h3>
              <button onClick={() => setShowEditWeight(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">今日体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-lg text-center font-display font-bold"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditWeight(false)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateWeight}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditBody && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditBody(false)}>
          <div className="glass-card rounded-3xl w-full max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">身体成分</h3>
              <button onClick={() => setShowEditBody(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">体脂率 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newBodyFat}
                  onChange={(e) => setNewBodyFat(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">肌肉量 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newMuscleMass}
                  onChange={(e) => setNewMuscleMass(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditBody(false)}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateBody}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium"
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
