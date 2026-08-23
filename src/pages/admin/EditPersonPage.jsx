import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ImageUp, Trash2 } from 'lucide-react';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PersonForm from '../../components/family/PersonForm';
import PersonAvatar from '../../components/family/PersonAvatar';
import { useAsync } from '../../hooks/useAsync';
import { personService } from '../../services';
import { getErrorMessage, getValidationErrors } from '../../services/api';
import { ROUTES } from '../../constants';

const MAX_PHOTO_MB = 2;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function PhotoManager({ person, onUpdated }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = () => fileRef.current?.click();

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Unsupported image type. Use JPG, PNG or WebP.');
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_PHOTO_MB}MB.`);
      return;
    }
    setUploading(true);
    try {
      await personService.uploadPhoto(person._id, file);
      toast.success('Photo updated successfully');
      onUpdated();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Image upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    setUploading(true);
    try {
      await personService.removePhoto(person._id);
      toast.success('Photo removed');
      onUpdated();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      <PersonAvatar person={person} size="xl" className="ring-slate-100" />
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="text-sm font-semibold text-slate-800">Profile photo</p>
        <p className="mt-0.5 text-xs text-slate-500">JPG, PNG or WebP · max {MAX_PHOTO_MB}MB</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
          />
          <Button variant="secondary" size="sm" onClick={pickFile} isLoading={uploading}>
            <ImageUp className="h-4 w-4" aria-hidden="true" />
            {person.photo ? 'Replace photo' : 'Upload photo'}
          </Button>
          {person.photo && (
            <Button variant="ghost" size="sm" className="!text-red-600" onClick={removePhoto} disabled={uploading}>
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditPersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = Boolean(location.state?.justCreated);

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: person, loading, error, reload } = useAsync(() => personService.get(id), [id]);

  const handleUpdate = async (values) => {
    setSubmitting(true);
    setFormErrors({});
    try {
      await personService.update(id, values);
      toast.success('Family member updated successfully');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save changes'));
      setFormErrors(getValidationErrors(err) || {});
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermanentDelete = async () => {
    setDeleting(true);
    try {
      await personService.removePermanent(id);
      toast.success('Family member permanently deleted');
      navigate(ROUTES.adminMembers);
    } catch (err) {
      setConfirmDelete(false);
      // Backend refuses deletion while relationships/accounts still exist.
      toast.error(getErrorMessage(err, 'This member cannot be deleted yet'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader label="Loading member…" />;
  if (error) return <ErrorState title="Family member not found" message={error.message} onRetry={reload} />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        to={ROUTES.adminMembers}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to members
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Edit Member</h1>
        {person.status === 'active' ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Deactivated</Badge>}
        {person.generation != null && <Badge tone="primary">Gen {person.generation}</Badge>}
      </div>

      {justCreated && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Member created. You can now upload a photo or link relationships.
        </p>
      )}

      <PhotoManager person={person} onUpdated={reload} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <PersonForm initial={person} onSubmit={handleUpdate} submitting={submitting} />
        {Object.keys(formErrors).length > 0 && (
          <ul className="mt-4 space-y-1 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {Object.entries(formErrors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Danger zone */}
      <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-xs text-slate-600">
          Prefer deactivation for historical members — permanent deletion is only possible when the
          member has no relationships and no linked account.
        </p>
        <Button variant="danger" size="sm" className="mt-3" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete Permanently
        </Button>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handlePermanentDelete}
        isLoading={deleting}
        title="Permanently delete?"
        confirmLabel="Delete Permanently"
        message={`Permanently delete "${person.firstName}"? This removes all of their data and cannot be undone. Deactivation is usually safer.`}
      />
    </div>
  );
}
