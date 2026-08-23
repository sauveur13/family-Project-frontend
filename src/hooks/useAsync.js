import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../services/api';

/**
 * Small data-fetching hook: loading/error state, stale-response protection
 * and a stable reload(). Pass `immediate: false` for manual triggers.
 */
export function useAsync(fn, { deps = [], immediate = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const sequence = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async (...args) => {
    const id = ++sequence.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(...args);
      if (sequence.current === id) {
        setData(result);
        setLoading(false);
      }
      return result;
    } catch (err) {
      if (sequence.current === id) {
        setError(new Error(getErrorMessage(err)));
        setLoading(false);
      }
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      run();
    }
    return () => {
      sequence.current += 1; // cancel stale updates on unmount/re-run
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: run, setData };
}

export default useAsync;
