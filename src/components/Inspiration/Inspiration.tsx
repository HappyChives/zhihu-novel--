import { useState } from "react";
import { useLLM } from "../../hooks/useLLM";
import { useApp } from "../../lib/context";
import { buildInspirationPrompt } from "../../prompts";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";

const MOOD_OPTIONS = ["虐", "甜", "爽", "悬疑", "搞笑", "治愈"];
const GENRE_OPTIONS = ["现代言情", "古代言情", "悬疑推理", "玄幻奇幻", "都市职场", "校园", "不限"];

export function Inspiration() {
  const [genre, setGenre] = useState("不限");
  const [mood, setMood] = useState("爽");
  const [protagonistPrefs, setProtagonistPrefs] = useState("");
  const [result, setResult] = useState("");
  const [displayResult, setDisplayResult] = useState("");
  const { config } = useApp();
  const { call } = useLLM();

  const handleGenerate = async () => {
    const { system, user } = buildInspirationPrompt({
      genre: genre === "不限" ? undefined : genre,
      mood,
      protagonistPrefs: protagonistPrefs || undefined,
    });
    setResult("");
    setDisplayResult("");
    try {
      const full = await call(system, user);
      setResult(full);
      setDisplayResult(full);
    } catch (e) {
      setDisplayResult("生成失败：" + (e as Error).message);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">💡 灵感生成</h2>
        <p className="text-gray-400 text-sm">
          基于题材和情绪偏好，生成 5-10 个有爆款潜力的故事灵感
        </p>
      </div>

      <div className="card mb-4 space-y-4">
        {/* 题材 */}
        <div>
          <p className="section-title">题材类型</p>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((g) => (
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
        </div>

        {/* 情绪 */}
        <div>
          <p className="section-title">期望情绪</p>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  mood === m
                    ? "bg-primary-600 text-white"
                    : "bg-dark-card text-gray-400 hover:text-gray-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* 主角偏好 */}
        <div>
          <p className="section-title">主角设定偏好（可选）</p>
          <input
            className="input-field"
            placeholder="例如：女主是医生，男主是消防员，两人曾有过节..."
            value={protagonistPrefs}
            onChange={(e) => setProtagonistPrefs(e.target.value)}
          />
        </div>

        <button className="btn-primary w-full" onClick={handleGenerate}>
          生成灵感
        </button>
      </div>

      {displayResult && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">灵感列表</p>
            <button
              className="btn-secondary text-xs"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              复制全部
            </button>
          </div>
          <MarkdownRenderer content={displayResult} />
        </div>
      )}
    </div>
  );
}
