import { X } from "lucide-react";

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
      <div className="flex max-h-[86vh] w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="shrink-0 border-b border-slate-200 p-5">
          <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} title="Close"><X size={17} /></button>
          </div>
        </div>
        <div className="modal-scroll-area">
          {children}
        </div>
      </div>
    </div>
  );
}
