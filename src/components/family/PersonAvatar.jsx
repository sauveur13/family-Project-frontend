import { cx, assetUrl, fullName, initials } from '../../utils/format';

const SIZES = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

const COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
];

function colorFor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return COLORS[hash % COLORS.length];
}

export default function PersonAvatar({ person, size = 'md', className }) {
  const name = fullName(person);
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold uppercase ring-2 ring-white',
        SIZES[size],
        person?.photo ? 'bg-slate-200' : colorFor(name),
        className,
      )}
      title={person ? `${name}${person.dateOfDeath ? ' (deceased)' : ''}` : undefined}
    >
      {person?.photo ? (
        <img src={assetUrl(person.photo)} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        initials(person)
      )}
    </span>
  );
}
