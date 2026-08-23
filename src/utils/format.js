export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

const API_ORIGIN = import.meta.env.VITE_ASSET_ORIGIN || '';

/** Resolves backend-relative paths like /uploads/x.jpg against the API origin. */
export function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

export function fullName(person) {
  if (!person) return '';
  return [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .join(' ');
}

export function shortName(person) {
  if (!person) return '';
  return [person.firstName, person.lastName].filter(Boolean).join(' ');
}

export function initials(person) {
  const first = person?.firstName?.[0] ?? '';
  const last = person?.lastName?.[0] ?? '';
  return `${first}${last}`.toUpperCase() || '?';
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : DATE_FORMAT.format(date);
}

export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${DATE_FORMAT.format(date)}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

export function yearOf(value) {
  if (!value) return '';
  return String(new Date(value).getFullYear() || '');
}

/** "1954 – 2011", or "b. 1954" for the living, or "Unknown". */
export function lifespan(person) {
  const born = yearOf(person?.dateOfBirth);
  const died = yearOf(person?.dateOfDeath);
  if (born && died) return `${born} – ${died}`;
  if (born) return `b. ${born}`;
  if (died) return `d. ${died}`;
  return 'Unknown dates';
}

export function calcAge(dob, dod) {
  if (!dob) return null;
  const start = new Date(dob);
  const end = dod ? new Date(dod) : new Date();
  let age = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

export function relativeTime(value) {
  if (!value) return '';
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secs] of units) {
    const amount = Math.floor(seconds / secs);
    if (amount >= 1) return `${amount} ${unit}${amount > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}
