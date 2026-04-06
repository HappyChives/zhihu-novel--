import { useState } from "react";
import { useApp } from "../../lib/context";
import { buildHotspotPrompt } from "../../prompts";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { streamLLM } from "../../lib/llm";

export function HotspotSurvey() {
  const [rawData, setRawData] = useState("");
  const [result, setResult] = useState("");
  const [displayResult, setDisplayResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config } = useApp();

  const handleAnalyze = async () => {
    if (!rawData.trim()) return;
    const { system, user } = buildHotspotPrompt(rawData);
    setResult("");
    setDisplayResult("");
    setLoading(true);
    setError(null);

    try {
      let full = "";
      for await (const chunk of streamLLM(
        config.llm,
        system,
        user
      )) {
        full += chunk;
        setDisplayResult(full);
      }
      setResult(full);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "未知错误");
      setDisplayResult("分析失败：" + (e instanceof Error ? e.message : "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">📊 市场热点调查</h2>
        <p className="text-gray-400 text-sm">
          分析知乎盐选热榜数据，找出当前最受欢迎的题材和写作趋势
        </p>
      </div>

      <div className="card mb-4">
        <p className="section-title">粘贴榜单数据</p>
        <p className="text-xs text-gray-500 mb-3">
          打开知乎盐选/晋江等平台榜单页面，复制热榜标题和标签粘贴到下方
        </p>
        <textarea
          className="textarea-field h-40"
          placeholder={"例如：\n【知乎盐选热榜】\n1. 《重生后我嫁了前男友的小叔》#现代言情 #豪门 #重生\n2. 《穿书女配要逆袭》#穿书 #逆袭 #甜宠\n3. 《妻子死在婚礼那天》#虐文 #复仇 #现代"}
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
        />
        <div className="mt-3 flex gap-3">
          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={loading || !rawData.trim()}
          >
            {loading ? "分析中..." : "开始分析"}
          </button>
          <button className="btn-secondary" onClick={() => { setRawData(""); setResult(""); setDisplayResult(""); }}>
            清空
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {displayResult && (
        <div className="card">
          <p className="section-title">分析结果</p>
          <MarkdownRenderer content={displayResult} />
        </div>
      )}
    </div>
  );
}
