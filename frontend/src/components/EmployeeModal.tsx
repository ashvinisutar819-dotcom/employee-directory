import { ChangeEvent, FormEvent, useState } from "react";
import type { Employee, EmployeeInput } from "../types";
import Modal from "./Modal";

interface Props {
  employee: Employee | null;
  roles: string[];
  onClose: () => void;
  /** Resolves to an error message, or null when saved successfully. */
  onSave: (input: EmployeeInput) => Promise<string | null>;
}

type Errors = Partial<Record<keyof EmployeeInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, role }: EmployeeInput): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = "Name is required.";
  if (!email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!role.trim()) errors.role = "Role is required.";
  return errors;
}

export default function EmployeeModal({ employee, roles, onClose, onSave }: Props) {
  const [values, setValues] = useState<EmployeeInput>({
    name: employee?.name ?? "",
    email: employee?.email ?? "",
    role: employee?.role ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof EmployeeInput) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setServerError("");
    const message = await onSave({
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role.trim(),
    });
    if (message) setServerError(message);
    setSaving(false);
  };

  const field = (key: keyof EmployeeInput, label: string, placeholder: string, extra = {}) => (
    <label className={errors[key] ? "field has-error" : "field"}>
      <span>{label}</span>
      <input value={values[key]} onChange={handleChange(key)} placeholder={placeholder} {...extra} />
      {errors[key] && <small>{errors[key]}</small>}
    </label>
  );

  return (
    <Modal title={employee ? "Edit employee" : "Add employee"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {serverError && <div className="alert">{serverError}</div>}

        {field("name", "Full name", "Jane Doe", { autoFocus: true, maxLength: 100 })}
        {field("email", "Work email", "jane@company.com", { type: "email", maxLength: 255 })}
        {field("role", "Job role", "Software Engineer", { list: "role-options", maxLength: 100 })}
        <datalist id="role-options">
          {roles.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving..." : employee ? "Save changes" : "Add employee"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
