/**
 * 统一 LLM 连接器
 * 支持：OpenAI / Anthropic / Google Gemini / 智谱GLM / DeepSeek /
 *       Moonshot(Kimi) / MiniMax / 百度文心 / 阿里通义 / SiliconFlow / 自定义
 */

import type { LLMConfig, Provider } from "./types";

// ─────────────────────────────────────────
// Provider 元数据：默认地址、默认模型、认证方式
// ─────────────────────────────────────────
export interface ProviderMeta {
  label: string;           // UI 显示名
  labelZh: string;         // 中文名
  defaultBaseUrl: string;
  defaultModel: string;
  authIn: "bearer" | "x-api-key" | "query" | "none";
  streamFormat: "sse" | "ollama" | "anthropic" | "text";
}

export const PROVIDER_META: Record<Provider, ProviderMeta> = {
  openai: {
    label: "OpenAI",
    labelZh: "OpenAI",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    authIn: "bearer",
    streamFormat: "sse",
  },
  anthropic: {
    label: "Anthropic",
    labelZh: "Anthropic (Claude)",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-haiku-latest",
    authIn: "x-api-key",
    streamFormat: "anthropic",
  },
  google: {
    label: "Google",
    labelZh: "Google Gemini",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-2.0-flash",
    authIn: "query",
    streamFormat: "text",
  },
  zhipu: {
    label: "Zhipu",
    labelZh: "智谱 GLM",
    defaultBaseUrl: "https://open.bigmodel.cn/api/paulin/v1",
    defaultModel: "glm-4-flash",
    authIn: "bearer",
    streamFormat: "sse",
  },
  deepseek: {
    label: "DeepSeek",
    labelZh: "DeepSeek",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    authIn: "bearer",
    streamFormat: "sse",
  },
  moonshot: {
    label: "Moonshot",
    labelZh: "月之暗面 Kimi",
    defaultBaseUrl: "https://api.moonshot.cn/v1",
    defaultModel: "moonshot-v1-8k",
    authIn: "bearer",
    streamFormat: "sse",
  },
  minimax: {
    label: "MiniMax",
    labelZh: "MiniMax 海螺",
    defaultBaseUrl: "https://api.minimax.chat/v1",
    defaultModel: "MiniMax-M2.7",
    authIn: "bearer",
    streamFormat: "sse",
  },
  baidu: {
    label: "Baidu",
    labelZh: "百度文心 ERNIE",
    defaultBaseUrl: "https://qianfan.baidubce.com/v2",
    defaultModel: "ernie-4.0-8k-latest",
    authIn: "bearer",
    streamFormat: "sse",
  },
  alibaba: {
    label: "Alibaba",
    labelZh: "阿里通义 Qwen",
    defaultBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-plus",
    authIn: "bearer",
    streamFormat: "sse",
  },
  siliconflow: {
    label: "SiliconFlow",
    labelZh: "SiliconFlow（聚合 API）",
    defaultBaseUrl: "https://api.siliconflow.cn/v1",
    defaultModel: "Qwen/Qwen2.5-7B-Instruct",
    authIn: "bearer",
    streamFormat: "sse",
  },
  custom: {
    label: "Custom",
    labelZh: "自定义 API",
    defaultBaseUrl: "",
    defaultModel: "",
    authIn: "bearer",
    streamFormat: "sse",
  },
};

// ─────────────────────────────────────────
// 请求构建
// ─────────────────────────────────────────
function buildHeaders(cfg: LLMConfig): Record<string, string> {
  const meta = PROVIDER_META[cfg.provider];
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (meta.authIn === "bearer") {
    headers["Authorization"] = `Bearer ${cfg.apiKey}`;
  } else if (meta.authIn === "x-api-key") {
    headers["x-api-key"] = cfg.apiKey;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }

  return headers;
}

function buildUrl(cfg: LLMConfig, path: string): string {
  const base = cfg.baseUrl.replace(/\/$/, "");
  const meta = PROVIDER_META[cfg.provider];

  let url = `${base}${path}`;

  if (meta.authIn === "query") {
    url += `${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(cfg.apiKey)}`;
  }

  return url;
}

function buildBody(
  cfg: LLMConfig,
  systemPrompt: string,
  userPrompt: string
): Record<string, unknown> {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  if (cfg.provider === "anthropic") {
    return {
      model: cfg.model,
      messages,
      max_tokens: 4096,
      stream: true,
    };
  }

  if (cfg.provider === "google") {
    return {
      contents: [{ role: "user", parts: [{ text: `SYSTEM: ${systemPrompt}\n\nUSER: ${userPrompt}` }] }],
      generationConfig: { candidateCount: 1, maxOutputTokens: 8192 },
    };
  }

  if (cfg.provider === "baidu") {
    return {
      model: cfg.model,
      messages,
      stream: true,
    };
  }

  // 大多数 provider 使用 OpenAI-compatible 格式
  return {
    model: cfg.model,
    messages,
    stream: true,
  };
}

function getEndpoint(cfg: LLMConfig): string {
  switch (cfg.provider) {
    case "anthropic":
      return "/messages";
    case "google":
      return `/models/${cfg.model}:generateContent`;
    default:
      return "/chat/completions";
  }
}

// ─────────────────────────────────────────
// 流式解析
// ─────────────────────────────────────────
async function* parseOllamaStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder
): AsyncGenerator<string> {
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (line === "done") return;
      if (!line.startsWith("{")) continue;
      try {
        const json = JSON.parse(line) as { response?: string; done?: boolean };
        if (json.response) yield json.response;
        if (json.done) return;
      } catch {}
    }
  }
}

async function* parseSSStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder
): AsyncGenerator<string> {
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const braceStart = buffer.indexOf("{");
      const braceEnd = buffer.lastIndexOf("}");
      if (braceStart === -1 || braceEnd === -1 || braceEnd < braceStart) break;
      const jsonStr = buffer.substring(braceStart, braceEnd + 1);
      buffer = buffer.substring(braceEnd + 1);
      if (jsonStr.trim() === "[DONE]") return;
      try {
        const json = JSON.parse(jsonStr) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {}
    }
  }
}

async function* parseAnthropicStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder
): AsyncGenerator<string> {
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    for (const raw of buffer.split("\n")) {
      const line = raw.trim();
      if (!line.startsWith("event:")) continue;
      const eventType = line.replace("event:", "").trim();
      const dataLineIdx = buffer.indexOf("\n" + "data:");
      // 简化：直接查找 content_block_delta
      if (eventType === "content_block_delta") {
        const dataStart = buffer.indexOf("data:");
        const dataEnd = buffer.indexOf("\n", dataStart + 5);
        const dataStr = buffer.substring(dataStart + 5, dataEnd === -1 ? undefined : dataEnd).trim();
        if (dataStr && dataStr !== "[DONE]") {
          try {
            const json = JSON.parse(dataStr) as { delta?: { text?: string } };
            if (json.delta?.text) yield json.delta.text;
          } catch {}
        }
      }
      if (line.includes("[DONE]") || line === "event:message_stop") return;
    }
  }
}

async function* parseGoogleStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder
): AsyncGenerator<string> {
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Google SSE 格式: data: {...}
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.replace(/^data:\s*/, "").trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {}
    }
  }
}

// ─────────────────────────────────────────
// 主入口
// ─────────────────────────────────────────
export async function* streamLLM(
  cfg: LLMConfig,
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const url = buildUrl(cfg, getEndpoint(cfg));
  const headers = buildHeaders(cfg);
  const body = buildBody(cfg, systemPrompt, userPrompt);

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `LLM 请求失败: ${response.status} ${response.statusText}${text ? " - " + text.slice(0, 200) : ""}`
    );
  }

  if (!response.body) throw new Error("LLM 响应没有 body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    const meta = PROVIDER_META[cfg.provider];
    switch (meta.streamFormat) {
      case "sse":
        yield* parseSSStream(reader, decoder);
        break;
      case "ollama":
        yield* parseOllamaStream(reader, decoder);
        break;
      case "anthropic":
        yield* parseAnthropicStream(reader, decoder);
        break;
      case "text":
        yield* parseGoogleStream(reader, decoder);
        break;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function completeLLM(
  cfg: LLMConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  let full = "";
  for await (const chunk of streamLLM(cfg, systemPrompt, userPrompt)) {
    full += chunk;
  }
  return full;
}

// ─────────────────────────────────────────
// 连接测试（用真实对话请求验证，而非 /models 端点）
// ─────────────────────────────────────────
export async function testLLMConnection(cfg: LLMConfig): Promise<string> {
  const base = cfg.baseUrl.replace(/\/$/, "");
  const headers = buildHeaders(cfg);

  try {
    if (cfg.provider === "google") {
      const r = await fetch(`${base}/models?key=${encodeURIComponent(cfg.apiKey)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const json = await r.json() as { models?: Array<{ name: string }> };
      const models = json.models?.map((m) => m.name.split("/").pop()).join(", ") ?? "未知";
      return `连接成功！可用模型: ${models}`;
    }

    // 用实际的对话请求来测试（MiniMax 等大多数 provider 都支持）
    const body: Record<string, unknown> = {
      model: cfg.model,
      messages: [
        { role: "user", content: "你好，只回复 ok 即可" }
      ],
      max_tokens: 10,
      stream: false,
    };

    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      throw new Error(`${r.status} ${r.statusText}${text ? " - " + text.slice(0, 100) : ""}`);
    }

    const json = await r.json() as { data?: Array<{ id: string }>; choices?: Array<{ message?: { content?: string } }> };
    const models = json.data?.map((m) => m.id).join(", ") ?? "未知";
    const reply = json.choices?.[0]?.message?.content ?? "";
    return reply.trim() ? `连接成功！模型回复: ${reply.trim()}` : `连接成功！模型: ${cfg.model}`;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "未知错误";
    throw new Error(`连接失败: ${msg}`);
  }
}
