import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Baby,
  Briefcase,
  CalendarDays,
  HeartHandshake,
  MapPin,
  Pencil,
  Power,
  UserRound,
  Users,
} from 'lucide-react';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PersonAvatar from '../../components/family/PersonAvatar';
import { useAsync } from '../../hooks/useAsync';
import { personService } from '../../services';
import { getErrorMessage } from '../../services/api';
import { ROUTES } from '../../constants';
import { calcAge, formatDate, fullName, lifespan } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm text-slate-800">{children}</p>
      </div>
    </div>
  );
}

function RelationSection({ title, icon: Icon, persons }) {
  const hasAny = persons.length > 0;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" />
        {title}
        <span className="ml-auto text-xs font-normal text-slate-400">{persons.length}</span>
      </h2>
      {!hasAny ? (
        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-400">None recorded</p>
      ) : (
        <ul className="space-y-1.5">
          {persons.map((person) => (
            <li key={person._id}>
              <Link
                to={ROUTES.person(person._id)}
                className="group flex items-center gap-3 rounded-lg p-1.5 hover:bg-slate-50"
              >
                <PersonAvatar person={person} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800 group-hover:text-primary-700">
                    {fullName(person)}
                  </span>
                  <span className="text-xs text-slate-500">{lifespan(person)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function PersonProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [confirmStatus, setConfirmStatus] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const { data, loading, error, reload } = useAsync(async () => {
    const [person, relations] = await Promise.all([
      personService.get(id),
      personService.relations(id).catch(() => ({ parents: [], spouses: [], children: [] })),
    ]);
    return { person, relations };
  }, [id]);

  if (loading) return <PageLoader label="Loading profile…" />;
  if (error) {
    return (
      <ErrorState
        title="Family member not found"
        message={error.message}
        onRetry={reload}
      />
    );
  }

  const { person, relations } = data;
  const age = calcAge(person.dateOfBirth, person.dateOfDeath);

  const toggleStatus = async () => {
    setStatusBusy(true);
    try {
      if (person.status === 'active') {
        await personService.deactivate(person._id);
        toast.success('Member deactivated');
      } else {
        await personService.restore(person._id);
        toast.success('Member restored');
      }
      setConfirmStatus(false);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Link
        to={ROUTES.members}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to members
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <PersonAvatar person={person} size="xl" className="mx-auto ring-slate-100 sm:mx-0" />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{fullName(person)}</h1>
            {person.generation != null && <Badge tone="primary">Gen {person.generation}</Badge>}
            {person.status !== 'active' && <Badge tone="danger">Deactivated</Badge>}
          </div>
          <p className="mt-1 text-sm capitalize text-slate-500">
            {person.gender} · {lifespan(person)}
            {age != null && <> · {age} years old</>}
          </p>
          {isAdmin && (
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.editPerson(person._id))}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit Member
              </Button>
              <Button
                variant={person.status === 'active' ? 'ghost' : 'primary'}
                size="sm"
                onClick={() => setConfirmStatus(true)}
              >
                <Power className="h-4 w-4" aria-hidden="true" />
                {person.status === 'active' ? 'Deactivate' : 'Restore'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Facts */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {person.dateOfBirth && (
          <Fact icon={CalendarDays} label="Date of birth">
            {formatDate(person.dateOfBirth)}
          </Fact>
        )}
        {person.placeOfBirth && (
          <Fact icon={MapPin} label="Place of birth">
            {person.placeOfBirth}
          </Fact>
        )}
        {person.dateOfDeath && (
          <Fact icon={CalendarDays} label="Date of death">
            {formatDate(person.dateOfDeath)}
          </Fact>
        )}
        {person.placeOfDeath && (
          <Fact icon={MapPin} label="Place of death">
            {person.placeOfDeath}
          </Fact>
        )}
        {person.occupation && (
          <Fact icon={Briefcase} label="Occupation">
            {person.occupation}
          </Fact>
        )}
        {!person.occupation && !person.dateOfBirth && !person.placeOfBirth && (
          <Fact icon={UserRound} label="Details">
            Limited historical information is available for this member.
          </Fact>
        )}
      </div>

      {/* Biography */}
      {person.biography && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Biography</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{person.biography}</p>
        </section>
      )}

      {/* Relations */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RelationSection title="Parents" icon={Users} persons={relations.parents} />
        <RelationSection title="Spouses" icon={HeartHandshake} persons={relations.spouses} />
        <RelationSection title="Children" icon={Baby} persons={relations.children} />
      </div>

      <ConfirmDialog
        open={confirmStatus}
        onClose={() => setConfirmStatus(false)}
        onConfirm={toggleStatus}
        isLoading={statusBusy}
        title={person.status === 'active' ? 'Deactivate member?' : 'Restore member?'}
        confirmLabel={person.status === 'active' ? 'Deactivate' : 'Restore'}
        danger={person.status === 'active'}
        message={
          person.status === 'active'
            ? `Deactivate "${fullName(person)}"? Their profile will be hidden from the tree but all history is preserved.`
            : `Restore "${fullName(person)}" to the active family tree?`
        }
      />
    </div>
  );
}
