import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loadConfig, saveConfig } from "./config";
import type {
  LLMConfig,
  AppConfig,
  Project,
} from "./types";

const defaultConfig: AppConfig = {
  llm: {
    provider: "ollama",
    baseUrl: "http://localhost:11434",
    model: "qwen2.5",
    apiKey: "",
  },
  licenseKey: "",
  licenseValid: false,
};

interface AppContextType {
  config: AppConfig;
  updateLLMConfig: (cfg: Partial<LLMConfig>) => void;
  updateLicense: (key: string) => void;
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
  addProject: (p: Project) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem("storyforge_projects");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    const saved = loadConfig();
    if (saved) {
      setConfig({ ...defaultConfig, ...saved });
    }
    setProjects(loadProjects());
  }, []);

  const updateLLMConfig = useCallback((cfg: Partial<LLMConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, llm: { ...prev.llm, ...cfg } };
      saveConfig(updated);
      return updated;
    });
  }, []);

  const updateLicense = useCallback((key: string) => {
    // 本地验证：格式校验 + 简单校验位算法
    const formatOk = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
    // 简单校验：校验位 = 前3段各自字符的ASCII码和 mod 26 + 'A'
    if (formatOk) {
      const parts = key.split("-");
      const sum1 = parts[0].split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const sum2 = parts[1].split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const sum3 = parts[2].split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const check1 = String.fromCharCode(((sum1 % 26) + 65));
      const check2 = String.fromCharCode(((sum2 % 26) + 65));
      const check3 = String.fromCharCode(((sum3 % 26) + 65));
      const expected = `${check1}${check2}${check3}`;
      const provided = parts[0][0] + parts[1][0] + parts[2][0];
      if (provided !== expected) {
        setConfig((prev) => ({ ...prev, licenseKey: key, licenseValid: false }));
        return;
      }
    }
    setConfig((prev) => ({ ...prev, licenseKey: key, licenseValid: formatOk }));
  }, []);

  const addProject = useCallback((p: Project) => {
    setProjects((prev) => {
      const next = [...prev, p];
      localStorage.setItem("storyforge_projects", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        config,
        updateLLMConfig,
        updateLicense,
        projects,
        activeProject,
        setActiveProject,
        addProject,
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
