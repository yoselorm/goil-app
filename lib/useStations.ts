import { useEffect, useState } from 'react';

import { fetchStations } from './stations';
import type { Station } from './types';

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchStations().then((data) => {
      if (mounted) {
        setStations(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { stations, loading };
}
