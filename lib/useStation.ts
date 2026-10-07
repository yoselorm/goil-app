import { useEffect, useState } from 'react';

import { fetchStationById } from './stations';
import type { Station } from './types';

export function useStation(id: string | undefined) {
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    fetchStationById(id).then((data) => {
      if (mounted) {
        setStation(data ?? null);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  return { station, loading };
}
