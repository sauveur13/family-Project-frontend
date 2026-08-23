import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldOff, ShieldCheck, UserX, Users } from 'lucide-react';
import SearchInput from '../../components/ui/SearchInput';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { userService } from '../../services';
import { getErrorMessage } from '../../services/api';
import { DEFAULT_PAGE_SIZE, ROUTES, USER_STATUS } from '../../constants';
import { formatDate, fullName } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null); // {user, kind: 'role'|'suspend'|'activate'}
  const [busy, setBusy] = useState(false);
  const debouncedSearch = useDebounce(search);

  useEffect(() => setPage(1), [debouncedSearch, statusFilter, roleFilter]);

  const { data, loading, error, reload } = useAsync(
    () =>
      userService.list({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        page,
        limit: DEFAULT_PAGE_SIZE,
      }),
    [debouncedSearch, statusFilter, roleFilter, page],
  );

  const isSelf = (u) => u.id === me?.id;

  const runConfirm = async () => {
    if (!confirmAction) return;
    const { user: target, kind } = confirmAction;
    setBusy(true);
    try {
      if (kind === 'role') {
        await userService.update(target.id, { role: target.role === 'admin' ? 'user' : 'admin' });
        toast.success(target.role === 'admin' ? 'Admin role removed' : 'Admin role granted');
      } else if (kind === 'suspend') {
        await userService.suspend(target.id);
        toast.success(`"${target.email}" suspended`);
      } else {
        await userService.update(target.id, { status: 'active' });
        toast.success('Account activated');
      }
      setConfirmAction(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirmAction(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Registered Users</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Manage accounts and roles. At least one active admin must always remain.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by email…" />
        <Select aria-label="Filter by role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </Select>
        <Select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {USER_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {loading && <PageLoader label="Loading users…" />}
      {!loading && error && <ErrorState title="Unable to load users" message={error.message} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          {(data.data || []).length === 0 ? (
            <EmptyState icon={Users} title="No users found" description="Try adjusting the filters." />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Linked member</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Role</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Joined</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((u) => (
                      <tr key={u.id} className={`hover:bg-slate-50 ${u.status !== 'active' ? 'opacity-70' : ''}`}>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {u.email}
                          {isSelf(u) && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {u.person ? (
                            <a href={ROUTES.person(u.person._id)} className="hover:text-primary-700">
                              {fullName(u.person)}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={u.role === 'admin' ? 'primary' : 'neutral'}>{u.role}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {u.status === 'active' ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Suspended</Badge>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={isSelf(u)}
                              onClick={() => setConfirmAction({ user: u, kind: 'role' })}
                              title={isSelf(u) ? "You can't change your own role" : u.role === 'admin' ? 'Remove admin role' : 'Make admin'}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-40"
                            >
                              {u.role === 'admin' ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                            </button>
                            {u.status === 'active' ? (
                              <button
                                type="button"
                                disabled={isSelf(u)}
                                onClick={() => setConfirmAction({ user: u, kind: 'suspend' })}
                                title={isSelf(u) ? "You can't suspend your own account" : 'Suspend account'}
                                className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ user: u, kind: 'activate' })}>
                                Activate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="space-y-3 md:hidden">
                {data.data.map((u) => (
                  <li key={u.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="break-all font-medium text-slate-900">
                      {u.email}
                      {isSelf(u) && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={u.role === 'admin' ? 'primary' : 'neutral'}>{u.role}</Badge>
                      {u.status === 'active' ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Suspended</Badge>}
                      {u.person && <Badge tone="info">{fullName(u.person)}</Badge>}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">Joined {formatDate(u.createdAt)}</p>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 !border !border-slate-300 !bg-white !text-slate-700"
                        disabled={isSelf(u)}
                        onClick={() => setConfirmAction({ user: u, kind: 'role' })}
                      >
                        {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      {u.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 !text-red-600"
                          disabled={isSelf(u)}
                          onClick={() => setConfirmAction({ user: u, kind: 'suspend' })}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" className="flex-1" onClick={() => setConfirmAction({ user: u, kind: 'activate' })}>
                          Activate
                        </Button>
                      )}
                    </div>
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

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={runConfirm}
        isLoading={busy}
        danger={confirmAction?.kind !== 'activate' && confirmAction?.kind !== 'role'}
        title={
          confirmAction?.kind === 'role'
            ? confirmAction.user.role === 'admin'
              ? 'Remove admin role?'
              : 'Grant admin role?'
            : confirmAction?.kind === 'suspend'
              ? 'Suspend this account?'
              : 'Activate this account?'
        }
        confirmLabel={
          confirmAction?.kind === 'role'
            ? confirmAction.user.role === 'admin'
              ? 'Remove Role'
              : 'Make Admin'
            : confirmAction?.kind === 'suspend'
              ? 'Suspend'
              : 'Activate'
        }
        message={
          confirmAction?.kind === 'role'
            ? `Change the role of "${confirmAction?.user?.email}"? ${confirmAction?.user?.role === 'admin' ? 'They will lose admin access.' : 'They will gain full admin access.'}`
            : confirmAction?.kind === 'suspend'
              ? `Suspend "${confirmAction?.user?.email}"? They will be logged out and unable to sign in until reactivated.`
              : `Reactivate "${confirmAction?.user?.email}" so they can log in again?`
        }
      />
    </div>
  );
}
