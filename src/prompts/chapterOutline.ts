/**
 * 构建章节细纲 Prompt
 * 输入：故事大纲 + 人物设计 + 总字数目标
 * 输出：10章，每章3-5小节，每小节包含：标题/内容要点/目标字数/断读点
 * 总字数控制在 8500-10000
 */
export function buildChapterOutlinePrompt(params: {
  outline: string;          // 故事大纲全文
  characters?: Array<{ name: string; role: string; coreDesire: string; coreFear: string; rootConflict: string }>;
  worldSetting?: string;    // 世界观摘要
  totalWords?: number;      // 目标总字数，默认 9000
}): { system: string; user: string } {

  const { outline, characters, worldSetting, totalWords = 9000 } = params;
  const wordsPerChapter = Math.floor(totalWords / 10);
  const wordsPerSection = Math.floor(wordsPerChapter / 4);  // ~2250/4 ≈ 560, 每小节约500-700字

  const system = `你是一位专注于知乎盐选短篇的资深编辑。

你的任务是：将故事大纲展开为详细的章节细纲。

知乎盐选短篇规格：
- 总字数：${totalWords}字（纯中文）
- 章节：10章，每章约${wordsPerChapter}字
- 每章小节：3-5个小节，每小节约${wordsPerSection}字
- 总字数严格控制在 ${totalWords - 500} 到 ${totalWords + 500} 之间，不写超

章节细纲结构（每章输出）：
【第N章】章标题
  小节1: 小节标题
  - 内容要点：本小节要写什么（200-300字）
  - 目标字数：本小节预计字数
  - 断读点：本章末尾是否留钩子（是/否，简要说明）

【第N章】...
...（共10章）

写作要求：
- 每章有明确的节奏变化：开头快（给冲突）→ 中段慢（给信息）→ 结尾快（给爆点或钩子）
- 章末断读点要设计到位：情绪最高点/新问题产生/选择前/行动前
- 字数要均衡，不要头重脚轻`;

  const userParts: string[] = [`【故事大纲】\n${outline}`];

  if (characters && characters.length > 0) {
    userParts.push(`\n【主要人物】`);
    for (const c of characters) {
      userParts.push(`- ${c.name}（${c.role}）：${c.rootConflict || c.coreDesire}`);
    }
  }

  if (worldSetting) {
    userParts.push(`\n【世界观】${worldSetting.slice(0, 300)}`);
  }

  userParts.push(`\n请将以上大纲展开为10章章节细纲，每章3-5小节。`);

  return { system, user: userParts.join("\n") };
}
