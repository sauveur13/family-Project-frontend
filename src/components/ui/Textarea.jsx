import { cx } from '../../utils/format';

export default function Textarea({ label, error, hint, required, id, className, rows = 4, ...props }) {
  const areaId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={areaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cx(
          'block w-full rounded-lg border px-3 py-2 text-sm placeholder:text-slate-400',
          'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
          error ? 'border-red-400' : 'border-slate-300',
          className,
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
