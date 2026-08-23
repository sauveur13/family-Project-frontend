import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Link2,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  ScrollText,
  ShieldCheck,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';
import { cx, shortName } from '../utils/format';
import toast from 'react-hot-toast';

const MAIN_NAV = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: Home },
  { to: ROUTES.familyTree, label: 'Family Tree', icon: Network },
  { to: ROUTES.members, label: 'Members', icon: Users },
];

const ACCOUNT_NAV = [{ to: ROUTES.profile, label: 'My Profile', icon: User }];

const ADMIN_NAV = [
  { to: ROUTES.adminDashboard, label: 'Overview', icon: LayoutDashboard },
  { to: ROUTES.adminMembers, label: 'Family Members', icon: UserPlus },
  { to: ROUTES.adminRelationships, label: 'Relationships', icon: Link2 },
  { to: ROUTES.adminUsers, label: 'Users', icon: Users },
  { to: ROUTES.adminAuditLogs, label: 'Audit Logs', icon: ScrollText },
];

function Brand() {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700 text-white">
        <Network className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-base font-bold text-slate-900">
        Family<span className="text-primary-700">Tree</span>
      </span>
    </div>
  );
}

function NavSection({ title, items, onNavigate }) {
  return (
    <div className="mb-5">
      <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === ROUTES.dashboard}
              onClick={onNavigate}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SidebarContent({ isAdmin, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate(ROUTES.login);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-4 pt-5 sm:px-6">
        <Brand />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main navigation">
        <NavSection title="Main" items={MAIN_NAV} onNavigate={onNavigate} />
        <NavSection title="Account" items={ACCOUNT_NAV} onNavigate={onNavigate} />
        {isAdmin && (
          <>
            <div className="my-2 border-t border-slate-100" />
            <NavSection title="Administration" items={ADMIN_NAV} onNavigate={onNavigate} />
          </>
        )}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold uppercase text-primary-800">
            {user?.email?.[0] || '?'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">{shortName({ firstName: user?.email })}</p>
            <p className="flex items-center gap-1 text-xs capitalize text-slate-500">
              {isAdmin && <ShieldCheck className="h-3 w-3 text-primary-600" aria-hidden="true" />}
              {user?.role || 'user'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const BOTTOM_NAV = [
  { to: ROUTES.dashboard, label: 'Home', icon: Home },
  { to: ROUTES.familyTree, label: 'Tree', icon: Network },
  { to: ROUTES.members, label: 'Members', icon: Users },
];

export default function DashboardLayout() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <SidebarContent isAdmin={isAdmin} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-slate-900/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl" aria-label="Menu">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent isAdmin={isAdmin} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Brand />
        <span className="w-10" aria-hidden="true" />
      </header>

      {/* Main content */}
      <main className="pb-20 lg:pb-8 lg:pl-64 lg:pt-0 pt-14 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white lg:hidden"
        aria-label="Bottom navigation"
      >
        {BOTTOM_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.dashboard}
            className={({ isActive }) =>
              cx(
                'flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium',
                isActive ? 'text-primary-700' : 'text-slate-500',
              )
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-slate-500"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          More
        </button>
      </nav>
    </div>
  );
}
