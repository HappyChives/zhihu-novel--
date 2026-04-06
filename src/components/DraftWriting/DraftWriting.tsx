import { useState, useEffect } from "react";
import { useApp } from "../../lib/context";
import { buildWritingPrompt, buildPolishPrompt, buildCheckPrompt, type PolishIntent } from "../../prompts";
import type { WrittenChapter, CheckResult } from "../../lib/types";

const POLISH_INTENTS: { value: PolishIntent; label: string }[] = [
  { value: "更虐", label: "更虐" },
  { value: "更甜", label: "更甜" },
  { value: "更爽", label: "更爽" },
  { value: "更悬疑", label: "更悬疑" },
  { value: "精简", label: "精简" },
  { value: "增细节", label: "增细节" },
  { value: "调节奏", label: "调节奏" },
  { value: "强冲突", label: "强冲突" },
];

export function DraftWriting() {
  const { config, project, setWritingProgress } = useApp();

  const [selectedChapter, setSelectedChapter] = useState(1);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);

  // Guard: no project loaded yet
  if (!project) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">✍️ 正文创作</h2>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-center">加载中...</p>
        </div>
      </div>
    );
  }

  const selectedInspiration = project.inspirations.find(
    (i) => i.id === project.selectedInspirationId
  );

  const chapters = project.writingProgress?.chapters || [];

  // 加载已写章节内容
  useEffect(() => {
    const chapter = chapters.find((c) => c.chapterNum === selectedChapter);
    setContent(chapter?.polishedContent || chapter?.content || "");
    setChecks(chapter?.checks || []);
  }, [selectedChapter, chapters]);

  const wordCount = content.replace(/\s/g, "").length;
  const totalWords = chapters.reduce((sum, c) => sum + (c.polishedContent ? c.polishedContent.replace(/\s/g, "").length : 0), 0) + (selectedChapter > chapters.length ? wordCount : 0);
  const targetWords = 9000;

  const handleAIGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const { system, user } = buildWritingPrompt({
        chapterNum: selectedChapter,
        sectionTitle: `第${selectedChapter}章`,
        sectionContent: project.outline?.mainLine?.slice(0, 200) || "续写本章内容",
        previousContent: content,
        context: content.slice(-1000),
        wordTarget: 900,
        mood: selectedInspiration?.mood || "爽",
        characters: project.characters?.map((c) => ({
          name: c.name,
          keyTrait: c.keyTrait,
          coreDesire: c.coreDesire,
          coreFear: c.coreFear,
        })),
      });

      let full = "";
      for await (const chunk of (await import("../../lib/llm")).streamLLM(
        config.llm, system, user
      )) {
        full += chunk;
      }
      setContent((prev) => prev + "\n\n" + full);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  const handlePolish = async (intent: PolishIntent) => {
    if (!content.trim()) return;
    setPolishing(true);
    setError(null);

    try {
      const { system, user } = buildPolishPrompt({ originalText: content, intent });
      let full = "";
      for await (const chunk of (await import("../../lib/llm")).streamLLM(
        config.llm, system, user
      )) {
        full += chunk;
      }
      setContent(full);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setPolishing(false);
    }
  };

  const handleCheck = async () => {
    if (!content.trim()) return;
    setChecking(true);
    setChecks([]);

    try {
      const { system, user } = buildCheckPrompt({
        content,
        chapterNum: selectedChapter,
        characters: project.characters?.map((c) => ({
          name: c.name,
          coreDesire: c.coreDesire,
          coreFear: c.coreFear,
        })),
      });

      let full = "";
      for await (const chunk of (await import("../../lib/llm")).streamLLM(
        config.llm, system, user
      )) {
        full += chunk;
      }

      // Parse JSON
      const jsonMatch = full.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]) as { issues?: CheckResult[] };
          setChecks(parsed.issues || []);
        } catch {
          // Fallback: treat as text
          setChecks([{ type: "grammar", severity: "warn", location: "全文", message: full.slice(0, 200) }]);
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setChecking(false);
    }
  };

  const handleSave = () => {
    const newChapter: WrittenChapter = {
      chapterNum: selectedChapter,
      content,
      wordCount: content.replace(/\s/g, "").length,
      checks,
    };

    const existing = chapters.find((c) => c.chapterNum === selectedChapter);
    const updated = existing
      ? chapters.map((c) => c.chapterNum === selectedChapter ? newChapter : c)
      : [...chapters, newChapter];

    setWritingProgress({
      chapters: updated,
      totalWordCount: updated.reduce((sum, c) => sum + c.wordCount, 0),
      polishCount: (project.writingProgress?.polishCount || 0) + 1,
    });
  };

  const checkTypeColors: Record<string, string> = {
    logic: "text-blue-400",
    pace: "text-yellow-400",
    dialogue: "text-purple-400",
    grammar: "text-red-400",
    consistency: "text-orange-400",
  };

  if (!project.outline) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">✍️ 正文创作</h2>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-center">
            请先完成「故事大纲」和「章节细纲」，再进入正文创作
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">✍️ 正文创作</h2>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-400">总进度：<span className="text-white font-medium">{totalWords} / {targetWords}</span> 字</span>
          <span className={`font-medium ${totalWords >= 8500 ? "text-green-400" : "text-gray-400"}`}>
            {totalWords < 8500 ? "字数不足" : "字数达标"}
          </span>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* 章节列表 */}
        <div className="w-32 flex-shrink-0">
          <div className="card h-full overflow-y-auto">
            <p className="section-title mb-3">章节</p>
            <div className="space-y-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const ch = chapters.find((c) => c.chapterNum === n);
                const done = !!ch && ch.wordCount > 500;
                return (
                  <button
                    key={n}
                    onClick={() => setSelectedChapter(n)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                      selectedChapter === n
                        ? "bg-primary-600 text-white"
                        : done
                        ? "text-green-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {n}章 {done ? "✓" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 编辑区 */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="card flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="section-title mb-0">第{selectedChapter}章正文</p>
              <span className="text-xs text-gray-500">{wordCount} 字</span>
            </div>
            <textarea
              className="textarea-field flex-1 resize-none"
              placeholder="在此输入正文，或点击「AI 续写」让 AI 帮你续写..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 flex-wrap">
            <button
              className="btn-primary"
              onClick={handleAIGenerate}
              disabled={loading}
            >
              {loading ? "生成中..." : "✨ AI 续写"}
            </button>
            <button
              className="btn-secondary"
              onClick={handleSave}
              disabled={!content.trim()}
            >
              保存
            </button>
            <div className="relative group">
              <button
                className="btn-secondary"
                disabled={polishing || !content.trim()}
              >
                {polishing ? "润色中..." : "🛠 润色"}
              </button>
              <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col bg-dark-surface border border-dark-border rounded-lg shadow-xl z-10 min-w-32">
                {POLISH_INTENTS.map((opt) => (
                  <button
                    key={opt.value}
                    className="px-3 py-2 text-left text-sm text-gray-300 hover:bg-dark-card hover:text-white"
                    onClick={() => handlePolish(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="btn-secondary"
              onClick={handleCheck}
              disabled={checking || !content.trim()}
            >
              {checking ? "检查中..." : "🔍 实时检查"}
            </button>
          </div>

          {/* 检查结果 */}
          {checks.length > 0 && (
            <div className="card">
              <p className="section-title">检查反馈（{checks.length} 个问题）</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {checks.map((check, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-sm">
                    <span className={`font-medium ${checkTypeColors[check.type] || "text-gray-400"}`}>
                      [{check.type}]
                    </span>
                    <span className="text-gray-400 text-xs">{check.location}</span>
                    <span className={`${check.severity === "error" ? "text-red-400" : "text-gray-300"} flex-1`}>
                      {check.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
