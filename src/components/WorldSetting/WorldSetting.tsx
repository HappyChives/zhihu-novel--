import { useState, useEffect } from "react";
import { useApp } from "../../lib/context";
import { buildWorldSettingPrompt } from "../../prompts";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";

export function WorldSetting() {
  const { config, project, setWorldSetting } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayResult, setDisplayResult] = useState("");
  const [result, setResult] = useState("");
  const [saved, setSaved] = useState(false);

  // 三个层次的可编辑状态（必须在这里声明，useEffect 在下面引用）
  const [baseRule, setBaseRule] = useState("");
  const [socialStructure, setSocialStructure] = useState("");
  const [civilization, setCivilization] = useState("");
  const [keyConflict, setKeyConflict] = useState("");

  // 挂载时恢复已有数据
  useEffect(() => {
    if (project?.worldSetting) {
      setBaseRule(project.worldSetting.baseRule);
      setSocialStructure(project.worldSetting.socialStructure);
      setCivilization(project.worldSetting.civilization);
      setKeyConflict(project.worldSetting.keyConflict);
      setSaved(true);
    }
  }, [project?.id]);

  const selectedInspiration = project?.inspirations?.find(
    (i) => i.id === project?.selectedInspirationId
  );

  const canGenerate = !!selectedInspiration;

  const handleGenerate = async () => {
    if (!canGenerate || !selectedInspiration) return;

    const { system, user } = buildWorldSettingPrompt({
      inspiration: {
        title: selectedInspiration.title,
        conflict: selectedInspiration.conflict,
        characters: selectedInspiration.characters,
        mood: selectedInspiration.mood,
      },
      hotspotData: project?.hotspotData,
    });

    setResult("");
    setDisplayResult("");
    setLoading(true);
    setError(null);

    try {
      let full = "";
      for await (const chunk of (await import("../../lib/llm")).streamLLM(
        config.llm, system, user
      )) {
        full += chunk;
        setDisplayResult(full);
      }
      setResult(full);
      parseAndFill(full);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  function parseAndFill(text: string) {
    const baseMatch = text.match(/底座[^【\n]*【?[^#\n]*/i);
    const socialMatch = text.match(/社会结构[^【\n]*/i);
    const civMatch = text.match(/文明[^【\n]*/i);
    if (baseMatch?.[0]) setBaseRule(baseMatch[0].slice(0, 200));
    if (socialMatch?.[0]) setSocialStructure(socialMatch[0].slice(0, 200));
    if (civMatch?.[0]) setCivilization(civMatch[0].slice(0, 200));
  }

  const handleConfirm = () => {
    if (!baseRule.trim() && !socialStructure.trim() && !civilization.trim()) return;
    setWorldSetting({
      baseRule: baseRule.trim() || "（未设定）",
      socialStructure: socialStructure.trim() || "（未设定）",
      civilization: civilization.trim() || "（未设定）",
      keyConflict: keyConflict.trim() || selectedInspiration?.conflict || "",
      rulesToShow: [],
    });
    setSaved(true);
  };

  if (!selectedInspiration && !project?.worldSetting) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">🌍 世界观设定</h2>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-center">
            请先在「灵感生成」页面选定一个灵感，再进入世界观设定
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">🌍 世界观设定</h2>
        <p className="text-gray-400 text-sm">
          基于选定灵感，设计故事的「底座-社会结构-文明」三层世界观
        </p>
      </div>

      {selectedInspiration && (
        <div className="card mb-4 border-primary-500/20">
          <p className="text-xs text-gray-500 mb-1">选定灵感</p>
          <p className="text-white font-medium">{selectedInspiration.title}</p>
          <p className="text-gray-400 text-sm mt-1">{selectedInspiration.conflict}</p>
        </div>
      )}

      <div className="space-y-4 mb-4">
        <div className="card">
          <p className="section-title">底座（底层规则）</p>
          <p className="text-xs text-gray-500 mb-2">这个世界的核心规则是什么？决定了什么冲突不可避免</p>
          <textarea
            className="textarea-field"
            rows={3}
            placeholder="AI 自动生成，或手动输入..."
            value={baseRule}
            onChange={(e) => { setBaseRule(e.target.value); setSaved(false); }}
          />
        </div>

        <div className="card">
          <p className="section-title">社会结构（中层）</p>
          <p className="text-xs text-gray-500 mb-2">阶层、制度、势力...冲突如何展开</p>
          <textarea
            className="textarea-field"
            rows={3}
            placeholder="AI 自动生成，或手动输入..."
            value={socialStructure}
            onChange={(e) => { setSocialStructure(e.target.value); setSaved(false); }}
          />
        </div>

        <div className="card">
          <p className="section-title">文明（表层）</p>
          <p className="text-xs text-gray-500 mb-2">生活、文化、可见的日常细节...让读者沉浸</p>
          <textarea
            className="textarea-field"
            rows={3}
            placeholder="AI 自动生成，或手动输入..."
            value={civilization}
            onChange={(e) => { setCivilization(e.target.value); setSaved(false); }}
          />
        </div>
      </div>

      {canGenerate && !saved && (
        <button
          className="btn-primary w-full mb-4"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "生成中..." : "✨ AI 生成世界观"}
        </button>
      )}

      {displayResult && !saved && (
        <div className="card mb-4">
          <p className="section-title">AI 生成预览</p>
          <MarkdownRenderer content={displayResult} />
        </div>
      )}

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        className="btn-primary w-full"
        onClick={handleConfirm}
        disabled={!baseRule.trim() && !socialStructure.trim()}
      >
        {saved ? "✓ 世界观已确认 ✓" : "确认世界观，进入故事大纲 →"}
      </button>
    </div>
  );
}
