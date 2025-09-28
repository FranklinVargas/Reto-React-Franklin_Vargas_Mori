export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button onClick={onClose} className="modal__close" aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
