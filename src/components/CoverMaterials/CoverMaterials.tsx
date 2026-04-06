import { useState } from "react";
import { useLLM } from "../../hooks/useLLM";
import { useApp } from "../../lib/context";
import { buildCoverPrompt } from "../../prompts";

export function CoverMaterials() {
  const { config, isApiConfigured } = useApp();
  const { call } = useLLM();

  const [topic, setTopic] = useState("");
  const [coreConflict, setCoreConflict] = useState("");
  const [mood, setMood] = useState("爽");
  const [genre, setGenre] = useState("");
  const [outline, setOutline] = useState("");
  const [result, setResult] = useState("");
  const [displayResult, setDisplayResult] = useState("");

  if (!isApiConfigured) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">🎨 封面物料全套</h2>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <div className="text-center py-8">
            <p className="text-3xl mb-4">🔒</p>
            <h3 className="text-xl font-bold text-white mb-2">API 未配置</h3>
            <p className="text-gray-400 mb-6">请先在设置页面配置 API，配置完成后即可使用封面物料功能</p>
            <a href="/settings" className="btn-primary">去设置页面配置 API</a>
          </div>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!topic.trim() && !coreConflict.trim() && !outline.trim()) return;
    const { system, user } = buildCoverPrompt({ topic, coreConflict, mood, genre, outline });
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

  // 解析结果中的各个部分
  const parseSections = (text: string) => {
    const sections: Record<string, string> = {};
    const parts = text.split(/(?=##\s)/);
    parts.forEach((p) => {
      const match = p.match(/##\s+(.+?)\n([\s\S]*)/);
      if (match) sections[match[1].trim()] = match[2].trim();
    });
    return sections;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">🎨 封面物料全套</h2>
        <p className="text-gray-400 text-sm">
          一次性生成封面提示词、简介、金句、人物冲突设定、标签
        </p>
      </div>

      <div className="card mb-4 space-y-4">
        <div>
          <p className="section-title">选题/标题方向</p>
          <input className="input-field" placeholder="小说标题或方向..." value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div>
          <p className="section-title">核心冲突</p>
          <input className="input-field" placeholder="一句话核心冲突..." value={coreConflict} onChange={(e) => setCoreConflict(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="section-title">情绪风格</p>
            <select className="input-field" value={mood} onChange={(e) => setMood(e.target.value)}>
              {["虐", "甜", "爽", "悬疑", "搞笑"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="section-title">题材类型</p>
            <input className="input-field" placeholder="如：现代言情/悬疑..." value={genre} onChange={(e) => setGenre(e.target.value)} />
          </div>
        </div>
        <div>
          <p className="section-title">故事大纲（可选）</p>
          <textarea className="textarea-field h-24" placeholder="粘贴故事大纲，信息越全物料越精准..." value={outline} onChange={(e) => setOutline(e.target.value)} />
        </div>
        <button className="btn-primary w-full" onClick={handleGenerate} disabled={!topic.trim() && !coreConflict.trim() && !outline.trim()}>
          生成全套物料
        </button>
      </div>

      {displayResult && (
        <div className="space-y-4">
          {(() => {
            const sections = parseSections(result);
            return (
              <>
                {/* 封面提示词 */}
                {sections["一、封面图生成提示词（英文）"] && (
                  <div className="card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="section-title mb-0">🎨 封面提示词</p>
                      <button className="btn-secondary text-xs" onClick={() => copyToClipboard(sections["一、封面图生成提示词（英文）"])}>
                        复制
                      </button>
                    </div>
                    <div className="bg-dark-card rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Midjourney / Stable Diffusion 咒语</p>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap">{sections["一、封面图生成提示词（英文）"]}</p>
                    </div>
                  </div>
                )}

                {/* 简介 */}
                {sections["二、小说简介（100字以内，适合盐选投稿）"] && (
                  <div className="card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="section-title mb-0">📝 小说简介</p>
                      <button className="btn-secondary text-xs" onClick={() => copyToClipboard(sections["二、小说简介（100字以内，适合盐选投稿）"])}>
                        复制
                      </button>
                    </div>
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">{sections["二、小说简介（100字以内，适合盐选投稿）"]}</p>
                  </div>
                )}

                {/* 金句 */}
                {sections["三、金句摘录（3-5句）"] && (
                  <div className="card">
                    <p className="section-title">✨ 金句摘录</p>
                    <div className="space-y-2">
                      {sections["三、金句摘录（3-5句）"].split(/\n/).filter((l) => l.trim()).map((line, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-primary-400 font-bold">{i + 1}.</span>
                          <p className="text-gray-200 text-sm flex-1">{line.replace(/^\d+\.\s*/, "")}</p>
                          <button className="text-xs text-gray-500 hover:text-gray-300" onClick={() => copyToClipboard(line)}>
                            📋
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 人物冲突 */}
                {sections["四、人物冲突设定"] && (
                  <div className="card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="section-title mb-0">⚔️ 人物冲突设定</p>
                      <button className="btn-secondary text-xs" onClick={() => copyToClipboard(sections["四、人物冲突设定"])}>
                        复制
                      </button>
                    </div>
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{sections["四、人物冲突设定"]}</pre>
                  </div>
                )}

                {/* 标签 */}
                {sections["五、题材标签（3-5个）"] && (
                  <div className="card">
                    <p className="section-title">🏷️ 题材标签</p>
                    <div className="flex flex-wrap gap-2">
                      {sections["五、题材标签（3-5个）"].split(/[\s,\[\]]+/).filter((t) => t.trim()).map((tag) => (
                        <span key={tag} className="tag">{tag.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
