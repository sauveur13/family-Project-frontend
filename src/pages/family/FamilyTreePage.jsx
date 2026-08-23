import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Network, UserSearch } from 'lucide-react';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import FamilyTreeView from '../../components/family/FamilyTreeView';
import PersonPickerModal from '../../components/family/PersonPickerModal';
import { useAsync } from '../../hooks/useAsync';
import { familyService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { MAX_TREE_DEPTH, INITIAL_TREE_DEPTH, ROUTES } from '../../constants';

export default function FamilyTreePage() {
  const { myPersonId } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);

  const rootPersonId = searchParams.get('person') || myPersonId;
  const isRootMine = !searchParams.get('person');

  const { data, loading, error, reload } = useAsync(
    () =>
      familyService
        .tree({
          rootPersonId: searchParams.get('person') || undefined,
          ancestorDepth: Number(searchParams.get('aDepth')) || INITIAL_TREE_DEPTH,
          descendantDepth: Number(searchParams.get('dDepth')) || INITIAL_TREE_DEPTH,
        })
        .then((res) => res.data),
    [rootPersonId, searchParams.get('person'), searchParams.get('aDepth'), searchParams.get('dDepth')],
  );

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    }
    setSearchParams(next);
  };

  const ancestorDepth = Number(searchParams.get('aDepth')) || INITIAL_TREE_DEPTH;
  const descendantDepth = Number(searchParams.get('dDepth')) || INITIAL_TREE_DEPTH;

  const headerActions = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
          <UserSearch className="h-4 w-4" aria-hidden="true" />
          Focus another member
        </Button>
      </div>
    ),
    [],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Family Tree</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Select any member to re-center the tree. Expand branches to explore generations.
          </p>
        </div>
        {headerActions}
      </div>

      {loading && (
        <PageLoader label="Loading family tree…" />
      )}

      {!loading && error && (
        <ErrorState
          title="We couldn't load the family tree"
          message={error.message}
          onRetry={reload}
        />
      )}

      {!loading && !error && data && (
        data.root ? (
          <FamilyTreeView
            data={data}
            rootPersonId={rootPersonId}
            isRootMine={isRootMine}
            onResetRoot={() => updateParams({ person: null })}
            ancestorDepth={ancestorDepth}
            descendantDepth={descendantDepth}
            maxDepth={MAX_TREE_DEPTH}
            onLoadMoreAncestors={() => updateParams({ aDepth: Math.min(ancestorDepth + 2, MAX_TREE_DEPTH) })}
            onLoadMoreDescendants={() => updateParams({ dDepth: Math.min(descendantDepth + 2, MAX_TREE_DEPTH) })}
          />
        ) : (
          <EmptyState
            icon={Network}
            title="Your family tree is empty"
            description={
              isRootMine
                ? 'You are not linked to any family member yet. An administrator can link your account.'
                : 'This member has no recorded relationships yet.'
            }
            action={
              <Link to={ROUTES.members} className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                Browse family members
              </Link>
            }
          />
        )
      )}

      <PersonPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(person) => {
          if (!person) return;
          if (person._id === myPersonId) {
            updateParams({ person: null });
          } else {
            updateParams({ person: person._id });
          }
        }}
      />
    </div>
  );
}

