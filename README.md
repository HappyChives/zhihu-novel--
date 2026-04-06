# StoryForge 故事工坊

知乎盐选创作者一站式 AI 写作工具，基于本地大语言模型（Ollama / LM Studio 等）或云端 API（DeepSeek、OpenAI、Anthropic、智谱 GLM 等）驱动，覆盖从灵感捕捉到完稿的全流程。

---

## 功能特性

| 模块 | 说明 |
|---|---|
| **热点分析** | 抓取知乎热榜数据，分析当下创作热点与受众偏好 |
| **灵感生成** | AI 批量生成故事灵感（冲突、人物、世界观、情绪） |
| **选题策划** | 将灵感转化为可落地的选题，评估平台适配度 |
| **大纲生成** | 输入选题，AI 输出四幕式完整大纲与人物弧线 |
| **章节写作** | 按大纲分章节逐段生成内容，支持续写与润色 |
| **封面素材** | AI 生成封面配图提示词 + 导流文案 |

## 支持的 LLM

**本地模型**
- Ollama
- LM Studio
- LocalAI

**云端 API**
- OpenAI (GPT-4)
- Anthropic (Claude)
- Google Gemini
- DeepSeek
- 智谱 GLM
- 月之暗面 Kimi (Moonshot)
- MiniMax 海螺
- 百度文心 ERNIE
- 阿里通义 Qwen
- SiliconFlow（聚合）

---

## 下载安装

前往 [Releases](https://github.com/HappyChives/zhihu-novel--/releases) 下载对应平台的安装包：

| 平台 | 安装包 |
|---|---|
| Windows | `.msi` / `.exe` |
| Ubuntu / Debian | `.deb` |
| Fedora / RHEL | `.rpm` |

---

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Tauri 2.0 (Rust)
- **数据库**: SQLite (本地存储)
- **AI**: 兼容 OpenAI-compatible API 的任意 Provider

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（前端）
npm run dev

# 启动完整 Tauri 开发模式
npm run tauri:dev

# 构建生产版本
npm run tauri build
```

---

## License

MIT
