import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { billingTypes, confidentialityLevels, projectWorkTypes } from "../../constants/workflow";
import { SelectInput, TextArea, TextInput } from "../common/Inputs";
import { Modal } from "./Modal";

export function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    workType: "GENERAL",
    confidentialityLevel: "STANDARD",
    billingType: "NON_BILLABLE",
    externalReference: "",
    description: "",
  });

  function submit(event) {
    event.preventDefault();
    onCreate(form);
  }

  return (
    <Modal title="New project" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput label="Project / workflow name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <TextInput label="Client / department" value={form.clientName} onChange={(value) => setForm({ ...form, clientName: value })} />
          <SelectInput label="Work type" value={form.workType} onChange={(value) => setForm({ ...form, workType: value })} options={projectWorkTypes} />
          <SelectInput label="Confidentiality" value={form.confidentialityLevel} onChange={(value) => setForm({ ...form, confidentialityLevel: value })} options={confidentialityLevels} />
          <SelectInput label="Billing model" value={form.billingType} onChange={(value) => setForm({ ...form, billingType: value })} options={billingTypes} />
          <TextInput label="Reference ID" value={form.externalReference} onChange={(value) => setForm({ ...form, externalReference: value })} />
        </div>
        <TextArea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
        <button className="button-primary w-full"><FolderPlus size={17} /> Create project</button>
      </form>
    </Modal>
  );
}
