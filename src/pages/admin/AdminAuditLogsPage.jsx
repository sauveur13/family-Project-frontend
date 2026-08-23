import { Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, ScrollText } from 'lucide-react';
import Select from '../../components/ui/Select';
import SearchInput from '../../components/ui/SearchInput';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { auditService } from '../../services';
import { formatDateTime } from '../../utils/format';

const TARGET_TYPES = ['PERSON', 'RELATIONSHIP', 'USER', 'AUTH'];

function DetailsBlock({ entry }) {
  const hasDetails = entry.oldValue != null || entry.newValue != null;
  if (!hasDetails) return <p className="text-xs text-slate-400">No details recorded.</p>;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entry.oldValue != null && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Before</p>
          <pre className="max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
            {JSON.stringify(entry.oldValue, null, 2)}
          </pre>
        </div>
      )}
      {entry.newValue != null && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">After</p>
          <pre className="max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
            {JSON.stringify(entry.newValue, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [targetType, setTargetType] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => setPage(1), [debouncedSearch, targetType]);

  const { data, loading, error, reload } = useAsync(
    () =>
      auditService.list({
        search: debouncedSearch || undefined,
        targetType: targetType || undefined,
        page,
        limit: 15,
      }),
    [debouncedSearch, targetType, page],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Audit History</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Every administrative change to family data is recorded here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by action…" />
        <Select aria-label="Filter by target" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
          <option value="">All targets</option>
          {TARGET_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </div>

      {loading && <PageLoader label="Loading audit history…" />}
      {!loading && error && <ErrorState title="Unable to load audit logs" message={error.message} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          {(data.data || []).length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="No audit entries found"
              description="Changes made by administrators will appear here."
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">When</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Actor</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Action</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Target</th>
                      <th scope="col" className="w-10 px-4 py-3" aria-label="Expand details" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((entry) => (
                      <Fragment key={entry._id}>
                        <tr className="cursor-pointer hover:bg-slate-50" onClick={() => setExpandedId(expandedId === entry._id ? null : entry._id)}>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(entry.timestamp)}</td>
                          <td className="max-w-[200px] truncate px-4 py-3 text-slate-700">{entry.user?.email || 'system'}</td>
                          <td className="px-4 py-3">
                            <Badge tone={entry.action.includes('DELET') ? 'danger' : entry.action.includes('CREAT') ? 'success' : 'info'}>
                              {entry.action.replaceAll('_', ' ').toLowerCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 capitalize text-slate-500">{entry.targetType.toLowerCase()}</td>
                          <td className="px-4 py-3 text-right">
                            {expandedId === entry._id ? (
                              <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                            )}
                          </td>
                        </tr>
                        {expandedId === entry._id && (
                          <tr className="bg-slate-50/60">
                            <td colSpan={5} className="px-4 py-3">
                              <DetailsBlock entry={entry} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="space-y-3 md:hidden">
                {data.data.map((entry) => (
                  <li key={entry._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <button type="button" className="w-full text-left" onClick={() => setExpandedId(expandedId === entry._id ? null : entry._id)}>
                      <div className="flex items-start justify-between gap-2">
                        <Badge tone={entry.action.includes('DELET') ? 'danger' : entry.action.includes('CREAT') ? 'success' : 'info'}>
                          {entry.action.replaceAll('_', ' ').toLowerCase()}
                        </Badge>
                        <span className="shrink-0 text-xs text-slate-400">{formatDateTime(entry.timestamp)}</span>
                      </div>
                      <p className="mt-1.5 truncate text-xs text-slate-500">by {entry.user?.email || 'system'}</p>
                    </button>
                    {expandedId === entry._id && (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <DetailsBlock entry={entry} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
