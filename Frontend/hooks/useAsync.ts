'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Runs an async loader whenever deps change; exposes data/loading/error and a reload fn. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const reqId = useRef(0);

  const run = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current();
      if (id === reqId.current) setData(result);
    } catch (e) {
      if (id === reqId.current) setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: run, setData };
}
