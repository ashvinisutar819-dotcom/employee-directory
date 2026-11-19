import type { Employee } from "../types";
import { Icon } from "./Icon";
import Modal from "./Modal";

interface Props {
  employee: Employee;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({ employee, busy, onCancel, onConfirm }: Props) {
  return (
    <Modal title="Delete employee" onClose={onCancel}>
      <div className="confirm">
        <span className="confirm-icon">
          <Icon name="alert" size={26} />
        </span>
        <p>
          Are you sure you want to delete <strong>{employee.name}</strong>? This action cannot be undone.
        </p>
      </div>
      <div className="modal-actions">
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn danger-solid" onClick={onConfirm} disabled={busy}>
          {busy ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
