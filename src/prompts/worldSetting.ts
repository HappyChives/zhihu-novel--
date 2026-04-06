/**
 * 构建世界观设定 Prompt
 * 输入：选定灵感 + 热点分析
 * 输出：世界观三层次（底座-社会结构-文明）+ 核心冲突来源 + 需要展示的规则
 */
export function buildWorldSettingPrompt(params: {
  inspiration: {
    title: string;
    conflict: string;
    characters: string;
    mood: string;
  };
  hotspotData?: string;
}): { system: string; user: string } {

  const system = `你是一位擅长故事世界观设计的创意架构师。

你的任务：根据给定的故事灵感，设计一个完整而有深度的世界观。

世界观设计遵循「底座-文明」模型：
1. 【底座（底层规则）】- 这个世界的核心物理法则或社会规则是什么？这是故事的"底层代码"，决定了什么冲突是不可避免的。
2. 【社会结构（中层）】- 阶层、制度、家族、势力...这些决定了冲突如何展开
3. 【文明（表层）】- 生活、文化、语言、可见的日常细节...这些让读者沉浸其中

同时输出：
- 【核心冲突来源】- 这个世界观下，最核心的冲突是什么？由什么稀缺或不平衡引发？
- 【需要展示的规则】- 列出 3-5 个需要通过场景展示给读者的规则（不是直接说明，而是从人物困境中自然带出）

知乎盐选短篇：不需要完整架空世界，改动现实世界的一个小规则即可，重点是冲突的设计。`;

  const { inspiration, hotspotData } = params;

  const userParts: string[] = [
    `【选定灵感】`,
    `标题：${inspiration.title}`,
    `核心冲突：${inspiration.conflict}`,
    `人物设定：${inspiration.characters}`,
    `情绪基调：${inspiration.mood}`,
  ];

  if (hotspotData) {
    userParts.push(`\n【热点分析参考】\n${hotspotData.slice(0, 500)}`);
  }

  userParts.push(`\n请根据以上灵感，设计一个适合的世界观（底座-社会结构-文明三层次）。`);

  return { system, user: userParts.join("\n") };
}
