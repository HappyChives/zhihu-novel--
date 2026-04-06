
/**
 * 构建灵感生成 Prompt
 * 输入：热点分析数据 + 可选题材/情绪偏好
 * 输出：3-5个详细灵感碎片，每个包含：标题、核心冲突、人物设定种子、世界观种子、情绪基调、爆点分析、适配题材
 */
export function buildInspirationPrompt(params: {
  hotspotData?: string;   // 热点分析结果（可选）
  genre?: string;         // 题材
  mood?: string;          // 情绪基调
  protagonistPrefs?: string; // 主角设定偏好
}): { system: string; user: string } {

  const system = `你是一位专注于知乎盐选短篇的资深创意策划师。

你的任务是：根据给定的热点分析数据，生成 3-5 个详细的故事灵感碎片。

每个灵感必须包含以下要素：
1. **一句话标题** - 有冲击力，吸引读者
2. **核心冲突** - 故事的核心矛盾是什么？这个矛盾为什么会让读者欲罢不能？
3. **人物设定种子** - 主角（和关键配角）的基本设定，简短但有辨识度
4. **世界观/背景种子** - 故事的背景设定，简短但独特
5. **情绪基调** - 整体的情绪走向（虐/甜/爽/悬疑/治愈等）
6. **爆点分析** - 这个灵感最可能成为爆款的 2-3 个理由（情绪共鸣点？反转点？话题性？）
7. **适配题材** - 最适合的题材分类

知乎盐选短篇特性：
- 节奏极快，冲突要密集
- 开头300字必须抓住读者
- 情绪要强烈（虐/甜/爽要有明确的爽点/虐点）
- 要有让读者忍不住付费追更的钩子

请生成 3-5 个差异化明显的灵感，不要雷同。`;

  const userParts: string[] = [];

  if (params.hotspotData) {
    userParts.push(`【热点分析参考】\n${params.hotspotData}`);
  }

  if (params.genre) {
    userParts.push(`【指定题材】${params.genre}`);
  }

  if (params.mood) {
    userParts.push(`【情绪基调偏好】${params.mood}`);
  }

  if (params.protagonistPrefs) {
    userParts.push(`【主角设定偏好】${params.protagonistPrefs}`);
  }

  const user = userParts.length > 0
    ? userParts.join("\n\n")
    : "请根据知乎盐选的热点趋势，生成 3-5 个有爆款潜力的故事灵感。";

  return { system, user };
}
