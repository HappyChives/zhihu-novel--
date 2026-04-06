import { useState, useEffect } from "react";
import { useApp } from "../../lib/context";
import { testLLMConnection, PROVIDER_META } from "../../lib/llm";
import type { Provider } from "../../lib/types";

const PROVIDER_LIST: Provider[] = [
  "openai", "anthropic", "google",
  "zhipu", "deepseek", "moonshot", "minimax", "baidu", "alibaba", "siliconflow", "custom",
];

const PROVIDER_SECTIONS = [
  { title: "国际 API", items: ["openai", "anthropic", "google"] },
  { title: "国内 API", items: ["zhipu", "deepseek", "moonshot", "minimax", "baidu", "alibaba", "siliconflow"] },
  { title: "自定义", items: ["custom"] },
];

const API_KEY_HINTS: Partial<Record<Provider, string>> = {
  openai: "sk-...",
  anthropic: "sk-ant-...",
  google: "AIza...",
  zhipu: "智谱 API Key",
  deepseek: "DeepSeek API Key",
  moonshot: "Moonshot API Key",
  minimax: "MiniMax API Key",
  baidu: "百度 Access Token（IAM 方式）或 API Key",
  alibaba: "DashScope API Key",
  siliconflow: "SiliconFlow API Key",
};

export function Settings() {
  const { config, updateLLMConfig } = useApp();
  const [provider, setProvider] = useState<Provider>(config.llm.provider);
  const [baseUrl, setBaseUrl] = useState(
    config.llm.baseUrl || PROVIDER_META[config.llm.provider]?.defaultBaseUrl || ""
  );
  const [model, setModel] = useState(
    config.llm.model || PROVIDER_META[config.llm.provider]?.defaultModel || ""
  );
  const [apiKey, setApiKey] = useState(config.llm.apiKey || "");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [testMsg, setTestMsg] = useState("");

  // 当 localStorage 中的配置更新时，同步表单状态（如页面刷新后恢复配置）
  useEffect(() => {
    setProvider(config.llm.provider);
    setBaseUrl(config.llm.baseUrl || PROVIDER_META[config.llm.provider]?.defaultBaseUrl || "");
    setModel(config.llm.model || PROVIDER_META[config.llm.provider]?.defaultModel || "");
    setApiKey(config.llm.apiKey || "");
  }, [config.llm]);

  const handleProviderChange = (p: Provider) => {
    setProvider(p);
    const meta = PROVIDER_META[p];
    setBaseUrl(meta.defaultBaseUrl);
    setModel(meta.defaultModel);
    setApiKey("");
  };

  const handleSaveLLM = () => {
    updateLLMConfig({ provider, baseUrl, model, apiKey });
  };

  const handleTest = async () => {
    setTestStatus("testing");
    setTestMsg("");
    try {
      const msg = await testLLMConnection({ provider, baseUrl, model, apiKey });
      setTestStatus("ok");
      setTestMsg(msg);
    } catch (e) {
      setTestStatus("fail");
      setTestMsg(e instanceof Error ? e.message : "未知错误");
    }
  };

  const meta = PROVIDER_META[provider];
  const needsApiKey = meta?.authIn !== "none";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">⚙️ 设置</h2>
        <p className="text-gray-400 text-sm">配置 LLM 模型连接</p>
      </div>

      {/* LLM 配置 */}
      <div className="card mb-4">
        <h3 className="font-semibold text-white mb-4">🤖 LLM 模型配置</h3>

        {/* Provider 选择 */}
        <div className="space-y-3 mb-4">
          {PROVIDER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-xs text-gray-500 mb-1.5">{section.title}</p>
              <div className="flex flex-wrap gap-2">
                {section.items.map((p) => {
                  const pm = PROVIDER_META[p as Provider];
                  return (
                    <button
                      key={p}
                      onClick={() => handleProviderChange(p as Provider)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        provider === p
                          ? "bg-primary-600 text-white"
                          : "bg-dark-card text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      {pm.labelZh}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* API 地址 */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">API 地址</p>
          <input
            className="input-field"
            placeholder={meta?.defaultBaseUrl || "https://api.example.com/v1"}
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>

        {/* 模型名 */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">模型名称</p>
          <input
            className="input-field"
            placeholder={meta?.defaultModel || "model-name"}
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <p className="text-xs text-gray-600 mt-1">
            推荐模型：{meta?.label === "Ollama" ? "qwen2.5, yi-chat" : ""}
            {meta?.label === "OpenAI" ? "gpt-4o-mini, gpt-4o" : ""}
            {meta?.label === "Anthropic" ? "claude-3-5-haiku-latest, claude-3-5-sonnet-latest" : ""}
            {meta?.label === "Google" ? "gemini-2.0-flash, gemini-1.5-pro" : ""}
            {meta?.label === "Zhipu" ? "glm-4-flash, glm-4-plus" : ""}
            {meta?.label === "DeepSeek" ? "deepseek-chat, deepseek-coder" : ""}
            {meta?.label === "Moonshot" ? "moonshot-v1-8k, moonshot-v1-32k" : ""}
            {meta?.label === "MiniMax" ? "m2.7" : ""}
            {meta?.label === "Baidu" ? "ernie-4.0-8k-latest, ernie-3.5-8k" : ""}
            {meta?.label === "Alibaba" ? "qwen-plus, qwen-turbo" : ""}
            {meta?.label === "SiliconFlow" ? "Qwen/Qwen2.5-7B-Instruct" : ""}
          </p>
        </div>

        {/* API Key */}
        {needsApiKey && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">
              API Key（必填）
            </p>
            <input
              type="password"
              className="input-field"
              placeholder={API_KEY_HINTS[provider] || "API Key"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {provider === "baidu" && (
              <p className="text-xs text-gray-600 mt-1">
                百度建议使用 IAM 认证方式，获取 Access Token
              </p>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            className="btn-secondary flex-1"
            onClick={handleTest}
            disabled={testStatus === "testing" || (!apiKey && needsApiKey)}
          >
            {testStatus === "testing" ? "测试中..." : "测试连接"}
          </button>
          <button className="btn-primary flex-1" onClick={handleSaveLLM}>
            保存配置
          </button>
        </div>

        {testMsg && (
          <p
            className={`text-sm mt-2 px-3 py-2 rounded-lg ${
              testStatus === "ok"
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {testMsg}
          </p>
        )}
      </div>

      {/* API Key 获取指引 */}
      {needsApiKey && (
        <div className="card">
          <h3 className="font-semibold text-white mb-3">📦 API Key 获取指引</h3>
          <div className="space-y-2 text-sm">
            {[
              {
                name: "OpenAI",
                url: "https://platform.openai.com/api-keys",
                note: "需要境外支付方式",
              },
              {
                name: "Anthropic (Claude)",
                url: "https://console.anthropic.com/settings/keys",
                note: "需要境外支付方式",
              },
              {
                name: "Google Gemini",
                url: "https://aistudio.google.com/app/apikey",
                note: "有免费额度",
              },
              {
                name: "智谱 GLM",
                url: "https://open.bigmodel.cn/usercenter/apikeys",
                note: "国内可用，有免费额度",
              },
              {
                name: "DeepSeek",
                url: "https://platform.deepseek.com/api_keys",
                note: "国内可用，价格低",
              },
              {
                name: "月之暗面 Kimi",
                url: "https://platform.moonshot.cn/console/api-keys",
                note: "国内可用",
              },
              {
                name: "百度文心",
                url: "https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application",
                note: "使用 IAM 认证",
              },
              {
                name: "阿里通义",
                url: "https://dashscope.console.aliyun.com/apiKey",
                note: "国内可用，有免费额度",
              },
              {
                name: "MiniMax 海螺",
                url: "https://platform.minimax.chat/user-center/basic-information/interface-key",
                note: "国内可用，价格低",
              },
              {
                name: "SiliconFlow",
                url: "https://www.siliconflow.cn/",
                note: "国内聚合 API，支持多种模型",
              },
            ].map((item) => (
              <div key={item.name} className="flex items-start gap-2 text-gray-400">
                <span className="text-primary-400 mt-0.5">•</span>
                <div>
                  <span className="text-gray-200">{item.name}</span>
                  {"："}
                  <span className="text-xs">{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
