import { create } from 'zustand';
import type {
  Paper,
  ExperimentNote,
  ChatMessage,
  ResearchQuestion,
  ResearchFramework,
  LiteratureMatrixEntry,
  PaperOutline,
  PaperAbstract,
  ExperimentPlan,
  ExperimentStep,
  ReadingPaper,
  Terminology,
  FrameworkFigure,
  FrameworkTemplate,
  FrameworkNode,
  FrameworkEdge,
  PolishingSuggestion,
} from '../types';
import {
  mockPapers,
  mockExperimentNotes,
  initialChatMessages,
  mockResearchQuestions,
  mockLiteratureMatrix,
  mockExperimentPlans,
  mockReadingPapers,
  mockFrameworkFigures,
} from '../data/mockData';
import { storage } from '../utils/storage';
import { generateId, getWeekNumber, getTodayStr } from '../utils/date';

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  color?: string;
  x?: number;
  y?: number;
}

export interface PPTSlide {
  id: string;
  title: string;
  content: string;
  type: 'title' | 'content' | 'summary' | 'mindmap';
}

export interface PPTData {
  id: string;
  title: string;
  generatedDate: string;
  slides: PPTSlide[];
  speech: string;
  paperCount: number;
}

interface ResearchState {
  papers: Paper[];
  experimentNotes: ExperimentNote[];
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  pptData: PPTData | null;
  isGeneratingPPT: boolean;
  addPaper: (paper: Omit<Paper, 'id' | 'week' | 'year'>) => void;
  addExperimentNote: (note: Omit<ExperimentNote, 'id' | 'week' | 'year'>) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (content: string) => void;
  clearChat: () => void;
  generateMindMap: (paperId: string) => MindMapNode;
  exportMindMap: (paperId: string, format: 'png' | 'json' | 'text') => void;
  generatePPT: () => Promise<void>;
  downloadPPT: () => void;
  downloadSpeech: () => void;
  generateWeeklyReport: () => string;
  batchImportPapers: (papers: Omit<Paper, 'id' | 'week' | 'year'>[]) => number;
  // ARS / 扩展状态
  researchQuestions: ResearchQuestion[];
  literatureMatrix: LiteratureMatrixEntry[];
  paperOutlines: PaperOutline[];
  paperAbstracts: PaperAbstract[];
  experimentPlans: ExperimentPlan[];
  readingPapers: ReadingPaper[];
  terminologyLedger: Terminology[];
  frameworkFigures: FrameworkFigure[];
  // 研究问题（苏格拉底模式）
  startResearchQuestion: (topic: string, framework: ResearchFramework) => string;
  updateResearchQuestionAnswers: (id: string, answers: string[]) => void;
  refineResearchQuestion: (id: string, refined: string) => void;
  deleteResearchQuestion: (id: string) => void;
  // 文献综述助手
  getSearchStrategy: (researchQuestion: string) => { keywords: string[]; databases: string[]; strategy: string };
  addLiteratureMatrixEntry: (entry: Omit<LiteratureMatrixEntry, 'id' | 'addedAt'>) => void;
  updateLiteratureMatrixEntry: (id: string, patch: Partial<LiteratureMatrixEntry>) => void;
  deleteLiteratureMatrixEntry: (id: string) => void;
  importPapersToMatrix: () => number;
  exportLiteratureMatrixCSV: () => void;
  // 论文写作助手
  generateOutline: (researchQuestion: string, title: string) => string;
  deleteOutline: (id: string) => void;
  generateAbstract: (info: Omit<PaperAbstract, 'id' | 'createdAt' | 'generatedAbstract'>) => PaperAbstract;
  polishText: (text: string) => PolishingSuggestion[];
  // 实验规划
  addExperimentPlan: (plan: Omit<ExperimentPlan, 'id' | 'createdAt' | 'steps'> & { steps?: ExperimentStep[] }) => string;
  updateExperimentPlan: (id: string, patch: Partial<ExperimentPlan>) => void;
  toggleExperimentStep: (planId: string, stepId: string) => void;
  addExperimentStep: (planId: string, text: string) => void;
  deleteExperimentPlan: (id: string) => void;
  // 论文精读
  addReadingPaper: (paper: { title: string; source: string; sourceValue: string; rawText?: string }) => string;
  deleteReadingPaper: (id: string) => void;
  translateText: (enText: string) => string;
  addTerminology: (term: Omit<Terminology, 'id'>) => void;
  deleteTerminology: (id: string) => void;
  // 框架图
  createFrameworkFigure: (title: string, template: FrameworkTemplate, topic: string) => string;
  deleteFrameworkFigure: (id: string) => void;
  exportFrameworkSVG: (id: string) => void;
}

const today = new Date();
const currentWeek = getWeekNumber(today);
const currentYear = today.getFullYear();

const STORAGE_KEY_PAPERS = 'research-papers';
const STORAGE_KEY_NOTES = 'research-notes';
const STORAGE_KEY_CHAT = 'research-chat';
const STORAGE_KEY_PPT = 'research-ppt';
const STORAGE_KEY_RQ = 'research-questions';
const STORAGE_KEY_LM = 'research-literature-matrix';
const STORAGE_KEY_OUTLINES = 'research-outlines';
const STORAGE_KEY_ABSTRACTS = 'research-abstracts';
const STORAGE_KEY_EXP = 'research-experiment-plans';
const STORAGE_KEY_READING = 'research-reading-papers';
const STORAGE_KEY_TERMS = 'research-terminology';
const STORAGE_KEY_FRAMEWORK = 'research-framework-figures';

const aiResponses: Record<string, string> = {
  default: '这是一个很好的问题！关于你的实验，我建议你可以从以下几个方面考虑：\n\n1. **对照组设置**：确保你的实验有合适的阴性对照和阳性对照\n2. **反应条件**：检查温度、pH值、反应时间等参数是否在最佳范围内\n3. **试剂质量**：确认所有试剂都是新鲜配制的，没有过期\n\n你可以告诉我更多实验细节，我可以给出更具体的建议。',
  'WB': '蛋白质印迹（Western Blot）实验常见问题及解决方案：\n\n**条带弥散**\n- 可能原因：蛋白降解、上样量过大、电泳条件不对\n- 解决方法：加入蛋白酶抑制剂、减少上样量、优化电泳时间\n\n**没有条带**\n- 可能原因：抗体不工作、浓度太低、转膜不充分\n- 解决方法：优化抗体稀释比例、检查转膜条件\n\n**背景太高**\n- 可能原因：一抗浓度太高、洗涤不充分\n- 解决方法：降低一抗稀释度、增加洗涤次数\n\n你遇到的是哪种情况？',
  '细胞': '细胞实验的注意事项：\n\n1. **无菌操作**：所有操作在生物安全柜内进行\n2. **细胞状态**：使用对数生长期细胞\n3. **传代次数**：避免传代次数过多\n4. **血清质量**：使用优质胎牛血清\n5. **污染检测**：定期检测支原体\n\n有什么具体问题我可以帮你解答吗？',
  'PCR': 'PCR实验优化建议：\n\n**引物设计**\n- 引物长度18-25bp，GC含量40-60%\n- 避免引物二聚体和发夹结构\n- Tm值差异不超过2℃\n\n**反应条件优化**\n- 退火温度：梯度PCR确定最佳温度\n- Mg2+浓度：1.5-2.5mM范围内优化\n- 循环数：25-35个循环\n\n**常见问题**\n- 非特异性条带：提高退火温度、减少引物量\n- 无产物：检查模板质量、优化引物浓度\n- 条带弱：增加循环数、优化模板量\n\n需要我帮你分析具体的实验方案吗？',
  '对照': '如何设计对照实验？\n\n**实验设计的基本原则**\n\n1. **阴性对照**\n- 空白对照：不加处理因素的对照组\n- 溶剂对照：使用溶剂处理的对照组\n- 假手术对照：仅手术不给处理\n\n2. **阳性对照**\n- 使用已知有效的处理方法\n- 验证实验体系的可靠性\n\n3. **对照设置的原则**\n- 唯一变量原则：除处理因素外其他条件一致\n- 平行重复原则：多次独立重复实验\n- 随机化原则：样本随机分组\n\n你的实验具体是什么类型？我可以帮你设计更具体的对照方案。',
  '污染': '细胞污染如何处理？\n\n**常见污染类型及处理**\n\n1. **细菌污染**\n- 表现：培养基浑浊、pH骤变\n- 处理：立即丢弃，检查无菌操作\n- 预防：定期检查培养基，规范操作\n\n2. **真菌污染**\n- 表现：显微镜下可见菌丝或孢子\n- 处理：丢弃，彻底消毒培养箱\n- 预防：保持环境干燥，定期清洁\n\n3. **支原体污染**\n- 表现：细胞生长缓慢、形态改变\n- 检测：PCR检测或荧光染色\n- 处理：使用支原体清除试剂或丢弃\n\n4. **预防措施**\n- 严格无菌操作\n- 定期检测细胞状态\n- 细胞株来源可靠\n- 试剂分装保存\n\n你现在遇到的是什么类型的污染？',
  '点击化学': '点击化学常见问题及解决方案：\n\n**CuAAC反应优化**\n\n1. **反应效率低**\n- 检查铜催化剂和配体比例（通常Cu:TBTA = 1:2）\n- 确保抗坏血酸钠新鲜配制\n- 反应体系pH保持在7-8之间\n\n2. **副反应多**\n- 降低铜离子浓度\n- 增加配体比例\n- 降低反应温度\n\n3. **蛋白沉淀**\n- 降低DMSO含量（<5%）\n- 使用温和的缓冲液\n- 优化反应时间\n\n**SPAAC反应特点**\n- 无需铜离子，生物相容性好\n- 反应速率相对较慢\n- 环辛炔试剂较贵\n\n你做的是哪种点击反应？遇到了什么具体问题？',
  '生物正交': '生物正交化学实验指导：\n\n**常用生物正交反应类型**\n\n1. **CuAAC（铜催化点击反应）**\n- 优点：反应快、产率高、试剂便宜\n- 缺点：铜离子有细胞毒性\n- 应用：体外标记、固定细胞\n\n2. **SPAAC（应变促进点击反应）**\n- 优点：无铜、生物相容性好\n- 缺点：反应较慢、试剂贵\n- 应用：活细胞、活体成像\n\n3. **四嗪/TCO反应**\n- 优点：反应极快、生物相容性好\n- 缺点：TCO可能不稳定\n- 应用：活体成像、药物递送\n\n4. **光点击反应**\n- 优点：时空可控\n- 缺点：需要光照设备\n- 应用：光控标记\n\n**实验设计建议**\n- 根据实验体系选择合适的反应类型\n- 设置阳性对照验证反应体系\n- 优化反应浓度和时间\n\n你具体想做哪方面的生物正交实验？',
};

const generateAIResponse = (content: string): string => {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('wb') || lowerContent.includes('western') || lowerContent.includes('蛋白印迹') || lowerContent.includes('条带')) {
    return aiResponses['WB'];
  }
  if (lowerContent.includes('细胞') && lowerContent.includes('污染')) {
    return aiResponses['污染'];
  }
  if (lowerContent.includes('细胞')) {
    return aiResponses['细胞'];
  }
  if (lowerContent.includes('pcr') || lowerContent.includes('聚合酶')) {
    return aiResponses['PCR'];
  }
  if (lowerContent.includes('对照')) {
    return aiResponses['对照'];
  }
  if (lowerContent.includes('点击') || lowerContent.includes('cuacc') || lowerContent.includes('spaac')) {
    return aiResponses['点击化学'];
  }
  if (lowerContent.includes('生物正交')) {
    return aiResponses['生物正交'];
  }
  
  const keys = Object.keys(aiResponses).filter(k => k !== 'default');
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return aiResponses[randomKey];
};

// ===== 本地规则引擎（基于关键词匹配，模拟 AI 功能）=====

const termDictionary: Record<string, string> = {
  'bioorthogonal chemistry': '生物正交化学',
  'bioorthogonal': '生物正交',
  'tetrazine': '四嗪',
  'trans-cyclooctene': '反式环辛烯',
  'TCO': '反式环辛烯',
  'inverse electron-demand Diels-Alder': '反电子需求Diels-Alder反应',
  'IEDDA': '反电子需求Diels-Alder反应',
  'strain-promoted azide-alkyne cycloaddition': '应变促进叠氮-炔烃环加成',
  'SPAAC': '应变促进叠氮-炔烃环加成',
  'copper-catalyzed azide-alkyne cycloaddition': '铜催化叠氮-炔烃环加成',
  'CuAAC': '铜催化叠氮-炔烃环加成',
  'click chemistry': '点击化学',
  'metabolic glycan labeling': '代谢糖标记',
  'metabolic labeling': '代谢标记',
  'fluorogenic probe': '荧光生成探针',
  'fluorogenic': '荧光生成',
  'glycan': '聚糖',
  'sialylation': '唾液酸化',
  'sialic acid': '唾液酸',
  'cyclooctyne': '环辛炔',
  'azide': '叠氮',
  'alkyne': '炔烃',
  'biocompatibility': '生物相容性',
  'in vivo': '活体',
  'in vitro': '体外',
  'immunotherapy': '免疫治疗',
  'lymph node': '淋巴结',
  'macrophage': '巨噬细胞',
  'T cell': 'T细胞',
  'fluorophore': '荧光素',
  'signal-to-noise ratio': '信噪比',
  'spatiotemporal': '时空',
  'genetic code expansion': '遗传密码扩展',
  'proteomics': '蛋白质组学',
  'activity-based protein profiling': '基于活性的蛋白质谱分析',
  'ABPP': '基于活性的蛋白质谱分析',
};

const terminologyDictionary: Terminology[] = [
  { id: 't1', term: 'Bioorthogonal chemistry', translation: '生物正交化学', definition: '在生物体系内发生且不干扰正常生化过程的化学反应' },
  { id: 't2', term: 'Tetrazine', translation: '四嗪', definition: '含四个氮原子的六元杂环化合物' },
  { id: 't3', term: 'Trans-cyclooctene (TCO)', translation: '反式环辛烯', definition: '应变促进的环辛烯异构体' },
  { id: 't4', term: 'IEDDA', translation: '反电子需求Diels-Alder反应', definition: '富电子亲二烯体与缺电子二烯的环加成反应' },
  { id: 't5', term: 'SPAAC', translation: '应变促进叠氮-炔烃环加成', definition: '无需铜催化的点击反应' },
  { id: 't6', term: 'CuAAC', translation: '铜催化叠氮-炔烃环加成', definition: '经典点击化学' },
  { id: 't7', term: 'Metabolic glycan labeling', translation: '代谢糖标记', definition: '利用非天然糖前体引入化学报告基团' },
  { id: 't8', term: 'Fluorogenic probe', translation: '荧光生成探针', definition: '反应后荧光显著增强的探针' },
];

const socraticQuestionBank: { keywords: string[]; questions: string[] }[] = [
  {
    keywords: ['成像', 'imaging', '荧光', 'fluorescence', '活体'],
    questions: [
      '你关注的是哪种成像模态（荧光、化学发光、PET、MRI等）？',
      '目标生物体系是什么（细胞、类器官、小鼠、斑马鱼等）？',
      '希望解决传统标记方法的什么核心痛点（信噪比、时空分辨率、毒性等）？',
      '是否有特定的靶分子（糖、蛋白、核酸、脂质）？',
      '预期应用的生物学问题是什么（细胞迁移、药物分布、基因表达等）？',
    ],
  },
  {
    keywords: ['蛋白质', 'protein', '标记', 'labeling', '修饰'],
    questions: [
      '目标蛋白质是内源表达还是外源转染？',
      '希望在活细胞还是固定细胞中进行标记？',
      '标记位点是否需要残基特异性（定点标记）？',
      '是否需要时空可控（如光控、化学诱导）？',
      '下游检测手段是什么（荧光、质谱、Western等）？',
    ],
  },
  {
    keywords: ['糖', 'glycan', '聚糖', '唾液酸', 'sial'],
    questions: [
      '关注的是哪类糖（N-聚糖、O-聚糖、糖脂等）？',
      '研究的是生理状态还是病理状态（如肿瘤）的糖基化？',
      '采用代谢标记还是酶法标记策略？',
      '是否有定量比较的需求（不同细胞系/处理组）？',
      '下游分析是成像、质谱还是流式？',
    ],
  },
  {
    keywords: ['药物', 'drug', '递送', 'delivery', 'adc'],
    questions: [
      '药物靶点是什么，是否已明确？',
      '递送载体或前药策略是什么？',
      '希望在体内实现靶向激活还是靶向释放？',
      '如何评估药效与毒性的平衡？',
      '是否有临床转化的考量？',
    ],
  },
];

const defaultSocraticQuestions = [
  '请用一句话描述你想解决的核心科学问题是什么？',
  '当前研究领域的主要现状和不足是什么？',
  '你的研究预期带来什么新的发现或改进？',
  '你计划采用什么核心方法或技术路线？',
  '如何评估研究是否成功（关键指标）？',
];

const generateSocraticQuestions = (topic: string, framework: ResearchFramework): string[] => {
  const lower = topic.toLowerCase();
  const matched = socraticQuestionBank.find(b => b.keywords.some(k => lower.includes(k.toLowerCase()) || topic.includes(k)));
  const base = matched ? matched.questions : defaultSocraticQuestions;
  const questions = base.slice(0, 4);

  const frameworkQuestion: Record<ResearchFramework, string> = {
    PICO: '按照PICO框架，请明确：研究对象(P)、干预措施(I)、对照(C)和结局指标(O)分别是什么？',
    PEO: '按照PEO框架，请明确：研究人群(P)、暴露因素(E)和关注结果(O)分别是什么？',
    SPIDER: '按照SPIDER框架，请明确：样本(S)、关注现象(PI)、研究设计(D)、评估方式(E)和研究类型(R)？',
    PCC: '按照PCC框架，请明确：研究范围的人群(P)、核心概念(C)和应用背景(C)？',
    none: '请明确你的研究边界：研究对象的范围、核心变量和适用条件。',
  };
  questions.push(frameworkQuestion[framework]);
  return questions;
};

const generateSearchStrategy = (researchQuestion: string): { keywords: string[]; databases: string[]; strategy: string } => {
  const lower = researchQuestion.toLowerCase();
  const keywords: string[] = [];
  const databases = ['PubMed', 'Web of Science', 'Google Scholar', 'Scopus', 'ACS Publications'];

  if (lower.includes('bioorthogonal') || researchQuestion.includes('生物正交')) keywords.push('bioorthogonal chemistry', '生物正交化学');
  if (lower.includes('tetrazine') || researchQuestion.includes('四嗪')) keywords.push('tetrazine', 'IEDDA');
  if (lower.includes('tco') || researchQuestion.includes('环辛烯')) keywords.push('trans-cyclooctene', 'TCO');
  if (lower.includes('spaac') || researchQuestion.includes('环辛炔')) keywords.push('SPAAC', 'cyclooctyne');
  if (lower.includes('cuaac') || researchQuestion.includes('铜催化')) keywords.push('CuAAC', 'click chemistry');
  if (lower.includes('glycan') || researchQuestion.includes('糖') || researchQuestion.includes('聚糖')) keywords.push('metabolic glycan labeling', 'glycan');
  if (lower.includes('imaging') || researchQuestion.includes('成像')) keywords.push('in vivo imaging', 'fluorogenic probe');
  if (lower.includes('protein') || researchQuestion.includes('蛋白')) keywords.push('protein labeling', 'chemical proteomics');

  if (keywords.length === 0) {
    const words = researchQuestion.split(/[\s,，。.;；?？]+/).filter(w => w.length > 1);
    keywords.push(...words.slice(0, 4));
  }

  const strategy = `检索策略建议：\n\n1. 主关键词组合（AND）：\n   ${keywords.slice(0, 3).join(' AND ')}\n\n2. 扩展同义词（OR）：\n   ${[...new Set(keywords)].join(' OR ')}\n\n3. 推荐数据库：${databases.join('、')}\n\n4. 时间范围：近5年（2021-2026），可追溯经典文献\n5. 文献类型：研究论著 + 综述，优先高影响力期刊`;

  return { keywords: [...new Set(keywords)], databases, strategy };
};

const generateImRaDOutline = (researchQuestion: string): PaperOutline['sections'] => {
  const sections: PaperOutline['sections'] = [
    {
      id: 'intro', name: 'Introduction（引言）', subsections: [
        { id: 'i1', name: '研究背景', description: '阐述生物正交化学领域的发展现状与研究意义' },
        { id: 'i2', name: '科学问题', description: `明确研究问题：${researchQuestion.slice(0, 60)}` },
        { id: 'i3', name: '研究目标与假设', description: '提出研究目标、科学假设与创新点' },
      ],
    },
    {
      id: 'methods', name: 'Methods（方法）', subsections: [
        { id: 'm1', name: '材料与试剂', description: '细胞系、抗体、探针、化学试剂来源与配制' },
        { id: 'm2', name: '实验设计', description: '分组、对照设置、变量定义与样本量' },
        { id: 'm3', name: '关键反应步骤', description: '生物正交反应条件（浓度、时间、温度、催化剂）' },
        { id: 'm4', name: '检测与分析方法', description: '成像、流式、质谱等检测手段及统计方法' },
      ],
    },
    {
      id: 'results', name: 'Results（结果）', subsections: [
        { id: 'r1', name: '反应条件优化', description: '呈现浓度/时间梯度优化的数据' },
        { id: 'r2', name: '标记效率验证', description: '与对照组对比的标记效率与特异性数据' },
        { id: 'r3', name: '应用验证', description: '在目标生物体系中的应用结果' },
        { id: 'r4', name: '机制探索', description: '支撑结论的机制性实验数据' },
      ],
    },
    {
      id: 'discussion', name: 'Discussion（讨论）', subsections: [
        { id: 'd1', name: '主要发现总结', description: '凝练核心发现并回应研究问题' },
        { id: 'd2', name: '与已有工作对比', description: '与文献中相关方法的优势与局限对比' },
        { id: 'd3', name: '研究局限性', description: '客观讨论样本量、体系适用性等局限' },
        { id: 'd4', name: '未来展望', description: '提出后续研究方向与潜在应用' },
      ],
    },
  ];
  return sections;
};

const polishAcademicText = (text: string): PolishingSuggestion[] => {
  const suggestions: PolishingSuggestion[] = [];
  const lower = text.toLowerCase();

  if (text.includes('非常') || text.includes('很') || text.includes('十分')) {
    suggestions.push({
      original: '非常/很/十分',
      suggestion: '删除程度副词，改用具体数据或显著',
      reason: '学术写作应避免主观程度副词，优先使用客观数据描述',
      type: 'academic',
    });
  }
  if (lower.includes('i think') || text.includes('我觉得') || text.includes('我认为')) {
    suggestions.push({
      original: 'I think / 我觉得',
      suggestion: '改为客观陈述，如"The data indicate that..."或"本研究表明..."',
      reason: '学术写作应避免第一人称主观判断，使用客观表述',
      type: 'academic',
    });
  }
  if (text.includes('等等') || text.includes('诸如此类') || lower.includes('etc')) {
    suggestions.push({
      original: '等等/诸如此类/etc',
      suggestion: '删除或改为"包括但不限于"，并列举关键项',
      reason: '学术写作要求明确具体，避免模糊省略',
      type: 'clarity',
    });
  }
  if (lower.includes('a lot of') || lower.includes('lots of') || text.includes('很多')) {
    suggestions.push({
      original: 'a lot of / 很多',
      suggestion: '改用具体数量或"显著"(significant)',
      reason: '模糊量词缺乏精确性，学术写作需量化',
      type: 'conciseness',
    });
  }
  if (lower.includes('very') || lower.includes('really')) {
    suggestions.push({
      original: 'very / really',
      suggestion: '删除或替换为更精确的学术副词（如 markedly, substantially）',
      reason: '口语化副词降低学术严谨性',
      type: 'academic',
    });
  }
  const longSentence = text.split(/[。.]/).find(s => s.length > 80);
  if (longSentence) {
    suggestions.push({
      original: `长句（${longSentence.length}字）`,
      suggestion: '建议拆分为2-3个短句，每句聚焦一个主旨',
      reason: '过长句子降低可读性，学术写作宜短句清晰',
      type: 'clarity',
    });
  }
  if (lower.includes('things') || lower.includes('stuff') || text.includes('东西')) {
    suggestions.push({
      original: 'things / stuff / 东西',
      suggestion: '替换为具体名词，如 factors, components, molecules',
      reason: '泛指词缺乏学术精确性',
      type: 'academic',
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      original: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
      suggestion: '文本整体符合学术写作规范，建议进一步检查术语一致性、被动语态使用及参考文献格式',
      reason: '未检测到明显问题，可关注细节优化',
      type: 'clarity',
    });
  }
  return suggestions;
};

const translateParagraphToChinese = (enText: string): string => {
  let result = enText;
  const sortedTerms = Object.keys(termDictionary).sort((a, b) => b.length - a.length);
  const replacements: { from: RegExp; to: string }[] = [];
  for (const term of sortedTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    replacements.push({ from: new RegExp(escaped, 'gi'), to: termDictionary[term] });
  }
  for (const r of replacements) {
    result = result.replace(r.from, r.to);
  }
  const connectorMap: Record<string, string> = {
    ' and ': '，且 ',
    ' or ': ' 或 ',
    ' but ': '，但 ',
    ' however': '；然而',
    ' therefore': '；因此',
    ' which ': '，其 ',
    ' where ': '，其中 ',
    ' while ': '，同时 ',
    ' because ': '，因为 ',
    ' although ': '，尽管 ',
  };
  for (const [from, to] of Object.entries(connectorMap)) {
    result = result.replace(new RegExp(from, 'gi'), to);
  }
  result = result
    .replace(/\bThe\b/g, '该')
    .replace(/\bthe\b/g, '该')
    .replace(/\bThis\b/g, '此')
    .replace(/\bthis\b/g, '此')
    .replace(/\bWe\b/g, '我们')
    .replace(/\bwe\b/g, '我们')
    .replace(/\bUsing\b/g, '使用')
    .replace(/\busing\b/g, '使用')
    .replace(/\bshowed\b/gi, '显示')
    .replace(/\bdemonstrated\b/gi, '证明')
    .replace(/\benabled\b/gi, '实现了')
    .replace(/\benables\b/gi, '实现')
    .replace(/\breported\b/gi, '报道')
    .replace(/\bstudy\b/gi, '研究')
    .replace(/\bcell\b/gi, '细胞')
    .replace(/\bcells\b/gi, '细胞')
    .replace(/\bprotein\b/gi, '蛋白质')
    .replace(/\bimage\b/gi, '成像')
    .replace(/\bimaging\b/gi, '成像');
  return result;
};

const splitIntoSegments = (text: string): { en: string; zh: string }[] => {
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
  if (paragraphs.length <= 1) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const grouped: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      grouped.push(sentences.slice(i, i + 2).join(' ').trim());
    }
    return grouped.filter(s => s.length > 0).map(en => ({ en, zh: translateParagraphToChinese(en) }));
  }
  return paragraphs.map(en => ({ en, zh: translateParagraphToChinese(en) }));
};

const extractTerminology = (text: string): Terminology[] => {
  const found: Terminology[] = [];
  const lower = text.toLowerCase();
  for (const term of terminologyDictionary) {
    if (lower.includes(term.term.toLowerCase())) {
      found.push(term);
    }
  }
  return found;
};

const detectFigurePositions = (segments: { en: string }[]): { position: number; label: string; description: string }[] => {
  const markers: { position: number; label: string; description: string }[] = [];
  segments.forEach((seg, idx) => {
    if (/figure\s+\d+|fig\.\s*\d+/i.test(seg.en)) {
      const match = seg.en.match(/(?:figure|fig\.)\s*(\d+)/i);
      const num = match ? match[1] : String(idx + 1);
      markers.push({ position: idx, label: `图${num}`, description: `论文图表（位于第${idx + 1}段）` });
    }
  });
  return markers;
};

const frameworkColors = {
  root: '#8B5CF6',
  question: '#A78BFA',
  method: '#F472B6',
  result: '#34D399',
};

const generateFrameworkFigure = (topic: string, template: FrameworkTemplate): { nodes: FrameworkNode[]; edges: FrameworkEdge[] } => {
  const nodes: FrameworkNode[] = [];
  const edges: FrameworkEdge[] = [];

  if (template === 'flow') {
    nodes.push({ id: 'f1', label: `研究问题：${topic.slice(0, 24)}`, type: 'question', color: frameworkColors.question });
    nodes.push({ id: 'f2', label: '实验设计/方法', type: 'method', color: frameworkColors.method });
    nodes.push({ id: 'f3', label: '数据采集', type: 'method', color: frameworkColors.method });
    nodes.push({ id: 'f4', label: '结果分析', type: 'method', color: frameworkColors.method });
    nodes.push({ id: 'f5', label: '结论与展望', type: 'result', color: frameworkColors.result });
    edges.push({ from: 'f1', to: 'f2', label: '驱动' });
    edges.push({ from: 'f2', to: 'f3', label: '执行' });
    edges.push({ from: 'f3', to: 'f4', label: '处理' });
    edges.push({ from: 'f4', to: 'f5', label: '推导' });
  } else if (template === 'mechanism') {
    nodes.push({ id: 'm1', label: '底物/靶标', type: 'question', color: frameworkColors.question });
    nodes.push({ id: 'm2', label: '化学修饰/标记', type: 'method', color: frameworkColors.method });
    nodes.push({ id: 'm3', label: '生物正交反应', type: 'method', color: frameworkColors.method });
    nodes.push({ id: 'm4', label: '信号读出', type: 'method', color: frameworkColors.method });
    nodes.push({ id: 'm5', label: '生物学功能验证', type: 'result', color: frameworkColors.result });
    edges.push({ from: 'm1', to: 'm2', label: '识别' });
    edges.push({ from: 'm2', to: 'm3', label: '偶联' });
    edges.push({ from: 'm3', to: 'm4', label: '检测' });
    edges.push({ from: 'm4', to: 'm5', label: '验证' });
  } else {
    nodes.push({ id: 'd1', label: '数据输入（样本）', type: 'question', color: frameworkColors.question });
    nodes.push({ id: 'd2', label: '数据预处理', type: 'method', color: frameworkColors.method });
    nodes.push({ id: 'd3', label: '特征提取/建模', type: 'method', color: frameworkColors.method });
    nodes.push({ id: 'd4', label: '统计分析', type: 'method', color: frameworkColors.method });
    nodes.push({ id: 'd5', label: '可视化输出', type: 'result', color: frameworkColors.result });
    edges.push({ from: 'd1', to: 'd2', label: '导入' });
    edges.push({ from: 'd2', to: 'd3', label: '清洗' });
    edges.push({ from: 'd3', to: 'd4', label: '建模' });
    edges.push({ from: 'd4', to: 'd5', label: '呈现' });
  }
  return { nodes, edges };
};

const defaultExperimentSteps = (topic: string): ExperimentStep[] => {
  const lower = topic.toLowerCase();
  if (lower.includes('点击') || lower.includes('cuaac') || lower.includes('spaac') || topic.includes('生物正交')) {
    return [
      { id: generateId(), text: '查阅文献，确定反应类型与底物', completed: false },
      { id: generateId(), text: '准备细胞系与代谢标记前体（如Ac4ManNAz）', completed: false },
      { id: generateId(), text: '优化反应条件（浓度、时间、温度）', completed: false },
      { id: generateId(), text: '设置阴性对照与阳性对照', completed: false },
      { id: generateId(), text: '执行生物正交标记反应', completed: false },
      { id: generateId(), text: '检测标记效率（流式/荧光显微镜）', completed: false },
      { id: generateId(), text: '评估细胞活力与特异性', completed: false },
      { id: generateId(), text: '数据统计与分析', completed: false },
    ];
  }
  return [
    { id: generateId(), text: '明确研究假设与变量', completed: false },
    { id: generateId(), text: '准备实验材料与试剂', completed: false },
    { id: generateId(), text: '设置实验组与对照组', completed: false },
    { id: generateId(), text: '确定样本量与重复次数', completed: false },
    { id: generateId(), text: '执行实验并记录数据', completed: false },
    { id: generateId(), text: '数据处理与统计分析', completed: false },
    { id: generateId(), text: '结果验证与重复实验', completed: false },
  ];
};

export const useResearchStore = create<ResearchState>((set, get) => ({
  papers: storage.get<Paper[]>(STORAGE_KEY_PAPERS, mockPapers),
  experimentNotes: storage.get<ExperimentNote[]>(STORAGE_KEY_NOTES, mockExperimentNotes),
  chatMessages: storage.get<ChatMessage[]>(STORAGE_KEY_CHAT, initialChatMessages),
  isChatLoading: false,
  pptData: storage.get<PPTData | null>(STORAGE_KEY_PPT, null),
  isGeneratingPPT: false,
  researchQuestions: storage.get<ResearchQuestion[]>(STORAGE_KEY_RQ, mockResearchQuestions),
  literatureMatrix: storage.get<LiteratureMatrixEntry[]>(STORAGE_KEY_LM, mockLiteratureMatrix),
  paperOutlines: storage.get<PaperOutline[]>(STORAGE_KEY_OUTLINES, []),
  paperAbstracts: storage.get<PaperAbstract[]>(STORAGE_KEY_ABSTRACTS, []),
  experimentPlans: storage.get<ExperimentPlan[]>(STORAGE_KEY_EXP, mockExperimentPlans),
  readingPapers: storage.get<ReadingPaper[]>(STORAGE_KEY_READING, mockReadingPapers),
  terminologyLedger: storage.get<Terminology[]>(STORAGE_KEY_TERMS, terminologyDictionary),
  frameworkFigures: storage.get<FrameworkFigure[]>(STORAGE_KEY_FRAMEWORK, mockFrameworkFigures),

  addPaper: (paper) => {
    const paperDate = new Date(paper.date || new Date());
    const newPaper: Paper = {
      ...paper,
      id: generateId(),
      week: getWeekNumber(paperDate),
      year: paperDate.getFullYear(),
    };
    set((state) => {
      const papers = [newPaper, ...state.papers];
      storage.set(STORAGE_KEY_PAPERS, papers);
      return { papers };
    });
  },

  addExperimentNote: (note) => {
    const noteDate = new Date(note.date || new Date());
    const newNote: ExperimentNote = {
      ...note,
      id: generateId(),
      week: getWeekNumber(noteDate),
      year: noteDate.getFullYear(),
    };
    set((state) => {
      const notes = [newNote, ...state.experimentNotes];
      storage.set(STORAGE_KEY_NOTES, notes);
      return { experimentNotes: notes };
    });
  },

  addChatMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    set((state) => {
      const messages = [...state.chatMessages, newMessage];
      storage.set(STORAGE_KEY_CHAT, messages);
      return { chatMessages: messages };
    });
  },

  sendMessage: (content) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    set((state) => {
      const messages = [...state.chatMessages, userMessage];
      storage.set(STORAGE_KEY_CHAT, messages);
      return { chatMessages: messages, isChatLoading: true };
    });

    setTimeout(() => {
      const response = generateAIResponse(content);
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      set((state) => {
        const messages = [...state.chatMessages, assistantMessage];
        storage.set(STORAGE_KEY_CHAT, messages);
        return { chatMessages: messages, isChatLoading: false };
      });
    }, 1200);
  },

  clearChat: () => {
    storage.set(STORAGE_KEY_CHAT, initialChatMessages);
    set({ chatMessages: initialChatMessages });
  },

  generateMindMap: (paperId: string): MindMapNode => {
    const paper = get().papers.find(p => p.id === paperId);
    if (!paper) {
      return { id: 'root', label: '未知文献' };
    }
    
    const tags = paper.tags || [];
    const tagNodes = tags.slice(0, 4).map((tag, i) => ({
      id: `tag-${i}`,
      label: tag,
      color: ['#A78BFA', '#F472B6', '#34D399', '#FB923C'][i % 4],
    }));

    return {
      id: 'root',
      label: paper.title.length > 50 ? paper.title.substring(0, 50) + '...' : paper.title,
      color: '#8B5CF6',
      children: [
        {
          id: 'background',
          label: '研究背景',
          color: '#A78BFA',
          children: [
            { id: 'bg1', label: '研究意义', color: '#C4B5FD' },
            { id: 'bg2', label: '研究现状', color: '#C4B5FD' },
            { id: 'bg3', label: '科学问题', color: '#C4B5FD' },
          ],
        },
        {
          id: 'methods',
          label: '实验方法',
          color: '#F472B6',
          children: [
            { id: 'm1', label: '实验设计', color: '#F9A8D4' },
            { id: 'm2', label: '材料试剂', color: '#F9A8D4' },
            { id: 'm3', label: '检测方法', color: '#F9A8D4' },
          ],
        },
        {
          id: 'findings',
          label: '关键发现',
          color: '#34D399',
          children: [
            { id: 'f1', label: '主要结果', color: '#6EE7B7' },
            { id: 'f2', label: '数据验证', color: '#6EE7B7' },
            { id: 'f3', label: '机制分析', color: '#6EE7B7' },
          ],
        },
        {
          id: 'conclusion',
          label: '结论展望',
          color: '#FB923C',
          children: [
            { id: 'c1', label: '研究结论', color: '#FDBA74' },
            { id: 'c2', label: '创新点', color: '#FDBA74' },
            { id: 'c3', label: '未来方向', color: '#FDBA74' },
          ],
        },
        {
          id: 'keywords',
          label: '关键词',
          color: '#60A5FA',
          children: tagNodes.length > 0 ? tagNodes : [
            { id: 'kw1', label: '生物正交', color: '#93C5FD' },
            { id: 'kw2', label: '点击化学', color: '#93C5FD' },
          ],
        },
      ],
    };
  },

  exportMindMap: (paperId: string, format: 'png' | 'json' | 'text') => {
    const paper = get().papers.find(p => p.id === paperId);
    if (!paper) return;

    const mindMap = get().generateMindMap(paperId);

    if (format === 'json') {
      const dataStr = JSON.stringify(mindMap, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.title.replace(/\s+/g, '_').substring(0, 30)}_mindmap.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'text') {
      const generateText = (node: MindMapNode, level: number = 0): string => {
        let result = '  '.repeat(level) + '- ' + node.label + '\n';
        if (node.children) {
          node.children.forEach(child => {
            result += generateText(child, level + 1);
          });
        }
        return result;
      };
      const textContent = `思维导图：${paper.title}\n期刊：${paper.journal}\n作者：${paper.authors}\n\n${generateText(mindMap)}`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.title.replace(/\s+/g, '_').substring(0, 30)}_mindmap.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'png') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 900;
      canvas.height = 650;

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#FAF5FF');
      gradient.addColorStop(1, '#FDF2F8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = 80;

      ctx.fillStyle = '#8B5CF6';
      ctx.fillRect(centerX - 180, centerY - 25, 360, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const title = paper.title.length > 35 ? paper.title.substring(0, 35) + '...' : paper.title;
      ctx.fillText(title, centerX, centerY);

      const branches = [
        { label: '研究背景', color: '#A78BFA', x: 150, y: 200, items: ['研究意义', '研究现状', '科学问题'] },
        { label: '实验方法', color: '#F472B6', x: 380, y: 200, items: ['实验设计', '材料试剂', '检测方法'] },
        { label: '关键发现', color: '#34D399', x: 520, y: 420, items: ['主要结果', '数据验证', '机制分析'] },
        { label: '结论展望', color: '#FB923C', x: 750, y: 200, items: ['研究结论', '创新点', '未来方向'] },
      ];

      branches.forEach(branch => {
        ctx.strokeStyle = branch.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 25);
        ctx.quadraticCurveTo(
          (centerX + branch.x) / 2,
          (centerY + branch.y) / 2 + 30,
          branch.x,
          branch.y - 20
        );
        ctx.stroke();

        ctx.fillStyle = branch.color;
        ctx.beginPath();
        ctx.arc(branch.x, branch.y - 20, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = branch.color;
        ctx.font = 'bold 14px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(branch.label, branch.x, branch.y + 10);

        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#4B5563';
        branch.items.forEach((item, i) => {
          const itemY = branch.y + 35 + i * 28;
          ctx.fillText(item, branch.x, itemY);
          
          ctx.strokeStyle = branch.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.moveTo(branch.x, branch.y + 20);
          ctx.lineTo(branch.x, itemY - 8);
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
      });

      ctx.fillStyle = '#6B7280';
      ctx.font = '11px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${paper.journal} · ${paper.date}`, canvas.width - 20, canvas.height - 15);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${paper.title.replace(/\s+/g, '_').substring(0, 30)}_mindmap.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  },

  generatePPT: async () => {
    set({ isGeneratingPPT: true });

    await new Promise(resolve => setTimeout(resolve, 2500));

    const papers = get().papers.slice(0, 4);
    
    const titleSlide: PPTSlide = {
      id: generateId(),
      title: '生物正交化学研究进展',
      content: `文献汇报\n\n汇报人：科研助手\n日期：${getTodayStr()}\n\n精选 ${papers.length} 篇最新研究文献`,
      type: 'title',
    };
    
    const outlineSlide: PPTSlide = {
      id: generateId(),
      title: '汇报提纲',
      content: `一、研究背景与意义\n   生物正交化学的发展历程与应用价值\n\n二、精选文献解读\n   1. 四嗪化学与体内免疫细胞成像\n   2. 光控生物正交反应与蛋白质操控\n   3. SPAAC反应的生物医学应用\n   4. 代谢糖标记与肿瘤转移研究\n\n三、总结与展望\n   领域发展趋势与未来研究方向`,
      type: 'content',
    };
    
    const contentSlides: PPTSlide[] = papers.map((paper, index) => ({
      id: generateId(),
      title: `文献 ${index + 1}：${paper.title}`,
      content: `作者：${paper.authors}\n期刊：${paper.journal}\n发表日期：${paper.date}\n\n摘要：\n${paper.abstract}\n\n关键词：${paper.tags.join('、')}`,
      type: 'content',
    }));
    
    const mindmapSlide: PPTSlide = {
      id: generateId(),
      title: '文献逻辑框架',
      content: `核心主题：生物正交化学研究进展\n\n├── 技术发展方向\n│   ├── 四嗪/TCO反应（高速、活体适用）\n│   ├── SPAAC反应（无铜、生物相容）\n│   ├── 光点击反应（时空可控）\n│   └── CuAAC反应（高效、体外适用）\n\n├── 主要应用领域\n│   ├── 活体成像（免疫细胞追踪）\n│   ├── 蛋白质组学（标记与鉴定）\n│   ├── 药物递送（ADC、前药激活）\n│   └── 糖生物学（代谢标记）\n\n└── 未来发展趋势\n    ├── 更高反应速率\n    ├── 更低生物毒性\n    ├── 多通道同时标记\n    └── 临床转化应用`,
      type: 'mindmap',
    };
    
    const summarySlide: PPTSlide = {
      id: generateId(),
      title: '总结与展望',
      content: `研究总结：\n\n• 四嗪化学推动了活体成像技术的发展\n• 光控反应实现了蛋白质功能的时空操控\n• SPAAC在药物递送领域展现巨大潜力\n• 代谢糖标记揭示了肿瘤转移新机制\n\n技术发展趋势：\n\n1. 反应动力学持续优化，向超快方向发展\n2. 生物相容性不断改善，减少细胞毒性\n3. 多色标记技术发展，实现多靶点同时成像\n4. 与其他技术（如CRISPR、超分辨成像）结合\n\n未来研究方向：\n\n• 开发新型生物正交反应对\n• 拓展在神经科学、免疫学等领域的应用\n• 推动临床诊断和治疗中的转化应用\n\n谢谢大家！`,
      type: 'summary',
    };
    
    const slides: PPTSlide[] = [
      titleSlide,
      outlineSlide,
      ...contentSlides,
      mindmapSlide,
      summarySlide,
    ];

    const speech = `各位老师同学，大家好！\n\n今天我将为大家汇报近期阅读的四篇关于生物正交化学的重要研究文献。生物正交化学作为化学生物学领域的核心技术，近年来发展迅速，在生命科学研究中发挥着越来越重要的作用。\n\n首先看第一篇文献，发表在Nature Chemical Biology上，研究主题是四嗪生物正交化学在免疫细胞体内成像中的应用。该研究利用四嗪与反式环辛烯的高速反应，结合代谢标记技术，实现了活体水平下免疫细胞迁移的高时空分辨率追踪。这项工作为研究免疫应答的动态过程提供了强大的工具。\n\n第二篇文献来自Journal of the American Chemical Society，报道了一种新型的光激活生物正交反应体系。研究人员利用邻甲基苯甲酰叠氮在紫外光照射下生成腈亚胺中间体的特性，结合遗传密码扩展技术，实现了活细胞内蛋白质活性的精确时空操控。这种光控策略为研究蛋白质的动态功能提供了新手段。\n\n第三篇是发表在Angewandte Chemie上的综述文章，系统总结了应变促进叠氮-炔烃环加成（SPAAC）反应的最新进展。文章详细讨论了环辛炔衍生物的设计策略、反应动力学优化，以及在糖生物学、蛋白质组学、药物递送等领域的广泛应用。\n\n第四篇文献来自Cell Chemical Biology，利用代谢糖标记技术结合定量蛋白质组学，研究了肿瘤转移过程中唾液酸化的动态变化。研究发现L1CAM的高唾液酸化与肿瘤侵袭能力密切相关，为肿瘤转移的早期诊断提供了新的生物标志物。\n\n总的来说，这四篇文献从不同角度展示了生物正交化学的快速发展和广阔应用前景。从反应类型的创新到应用领域的拓展，生物正交化学正在深刻改变生命科学的研究方式。未来，随着反应速率的提升、生物相容性的改善以及多色标记技术的发展，生物正交化学将在更多领域发挥重要作用。\n\n我的汇报到此结束，谢谢大家！`;

    const pptData: PPTData = {
      id: generateId(),
      title: '生物正交化学研究进展',
      generatedDate: getTodayStr(),
      slides,
      speech,
      paperCount: papers.length,
    };

    storage.set(STORAGE_KEY_PPT, pptData);
    set({ pptData, isGeneratingPPT: false });
  },

  downloadPPT: () => {
    const pptData = get().pptData;
    if (!pptData) return;

    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${pptData.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif; }
    .slide { 
      width: 100vw; 
      height: 100vh; 
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
      align-items: center; 
      padding: 60px; 
      box-sizing: border-box; 
      page-break-after: always; 
    }
    .title-slide { 
      background: linear-gradient(135deg, #8B5CF6, #EC4899); 
      color: white; 
      text-align: center; 
    }
    .content-slide { 
      background: white; 
      color: #1F2937; 
      align-items: flex-start;
      justify-content: flex-start;
      padding-top: 80px;
    }
    .mindmap-slide {
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white;
    }
    .summary-slide { 
      background: linear-gradient(135deg, #10B981, #3B82F6); 
      color: white; 
      align-items: flex-start;
      justify-content: flex-start;
      padding-top: 80px;
    }
    .title-slide h1 { font-size: 56px; margin-bottom: 40px; }
    .content-slide h2 { 
      font-size: 36px; 
      color: #8B5CF6; 
      margin-bottom: 30px; 
      text-align: left; 
      width: 100%;
      padding-bottom: 15px;
      border-bottom: 3px solid #8B5CF6;
    }
    .summary-slide h2 { 
      font-size: 42px; 
      margin-bottom: 40px; 
      text-align: left;
      width: 100%;
    }
    .mindmap-slide h2 {
      font-size: 42px;
      margin-bottom: 40px;
    }
    .content-text { 
      font-size: 22px; 
      line-height: 2; 
      white-space: pre-wrap; 
      text-align: left; 
      width: 100%; 
    }
    .summary-text { 
      font-size: 22px; 
      line-height: 2; 
      white-space: pre-wrap; 
      text-align: left;
      width: 100%;
    }
    .mindmap-text {
      font-size: 20px;
      line-height: 2.2;
      white-space: pre-wrap;
      font-family: 'Consolas', monospace;
    }
    .title-content {
      font-size: 28px;
      line-height: 1.8;
      opacity: 0.95;
    }
  </style>
</head>
<body>
`;

    pptData.slides.forEach(slide => {
      if (slide.type === 'title') {
        htmlContent += `<div class="slide title-slide"><h1>${slide.title}</h1><div class="title-content">${slide.content.replace(/\n/g, '<br>')}</div></div>\n`;
      } else if (slide.type === 'summary') {
        htmlContent += `<div class="slide summary-slide"><h2>${slide.title}</h2><div class="summary-text">${slide.content.replace(/\n/g, '<br>')}</div></div>\n`;
      } else if (slide.type === 'mindmap') {
        htmlContent += `<div class="slide mindmap-slide"><h2>${slide.title}</h2><div class="mindmap-text">${slide.content.replace(/\n/g, '<br>')}</div></div>\n`;
      } else {
        htmlContent += `<div class="slide content-slide"><h2>${slide.title}</h2><div class="content-text">${slide.content.replace(/\n/g, '<br>')}</div></div>\n`;
      }
    });

    htmlContent += `
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pptData.title.replace(/\s+/g, '_')}_PPT.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  downloadSpeech: () => {
    const pptData = get().pptData;
    if (!pptData) return;

    const blob = new Blob([pptData.speech], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pptData.title.replace(/\s+/g, '_')}_演讲稿.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  generateWeeklyReport: () => {
    const notes = get().experimentNotes.filter(n => n.week === currentWeek && n.year === currentYear);
    const papersThisWeek = get().papers.filter(p => p.week === currentWeek && p.year === currentYear);

    let report = `========================================\n`;
    report += `         实验周报 - 第${currentWeek}周\n`;
    report += `========================================\n`;
    report += `日期：${getTodayStr()}\n\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `  一、本周文献阅读（${papersThisWeek.length}篇）\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    papersThisWeek.forEach((paper, i) => {
      report += `  ${i + 1}. ${paper.title}\n`;
      report += `     作者：${paper.authors}\n`;
      report += `     期刊：${paper.journal}\n`;
      report += `     标签：${paper.tags.join('、')}\n\n`;
    });
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `  二、本周实验记录（${notes.length}条）\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    notes.forEach((note, i) => {
      report += `  ${i + 1}. ${note.title}（${note.date}）\n`;
      report += `     ${note.content}\n`;
      report += `     标签：${note.tags.join('、')}\n\n`;
    });
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `  三、下周计划\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    report += `  1. 继续推进实验进度，完成当前系列实验\n`;
    report += `  2. 整理分析实验数据，绘制图表\n`;
    report += `  3. 阅读相关文献，拓展研究思路\n`;
    report += `  4. 准备组会汇报材料\n\n`;
    report += `========================================\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `第${currentWeek}周实验周报.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return report;
  },

  batchImportPapers: (papers) => {
    const newPapers = papers.map(paper => {
      const paperDate = new Date(paper.date || new Date());
      return {
        ...paper,
        id: generateId(),
        week: getWeekNumber(paperDate),
        year: paperDate.getFullYear(),
      };
    });
    set((state) => {
      const allPapers = [...newPapers, ...state.papers];
      storage.set(STORAGE_KEY_PAPERS, allPapers);
      return { papers: allPapers };
    });
    return newPapers.length;
  },

  // ===== 研究问题（苏格拉底模式）=====
  startResearchQuestion: (topic, framework) => {
    const id = generateId();
    const now = new Date().toISOString();
    const questions = generateSocraticQuestions(topic, framework);
    const rq: ResearchQuestion = {
      id,
      topic,
      framework,
      socraticQuestions: questions,
      answers: new Array(questions.length).fill(''),
      refinedQuestion: '',
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const list = [rq, ...state.researchQuestions];
      storage.set(STORAGE_KEY_RQ, list);
      return { researchQuestions: list };
    });
    return id;
  },

  updateResearchQuestionAnswers: (id, answers) => {
    set((state) => {
      const list = state.researchQuestions.map(rq =>
        rq.id === id ? { ...rq, answers, updatedAt: new Date().toISOString() } : rq
      );
      storage.set(STORAGE_KEY_RQ, list);
      return { researchQuestions: list };
    });
  },

  refineResearchQuestion: (id, refined) => {
    set((state) => {
      const list = state.researchQuestions.map(rq =>
        rq.id === id ? { ...rq, refinedQuestion: refined, updatedAt: new Date().toISOString() } : rq
      );
      storage.set(STORAGE_KEY_RQ, list);
      return { researchQuestions: list };
    });
  },

  deleteResearchQuestion: (id) => {
    set((state) => {
      const list = state.researchQuestions.filter(rq => rq.id !== id);
      storage.set(STORAGE_KEY_RQ, list);
      return { researchQuestions: list };
    });
  },

  // ===== 文献综述助手 =====
  getSearchStrategy: (researchQuestion) => {
    return generateSearchStrategy(researchQuestion);
  },

  addLiteratureMatrixEntry: (entry) => {
    const newEntry: LiteratureMatrixEntry = {
      ...entry,
      id: generateId(),
      addedAt: new Date().toISOString(),
    };
    set((state) => {
      const list = [newEntry, ...state.literatureMatrix];
      storage.set(STORAGE_KEY_LM, list);
      return { literatureMatrix: list };
    });
  },

  updateLiteratureMatrixEntry: (id, patch) => {
    set((state) => {
      const list = state.literatureMatrix.map(e => e.id === id ? { ...e, ...patch } : e);
      storage.set(STORAGE_KEY_LM, list);
      return { literatureMatrix: list };
    });
  },

  deleteLiteratureMatrixEntry: (id) => {
    set((state) => {
      const list = state.literatureMatrix.filter(e => e.id !== id);
      storage.set(STORAGE_KEY_LM, list);
      return { literatureMatrix: list };
    });
  },

  importPapersToMatrix: () => {
    const papers = get().papers;
    const existing = new Set(get().literatureMatrix.map(e => e.title.toLowerCase()));
    const toAdd: LiteratureMatrixEntry[] = papers
      .filter(p => !existing.has(p.title.toLowerCase()))
      .slice(0, 6)
      .map(p => ({
        id: generateId(),
        paperId: p.id,
        title: p.title,
        authors: p.authors,
        year: new Date(p.date).getFullYear().toString(),
        methods: '',
        mainFindings: p.abstract,
        limitations: '',
        relevance: '',
        addedAt: new Date().toISOString(),
      }));
    set((state) => {
      const list = [...toAdd, ...state.literatureMatrix];
      storage.set(STORAGE_KEY_LM, list);
      return { literatureMatrix: list };
    });
    return toAdd.length;
  },

  exportLiteratureMatrixCSV: () => {
    const matrix = get().literatureMatrix;
    const headers = ['标题', '作者', '年份', '研究方法', '主要发现', '局限性', '与本研究的关联'];
    const escape = (s: string) => `"${(s || '').replace(/"/g, '""')}"`;
    const rows = matrix.map(e => [e.title, e.authors, e.year, e.methods, e.mainFindings, e.limitations, e.relevance].map(escape).join(','));
    const csv = '\uFEFF' + headers.map(escape).join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `文献矩阵_${getTodayStr()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // ===== 论文写作助手 =====
  generateOutline: (researchQuestion, title) => {
    const id = generateId();
    const outline: PaperOutline = {
      id,
      title: title || '未命名论文',
      researchQuestion,
      sections: generateImRaDOutline(researchQuestion),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const list = [outline, ...state.paperOutlines];
      storage.set(STORAGE_KEY_OUTLINES, list);
      return { paperOutlines: list };
    });
    return id;
  },

  deleteOutline: (id) => {
    set((state) => {
      const list = state.paperOutlines.filter(o => o.id !== id);
      storage.set(STORAGE_KEY_OUTLINES, list);
      return { paperOutlines: list };
    });
  },

  generateAbstract: (info) => {
    const generated = `【背景】${info.background} 【方法】${info.methods} 【结果】${info.results} 【结论】${info.conclusion}`;
    const abs: PaperAbstract = {
      ...info,
      id: generateId(),
      generatedAbstract: generated,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const list = [abs, ...state.paperAbstracts];
      storage.set(STORAGE_KEY_ABSTRACTS, list);
      return { paperAbstracts: list };
    });
    return abs;
  },

  polishText: (text) => {
    return polishAcademicText(text);
  },

  // ===== 实验规划 =====
  addExperimentPlan: (plan) => {
    const id = generateId();
    const newPlan: ExperimentPlan = {
      id,
      title: plan.title,
      hypothesis: plan.hypothesis,
      independentVariable: plan.independentVariable,
      dependentVariable: plan.dependentVariable,
      controlGroup: plan.controlGroup,
      sampleSize: plan.sampleSize,
      steps: plan.steps && plan.steps.length > 0 ? plan.steps : defaultExperimentSteps(plan.title),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const list = [newPlan, ...state.experimentPlans];
      storage.set(STORAGE_KEY_EXP, list);
      return { experimentPlans: list };
    });
    return id;
  },

  updateExperimentPlan: (id, patch) => {
    set((state) => {
      const list = state.experimentPlans.map(p => p.id === id ? { ...p, ...patch } : p);
      storage.set(STORAGE_KEY_EXP, list);
      return { experimentPlans: list };
    });
  },

  toggleExperimentStep: (planId, stepId) => {
    set((state) => {
      const list = state.experimentPlans.map(p => {
        if (p.id !== planId) return p;
        return {
          ...p,
          steps: p.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s),
        };
      });
      storage.set(STORAGE_KEY_EXP, list);
      return { experimentPlans: list };
    });
  },

  addExperimentStep: (planId, text) => {
    set((state) => {
      const list = state.experimentPlans.map(p => {
        if (p.id !== planId) return p;
        return { ...p, steps: [...p.steps, { id: generateId(), text, completed: false }] };
      });
      storage.set(STORAGE_KEY_EXP, list);
      return { experimentPlans: list };
    });
  },

  deleteExperimentPlan: (id) => {
    set((state) => {
      const list = state.experimentPlans.filter(p => p.id !== id);
      storage.set(STORAGE_KEY_EXP, list);
      return { experimentPlans: list };
    });
  },

  // ===== 论文精读 =====
  addReadingPaper: (paper) => {
    const id = generateId();
    const rawText = paper.rawText || '';
    const segPairs = rawText.trim().length > 0 ? splitIntoSegments(rawText) : [];
    const segments = segPairs.map(s => ({ id: generateId(), en: s.en, zh: s.zh }));
    const fullText = segments.map(s => s.en).join(' ');
    const terminology = extractTerminology(fullText);
    const figureMarkers = detectFigurePositions(segments).map(m => ({ id: generateId(), ...m }));
    const newPaper: ReadingPaper = {
      id,
      title: paper.title,
      source: paper.source,
      sourceValue: paper.sourceValue,
      segments,
      terminology,
      figureMarkers,
      notes: segments.length > 0 ? '基于本地术语词典与句法规则自动生成对照翻译，专业术语已标注，关键术语请人工复核。' : '',
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const list = [newPaper, ...state.readingPapers];
      storage.set(STORAGE_KEY_READING, list);
      return { readingPapers: list };
    });
    return id;
  },

  deleteReadingPaper: (id) => {
    set((state) => {
      const list = state.readingPapers.filter(p => p.id !== id);
      storage.set(STORAGE_KEY_READING, list);
      return { readingPapers: list };
    });
  },

  translateText: (enText) => {
    return translateParagraphToChinese(enText);
  },

  addTerminology: (term) => {
    const newTerm: Terminology = { ...term, id: generateId() };
    set((state) => {
      const list = [newTerm, ...state.terminologyLedger];
      storage.set(STORAGE_KEY_TERMS, list);
      return { terminologyLedger: list };
    });
  },

  deleteTerminology: (id) => {
    set((state) => {
      const list = state.terminologyLedger.filter(t => t.id !== id);
      storage.set(STORAGE_KEY_TERMS, list);
      return { terminologyLedger: list };
    });
  },

  // ===== 框架图 =====
  createFrameworkFigure: (title, template, topic) => {
    const id = generateId();
    const { nodes, edges } = generateFrameworkFigure(topic, template);
    const fig: FrameworkFigure = {
      id,
      title,
      template,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const list = [fig, ...state.frameworkFigures];
      storage.set(STORAGE_KEY_FRAMEWORK, list);
      return { frameworkFigures: list };
    });
    return id;
  },

  deleteFrameworkFigure: (id) => {
    set((state) => {
      const list = state.frameworkFigures.filter(f => f.id !== id);
      storage.set(STORAGE_KEY_FRAMEWORK, list);
      return { frameworkFigures: list };
    });
  },

  exportFrameworkSVG: (id) => {
    const fig = get().frameworkFigures.find(f => f.id === id);
    if (!fig) return;
    const nodeRadius = 26;
    const layerCount = fig.nodes.length;
    const width = 760;
    const height = 110 + layerCount * 95;
    const cx = width / 2;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FAF5FF"/><stop offset="100%" stop-color="#FDF2F8"/></linearGradient></defs>`;
    svg += `<rect width="${width}" height="${height}" fill="url(#bg)" rx="16"/>`;
    svg += `<text x="${cx}" y="40" text-anchor="middle" font-family="Microsoft YaHei, sans-serif" font-size="20" font-weight="bold" fill="#7E22CE">${fig.title}</text>`;
    const positions: Record<string, { x: number; y: number }> = {};
    fig.nodes.forEach((n, i) => {
      positions[n.id] = { x: cx, y: 80 + i * 95 };
    });
    fig.edges.forEach(edge => {
      const from = positions[edge.from];
      const to = positions[edge.to];
      if (!from || !to) return;
      svg += `<line x1="${from.x}" y1="${from.y + nodeRadius}" x2="${to.x}" y2="${to.y - nodeRadius}" stroke="#C4B5FD" stroke-width="2.5" stroke-linecap="round"/>`;
      if (edge.label) {
        const mx = (from.x + to.x) / 2 + 60;
        const my = (from.y + to.y) / 2;
        svg += `<text x="${mx}" y="${my}" text-anchor="middle" font-family="Microsoft YaHei, sans-serif" font-size="12" fill="#7C3AED">${edge.label}</text>`;
      }
    });
    fig.nodes.forEach(n => {
      const p = positions[n.id];
      svg += `<rect x="${p.x - 110}" y="${p.y - nodeRadius}" width="220" height="${nodeRadius * 2}" rx="${nodeRadius}" fill="${n.color}" opacity="0.9"/>`;
      svg += `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-family="Microsoft YaHei, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">${n.label}</text>`;
    });
    svg += `</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fig.title.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
}));
