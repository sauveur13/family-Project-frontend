import LoadingSpinner from './LoadingSpinner';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <LoadingSpinner size="lg" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
