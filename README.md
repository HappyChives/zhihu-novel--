# StoryForge 故事工坊

知乎盐选短篇创作者一站式 AI 写作工具。配置好 API Key 即可使用，覆盖从热点分析到完稿的完整创作流程。

**适用规格**：知乎盐选短篇，8500-10000 字，10 章，每章 3-5 小节。

---

## 工作流程

```
市场热点分析 → 灵感生成 → 世界观设定 → 故事大纲 → 人物设计 → 章节细纲 → 正文创作 → 封面物料
```

| 模块 | 说明 |
|---|---|
| **市场热点分析** | AI 自动分析知乎盐选热点，多维度（题材/情绪/冲突/人物/爆款元素/平台调性） |
| **灵感生成** | 基于热点生成 3-5 个详细灵感碎片，含爆点分析 |
| **世界观设定** | 底座-社会结构-文明三层世界观设计 |
| **故事大纲** | 开头钩子 + 主线 + 爆点分布 + 结尾回收（10章字数分配） |
| **人物设计** | 六要素设计：核心渴望/恐惧/根冲突/背景/标志细节/人物弧光 |
| **章节细纲** | 10 章，每章 3-5 小节，含断读点设计 |
| **正文创作** | AI 续写 + 8 种润色意图 + 实时检查反馈 |
| **封面物料** | AI 生成封面提示词 + 金句 + 导流文案 |

## 支持的 API

- OpenAI (GPT-4)
- Anthropic (Claude)
- Google Gemini
- DeepSeek
- 智谱 GLM
- 月之暗面 Kimi (Moonshot)
- MiniMax 海螺
- 百度文心 ERNIE
- 阿里通义 Qwen
- SiliconFlow

**付费方式**：一次性配置 API，配置完成即可使用全部功能。

---

## 下载安装

前往 [Releases](https://github.com/HappyChives/zhihu-novel--/releases) 下载：

| 平台 | 安装包 |
|---|---|
| Windows | `.msi` / `.exe` |
| Ubuntu / Debian | `.deb` |
| Fedora / RHEL | `.rpm` |

---

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Tauri 2.0 (Rust)
- **数据**: localStorage 本地存储

---

## 本地开发

```bash
npm install
npm run tauri:dev   # 启动开发模式
npm run tauri build  # 构建安装包
```

## License

MIT
