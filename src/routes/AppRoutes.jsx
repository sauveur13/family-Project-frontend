import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from './guards';
import DashboardLayout from '../layouts/DashboardLayout';
import PageLoader from '../components/ui/PageLoader';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

const UserDashboard = lazy(() => import('../pages/family/UserDashboard'));
const FamilyTreePage = lazy(() => import('../pages/family/FamilyTreePage'));
const AncestorsPage = lazy(() => import('../pages/family/AncestorsPage'));
const DescendantsPage = lazy(() => import('../pages/family/DescendantsPage'));
const FamilyMembersPage = lazy(() => import('../pages/family/FamilyMembersPage'));
const PersonProfilePage = lazy(() => import('../pages/family/PersonProfilePage'));
const ProfilePage = lazy(() => import('../pages/family/ProfilePage'));

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminFamilyMembers = lazy(() => import('../pages/admin/AdminFamilyMembers'));
const AddPersonPage = lazy(() => import('../pages/admin/AddPersonPage'));
const EditPersonPage = lazy(() => import('../pages/admin/EditPersonPage'));
const AdminRelationshipsPage = lazy(() => import('../pages/admin/AdminRelationshipsPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminAuditLogsPage = lazy(() => import('../pages/admin/AdminAuditLogsPage'));

const NotFoundPage = lazy(() => import('../pages/errors/NotFoundPage'));
const ForbiddenPage = lazy(() => import('../pages/errors/ForbiddenPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/forbidden" element={<ForbiddenPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/family-tree" element={<FamilyTreePage />} />
            <Route path="/members" element={<FamilyMembersPage />} />
            <Route path="/family-member/:id" element={<PersonProfilePage />} />
            <Route path="/ancestors" element={<AncestorsPage />} />
            <Route path="/descendants" element={<DescendantsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/admin" element={<AdminRoute />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="family-members" element={<AdminFamilyMembers />} />
              <Route path="family-members/add" element={<AddPersonPage />} />
              <Route path="family-members/:id/edit" element={<EditPersonPage />} />
              <Route path="relationships" element={<AdminRelationshipsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
