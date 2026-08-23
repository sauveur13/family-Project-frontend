import { Link } from 'react-router-dom';
import { Network } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <Link
        to="/"
        className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900"
        aria-label="Family Tree home"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 text-white">
          <Network className="h-5 w-5" aria-hidden="true" />
        </span>
        Family<span className="-ml-2 text-primary-700">Tree</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
        {footer && <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  );
}
