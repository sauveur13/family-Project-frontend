import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../utils/format';

function pageWindow(page, totalPages) {
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
}

export default function Pagination({ page, totalPages, total, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    if (!total) return null;
    return (
      <p className="py-2 text-center text-xs text-slate-500">
        {total} result{total === 1 ? '' : 's'}
      </p>
    );
  }

  const btn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none';

  return (
    <nav className="flex flex-col items-center gap-3 py-3 sm:flex-row sm:justify-between" aria-label="Pagination">
      <p className="text-xs text-slate-500">
        Page <span className="font-semibold text-slate-700">{page}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalPages}</span>
        {typeof total === 'number' && <> · {total} results</>}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cx(btn, 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50')}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="hidden items-center gap-1.5 sm:flex">
          {pageWindow(page, totalPages).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cx(
                btn,
                p === page
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="text-sm font-medium text-slate-600 sm:hidden">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cx(btn, 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50')}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
