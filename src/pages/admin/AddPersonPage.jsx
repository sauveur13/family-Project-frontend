import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import PersonForm from '../../components/family/PersonForm';
import { personService } from '../../services';
import { getErrorMessage, getValidationErrors } from '../../services/api';
import { ROUTES } from '../../constants';

export default function AddPersonPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setFormErrors({});
    try {
      const person = await personService.create(values);
      toast.success(`"${person.firstName}" added to the family tree.`);
      navigate(ROUTES.editPerson(person._id), {
        state: { justCreated: true },
        replace: true,
      });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create family member'));
      setFormErrors(getValidationErrors(err) || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        to={ROUTES.adminMembers}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to members
      </Link>
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Add Family Member</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Only a name and gender are required — historical details can be filled in later.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <PersonForm
          initial={{}}
          onSubmit={handleSubmit}
          submitting={submitting}
          onCancel={() => navigate(ROUTES.adminMembers)}
        />
        {Object.keys(formErrors).length > 0 && (
          <ul className="mt-4 space-y-1 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {Object.entries(formErrors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
