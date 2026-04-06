/**
 * 灵感生成提示词
 * 基于题材和情绪偏好，生成5-10个故事灵感碎片
 */

export interface InspirationInput {
  genre?: string;
  mood: string; // 虐/甜/爽/悬疑/搞笑等
  protagonistPrefs?: string; // 主角设定偏好
  existingInspiration?: string; // 已有灵感，可继续扩展
}

export function buildInspirationPrompt(input: InspirationInput): { system: string; user: string } {
  const genrePart = input.genre ? `题材类型：${input.genre}` : "题材不限";
  const moodPart = `期望情绪：${input.mood}`;
  const prefsPart = input.protagonistPrefs
    ? `主角偏好：${input.protagonistPrefs}`
    : "主角偏好不限";

  const continuationPart = input.existingInspiration
    ? `\n\n已有灵感（请在此基础上扩展出更多方向）：\n${input.existingInspiration}`
    : "";

  return {
    system: `你是一位专注于知乎盐选短篇故事的创意策划师，擅长从热门题材和情绪偏好中挖掘出高传播潜力的故事灵感。
你生成的故事灵感必须满足以下特点：
1. 冲突强烈：开篇即有核心矛盾，能在3秒内抓住读者
2. 情绪鲜明：符合目标情绪类型（虐/甜/爽等）
3. 知乎调性：适合知乎用户的阅读习惯，短句节奏快，反转有力
4. 可操作性强：有明确的主角、冲突和世界观设定，创作者拿到后能立即开始写

每个灵感碎片包含：核心冲突句、主角设定、反派/对照组设定、世界观/背景设定、情绪落点。`,

    user: `基于以下信息，生成 5-10 个故事灵感碎片：

${genrePart}
${moodPart}
${prefsPart}
${continuationPart}

请按以下格式输出（每个灵感用分隔线隔开）：

---
### 灵感 [编号]

**核心冲突（一句话）：**
[用一句话描述核心冲突，要有画面感]

**主角设定：**
[主角的身份/处境/性格 + 当前面临的困境]

**反派/对照组设定：**
[对立面的设定，要有足够的戏剧张力]

**世界观/背景：**
[故事发生的世界/行业/生活背景]

**情绪落点：**
[这个故事最能让读者产生什么情绪共鸣？比如：憋屈后的逆袭、BE美感、爽感等]
---`,
  };
}
