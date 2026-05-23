import { useEffect, useMemo, useState } from "react";
import { ClipboardList, FolderPlus, LayoutDashboard, ListChecks, LogOut, Plus, RefreshCw, Search, UserPlus, UserRound } from "lucide-react";
import { statuses } from "../constants/workflow";
import { useApi } from "../hooks/useApi";
import { startOfToday } from "../utils/date";
import { TaskColumn } from "../components/board/TaskColumn";
import { TaskPanel } from "../components/board/TaskPanel";
import { BoardOverview } from "../components/dashboard/BoardOverview";
import { ProjectAccessBadge } from "../components/badges/ProjectAccessBadge";
import { UserProfileBadge } from "../components/layout/UserProfileBadge";
import { EmptyBlock } from "../components/common/EmptyBlock";
import { Metric } from "../components/common/Metric";
import { CreateTaskModal } from "../components/modals/CreateTaskModal";
import { CreateProjectModal } from "../components/modals/CreateProjectModal";
import { CreateInvitationModal } from "../components/modals/CreateInvitationModal";
import { ProjectAccessModal } from "../components/modals/ProjectAccessModal";

export function WorkspacePage({ session, onLogout }) {
  const api = useApi(session.token);
  const isAllowedAdmin = session.user.role === "ADMIN";
  const isManager = session.user.role === "MANAGER";
  const canManageProjects = isAllowedAdmin || isManager;
  const canManageTasks = isAllowedAdmin || isManager;
  const canManageUsers = isAllowedAdmin;
  const [view, setView] = useState("summary");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskDetail, setTaskDetail] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedAccessUser, setSelectedAccessUser] = useState(null);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [invitationLink, setInvitationLink] = useState("");
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function run(action) {
    setError("");
    try {
      return await action();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function loadBase() {
    setLoading(true);
    await run(async () => {
      const [projectData, userData] = await Promise.all([api.get("/api/projects"), api.get("/api/users")]);
      setProjects(projectData);
      setUsers(userData);
      setSelectedProjectId((current) => current ?? projectData[0]?.id ?? null);
    }).catch(() => { });
    setLoading(false);
  }

  async function loadTasks(projectId = selectedProjectId) {
    if (!projectId) {
      setTasks([]);
      return;
    }
    await run(async () => {
      setTasks(await api.get(`/api/projects/${projectId}/tasks`));
    }).catch(() => { });
  }

  async function loadTaskDetail(taskId) {
    if (!taskId) {
      setTaskDetail(null);
      return;
    }
    await run(async () => {
      setTaskDetail(await api.get(`/api/tasks/${taskId}`));
    }).catch(() => { });
  }

  async function loadProjectMembers(projectId = selectedProjectId) {
    if (!projectId) {
      setProjectMembers([]);
      return;
    }
    await run(async () => {
      const data = await api.get(`/api/projects/${projectId}/members`);
      setProjectMembers(data.members ?? []);
    }).catch(() => { });
  }

  useEffect(() => {
    loadBase();
  }, []);

  useEffect(() => {
    loadTasks();
    loadProjectMembers();
    setSelectedTaskId(null);
  }, [selectedProjectId]);

  useEffect(() => {
    loadTaskDetail(selectedTaskId);
  }, [selectedTaskId]);

  const project = projects.find((item) => item.id === selectedProjectId);
  const currentProjectRole = project?.currentUserProjectRole;
  const canManageProjectMembers = isAllowedAdmin || currentProjectRole === "TEAM_LEAD";
  const filteredTasks = tasks.filter((task) => {
    const value = query.toLowerCase();
    return task.title.toLowerCase().includes(value) || (task.assignee?.name ?? "").toLowerCase().includes(value);
  });
  const metrics = useMemo(() => ({
    open: tasks.filter((task) => task.status !== "DONE").length,
    overdue: tasks.filter((task) => task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < startOfToday()).length,
    done: tasks.filter((task) => task.status === "DONE").length,
  }), [tasks]);
  const activeMembers = projectMembers.length;

  async function refreshAll() {
    await loadBase();
    await loadTasks();
    await loadProjectMembers();
    if (selectedTaskId) await loadTaskDetail(selectedTaskId);
  }

  async function updateTask(taskId, patch) {
    await run(async () => {
      await api.patch(`/api/tasks/${taskId}`, patch);
      await loadTasks();
      if (selectedTaskId === taskId) await loadTaskDetail(taskId);
    });
  }

  async function moveTask(taskId, nextStatus) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === nextStatus) return;
    await updateTask(taskId, { status: nextStatus });
  }

  async function createTask(payload) {
    await run(async () => {
      const task = await api.post("/api/tasks", payload);
      setModal(null);
      await loadTasks(payload.projectId);
      setSelectedTaskId(task.id);
    });
  }

  async function createProject(payload) {
    await run(async () => {
      const created = await api.post("/api/projects", payload);
      setModal(null);
      await loadBase();
      setSelectedProjectId(created.id);
    });
  }

  async function createInvitation(payload) {
    await run(async () => {
      const data = await api.post("/api/invitations", payload);
      setInvitationLink(data.invitationLink);
    });
  }

  async function updateProjectAccess(userId, role) {
    await run(async () => {
      if (role === "NO_ACCESS") {
        await api.delete(`/api/projects/${selectedProjectId}/members/${userId}`);
      } else {
        await api.post(`/api/projects/${selectedProjectId}/members`, { userId, role });
      }
      setSelectedAccessUser(null);
      await loadProjectMembers();
      await loadBase();
    });
  }

  async function offboardUser(userId, reassignToUserId) {
    await run(async () => {
      await api.post(`/api/users/${userId}/offboard`, { reassignToUserId: reassignToUserId ? Number(reassignToUserId) : null });
      setSelectedAccessUser(null);
      await loadBase();
      await loadTasks();
      await loadProjectMembers();
    });
  }

  async function addComment(body) {
    await run(async () => {
      await api.post(`/api/tasks/${selectedTaskId}/comments`, { body });
      await loadTaskDetail(selectedTaskId);
    });
  }

  return (
    <main className="min-h-screen bg-[#f4f7f6] text-ink">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center bg-ocean text-white shadow-sm">
                <ClipboardList size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold">OfficeFlow</p>
                <div className="mt-0.5 flex min-w-0 items-center gap-2 text-sm text-slate-500">
                  <span className="truncate">{project?.name ?? "Create a project to begin"}</span>
                  {currentProjectRole && <span className="shrink-0 bg-ocean/10 px-2 py-0.5 text-xs font-semibold text-ocean">{currentProjectRole === "TEAM_LEAD" ? "Team Lead" : "Member"}</span>}
                </div>
              </div>
            </div>
            <UserProfileBadge user={session.user} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="relative min-w-[240px] flex-1 md:max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={17} />
              <input className="h-10 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-ocean" placeholder="Search title or assignee" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <button className="button-secondary" onClick={refreshAll} title="Refresh"><RefreshCw size={17} /></button>
            {canManageProjects && <button className="button-secondary" onClick={() => setModal("project")}><FolderPlus size={17} /> Project</button>}
            {canManageUsers && <button className="button-secondary" onClick={() => { setInvitationLink(""); setModal("invite"); }}><UserPlus size={17} /> Invite</button>}
            {canManageTasks && <button className="button-primary" onClick={() => setModal("task")} disabled={!selectedProjectId}><Plus size={17} /> Task</button>}
            <button className="button-secondary" onClick={onLogout} title="Sign out"><LogOut size={17} /></button>
          </div>
        </div>
        {error && <div className="border-t border-rosewood/20 bg-rosewood/10 px-5 py-2 text-sm text-rosewood">{error}</div>}
      </header>

      <div className="grid min-h-[calc(100vh-126px)] grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white p-5 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projects</p>
            {canManageProjects && <button className="icon-button" onClick={() => setModal("project")} title="Create project"><FolderPlus size={16} /></button>}
          </div>
          <div className="space-y-2">
            {projects.map((item) => (
              <button key={item.id} className={`project-button ${item.id === selectedProjectId ? "project-button-active" : ""}`} onClick={() => setSelectedProjectId(item.id)}>
                <span className="min-w-0 truncate">{item.name}</span>
                <span className="shrink-0">{item.taskCount}</span>
              </button>
            ))}
            {!projects.length && <EmptyBlock text="No projects yet." />}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <Metric label="Open" value={metrics.open} tone="bg-ocean" />
            <Metric label="Late" value={metrics.overdue} tone="bg-rosewood" />
            <Metric label="Done" value={metrics.done} tone="bg-moss" />
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Team</p>
              {canManageUsers && <button className="icon-button" onClick={() => { setInvitationLink(""); setModal("invite"); }} title="Invite team member"><UserPlus size={16} /></button>}
            </div>
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  className={`team-user ${canManageProjectMembers && selectedProjectId ? "team-user-actionable" : ""}`}
                  onClick={() => {
                    if (canManageProjectMembers && selectedProjectId) setSelectedAccessUser(user);
                  }}
                  title={canManageProjectMembers && selectedProjectId ? "Manage project access" : undefined}
                >
                  <div className="grid h-8 w-8 place-items-center bg-slate-100 text-slate-600"><UserRound size={15} /></div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{user.name}</p>
                      <ProjectAccessBadge role={projectMembers.find((member) => member.user?.id === user.id)?.role} />
                    </div>
                    <p className="truncate text-xs text-slate-500">{user.designation || user.role} - {user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden p-5">
          {loading ? (
            <div className="grid h-full place-items-center text-slate-500">Loading workspace...</div>
          ) : !selectedProjectId ? (
            <div className="grid h-full place-items-center">
              <div className="text-center">
                <p className="text-xl font-semibold">Create your first project</p>
                <p className="mt-2 text-sm text-slate-500">Projects keep every department, client, or workflow separate.</p>
                {canManageProjects && <button className="button-primary mt-5" onClick={() => setModal("project")}><FolderPlus size={17} /> New project</button>}
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex border border-slate-300 bg-white p-1">
                  <button className={`segmented-button ${view === "summary" ? "segmented-button-active" : ""}`} onClick={() => setView("summary")}><LayoutDashboard size={15} className="inline" /> Summary</button>
                  <button className={`segmented-button ${view === "list" ? "segmented-button-active" : ""}`} onClick={() => setView("list")}><ListChecks size={15} className="inline" /> List</button>
                  <button className={`segmented-button ${view === "board" ? "segmented-button-active" : ""}`} onClick={() => setView("board")}><ClipboardList size={15} className="inline" /> Board</button>
                </div>
              </div>
              {view === "summary" && (
                <div className="space-y-5">
                  <BoardOverview project={project} metrics={metrics} totalTasks={tasks.length} activeMembers={activeMembers} />
                  <div className="grid gap-4 lg:grid-cols-2">
                    {statuses.map((status) => (
                      <div key={status} className="border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{status.replace("_", " ")}</p>
                          <span className="text-2xl font-semibold">{filteredTasks.filter((task) => task.status === status).length}</span>
                        </div>
                        <div className="mt-3 h-2 bg-slate-100">
                          <div className="h-2 bg-ocean" style={{ width: `${tasks.length ? (filteredTasks.filter((task) => task.status === status).length / tasks.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {view === "list" && (
                <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Task</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Assignee</th>
                        <th className="px-4 py-3">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className="cursor-pointer border-t border-slate-100 hover:bg-ocean/5" onClick={() => setSelectedTaskId(task.id)}>
                          <td className="px-4 py-3 font-medium">{task.title}</td>
                          <td className="px-4 py-3">{task.status.replace("_", " ")}</td>
                          <td className="px-4 py-3">{task.priority}</td>
                          <td className="px-4 py-3">{task.assignee?.name ?? "Unassigned"}</td>
                          <td className="px-4 py-3">{task.dueDate ?? "No date"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!filteredTasks.length && <div className="p-4"><EmptyBlock text="No tasks match this view." /></div>}
                </div>
              )}
              {view === "board" && (
                <div className="overflow-x-auto pb-2">
                  <div className="grid min-w-[900px] grid-cols-4 gap-4 xl:min-w-0">
                    {statuses.map((status) => (
                      <TaskColumn
                        key={status}
                        status={status}
                        tasks={filteredTasks.filter((task) => task.status === status)}
                        onSelect={setSelectedTaskId}
                        selectedTaskId={selectedTaskId}
                        draggingTaskId={draggingTaskId}
                        dragOverStatus={dragOverStatus}
                        onDragStart={(taskId) => setDraggingTaskId(taskId)}
                        onDragEnd={() => {
                          setDraggingTaskId(null);
                          setDragOverStatus(null);
                        }}
                        onDragOver={(nextStatus) => setDragOverStatus(nextStatus)}
                        onDrop={async (nextStatus) => {
                          const taskId = draggingTaskId;
                          setDraggingTaskId(null);
                          setDragOverStatus(null);
                          if (taskId) await moveTask(taskId, nextStatus);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

      </div>

      <TaskPanel
        detail={taskDetail}
        users={users}
        open={Boolean(taskDetail)}
        canManageTasks={canManageTasks}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={(patch) => updateTask(selectedTaskId, patch)}
        onComment={addComment}
      />

      {modal === "task" && (
        <CreateTaskModal projectId={selectedProjectId} users={users} onClose={() => setModal(null)} onCreate={createTask} />
      )}
      {modal === "project" && (
        <CreateProjectModal onClose={() => setModal(null)} onCreate={createProject} />
      )}
      {modal === "invite" && (
        <CreateInvitationModal invitationLink={invitationLink} onClose={() => setModal(null)} onCreate={createInvitation} />
      )}
      {selectedAccessUser && (
        <ProjectAccessModal
          user={selectedAccessUser}
          project={project}
          users={users}
          canOffboard={isAllowedAdmin && selectedAccessUser.id !== session.user.id}
          currentRole={projectMembers.find((member) => member.user?.id === selectedAccessUser.id)?.role ?? "NO_ACCESS"}
          onClose={() => setSelectedAccessUser(null)}
          onSave={(role) => updateProjectAccess(selectedAccessUser.id, role)}
          onOffboard={(replacementUserId) => offboardUser(selectedAccessUser.id, replacementUserId)}
        />
      )}
    </main>
  );
}
