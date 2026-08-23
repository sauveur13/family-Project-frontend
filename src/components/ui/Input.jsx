import { forwardRef } from 'react';
import { cx } from '../../utils/format';

export const FormField = ({ label, htmlFor, error, hint, required, children }) => (
  <div className="w-full">
    {label && (
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
      </label>
    )}
    {children}
    {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    {error && (
      <p className="mt-1 text-xs font-medium text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
);

const Input = forwardRef(function Input({ label, error, hint, required, id, className, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <FormField label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cx(
          'block w-full rounded-lg border px-3 py-2 text-sm placeholder:text-slate-400',
          'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
          error ? 'border-red-400' : 'border-slate-300',
          className,
        )}
        {...props}
      />
    </FormField>
  );
});

export default Input;
