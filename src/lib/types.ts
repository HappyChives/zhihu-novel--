// 共享类型定义

export type Provider =
  // 本地
  | "ollama"
  | "lmstudio"
  | "localai"
  // 国际 API
  | "openai"
  | "anthropic"
  | "google"
  // 国内 API
  | "zhipu"
  | "deepseek"
  | "moonshot"
  | "minimax"
  | "baidu"
  | "alibaba"
  | "siliconflow"
  | "custom";

export interface LLMConfig {
  provider: Provider;
  baseUrl: string;       // API 地址
  model: string;          // 模型名
  apiKey: string;        // API Key
}

export interface InspirationItem {
  id: string;
  conflict: string;
  characters: string;
  worldSetting: string;
  mood: string;
}

export interface TopicItem {
  id: string;
  conflict: string;
  platformFit: string;
  inspirationId: string;
}

export interface OutlineData {
  act1: string;
  act2: string;
  act3: string;
  act4: string;
  characterArcs: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
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
  licenseKey: string;
  licenseValid: boolean;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  hotspotData?: string;
  inspiration?: InspirationItem[];
  selectedTopic?: TopicItem;
  outline?: OutlineData;
  chapters: Chapter[];
  coverMaterials?: CoverMaterialData;
}
