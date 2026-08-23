import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, GENDERS } from '../../constants';
import { getErrorMessage } from '../../services/api';

const initialValues = {
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!values.lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!GENDERS.some((g) => g.value === values.gender)) nextErrors.gender = 'Select a gender';
    if (!values.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = 'Enter a valid email address';

    if (values.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(values.password) || !/[0-9]/.test(values.password))
      nextErrors.password = 'Password must contain letters and numbers';
    if (values.confirmPassword !== values.password)
      nextErrors.confirmPassword = 'Passwords do not match';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        firstName: values.firstName,
        middleName: values.middleName || undefined,
        lastName: values.lastName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth || undefined,
        email: values.email,
        password: values.password,
      });
      toast.success('Account created successfully. Welcome!');
      navigate(ROUTES.dashboard, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the family tree and discover your roots."
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-semibold text-primary-700 hover:text-primary-800">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            name="firstName"
            value={values.firstName}
            onChange={setField('firstName')}
            error={errors.firstName}
            required
          />
          <Input
            label="Last name"
            name="lastName"
            value={values.lastName}
            onChange={setField('lastName')}
            error={errors.lastName}
            required
          />
        </div>
        <Input
          label="Middle name"
          name="middleName"
          value={values.middleName}
          onChange={setField('middleName')}
          hint="Optional"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Gender" name="gender" value={values.gender} onChange={setField('gender')} error={errors.gender} required>
            <option value="">Select…</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
          <Input
            label="Date of birth"
            type="date"
            name="dateOfBirth"
            value={values.dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            onChange={setField('dateOfBirth')}
            hint="Optional"
          />
        </div>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={setField('email')}
          error={errors.email}
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={values.password}
            onChange={setField('password')}
            error={errors.password}
            hint="8+ characters, letters & numbers"
            required
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={setField('confirmPassword')}
            error={errors.confirmPassword}
            required
          />
        </div>
        <Button type="submit" fullWidth size="lg" isLoading={submitting}>
          {submitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
