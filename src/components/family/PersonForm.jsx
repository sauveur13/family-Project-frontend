import { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { GENDERS } from '../../constants';

const EMPTY = {
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  generation: '',
  dateOfBirth: '',
  dateOfDeath: '',
  placeOfBirth: '',
  placeOfDeath: '',
  occupation: '',
  biography: '',
};

/** Shared create/edit form for family members. onSubmit receives clean values. */
export default function PersonForm({ initial, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(() => ({
    ...EMPTY,
    ...Object.fromEntries(
      Object.entries(initial || {}).map(([key, value]) => [
        key,
        value == null ? '' : key === 'dateOfBirth' || key === 'dateOfDeath' ? String(value).slice(0, 10) : value,
      ]),
    ),
  }));
  const [errors, setErrors] = useState({});

  const setField = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.firstName.trim()) next.firstName = 'First name is required';
    if (!GENDERS.some((g) => g.value === values.gender)) next.gender = 'Select a gender';
    if (values.generation && (!Number.isInteger(Number(values.generation)) || Number(values.generation) < 1))
      next.generation = 'Generation must be a positive number';
    if (values.dateOfBirth && values.dateOfDeath && values.dateOfDeath < values.dateOfBirth)
      next.dateOfDeath = 'Date of death cannot be before date of birth';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    await onSubmit({
      firstName: values.firstName,
      middleName: values.middleName || null,
      lastName: values.lastName || null,
      gender: values.gender,
      generation: values.generation ? Number(values.generation) : null,
      dateOfBirth: values.dateOfBirth || null,
      dateOfDeath: values.dateOfDeath || null,
      placeOfBirth: values.placeOfBirth || null,
      placeOfDeath: values.placeOfDeath || null,
      occupation: values.occupation || null,
      biography: values.biography || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <fieldset className="space-y-4">
        <legend className="mb-1 text-sm font-semibold text-slate-700">Basic information</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="First name" name="firstName" value={values.firstName} onChange={setField('firstName')} error={errors.firstName} required />
          <Input label="Middle name" name="middleName" value={values.middleName} onChange={setField('middleName')} hint="Optional" />
          <Input label="Last name" name="lastName" value={values.lastName} onChange={setField('lastName')} hint="Optional" />
        </div>
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
            label="Generation"
            name="generation"
            type="number"
            min="1"
            value={values.generation}
            onChange={setField('generation')}
            error={errors.generation}
            hint="Optional — organizational only; relationships define the real hierarchy"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-sm font-semibold text-slate-700">Life events</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Date of birth" type="date" name="dateOfBirth" value={values.dateOfBirth} onChange={setField('dateOfBirth')} hint="Optional" />
          <Input label="Date of death" type="date" name="dateOfDeath" value={values.dateOfDeath} onChange={setField('dateOfDeath')} error={errors.dateOfDeath} hint="Leave empty for living members" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Place of birth" name="placeOfBirth" value={values.placeOfBirth} onChange={setField('placeOfBirth')} hint="Optional" />
          <Input label="Place of death" name="placeOfDeath" value={values.placeOfDeath} onChange={setField('placeOfDeath')} hint="Optional" />
        </div>
        <Input label="Occupation" name="occupation" value={values.occupation} onChange={setField('occupation')} hint="Optional" />
      </fieldset>

      <Textarea
        label="Biography"
        name="biography"
        rows={5}
        value={values.biography}
        onChange={setField('biography')}
        hint="Optional — stories, notes and historical context (max 2000 characters)"
      />

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={submitting}>
          {submitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
