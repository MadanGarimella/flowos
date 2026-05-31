import { billingTypes, confidentialityLevels, optionLabel, projectWorkTypes } from "../../constants/workflow";

export function BoardOverview({ project, metrics, totalTasks, activeMembers }) {
  return (
    <section className="board-overview">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current project</p>
        <h2 className="mt-1 truncate text-2xl font-semibold">{project?.name}</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          {project?.clientName && <span className="project-meta-pill">Client: {project.clientName}</span>}
          {project?.externalReference && <span className="project-meta-pill">Ref: {project.externalReference}</span>}
          <span className="project-meta-pill">{optionLabel(projectWorkTypes, project?.workType)}</span>
          <span className="project-meta-pill">{optionLabel(confidentialityLevels, project?.confidentialityLevel)}</span>
          <span className="project-meta-pill">{optionLabel(billingTypes, project?.billingType)}</span>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{project?.description || "Track assignments, ownership, progress, and review flow for this project."}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 2xl:w-[520px]">
        <OverviewMetric label="Tasks" value={totalTasks} />
        <OverviewMetric label="Open" value={metrics.open} />
        <OverviewMetric label="Late" value={metrics.overdue} tone="text-rosewood" />
        <OverviewMetric label="Team" value={activeMembers} />
      </div>
    </section>
  );
}

function OverviewMetric({ label, value, tone = "text-ink" }) {
  return (
    <div className="overview-metric">
      <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
