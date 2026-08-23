import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-700">Error 404</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
