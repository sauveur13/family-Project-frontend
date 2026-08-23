import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PersonAvatar from '../../components/family/PersonAvatar';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import { getErrorMessage } from '../../services/api';
import { ROUTES } from '../../constants';

export default function ProfilePage() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (field) => (event) => {
    setPasswords((p) => ({ ...p, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!passwords.current) nextErrors.current = 'Current password is required';
    if (passwords.next.length < 8) nextErrors.next = 'New password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(passwords.next) || !/[0-9]/.test(passwords.next))
      nextErrors.next = 'Use both letters and numbers';
    if (passwords.confirm !== passwords.next) nextErrors.confirm = 'Passwords do not match';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(passwords.current, passwords.next);
      toast.success('Password changed successfully');
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to change password'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">My Profile</h1>
        <p className="mt-0.5 text-sm text-slate-500">Account details and security.</p>
      </div>

      {/* Account card */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <UserRound className="h-4 w-4 text-primary-600" aria-hidden="true" />
          Account
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <dt className="w-24 shrink-0 font-medium text-slate-500">Email</dt>
            <dd className="truncate text-slate-800">{user?.email}</dd>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <dt className="w-24 shrink-0 font-medium text-slate-500">Role</dt>
            <dd>
              <Badge tone={user?.role === 'admin' ? 'primary' : 'neutral'}>{user?.role}</Badge>
            </dd>
          </div>
        </dl>

        {user?.personId && (
          <Link
            to={ROUTES.person(user.personId)}
            className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-primary-300"
          >
            <PersonAvatar person={{ firstName: user.email[0], lastName: '' }} size="sm" />
            <span className="text-sm">
              <span className="block font-medium text-slate-800">View my family member profile</span>
              <span className="text-xs text-slate-500">See how you appear in the family tree</span>
            </span>
          </Link>
        )}
      </section>

      {/* Change password */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <KeyRound className="h-4 w-4 text-primary-600" aria-hidden="true" />
          Change password
        </h2>
        <form onSubmit={handleChangePassword} noValidate className="space-y-4">
          <Input
            label="Current password"
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            value={passwords.current}
            onChange={setField('current')}
            error={errors.current}
            required
          />
          <Input
            label="New password"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            value={passwords.next}
            onChange={setField('next')}
            error={errors.next}
            hint="8+ characters with letters and numbers"
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={passwords.confirm}
            onChange={setField('confirm')}
            error={errors.confirm}
            required
          />
          <Button type="submit" isLoading={saving}>
            {saving ? 'Saving…' : 'Save New Password'}
          </Button>
        </form>
      </section>
    </div>
  );
}
