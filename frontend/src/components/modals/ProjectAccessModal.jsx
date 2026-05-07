import { useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { Modal } from "./Modal";

export function ProjectAccessModal({ user, project, users, canOffboard, currentRole, onClose, onSave, onOffboard }) {
  const [role, setRole] = useState(currentRole);
  const replacementUsers = users.filter((item) => item.id !== user.id);
  const [replacementUserId, setReplacementUserId] = useState(replacementUsers[0]?.id ?? "");
  const [confirmOffboard, setConfirmOffboard] = useState(false);
  const offboardSectionId = `offboard-${user.id}`;

  return (
    <Modal title="Project access" onClose={onClose}>
      <div className="mb-5 border border-slate-200 p-3">
        <p className="text-sm font-semibold">{user.name}</p>
        <p className="text-xs text-slate-500">{user.designation || user.role} · {user.email}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Project</p>
        <p className="text-sm">{project?.name ?? "No project selected"}</p>
      </div>

      <div className="space-y-3">
        <label className="access-option">
          <input type="radio" name="projectAccess" checked={role === "NO_ACCESS"} onChange={() => setRole("NO_ACCESS")} />
          <span>
            <strong>No access</strong>
            <small>Remove this user from the selected project.</small>
          </span>
        </label>
        <label className="access-option">
          <input type="radio" name="projectAccess" checked={role === "MEMBER"} onChange={() => setRole("MEMBER")} />
          <span>
            <strong>Project member</strong>
            <small>User can access this project and see tasks assigned to them.</small>
          </span>
        </label>
        <label className="access-option">
          <input type="radio" name="projectAccess" checked={role === "TEAM_LEAD"} onChange={() => setRole("TEAM_LEAD")} />
          <span>
            <strong>Team lead</strong>
            <small>User can manage members for this project and view the project flow.</small>
          </span>
        </label>
      </div>

      <button className="button-primary mt-5 w-full" onClick={() => onSave(role)}>
        <CheckCircle2 size={17} /> Save access
      </button>

      {canOffboard && (
        <button
          type="button"
          className="more-options-button"
          onClick={() => document.getElementById(offboardSectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          <ChevronDown size={16} /> More options
        </button>
      )}

      {canOffboard && (
        <section id={offboardSectionId} className="mt-6 border border-rosewood/25 bg-rosewood/5 p-4">
          <p className="text-sm font-semibold text-rosewood">Remove from company</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            This deactivates the user, removes project access, and reassigns all their tasks to another active team member.
          </p>
          <label className="mt-4 block">
            <span className="label">Reassign tasks to</span>
            <select className="input" value={replacementUserId} onChange={(event) => setReplacementUserId(event.target.value)}>
              {replacementUsers.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.email}</option>)}
            </select>
          </label>
          <label className="mt-3 flex items-start gap-2 text-xs text-slate-600">
            <input className="mt-0.5" type="checkbox" checked={confirmOffboard} onChange={(event) => setConfirmOffboard(event.target.checked)} />
            I understand this user will be removed from the active Team list.
          </label>
          <button
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 bg-rosewood px-4 text-sm font-semibold text-white transition hover:bg-rosewood/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!confirmOffboard || !replacementUserId}
            onClick={() => onOffboard(replacementUserId)}
          >
            Remove user and reassign tasks
          </button>
        </section>
      )}
    </Modal>
  );
}
