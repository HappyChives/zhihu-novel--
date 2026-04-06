import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type {
  AppConfig,
  LLMConfig,
  Project,
  WorkflowStage,
  InspirationItem,
  WorldSetting,
  OutlineData,
  Character,
  ChapterOutline,
  WritingProgress,
  CoverMaterialData,
} from "./types";

const PROJECT_KEY = "storyforge_project";
const CONFIG_KEY = "storyforge_config";

const STAGE_ORDER: WorkflowStage[] = [
  "hotspot",
  "inspiration",
  "worldSetting",
  "outline",
  "character",
  "chapterOutline",
  "writing",
  "cover",
];

function stageIndex(s: WorkflowStage): number {
  return STAGE_ORDER.indexOf(s);
}

const defaultConfig: AppConfig = {
  llm: {
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    model: "",
    apiKey: "",
  },
};

interface AppContextType {
  project: Project | null;
  config: AppConfig;
  updateLLMConfig: (cfg: Partial<LLMConfig>) => void;
  startProject: (name: string) => void;
  advanceStage: () => void;
  goToStage: (s: WorkflowStage) => void;
  setHotspotData: (data: string) => void;
  setInspirations: (items: InspirationItem[]) => void;
  selectInspiration: (id: string) => void;
  setWorldSetting: (ws: WorldSetting) => void;
  setOutline: (o: OutlineData) => void;
  setCharacters: (chars: Character[]) => void;
  setChapterOutline: (co: ChapterOutline) => void;
  setWritingProgress: (wp: WritingProgress) => void;
  setCoverMaterials: (cm: CoverMaterialData) => void;
  isApiConfigured: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

function loadProject(): Project | null {
  try {
    const raw = localStorage.getItem(PROJECT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...defaultConfig, ...JSON.parse(raw) } : defaultConfig;
  } catch {
    return defaultConfig;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  useEffect(() => {
    setProject(loadProject());
    setConfig(loadConfig());
  }, []);

  const saveProject = useCallback((p: Project | null) => {
    setProject(p);
    if (p) {
      localStorage.setItem(PROJECT_KEY, JSON.stringify(p));
    } else {
      localStorage.removeItem(PROJECT_KEY);
    }
  }, []);

  const saveConfigToStorage = useCallback((cfg: AppConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  }, []);

  const updateLLMConfig = useCallback((cfg: Partial<LLMConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, llm: { ...prev.llm, ...cfg } };
      saveConfigToStorage(updated);
      return updated;
    });
  }, [saveConfigToStorage]);

  const startProject = useCallback((name: string) => {
    const p: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      stage: "hotspot",
      inspirations: [],
    };
    saveProject(p);
  }, [saveProject]);

  const advanceStage = useCallback(() => {
    setProject((prev) => {
      if (!prev) return prev;
      const idx = stageIndex(prev.stage);
      const next = STAGE_ORDER[idx + 1];
      if (!next) return prev;
      const updated = { ...prev, stage: next };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const goToStage = useCallback((s: WorkflowStage) => {
    setProject((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, stage: s };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const setHotspotData = useCallback((data: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, hotspotData: data };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const setInspirations = useCallback((items: InspirationItem[]) => {
    setProject((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, inspirations: items };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const selectInspiration = useCallback((id: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const idx = stageIndex(prev.stage);
      const nextStage = STAGE_ORDER[idx + 1] ?? "worldSetting";
      const updated = { ...prev, selectedInspirationId: id, stage: nextStage };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const setWorldSetting = useCallback((ws: WorldSetting) => {
    setProject((prev) => {
      if (!prev) return prev;
      const idx = stageIndex(prev.stage);
      const nextStage = STAGE_ORDER[idx + 1] ?? "outline";
      const updated = { ...prev, worldSetting: ws, stage: nextStage };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const setOutline = useCallback((o: OutlineData) => {
    setProject((prev) => {
      if (!prev) return prev;
      const idx = stageIndex(prev.stage);
      const nextStage = STAGE_ORDER[idx + 1] ?? "character";
      const updated = { ...prev, outline: o, stage: nextStage };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const setCharacters = useCallback((chars: Character[]) => {
    setProject((prev) => {
      if (!prev) return prev;
      const idx = stageIndex(prev.stage);
      const nextStage = STAGE_ORDER[idx + 1] ?? "chapterOutline";
      const updated = { ...prev, characters: chars, stage: nextStage };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const setChapterOutline = useCallback((co: ChapterOutline) => {
    setProject((prev) => {
      if (!prev) return prev;
      const idx = stageIndex(prev.stage);
      const nextStage = STAGE_ORDER[idx + 1] ?? "writing";
      const updated = { ...prev, chapterOutline: co, stage: nextStage };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const setWritingProgress = useCallback((wp: WritingProgress) => {
    setProject((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, writingProgress: wp };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const setCoverMaterials = useCallback((cm: CoverMaterialData) => {
    setProject((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, coverMaterials: cm };
      saveProject(updated);
      return updated;
    });
  }, [saveProject]);

  const isApiConfigured = config.llm.model !== "" && config.llm.apiKey !== "";

  return (
    <AppContext.Provider
      value={{
        project,
        config,
        updateLLMConfig,
        startProject,
        advanceStage,
        goToStage,
        setHotspotData,
        setInspirations,
        selectInspiration,
        setWorldSetting,
        setOutline,
        setCharacters,
        setChapterOutline,
        setWritingProgress,
        setCoverMaterials,
        isApiConfigured,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export type { AppConfig, LLMConfig, Project };
