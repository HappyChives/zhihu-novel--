import { useState, useEffect } from "react";
import { useApp } from "../../lib/context";
import { buildHotspotAnalysisPrompt } from "../../prompts";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { useNavigate } from "react-router-dom";

export function HotspotAnalysis() {
  const { config, project, setHotspotData } = useApp();
  const navigate = useNavigate();

  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayResult, setDisplayResult] = useState("");
  const [result, setResult] = useState("");

  const genres = ["不限", "现代言情", "古代言情", "悬疑推理", "都市职场", "校园", "玄幻奇幻"];

  // 挂载时恢复已有数据
  useEffect(() => {
    if (project?.hotspotData) {
      setResult(project.hotspotData);
      setDisplayResult(project.hotspotData);
    }
  }, [project?.id]);

  const handleAnalyze = async () => {
    const { system, user } = buildHotspotAnalysisPrompt({
      genre: genre && genre !== "不限" ? genre : undefined,
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
        // 实时保存中间结果，切换页面也不会丢
        setHotspotData(full);
      }
      setResult(full);
      setHotspotData(full);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "未知错误";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInspiration = () => {
    navigate("/inspiration");
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">📊 市场热点分析</h2>
        <p className="text-gray-400 text-sm">
          AI 自动分析知乎盐选创作热点，涵盖题材、情绪、冲突，人设等多维度
        </p>
      </div>

      <div className="card mb-4">
        <p className="section-title">题材方向（可选）</p>
        <p className="text-xs text-gray-500 mb-3">指定题材方向，分析结果将更加针对性</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                genre === g
                  ? "bg-primary-600 text-white"
                  : "bg-dark-card text-gray-400 hover:text-gray-200"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <button
          className="btn-primary w-full"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "分析中..." : "开始热点分析"}
        </button>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {displayResult && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">分析结果</p>
            <button
              className="btn-secondary text-xs"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              复制
            </button>
          </div>
          <MarkdownRenderer content={displayResult} />
        </div>
      )}

      {result && (
        <div className="card">
          <button className="btn-primary w-full" onClick={handleGenerateInspiration}>
            基于分析生成灵感 →
          </button>
        </div>
      )}
    </div>
  );
}
