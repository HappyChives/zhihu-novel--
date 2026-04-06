import { NavLink } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  free?: boolean;
}

const navItems: NavItem[] = [
  { path: "/hotspot", label: "市场热点", icon: "📊", free: true },
  { path: "/inspiration", label: "灵感生成", icon: "💡", free: true },
  { path: "/topic", label: "选题确定", icon: "✍️", free: true },
  { path: "/outline", label: "大纲生成", icon: "🗺️", free: true },
  { path: "/writing", label: "AI 续写", icon: "⚡", free: false },
  { path: "/cover", label: "封面物料", icon: "🎨", free: false },
  { path: "/settings", label: "设置", icon: "⚙️" },
];

export function Sidebar() {
  return (
    <aside className="w-56 bg-dark-surface border-r border-dark-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-dark-border">
        <h1 className="text-xl font-bold text-white">
          <span className="text-primary-400">Story</span>Forge
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">故事工坊 · 盐选创作者</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary-600/20 text-primary-300 font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-dark-card"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.free === false && (
              <span className="ml-auto text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                付费
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-dark-border">
        <p className="text-xs text-gray-600">v1.0.0 · 完全本地运行</p>
      </div>
    </aside>
  );
}
