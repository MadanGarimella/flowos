import { useState } from "react";
import { UserPlus } from "lucide-react";
import { roles } from "../../constants/workflow";
import { TextInput, SelectInput } from "../common/Inputs";
import { Modal } from "./Modal";

export function CreateUserModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", designation: "", email: "", role: "MEMBER", password: "" });

  function submit(event) {
    event.preventDefault();
    onCreate(form);
  }

  return (
    <Modal title="Add team member" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextInput label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
        <TextInput label="Designation" value={form.designation} onChange={(value) => setForm({ ...form, designation: value })} required />
        <TextInput label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
        <SelectInput label="Role" value={form.role} onChange={(value) => setForm({ ...form, role: value })} options={roles.map((role) => ({ value: role, label: role }))} />
        <TextInput label="Temporary password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required minLength={8} />
        <button className="button-primary w-full"><UserPlus size={17} /> Add member</button>
      </form>
    </Modal>
  );
}
