import Modal from "./Modal";

export default function ConfirmDialog({ open, title="Confirm", message, onCancel, onConfirm }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1 rounded border">Cancel</button>
        <button onClick={onConfirm} className="px-3 py-1 rounded bg-red-600 text-white">Confirm</button>
      </div>
    </Modal>
  );
}
