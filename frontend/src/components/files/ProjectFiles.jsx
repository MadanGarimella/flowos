import { Download, FileText, Paperclip, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { EmptyBlock } from "../common/EmptyBlock";

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** unit)).toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

export function ProjectFiles({ files, currentUser, canManageFiles, onUpload, onDownload, onDelete }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Paperclip size={16} /> Project files</h2>
          <p className="mt-1 text-xs text-slate-500">Share working files with everyone who has access to this project.</p>
        </div>
        <input ref={inputRef} type="file" className="hidden" onChange={upload} />
        <button className="button-primary" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload size={16} /> {uploading ? "Uploading..." : "Upload file"}
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {files.map((file) => {
          const canDelete = canManageFiles || file.uploadedBy?.id === currentUser.id;
          return (
            <div key={file.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center bg-slate-100 text-slate-600"><FileText size={18} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{file.originalName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatBytes(file.sizeBytes)} · shared by {file.uploadedBy?.name ?? "Team member"} · {file.createdAt ? new Date(file.createdAt).toLocaleString() : ""}
                </p>
              </div>
              <button className="icon-button" title="Download file" onClick={() => onDownload(file)}><Download size={16} /></button>
              {canDelete && <button className="icon-button text-rosewood" title="Delete file" onClick={() => onDelete(file)}><Trash2 size={16} /></button>}
            </div>
          );
        })}
        {!files.length && <div className="p-4"><EmptyBlock text="No shared files yet." /></div>}
      </div>
    </section>
  );
}
