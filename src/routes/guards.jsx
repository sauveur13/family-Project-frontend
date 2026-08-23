import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from '../components/ui/PageLoader';
import { ROUTES } from '../constants';

/** UX-only gate; the backend enforces real authorization. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <PageLoader label="Checking your session…" />;
  if (status !== 'authenticated') {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

export function AdminRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to={ROUTES.forbidden} replace />;
  return <Outlet />;
}

export function PublicOnlyRoute({ children }) {
  const { status } = useAuth();
  if (status === 'loading') return <PageLoader label="Loading…" />;
  if (status === 'authenticated') return <Navigate to={ROUTES.dashboard} replace />;
  return children;
}
