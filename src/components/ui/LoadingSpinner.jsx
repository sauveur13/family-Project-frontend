import { cx } from '../../utils/format';

export function LoadingSpinner({ size = 'md', className }) {
  const sizes = { xs: 'h-3.5 w-3.5', sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <span
      className={cx(
        'inline-block animate-spin rounded-full border-2 border-primary-600 border-t-transparent',
        sizes[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export default LoadingSpinner;
