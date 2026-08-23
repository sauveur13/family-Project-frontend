import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import SearchInput from '../../components/ui/SearchInput';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import PersonCard from '../../components/family/PersonCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { personService, familyService } from '../../services';
import { DEFAULT_PAGE_SIZE, GENDERS } from '../../constants';

export default function FamilyMembersPage() {
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [generation, setGeneration] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  // Reset to first page whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, gender, generation]);

  const { data, loading, error, reload } = useAsync(
    () =>
      personService.list({
        search: debouncedSearch || undefined,
        gender: gender || undefined,
        generation: generation || undefined,
        page,
        limit: DEFAULT_PAGE_SIZE,
        sortBy: 'firstName',
      }),
    [debouncedSearch, gender, generation, page],
  );

  const generationsResult = useAsync(() => familyService.generations(), []);
  const generations = generationsResult.data?.generations || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Family Members</h1>
        <p className="mt-0.5 text-sm text-slate-500">Search and browse everyone in the family tree.</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by first, middle or last name…" />
        <Select
          aria-label="Filter by gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="sm:w-36"
        >
          <option value="">All genders</option>
          {GENDERS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by generation"
          value={generation}
          onChange={(e) => setGeneration(e.target.value)}
          className="sm:w-40"
        >
          <option value="">All generations</option>
          {generations.map((g) => (
            <option key={g.generation} value={g.generation}>
              Gen {g.generation} ({g.count})
            </option>
          ))}
        </Select>
      </div>

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState title="Unable to load family members" message={error.message} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          {data.data.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No family members found"
              description={
                search || gender || generation
                  ? 'Try adjusting your search or filters.'
                  : 'The family tree has no active members yet.'
              }
              action={
                (search || gender || generation) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setGender('');
                      setGeneration('');
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Clear filters
                  </button>
                )
              }
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {data.data.map((person) => (
                  <PersonCard key={person._id} person={person} />
                ))}
              </div>
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
