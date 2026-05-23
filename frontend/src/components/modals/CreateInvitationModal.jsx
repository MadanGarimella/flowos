import { useState } from "react";
import { Link, Send } from "lucide-react";
import { roles } from "../../constants/workflow";
import { SelectInput, TextInput } from "../common/Inputs";
import { Modal } from "./Modal";

export function CreateInvitationModal({ invitationLink, onClose, onCreate }) {
  const [form, setForm] = useState({ email: "", role: "MEMBER" });

  function submit(event) {
    event.preventDefault();
    onCreate({ ...form, appUrl: window.location.origin });
  }

  return (
    <Modal title="Invite team member" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextInput label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
        <SelectInput label="Organization role" value={form.role} onChange={(value) => setForm({ ...form, role: value })} options={roles.map((role) => ({ value: role, label: role }))} />
        <button className="button-primary w-full"><Send size={17} /> Create invitation link</button>
      </form>
      {invitationLink && (
        <div className="mt-5 border border-ocean/20 bg-ocean/5 p-4">
          <p className="label">Invitation link</p>
          <div className="flex gap-2">
            <input className="input" value={invitationLink} readOnly />
            <button type="button" className="button-secondary h-11 px-3" title="Copy link" onClick={() => navigator.clipboard?.writeText(invitationLink)}>
              <Link size={17} />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
