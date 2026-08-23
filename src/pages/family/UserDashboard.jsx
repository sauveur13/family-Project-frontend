import { Link } from 'react-router-dom';
import { Network, Users, Baby, HeartHandshake, UserRound } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import PersonCard from '../../components/family/PersonCard';
import { useAsync } from '../../hooks/useAsync';
import { user as fetchUserDashboard } from '../../services/dashboardService';
import { ROUTES } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard() {
  const { user, myPersonId } = useAuth();
  const { data, loading, error, reload } = useAsync(() => fetchUserDashboard());

  if (loading) return <PageLoader label="Loading your dashboard…" />;
  if (error) return <ErrorState title="Unable to load your dashboard" message={error.message} onRetry={reload} />;

  const { person, counts, recentMembers = [] } = data || {};
  const firstName = person?.firstName || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Welcome + primary action */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Welcome back, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Explore your ancestors, descendants and the growing family tree.
          </p>
        </div>
        <Link
          to={ROUTES.familyTree}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800"
        >
          <Network className="h-5 w-5" aria-hidden="true" />
          View Family Tree
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard icon={UserRound} label="My generation" value={person?.generation != null ? `Gen ${person.generation}` : '—'} to={ROUTES.familyTree} />
        <StatCard
          icon={Users}
          label="Family members"
          value={counts?.totalActiveMembers ?? 0}
          iconClass="bg-sky-50 text-sky-700"
          to={ROUTES.members}
        />
        <StatCard icon={Baby} label="Children" value={counts?.children ?? 0} iconClass="bg-violet-50 text-violet-700" to={ROUTES.familyTree} />
        <StatCard
          icon={HeartHandshake}
          label="Spouses"
          value={counts?.spouses ?? 0}
          iconClass="bg-rose-50 text-rose-700"
          to={ROUTES.familyTree}
        />
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to={ROUTES.ancestors}
          className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="font-semibold text-slate-800 group-hover:text-primary-700">My Ancestors</p>
          <p className="mt-0.5 text-sm text-slate-500">Parents, grandparents and beyond</p>
        </Link>
        <Link
          to={ROUTES.descendants}
          className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="font-semibold text-slate-800 group-hover:text-primary-700">My Descendants</p>
          <p className="mt-0.5 text-sm text-slate-500">Children, grandchildren and beyond</p>
        </Link>
      </div>

      {/* Recently added */}
      <section aria-label="Recently added members">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recently added members</h2>
          <Link to={ROUTES.members} className="text-sm font-medium text-primary-700 hover:text-primary-800">
            View all
          </Link>
        </div>
        {recentMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No family members yet"
            description="Once members are added you will see the newest ones here."
            action={
              <Link
                to={ROUTES.familyTree}
                className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
              >
                Open Family Tree
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recentMembers.map((member) => (
              <PersonCard key={member._id} person={member} />
            ))}
          </div>
        )}
      </section>

      {!myPersonId && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Your account is not linked to a family member profile yet. Ask an administrator for help.
        </p>
      )}
    </div>
  );
}
