import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '../../constants';
import { lifespan, shortName } from '../../utils/format';
import Badge from '../ui/Badge';
import PersonAvatar from './PersonAvatar';

function PersonCard({ person }) {
  return (
    <Link
      to={ROUTES.person(person._id)}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-primary-300 hover:shadow-md focus-visible:outline-none sm:p-4"
    >
      <PersonAvatar person={person} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900 group-hover:text-primary-700">
          {shortName(person)}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span>{lifespan(person)}</span>
          {person.generation != null && (
            <Badge tone="primary" className="!px-1.5">
              Gen {person.generation}
            </Badge>
          )}
          {person.status === 'inactive' && <Badge tone="danger">Deactivated</Badge>}
        </div>
      </div>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600"
        aria-hidden="true"
      />
    </Link>
  );
}

export default memo(PersonCard);
