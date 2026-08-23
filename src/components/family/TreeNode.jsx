import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Heart } from 'lucide-react';
import { ROUTES } from '../../constants';
import { cx, lifespan, shortName } from '../../utils/format';
import PersonAvatar from './PersonAvatar';

/**
 * Recursive collapsible node for ancestor/descendant trees.
 * direction: 'ancestors' renders children as "parents", 'descendants' as children.
 */
function TreeNode({ node, direction, defaultExpanded = true }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasBranches = (node.children?.length || 0) > 0;

  return (
    <li>
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Collapse branch' : 'Expand branch'}
          aria-expanded={expanded}
          className={cx(
            'mt-1 rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600',
            !hasBranches && 'invisible',
          )}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate(ROUTES.person(node._id))}
          className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-sm transition-colors hover:border-primary-300 sm:px-3 sm:py-2"
        >
          <PersonAvatar person={node} size="xs" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-800 group-hover:text-primary-700">
              {shortName(node)}
              {node.dateOfDeath && (
                <span title="Deceased" aria-label="deceased" className="ml-1 text-slate-400">
                  ✝
                </span>
              )}
            </span>
            <span className="block text-xs text-slate-500">
              {lifespan(node)}
              {node.spouseNames?.length > 0 && (
                <>
                  {' '}
                  <Heart className="mb-0.5 inline h-3 w-3 text-rose-400" aria-label="married to" />
                  {node.spouseNames.join(', ')}
                </>
              )}
            </span>
          </span>
        </button>
      </div>

      {hasBranches && expanded && (
        <ul className="ml-4 mt-1.5 space-y-1.5 border-l-2 border-slate-100 pl-3 sm:ml-5">
          {node.children.map((child) => (
            <TreeNode key={`${child.key}-${direction}`} node={child} direction={direction} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default memo(TreeNode);
