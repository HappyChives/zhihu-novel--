# StoryForge 产品重构实施方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) to implement this plan task-by-task.

**目标：** 将 StoryForge 从"多模块工具"重构为"知乎盐选短篇一站式 AI 创作工作流"，重新设计产品架构、UI 导航、Prompt 体系、定价模型。

**架构概览：** 线性工作流驱动的单页应用，每个模块从前序模块获取上下文数据，用户按顺序推进创作。状态存储在 localStorage 中的单一项目对象里。侧边栏按工作流阶段展示进度，付费门槛移至整个软件级别而非单功能。

**技术栈：** React 18 + TypeScript + Vite + Tailwind CSS + Tauri 2.0 (不变)

---

## 新产品工作流（7 个阶段）

```
① 市场热点 → ② 灵感生成 → ③ 世界观设定 → ④ 故事大纲 → ⑤ 人物设计 → ⑥ 章节细纲 → ⑦ 正文/润色/检查 → ⑧ 封面物料
```

每个阶段完成后解锁下一阶段，前序阶段数据可回溯修改（修改后后续阶段标记为"需刷新"）。

---

## 新数据模型 (src/lib/types.ts)

```typescript
export type WorkflowStage =
  | "hotspot"      // ① 市场热点
  | "inspiration"  // ② 灵感生成
  | "worldSetting" // ③ 世界观设定
  | "outline"      // ④ 故事大纲
  | "character"    // ⑤ 人物设计
  | "chapterOutline" // ⑥ 章节细纲
  | "writing"      // ⑦ 正文（含润色/检查）
  | "cover";       // ⑧ 封面物料

export interface WorldSetting {
  baseRule: string;        // 底层规则/核心设定
  socialStructure: string; // 社会结构
  civilization: string;     // 文明/表层生活
  keyConflict: string;      // 核心冲突来源
  rulesToShow: string[];   // 需要展示给读者的规则（用于场景设计）
}

export interface Character {
  id: string;
  name: string;
  role: "protagonist" | "antagonist" | "supporting" | "minor";
  age?: string;
  occupation?: string;
  coreDesire: string;      // 最想要什么
  coreFear: string;        // 最不想失去什么
  rootConflict: string;    // 根冲突（选择什么）
  backstory: string;      // 背景故事
  keyTrait: string;        // 标志性细节
  arc: string;             // 人物弧光
}

export interface ChapterOutline {
  totalChapters: 10;
  totalWords: number;     // 8500-10000
  chapters: ChapterOutlineItem[];
}

export interface ChapterOutlineItem {
  chapterNum: number;     // 1-10
  summary: string;          // 本章一句话总结
  sections: SectionOutline[]; // 3-5个小节
}

export interface SectionOutline {
  sectionNum: number;      // 本章内编号 1-N
  title: string;           // 小节标题
  content: string;         // 小节要点（200-300字）
  wordTarget: number;      // 目标字数
  hookPosition?: string;   // 断读点位置
}

export interface WritingProgress {
  chapters: WrittenChapter[];
  totalWordCount: number;
  polishCount: number;
}

export interface WrittenChapter {
  chapterNum: number;
  content: string;
  wordCount: number;
  polishedContent?: string;
  checks: CheckResult[];
}

export interface CheckResult {
  type: "logic" | "pace" | "dialogue" | "grammar" | "consistency";
  severity: "warn" | "error";
  location: string;        // "第3章/第2段"
  message: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  stage: WorkflowStage;
  hotspotData?: string;      // 热点分析原始结果
  inspirations: InspirationItem[];
  selectedInspirationId?: string;
  worldSetting?: WorldSetting;
  outline?: OutlineData;
  characters?: Character[];
  chapterOutline?: ChapterOutline;
  writingProgress?: WritingProgress;
  coverMaterials?: CoverMaterialData;
}

// 保留旧类型（向后兼容 db.ts）
export interface InspirationItem {
  id: string;
  title: string;          // 灵感标题
  conflict: string;       // 核心冲突
  characters: string;     // 人物设定
  worldSetting: string;   // 世界观种子
  mood: string;           // 情绪基调
  explosionPoint: string; // 爆点分析
  genre: string;          // 题材
}

export interface OutlineData {
  hook: string;          // 开头钩子（300字）
  mainLine: string;       // 主线
  explosionPoints: string[]; // 3-4个爆点分布
  ending: string;         // 结尾回收
  chapterWordAlloc: number[]; // 每章字数分配（10章，约8500字）
}

export interface CoverMaterialData {
  imagePrompt: string;
  synopsis: string;
  goldenLines: string[];
  characterConflict: string;
  tags: string[];
}
```

---

## 文件变更清单

### 删除（不再需要）
- `src/components/TopicSelect/` — 选题确定模块（与灵感重复）
- `src/prompts/topic.ts` — 选题 Prompt
- `src/prompts/hotspot.ts` — 旧热点 Prompt（替换为新的）
- `src/prompts/inspiration.ts` — 旧灵感 Prompt（替换）
- `src/prompts/outline.ts` — 旧大纲 Prompt（替换）

### 新建
- `src/components/HotspotAnalysis/HotspotAnalysis.tsx` — ①市场热点（自动分析）
- `src/components/WorldSetting/WorldSetting.tsx` — ③世界观设定
- `src/components/CharacterDesign/CharacterDesign.tsx` — ⑤人物设计
- `src/components/ChapterOutline/ChapterOutline.tsx` — ⑥章节细纲
- `src/components/DraftWriting/DraftWriting.tsx` — ⑦正文（含润色+检查）
- `src/components/ui/ProgressStepper.tsx` — 顶部工作流进度条
- `src/components/ui/InspirationCard.tsx` — 灵感卡片组件
- `src/components/ui/CharacterCard.tsx` — 人物卡片组件
- `src/prompts/hotspot.ts` — 新热点分析 Prompt（多维度）
- `src/prompts/inspiration.ts` — 新灵感生成 Prompt
- `src/prompts/worldSetting.ts` — 世界观设定 Prompt
- `src/prompts/character.ts` — 人物设计 Prompt
- `src/prompts/chapterOutline.ts` — 章节细纲 Prompt
- `src/prompts/writing.ts` — 正文续写 Prompt
- `src/prompts/polish.ts` — 润色 Prompt（重构）
- `src/prompts/check.ts` — 实时检查 Prompt
- `src/prompts/cover.ts` — 封面物料 Prompt（重构）

### 修改
- `src/lib/types.ts` — 扩展数据模型（见上）
- `src/lib/context.tsx` — 状态管理重构：单一 Project 对象，工作流阶段管理
- `src/lib/llm.ts` — 修复 MiniMax 模型名（m2.7 → 正确模型名）
- `src/components/Settings/Settings.tsx` — 只保留云端 API，改为一次性付费设置
- `src/components/Layout/Sidebar.tsx` — 新导航结构 + 工作流进度
- `src/App.tsx` — 新路由配置
- `src/components/Inspiration/Inspiration.tsx` — 重写为灵感确认（选择已生成的灵感）
- `src/components/OutlineGen/OutlineGen.tsx` — 重写为故事大纲（基于灵感+世界观）
- `src/components/WritingAssist/WritingAssist.tsx` — 拆分为 DraftWriting 组件
- `src/components/CoverMaterials/CoverMaterials.tsx` — 移除付费锁
- `src/prompts/index.ts` — 导出更新

---

## Task 1: 数据模型与状态管理重构

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/context.tsx`

- [ ] **Step 1: 备份并重写 types.ts** — 将所有新类型定义写入（见上方完整类型定义）

- [ ] **Step 2: 重写 context.tsx** — 核心变更：
  ```typescript
  // context.tsx 核心结构
  interface AppState {
    config: AppConfig;          // API 配置（简化）
    project: Project;           // 单一项目对象（替代原来分散的状态）
    // helper functions
    startProject(): void;
    advanceStage(): void;       // 进入下一阶段
    goToStage(s: WorkflowStage): void;
    updateInspiration(...): void;
    updateWorldSetting(...): void;
    updateOutline(...): void;
    updateCharacters(...): void;
    updateChapterOutline(...): void;
    updateWritingProgress(...): void;
    // 检查 API 是否已配置
    isApiConfigured: boolean;
  }
  ```
  移除 `licenseValid` 相关逻辑，改为检查 `config.llm` 是否完整配置。

- [ ] **Step 3: 更新 db.ts** — 适配新的 Project 数据结构（使用 localStorage）

---

## Task 2: LLM 模块修正

**Files:**
- Modify: `src/lib/llm.ts:98`

- [ ] **Step 1: 修复 MiniMax 模型名**

将 `minimax` provider 的 `defaultModel` 从 `"m2.7"` 改为正确值。MiniMax 正确的模型名应该是 `"abab6.5s-chat"` 或 `"abab6.5g-chat"`（根据官方文档）。使用以下值：
  ```typescript
  defaultModel: "abab6.5s-chat",
  ```

---

## Task 3: 设置页面重构

**Files:**
- Modify: `src/components/Settings/Settings.tsx`

- [ ] **Step 1: 移除本地大模型**
  - 删除 `PROVIDER_SECTIONS` 中的"本地模型"分组
  - 删除 `["ollama", "lmstudio", "localai"]` 从 `PROVIDER_LIST`
  - 保留的云端 API：`openai`, `anthropic`, `google`, `zhipu`, `deepseek`, `moonshot`, `minimax`, `baidu`, `alibaba`, `siliconflow`

- [ ] **Step 2: 重组 Provider 分组**
  ```typescript
  const PROVIDER_SECTIONS = [
    { title: "国际 API", items: ["openai", "anthropic", "google"] },
    { title: "国内 API", items: ["zhipu", "deepseek", "moonshot", "minimax", "baidu", "alibaba", "siliconflow"] },
    { title: "自定义", items: ["custom"] },
  ];
  ```

- [ ] **Step 3: 移除 License 设置区块** — 改为"关于"区域，显示软件版本

- [ ] **Step 4: 简化界面** — API Key 获取指引保留，改为付费方式说明（"一次性付费，配置 API 即可使用"）

---

## Task 4: 侧边栏与导航重构

**Files:**
- Modify: `src/components/Layout/Sidebar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 重写 Sidebar** — 新导航结构：
  ```
  项目信息（顶部）
  ──────────────
  ① 市场热点 [状态图标]
  ② 灵感生成 [状态图标]
  ③ 世界观设定 [状态图标]
  ④ 故事大纲 [状态图标]
  ⑤ 人物设计 [状态图标]
  ⑥ 章节细纲 [状态图标]
  ⑦ 正文创作 [状态图标]
  ──────────────
  封面物料
  ──────────────
  ⚙️ 设置
  ```
  每个阶段显示状态：未开始 ⭕ / 进行中 🟡 / 已完成 ✅ / 锁定 🔒

- [ ] **Step 2: 更新 App.tsx 路由** — 移除 `/topic`，添加 `/world`、`/character`、`/chapter-outline` 路由

---

## Task 5: 热点分析模块（重构）

**Files:**
- Create: `src/components/HotspotAnalysis/HotspotAnalysis.tsx`
- Modify: `src/prompts/hotspot.ts`

- [ ] **Step 1: 写新 hotspot.ts Prompt**

核心要求：
- 用户点击"开始分析"，AI 自动分析当前知乎盐选热点
- 多维度分析：题材分布 / 情绪偏好 / 冲突类型 / 主角人设趋势 / 爆款元素 / 平台调性
- 输出结构化 JSON 供后续灵感生成使用
- 不要用户粘贴数据，系统自己生成分析

```typescript
// src/prompts/hotspot.ts
export function buildHotspotAnalysisPrompt(params: {
  genre?: string;  // 可选，用户指定题材方向
}): { system: string; user: string }
```

**Prompt 设计要点：**
- system: "你是一位专注于知乎盐选的内容分析师，分析当下盐选热榜的创作趋势..."
- user: 生成多维度分析，包含：题材热度排序、情绪类型分布、核心冲突模式、主角人设趋势、3-5个爆款元素提炼、盐选调性总结

- [ ] **Step 2: 写 HotspotAnalysis.tsx**
  - 顶部：题材方向筛选（可选，选填后针对性分析）
  - 主区域：显示分析结果（Markdown 渲染）
  - 每个维度显示为独立卡片
  - "基于分析生成灵感"按钮 → 跳转至灵感模块并带入热点数据
  - 状态：保存分析结果到 project.hotspotData

---

## Task 6: 灵感生成模块（重构）

**Files:**
- Modify: `src/components/Inspiration/Inspiration.tsx`
- Create: `src/prompts/inspiration.ts`
- Create: `src/components/ui/InspirationCard.tsx`

- [ ] **Step 1: 写新 inspiration.ts Prompt**

核心要求：
- 输入：热点分析数据 + 可选题材/情绪偏好
- 输出：3-5 个灵感碎片（不是模糊想法，是详细灵感）
- 每个灵感包含：
  - 一句话标题
  - 核心冲突（什么矛盾驱动故事）
  - 人物设定种子（主角+关键角色）
  - 世界观/背景种子
  - 情绪基调
  - **爆点分析**（这个灵感为什么会爆？情绪共鸣点？反转点？）
  - 适配题材

- [ ] **Step 2: 写 InspirationCard.tsx** — 卡片展示灵感，带选择按钮，支持展开查看详情

- [ ] **Step 3: 重写 Inspiration.tsx**
  - 显示热点分析摘要（可折叠）
  - 题材/情绪筛选（继承热点分析结果作为默认值）
  - 生成 3-5 个灵感卡片
  - 每个卡片：标题 + 核心冲突 + 爆点分析 + "选用此灵感"按钮
  - 选用后 → 解锁世界观设定模块

---

## Task 7: 世界观设定模块（新建）

**Files:**
- Create: `src/components/WorldSetting/WorldSetting.tsx`
- Create: `src/prompts/worldSetting.ts`

- [ ] **Step 1: 写 worldSetting.ts Prompt**

核心要求：
- 输入：选定的灵感 + 热点分析
- 输出：世界观的三个层次
  - **底座（底层规则）**：这个世界的核心物理/社会规则是什么？
  - **社会结构（中层）**：阶层、制度、家族、势力
  - **文明（表层）**：生活、文化、语言、可见细节
- 同时输出：核心冲突来源 + 需要展示给读者的规则列表（用于场景设计）
- 遵循 Obsidian 资料中的「底座-文明」模型

- [ ] **Step 2: 写 WorldSetting.tsx**
  - 显示选定的灵感摘要（只读）
  - AI 生成世界观设定，结果分三块展示
  - 每块可单独编辑（用户可以调整 AI 输出）
  - "确认世界观"按钮 → 解锁故事大纲模块

---

## Task 8: 故事大纲模块（重构）

**Files:**
- Modify: `src/components/OutlineGen/OutlineGen.tsx`
- Create: `src/prompts/outline.ts`（重写）

- [ ] **Step 1: 重写 outline.ts Prompt**

核心要求（针对知乎盐选短篇 8500-10000 字）：
- 输入：选定灵感 + 世界观设定 + 热点分析
- 输出结构：
  - **开头钩子**：前 300 字的强冲突/强悬念设计
  - **主线**：用「因为→但是→所以」串起故事主线
  - **爆点分布**：3-4 个关键爆点（标注出现位置，如"第2章结尾"）
  - **结尾回收**：如何回收开头悬念/情感收束
  - **10章字数分配**：总字数 8500-10000 均分到 10 章
- 知乎短篇特性：节奏极快、冲突密集、情绪强烈

- [ ] **Step 2: 重写 OutlineGen.tsx**
  - 显示灵感 + 世界观（只读摘要）
  - 生成故事大纲
  - "确认大纲"按钮 → 解锁人物设计模块

---

## Task 9: 人物设计模块（新建）

**Files:**
- Create: `src/components/CharacterDesign/CharacterDesign.tsx`
- Create: `src/prompts/character.ts`
- Create: `src/components/ui/CharacterCard.tsx`

- [ ] **Step 1: 写 character.ts Prompt**

核心要求：
- 输入：灵感 + 世界观 + 故事大纲
- 输出：主要人物（主角1-2人 + 反派/对手 + 关键配角 2-3人）
- 每人包含（六要素）：
  - 核心渴望（最想要什么）
  - 核心恐惧（最不想失去什么）
  - 根冲突（这两者冲突时选哪个 → 人物"根"）
  - 背景故事（简述）
  - 标志性细节（让人记住的独特动作/习惯）
  - 人物弧光（经历了什么变化）

- [ ] **Step 2: 写 CharacterCard.tsx** — 卡片展示人物信息，可编辑

- [ ] **Step 3: 写 CharacterDesign.tsx**
  - 显示故事大纲摘要（只读）
  - AI 生成人物列表（3-5个主要人物）
  - 每个角色显示为卡片，可编辑
  - 可手动添加更多人物
  - "确认人物"按钮 → 解锁章节细纲模块

---

## Task 10: 章节细纲模块（新建）

**Files:**
- Create: `src/components/ChapterOutline/ChapterOutline.tsx`
- Create: `src/prompts/chapterOutline.ts`

- [ ] **Step 1: 写 chapterOutline.ts Prompt**

核心要求：
- 输入：故事大纲 + 人物设计 + 总字数目标（8500-10000）
- 输出：10 章，每章 3-5 小节
- 每小节包含：
  - 标题
  - 内容要点（200-300字描述这一小节要写什么）
  - 目标字数
  - 断读点位置（如果有）
- 控制总字数在 8500-10000 字范围内
- 每章结尾设置钩子

- [ ] **Step 2: 写 ChapterOutline.tsx**
  - 显示总字数统计（实时更新）
  - 10 章可折叠展示
  - 每章展开后显示小节列表
  - 每小节可编辑
  - 字数统计：显示当前总字数 vs 目标（8500-10000）
  - "字数不足/超出"警告
  - "确认细纲"按钮 → 解锁正文初稿模块

---

## Task 11: 正文创作模块（重构）

**Files:**
- Create: `src/components/DraftWriting/DraftWriting.tsx`
- Modify: `src/prompts/writing.ts`（重构）
- Create: `src/prompts/polish.ts`（重构）
- Create: `src/prompts/check.ts`

- [ ] **Step 1: 重写 writing.ts Prompt**

知乎盐选短篇续写要点：
- 输入：章节细纲当前小节 + 已写内容 + 上下文（上文1000字）
- 输出：符合盐选风格的正文（目标字数 = 小节字数目标）
- 特性：开头300字强冲突、节奏快、冷笔触、不煽情

- [ ] **Step 2: 重写 polish.ts Prompt**
  - 7种润色意图：更虐/更甜/更悬疑/更爽/精简/增细节/调节奏/强冲突
  - 保留原文结构，只调整语气、节奏、情绪强度

- [ ] **Step 3: 写 check.ts Prompt**
  - 实时检查当前已写内容
  - 检查维度：逻辑漏洞 / 节奏问题 / 对话自然度 / 语法错误 / 前后一致性
  - 输出：CheckResult[] 列表（类型 + 位置 + 严重程度 + 建议）
  - 字数统计：实时显示已写字数 vs 目标（8500-10000）

- [ ] **Step 4: 写 DraftWriting.tsx**
  - 顶部：项目总进度（X/10 章完成，字数统计）
  - 左侧：章节列表（点击切换）
  - 右侧：
    - 当前章节/小节标题
    - 细纲要点提示（只读）
    - 正文编辑区（textarea，支持粘贴/编辑）
    - "AI 续写"按钮（按当前小节目标字数续写）
    - "润色"下拉菜单（7种意图）
    - "检查"按钮（实时反馈）
  - 底部：检查反馈列表（按类型分类，可点击跳转位置）
  - 字数不足时的"AI 续写下一小节"引导

---

## Task 12: 封面物料模块（清理付费锁）

**Files:**
- Modify: `src/components/CoverMaterials/CoverMaterials.tsx`

- [ ] **Step 1: 移除付费锁** — 删除 License 检查逻辑，整个组件开放使用

---

## Task 13: 编译验证与打包

**Files:**
- (no new files)

- [ ] **Step 1: 运行 `npm run build`** — 验证 TypeScript 编译无错误

- [ ] **Step 2: 运行 `npm run tauri build`** — 构建安装包

- [ ] **Step 3: 安装并测试** — `sudo dpkg -i StoryForge_*.deb`，验证各模块流转正常

---

## 实施顺序

1. Task 1（数据模型）→ 2（LLM修正）→ 3（设置页）→ 4（导航）→ 5（热点）→ 6（灵感）→ 7（世界观）→ 8（大纲）→ 9（人物）→ 10（章节细纲）→ 11（正文）→ 12（封面）→ 13（打包）

每个 Task 完成立即 `git commit`。
