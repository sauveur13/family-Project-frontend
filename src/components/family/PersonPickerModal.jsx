import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import SearchInput from '../ui/SearchInput';
import LoadingSpinner from '../ui/LoadingSpinner';
import { personService } from '../../services';
import { useDebounce } from '../../hooks/useDebounce';
import { shortName, lifespan } from '../../utils/format';

/** Modal person search used for tree-root selection and relationship forms. */
export default function PersonPickerModal({ open, onClose, onSelect, title = 'Select family member', excludeId }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(search);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setLoading(true);
    personService
      .list({ search: debounced, limit: 8 })
      .then((res) => {
        if (active) setResults(res.data || []);
      })
      .catch(() => {
        if (active) setResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debounced, open]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name…" />
      <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto" role="listbox">
        {loading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}
        {!loading && results.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">No family members found.</p>
        )}
        {!loading &&
          results
            .filter((person) => person._id !== excludeId)
            .map((person) => (
              <button
                key={person._id}
                type="button"
                onClick={() => {
                  onSelect(person);
                  onClose();
                  setSearch('');
                }}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-primary-300 hover:bg-primary-50/50"
              >
                <span className="font-medium text-slate-800">{shortName(person)}</span>
                <span className="text-xs text-slate-500">{lifespan(person)}</span>
              </button>
            ))}
      </div>
    </Modal>
  );
}
