// useArchive.ts — 자료실 목록을 백엔드에서 1회 로드. 실패 시 번들 폴백으로 공개 화면 보존.

import { useEffect, useState } from 'react';
import { fetchArchive } from './client';
import { ARCHIVE_FALLBACK, type ArchiveItem } from '../data/archive';

export function useArchive() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchArchive()
      .then((data) => {
        if (!active) return;
        setItems(data.length > 0 ? data : ARCHIVE_FALLBACK);
        setError(false);
      })
      .catch(() => {
        if (!active) return;
        setItems(ARCHIVE_FALLBACK);
        setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { items, loading, error };
}
