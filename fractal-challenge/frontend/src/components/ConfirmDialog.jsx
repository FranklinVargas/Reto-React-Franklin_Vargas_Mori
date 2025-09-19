import Modal from "./Modal";

export default function ConfirmDialog({ open, title = "Confirmar", message, onCancel, onConfirm }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="space-y-6">
        <p className="leading-relaxed text-slate-200/90">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition-all duration-200 hover:scale-[1.02]"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}
