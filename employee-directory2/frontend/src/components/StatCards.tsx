import type { EmployeeMeta } from "../types";
import { Icon, IconName } from "./Icon";

interface Props {
  meta: EmployeeMeta | null;
}

export default function StatCards({ meta }: Props) {
  const top = meta?.roles[0];

  const cards: { icon: IconName; label: string; value: string | number; hint: string; tone: string }[] = [
    { icon: "users", label: "Total employees", value: meta?.total ?? "–", hint: "across all roles", tone: "indigo" },
    { icon: "briefcase", label: "Unique roles", value: meta?.roles.length ?? "–", hint: "job titles in use", tone: "violet" },
    { icon: "spark", label: "New this week", value: meta?.recent ?? "–", hint: "joined in the last 7 days", tone: "emerald" },
    { icon: "star", label: "Most common role", value: top?.role ?? "–", hint: top ? `${top.count} employee${top.count === 1 ? "" : "s"}` : "no data yet", tone: "amber" },
  ];

  return (
    <section className="stats">
      {cards.map((c) => (
        <article key={c.label} className="stat">
          <span className={`stat-icon ${c.tone}`}>
            <Icon name={c.icon} size={22} />
          </span>
          <div>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-hint">{c.hint}</div>
          </div>
        </article>
      ))}
    </section>
  );
}
