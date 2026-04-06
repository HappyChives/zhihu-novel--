// 共享类型定义 - StoryForge 故事工坊

export type Provider =
  | "openai" | "anthropic" | "google"
  | "zhipu" | "deepseek" | "moonshot" | "minimax" | "baidu" | "alibaba" | "siliconflow" | "custom";

export type WorkflowStage =
  | "hotspot" | "inspiration" | "worldSetting" | "outline"
  | "character" | "chapterOutline" | "writing" | "cover";

export interface LLMConfig {
  provider: Provider;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface WorldSetting {
  baseRule: string;           // 底层规则/核心设定
  socialStructure: string;     // 社会结构
  civilization: string;        // 文明/表层生活
  keyConflict: string;        // 核心冲突来源
  rulesToShow: string[];      // 需要展示给读者的规则
}

export interface Character {
  id: string;
  name: string;
  role: "protagonist" | "antagonist" | "supporting" | "minor";
  age?: string;
  occupation?: string;
  coreDesire: string;         // 最想要什么
  coreFear: string;           // 最不想失去什么
  rootConflict: string;       // 根冲突
  backstory: string;         // 背景故事
  keyTrait: string;           // 标志性细节
  arc: string;               // 人物弧光
}

export interface SectionOutline {
  sectionNum: number;
  title: string;
  content: string;
  wordTarget: number;
  hookPosition?: string;
}

export interface ChapterOutlineItem {
  chapterNum: number;
  summary: string;
  sections: SectionOutline[];
}

export interface ChapterOutline {
  // 固定10章，盐选标准短篇篇幅（总字数8500-10000）
  totalChapters: 10;
  totalWords: number;
  chapters: ChapterOutlineItem[];
}

export interface CheckResult {
  type: "logic" | "pace" | "dialogue" | "grammar" | "consistency";
  severity: "warn" | "error";
  location: string;
  message: string;
}

export interface WrittenChapter {
  chapterNum: number;
  content: string;
  wordCount: number;
  polishedContent?: string;
  checks: CheckResult[];
}

export interface WritingProgress {
  chapters: WrittenChapter[];
  totalWordCount: number;
  polishCount: number;
}

export interface InspirationItem {
  id: string;
  title: string;
  conflict: string;
  characters: string;
  worldSetting: string;
  mood: string;
  explosionPoint: string;
  genre: string;
}

export interface OutlineData {
  hook: string;
  mainLine: string;
  explosionPoints: string[];
  ending: string;
  chapterWordAlloc: number[];
}

export interface CoverMaterialData {
  imagePrompt: string;
  synopsis: string;
  goldenLines: string[];
  characterConflict: string;
  tags: string[];
}

export interface AppConfig {
  llm: LLMConfig;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  stage: WorkflowStage;
  hotspotData?: string;
  inspirations: InspirationItem[];
  rawInspirations?: string;     // AI 生成的原始灵感文本（用于展示）
  selectedInspirationId?: string;
  worldSetting?: WorldSetting;
  outline?: OutlineData;
  characters?: Character[];
  chapterOutline?: ChapterOutline;
  writingProgress?: WritingProgress;
  coverMaterials?: CoverMaterialData;
}
