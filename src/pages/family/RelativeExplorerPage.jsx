import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, UserSearch, Users } from 'lucide-react';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import TreeNode from '../../components/family/TreeNode';
import PersonPickerModal from '../../components/family/PersonPickerModal';
import PersonAvatar from '../../components/family/PersonAvatar';
import { useAsync } from '../../hooks/useAsync';
import { familyService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';
import { lifespan, shortName } from '../../utils/format';

const MAX_DEPTH = 10;
const LABELS = {
  ancestors: { 1: 'Parents', 2: 'Grandparents' },
  descendants: { 1: 'Children', 2: 'Grandchildren', 3: 'Great-grandchildren' },
};

function groupLabel(direction, distance) {
  const known = LABELS[direction][distance];
  if (known) return known;
  const greats = 'Great-'.repeat(Math.max(0, distance - 2));
  return direction === 'ancestors' ? `${greats}grandparents` : `${greats}grandchildren`;
}

/** Shared explorer powering both /ancestors and /descendants pages. */
export default function RelativeExplorerPage({ direction }) {
  const isAncestors = direction === 'ancestors';
  const { myPersonId } = useAuth();
  const navigate = useNavigate();
  const [rootId, setRootId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [depth, setDepth] = useState(4);
  const [viewMode, setViewMode] = useState('tree');

  useEffect(() => {
    if (myPersonId && !rootId) setRootId(myPersonId);
  }, [myPersonId, rootId]);

  const effectiveRoot = rootId || myPersonId;
  const { data: tree, loading, error, reload } = useAsync(
    () => familyService[isAncestors ? 'ancestors' : 'descendants'](effectiveRoot, depth),
    [effectiveRoot, depth],
  );

  const byGeneration = useMemo(() => {
    if (!tree) return [];
    const groups = new Map();
    const walk = (node) => {
      for (const child of node.children || []) {
        const d = node.depth + 1;
        if (!groups.has(d)) groups.set(d, []);
        groups.get(d).push(child);
        walk(child);
      }
    };
    walk(tree);
    return Array.from(groups.entries())
      .sort((a, b) => (isAncestors ? b[0] - a[0] : a[0] - b[0]))
      .map(([d, persons]) => ({ depth: d, label: groupLabel(direction, d), persons }));
  }, [tree, isAncestors, direction]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {isAncestors ? 'My Ancestors' : 'My Descendants'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Tracing {isAncestors ? 'upward' : 'downward'} from{' '}
            <span className="font-medium text-slate-700">{tree ? shortName(tree) : 'you'}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
            <UserSearch className="h-4 w-4" aria-hidden="true" />
            Choose member
          </Button>
          {effectiveRoot !== myPersonId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRootId(myPersonId);
                setDepth(4);
              }}
            >
              Back to me
            </Button>
          )}
        </div>
      </div>

      <Tabs
        value={viewMode}
        onChange={setViewMode}
        tabs={[
          { value: 'tree', label: 'Tree view' },
          { value: 'generations', label: 'By generation' },
        ]}
        className="max-w-xs"
      />

      {loading && <PageLoader label={`Loading ${direction}…`} />}
      {!loading && error && <ErrorState title={`Unable to load ${direction}`} message={error.message} onRetry={reload} />}

      {!loading && !error && tree && (
        <>
          {viewMode === 'tree' ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
              <button
                type="button"
                onClick={() => navigate(ROUTES.person(tree._id))}
                className="mb-3 flex w-full items-center gap-3 rounded-lg border border-primary-200 bg-primary-50/50 p-3 text-left hover:border-primary-300"
              >
                <PersonAvatar person={tree} size="md" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">{shortName(tree)}</span>
                  <span className="text-xs text-slate-500">{lifespan(tree)}</span>
                </span>
                <span className="ml-auto shrink-0 rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Focus
                </span>
              </button>

              {(tree.children || []).length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={`No ${direction} recorded`}
                  description={
                    isAncestors
                      ? 'No parents have been linked to this member yet.'
                      : 'No children have been linked to this member yet.'
                  }
                />
              ) : (
                <ul className="space-y-2">
                  {tree.children.map((child) => (
                    <TreeNode key={child.key} node={child} direction={direction} />
                  ))}
                </ul>
              )}

              {depth < MAX_DEPTH && (tree.children || []).length > 0 && (
                <Button variant="secondary" size="sm" fullWidth onClick={() => setDepth((d) => d + 3)} className="mt-4">
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  Load more generations
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {byGeneration.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={`No ${direction} recorded`}
                  description={
                    isAncestors
                      ? 'Parents have not been added for this member yet.'
                      : 'Children have not been added for this member yet.'
                  }
                />
              ) : (
                byGeneration.map(({ depth: genDepth, label, persons }) => (
                  <section key={genDepth} aria-label={label}>
                    <h2 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700">
                        {isAncestors ? `+${genDepth}` : `−${genDepth}`}
                      </span>
                      {label}
                      <span className="ml-auto text-xs font-normal text-slate-400">{persons.length}</span>
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {persons.map((person) => (
                        <button
                          key={`${person.key}-${genDepth}`}
                          type="button"
                          onClick={() => navigate(ROUTES.person(person._id))}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                        >
                          <PersonAvatar person={person} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-slate-800">{shortName(person)}</span>
                            <span className="text-xs text-slate-500">{lifespan(person)}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          )}
        </>
      )}

      <PersonPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(person) => setRootId(person._id)} />
    </div>
  );
}
