export function PriorityBadge({ priority }) {
  const color = {
    LOW: "bg-moss/10 text-moss",
    MEDIUM: "bg-ocean/10 text-ocean",
    HIGH: "bg-saffron/10 text-saffron",
    URGENT: "bg-rosewood/10 text-rosewood",
  }[priority] ?? "bg-slate-100 text-slate-600";
  return <span className={`shrink-0 px-2 py-1 text-[11px] font-semibold ${color}`}>{priority}</span>;
}
