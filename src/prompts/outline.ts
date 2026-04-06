/**
 * 构建故事大纲 Prompt
 * 输入：选定灵感 + 世界观设定 + 热点分析
 * 输出：开头钩子 + 主线 + 爆点分布 + 结尾回收 + 10章字数分配
 * 针对知乎盐选短篇 8500-10000 字
 */
export function buildOutlinePrompt(params: {
  inspiration: {
    title: string;
    conflict: string;
    characters: string;
    mood: string;
    explosionPoint: string;
  };
  worldSetting?: {
    baseRule: string;
    socialStructure: string;
    civilization: string;
    keyConflict: string;
  };
  hotspotData?: string;
}): { system: string; user: string } {

  const system = `你是一位专注于知乎盐选短篇的资深编辑，擅长设计让读者欲罢不能的故事大纲。

你的任务是：为给定的故事灵感设计一个完整的大纲。

知乎盐选短篇规格：
- 总字数：8500-10000字（纯中文）
- 章节：10章，每章850-1000字
- 节奏：极快，冲突密集，不废话
- 开头：前300字必须强冲突或强悬念
- 爆点：3-4个关键爆点，分布在故事不同位置
- 结尾：情感收束或反转收尾

大纲结构（按顺序输出）：
1. 【开头钩子】（300字以内）- 第一个冲突的设计，让读者立刻入戏
2. 【主线】- 用「因为→但是→所以」串起故事主线（3-5个循环）
3. 【爆点分布】- 3-4个爆点，说明出现位置（如"第3章结尾"）和内容
4. 【结尾设计】- 如何收束所有线索，情感落点
5. 【10章字数分配】- 估算每章约850-1000字，总计8500-10000字

注意：
- 所有章节必须在字数范围内，不写超
- 爆点要有具体内容，不是模糊描述
- 结尾要呼应开头的悬念或情感`;

  const { inspiration, worldSetting, hotspotData } = params;

  const userParts: string[] = [];

  userParts.push(`【故事灵感】
标题：${inspiration.title}
核心冲突：${inspiration.conflict}
人物设定：${inspiration.characters}
情绪基调：${inspiration.mood}
爆点分析：${inspiration.explosionPoint}`);

  if (worldSetting) {
    userParts.push(`\n【世界观设定】
底座规则：${worldSetting.baseRule}
社会结构：${worldSetting.socialStructure}
文明表层：${worldSetting.civilization}
核心冲突来源：${worldSetting.keyConflict}`);
  }

  if (hotspotData) {
    userParts.push(`\n【热点分析参考】\n${hotspotData.slice(0, 400)}`);
  }

  userParts.push(`\n请设计一个完整的知乎盐选短篇大纲（10章，8500-10000字）。`);

  return { system, user: userParts.join("\n") };
}
