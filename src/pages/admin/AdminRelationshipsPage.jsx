import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link2, Pencil, Plus, Trash2, Unlink } from 'lucide-react';
import SearchInput from '../../components/ui/SearchInput';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import PersonPickerModal from '../../components/family/PersonPickerModal';
import { useAsync } from '../../hooks/useAsync';
import { relationshipService } from '../../services';
import { getErrorMessage } from '../../services/api';
import { RELATIONSHIP_TYPES, ROUTES } from '../../constants';
import { formatDate, fullName, shortName } from '../../utils/format';

const TYPE_TONES = { PARENT: 'primary', SPOUSE: 'info' };

function relationLabel(rel) {
  return rel.type === 'PARENT' ? 'Parent of' : 'Spouse of';
}

function PickerButton({ person, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full items-center rounded-lg border border-slate-300 px-3 py-2 text-left text-sm hover:border-primary-400"
    >
      {person ? (
        <span className="truncate font-medium text-slate-800">{fullName(person)}</span>
      ) : (
        <span className="text-slate-400">Select a family member…</span>
      )}
    </button>
  );
}

function RelationshipForm({ initial, onDone }) {
  const isEdit = Boolean(initial?.id);
  const [personA, setPersonA] = useState(initial ? initial.personA : null);
  const [personB, setPersonB] = useState(initial ? initial.personB : null);
  // For edits we only offer stored types (PARENT/SPOUSE); CHILD exists at input level.
  const typeOptions = isEdit
    ? [
        { value: 'PARENT', label: 'Parent → Child', hint: 'Person A is a parent of Person B.' },
        { value: 'SPOUSE', label: 'Spouses', hint: 'Person A and Person B are married/partners.' },
      ]
    : RELATIONSHIP_TYPES;
  const [type, setType] = useState(
    initial && initial.type === 'SPOUSE' ? 'SPOUSE' : isEdit ? 'PARENT' : 'PARENT',
  );
  const [pickerTarget, setPickerTarget] = useState(null); // 'A' | 'B'
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const activeHint =
    typeOptions.find((t) => t.value === type)?.hint || '';

  const swap = () => {
    setPersonA(personB);
    setPersonB(personA);
  };

  const handleSubmit = async () => {
    if (!personA?._id || !personB?._id) {
      setFormError('Select both family members.');
      return;
    }
    if (personA._id === personB._id) {
      setFormError('A person cannot have a relationship with themselves.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (isEdit) {
        await relationshipService.update(initial.id, { personA: personA._id, personB: personB._id, type });
        toast.success('Relationship updated successfully');
      } else {
        await relationshipService.create({ personA: personA._id, personB: personB._id, type });
        toast.success('Relationship created successfully');
      }
      onDone(true);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to save the relationship'));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select
        label="Relationship"
        value={type}
        onChange={(e) => setType(e.target.value)}
        hint={activeHint}
      >
        {typeOptions.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Person A</p>
          <PickerButton person={personA} onPick={() => setPickerTarget('A')} />
        </div>
        <button
          type="button"
          onClick={swap}
          className="mx-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary-700"
          aria-label="Swap persons"
          title="Swap persons"
        >
          ⇄
        </button>
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Person B</p>
          <PickerButton person={personB} onPick={() => setPickerTarget('B')} />
        </div>
      </div>

      {formError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => onDone(false)} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} isLoading={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Relationship'}
        </Button>
      </div>

      <PersonPickerModal
        open={Boolean(pickerTarget)}
        onClose={() => setPickerTarget(null)}
        title={pickerTarget === 'A' ? 'Select Person A' : 'Select Person B'}
        excludeId={pickerTarget === 'A' ? personB?._id : personA?._id}
        onSelect={(person) => (pickerTarget === 'A' ? setPersonA(person) : setPersonB(person))}
      />
    </div>
  );
}

export default function AdminRelationshipsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setPage(1), [typeFilter]);

  const { data, loading, error, reload } = useAsync(
    () =>
      relationshipService.list({
        type: typeFilter || undefined,
        page,
        limit: 20,
      }),
    [typeFilter, page],
  );

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await relationshipService.remove(confirmDelete.id);
      toast.success('Relationship removed');
      setConfirmDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Relationships</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Parent and spouse links power the family tree. Invalid or circular links are rejected.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Relationship
        </Button>
      </div>

      <div className="max-w-xs">
        <Select aria-label="Filter by type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          <option value="PARENT">Parent → Child</option>
          <option value="SPOUSE">Spouses</option>
        </Select>
      </div>

      {loading && <PageLoader label="Loading relationships…" />}
      {!loading && error && <ErrorState title="Unable to load relationships" message={error.message} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          {(data.data || []).length === 0 ? (
            <EmptyState
              icon={Link2}
              title="No relationships found"
              description="Link parents, children and spouses to build the family tree."
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add Relationship
                </Button>
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Person A</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Relation</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Person B</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Created</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((rel) => (
                      <tr key={rel.id} className="hover:bg-slate-50">
                        <td className="max-w-[220px] truncate px-4 py-3 font-medium text-slate-800">
                          {fullName(rel.personA)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={TYPE_TONES[rel.type]}>{relationLabel(rel)}</Badge>
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-3 font-medium text-slate-800">
                          {fullName(rel.personB)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(rel.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(rel);
                                setModalOpen(true);
                              }}
                              aria-label={`Edit relationship ${fullName(rel.personA)} ${relationLabel(rel)} ${fullName(rel.personB)}`}
                              title="Edit relationship"
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(rel)}
                              aria-label="Remove relationship"
                              title="Remove relationship"
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Unlink className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="space-y-3 md:hidden">
                {data.data.map((rel) => (
                  <li key={rel.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
                      <span className="font-medium text-slate-800">{shortName(rel.personA)}</span>
                      <Badge tone={TYPE_TONES[rel.type]}>{relationLabel(rel)}</Badge>
                      <span className="font-medium text-slate-800">{shortName(rel.personB)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Added {formatDate(rel.createdAt)}</p>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 !border !border-slate-300 !bg-white !text-slate-700"
                        onClick={() => {
                          setEditing(rel);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 !text-red-600" onClick={() => setConfirmDelete(rel)}>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}

      {/* Add / edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Relationship' : 'Add Relationship'}
      >
        {modalOpen && (
          <RelationshipForm
            initial={
              editing && {
                id: editing.id,
                personA: editing.personA,
                personB: editing.personB,
                type: editing.type,
              }
            }
            onDone={(changed) => {
              setModalOpen(false);
              setEditing(null);
              if (changed) reload();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Remove relationship?"
        confirmLabel="Remove Relationship"
        message={
          confirmDelete &&
          `Remove "${fullName(confirmDelete.personA)} — ${relationLabel(confirmDelete).toLowerCase()} — ${fullName(confirmDelete.personB)}"? This will change how the family tree is displayed.`
        }
      />
    </div>
  );
}
