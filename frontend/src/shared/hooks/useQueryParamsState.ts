import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type ParamValue = string | number | boolean | undefined;

export function useQueryParamsState<T extends Record<string, ParamValue>>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const result = { ...defaults };

    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const raw = searchParams.get(String(key));
      if (raw === null) continue;

      const defaultValue = defaults[key];
      if (typeof defaultValue === 'number') {
        const parsed = Number(raw);
        result[key] = (Number.isNaN(parsed) ? defaultValue : parsed) as T[keyof T];
      } else if (typeof defaultValue === 'boolean') {
        result[key] = (raw === 'true') as T[keyof T];
      } else {
        result[key] = raw as T[keyof T];
      }
    }

    return result;
  }, [searchParams, defaults]);

  const setState = useCallback(
    (updates: Partial<T>) => {
      const next = new URLSearchParams(searchParams);

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '' || value === defaults[key]) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      setSearchParams(next);
    },
    [searchParams, setSearchParams, defaults],
  );

  return [state, setState] as const;
}
