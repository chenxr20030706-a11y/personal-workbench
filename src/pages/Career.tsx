import { useState, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Plus,
  Clock,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Send,
  XCircle,
  AlertCircle,
  Settings,
  X,
  Trash2,
  TrendingUp,
  Target,
  Sparkles,
  BarChart3,
  Link as LinkIcon,
  Edit3,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useCareerStore } from '../store/useCareerStore';
import { getTodayStr } from '../utils/date';

type StatusType = 'interested' | 'applied' | 'interview' | 'offer' | 'rejected';

export default function Career() {
  const {
    positions,
    experiences,
    addPosition,
    updatePosition,
    updatePositionStatus,
    deletePosition,
    addExperience,
    deleteExperience,
    getStats,
    getAIAdvice,
    clearAllData,
  } = useCareerStore();

  const [activeTab, setActiveTab] = useState<'positions' | 'experiences' | 'analysis'>('positions');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const [expandedExperience, setExpandedExperience] = useState<string | null>(null);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  const [newPosition, setNewPosition] = useState({
    company: '',
    position: '',
    link: '',
    status: 'interested' as StatusType,
    postedDate: '',
    category: '科研/技术',
    interviewDate: '',
    notes: '',
    salary: '',
    location: '',
  });

  const [newExperience, setNewExperience] = useState({
    company: '',
    date: '',
    round: '',
    questions: '',
    summary: '',
    tags: [] as string[],
    tagInput: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const statusConfig: Record<StatusType, { label: string; color: string; bgColor: string; icon: typeof Send }> = {
    interested: { label: '感兴趣', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: AlertCircle },
    applied: { label: '已投递', color: 'text-dream-blue-600', bgColor: 'bg-dream-blue-100', icon: Send },
    interview: { label: '面试中', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Calendar },
    offer: { label: '已offer', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle2 },
    rejected: { label: '已拒绝', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
  };

  const filteredPositions = useMemo(() => {
    return statusFilter === 'all'
      ? positions
      : positions.filter((p) => p.status === statusFilter);
  }, [positions, statusFilter]);

  const selectedPos = selectedPosition
    ? positions.find((p) => p.id === selectedPosition)
    : null;

  const stats = useMemo(() => getStats(), [getStats]);
  const aiAdvice = useMemo(() => getAIAdvice(), [getAIAdvice]);

  const pieData = useMemo(() => [
    { name: '感兴趣', value: stats.interested, color: '#3B82F6' },
    { name: '已投递', value: stats.applied, color: '#8B5CF6' },
    { name: '面试中', value: stats.interview, color: '#EAB308' },
    { name: 'Offer', value: stats.offer, color: '#10B981' },
    { name: '已拒绝', value: stats.rejected, color: '#EC4899' },
  ].filter((d) => d.value > 0), [stats]);

  const categories = useMemo(() => [...new Set(positions.map((p) => p.category))], [positions]);
  const categoryData = useMemo(() => categories.map((cat) => ({
    name: cat,
    count: positions.filter((p) => p.category === cat).length,
  })), [categories, positions]);

  const validatePositionForm = () => {
    const errors: Record<string, string> = {};
    if (!newPosition.company.trim()) {
      errors.company = '请输入公司名称';
    }
    if (!newPosition.position.trim()) {
      errors.position = '请输入职位名称';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateExperienceForm = () => {
    const errors: Record<string, string> = {};
    if (!newExperience.company.trim()) {
      errors.company = '请输入公司名称';
    }
    if (!newExperience.questions.trim()) {
      errors.questions = '请输入面试问题';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPosition = async () => {
    if (!validatePositionForm()) return;
    
    setIsAddingPosition(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    addPosition({
      ...newPosition,
      postedDate: newPosition.postedDate || getTodayStr(),
    });
    setNewPosition({
      company: '',
      position: '',
      link: '',
      status: 'interested',
      postedDate: '',
      category: '科研/技术',
      interviewDate: '',
      notes: '',
      salary: '',
      location: '',
    });
    setFormErrors({});
    setShowAddPosition(false);
    setIsAddingPosition(false);
  };

  const handleEditPosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;
    
    setNewPosition({
      company: pos.company,
      position: pos.position,
      link: pos.link,
      status: pos.status as StatusType,
      postedDate: pos.postedDate,
      category: pos.category,
      interviewDate: pos.interviewDate || '',
      notes: pos.notes,
      salary: pos.salary || '',
      location: pos.location || '',
    });
    setEditingPosition(id);
    setSelectedPosition(null);
    setShowAddPosition(true);
  };

  const handleUpdatePosition = async () => {
    if (!validatePositionForm() || !editingPosition) return;
    
    setIsAddingPosition(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    updatePosition(editingPosition, {
      ...newPosition,
      postedDate: newPosition.postedDate || getTodayStr(),
    });
    setNewPosition({
      company: '',
      position: '',
      link: '',
      status: 'interested',
      postedDate: '',
      category: '科研/技术',
      interviewDate: '',
      notes: '',
      salary: '',
      location: '',
    });
    setFormErrors({});
    setShowAddPosition(false);
    setEditingPosition(null);
    setIsAddingPosition(false);
  };

  const handleAddExperience = async () => {
    if (!validateExperienceForm()) return;
    
    setIsAddingExperience(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const { tagInput, ...experienceData } = newExperience;
    addExperience({
      ...experienceData,
      date: newExperience.date || getTodayStr(),
    });
    setNewExperience({
      company: '',
      date: '',
      round: '',
      questions: '',
      summary: '',
      tags: [],
      tagInput: '',
    });
    setFormErrors({});
    setShowAddExperience(false);
    setIsAddingExperience(false);
  };

  const handleAddTag = () => {
    if (newExperience.tagInput.trim() && !newExperience.tags.includes(newExperience.tagInput.trim())) {
      setNewExperience({
        ...newExperience,
        tags: [...newExperience.tags, newExperience.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewExperience({
      ...newExperience,
      tags: newExperience.tags.filter((t) => t !== tag),
    });
  };

  const handleUpdateStatus = async (id: string, status: StatusType) => {
    setIsUpdatingStatus(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    updatePositionStatus(id, status);
    setShowStatusModal(null);
    setIsUpdatingStatus(false);
  };

  const handleClearAllData = async () => {
    setIsClearingData(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    clearAllData();
    setShowSettings(false);
    setIsClearingData(false);
  };

  const offerRate = stats.total > 0 ? ((stats.offer / stats.total) * 100).toFixed(1) : '0';
  const interviewRate = stats.total > 0 ? ((stats.interview / stats.total) * 100).toFixed(1) : '0';

  const handleCloseAddPosition = () => {
    if (isAddingPosition) return;
    setShowAddPosition(false);
    setEditingPosition(null);
    setNewPosition({
      company: '',
      position: '',
      link: '',
      status: 'interested',
      postedDate: '',
      category: '科研/技术',
      interviewDate: '',
      notes: '',
      salary: '',
      location: '',
    });
    setFormErrors({});
  };

  const handleCloseAddExperience = () => {
    if (isAddingExperience) return;
    setShowAddExperience(false);
    setNewExperience({
      company: '',
      date: '',
      round: '',
      questions: '',
      summary: '',
      tags: [],
      tagInput: '',
    });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-400 to-purple-500 flex items-center justify-center shadow-soft-lg">
            <Briefcase className="w-7 h-7 text-white icon-glow" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold gradient-text">求职追踪</h2>
            <p className="text-dream-blue-500 text-sm">2027 秋招 · 共 {positions.length} 个岗位</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5 text-dream-blue-500" />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === 'positions'
                ? 'gradient-bg text-white shadow-soft-lg'
                : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100'
              }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium">岗位列表</span>
          </button>
          <button
            onClick={() => setActiveTab('experiences')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === 'experiences'
                ? 'gradient-bg text-white shadow-soft-lg'
                : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">面试经验</span>
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === 'analysis'
                ? 'gradient-bg text-white shadow-soft-lg'
                : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">数据分析</span>
          </button>
          {activeTab === 'positions' && (
            <button
              onClick={() => setShowAddPosition(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加岗位
            </button>
          )}
          {activeTab === 'experiences' && (
            <button
              onClick={() => setShowAddExperience(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加经验
            </button>
          )}
        </div>
      </div>

      {activeTab === 'positions' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="glass-card rounded-2xl p-4 text-center animate-fade-in-up stagger-1">
              <p className="text-3xl font-display font-bold gradient-text">{stats.total}</p>
              <p className="text-xs text-dream-blue-500 mt-1">总数</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center animate-fade-in-up stagger-2">
              <p className="text-3xl font-display font-bold text-blue-500">{stats.interested}</p>
              <p className="text-xs text-dream-blue-500 mt-1">感兴趣</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center animate-fade-in-up stagger-3">
              <p className="text-3xl font-display font-bold text-dream-blue-500">{stats.applied}</p>
              <p className="text-xs text-dream-blue-500 mt-1">已投递</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center animate-fade-in-up stagger-4">
              <p className="text-3xl font-display font-bold text-yellow-500">{stats.interview}</p>
              <p className="text-xs text-dream-blue-500 mt-1">面试中</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center animate-fade-in-up stagger-5">
              <p className="text-3xl font-display font-bold text-green-500">{stats.offer}</p>
              <p className="text-xs text-dream-blue-500 mt-1">Offer</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center animate-fade-in-up stagger-6">
              <p className="text-3xl font-display font-bold text-red-500">{stats.rejected}</p>
              <p className="text-xs text-dream-blue-500 mt-1">已拒</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 animate-fade-in-up">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${statusFilter === 'all'
                    ? 'bg-dream-blue-100 text-dream-slate-700'
                    : 'text-dream-blue-500 hover:bg-dream-blue-50'
                  }`}
              >
                全部
              </button>
              {(Object.keys(statusConfig) as StatusType[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${statusFilter === status
                      ? `${statusConfig[status].bgColor} ${statusConfig[status].color}`
                      : 'text-dream-blue-500 hover:bg-dream-blue-50'
                    }`}
                >
                  {statusConfig[status].label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredPositions.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Briefcase className="w-16 h-16 text-dream-blue-300 mx-auto mb-4" />
                <p className="text-dream-blue-500">暂无岗位数据</p>
                <button
                  onClick={() => setShowAddPosition(true)}
                  className="mt-4 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"
                >
                  添加第一个岗位
                </button>
              </div>
            ) : (
              filteredPositions.map((pos, index) => {
                const StatusIcon = statusConfig[pos.status].icon;
                return (
                  <div
                    key={pos.id}
                    className={`glass-card glass-card-hover rounded-2xl p-6 animate-fade-in-up stagger-${(index % 4) + 1} group cursor-pointer`}
                    onClick={() => setSelectedPosition(pos.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-dream-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-dream-slate-800 mb-1 group-hover:text-dream-blue-600 transition-colors">{pos.position}</h4>
                          <p className="text-sm text-dream-slate-600 mb-2">{pos.company}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-dream-blue-500">
                            {pos.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {pos.location}
                              </span>
                            )}
                            {pos.salary && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {pos.salary}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {pos.postedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStatusModal(pos.id);
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition-transform ${statusConfig[pos.status].bgColor} ${statusConfig[pos.status].color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[pos.status].label}
                        </button>
                        {pos.interviewDate && (
                          <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                            <Calendar className="w-3 h-3" />
                            面试：{pos.interviewDate}
                          </span>
                        )}
                      </div>
                    </div>
                    {pos.notes && (
                      <div className="mt-4 pt-4 border-t border-dream-blue-100/50">
                        <p className="text-sm text-dream-slate-600 line-clamp-2">{pos.notes}</p>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-dream-blue-400 bg-dream-blue-50/80 px-3 py-1 rounded-full">
                        {pos.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('确定要删除这个岗位吗？')) {
                              deletePosition(pos.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPosition(pos.id);
                          }}
                          className="flex items-center gap-1 text-sm text-dream-blue-500 hover:text-dream-blue-600 font-medium transition-colors"
                        >
                          查看详情
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {activeTab === 'experiences' && (
        <div className="space-y-4">
          {experiences.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <MessageSquare className="w-16 h-16 text-dream-blue-300 mx-auto mb-4" />
              <p className="text-dream-blue-500">暂无面试经验</p>
              <button
                onClick={() => setShowAddExperience(true)}
                className="mt-4 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"
              >
                记录第一次面试
              </button>
            </div>
          ) : (
            experiences.map((exp, index) => {
              const isExpanded = expandedExperience === exp.id;
              return (
                <div
                  key={exp.id}
                  className={`glass-card glass-card-hover rounded-2xl p-6 animate-fade-in-up stagger-${(index % 4) + 1} group cursor-pointer transition-all duration-300`}
                  onClick={() => setExpandedExperience(isExpanded ? null : exp.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-dream-slate-800 text-lg group-hover:text-dream-blue-600 transition-colors">{exp.company}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-dream-blue-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {exp.date}
                        </span>
                        <span className="px-2 py-0.5 bg-dream-blue-100 text-dream-blue-600 rounded-full text-xs font-medium">
                          {exp.round}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这条面试经验吗？')) {
                            deleteExperience(exp.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                      <ChevronRight
                        className={`w-5 h-5 text-dream-blue-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-red-100/80 text-red-600 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {isExpanded ? (
                    <div className="space-y-4 pt-2 border-t border-dream-blue-100/50">
                      <div>
                        <p className="text-sm font-medium text-dream-slate-700 mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-dream-blue-500" />
                          面试问题
                        </p>
                        <div className="text-sm text-dream-slate-600 whitespace-pre-line bg-gradient-to-br from-purple-50/80 to-lavender-50/50 p-4 rounded-xl leading-relaxed">
                          {exp.questions}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dream-slate-700 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          面试总结
                        </p>
                        <p className="text-sm text-dream-slate-600 bg-dream-blue-50/50 p-4 rounded-xl leading-relaxed">
                          {exp.summary}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-dream-blue-500 line-clamp-2 bg-dream-blue-50/30 p-3 rounded-lg">
                        {exp.questions}
                      </p>
                      <p className="text-xs text-dream-blue-400 mt-2">点击展开查看完整内容</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
              <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-dream-blue-500" />
                岗位状态分布
              </h3>
              <div className="h-64">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: '1px solid #E9D5FF',
                          borderRadius: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-dream-blue-400 text-sm">
                    暂无数据
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-dream-slate-600">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-1">
              <h3 className="font-semibold text-dream-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-500" />
                岗位分类统计
              </h3>
              <div className="h-64">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical">
                      <XAxis type="number" stroke="#A855F7" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#A855F7" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: '1px solid #E9D5FF',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 8, 8, 0]} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#C084FC" />
                          <stop offset="100%" stopColor="#F472B6" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-dream-blue-400 text-sm">
                    暂无数据
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-2">
            <h3 className="font-semibold text-dream-slate-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              求职数据洞察
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-lavender-50 to-purple-50 rounded-2xl text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-lavender-200 to-purple-200 flex items-center justify-center mb-3">
                  <Target className="w-6 h-6 text-dream-slate-600" />
                </div>
                <p className="text-2xl font-display font-bold gradient-text">{offerRate}%</p>
                <p className="text-xs text-dream-blue-500 mt-1">Offer转化率</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-2xl font-display font-bold gradient-text">{interviewRate}%</p>
                <p className="text-xs text-dream-blue-500 mt-1">面试通过率</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center mb-3">
                  <Briefcase className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-display font-bold gradient-text">{stats.applied}</p>
                <p className="text-xs text-dream-blue-500 mt-1">已投递岗位</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-mint-50 to-green-50 rounded-2xl text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-mint-200 to-green-200 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-display font-bold gradient-text">{stats.offer}</p>
                <p className="text-xs text-dream-blue-500 mt-1">获得Offer</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-dream-slate-800">AI 求职建议</h3>
                <p className="text-xs text-dream-blue-400">基于您的数据智能分析</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="space-y-2">
                {aiAdvice.map((advice, index) => (
                  <p key={index} className="text-sm text-dream-slate-700 leading-relaxed">
                    {advice}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !isClearingData && setShowSettings(false)}>
          <div className="glass-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-dream-slate-800 text-lg">求职设置</h3>
              </div>
              <button onClick={() => !isClearingData && setShowSettings(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors" disabled={isClearingData}>
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="pt-4 border-t border-dream-blue-100/50">
                <p className="text-sm font-medium text-dream-slate-700 mb-3">数据管理</p>
                <button
                  onClick={() => {
                    if (confirm('确定要清空所有求职数据吗？此操作不可恢复。')) {
                      handleClearAllData();
                    }
                  }}
                  disabled={isClearingData}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {isClearingData ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  清空所有数据
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseAddPosition}>
          <div className="glass-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">
                {editingPosition ? '编辑岗位' : '添加岗位'}
              </h3>
              <button onClick={handleCloseAddPosition} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors" disabled={isAddingPosition}>
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">公司名称 *</label>
                <input
                  type="text"
                  value={newPosition.company}
                  onChange={(e) => {
                    setNewPosition({ ...newPosition, company: e.target.value });
                    if (formErrors.company) setFormErrors({ ...formErrors, company: '' });
                  }}
                  placeholder="例如：字节跳动"
                  className={`w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border transition-all text-dream-slate-700 placeholder-purple-400 text-sm focus:outline-none ${
                    formErrors.company
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-dream-blue-100 focus:border-lavender-400'
                  }`}
                />
                {formErrors.company && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.company}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">职位名称 *</label>
                <input
                  type="text"
                  value={newPosition.position}
                  onChange={(e) => {
                    setNewPosition({ ...newPosition, position: e.target.value });
                    if (formErrors.position) setFormErrors({ ...formErrors, position: '' });
                  }}
                  placeholder="例如：算法工程师"
                  className={`w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border transition-all text-dream-slate-700 placeholder-purple-400 text-sm focus:outline-none ${
                    formErrors.position
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-dream-blue-100 focus:border-lavender-400'
                  }`}
                />
                {formErrors.position && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.position}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">状态</label>
                  <select
                    value={newPosition.status}
                    onChange={(e) => setNewPosition({ ...newPosition, status: e.target.value as StatusType })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  >
                    {(Object.keys(statusConfig) as StatusType[]).map((status) => (
                      <option key={status} value={status}>
                        {statusConfig[status].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">分类</label>
                  <input
                    type="text"
                    value={newPosition.category}
                    onChange={(e) => setNewPosition({ ...newPosition, category: e.target.value })}
                    placeholder="例如：科研/技术"
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">地点</label>
                  <input
                    type="text"
                    value={newPosition.location}
                    onChange={(e) => setNewPosition({ ...newPosition, location: e.target.value })}
                    placeholder="例如：上海"
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">薪资</label>
                  <input
                    type="text"
                    value={newPosition.salary}
                    onChange={(e) => setNewPosition({ ...newPosition, salary: e.target.value })}
                    placeholder="例如：30-50K"
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">发布日期</label>
                  <input
                    type="date"
                    value={newPosition.postedDate}
                    onChange={(e) => setNewPosition({ ...newPosition, postedDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">面试日期</label>
                  <input
                    type="date"
                    value={newPosition.interviewDate}
                    onChange={(e) => setNewPosition({ ...newPosition, interviewDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  职位链接
                </label>
                <input
                  type="url"
                  value={newPosition.link}
                  onChange={(e) => setNewPosition({ ...newPosition, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">备注</label>
                <textarea
                  value={newPosition.notes}
                  onChange={(e) => setNewPosition({ ...newPosition, notes: e.target.value })}
                  placeholder="添加一些备注信息..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCloseAddPosition}
                  disabled={isAddingPosition}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={editingPosition ? handleUpdatePosition : handleAddPosition}
                  disabled={isAddingPosition}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAddingPosition && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingPosition ? '保存' : '添加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddExperience && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseAddExperience}>
          <div className="glass-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">添加面试经验</h3>
              <button onClick={handleCloseAddExperience} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors" disabled={isAddingExperience}>
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">公司名称 *</label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => {
                    setNewExperience({ ...newExperience, company: e.target.value });
                    if (formErrors.company) setFormErrors({ ...formErrors, company: '' });
                  }}
                  placeholder="例如：字节跳动"
                  className={`w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border transition-all text-dream-slate-700 placeholder-purple-400 text-sm focus:outline-none ${
                    formErrors.company
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-dream-blue-100 focus:border-lavender-400'
                  }`}
                />
                {formErrors.company && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.company}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">面试日期</label>
                  <input
                    type="date"
                    value={newExperience.date}
                    onChange={(e) => setNewExperience({ ...newExperience, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-dream-slate-600 mb-1 block">面试轮次</label>
                  <input
                    type="text"
                    value={newExperience.round}
                    onChange={(e) => setNewExperience({ ...newExperience, round: e.target.value })}
                    placeholder="例如：一面/二面/HR面"
                    className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">面试问题 *</label>
                <textarea
                  value={newExperience.questions}
                  onChange={(e) => {
                    setNewExperience({ ...newExperience, questions: e.target.value });
                    if (formErrors.questions) setFormErrors({ ...formErrors, questions: '' });
                  }}
                  placeholder="记录面试中问到的问题..."
                  rows={4}
                  className={`w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none focus:outline-none ${
                    formErrors.questions
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-dream-blue-100 focus:border-lavender-400'
                  }`}
                />
                {formErrors.questions && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.questions}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-1 block">面试总结</label>
                <textarea
                  value={newExperience.summary}
                  onChange={(e) => setNewExperience({ ...newExperience, summary: e.target.value })}
                  placeholder="总结一下这次面试的收获和不足..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-dream-slate-600 mb-2 block">标签</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {newExperience.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-red-100/80 text-red-600 rounded-full text-xs flex items-center gap-1"
                    >
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-pink-700">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExperience.tagInput}
                    onChange={(e) => setNewExperience({ ...newExperience, tagInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="输入标签后按回车添加"
                    className="flex-1 px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 gradient-bg text-white rounded-xl text-sm font-medium"
                  >
                    添加
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCloseAddExperience}
                  disabled={isAddingExperience}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddExperience}
                  disabled={isAddingExperience}
                  className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAddingExperience && <Loader2 className="w-4 h-4 animate-spin" />}
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !isUpdatingStatus && setShowStatusModal(null)}>
          <div className="glass-card rounded-3xl w-full max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">更新状态</h3>
              <button onClick={() => !isUpdatingStatus && setShowStatusModal(null)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors" disabled={isUpdatingStatus}>
                <X className="w-5 h-5 text-dream-blue-500" />
              </button>
            </div>
            <div className="p-6 space-y-2">
              {(Object.keys(statusConfig) as StatusType[]).map((status) => {
                const StatusIcon = statusConfig[status].icon;
                return (
                  <button
                    key={status}
                    onClick={() => !isUpdatingStatus && handleUpdateStatus(showStatusModal, status)}
                    disabled={isUpdatingStatus}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] ${statusConfig[status].bgColor} disabled:opacity-50`}
                  >
                    <StatusIcon className={`w-5 h-5 ${statusConfig[status].color}`} />
                    <span className={`font-medium ${statusConfig[status].color}`}>
                      {statusConfig[status].label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedPos && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPosition(null)}>
          <div className="glass-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-dream-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-dream-slate-800 text-xl">{selectedPos.position}</h3>
                  <p className="text-dream-slate-600 mt-1">{selectedPos.company}</p>
                  <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[selectedPos.status].bgColor} ${statusConfig[selectedPos.status].color}`}>
                    {(() => {
                      const Icon = statusConfig[selectedPos.status].icon;
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {statusConfig[selectedPos.status].label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleEditPosition(selectedPos.id)}
                  className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"
                >
                  <Edit3 className="w-5 h-5 text-dream-blue-500" />
                </button>
                <button onClick={() => setSelectedPosition(null)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-dream-blue-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {selectedPos.location && (
                  <div className="bg-dream-blue-50/60 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-dream-blue-500 text-xs mb-1">
                      <MapPin className="w-4 h-4" />
                      工作地点
                    </div>
                    <p className="text-dream-slate-800 font-medium text-sm">{selectedPos.location}</p>
                  </div>
                )}
                {selectedPos.salary && (
                  <div className="bg-dream-blue-50/60 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-dream-blue-500 text-xs mb-1">
                      <DollarSign className="w-4 h-4" />
                      薪资范围
                    </div>
                    <p className="text-dream-slate-800 font-medium text-sm">{selectedPos.salary}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dream-blue-50/60 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-dream-blue-500 text-xs mb-1">
                    <Clock className="w-4 h-4" />
                    发布日期
                  </div>
                  <p className="text-dream-slate-800 font-medium text-sm">{selectedPos.postedDate}</p>
                </div>
                {selectedPos.interviewDate && (
                  <div className="bg-red-50/60 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-red-500 text-xs mb-1">
                      <Calendar className="w-4 h-4" />
                      面试日期
                    </div>
                    <p className="text-pink-700 font-medium text-sm">{selectedPos.interviewDate}</p>
                  </div>
                )}
              </div>
              <div className="bg-dream-blue-50/60 rounded-xl p-3">
                <div className="flex items-center gap-2 text-dream-blue-500 text-xs mb-1">
                  <Briefcase className="w-4 h-4" />
                  岗位分类
                </div>
                <p className="text-dream-slate-800 font-medium text-sm">{selectedPos.category}</p>
              </div>
              {selectedPos.notes && (
                <div className="bg-gradient-to-br from-lavender-50/80 to-purple-50/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-dream-slate-600 text-sm font-medium mb-2">
                    <Sparkles className="w-4 h-4" />
                    备注信息
                  </div>
                  <p className="text-dream-slate-700 text-sm leading-relaxed whitespace-pre-line">{selectedPos.notes}</p>
                </div>
              )}
              {selectedPos.link && (
                <a
                  href={selectedPos.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 gradient-btn text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <LinkIcon className="w-4 h-4" />
                  查看原始职位链接
                </a>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowStatusModal(selectedPos.id);
                    setSelectedPosition(null);
                  }}
                  className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors"
                >
                  更新状态
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定要删除这个岗位吗？')) {
                      deletePosition(selectedPos.id);
                      setSelectedPosition(null);
                    }
                  }}
                  className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  删除岗位
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
