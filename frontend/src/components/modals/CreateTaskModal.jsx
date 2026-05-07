import { useState } from "react";
import { Plus } from "lucide-react";
import { priorities } from "../../constants/workflow";
import { TextArea, TextInput, SelectInput } from "../common/Inputs";
import { Modal } from "./Modal";

export function CreateTaskModal({ projectId, users, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: users[0]?.id ?? "",
    priority: "MEDIUM",
    dueDate: "",
  });

  function submit(event) {
    event.preventDefault();
    onCreate({
      ...form,
      projectId,
      assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
      dueDate: form.dueDate || null,
    });
  }

  return (
    <Modal title="New task" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextInput label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
        <TextArea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectInput label="Assignee" value={form.assigneeId} onChange={(value) => setForm({ ...form, assigneeId: value })} options={users.map((user) => ({ value: user.id, label: user.name }))} />
          <SelectInput label="Priority" value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} options={priorities.map((priority) => ({ value: priority, label: priority }))} />
          <TextInput label="Due date" type="date" value={form.dueDate} onChange={(value) => setForm({ ...form, dueDate: value })} />
        </div>
        <button className="button-primary w-full"><Plus size={17} /> Create task</button>
      </form>
    </Modal>
  );
}
