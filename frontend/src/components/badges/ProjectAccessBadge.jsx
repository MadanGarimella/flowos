export function ProjectAccessBadge({ role }) {
  if (!role) return null;
  const label = role === "TEAM_LEAD" ? "Lead" : "Member";
  const color = role === "TEAM_LEAD" ? "bg-saffron/10 text-saffron" : "bg-ocean/10 text-ocean";
  return <span className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold ${color}`}>{label}</span>;
}
