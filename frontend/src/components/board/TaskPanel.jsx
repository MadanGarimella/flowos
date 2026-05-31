import { useEffect, useState } from "react";
import { MessageSquare, Plus, X } from "lucide-react";
import { approvalStages, deliverableTypes, optionLabel, statusLabels, statuses } from "../../constants/workflow";
import { formatDate } from "../../utils/date";
import { EmptyBlock } from "../common/EmptyBlock";
import { PriorityBadge } from "../badges/PriorityBadge";

export function TaskPanel({ detail, users, open, canManageTasks, onClose, onUpdate, onComment }) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    setComment("");
  }, [detail?.task?.id]);

  if (!detail) return null;

  const { task, comments, activity } = detail;

  async function submitComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    await onComment(comment.trim());
    setComment("");
  }

  return (
    <div className={`task-panel-layer ${open ? "task-panel-layer-open" : ""}`}>
      <button className="task-panel-scrim" onClick={onClose} aria-label="Close task details" />
      <aside className={`task-panel-drawer ${open ? "task-panel-drawer-open" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task #{task.id}</p>
            <h2 className="mt-1 text-xl font-semibold leading-7">{task.title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <button className="icon-button" onClick={onClose} title="Close"><X size={17} /></button>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{task.description || "No description provided."}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="panel-field">
            <span>Deliverable</span>
            <p className="text-sm font-medium">{optionLabel(deliverableTypes, task.deliverableType)}</p>
          </div>
          <label className="panel-field">
            <span>Approval</span>
            <select value={task.approvalStage ?? "NOT_REQUIRED"} onChange={(event) => onUpdate({ approvalStage: event.target.value })}>
              {approvalStages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
            </select>
          </label>
          <div className="panel-field">
            <span>Target / compliance date</span>
            <p className="text-sm font-medium">{task.complianceDate ?? "Not set"}</p>
          </div>
          <div className="panel-field">
            <span>Estimated hours</span>
            <p className="text-sm font-medium">{task.estimatedHours ?? "Not set"}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="panel-field">
            <span>Status</span>
            <select value={task.status} onChange={(event) => onUpdate({ status: event.target.value })}>
              {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
          </label>
          {canManageTasks ? (
            <label className="panel-field">
              <span>Assignee</span>
              <select value={task.assignee?.id ?? ""} onChange={(event) => onUpdate({ assigneeId: Number(event.target.value) })}>
                {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </label>
          ) : (
            <div className="panel-field">
              <span>Assignee</span>
              <p className="text-sm font-medium">{task.assignee?.name ?? "Unassigned"}</p>
            </div>
          )}
        </div>

        <section className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><MessageSquare size={16} /> Comments</h3>
          <form onSubmit={submitComment} className="flex gap-2">
            <input className="input h-10" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" />
            <button className="button-primary h-10 px-3" title="Add comment"><Plus size={17} /></button>
          </form>
          <div className="mt-4 space-y-3">
            {comments.map((item) => (
              <div key={item.id} className="border border-slate-200 p-3">
                <p className="text-sm">{item.body}</p>
                <p className="mt-2 text-xs text-slate-500">{item.author?.name} - {formatDate(item.createdAt)}</p>
              </div>
            ))}
            {!comments.length && <EmptyBlock text="No comments yet." />}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 text-sm font-semibold">Activity</h3>
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="border-l-2 border-ocean pl-3">
                <p className="text-sm font-medium">{item.actor?.name} {item.action}</p>
                <p className="text-xs text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
