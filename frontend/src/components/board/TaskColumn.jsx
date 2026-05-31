import { CalendarDays } from "lucide-react";
import { approvalStages, deliverableTypes, optionLabel, statusLabels } from "../../constants/workflow";
import { EmptyBlock } from "../common/EmptyBlock";
import { PriorityBadge } from "../badges/PriorityBadge";

export function TaskColumn({
  status,
  tasks,
  selectedTaskId,
  draggingTaskId,
  dragOverStatus,
  onSelect,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) {
  const isDropTarget = dragOverStatus === status;

  return (
    <div
      className={`task-column ${isDropTarget ? "task-column-active" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver(status);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onDragOver(null);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(status);
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{statusLabels[status]}</h2>
        <span className="grid h-6 min-w-6 place-items-center bg-slate-100 px-2 text-xs font-semibold">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <article
            key={task.id}
            draggable
            onClick={() => onSelect(task.id)}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", String(task.id));
              onDragStart(task.id);
            }}
            onDragEnd={onDragEnd}
            className={`task-card ${selectedTaskId === task.id ? "task-card-active" : ""} ${draggingTaskId === task.id ? "task-card-dragging" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold leading-5">{task.title}</h3>
              <PriorityBadge priority={task.priority} />
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{task.description || "No description provided."}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-500">
              <span className="task-meta-pill">{optionLabel(deliverableTypes, task.deliverableType)}</span>
              <span className="task-meta-pill">{optionLabel(approvalStages, task.approvalStage)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span className="truncate">{task.assignee?.name ?? "Unassigned"}</span>
              <span className="flex shrink-0 items-center gap-1"><CalendarDays size={13} /> {task.dueDate ?? "No date"}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <span>Drag to move</span>
              <span>{statusLabels[task.status]}</span>
            </div>
          </article>
        ))}
        {!tasks.length && <EmptyBlock text="No tasks in this stage." />}
      </div>
    </div>
  );
}
