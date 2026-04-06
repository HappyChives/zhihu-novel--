import type { Character } from "../lib/types";

/**
 * 构建人物设计 Prompt
 * 输入：灵感 + 世界观 + 故事大纲
 * 输出：主要人物（主角1-2 + 反派/对手 + 关键配角2-3）
 * 每个角色包含六要素：核心渴望/核心恐惧/根冲突/背景/标志性细节/人物弧光
 */
export function buildCharacterPrompt(params: {
  inspiration: {
    title: string;
    conflict: string;
    characters: string;
    mood: string;
  };
  worldSetting?: {
    baseRule: string;
    socialStructure: string;
    keyConflict: string;
  };
  outline?: string;  // 故事大纲全文
}): { system: string; user: string } {

  const system = `你是一位擅长人物塑造的故事编辑。

你的任务是：根据故事设定，设计主要人物的详细档案。

人物设计的六要素（每个角色必须包含）：
1. **核心渴望** - 这个角色最想要的是什么？（必须具体）
2. **核心恐惧** - 最不想失去的是什么？（必须具体）
3. **根冲突** - 当渴望和恐惧冲突时，他会怎么选？这个选择就是他的"人物根"
4. **背景故事** - 简述形成这个人物的过去经历（2-3句话）
5. **标志性细节** - 让读者记住这个人物的一个独特动作/习惯/口头禅
6. **人物弧光** - 经历了故事中的事件后，这个角色发生了什么变化？

知乎盐选短篇人物设计要点：
- 人物数量：主角1-2人 + 反派/对手1人 + 关键配角1-2人（共3-5人）
- 主角要有明显的选择困境（渴望 vs 恐惧）
- 反派要有可理解的动机（不是脸谱化的坏人）
- 每个角色都要有自己的秘密或复杂性

请为每个角色输出以上六个要素。`;

  const { inspiration, worldSetting, outline } = params;

  const userParts: string[] = [];

  userParts.push(`【故事灵感】
标题：${inspiration.title}
核心冲突：${inspiration.conflict}
人物种子：${inspiration.characters}
情绪基调：${inspiration.mood}`);

  if (worldSetting) {
    userParts.push(`\n【世界观】
底座规则：${worldSetting.baseRule}
社会结构：${worldSetting.socialStructure}
核心冲突来源：${worldSetting.keyConflict}`);
  }

  if (outline) {
    userParts.push(`\n【故事大纲】\n${outline.slice(0, 600)}`);
  }

  userParts.push(`\n请设计 3-5 个主要人物的详细档案（六要素）。`);

  return { system, user: userParts.join("\n") };
}
