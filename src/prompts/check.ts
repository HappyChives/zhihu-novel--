import type { CheckResult } from "../lib/types";

/**
 * 构建实时检查 Prompt
 * 检查当前已写内容，返回 CheckResult[]
 */
export function buildCheckPrompt(params: {
  content: string;
  chapterNum: number;
  characters?: Array<{ name: string; coreDesire: string; coreFear: string }>;
}): { system: string; user: string } {

  const system = `你是一位资深文字编辑，负责实时检查小说正文。

检查维度：
1. 【逻辑漏洞】- 情节前后矛盾、时间线混乱、人物行为不合理
2. 【节奏问题】- 节奏拖沓、铺垫过长、该快的地方没快起来
3. 【对话问题】- 对话不自然、"说/道/问"过多、语气不贴人物
4. 【语法错误】- 病句、用词不当、标点错误
5. 【前后一致性】- 人物性格/设定前后矛盾、称谓混乱

输出要求（JSON格式）：
{
  "issues": [
    {
      "type": "logic|pace|dialogue|grammar|consistency",
      "severity": "warn|error",
      "location": "第N章/第M段",
      "message": "具体问题描述和建议修改方式"
    }
  ]
}

注意：
- 只指出真正的问题，不要过度挑剔
- 严重问题标记为 error，轻微问题标记为 warn
- 每章控制在 0-5 个问题以内`;

  const user = `【正文内容】\n${params.content.slice(-3000)}\n\n请检查以上内容，输出 JSON 格式的问题列表。`;

  return { system, user };
}
