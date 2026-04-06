import { useState } from "react";
import { useLLM } from "../../hooks/useLLM";
import { buildOutlinePrompt } from "../../prompts";

export function OutlineGen() {
  const [topicText, setTopicText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [result, setResult] = useState("");
  const [displayResult, setDisplayResult] = useState("");
  const { call } = useLLM();

  const handleGenerate = async () => {
    const text = selectedTopic || topicText;
    if (!text.trim()) return;
    const { system, user } = buildOutlinePrompt(topicText, selectedTopic);
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
        <h2 className="text-2xl font-bold text-white mb-1">🗺️ 大纲生成</h2>
        <p className="text-gray-400 text-sm">
          基于选题，生成完整的起承转合四幕结构大纲
        </p>
      </div>

      <div className="card mb-4 space-y-4">
        <div>
          <p className="section-title">选题/冲突句</p>
          <textarea
            className="textarea-field h-20"
            placeholder="输入选题内容，或从选题确定模块复制..."
            value={topicText}
            onChange={(e) => setTopicText(e.target.value)}
          />
        </div>
        <div>
          <p className="section-title">聚焦选题（可选，选填后优先使用）</p>
          <input
            className="input-field"
            placeholder="如果上方有多个选题，可以指定使用哪一个..."
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          />
        </div>
        <button
          className="btn-primary w-full"
          onClick={handleGenerate}
          disabled={!topicText.trim()}
        >
          生成大纲
        </button>
      </div>

      {displayResult && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">四幕大纲</p>
            <button
              className="btn-secondary text-xs"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              复制全部
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">
            {displayResult}
          </pre>
        </div>
      )}
    </div>
  );
}
