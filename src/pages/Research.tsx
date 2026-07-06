import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  FileText,
  MessageCircle,
  Calendar,
  Plus,
  Send,
  Tag,
  Clock,
  BookOpen,
  Sparkles,
  Bot,
  User,
  GitBranch,
  X,
  Upload,
  Link as LinkIcon,
  Download,
  FileText as FileTextIcon,
  CheckCircle2,
  Loader2,
  Network,
  Trash2,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  AlertCircle,
  Check,
  Languages,
  Database,
  ListChecks,
  Workflow,
  PenLine,
  Table2,
  Quote,
  FileQuestion,
  ClipboardList,
  ArrowRight,
  Beaker,
} from 'lucide-react';
import { useResearchStore } from '../store/useResearchStore';
import { researchQuestionTemplates } from '../data/mockData';
import { formatDate, getWeekNumber } from '../utils/date';
import type { ResearchFramework, PolishingSuggestion } from '../types';

type TabType = 'papers' | 'reading' | 'assistant' | 'experiment' | 'mindmap';
type ExpSubTab = 'plans' | 'notes' | 'chat';
type MindSubTab = 'framework' | 'literature' | 'ppt';
type AssistantSubTab = 'question' | 'matrix' | 'writing';

const quickQuestions = [
  '如何设计对照实验？',
  'WB实验条带弥散怎么办？',
  '细胞污染如何处理？',
  'PCR实验优化建议',
  '生物正交反应有哪些类型？',
];

export default function Research() {
  const [activeTab, setActiveTab] = useState<TabType>('papers');
  const [expSubTab, setExpSubTab] = useState<ExpSubTab>('plans');
  const [mindSubTab, setMindSubTab] = useState<MindSubTab>('framework');
  const [assistantSubTab, setAssistantSubTab] = useState<AssistantSubTab>('question');

  const store = useResearchStore();
  const {
    papers,
    experimentNotes,
    chatMessages,
    isChatLoading,
    pptData,
    isGeneratingPPT,
    sendMessage,
    addPaper,
    addExperimentNote,
    clearChat,
    exportMindMap,
    generatePPT,
    downloadPPT,
    downloadSpeech,
    generateWeeklyReport,
    batchImportPapers,
    researchQuestions,
    literatureMatrix,
    paperOutlines,
    paperAbstracts,
    experimentPlans,
    readingPapers,
    terminologyLedger,
    frameworkFigures,
    startResearchQuestion,
    updateResearchQuestionAnswers,
    refineResearchQuestion,
    deleteResearchQuestion,
    getSearchStrategy,
    addLiteratureMatrixEntry,
    updateLiteratureMatrixEntry,
    deleteLiteratureMatrixEntry,
    importPapersToMatrix,
    exportLiteratureMatrixCSV,
    generateOutline,
    deleteOutline,
    generateAbstract,
    polishText,
    addExperimentPlan,
    updateExperimentPlan,
    toggleExperimentStep,
    addExperimentStep,
    deleteExperimentPlan,
    addReadingPaper,
    deleteReadingPaper,
    translateText,
    addTerminology,
    deleteTerminology,
    createFrameworkFigure,
    deleteFrameworkFigure,
    exportFrameworkSVG,
  } = store;

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const currentWeek = getWeekNumber(today);

  const [showAddPaper, setShowAddPaper] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showMindMap, setShowMindMap] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPPTViewer, setShowPPTViewer] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [batchImportText, setBatchImportText] = useState('');
  const [importSuccess, setImportSuccess] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [newPaper, setNewPaper] = useState({ title: '', authors: '', journal: '', date: '', abstract: '', tags: '' });
  const [newNote, setNewNote] = useState({ title: '', content: '', date: '', tags: '' });

  // 研究问题状态
  const [rqTopic, setRqTopic] = useState('');
  const [rqFramework, setRqFramework] = useState<ResearchFramework>('PICO');
  const [activeRqId, setActiveRqId] = useState<string | null>(null);
  const [rqAnswers, setRqAnswers] = useState<string[]>([]);
  const [refinedText, setRefinedText] = useState('');

  // 文献综述状态
  const [searchStrategy, setSearchStrategy] = useState<{ keywords: string[]; databases: string[]; strategy: string } | null>(null);
  const [strategyQuestion, setStrategyQuestion] = useState('');
  const [showAddMatrix, setShowAddMatrix] = useState(false);
  const [newMatrixEntry, setNewMatrixEntry] = useState({ title: '', authors: '', year: '', methods: '', mainFindings: '', limitations: '', relevance: '' });
  const [editingMatrixId, setEditingMatrixId] = useState<string | null>(null);

  // 论文写作状态
  const [outlineQuestion, setOutlineQuestion] = useState('');
  const [outlineTitle, setOutlineTitle] = useState('');
  const [abstractForm, setAbstractForm] = useState({ background: '', methods: '', results: '', conclusion: '' });
  const [polishInput, setPolishInput] = useState('');
  const [polishResult, setPolishResult] = useState<PolishingSuggestion[] | null>(null);

  // 实验规划状态
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: '', hypothesis: '', independentVariable: '', dependentVariable: '', controlGroup: '', sampleSize: '' });
  const [newStepText, setNewStepText] = useState('');
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // 论文精读状态
  const [showAddReading, setShowAddReading] = useState(false);
  const [readingForm, setReadingForm] = useState({ title: '', source: 'paste' as 'paste' | 'DOI' | 'arXiv', sourceValue: '', rawText: '' });
  const [activeReadingId, setActiveReadingId] = useState<string | null>(null);
  const [translateInput, setTranslateInput] = useState('');
  const [translateOutput, setTranslateOutput] = useState('');
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: '', translation: '', definition: '' });

  // 框架图状态
  const [showAddFramework, setShowAddFramework] = useState(false);
  const [frameworkForm, setFrameworkForm] = useState({ title: '', template: 'flow' as 'flow' | 'mechanism' | 'dataflow', topic: '' });
  const [activeFrameworkId, setActiveFrameworkId] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const thisWeekPapers = papers.filter(p => p.week === currentWeek && p.year === today.getFullYear());

  const filteredPapers = papers.filter(p => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(query) || p.authors.toLowerCase().includes(query) || p.journal.toLowerCase().includes(query) || p.tags.some(t => t.toLowerCase().includes(query));
  });

  const handleAddPaper = () => {
    if (!newPaper.title.trim()) { showToast('请输入文献标题', 'error'); return; }
    addPaper({
      title: newPaper.title,
      authors: newPaper.authors,
      journal: newPaper.journal,
      date: newPaper.date || new Date().toISOString().split('T')[0],
      abstract: newPaper.abstract,
      tags: newPaper.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
    });
    setNewPaper({ title: '', authors: '', journal: '', date: '', abstract: '', tags: '' });
    setShowAddPaper(false);
    showToast('文献添加成功', 'success');
  };

  const handleAddNote = () => {
    if (!newNote.title.trim()) { showToast('请输入实验记录标题', 'error'); return; }
    addExperimentNote({
      title: newNote.title,
      content: newNote.content,
      date: newNote.date || new Date().toISOString().split('T')[0],
      tags: newNote.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
    });
    setNewNote({ title: '', content: '', date: '', tags: '' });
    setShowAddNote(false);
    showToast('实验记录保存成功', 'success');
  };

  const handleGeneratePPT = async () => { await generatePPT(); showToast('PPT生成完成', 'success'); };

  const handleQuickQuestion = (question: string) => { setInput(question); sendMessage(question); setInput(''); };

  const handleBatchImport = () => {
    try {
      const lines = batchImportText.trim().split('\n').filter(line => line.trim());
      if (lines.length === 0) { showToast('请输入要导入的文献数据', 'error'); return; }
      const newPapers = lines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        return {
          title: parts[0] || '未命名文献',
          authors: parts[1] || '',
          journal: parts[2] || '',
          date: parts[3] || new Date().toISOString().split('T')[0],
          abstract: parts[4] || '',
          tags: parts[5] ? parts[5].split(/[,，]/).map(t => t.trim()).filter(Boolean) : [],
        };
      });
      const count = batchImportPapers(newPapers);
      setImportSuccess(count);
      setBatchImportText('');
      showToast(`成功导入 ${count} 篇文献`, 'success');
      setTimeout(() => { setShowBatchImport(false); setImportSuccess(null); }, 1500);
    } catch (e) {
      console.error('批量导入失败:', e);
      showToast('批量导入失败，请检查格式', 'error');
    }
  };

  const handleExportMindMap = (format: 'png' | 'json' | 'text') => {
    if (showMindMap) { exportMindMap(showMindMap, format); showToast(`已导出为 ${format.toUpperCase()} 格式`, 'success'); }
    setShowExportMenu(false);
  };

  const handleGenerateWeeklyReport = () => { generateWeeklyReport(); showToast('周报生成成功，已开始下载', 'success'); };
  const handleDownloadPPT = () => { downloadPPT(); showToast('PPT下载已开始', 'success'); };
  const handleDownloadSpeech = () => { downloadSpeech(); showToast('演讲稿下载已开始', 'success'); };
  const handleClearChat = () => { if (chatMessages.length > 1) { clearChat(); showToast('对话已清空', 'info'); } };

  // 研究问题处理
  const handleStartRQ = () => {
    if (!rqTopic.trim()) { showToast('请输入研究方向', 'error'); return; }
    const id = startResearchQuestion(rqTopic, rqFramework);
    const rq = useResearchStore.getState().researchQuestions.find(r => r.id === id);
    setActiveRqId(id);
    setRqAnswers(rq ? [...rq.answers] : []);
    setRefinedText('');
    showToast('已生成苏格拉底式提问，请逐条回答以收敛研究问题', 'success');
  };

  const handleSaveAnswers = () => {
    if (!activeRqId) return;
    updateResearchQuestionAnswers(activeRqId, rqAnswers);
    showToast('回答已保存', 'success');
  };

  const handleRefine = () => {
    if (!activeRqId) return;
    if (!refinedText.trim()) { showToast('请输入收敛后的研究问题', 'error'); return; }
    refineResearchQuestion(activeRqId, refinedText);
    showToast('研究问题已收敛保存', 'success');
  };

  // 文献综述处理
  const handleGenStrategy = () => {
    if (!strategyQuestion.trim()) { showToast('请输入研究问题', 'error'); return; }
    setSearchStrategy(getSearchStrategy(strategyQuestion));
    showToast('检索策略已生成', 'success');
  };

  const handleAddMatrix = () => {
    if (!newMatrixEntry.title.trim()) { showToast('请输入文献标题', 'error'); return; }
    addLiteratureMatrixEntry(newMatrixEntry);
    setNewMatrixEntry({ title: '', authors: '', year: '', methods: '', mainFindings: '', limitations: '', relevance: '' });
    setShowAddMatrix(false);
    showToast('文献矩阵已添加', 'success');
  };

  const handleImportPapersToMatrix = () => {
    const count = importPapersToMatrix();
    showToast(count > 0 ? `已从文献库导入 ${count} 篇` : '文献库中的文献已在矩阵中', count > 0 ? 'success' : 'info');
  };

  // 论文写作处理
  const handleGenOutline = () => {
    if (!outlineQuestion.trim()) { showToast('请输入研究问题', 'error'); return; }
    generateOutline(outlineQuestion, outlineTitle);
    showToast('IMRaD 大纲已生成', 'success');
  };

  const handleGenAbstract = () => {
    if (!abstractForm.background.trim() && !abstractForm.methods.trim() && !abstractForm.results.trim() && !abstractForm.conclusion.trim()) {
      showToast('请至少填写一个摘要要素', 'error'); return;
    }
    generateAbstract(abstractForm);
    showToast('结构化摘要已生成', 'success');
  };

  const handlePolish = () => {
    if (!polishInput.trim()) { showToast('请输入待润色文本', 'error'); return; }
    setPolishResult(polishText(polishInput));
    showToast('润色建议已生成', 'success');
  };

  // 实验规划处理
  const handleAddPlan = () => {
    if (!newPlan.title.trim()) { showToast('请输入实验标题', 'error'); return; }
    const id = addExperimentPlan(newPlan);
    setNewPlan({ title: '', hypothesis: '', independentVariable: '', dependentVariable: '', controlGroup: '', sampleSize: '' });
    setShowAddPlan(false);
    setActivePlanId(id);
    showToast('实验计划已创建，已生成默认实验步骤', 'success');
  };

  const handleAddStep = (planId: string) => {
    if (!newStepText.trim()) { showToast('请输入步骤内容', 'error'); return; }
    addExperimentStep(planId, newStepText);
    setNewStepText('');
    showToast('步骤已添加', 'success');
  };

  // 论文精读处理
  const handleAddReading = () => {
    if (!readingForm.title.trim()) { showToast('请输入论文标题', 'error'); return; }
    if (readingForm.source === 'paste' && !readingForm.rawText.trim()) { showToast('请粘贴论文文本', 'error'); return; }
    const sourceValue = readingForm.source === 'paste' ? '粘贴文本' : readingForm.sourceValue;
    addReadingPaper({ title: readingForm.title, source: readingForm.source, sourceValue, rawText: readingForm.rawText });
    setReadingForm({ title: '', source: 'paste', sourceValue: '', rawText: '' });
    setShowAddReading(false);
    showToast('论文已添加，已生成中英对照与术语表', 'success');
  };

  const handleTranslate = () => {
    if (!translateInput.trim()) { showToast('请输入英文段落', 'error'); return; }
    setTranslateOutput(translateText(translateInput));
    showToast('翻译完成（基于本地术语词典）', 'success');
  };

  const handleAddTerm = () => {
    if (!newTerm.term.trim() || !newTerm.translation.trim()) { showToast('请输入术语和译文', 'error'); return; }
    addTerminology(newTerm);
    setNewTerm({ term: '', translation: '', definition: '' });
    setShowAddTerm(false);
    showToast('术语已添加', 'success');
  };

  // 框架图处理
  const handleAddFramework = () => {
    if (!frameworkForm.title.trim()) { showToast('请输入框架图标题', 'error'); return; }
    const id = createFrameworkFigure(frameworkForm.title, frameworkForm.template, frameworkForm.topic || frameworkForm.title);
    setFrameworkForm({ title: '', template: 'flow', topic: '' });
    setShowAddFramework(false);
    setActiveFrameworkId(id);
    showToast('研究框架图已生成', 'success');
  };

  const tabs = [
    { id: 'papers', label: '文献管理', icon: FileText },
    { id: 'reading', label: '论文精读', icon: BookOpen },
    { id: 'assistant', label: '研究助手', icon: Sparkles },
    { id: 'experiment', label: '实验规划', icon: FlaskConical },
    { id: 'mindmap', label: '思维导图', icon: Network },
  ];

  const activeRq = researchQuestions.find(r => r.id === activeRqId);
  const activePlan = experimentPlans.find(p => p.id === activePlanId);
  const activeReading = readingPapers.find(p => p.id === activeReadingId);
  const activeFramework = frameworkFigures.find(f => f.id === activeFrameworkId);

  const MindMapComponent = ({ paperId }: { paperId: string }) => {
    const paper = papers.find(p => p.id === paperId);
    if (!paper) return null;
    const branches = [
      { label: '研究背景', color: '#A78BFA', items: ['研究意义', '研究现状', '科学问题'] },
      { label: '实验方法', color: '#F472B6', items: ['实验设计', '材料试剂', '检测方法'] },
      { label: '关键发现', color: '#34D399', items: ['主要结果', '数据验证', '机制分析'] },
      { label: '结论展望', color: '#FB923C', items: ['研究结论', '创新点', '未来方向'] },
    ];
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { setShowMindMap(null); setShowExportMenu(false); }}>
        <div className="glass-card rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden animate-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center"><Network className="w-5 h-5 text-white" /></div>
              <div><h3 className="font-semibold text-dream-slate-800">文献思维导图</h3><p className="text-xs text-dream-blue-500">{paper.journal} · {paper.date}</p></div>
            </div>
            <button onClick={() => { setShowMindMap(null); setShowExportMenu(false); }} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
          </div>
          <div className="p-6 overflow-auto flex-1 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
            <h4 className="font-semibold text-dream-slate-800 mb-6 text-lg text-center px-4">{paper.title}</h4>
            <div className="relative">
              <div className="flex justify-center mb-8">
                <div className="px-6 py-3 gradient-bg text-white rounded-xl font-medium text-center shadow-soft-lg max-w-md">核心主题<div className="text-xs opacity-80 mt-1">生物正交化学研究</div></div>
              </div>
              <div className="grid grid-cols-2 gap-6 relative">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: 0, zIndex: 0 }}>
                  <line x1="50%" y1="30" x2="15%" y2="100" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="50%" y1="30" x2="85%" y2="100" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="50%" y1="30" x2="15%" y2="280" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="50%" y1="30" x2="85%" y2="280" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {branches.map((branch, idx) => (
                  <div key={idx} className="space-y-3 relative z-10">
                    <div className="p-4 bg-white/90 backdrop-blur rounded-xl shadow-soft border" style={{ borderColor: branch.color + '40' }}>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: branch.color }}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: branch.color }} />{branch.label}</p>
                      <div className="space-y-1.5">
                        {branch.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: branch.color + '15' }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: branch.color }} />
                            <span className="text-xs text-gray-600">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-blue-50/80 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />关键词</p>
                <div className="flex flex-wrap gap-2">{paper.tags.map((tag, i) => (<span key={i} className="px-3 py-1 bg-white text-blue-600 text-xs rounded-full border border-blue-200">{tag}</span>))}</div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-dream-blue-100/50 flex gap-3 flex-shrink-0 bg-white/50">
            <div className="flex-1 relative">
              <button onClick={() => setShowExportMenu(!showExportMenu)} className="w-full flex items-center justify-center gap-2 py-3 gradient-btn text-white rounded-xl text-sm font-medium hover:opacity-95 transition-opacity"><Download className="w-4 h-4" />导出思维导图</button>
              {showExportMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-dream-blue-100 overflow-hidden z-20">
                  <button onClick={() => handleExportMindMap('png')} className="w-full px-4 py-2.5 text-left text-sm text-dream-slate-700 hover:bg-dream-blue-50 transition-colors flex items-center gap-2"><FileTextIcon className="w-4 h-4" />导出为 PNG 图片</button>
                  <button onClick={() => handleExportMindMap('json')} className="w-full px-4 py-2.5 text-left text-sm text-dream-slate-700 hover:bg-dream-blue-50 transition-colors flex items-center gap-2"><FileText className="w-4 h-4" />导出为 JSON 数据</button>
                  <button onClick={() => handleExportMindMap('text')} className="w-full px-4 py-2.5 text-left text-sm text-dream-slate-700 hover:bg-dream-blue-50 transition-colors flex items-center gap-2"><Download className="w-4 h-4" />导出为文本大纲</button>
                </div>
              )}
            </div>
            <button onClick={() => { setShowMindMap(null); setShowExportMenu(false); }} className="px-8 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors">关闭</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== 框架图渲染组件 =====
  const FrameworkView = ({ figId }: { figId: string }) => {
    const fig = frameworkFigures.find(f => f.id === figId);
    if (!fig) return null;
    const layerCount = fig.nodes.length;
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-dream-blue-500" />
            <h4 className="font-semibold text-dream-slate-800">{fig.title}</h4>
            <span className="px-2 py-0.5 bg-dream-blue-100 text-dream-slate-600 text-xs rounded-full">
              {fig.template === 'flow' ? '实验流程图' : fig.template === 'mechanism' ? '机制图' : '数据流图'}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportFrameworkSVG(fig.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-dream-blue-50 text-dream-slate-600 rounded-lg text-xs font-medium hover:bg-dream-blue-100 transition-colors">
              <Download className="w-3.5 h-3.5" />导出 SVG
            </button>
            <button onClick={() => deleteFrameworkFigure(fig.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />删除
            </button>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50/40 to-pink-50/40 rounded-xl p-4 overflow-x-auto">
          <div className="flex flex-col items-center gap-0 min-w-[320px]" style={{ minHeight: 80 + layerCount * 90 }}>
            {fig.nodes.map((node, idx) => {
              const nextEdge = fig.edges.find(e => e.from === node.id);
              return (
                <div key={node.id} className="flex flex-col items-center w-full">
                  <div className="px-5 py-3 rounded-2xl text-white text-sm font-medium text-center max-w-md shadow-soft" style={{ backgroundColor: node.color }}>
                    {node.label}
                  </div>
                  {nextEdge && (
                    <div className="flex flex-col items-center py-1">
                      <div className="w-0.5 h-5 bg-lavender-300" />
                      <span className="text-xs text-dream-blue-500 bg-white px-2 py-0.5 rounded-full border border-dream-blue-200 -my-2 z-10">{nextEdge.label}</span>
                      <div className="w-0.5 h-5 bg-lavender-300" />
                      <ArrowRight className="w-4 h-4 text-lavender-400 rotate-90 -mt-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-dream-blue-500 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A78BFA' }} />研究问题</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F472B6' }} />方法/过程</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#34D399' }} />预期结果</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg animate-scale-in flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-dream-blue-500 text-white'}`}>
          {toast.type === 'success' && <Check className="w-5 h-5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {toast.type === 'info' && <Lightbulb className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-soft-lg"><FlaskConical className="w-7 h-7 text-white icon-glow" /></div>
          <div>
            <h2 className="text-2xl font-display font-bold gradient-text">科研工作台</h2>
            <p className="text-dream-blue-500 text-sm">本周（第 {currentWeek} 周）新增 {thisWeekPapers.length} 篇前沿文献 · 集成 ARS / 论文精读 / 实验规划 / 框架图</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'gradient-bg text-white shadow-soft-lg scale-105' : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100'}`}>
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Tab 1: 文献管理 ===== */}
      {activeTab === 'papers' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-dream-slate-800 font-display">文献库 · 共 {papers.length} 篇</h3>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-dream-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索文献..." className="pl-9 pr-4 py-2 bg-dream-blue-50 text-dream-slate-700 rounded-xl text-sm border border-dream-blue-100 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-dream-blue-200 transition-all w-48" />
              </div>
              <button onClick={() => setShowBatchImport(true)} className="flex items-center gap-2 px-4 py-2 bg-dream-blue-50 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-100 transition-colors"><Upload className="w-4 h-4" />批量导入</button>
              <button onClick={() => setShowAddPaper(true)} className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" />添加文献</button>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-r from-lavender-50/50 to-purple-50/50">
            <LinkIcon className="w-5 h-5 text-dream-blue-500 flex-shrink-0" />
            <p className="text-sm text-dream-slate-600 flex-1">支持从 PubMed、Google Scholar 一键同步文献，或批量导入文献数据</p>
            <button onClick={() => showToast('数据库连接功能开发中，敬请期待！', 'info')} className="px-4 py-2 bg-white/80 text-dream-blue-600 rounded-xl text-sm font-medium hover:bg-white transition-colors flex-shrink-0">连接数据库</button>
          </div>
          <div className="space-y-4">
            {filteredPapers.map((paper, index) => (
              <div key={paper.id} className={`glass-card glass-card-hover rounded-2xl p-6 animate-fade-in-up stagger-${(index % 4) + 1}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h4 className="font-semibold text-dream-slate-800 flex-1 text-base leading-snug">{paper.title}</h4>
                  <span className="text-xs text-dream-blue-400 whitespace-nowrap flex-shrink-0">{formatDate(paper.date)}</span>
                </div>
                <p className="text-sm text-dream-blue-500 mb-2">{paper.authors}</p>
                <div className="flex items-center gap-2 text-xs text-green-600 mb-3"><BookOpen className="w-4 h-4" />{paper.journal}</div>
                <p className="text-sm text-dream-slate-600 mb-4 bg-dream-blue-50/50 p-3 rounded-xl leading-relaxed">{paper.abstract}</p>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {paper.tags.map((tag) => (<span key={tag} className="flex items-center gap-1 px-3 py-1 bg-dream-blue-100/80 text-dream-blue-600 rounded-full text-xs"><Tag className="w-3 h-3" />{tag}</span>))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowMindMap(paper.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-dream-blue-50 text-dream-slate-600 rounded-lg text-xs font-medium hover:bg-dream-blue-100 transition-colors"><GitBranch className="w-3.5 h-3.5" />思维导图</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredPapers.length === 0 && (<div className="glass-card rounded-2xl p-12 text-center"><BookOpen className="w-12 h-12 text-dream-blue-300 mx-auto mb-4" /><p className="text-dream-blue-500">暂无匹配的文献</p></div>)}
          </div>
        </div>
      )}

      {/* ===== Tab 2: 论文精读（Nature-Reader）===== */}
      {activeTab === 'reading' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-dream-slate-800 font-display flex items-center gap-2"><BookOpen className="w-5 h-5 text-dream-blue-500" />论文精读 · 中英对照</h3>
            <button onClick={() => setShowAddReading(true)} className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" />添加论文</button>
          </div>

          <div className="glass-card rounded-2xl p-4 bg-gradient-to-r from-lavender-50/50 to-purple-50/50">
            <p className="text-sm text-dream-slate-600 flex items-center gap-2"><Languages className="w-4 h-4 text-dream-blue-500" />粘贴英文论文或输入 DOI/arXiv 链接，自动生成分段中英对照、术语表与图表位置标注（本地规则引擎，无外部 API）</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              <p className="text-sm font-semibold text-dream-slate-700">精读列表（{readingPapers.length}）</p>
              {readingPapers.map(p => (
                <button key={p.id} onClick={() => setActiveReadingId(p.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${activeReadingId === p.id ? 'gradient-bg text-white border-transparent shadow-soft' : 'bg-white/70 border-dream-blue-100 hover:bg-dream-blue-50'}`}>
                  <p className="text-sm font-medium line-clamp-2">{p.title}</p>
                  <p className={`text-xs mt-1 ${activeReadingId === p.id ? 'text-white/80' : 'text-dream-blue-400'}`}>{p.source} · {p.segments.length} 段 · {p.terminology.length} 术语</p>
                </button>
              ))}
              {readingPapers.length === 0 && <p className="text-sm text-dream-blue-400 text-center py-6">暂无精读论文</p>}
            </div>

            <div className="lg:col-span-2 space-y-4">
              {activeReading ? (
                <>
                  <div className="glass-card rounded-2xl p-5">
                    <h4 className="font-semibold text-dream-slate-800 mb-2">{activeReading.title}</h4>
                    <p className="text-xs text-dream-blue-500 mb-3">来源：{activeReading.source} · {activeReading.sourceValue}</p>
                    {activeReading.notes && (
                      <div className="text-xs text-dream-slate-600 bg-dream-blue-50/60 p-3 rounded-xl mb-3 border border-dream-blue-100"><Lightbulb className="w-3.5 h-3.5 inline mr-1 text-dream-blue-500" />{activeReading.notes}</div>
                    )}
                    <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
                      {activeReading.segments.length === 0 && <p className="text-sm text-dream-blue-400 text-center py-6">该论文无分段数据</p>}
                      {activeReading.segments.map((seg, idx) => (
                        <div key={seg.id}>
                          {activeReading.figureMarkers.filter(m => m.position === idx).map(m => (
                            <div key={m.id} className="my-2 p-2 bg-red-50 border border-dashed border-pink-300 rounded-lg flex items-center gap-2 text-xs text-red-600">
                              <FileTextIcon className="w-3.5 h-3.5" /><span className="font-semibold">{m.label}</span><span>· {m.description}</span>
                            </div>
                          ))}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-white/60 rounded-xl border border-dream-blue-100">
                            <p className="text-sm text-gray-700 leading-relaxed">{seg.en}</p>
                            <p className="text-sm text-dream-slate-700 leading-relaxed bg-dream-blue-50/40 p-2 rounded-lg">{seg.zh}</p>
                          </div>
                          <p className="text-[10px] text-dream-blue-300 mt-1">第 {idx + 1} 段</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeReading.terminology.length > 0 && (
                    <div className="glass-card rounded-2xl p-5">
                      <h5 className="font-semibold text-dream-slate-800 mb-3 flex items-center gap-2"><Quote className="w-4 h-4 text-dream-blue-500" />关键术语表（Terminology Ledger）</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activeReading.terminology.map(t => (
                          <div key={t.id} className="p-3 bg-dream-blue-50/50 rounded-lg border border-dream-blue-100">
                            <p className="text-sm font-medium text-dream-slate-700">{t.term}</p>
                            <p className="text-xs text-dream-blue-600 mt-0.5">译：{t.translation}</p>
                            {t.definition && <p className="text-xs text-dream-blue-400 mt-1">{t.definition}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => { deleteReadingPaper(activeReading.id); setActiveReadingId(null); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" />删除该论文</button>
                </>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <BookOpen className="w-12 h-12 text-dream-blue-300 mx-auto mb-4" />
                  <p className="text-dream-blue-500">选择左侧论文开始精读，或添加新论文</p>
                </div>
              )}
            </div>
          </div>

          {/* 文献翻译 */}
          <div className="glass-card rounded-2xl p-5">
            <h4 className="font-semibold text-dream-slate-800 mb-3 flex items-center gap-2"><Languages className="w-4 h-4 text-dream-blue-500" />文献翻译</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-dream-blue-500 mb-1 block">英文原文</label>
                <textarea value={translateInput} onChange={e => setTranslateInput(e.target.value)} placeholder="粘贴英文段落，保留学术用语准确性..." rows={5} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
                <button onClick={handleTranslate} className="mt-2 flex items-center gap-1.5 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Languages className="w-4 h-4" />翻译为中文</button>
              </div>
              <div>
                <label className="text-xs text-dream-blue-500 mb-1 block">中文译文</label>
                <textarea value={translateOutput} readOnly placeholder="译文将显示在此处..." rows={5} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/40 border border-dream-blue-100 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
                {translateOutput && <p className="text-xs text-dream-blue-400 mt-1"><AlertCircle className="w-3 h-3 inline mr-1" />翻译笔记：基于本地术语词典替换，专有名词与长句请人工复核</p>}
              </div>
            </div>
          </div>

          {/* 术语表管理 */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-dream-slate-800 flex items-center gap-2"><Quote className="w-4 h-4 text-dream-blue-500" />术语表（{terminologyLedger.length}）</h4>
              <button onClick={() => setShowAddTerm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-dream-blue-50 text-dream-slate-600 rounded-lg text-xs font-medium hover:bg-dream-blue-100 transition-colors"><Plus className="w-3.5 h-3.5" />添加术语</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {terminologyLedger.map(t => (
                <div key={t.id} className="p-3 bg-white/60 rounded-lg border border-dream-blue-100 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dream-slate-700 truncate">{t.term}</p>
                    <p className="text-xs text-dream-blue-600">{t.translation}</p>
                    {t.definition && <p className="text-xs text-dream-blue-400 mt-1 line-clamp-2">{t.definition}</p>}
                  </div>
                  <button onClick={() => deleteTerminology(t.id)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== Tab 3: 研究助手（ARS）===== */}
      {activeTab === 'assistant' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex gap-2 flex-wrap">
            {([
              { id: 'question', label: '研究问题梳理', icon: FileQuestion },
              { id: 'matrix', label: '文献综述助手', icon: Table2 },
              { id: 'writing', label: '论文写作助手', icon: PenLine },
            ] as { id: AssistantSubTab; label: string; icon: typeof FileQuestion }[]).map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setAssistantSubTab(s.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${assistantSubTab === s.id ? 'gradient-bg text-white shadow-soft' : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100'}`}>
                  <Icon className="w-4 h-4" />{s.label}
                </button>
              );
            })}
          </div>

          {/* 3a: 研究问题梳理（苏格拉底模式）*/}
          {assistantSubTab === 'question' && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <h4 className="font-semibold text-dream-slate-800 mb-3 flex items-center gap-2"><FileQuestion className="w-5 h-5 text-dream-blue-500" />研究问题梳理（Socratic Mode）</h4>
                <p className="text-sm text-dream-blue-500 mb-4">输入宽泛的研究方向，系统通过 3-5 个苏格拉底式提问帮助收敛研究问题，支持 PICO / PEO / SPIDER / PCC 框架</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="md:col-span-2">
                    <label className="text-xs text-dream-blue-500 mb-1 block">研究方向</label>
                    <input value={rqTopic} onChange={e => setRqTopic(e.target.value)} placeholder="例如：生物正交化学在活体成像中的应用" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-dream-blue-500 mb-1 block">问题框架</label>
                    <select value={rqFramework} onChange={e => setRqFramework(e.target.value as ResearchFramework)} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm">
                      <option value="PICO">PICO（干预研究）</option>
                      <option value="PEO">PEO（观察研究）</option>
                      <option value="SPIDER">SPIDER（混合方法）</option>
                      <option value="PCC">PCC（范围综述）</option>
                      <option value="none">不限定</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleStartRQ} className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Sparkles className="w-4 h-4" />生成苏格拉底提问</button>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {researchQuestionTemplates.map(t => (
                    <div key={t.framework} className="p-3 bg-white/60 rounded-xl border border-dream-blue-100">
                      <p className="text-sm font-semibold text-dream-slate-700">{t.name}</p>
                      <p className="text-xs text-dream-blue-500 mt-0.5">{t.description}</p>
                      <p className="text-xs text-dream-blue-400 mt-1">示例：{t.example}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 历史研究问题 */}
              <div className="glass-card rounded-2xl p-5">
                <h5 className="font-semibold text-dream-slate-800 mb-3">研究问题历史（{researchQuestions.length}）</h5>
                <div className="space-y-2">
                  {researchQuestions.map(rq => (
                    <div key={rq.id} className={`p-3 rounded-xl border cursor-pointer transition-all ${activeRqId === rq.id ? 'border-lavender-400 bg-lavender-50/50' : 'border-dream-blue-100 bg-white/60 hover:bg-dream-blue-50'}`} onClick={() => { setActiveRqId(rq.id); setRqAnswers([...rq.answers]); setRefinedText(rq.refinedQuestion); }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dream-slate-700">方向：{rq.topic}</p>
                          <p className="text-xs text-dream-blue-400 mt-0.5">框架：{rq.framework} · {rq.socraticQuestions.length} 个提问</p>
                          {rq.refinedQuestion && <p className="text-xs text-emerald-600 mt-1"><Check className="w-3 h-3 inline mr-1" />{rq.refinedQuestion}</p>}
                        </div>
                        <button onClick={e => { e.stopPropagation(); deleteResearchQuestion(rq.id); if (activeRqId === rq.id) setActiveRqId(null); }} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {researchQuestions.length === 0 && <p className="text-sm text-dream-blue-400 text-center py-4">暂无研究问题，请先生成</p>}
                </div>
              </div>

              {/* 苏格拉底问答 */}
              {activeRq && (
                <div className="glass-card rounded-2xl p-5">
                  <h5 className="font-semibold text-dream-slate-800 mb-3 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-dream-blue-500" />苏格拉底式问答</h5>
                  <div className="space-y-3">
                    {activeRq.socraticQuestions.map((q, i) => (
                      <div key={i}>
                        <p className="text-sm font-medium text-dream-slate-700 mb-1"><span className="text-dream-blue-500">Q{i + 1}.</span> {q}</p>
                        <textarea value={rqAnswers[i] || ''} onChange={e => { const next = [...rqAnswers]; next[i] = e.target.value; setRqAnswers(next); }} placeholder="输入你的回答..." rows={2} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleSaveAnswers} className="flex items-center gap-1.5 px-4 py-2 bg-dream-blue-50 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-100 transition-colors"><Check className="w-4 h-4" />保存回答</button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-dream-blue-100">
                    <label className="text-xs text-dream-blue-500 mb-1 block">收敛后的研究问题（可迭代优化）</label>
                    <textarea value={refinedText} onChange={e => setRefinedText(e.target.value)} placeholder="综合上述回答，凝练为一个明确、可研究的问题..." rows={3} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
                    <button onClick={handleRefine} className="mt-2 flex items-center gap-1.5 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><CheckCircle2 className="w-4 h-4" />保存研究问题</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3b: 文献综述助手 */}
          {assistantSubTab === 'matrix' && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <h4 className="font-semibold text-dream-slate-800 mb-3 flex items-center gap-2"><Database className="w-5 h-5 text-dream-blue-500" />文献检索策略生成</h4>
                <div className="flex gap-2 mb-3">
                  <input value={strategyQuestion} onChange={e => setStrategyQuestion(e.target.value)} placeholder="输入研究问题生成检索策略..." className="flex-1 px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm" />
                  <button onClick={handleGenStrategy} className="flex items-center gap-1.5 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Search className="w-4 h-4" />生成</button>
                </div>
                {searchStrategy && (
                  <div className="bg-dream-blue-50/60 p-4 rounded-xl border border-dream-blue-100">
                    <pre className="text-sm text-dream-slate-700 whitespace-pre-wrap font-sans">{searchStrategy.strategy}</pre>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {searchStrategy.keywords.map((k, i) => (<span key={i} className="px-2 py-1 bg-white text-dream-blue-600 text-xs rounded-full border border-dream-blue-200">{k}</span>))}
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h4 className="font-semibold text-dream-slate-800 flex items-center gap-2"><Table2 className="w-5 h-5 text-dream-blue-500" />文献矩阵（{literatureMatrix.length}）</h4>
                  <div className="flex gap-2">
                    <button onClick={handleImportPapersToMatrix} className="flex items-center gap-1.5 px-3 py-1.5 bg-dream-blue-50 text-dream-slate-600 rounded-lg text-xs font-medium hover:bg-dream-blue-100 transition-colors"><Upload className="w-3.5 h-3.5" />从文献库导入</button>
                    <button onClick={exportLiteratureMatrixCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-dream-blue-50 text-dream-slate-600 rounded-lg text-xs font-medium hover:bg-dream-blue-100 transition-colors"><Download className="w-3.5 h-3.5" />导出 CSV</button>
                    <button onClick={() => setShowAddMatrix(true)} className="flex items-center gap-1.5 px-3 py-1.5 gradient-btn text-white rounded-lg text-xs font-medium"><Plus className="w-3.5 h-3.5" />添加</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-dream-blue-500 text-xs border-b border-dream-blue-100">
                        <th className="py-2 pr-2 min-w-[160px]">标题</th>
                        <th className="py-2 pr-2 min-w-[80px]">年份</th>
                        <th className="py-2 pr-2 min-w-[140px]">研究方法</th>
                        <th className="py-2 pr-2 min-w-[160px]">主要发现</th>
                        <th className="py-2 pr-2 min-w-[120px]">局限性</th>
                        <th className="py-2 pr-2 min-w-[120px]">与本研究的关联</th>
                        <th className="py-2">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {literatureMatrix.map(e => (
                        <tr key={e.id} className="border-b border-purple-50 align-top">
                          <td className="py-2 pr-2">
                            <p className="font-medium text-dream-slate-700 text-xs">{e.title}</p>
                            <p className="text-dream-blue-400 text-xs">{e.authors}</p>
                          </td>
                          <td className="py-2 pr-2 text-dream-slate-600 text-xs">{e.year}</td>
                          <td className="py-2 pr-2 text-dream-slate-600 text-xs">{e.methods || <span className="text-dream-blue-300">—</span>}</td>
                          <td className="py-2 pr-2 text-dream-slate-600 text-xs">{e.mainFindings || <span className="text-dream-blue-300">—</span>}</td>
                          <td className="py-2 pr-2 text-dream-slate-600 text-xs">{e.limitations || <span className="text-dream-blue-300">—</span>}</td>
                          <td className="py-2 pr-2 text-dream-slate-600 text-xs">{e.relevance || <span className="text-dream-blue-300">—</span>}</td>
                          <td className="py-2">
                            <button onClick={() => { setEditingMatrixId(editingMatrixId === e.id ? null : e.id); }} className="text-dream-blue-500 hover:text-lavender-700 text-xs">{editingMatrixId === e.id ? '收起' : '编辑'}</button>
                            <button onClick={() => deleteLiteratureMatrixEntry(e.id)} className="text-red-400 hover:text-red-600 text-xs ml-1">删除</button>
                          </td>
                        </tr>
                      ))}
                      {editingMatrixId && (() => {
                        const e = literatureMatrix.find(x => x.id === editingMatrixId);
                        if (!e) return null;
                        return (
                          <tr><td colSpan={7} className="py-3 bg-dream-blue-50/40">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(['methods', 'mainFindings', 'limitations', 'relevance'] as const).map(field => (
                                <div key={field}>
                                  <label className="text-xs text-dream-blue-500 block mb-0.5">{field === 'mainFindings' ? '主要发现' : field === 'limitations' ? '局限性' : field === 'relevance' ? '与本研究的关联' : '研究方法'}</label>
                                  <textarea value={e[field]} onChange={ev => updateLiteratureMatrixEntry(e.id, { [field]: ev.target.value })} rows={2} className="w-full px-2 py-1 rounded-lg bg-white border border-dream-blue-100 text-dream-slate-700 text-xs resize-none" />
                                </div>
                              ))}
                            </div>
                          </td></tr>
                        );
                      })()}
                    </tbody>
                  </table>
                  {literatureMatrix.length === 0 && <p className="text-sm text-dream-blue-400 text-center py-6">暂无文献矩阵数据</p>}
                </div>
              </div>
            </div>
          )}

          {/* 3c: 论文写作助手 */}
          {assistantSubTab === 'writing' && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <h4 className="font-semibold text-dream-slate-800 mb-3 flex items-center gap-2"><PenLine className="w-5 h-5 text-dream-blue-500" />论文大纲生成（IMRaD 结构）</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                  <input value={outlineTitle} onChange={e => setOutlineTitle(e.target.value)} placeholder="论文标题（可选）" className="px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm" />
                  <input value={outlineQuestion} onChange={e => setOutlineQuestion(e.target.value)} placeholder="研究问题" className="md:col-span-2 px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm" />
                </div>
                <button onClick={handleGenOutline} className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Sparkles className="w-4 h-4" />生成大纲</button>

                <div className="mt-4 space-y-3">
                  {paperOutlines.map(o => (
                    <div key={o.id} className="p-4 bg-white/60 rounded-xl border border-dream-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-dream-slate-700 text-sm">{o.title}</p>
                        <button onClick={() => deleteOutline(o.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <p className="text-xs text-dream-blue-400 mb-2">研究问题：{o.researchQuestion}</p>
                      <div className="space-y-2">
                        {o.sections.map(s => (
                          <div key={s.id}>
                            <p className="text-sm font-medium text-dream-blue-600">{s.name}</p>
                            <ul className="ml-4 mt-1 space-y-0.5">
                              {s.subsections.map(sub => (<li key={sub.id} className="text-xs text-dream-slate-600">· <span className="font-medium">{sub.name}</span>：{sub.description}</li>))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {paperOutlines.length === 0 && <p className="text-sm text-dream-blue-400 text-center py-4">暂无大纲，请生成</p>}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <h4 className="font-semibold text-dream-slate-800 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-dream-blue-500" />摘要生成器（结构化）</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <textarea value={abstractForm.background} onChange={e => setAbstractForm({ ...abstractForm, background: e.target.value })} placeholder="背景..." rows={2} className="px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
                  <textarea value={abstractForm.methods} onChange={e => setAbstractForm({ ...abstractForm, methods: e.target.value })} placeholder="方法..." rows={2} className="px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
                  <textarea value={abstractForm.results} onChange={e => setAbstractForm({ ...abstractForm, results: e.target.value })} placeholder="结果..." rows={2} className="px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
                  <textarea value={abstractForm.conclusion} onChange={e => setAbstractForm({ ...abstractForm, conclusion: e.target.value })} placeholder="结论..." rows={2} className="px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
                </div>
                <button onClick={handleGenAbstract} className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Sparkles className="w-4 h-4" />生成摘要</button>
                {paperAbstracts.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {paperAbstracts.slice(0, 3).map(a => (
                      <div key={a.id} className="p-3 bg-dream-blue-50/50 rounded-xl border border-dream-blue-100">
                        <p className="text-sm text-dream-slate-700 leading-relaxed">{a.generatedAbstract}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card rounded-2xl p-5">
                <h4 className="font-semibold text-dream-slate-800 mb-3 flex items-center gap-2"><PenLine className="w-5 h-5 text-dream-blue-500" />AI 润色建议</h4>
                <textarea value={polishInput} onChange={e => setPolishInput(e.target.value)} placeholder="粘贴需要润色的学术文本..." rows={4} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
                <button onClick={handlePolish} className="mt-2 flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Sparkles className="w-4 h-4" />生成润色建议</button>
                {polishResult && (
                  <div className="mt-3 space-y-2">
                    {polishResult.map((s, i) => (
                      <div key={i} className="p-3 bg-white/60 rounded-xl border border-dream-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${s.type === 'academic' ? 'bg-red-100 text-red-600' : s.type === 'clarity' ? 'bg-blue-100 text-blue-600' : s.type === 'conciseness' ? 'bg-emerald-100 text-emerald-600' : 'bg-dream-blue-100 text-dream-slate-600'}`}>{s.type}</span>
                          <span className="text-xs text-dream-blue-400">原文：{s.original}</span>
                        </div>
                        <p className="text-sm text-dream-slate-700">建议：{s.suggestion}</p>
                        <p className="text-xs text-dream-blue-400 mt-0.5">原因：{s.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== Tab 4: 实验规划 ===== */}
      {activeTab === 'experiment' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex gap-2 flex-wrap">
            {([
              { id: 'plans', label: '实验设计', icon: ClipboardList },
              { id: 'notes', label: '实验周报', icon: Calendar },
              { id: 'chat', label: 'AI实验指导', icon: MessageCircle },
            ] as { id: ExpSubTab; label: string; icon: typeof ClipboardList }[]).map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setExpSubTab(s.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${expSubTab === s.id ? 'gradient-bg text-white shadow-soft' : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100'}`}>
                  <Icon className="w-4 h-4" />{s.label}
                </button>
              );
            })}
          </div>

          {/* 4a: 实验设计（Experiment Agent）*/}
          {expSubTab === 'plans' && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-4 bg-gradient-to-r from-lavender-50/50 to-purple-50/50">
                <p className="text-sm text-dream-slate-600 flex items-center gap-2"><Beaker className="w-4 h-4 text-dream-blue-500" />实验设计模板：假设 → 变量 → 对照组 → 样本量 → 步骤，附可勾选的实验检查清单</p>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-lg font-semibold text-dream-slate-800 font-display">实验计划 · 共 {experimentPlans.length} 个</h3>
                <button onClick={() => setShowAddPlan(true)} className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" />新建实验计划</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  {experimentPlans.map(p => (
                    <button key={p.id} onClick={() => setActivePlanId(p.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${activePlanId === p.id ? 'gradient-bg text-white border-transparent shadow-soft' : 'bg-white/70 border-dream-blue-100 hover:bg-dream-blue-50'}`}>
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className={`text-xs mt-1 ${activePlanId === p.id ? 'text-white/80' : 'text-dream-blue-400'}`}>{p.steps.filter(s => s.completed).length}/{p.steps.length} 步完成</p>
                    </button>
                  ))}
                  {experimentPlans.length === 0 && <p className="text-sm text-dream-blue-400 text-center py-6">暂无实验计划</p>}
                </div>
                <div className="lg:col-span-2">
                  {activePlan ? (
                    <div className="glass-card rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-dream-slate-800">{activePlan.title}</h4>
                        <button onClick={() => { deleteExperimentPlan(activePlan.id); setActivePlanId(null); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-dream-blue-50/50 rounded-lg"><p className="text-xs text-dream-blue-400">假设</p><p className="text-dream-slate-700">{activePlan.hypothesis || '—'}</p></div>
                        <div className="p-2 bg-dream-blue-50/50 rounded-lg"><p className="text-xs text-dream-blue-400">样本量</p><p className="text-dream-slate-700">{activePlan.sampleSize || '—'}</p></div>
                        <div className="p-2 bg-red-50/50 rounded-lg"><p className="text-xs text-dream-blue-400">自变量</p><p className="text-dream-slate-700">{activePlan.independentVariable || '—'}</p></div>
                        <div className="p-2 bg-red-50/50 rounded-lg"><p className="text-xs text-dream-blue-400">因变量</p><p className="text-dream-slate-700">{activePlan.dependentVariable || '—'}</p></div>
                        <div className="p-2 bg-emerald-50/50 rounded-lg md:col-span-2"><p className="text-xs text-dream-blue-400">对照组</p><p className="text-dream-slate-700">{activePlan.controlGroup || '—'}</p></div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dream-slate-700 mb-2 flex items-center gap-2"><ListChecks className="w-4 h-4 text-dream-blue-500" />实验检查清单</p>
                        <div className="space-y-1.5">
                          {activePlan.steps.map(step => (
                            <button key={step.id} onClick={() => toggleExperimentStep(activePlan.id, step.id)} className={`w-full flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left ${step.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-white/60 border-dream-blue-100 hover:bg-dream-blue-50'}`}>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-emerald-500' : 'border-2 border-purple-300'}`}>{step.completed && <Check className="w-3 h-3 text-white" />}</div>
                              <span className={`text-sm ${step.completed ? 'text-emerald-700 line-through' : 'text-dream-slate-700'}`}>{step.text}</span>
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <input value={newStepText} onChange={e => setNewStepText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddStep(activePlan.id); }} placeholder="添加新步骤..." className="flex-1 px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
                          <button onClick={() => handleAddStep(activePlan.id)} className="flex items-center gap-1 px-3 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" />添加</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl p-12 text-center"><ClipboardList className="w-12 h-12 text-dream-blue-300 mx-auto mb-4" /><p className="text-dream-blue-500">选择左侧实验计划查看详情</p></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4b: 实验周报 */}
          {expSubTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-lg font-semibold text-dream-slate-800 font-display">实验周报 · 第 {currentWeek} 周</h3>
                <div className="flex gap-2">
                  <button onClick={handleGenerateWeeklyReport} className="flex items-center gap-2 px-4 py-2 bg-dream-blue-50 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-100 transition-colors"><FileTextIcon className="w-4 h-4" />生成本周周报</button>
                  <button onClick={() => setShowAddNote(true)} className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" />新建记录</button>
                </div>
              </div>
              <div className="space-y-4">
                {experimentNotes.map((note, index) => (
                  <div key={note.id} className={`glass-card glass-card-hover rounded-2xl p-6 animate-fade-in-up stagger-${(index % 4) + 1}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="font-semibold text-dream-slate-800">{note.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-dream-blue-400 whitespace-nowrap flex-shrink-0"><Clock className="w-3 h-3" />{formatDate(note.date)}</div>
                    </div>
                    <p className="text-sm text-dream-slate-600 mb-4 leading-relaxed">{note.content}</p>
                    <div className="flex gap-2 flex-wrap">{note.tags.map((tag) => (<span key={tag} className="flex items-center gap-1 px-3 py-1 bg-red-100/80 text-red-600 rounded-full text-xs"><Tag className="w-3 h-3" />{tag}</span>))}</div>
                  </div>
                ))}
                {experimentNotes.length === 0 && (<div className="glass-card rounded-2xl p-12 text-center"><Calendar className="w-12 h-12 text-dream-blue-300 mx-auto mb-4" /><p className="text-dream-blue-500">暂无实验记录</p></div>)}
              </div>
            </div>
          )}

          {/* 4c: AI实验指导 */}
          {expSubTab === 'chat' && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-dream-blue-100/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
                  <div><h3 className="font-semibold text-dream-slate-800">AI 实验助手</h3><p className="text-xs text-green-500 flex items-center gap-1"><span className="w-2 h-2 bg-mint-400 rounded-full animate-pulse" />在线，随时为你解答实验问题</p></div>
                </div>
                <button onClick={handleClearChat} className="flex items-center gap-1 px-3 py-1.5 bg-dream-blue-50 text-dream-blue-500 rounded-lg text-xs font-medium hover:bg-dream-blue-100 transition-colors"><Trash2 className="w-3.5 h-3.5" />清空对话</button>
              </div>
              <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-dream-blue-100' : 'gradient-bg'}`}>{msg.role === 'user' ? <User className="w-4 h-4 text-dream-slate-600" /> : <Bot className="w-4 h-4 text-white" />}</div>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'gradient-bg text-white rounded-tr-md' : 'bg-dream-blue-50/80 text-dream-slate-700 rounded-tl-md'}`}><p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p></div>
                  </div>
                ))}
                {isChatLoading && (<div className="flex gap-3"><div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-white" /></div><div className="bg-dream-blue-50/80 p-4 rounded-2xl rounded-tl-md"><div className="flex items-center gap-2"><Loader2 className="w-4 h-4 text-dream-blue-500 animate-spin" /><span className="text-sm text-dream-blue-500">正在思考中...</span></div></div></div>)}
                <div ref={chatEndRef} />
              </div>
              {chatMessages.length <= 1 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-dream-blue-400 mb-2 flex items-center gap-1"><Lightbulb className="w-3 h-3" />快速提问：</p>
                  <div className="flex flex-wrap gap-2">{quickQuestions.map((q, i) => (<button key={i} onClick={() => handleQuickQuestion(q)} className="px-3 py-1.5 bg-dream-blue-50 text-dream-slate-600 rounded-full text-xs hover:bg-dream-blue-100 transition-colors">{q}</button>))}</div>
                </div>
              )}
              <div className="p-4 border-t border-dream-blue-100/50">
                <div className="flex gap-3">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="输入你的实验问题..." className="flex-1 px-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100/50 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-dream-blue-200 transition-all text-dream-slate-700 placeholder-purple-400" disabled={isChatLoading} />
                  <button onClick={handleSend} disabled={isChatLoading || !input.trim()} className="gradient-btn px-6 py-3 rounded-xl text-white flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"><Send className="w-4 h-4" />发送</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== Tab 5: 思维导图 ===== */}
      {activeTab === 'mindmap' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex gap-2 flex-wrap">
            {([
              { id: 'framework', label: '研究框架图', icon: Workflow },
              { id: 'literature', label: '文献思维导图', icon: GitBranch },
              { id: 'ppt', label: 'PPT生成', icon: Sparkles },
            ] as { id: MindSubTab; label: string; icon: typeof Workflow }[]).map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setMindSubTab(s.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mindSubTab === s.id ? 'gradient-bg text-white shadow-soft' : 'bg-dream-blue-50/80 text-dream-slate-600 hover:bg-dream-blue-100'}`}>
                  <Icon className="w-4 h-4" />{s.label}
                </button>
              );
            })}
          </div>

          {/* 5a: 研究框架图 */}
          {mindSubTab === 'framework' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-lg font-semibold text-dream-slate-800 font-display flex items-center gap-2"><Workflow className="w-5 h-5 text-dream-blue-500" />研究框架图</h3>
                <button onClick={() => setShowAddFramework(true)} className="flex items-center gap-2 px-4 py-2 gradient-btn text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" />生成框架图</button>
              </div>
              <div className="glass-card rounded-2xl p-4 bg-gradient-to-r from-lavender-50/50 to-purple-50/50">
                <p className="text-sm text-dream-slate-600 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-dream-blue-500" />可视化研究逻辑：研究问题 → 方法 → 预期结果。支持实验流程图 / 机制图 / 数据流图三种模板，可导出 SVG</p>
              </div>
              <div className="space-y-4">
                {frameworkFigures.length === 0 && <div className="glass-card rounded-2xl p-12 text-center"><Workflow className="w-12 h-12 text-dream-blue-300 mx-auto mb-4" /><p className="text-dream-blue-500">暂无框架图，点击"生成框架图"创建</p></div>}
                {frameworkFigures.map(fig => (
                  <div key={fig.id} onClick={() => setActiveFrameworkId(fig.id === activeFrameworkId ? null : fig.id)} className="cursor-pointer">
                    <FrameworkView figId={fig.id} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5b: 文献思维导图 */}
          {mindSubTab === 'literature' && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-4 bg-gradient-to-r from-lavender-50/50 to-purple-50/50">
                <p className="text-sm text-dream-slate-600 flex items-center gap-2"><GitBranch className="w-4 h-4 text-dream-blue-500" />从文献库选择一篇生成思维导图，含研究框架节点，支持自定义节点颜色与连线</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {papers.slice(0, 6).map(paper => (
                  <div key={paper.id} className="glass-card glass-card-hover rounded-2xl p-4">
                    <h4 className="font-semibold text-dream-slate-800 text-sm mb-1 line-clamp-2">{paper.title}</h4>
                    <p className="text-xs text-dream-blue-500 mb-3">{paper.journal} · {formatDate(paper.date)}</p>
                    <button onClick={() => setShowMindMap(paper.id)} className="flex items-center gap-1.5 px-3 py-1.5 gradient-btn text-white rounded-lg text-xs font-medium"><Network className="w-3.5 h-3.5" />查看思维导图</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5c: PPT生成 */}
          {mindSubTab === 'ppt' && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mx-auto mb-6 shadow-soft-lg"><Sparkles className="w-10 h-10 text-white icon-glow" /></div>
              <h3 className="text-xl font-display font-bold gradient-text mb-2">文献汇报 PPT 生成</h3>
              <p className="text-dream-blue-500 mb-6 max-w-md mx-auto">自动生成精选文献的汇报 PPT，含思维导图逻辑框架和模拟演讲稿</p>
              {pptData ? (
                <div className="max-w-md mx-auto mb-6 p-5 bg-green-50 rounded-2xl border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <p className="font-medium text-mint-700">PPT 生成完成！</p>
                      <p className="text-xs text-green-600">包含 {pptData.paperCount} 篇文献，共 {pptData.slides.length} 页</p>
                      <p className="text-xs text-green-500 mt-0.5">生成日期：{pptData.generatedDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => { setCurrentSlideIndex(0); setShowPPTViewer(true); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-mint-600 transition-colors"><Eye className="w-4 h-4" />查看 PPT</button>
                    <button onClick={handleDownloadPPT} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-green-600 rounded-xl text-sm font-medium border border-green-200 hover:bg-green-50 transition-colors"><Download className="w-4 h-4" />下载 PPT</button>
                  </div>
                  <button onClick={() => setShowSpeechModal(true)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-mint-100 hover:bg-green-100 transition-colors"><FileTextIcon className="w-4 h-4" />查看演讲稿</button>
                </div>
              ) : isGeneratingPPT ? (
                <div className="max-w-md mx-auto mb-6 p-5 bg-dream-blue-50 rounded-2xl">
                  <div className="flex items-center justify-center gap-3 mb-3"><Loader2 className="w-6 h-6 text-dream-blue-500 animate-spin" /><p className="text-dream-slate-700 font-medium">正在生成 PPT...</p></div>
                  <div className="h-2 bg-dream-blue-200 rounded-full overflow-hidden"><div className="h-full gradient-bg rounded-full animate-pulse" style={{ width: '65%' }} /></div>
                  <p className="text-xs text-dream-blue-500 mt-2">正在整理文献内容和思维导图框架...</p>
                </div>
              ) : null}
              {!pptData && !isGeneratingPPT && (<button onClick={handleGeneratePPT} className="inline-flex items-center gap-2 px-6 py-3 gradient-btn text-white rounded-xl cursor-pointer"><FileText className="w-5 h-5" />生成最新汇报 PPT</button>)}
              {pptData && (<div className="mt-4"><button onClick={handleGeneratePPT} disabled={isGeneratingPPT} className="inline-flex items-center gap-2 px-4 py-2 text-sm text-dream-blue-500 hover:text-dream-slate-700 transition-colors disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${isGeneratingPPT ? 'animate-spin' : ''}`} />重新生成</button></div>)}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-dream-blue-50/50 rounded-xl"><p className="text-2xl font-display font-bold gradient-text">3-4篇</p><p className="text-xs text-dream-blue-500 mt-1">精选文献</p></div>
                <div className="p-4 bg-red-50/50 rounded-xl"><p className="text-2xl font-display font-bold gradient-text">8+页</p><p className="text-xs text-dream-blue-500 mt-1">精美PPT</p></div>
                <div className="p-4 bg-green-50/50 rounded-xl"><p className="text-2xl font-display font-bold gradient-text">思维导图</p><p className="text-xs text-dream-blue-500 mt-1">逻辑框架</p></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== 弹窗：添加文献 ===== */}
      {showAddPaper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddPaper(false)}>
          <div className="glass-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur z-10">
              <h3 className="font-semibold text-dream-slate-800 text-lg">添加文献</h3>
              <button onClick={() => setShowAddPaper(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-sm text-dream-slate-600 mb-1 block">标题 *</label><input type="text" value={newPaper.title} onChange={e => setNewPaper({ ...newPaper, title: e.target.value })} placeholder="输入文献标题" className="w-full px-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-dream-slate-600 mb-1 block">作者</label><input type="text" value={newPaper.authors} onChange={e => setNewPaper({ ...newPaper, authors: e.target.value })} placeholder="作者列表" className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm" /></div>
                <div><label className="text-sm text-dream-slate-600 mb-1 block">期刊</label><input type="text" value={newPaper.journal} onChange={e => setNewPaper({ ...newPaper, journal: e.target.value })} placeholder="期刊名称" className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm" /></div>
              </div>
              <div><label className="text-sm text-dream-slate-600 mb-1 block">发表日期</label><input type="date" value={newPaper.date} onChange={e => setNewPaper({ ...newPaper, date: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm" /></div>
              <div><label className="text-sm text-dream-slate-600 mb-1 block">摘要</label><textarea value={newPaper.abstract} onChange={e => setNewPaper({ ...newPaper, abstract: e.target.value })} placeholder="输入文献摘要..." rows={4} className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none" /></div>
              <div><label className="text-sm text-dream-slate-600 mb-1 block">标签（用逗号分隔）</label><input type="text" value={newPaper.tags} onChange={e => setNewPaper({ ...newPaper, tags: e.target.value })} placeholder="例如：点击化学, 蛋白质标记, 活体成像" className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm" /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddPaper(false)} className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors">取消</button>
                <button onClick={handleAddPaper} className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium">添加</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 弹窗：新建实验记录 ===== */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddNote(false)}>
          <div className="glass-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur z-10">
              <h3 className="font-semibold text-dream-slate-800 text-lg">新建实验记录</h3>
              <button onClick={() => setShowAddNote(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-sm text-dream-slate-600 mb-1 block">实验标题 *</label><input type="text" value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} placeholder="输入实验标题" className="w-full px-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400" /></div>
              <div><label className="text-sm text-dream-slate-600 mb-1 block">日期</label><input type="date" value={newNote.date} onChange={e => setNewNote({ ...newNote, date: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 text-sm" /></div>
              <div><label className="text-sm text-dream-slate-600 mb-1 block">实验内容</label><textarea value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })} placeholder="记录实验过程、结果、心得..." rows={6} className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none" /></div>
              <div><label className="text-sm text-dream-slate-600 mb-1 block">标签（用逗号分隔）</label><input type="text" value={newNote.tags} onChange={e => setNewNote({ ...newNote, tags: e.target.value })} placeholder="例如：WB, 细胞实验, 点击化学" className="w-full px-4 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm" /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddNote(false)} className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors">取消</button>
                <button onClick={handleAddNote} className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 弹窗：批量导入 ===== */}
      {showBatchImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowBatchImport(false)}>
          <div className="glass-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur z-10">
              <h3 className="font-semibold text-dream-slate-800 text-lg">批量导入文献</h3>
              <button onClick={() => setShowBatchImport(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {importSuccess !== null ? (
                <div className="text-center py-8"><CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" /><p className="text-lg font-semibold text-mint-700">导入成功！</p><p className="text-sm text-green-600 mt-1">共导入 {importSuccess} 篇文献</p></div>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-dream-slate-600 mb-2 block flex items-center gap-2"><FileTextIcon className="w-4 h-4" />批量导入格式说明</label>
                    <div className="bg-dream-blue-50/80 rounded-xl p-3 border border-dream-blue-100">
                      <p className="text-xs text-dream-blue-500 mb-2">每行一篇文献，用 <code className="bg-white px-1.5 py-0.5 rounded text-dream-slate-600 font-mono">|</code> 分隔字段：</p>
                      <p className="text-xs text-dream-slate-600 font-mono">标题|作者|期刊|日期|摘要|标签1,标签2</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-dream-slate-600 mb-1 block">文献数据</label>
                    <textarea value={batchImportText} onChange={e => setBatchImportText(e.target.value)} placeholder={`示例：\nTetrazine Bioorthogonal Chemistry|Robinson CJ, et al.|Nature Chemical Biology|2025-03-12|研究开发了...|四嗪化学,体内成像`} rows={10} className="w-full px-4 py-3 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 transition-all text-dream-slate-700 placeholder-purple-400 text-sm resize-none font-mono" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowBatchImport(false)} className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors">取消</button>
                    <button onClick={handleBatchImport} className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium">导入</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== 弹窗：添加文献矩阵条目 ===== */}
      {showAddMatrix && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddMatrix(false)}>
          <div className="glass-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur z-10">
              <h3 className="font-semibold text-dream-slate-800 text-lg">添加文献矩阵条目</h3>
              <button onClick={() => setShowAddMatrix(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
            </div>
            <div className="p-6 space-y-3">
              <input value={newMatrixEntry.title} onChange={e => setNewMatrixEntry({ ...newMatrixEntry, title: e.target.value })} placeholder="标题 *" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input value={newMatrixEntry.authors} onChange={e => setNewMatrixEntry({ ...newMatrixEntry, authors: e.target.value })} placeholder="作者" className="px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
                <input value={newMatrixEntry.year} onChange={e => setNewMatrixEntry({ ...newMatrixEntry, year: e.target.value })} placeholder="年份" className="px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              </div>
              <textarea value={newMatrixEntry.methods} onChange={e => setNewMatrixEntry({ ...newMatrixEntry, methods: e.target.value })} placeholder="研究方法" rows={2} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
              <textarea value={newMatrixEntry.mainFindings} onChange={e => setNewMatrixEntry({ ...newMatrixEntry, mainFindings: e.target.value })} placeholder="主要发现" rows={2} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
              <textarea value={newMatrixEntry.limitations} onChange={e => setNewMatrixEntry({ ...newMatrixEntry, limitations: e.target.value })} placeholder="局限性" rows={2} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
              <textarea value={newMatrixEntry.relevance} onChange={e => setNewMatrixEntry({ ...newMatrixEntry, relevance: e.target.value })} placeholder="与本研究的关联" rows={2} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddMatrix(false)} className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors">取消</button>
                <button onClick={handleAddMatrix} className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium">添加</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 弹窗：新建实验计划 ===== */}
      {showAddPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddPlan(false)}>
          <div className="glass-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur z-10">
              <h3 className="font-semibold text-dream-slate-800 text-lg">新建实验计划</h3>
              <button onClick={() => setShowAddPlan(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
            </div>
            <div className="p-6 space-y-3">
              <input value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })} placeholder="实验标题 *（如：CuAAC反应条件优化）" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              <textarea value={newPlan.hypothesis} onChange={e => setNewPlan({ ...newPlan, hypothesis: e.target.value })} placeholder="研究假设" rows={2} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
              <input value={newPlan.independentVariable} onChange={e => setNewPlan({ ...newPlan, independentVariable: e.target.value })} placeholder="自变量" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              <input value={newPlan.dependentVariable} onChange={e => setNewPlan({ ...newPlan, dependentVariable: e.target.value })} placeholder="因变量" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              <textarea value={newPlan.controlGroup} onChange={e => setNewPlan({ ...newPlan, controlGroup: e.target.value })} placeholder="对照组设置" rows={2} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
              <input value={newPlan.sampleSize} onChange={e => setNewPlan({ ...newPlan, sampleSize: e.target.value })} placeholder="样本量（如：每组3个生物学重复）" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              <p className="text-xs text-dream-blue-400"><Lightbulb className="w-3 h-3 inline mr-1" />保存后将自动生成默认实验步骤检查清单（含点击化学专用模板）</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddPlan(false)} className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors">取消</button>
                <button onClick={handleAddPlan} className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium">创建</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 弹窗：添加精读论文 ===== */}
      {showAddReading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddReading(false)}>
          <div className="glass-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur z-10">
              <h3 className="font-semibold text-dream-slate-800 text-lg">添加精读论文</h3>
              <button onClick={() => setShowAddReading(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
            </div>
            <div className="p-6 space-y-3">
              <input value={readingForm.title} onChange={e => setReadingForm({ ...readingForm, title: e.target.value })} placeholder="论文标题 *" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              <div className="flex gap-2">
                {(['paste', 'DOI', 'arXiv'] as const).map(s => (
                  <button key={s} onClick={() => setReadingForm({ ...readingForm, source: s })} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${readingForm.source === s ? 'gradient-bg text-white' : 'bg-dream-blue-50 text-dream-slate-600'}`}>{s === 'paste' ? '粘贴文本' : s}</button>
                ))}
              </div>
              {readingForm.source !== 'paste' && (
                <input value={readingForm.sourceValue} onChange={e => setReadingForm({ ...readingForm, sourceValue: e.target.value })} placeholder={`${readingForm.source} 链接（如：10.1038/xxxx）`} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              )}
              <textarea value={readingForm.rawText} onChange={e => setReadingForm({ ...readingForm, rawText: e.target.value })} placeholder={readingForm.source === 'paste' ? '粘贴论文英文全文（按段落空行分段）...' : '可选：粘贴论文文本以生成对照翻译'} rows={8} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
              <p className="text-xs text-dream-blue-400"><Lightbulb className="w-3 h-3 inline mr-1" />系统将自动分段、生成中英对照、提取术语表并标注图表位置（本地规则引擎）</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddReading(false)} className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors">取消</button>
                <button onClick={handleAddReading} className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium">添加</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 弹窗：添加术语 ===== */}
      {showAddTerm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddTerm(false)}>
          <div className="glass-card rounded-3xl w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">添加术语</h3>
              <button onClick={() => setShowAddTerm(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
            </div>
            <div className="p-6 space-y-3">
              <input value={newTerm.term} onChange={e => setNewTerm({ ...newTerm, term: e.target.value })} placeholder="英文术语 *" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              <input value={newTerm.translation} onChange={e => setNewTerm({ ...newTerm, translation: e.target.value })} placeholder="中文译文 *" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              <textarea value={newTerm.definition} onChange={e => setNewTerm({ ...newTerm, definition: e.target.value })} placeholder="释义（可选）" rows={2} className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm resize-none" />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddTerm(false)} className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors">取消</button>
                <button onClick={handleAddTerm} className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium">添加</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 弹窗：生成框架图 ===== */}
      {showAddFramework && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddFramework(false)}>
          <div className="glass-card rounded-3xl w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <h3 className="font-semibold text-dream-slate-800 text-lg">生成研究框架图</h3>
              <button onClick={() => setShowAddFramework(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
            </div>
            <div className="p-6 space-y-3">
              <input value={frameworkForm.title} onChange={e => setFrameworkForm({ ...frameworkForm, title: e.target.value })} placeholder="框架图标题 *" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              <input value={frameworkForm.topic} onChange={e => setFrameworkForm({ ...frameworkForm, topic: e.target.value })} placeholder="研究主题（可选，用于生成节点）" className="w-full px-3 py-2 rounded-xl bg-dream-blue-50/80 border border-dream-blue-100 focus:outline-none focus:border-lavender-400 text-dream-slate-700 placeholder-purple-400 text-sm" />
              <div>
                <label className="text-xs text-dream-blue-500 mb-1 block">模板类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'flow', label: '实验流程图' },
                    { id: 'mechanism', label: '机制图' },
                    { id: 'dataflow', label: '数据流图' },
                  ] as const).map(t => (
                    <button key={t.id} onClick={() => setFrameworkForm({ ...frameworkForm, template: t.id })} className={`px-2 py-2 rounded-lg text-xs font-medium ${frameworkForm.template === t.id ? 'gradient-bg text-white' : 'bg-dream-blue-50 text-dream-slate-600'}`}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddFramework(false)} className="flex-1 py-3 bg-dream-blue-100 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-200 transition-colors">取消</button>
                <button onClick={handleAddFramework} className="flex-1 py-3 gradient-btn text-white rounded-xl text-sm font-medium">生成</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PPT 查看器 ===== */}
      {showPPTViewer && pptData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowPPTViewer(false)}>
          <div className="glass-card rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-dream-blue-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
                <div><h3 className="font-semibold text-dream-slate-800 text-sm">{pptData.title}</h3><p className="text-xs text-dream-blue-500">第 {currentSlideIndex + 1} / {pptData.slides.length} 页</p></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleDownloadPPT} className="flex items-center gap-1 px-3 py-1.5 bg-dream-blue-50 text-dream-slate-600 rounded-lg text-xs font-medium hover:bg-dream-blue-100 transition-colors"><Download className="w-3.5 h-3.5" />下载</button>
                <button onClick={() => setShowPPTViewer(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-900">
              <div className={`w-full h-full flex items-center justify-center p-8 ${pptData.slides[currentSlideIndex]?.type === 'title' ? 'bg-gradient-to-br from-purple-600 to-pink-600' : pptData.slides[currentSlideIndex]?.type === 'summary' ? 'bg-gradient-to-br from-emerald-500 to-blue-500' : pptData.slides[currentSlideIndex]?.type === 'mindmap' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-white'}`}>
                <div className="max-w-2xl w-full">
                  {pptData.slides[currentSlideIndex]?.type === 'title' ? (
                    <div className="text-center text-white"><h1 className="text-4xl font-bold mb-6">{pptData.slides[currentSlideIndex]?.title}</h1><p className="text-lg whitespace-pre-line opacity-90 leading-relaxed">{pptData.slides[currentSlideIndex]?.content}</p></div>
                  ) : pptData.slides[currentSlideIndex]?.type === 'summary' ? (
                    <div className="text-white"><h2 className="text-3xl font-bold mb-6">{pptData.slides[currentSlideIndex]?.title}</h2><p className="text-base whitespace-pre-line opacity-95 leading-relaxed">{pptData.slides[currentSlideIndex]?.content}</p></div>
                  ) : pptData.slides[currentSlideIndex]?.type === 'mindmap' ? (
                    <div className="text-white"><h2 className="text-2xl font-bold mb-6 text-center">{pptData.slides[currentSlideIndex]?.title}</h2><p className="text-sm whitespace-pre-line opacity-95 leading-relaxed font-mono">{pptData.slides[currentSlideIndex]?.content}</p></div>
                  ) : (
                    <div><h2 className="text-2xl font-bold text-dream-slate-700 mb-6 pb-4 border-b-2 border-purple-500">{pptData.slides[currentSlideIndex]?.title}</h2><p className="text-gray-700 whitespace-pre-line leading-relaxed">{pptData.slides[currentSlideIndex]?.content}</p></div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-dream-blue-100/50 flex items-center justify-between bg-white">
              <button onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} disabled={currentSlideIndex === 0} className="flex items-center gap-1 px-4 py-2 bg-dream-blue-50 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" />上一页</button>
              <div className="flex gap-1.5">{pptData.slides.map((_, i) => (<button key={i} onClick={() => setCurrentSlideIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentSlideIndex ? 'bg-dream-blue-500 w-6' : 'bg-dream-blue-200 hover:bg-purple-300'}`} />))}</div>
              <button onClick={() => setCurrentSlideIndex(Math.min(pptData.slides.length - 1, currentSlideIndex + 1))} disabled={currentSlideIndex === pptData.slides.length - 1} className="flex items-center gap-1 px-4 py-2 bg-dream-blue-50 text-dream-slate-600 rounded-xl text-sm font-medium hover:bg-dream-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">下一页<ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 演讲稿弹窗 ===== */}
      {showSpeechModal && pptData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSpeechModal(false)}>
          <div className="glass-card rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-dream-blue-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center"><FileTextIcon className="w-5 h-5 text-white" /></div>
                <div><h3 className="font-semibold text-dream-slate-800">演讲稿</h3><p className="text-xs text-dream-blue-500">{pptData.title}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleDownloadSpeech} className="flex items-center gap-1 px-3 py-1.5 bg-dream-blue-50 text-dream-slate-600 rounded-lg text-xs font-medium hover:bg-dream-blue-100 transition-colors"><Download className="w-3.5 h-3.5" />下载</button>
                <button onClick={() => setShowSpeechModal(false)} className="p-2 hover:bg-dream-blue-100 rounded-xl transition-colors"><X className="w-5 h-5 text-dream-blue-500" /></button>
              </div>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <p className="text-dream-slate-700 whitespace-pre-line leading-relaxed text-sm">{pptData.speech}</p>
            </div>
          </div>
        </div>
      )}

      {showMindMap && <MindMapComponent paperId={showMindMap} />}
    </div>
  );
}
