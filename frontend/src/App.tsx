import { useCallback, useEffect, useState } from "react";
import { createEmployee, deleteEmployee, errorMessage, getEmployees, getMeta, updateEmployee } from "./api";
import ConfirmDialog from "./components/ConfirmDialog";
import EmployeeModal from "./components/EmployeeModal";
import EmployeeTable from "./components/EmployeeTable";
import { Icon } from "./components/Icon";
import Pagination from "./components/Pagination";
import StatCards from "./components/StatCards";
import Toasts from "./components/Toasts";
import { useDebounce, useTheme, useToasts } from "./hooks";
import type { Employee, EmployeeInput, EmployeeMeta, EmployeePage, SortKey, SortOrder } from "./types";

const PAGE_SIZE = 8;

/** null = closed, { employee: null } = add form, { employee } = edit form */
type ModalState = { employee: Employee | null } | null;

export default function App() {
  const { theme, toggle } = useTheme();
  const { toasts, push, dismiss } = useToasts();

  const [result, setResult] = useState<EmployeePage | null>(null);
  const [meta, setMeta] = useState<EmployeeMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [role, setRole] = useState("");
  const [sort, setSort] = useState<SortKey>("created_at");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<ModalState>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployees({ search: debouncedSearch, role, sort, order, page, limit: PAGE_SIZE });
      // If the last item on a page was removed, step back one page.
      if (data.page > data.totalPages) setPage(data.totalPages);
      else setResult(data);
      setLoadError("");
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, role, sort, order, page]);

  const loadMeta = useCallback(() => getMeta().then(setMeta).catch(() => undefined), []);
  const refresh = () => Promise.all([load(), loadMeta()]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => setPage(1), [debouncedSearch]);

  // Drop a role filter that no longer exists (e.g. its last employee was deleted).
  useEffect(() => {
    if (role && meta && !meta.roles.some((r) => r.role === role)) setRole("");
  }, [meta, role]);

  const closeModal = useCallback(() => setModal(null), []);

  const handleSave = async (input: EmployeeInput): Promise<string | null> => {
    try {
      if (modal?.employee) {
        await updateEmployee(modal.employee.id, input);
        push("success", `${input.name} was updated`);
      } else {
        await createEmployee(input);
        push("success", `${input.name} was added`);
      }
      setModal(null);
      await refresh();
      return null;
    } catch (err) {
      return errorMessage(err);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteEmployee(deleting.id);
      push("success", `${deleting.name} was deleted`);
      setDeleting(null);
      await refresh();
    } catch (err) {
      push("error", errorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (key === sort) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setOrder(key === "created_at" ? "desc" : "asc");
    }
    setPage(1);
  };

  const employees = result?.data ?? [];
  const hasFilters = Boolean(search || role);
  const isEmpty = !loading && !loadError && employees.length === 0;

  const clearFilters = () => {
    setSearch("");
    setRole("");
    setPage(1);
  };

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <div className="topbar">
            <div className="brand">
              <span className="logo">
                <Icon name="users" size={20} />
              </span>
              TeamHub
            </div>
            <button className="icon-btn ghost" onClick={toggle} aria-label="Toggle theme" title="Toggle theme">
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
          </div>

          <div className="hero-body">
            <div>
              <h1>Employee Directory</h1>
              <p>Everyone in your organisation, in one searchable place.</p>
            </div>
            <button className="btn light" onClick={() => setModal({ employee: null })}>
              <Icon name="plus" /> Add employee
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <StatCards meta={meta} />

        <section className="card panel">
          <div className="toolbar">
            <div className="search-box">
              <Icon name="search" />
              <input
                type="search"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search employees by name"
              />
            </div>

            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by role"
            >
              <option value="">All roles</option>
              {meta?.roles.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.role} ({r.count})
                </option>
              ))}
            </select>

            {hasFilters && (
              <button className="btn ghost-btn" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>

          {loadError && (
            <div className="alert">
              {loadError}{" "}
              <button className="link" onClick={load}>
                Retry
              </button>
            </div>
          )}

          {!loadError && !isEmpty && (
            <EmployeeTable
              employees={employees}
              loading={loading}
              sort={sort}
              order={order}
              onSort={handleSort}
              onEdit={(employee) => setModal({ employee })}
              onDelete={setDeleting}
            />
          )}

          {isEmpty && (
            <div className="empty">
              <span className="empty-icon">
                <Icon name={hasFilters ? "search" : "users"} size={28} />
              </span>
              <h3>{hasFilters ? "No matching employees" : "No employees yet"}</h3>
              <p>{hasFilters ? "Try a different search or clear the filters." : "Add your first employee to get started."}</p>
              {hasFilters ? (
                <button className="btn" onClick={clearFilters}>
                  Clear filters
                </button>
              ) : (
                <button className="btn primary" onClick={() => setModal({ employee: null })}>
                  <Icon name="plus" /> Add employee
                </button>
              )}
            </div>
          )}

          {result && result.total > 0 && !loadError && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          )}
        </section>
      </main>

      {modal && (
        <EmployeeModal
          employee={modal.employee}
          roles={meta?.roles.map((r) => r.role) ?? []}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
      {deleting && (
        <ConfirmDialog employee={deleting} busy={deleteBusy} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
      )}

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
