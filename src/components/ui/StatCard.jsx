import { cx } from '../../utils/format';
import Skeleton from './Skeleton';

export default function StatCard({ icon: Icon, iconClass = 'bg-primary-50 text-primary-700', label, value, loading = false, to }) {
  const content = (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      {Icon && (
        <span className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', iconClass)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        {loading ? (
          <>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="mt-1.5 h-3 w-24" />
          </>
        ) : (
          <>
            <p className="truncate text-xl font-bold text-slate-900 sm:text-2xl">{value}</p>
            <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
          </>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <a href={to} className="focus-visible:outline-none">
        {content}
      </a>
    );
  }
  return content;
}
