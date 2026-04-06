import type { Character } from "../../lib/types";

interface Props {
  character: Character;
  onChange: (c: Character) => void;
  onRemove?: () => void;
}

export function CharacterCard({ character, onChange, onRemove }: Props) {
  const field = (key: keyof Character, label: string, placeholder: string) => (
    <div key={key}>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <textarea
        className="input-field text-sm"
        rows={2}
        placeholder={placeholder}
        value={(character[key] as string) || ""}
        onChange={(e) => onChange({ ...character, [key]: e.target.value })}
      />
    </div>
  );

  const roleColors: Record<Character["role"], string> = {
    protagonist: "border-primary-400 bg-primary-500/5",
    antagonist: "border-red-500/40 bg-red-500/5",
    supporting: "border-yellow-500/30 bg-yellow-500/5",
    minor: "border-gray-500/30",
  };

  return (
    <div className={`card border ${roleColors[character.role]}`}>
      <div className="flex items-center gap-2 mb-3">
        <input
          className="input-field flex-1 font-semibold text-white"
          placeholder="角色名称"
          value={character.name}
          onChange={(e) => onChange({ ...character, name: e.target.value })}
        />
        <select
          className="input-field w-28 text-sm"
          value={character.role}
          onChange={(e) => onChange({ ...character, role: e.target.value as Character["role"] })}
        >
          <option value="protagonist">主角</option>
          <option value="antagonist">反派</option>
          <option value="supporting">配角</option>
          <option value="minor">次要</option>
        </select>
        {onRemove && (
          <button className="text-gray-500 hover:text-red-400 text-sm" onClick={onRemove}>
            删除
          </button>
        )}
      </div>

      <div className="space-y-3">
        {field("coreDesire", "核心渴望", "这个角色最想要的是什么？")}
        {field("coreFear", "核心恐惧", "最不想失去的是什么？")}
        {field("rootConflict", "根冲突", "渴望和恐惧冲突时，他会怎么选？")}
        {field("backstory", "背景故事", "简述人物背景（2-3句话）")}
        {field("keyTrait", "标志性细节", "让读者记住的独特动作/习惯/口头禅")}
        {field("arc", "人物弧光", "经历了故事后发生了什么变化？")}
      </div>
    </div>
  );
}
