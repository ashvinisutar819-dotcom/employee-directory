import { Icon } from "./Icon";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

/** Up to 5 page numbers centred around the current page. */
function pageWindow(page: number, totalPages: number): number[] {
  const size = Math.min(5, totalPages);
  const start = Math.min(Math.max(page - Math.floor(size / 2), 1), totalPages - size + 1);
  return Array.from({ length: size }, (_, i) => start + i);
}

export default function Pagination({ page, totalPages, total, pageSize, onChange }: Props) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="muted">
        Showing {from}–{to} of {total}
      </span>
      <div className="pages">
        <button className="icon-btn" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <Icon name="left" />
        </button>
        {pageWindow(page, totalPages).map((p) => (
          <button key={p} className={p === page ? "page active" : "page"} onClick={() => onChange(p)}>
            {p}
          </button>
        ))}
        <button
          className="icon-btn"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          <Icon name="right" />
        </button>
      </div>
    </div>
  );
}
