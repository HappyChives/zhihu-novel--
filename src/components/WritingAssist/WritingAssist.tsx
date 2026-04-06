import { useState, useRef, useEffect } from "react";
import { useLLM } from "../../hooks/useLLM";
import { useApp } from "../../lib/context";
import { buildWritingPrompt, buildPolishPrompt, type PolishIntent } from "../../prompts";

const POLISH_INTENTS: { value: PolishIntent; label: string }[] = [
  { value: "更虐", label: "更虐" },
  { value: "更甜", label: "更甜" },
  { value: "更悬疑", label: "更悬疑" },
  { value: "更爽", label: "更爽" },
  { value: "精简", label: "精简" },
  { value: "增细节", label: "增细节" },
  { value: "调节奏", label: "调节奏" },
  { value: "强冲突", label: "强冲突" },
];

export function WritingAssist() {
  const { config } = useApp();
  const { call } = useLLM();

  // 续写模式
  const [outline, setOutline] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const [wordCount, setWordCount] = useState(5000);
  const [style, setStyle] = useState<"虐" | "甜" | "爽" | "悬疑" | "搞笑">("爽");
  const [writingResult, setWritingResult] = useState("");
  const [writingDisplay, setWritingDisplay] = useState("");

  // 润色模式
  const [polishText, setPolishText] = useState("");
  const [polishIntent, setPolishIntent] = useState<PolishIntent>("更爽");
  const [polishResult, setPolishResult] = useState("");
  const [polishDisplay, setPolishDisplay] = useState("");

  const [mode, setMode] = useState<"writing" | "polish">("writing");

  const handleWriting = async () => {
    if (!outline.trim()) return;
    const { system, user } = buildWritingPrompt({
      chapterNum: 1,
      sectionTitle: "自由创作",
      sectionContent: outline,
      previousContent: currentContent || undefined,
      wordTarget: wordCount,
      mood: style,
    });
    setWritingResult("");
    setWritingDisplay("");
    try {
      const full = await call(system, user);
      setWritingResult(full);
      setWritingDisplay(full);
    } catch (e) {
      setWritingDisplay("生成失败：" + (e as Error).message);
    }
  };

  const handlePolish = async () => {
    if (!polishText.trim()) return;
    const { system, user } = buildPolishPrompt({ originalText: polishText, intent: polishIntent });
    setPolishResult("");
    setPolishDisplay("");
    try {
      const full = await call(system, user);
      setPolishResult(full);
      setPolishDisplay(full);
    } catch (e) {
      setPolishDisplay("生成失败：" + (e as Error).message);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">⚡ AI 写作助手</h2>
        <p className="text-gray-400 text-sm">
          基于大纲生成盐选风格初稿，或对已有内容进行润色修改
        </p>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("writing")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "writing" ? "bg-primary-600 text-white" : "bg-dark-card text-gray-400"
          }`}
        >
          ✍️ AI 续写初稿
        </button>
        <button
          onClick={() => setMode("polish")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "polish" ? "bg-primary-600 text-white" : "bg-dark-card text-gray-400"
          }`}
        >
          🛠️ 润色修改
        </button>
      </div>

      {mode === "writing" ? (
        <div className="space-y-4">
          <div className="card">
            <p className="section-title">小说大纲</p>
            <textarea
              className="textarea-field h-40"
              placeholder="输入小说大纲..."
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
            />
          </div>

          <div className="card">
            <p className="section-title">已有内容（可选，用于续写）</p>
            <textarea
              className="textarea-field h-32"
              placeholder="如果已有部分内容，粘贴在此，AI 将续写..."
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
            />
          </div>

          <div className="card">
            <p className="section-title">写作设置</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">目标字数</label>
                <select
                  className="input-field"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                >
                  <option value={3000}>3000 字</option>
                  <option value={5000}>5000 字</option>
                  <option value={8000}>8000 字</option>
                  <option value={10000}>10000 字</option>
                  <option value={15000}>15000 字</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">情绪风格</label>
                <select
                  className="input-field"
                  value={style}
                  onChange={(e) => setStyle(e.target.value as typeof style)}
                >
                  <option value="虐">虐</option>
                  <option value="甜">甜</option>
                  <option value="爽">爽</option>
                  <option value="悬疑">悬疑</option>
                  <option value="搞笑">搞笑</option>
                </select>
              </div>
            </div>
            <button
              className="btn-primary w-full mt-4"
              onClick={handleWriting}
              disabled={!outline.trim()}
            >
              开始生成
            </button>
          </div>

          {writingDisplay && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="section-title mb-0">生成结果</p>
                <button className="btn-secondary text-xs" onClick={() => navigator.clipboard.writeText(writingResult)}>
                  复制
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed">
                {writingDisplay}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card">
            <p className="section-title">待修改内容</p>
            <textarea
              className="textarea-field h-48"
              placeholder="粘贴待修改的段落..."
              value={polishText}
              onChange={(e) => setPolishText(e.target.value)}
            />
          </div>

          <div className="card">
            <p className="section-title">修改意图</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {POLISH_INTENTS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPolishIntent(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    polishIntent === opt.value
                      ? "bg-primary-600 text-white"
                      : "bg-dark-card text-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="btn-primary w-full" onClick={handlePolish} disabled={!polishText.trim()}>
              开始润色
            </button>
          </div>

          {polishDisplay && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="section-title mb-0">润色结果</p>
                <button className="btn-secondary text-xs" onClick={() => navigator.clipboard.writeText(polishResult)}>
                  复制
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed">
                {polishDisplay}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
