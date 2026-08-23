import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  RotateCcw,
  Users,
} from 'lucide-react';
import { ROUTES } from '../../constants';
import { lifespan, shortName, assetUrl, initials } from '../../utils/format';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';
import TreeNode from './TreeNode';

function hasNodesAtDepth(node, depth) {
  if (!node) return false;
  if (node.depth >= depth) return true;
  return (node.children || []).some((child) => hasNodesAtDepth(child, depth));
}

function RootHero({ person }) {
  const navigate = useNavigate();
  const photo = person?.photo ? assetUrl(person.photo) : null;

  return (
    <div className="rounded-xl border border-primary-200 bg-gradient-to-b from-primary-50 to-white p-5 text-center shadow-sm">
      <button
        type="button"
        onClick={() => navigate(ROUTES.person(person._id))}
        className="mx-auto focus-visible:outline-none"
        aria-label={`View profile of ${shortName(person)}`}
      >
        <span className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-white ring-4 ring-primary-100">
          {photo ? (
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl font-bold uppercase">{initials(person)}</span>
          )}
        </span>
      </button>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{shortName(person)}</h3>
      <p className="text-sm text-slate-500">{lifespan(person)}</p>
    </div>
  );
}

function RelationQuickList({ title, persons }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        <Users className="h-4 w-4 text-primary-600" aria-hidden="true" />
        {title}
      </h4>
      {persons.length === 0 ? (
        <p className="text-sm text-slate-400">None recorded</p>
      ) : (
        <ul className="space-y-1.5">
          {persons.map((p) => (
            <li key={p._id}>
              <button
                type="button"
                onClick={() => navigate(ROUTES.person(p._id))}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
              >
                <span className="truncate font-medium text-slate-700">{shortName(p)}</span>
                <span className="ml-auto shrink-0 text-xs text-slate-400">{lifespan(p)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Responsive family tree:
 *  - Desktop (lg+): three-column ancestor / root / descendant layout.
 *  - Mobile/tablet: tabbed focused-person navigation.
 */
export default function FamilyTreeView({
  data,
  isRootMine,
  onResetRoot,
  ancestorDepth,
  descendantDepth,
  onLoadMoreAncestors,
  onLoadMoreDescendants,
  maxDepth,
}) {
  const [mobileTab, setMobileTab] = useState('overview');

  const relations = useMemo(() => {
    const direct = {
      parents: [],
      children: [],
    };
    if (data?.ancestors) direct.parents = data.ancestors.children || [];
    if (data?.descendants) direct.children = data.descendants.children || [];
    return direct;
  }, [data]);

  if (!data?.root) return null;

  const canLoadMoreAncestors =
    ancestorDepth < maxDepth && hasNodesAtDepth(data.ancestors, ancestorDepth - 1);
  const canLoadMoreDescendants =
    descendantDepth < maxDepth && hasNodesAtDepth(data.descendants, descendantDepth - 1);

  const ancestorsPanel = (
    <section aria-label="Ancestors">
      {relations.parents.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">
          No recorded ancestors within the loaded generations.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {relations.parents.map((parent) => (
              <TreeNode key={parent.key} node={parent} direction="ancestors" />
            ))}
          </ul>
        </>
      )}
      {canLoadMoreAncestors && (
        <Button variant="secondary" size="sm" fullWidth onClick={onLoadMoreAncestors} className="mt-3">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
          Load more generations
        </Button>
      )}
    </section>
  );

  const descendantsPanel = (
    <section aria-label="Descendants">
      {relations.children.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">
          No recorded descendants within the loaded generations.
        </p>
      ) : (
        <ul className="space-y-2">
          {relations.children.map((child) => (
            <TreeNode key={child.key} node={child} direction="descendants" />
          ))}
        </ul>
      )}
      {canLoadMoreDescendants && (
        <Button variant="secondary" size="sm" fullWidth onClick={onLoadMoreDescendants} className="mt-3">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
          Load more generations
        </Button>
      )}
    </section>
  );

  return (
    <div>
      {/* Desktop: three columns */}
      <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_360px_minmax(0,1fr)]">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Ancestors</h2>
          {ancestorsPanel}
        </div>
        <div className="min-w-0 space-y-4">
          <div className="sticky top-20 space-y-3">
            <RootHero person={data.root} />
            {!isRootMine && (
              <Button variant="secondary" size="sm" fullWidth onClick={onResetRoot}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Center on me
              </Button>
            )}
            {data.root.spouseNames?.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
                <Heart className="mb-1 h-4 w-4 text-rose-500" aria-hidden="true" />
                <p className="font-medium text-slate-700">Spouse{data.root.spouseNames.length > 1 ? 's' : ''}</p>
                <p className="text-slate-500">{data.root.spouseNames.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Descendants</h2>
          {descendantsPanel}
        </div>
      </div>

      {/* Mobile & tablet: tabbed focused view */}
      <div className="lg:hidden">
        <Tabs
          value={mobileTab}
          onChange={setMobileTab}
          tabs={[
            { value: 'overview', label: 'Overview' },
            { value: 'ancestors', label: 'Ancestors' },
            { value: 'descendants', label: 'Descendants' },
          ]}
          className="mb-4"
        />

        {mobileTab === 'overview' && (
          <div className="space-y-4">
            <RootHero person={data.root} />
            {!isRootMine && (
              <Button variant="secondary" size="sm" fullWidth onClick={onResetRoot}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Center on me
              </Button>
            )}
            <RelationQuickList title="Parents" persons={relations.parents} />
            <RelationQuickList title="Children" persons={relations.children} />
            {canLoadMoreAncestors && (
              <Button variant="secondary" size="sm" fullWidth onClick={onLoadMoreAncestors}>
                More ancestors
              </Button>
            )}
            {canLoadMoreDescendants && (
              <Button variant="secondary" size="sm" fullWidth onClick={onLoadMoreDescendants}>
                More descendants
              </Button>
            )}
          </div>
        )}

        {mobileTab === 'ancestors' && (
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            {ancestorsPanel}
          </div>
        )}

        {mobileTab === 'descendants' && (
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            {descendantsPanel}
          </div>
        )}
      </div>
    </div>
  );
}
