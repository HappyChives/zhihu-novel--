/**
 * 润色修改提示词
 * 根据修改意图，对已有段落进行润色改写
 */

export type PolishIntent =
  | "更虐"
  | "更甜"
  | "更悬疑"
  | "更爽"
  | "精简"
  | "增细节"
  | "调节奏"
  | "强冲突";

export interface PolishInput {
  originalText: string;
  intent: PolishIntent;
}

export function buildPolishPrompt(input: PolishInput): { system: string; user: string } {
  const intentMap: Record<PolishIntent, string> = {
    "更虐": "强化悲剧色彩，让冲突更惨烈，增加虐心情节或BE暗示",
    "更甜": "强化甜蜜氛围，增加暖心情节和CP感",
    "更悬疑": "增加悬念、反转和不确定性，让读者想继续读",
    "更爽": "强化主角的逆袭和翻盘，让读者感到痛快",
    "精简": "删除冗余描写，压缩字数，保留核心情节和冲突",
    "增细节": "增加场景描写、人物心理和动作描写，丰富故事质感",
    "调节奏": "调整叙事节奏，加快或放慢情节推进速度",
    "强冲突": "在情节中增加更激烈的矛盾冲突",
  };

  const intentDesc = intentMap[input.intent];

  return {
    system: `你是一位专业的盐选短篇编辑，精通各种修改润色技巧。
你修改的内容必须：
1. 保留原文的核心情节和人物关系
2. 按照指定的修改意图进行改写
3. 保持知乎盐选体的风格：短句、快节奏、冲突前置
4. 改写后的版本要明显优于原文

输出格式：先说明修改了什么，再输出改写后的完整内容。`,

    user: `请将以下段落修改为"**${input.intent}**"风格。

修改方向：${intentDesc}

## 原文

${input.originalText}

## 输出格式

**修改说明：** [简述做了哪些修改，为什么]

**改写后内容：**
[输出改写后的完整段落，保留原文的全部情节，只做指定方向的调整]`,
  };
}
