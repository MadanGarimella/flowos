import { CalendarDays, Mail, ShieldCheck, UserRound, Wrench } from "lucide-react";
import { Modal } from "./Modal";
import { ProjectAccessBadge } from "../badges/ProjectAccessBadge";

export function UserProfileModal({ user, projectRole, canManageAccess, onClose, onManageAccess }) {
  return (
    <Modal title="Team profile" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center bg-ocean/10 text-ocean"><UserRound size={24} /></div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-slate-500">{user.designation || "Team member"}</p>
          </div>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-3 border border-slate-200 p-3"><Mail size={16} className="text-slate-400" /><span className="truncate">{user.email}</span></div>
          <div className="flex items-center gap-3 border border-slate-200 p-3"><ShieldCheck size={16} className="text-slate-400" /><span>{user.role}</span></div>
          <div className="flex items-center gap-3 border border-slate-200 p-3">
            <CalendarDays size={16} className="text-slate-400" />
            <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "recently"}</span>
          </div>
        </div>
        <div className="border border-slate-200 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected project access</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <ProjectAccessBadge role={projectRole} />
            {!projectRole && <span className="text-slate-500">No project access</span>}
          </div>
        </div>
        {canManageAccess && (
          <button className="button-secondary w-full" onClick={onManageAccess}>
            <Wrench size={16} /> Manage project access
          </button>
        )}
      </div>
    </Modal>
  );
}
