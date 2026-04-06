import { NavLink } from "react-router-dom";
import { useApp } from "../../lib/context";
import type { WorkflowStage } from "../../lib/types";

const STAGE_ORDER: WorkflowStage[] = [
  "hotspot",
  "inspiration",
  "worldSetting",
  "outline",
  "character",
  "chapterOutline",
  "writing",
];

const STAGE_LABELS: Record<WorkflowStage, string> = {
  hotspot: "市场热点",
  inspiration: "灵感生成",
  worldSetting: "世界观设定",
  outline: "故事大纲",
  character: "人物设计",
  chapterOutline: "章节细纲",
  writing: "正文创作",
  cover: "封面物料",
};

const STAGE_PATHS: Record<WorkflowStage, string> = {
  hotspot: "/hotspot",
  inspiration: "/inspiration",
  worldSetting: "/world",
  outline: "/outline",
  character: "/character",
  chapterOutline: "/chapter-outline",
  writing: "/writing",
  cover: "/cover",
};

function stageIndex(s: WorkflowStage): number {
  return STAGE_ORDER.indexOf(s);
}

type StageStatus = "locked" | "current" | "completed";

function getStageStatus(stage: WorkflowStage, currentStage: WorkflowStage | undefined): StageStatus {
  if (!currentStage) return "locked";
  const currentIdx = stageIndex(currentStage);
  const stageIdx = stageIndex(stage);
  if (stageIdx < currentIdx) return "completed";
  if (stageIdx === currentIdx) return "current";
  return "locked";
}

const STATUS_ICON: Record<StageStatus, string> = {
  locked: "🔒",
  current: "🟡",
  completed: "✅",
};

export function Sidebar() {
  const { project, isApiConfigured } = useApp();
  const currentStage = project?.stage;
  const projectName = project?.name || "新项目";

  return (
    <aside className="w-56 bg-dark-surface border-r border-dark-border flex flex-col">
      {/* API 未配置警告 */}
      {!isApiConfigured && (
        <div className="mx-3 mt-3 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-400">⚠️ 请先配置 API</p>
        </div>
      )}
      {/* Logo / Project info */}
      <div className="px-5 py-5 border-b border-dark-border">
        <h1 className="text-xl font-bold text-white">
          <span className="text-primary-400">故事</span>工坊
        </h1>
        <p className="text-xs text-gray-500 mt-0.5 truncate" title={projectName}>
          {projectName}
        </p>
      </div>

      {/* Workflow stages */}
      <div className="px-3 py-4">
        <p className="section-title mb-2">工作流阶段</p>
        <div className="space-y-0.5">
          {STAGE_ORDER.map((stage) => {
            const status = getStageStatus(stage, currentStage);
            const icon = STATUS_ICON[status];
            const label = STAGE_LABELS[stage];
            const path = STAGE_PATHS[stage];

            if (status === "locked") {
              return (
                <div
                  key={stage}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none"
                  title={`请先完成「${STAGE_LABELS[STAGE_ORDER[stageIndex(stage) - 1]]}」`}
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </div>
              );
            }

            return (
              <NavLink
                key={stage}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary-600/20 text-primary-300 font-medium"
                      : "text-gray-300 hover:text-white hover:bg-dark-card"
                  }`
                }
              >
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Other nav */}
      <div className="px-3 pb-4">
        <p className="section-title mb-2">其他</p>
        <NavLink
          to="/cover"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-primary-600/20 text-primary-300 font-medium"
                : "text-gray-400 hover:text-gray-200 hover:bg-dark-card"
            }`
          }
        >
          <span className="text-base">🎨</span>
          <span>封面物料</span>
        </NavLink>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: Settings */}
      <div className="px-3 pb-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-primary-600/20 text-primary-300 font-medium"
                : "text-gray-400 hover:text-gray-200 hover:bg-dark-card"
            }`
          }
        >
          <span className="text-base">⚙️</span>
          <span>设置</span>
        </NavLink>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-dark-border">
        <p className="text-xs text-gray-600">v1.0.0 · 完全本地运行</p>
      </div>
    </aside>
  );
}
