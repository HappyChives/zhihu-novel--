/**
 * 构建正文续写 Prompt
 * 输入：章节细纲当前小节 + 已写内容 + 上下文
 * 输出：符合盐选风格的正文（按目标字数续写）
 */
export function buildWritingPrompt(params: {
  chapterNum: number;
  sectionTitle: string;
  sectionContent: string;  // 小节要点描述
  previousContent?: string;  // 已写内容（用于续写）
  context?: string;  // 上文1000字
  wordTarget: number;  // 本小节目标字数
  mood: string;  // 情绪基调
  characters?: Array<{ name: string; keyTrait: string; coreDesire: string; coreFear: string }>;
}): { system: string; user: string } {

  const { chapterNum, sectionTitle, sectionContent, previousContent, context, wordTarget, mood, characters } = params;

  const system = `你是一位专注于知乎盐选短篇的写作高手。

你的任务是：根据给定的章节细纲，续写正文。

知乎盐选写作规范：
- 节奏极快，冲突要密集，不废话
- 开头300字必须强冲突或强悬念
- 冷笔触：克制、客观、不煽情。用动作代替情绪表达。
- 对话要自然，不要说"某某说道"
- 断读点：章末留钩子，让人想继续读
- 字数精确：严格控制在 ${wordTarget - 50} 到 ${wordTarget + 50} 字之间，不多不少

写作风格：
- 用"她说"而不是"她说道"
- 用动作/表情/沉默代替情绪说明
- 短句和长句交替使用，制造节奏感
- 避免"非常""很""特别"等程度副词`;

  const userParts: string[] = [];

  userParts.push(`【章节信息】
第${chapterNum}章 / ${sectionTitle}
小节内容要点：${sectionContent}`);

  if (characters && characters.length > 0) {
    userParts.push(`\n【主要人物】
${characters.map((c) => `· ${c.name}：${c.keyTrait}（渴望：${c.coreDesire} / 恐惧：${c.coreFear}）`).join("\n")}`);
  }

  userParts.push(`\n情绪基调：${mood}`);
  userParts.push(`目标字数：${wordTarget}字（误差±50字）`);

  if (context) {
    userParts.push(`\n【上文1000字（用于上下文衔接）】\n${context}`);
  }

  if (previousContent) {
    userParts.push(`\n【已写内容（续写接上）】\n${previousContent}`);
  }

  userParts.push(`\n请续写正文，严格控制字数。`);

  return { system, user: userParts.join("\n") };
}
