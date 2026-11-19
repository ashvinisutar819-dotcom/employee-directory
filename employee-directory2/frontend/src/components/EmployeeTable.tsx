import type { Employee, SortKey, SortOrder } from "../types";
import { avatarStyle, formatDate, hueStyle, initials } from "../utils";
import { Icon } from "./Icon";

interface Props {
  employees: Employee[];
  loading: boolean;
  sort: SortKey;
  order: SortOrder;
  onSort: (key: SortKey) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "created_at", label: "Added" },
];

const SKELETON_ROWS = 5;

export default function EmployeeTable({ employees, loading, sort, order, onSort, onEdit, onDelete }: Props) {
  const showSkeleton = loading && employees.length === 0;

  return (
    <div className={`table-wrap ${loading && !showSkeleton ? "is-loading" : ""}`}>
      <table>
        <thead>
          <tr>
            {COLUMNS.map(({ key, label }) => (
              <th key={key} aria-sort={sort === key ? (order === "asc" ? "ascending" : "descending") : "none"}>
                <button className="sort" onClick={() => onSort(key)}>
                  {label}
                  <span className={sort === key ? "arrow active" : "arrow"}>
                    <Icon name={sort === key && order === "asc" ? "up" : "down"} size={14} />
                  </span>
                </button>
              </th>
            ))}
            <th className="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {showSkeleton
            ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <tr key={i}>
                  <td>
                    <div className="person">
                      <span className="avatar skeleton" />
                      <div className="skeleton-lines">
                        <span className="skeleton line" />
                        <span className="skeleton line short" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="skeleton line" />
                  </td>
                  <td>
                    <span className="skeleton line" />
                  </td>
                  <td />
                </tr>
              ))
            : employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="person">
                      <span className="avatar" style={avatarStyle(emp.name)}>
                        {initials(emp.name)}
                      </span>
                      <div>
                        <div className="name">{emp.name}</div>
                        <a className="email" href={`mailto:${emp.email}`}>
                          {emp.email}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={hueStyle(emp.role)}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="muted">{formatDate(emp.created_at)}</td>
                  <td className="right">
                    <button className="icon-btn" aria-label={`Edit ${emp.name}`} title="Edit" onClick={() => onEdit(emp)}>
                      <Icon name="edit" />
                    </button>
                    <button
                      className="icon-btn danger"
                      aria-label={`Delete ${emp.name}`}
                      title="Delete"
                      onClick={() => onDelete(emp)}
                    >
                      <Icon name="trash" />
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
