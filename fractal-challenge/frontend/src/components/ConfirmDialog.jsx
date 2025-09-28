import Modal from "./Modal";

export default function ConfirmDialog({ open, title = "Confirm", message, onCancel, onConfirm }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="dialog__message">{message}</p>
      <div className="modal__actions">
        <button onClick={onCancel} className="btn btn--ghost">Cancel</button>
        <button onClick={onConfirm} className="btn btn--danger">Confirm</button>
      </div>
    </Modal>
  );
}
