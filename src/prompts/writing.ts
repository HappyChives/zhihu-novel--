/**
 * AI 续写初稿提示词
 * 基于大纲和上下文，生成盐选风格的短篇初稿
 */

export interface WritingInput {
  outline: string;
  currentContent?: string;
  wordCount?: number;
  style?: "虐" | "甜" | "爽" | "悬疑" | "搞笑";
}

export function buildWritingPrompt(input: WritingInput): { system: string; user: string } {
  const wordTarget = input.wordCount ? `约 ${input.wordCount} 字` : "8000-15000 字";
  const stylePart = input.style ? `情绪风格：**${input.style}**（请在写作中强化这一情绪）` : "";

  return {
    system: `你是一位专注于知乎盐选短篇的高产作家，你写的故事有以下特点：
1. **知乎盐选体**：段落短（2-4句一段）、节奏快、冲突前置、反转有力
2. **情绪强烈**：开篇即抓人，让读者想继续读下去
3. **短句节奏**：大量使用短句，减少冗长描写，增加阅读流畅感
4. **画面感强**：用具体的动作、对话、神态代替叙述
5. **反转设计**：在关键情节点设置反转，给读者惊喜

写作要求：
- 不要写景，不要写内心独白，直接写动作和对话
- 每段不超过50字
- 开头第一句就要有钩子，吸引读者继续读
- 禁止水文，每句话都要推进情节

${stylePart}`,
    user: `请根据以下大纲，续写/生成一段 ${wordTarget} 的短篇初稿。

如果提供了已有内容，请在此基础上续写，保持风格和情节连贯。
如果没有已有内容，请从大纲开头开始写。

---
## 大纲

${input.outline}
---

${input.currentContent ? `## 已有内容（请在此基础上续写）\n${input.currentContent}` : ""}

请直接输出小说正文，不需要任何前缀说明。`,
  };
}
