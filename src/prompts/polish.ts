export type PolishIntent =
  | "更虐" | "更甜" | "更爽" | "更悬疑"
  | "精简" | "增细节" | "调节奏" | "强冲突";

/**
 * 构建润色 Prompt
 */
export function buildPolishPrompt(params: {
  originalText: string;
  intent: PolishIntent;
}): { system: string; user: string } {

  const intents: Record<PolishIntent, string> = {
    "更虐": "增加情感虐点，放大人物内心的痛苦和挣扎，让读者心疼",
    "更甜": "增加甜蜜互动和情感升温，让读者感到幸福",
    "更爽": "增加反转、打脸、复仇等爽点，让读者感到痛快",
    "更悬疑": "增加悬念和信息遮蔽，让读者好奇",
    "精简": "删除冗余表述，保持节奏紧凑",
    "增细节": "增加场景描写、动作细节、情感细节",
    "调节奏": "调整叙事节奏，快慢交替更有张力",
    "强冲突": "增强人物之间的冲突和对立",
  };

  const system = `你是一位资深文字编辑，擅长对小说正文进行润色修改。

修改原则：
- 保留原文的核心情节和人物
- 只调整文字表达，不改变故事走向
- 润色后的字数与原文相近（增减不超过10%）

当前修改意图：${intents[params.intent]}`;

  const user = `【待修改正文】\n${params.originalText}\n\n请根据上述意图修改这段文字，保留核心内容，只调整表达方式。`;

  return { system, user };
}
