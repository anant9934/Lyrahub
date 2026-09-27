import { useState, useEffect } from 'react';

/**
 * Debounces a value by `delay` ms.
 * Used for search inputs to avoid firing a request on every keystroke.
 *
 * @example
 * const debouncedQuery = useDebounce(rawInput, 350);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
