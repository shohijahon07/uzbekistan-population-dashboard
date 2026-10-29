import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchPopulation } from '../services/api';
import type { AsyncState, PopulationResponse } from '../types';

export function usePopulation() {
  const [state, setState] = useState<AsyncState<PopulationResponse>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    fetchPopulation(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError) {
          setState({ status: 'error', error: err.kind, httpStatus: err.status });
        } else {
          setState({ status: 'error', error: 'network' });
        }
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { state, retry };
}
