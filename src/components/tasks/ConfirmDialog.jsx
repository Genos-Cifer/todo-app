import "../../styles/shared.css";

// Generic confirm/cancel dialog used for destructive actions (delete task, clear completed).
export function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  return (
    <div className="modal modal--narrow">
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="icon-btn icon-btn--ghost" style={{ fontSize: 16 }} onClick={onCancel}>✕</button>
      </div>
      <div className="confirm-body">
        <p>{message}</p>
        <div className="confirm-body__actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
