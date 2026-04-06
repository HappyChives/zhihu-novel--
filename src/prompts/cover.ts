/**
 * 封面物料全套提示词
 * 基于小说信息，生成完整的封面配套物料
 */

export interface CoverInput {
  topic?: string;
  outline?: string;
  coreConflict?: string;
  mood?: string;
  genre?: string;
}

export function buildCoverPrompt(input: CoverInput): { system: string; user: string } {
  const topicPart = input.topic ? `**选题/标题方向：**\n${input.topic}\n\n` : "";
  const conflictPart = input.coreConflict ? `**核心冲突：**\n${input.coreConflict}\n\n` : "";
  const moodPart = input.mood ? `**情绪风格：** ${input.mood}\n\n` : "";
  const genrePart = input.genre ? `**题材类型：** ${input.genre}\n\n` : "";

  return {
    system: `你是一位专业的盐选短篇小说编辑兼视觉策划师，擅长为小说生成完整的封面配套物料。
你的输出必须：
1. 封面提示词：Midjourney / Stable Diffusion 可用，英文输出，画面感强
2. 简介：100字以内，适合知乎盐选投稿格式，悬念前置
3. 金句：3-5句，每句都要有传播力，能让读者截图分享
4. 人物冲突：主角 vs 反派/对照组的核心矛盾，清晰有力
5. 标签：3-5个盐选热门标签，涵盖题材和情绪

所有物料必须服务于同一个核心情绪和故事调性。`,

    user: `请为以下小说生成全套封面物料：

${topicPart}${conflictPart}${moodPart}${genrePart}${input.outline ? `**故事大纲：**\n${input.outline}\n\n` : ""}请按以下格式输出：

## 一、封面图生成提示词（英文）
[输出一段 Midjourney / Stable Diffusion 格式的英文提示词，画面感强，风格与小说情绪一致]
关键词参考：cinematic lighting, ultra detailed, 8k, dramatic shadows, moody atmosphere

## 二、小说简介（100字以内，适合盐选投稿）
[输出投稿用简介，悬念前置，吸引编辑/读者点击]

## 三、金句摘录（3-5句）
1. [金句1]
2. [金句2]
3. [金句3]
4. [金句4]
5. [金句5]

## 四、人物冲突设定
**主角：** [描述主角的身份处境 + 核心目标]
**反派/对照组：** [描述对立面的身份处境 + 与主角的核心矛盾]
**核心冲突线：** [一句话描述主线冲突]

## 五、题材标签（3-5个）
[标签1] [标签2] [标签3] [标签4] [标签5]`,
  };
}
