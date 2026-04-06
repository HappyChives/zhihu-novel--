import { useState } from "react";
import { useLLM } from "../../hooks/useLLM";
import { buildTopicPrompt } from "../../prompts";

export function TopicSelect() {
  const [inspirationText, setInspirationText] = useState("");
  const [result, setResult] = useState("");
  const [displayResult, setDisplayResult] = useState("");
  const { call } = useLLM();

  const handleGenerate = async () => {
    if (!inspirationText.trim()) return;
    const { system, user } = buildTopicPrompt(inspirationText);
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
        <h2 className="text-2xl font-bold text-white mb-1">✍️ 选题确定</h2>
        <p className="text-gray-400 text-sm">
          将灵感碎片转化为适合知乎盐选的 3-5 个选题方向
        </p>
      </div>

      <div className="card mb-4">
        <p className="section-title">输入灵感内容</p>
        <p className="text-xs text-gray-500 mb-3">
          将灵感生成模块的结果粘贴到下方
        </p>
        <textarea
          className="textarea-field h-60"
          placeholder="粘贴灵感生成的结果..."
          value={inspirationText}
          onChange={(e) => setInspirationText(e.target.value)}
        />
        <div className="mt-3">
          <button
            className="btn-primary w-full"
            onClick={handleGenerate}
            disabled={!inspirationText.trim()}
          >
            生成选题
          </button>
        </div>
      </div>

      {displayResult && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">选题列表</p>
            <button
              className="btn-secondary text-xs"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              复制全部
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">
              {displayResult}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
