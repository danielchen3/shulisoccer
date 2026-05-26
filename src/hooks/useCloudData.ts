import { useState, useEffect } from "react";

interface CloudDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useCloudData<T>(fetcher: () => Promise<T>): CloudDataState<T> {
  const [state, setState] = useState<CloudDataState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
