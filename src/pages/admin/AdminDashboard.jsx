import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Link2,
  ScrollText,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import PersonAvatar from '../../components/family/PersonAvatar';
import Skeleton from '../../components/ui/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { admin as fetchAdminDashboard } from '../../services/dashboardService';
import { ROUTES } from '../../constants';
import { fullName, relativeTime, lifespan } from '../../utils/format';

const ACTION_LABELS = {
  USER_REGISTERED: 'New user registered',
  PASSWORD_CHANGED: 'Password changed',
  PERSON_CREATED: 'Added family member',
  PERSON_UPDATED: 'Updated family member',
  PERSON_DEACTIVATED: 'Deactivated member',
  PERSON_RESTORED: 'Restored member',
  PERSON_PERMANENTLY_DELETED: 'Permanently deleted member',
  PERSON_PHOTO_UPDATED: 'Updated member photo',
  RELATIONSHIP_CREATED: 'Added relationship',
  RELATIONSHIP_UPDATED: 'Changed relationship',
  RELATIONSHIP_DELETED: 'Removed relationship',
  USER_UPDATED: 'Updated user account',
  USER_SUSPENDED: 'Suspended user',
};

export function actionLabel(action) {
  return ACTION_LABELS[action] || action;
}

const QUICK_ACTIONS = [
  { to: ROUTES.addMember, label: 'Add Family Member', icon: UserPlus },
  { to: ROUTES.adminRelationships, label: 'Manage Relationships', icon: Link2 },
  { to: ROUTES.adminUsers, label: 'Manage Users', icon: ShieldCheck },
  { to: ROUTES.adminAuditLogs, label: 'View Audit History', icon: ScrollText },
];

export default function AdminDashboard() {
  const { data, loading, error, reload } = useAsync(() => fetchAdminDashboard());

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
              <Skeleton className="h-11 w-11 rounded-lg" />
              <Skeleton className="mt-3 h-6 w-16" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState title="Unable to load the dashboard" message={error.message} onRetry={reload} />;

  const { stats, recentMembers = [], recentActivity = [] } = data;

  const statCards = [
    { icon: Users, label: 'Total Family Members', value: stats.totalFamilyMembers, to: ROUTES.adminMembers },
    { icon: ShieldCheck, label: 'Registered Users', value: stats.registeredUsers, to: ROUTES.adminUsers, iconClass: 'bg-sky-50 text-sky-700' },
    { icon: Link2, label: 'Total Relationships', value: stats.totalRelationships, to: ROUTES.adminRelationships, iconClass: 'bg-violet-50 text-violet-700' },
    { icon: ScrollText, label: 'Generations Recorded', value: stats.totalGenerations, to: ROUTES.members, iconClass: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Admin Overview</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {stats.activeMembers} active members · {stats.activeUsers} active users ·{' '}
            {stats.deactivatedMembers} deactivated
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 group-hover:text-primary-800">
              {label}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary-600" aria-hidden="true" />
          </Link>
        ))}
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-800">Recently added members</h2>
            <Link to={ROUTES.adminMembers} className="text-xs font-semibold text-primary-700 hover:text-primary-800">
              View all
            </Link>
          </header>
          {recentMembers.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No family members yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentMembers.map((person) => (
                <li key={person._id}>
                  <Link
                    to={ROUTES.person(person._id)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 sm:px-5"
                  >
                    <PersonAvatar person={person} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{fullName(person)}</p>
                      <p className="text-xs text-slate-500">{lifespan(person)}</p>
                    </div>
                    <Badge tone="neutral">{relativeTime(person.createdAt)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-800">Recent changes</h2>
            <Link to={ROUTES.adminAuditLogs} className="text-xs font-semibold text-primary-700 hover:text-primary-800">
              Full history
            </Link>
          </header>
          {recentActivity.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentActivity.map((entry) => (
                <li key={entry._id} className="px-4 py-3 sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-slate-800">{actionLabel(entry.action)}</p>
                    <Badge tone="info">{relativeTime(entry.timestamp)}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    by {entry.user?.email || 'system'}
                    {entry.targetType ? ` · ${entry.targetType.toLowerCase().replace('_', ' ')}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
