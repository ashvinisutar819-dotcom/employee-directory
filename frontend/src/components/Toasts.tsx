import type { Toast } from "../types";
import { Icon } from "./Icon";

interface Props {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export default function Toasts({ toasts, onDismiss }: Props) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => onDismiss(t.id)}>
          <Icon name={t.type === "success" ? "check" : "alert"} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
