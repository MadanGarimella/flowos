import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { TextArea, TextInput } from "../common/Inputs";
import { Modal } from "./Modal";

export function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", description: "" });

  function submit(event) {
    event.preventDefault();
    onCreate(form);
  }

  return (
    <Modal title="New project" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextInput label="Project name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
        <TextArea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
        <button className="button-primary w-full"><FolderPlus size={17} /> Create project</button>
      </form>
    </Modal>
  );
}
