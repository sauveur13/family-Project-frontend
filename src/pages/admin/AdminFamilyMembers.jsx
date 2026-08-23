import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Users } from 'lucide-react';
import SearchInput from '../../components/ui/SearchInput';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PersonsTable from '../../components/admin/PersonsTable';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { personService, familyService } from '../../services';
import { getErrorMessage } from '../../services/api';
import { DEFAULT_PAGE_SIZE, GENDERS, PERSON_STATUS, ROUTES } from '../../constants';
import { fullName } from '../../utils/format';

export default function AdminFamilyMembers() {
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [generation, setGeneration] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [busy, setBusy] = useState(false);
  const debouncedSearch = useDebounce(search);

  useEffect(() => setPage(1), [debouncedSearch, gender, generation, status]);

  const { data, loading, error, reload } = useAsync(
    () =>
      personService.list({
        search: debouncedSearch || undefined,
        gender: gender || undefined,
        generation: generation || undefined,
        status: status || undefined,
        page,
        limit: DEFAULT_PAGE_SIZE,
        sortBy: '-createdAt',
      }),
    [debouncedSearch, gender, generation, status, page],
  );

  const generationsResult = useAsync(() => familyService.generations(), []);
  const generations = generationsResult.data?.generations || [];

  const toggleStatus = async () => {
    if (!confirmToggle) return;
    setBusy(true);
    try {
      if (confirmToggle.status === 'active') {
        await personService.deactivate(confirmToggle._id);
        toast.success(`"${fullName(confirmToggle)}" deactivated. History is preserved.`);
      } else {
        await personService.restore(confirmToggle._id);
        toast.success(`"${fullName(confirmToggle)}" restored.`);
      }
      setConfirmToggle(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Family Members</h1>
          <p className="mt-0.5 text-sm text-slate-500">Add, edit and manage everyone in the tree.</p>
        </div>
        <Link
          to={ROUTES.addMember}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Family Member
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name…" />
        <Select aria-label="Filter by gender" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">All genders</option>
          {GENDERS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </Select>
        <Select aria-label="Filter by generation" value={generation} onChange={(e) => setGeneration(e.target.value)}>
          <option value="">All generations</option>
          {generations.map((g) => (
            <option key={g.generation} value={g.generation}>
              Gen {g.generation} ({g.count})
            </option>
          ))}
        </Select>
        <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {PERSON_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {loading && <PageLoader label="Loading members…" />}
      {!loading && error && <ErrorState title="Unable to load family members" message={error.message} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          {(data.data || []).length === 0 ? (
            <EmptyState
              icon={Users}
              title="No family members found"
              description="Try adjusting the filters or add your first family member."
              action={
                <Link
                  to={ROUTES.addMember}
                  className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
                >
                  Add Family Member
                </Link>
              }
            />
          ) : (
            <>
              <PersonsTable persons={data.data} onToggleStatus={setConfirmToggle} />
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
        open={Boolean(confirmToggle)}
        onClose={() => setConfirmToggle(null)}
        onConfirm={toggleStatus}
        isLoading={busy}
        danger={confirmToggle?.status === 'active'}
        title={confirmToggle?.status === 'active' ? 'Deactivate member?' : 'Restore member?'}
        confirmLabel={confirmToggle?.status === 'active' ? 'Deactivate' : 'Restore'}
        message={
          confirmToggle?.status === 'active'
            ? `Are you sure you want to deactivate "${fullName(confirmToggle)}"? Their profile and connections will be hidden but preserved for history.`
            : `Restore "${fullName(confirmToggle)}" to the active family tree?`
        }
      />
    </div>
  );
}
