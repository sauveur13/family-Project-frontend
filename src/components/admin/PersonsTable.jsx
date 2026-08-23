import { Link } from 'react-router-dom';
import { Eye, Pencil, Power } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import PersonAvatar from '../family/PersonAvatar';
import { ROUTES } from '../../constants';
import { fullName, lifespan } from '../../utils/format';

/**
 * Responsive person list: real table on md+, stacked cards below.
 * onToggleStatus(person) opens a confirmation dialog in the parent.
 */
export default function PersonsTable({ persons, onToggleStatus }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Member</th>
              <th scope="col" className="px-4 py-3 font-semibold">Lifespan</th>
              <th scope="col" className="px-4 py-3 font-semibold">Generation</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {persons.map((person) => (
              <tr key={person._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={ROUTES.person(person._id)} className="group flex items-center gap-3">
                    <PersonAvatar person={person} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-slate-800 group-hover:text-primary-700">
                        {fullName(person)}
                      </span>
                      <span className="text-xs capitalize text-slate-400">{person.gender}</span>
                    </span>
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{lifespan(person)}</td>
                <td className="px-4 py-3">{person.generation != null ? `Gen ${person.generation}` : '—'}</td>
                <td className="px-4 py-3">
                  {person.status === 'active' ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Deactivated</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={ROUTES.person(person._id)}
                      title="View profile"
                      aria-label={`View ${fullName(person)}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={ROUTES.editPerson(person._id)}
                      title="Edit member"
                      aria-label={`Edit ${fullName(person)}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(person)}
                      title={person.status === 'active' ? 'Deactivate member' : 'Restore member'}
                      aria-label={person.status === 'active' ? `Deactivate ${fullName(person)}` : `Restore ${fullName(person)}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {persons.map((person) => (
          <li key={person._id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-start gap-3">
              <PersonAvatar person={person} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{fullName(person)}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {lifespan(person)} · <span className="capitalize">{person.gender}</span> ·{' '}
                  {person.generation != null ? `Gen ${person.generation}` : 'No gen.'}
                </p>
                <div className="mt-1.5">
                  {person.status === 'active' ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Deactivated</Badge>}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <Link
                to={ROUTES.editPerson(person._id)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 !border !border-slate-300 !bg-white !text-slate-700"
                onClick={() => onToggleStatus(person)}
              >
                <Power className="h-3.5 w-3.5" aria-hidden="true" />
                {person.status === 'active' ? 'Deactivate' : 'Restore'}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
