'use client';
import { useEffect, useState, useCallback } from 'react';
export function useDirtyState<T>(initial: T) {
  const [value, setValueInternal] = useState<T>(initial);
  const [dirty, setDirty] = useState(false);
  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    setValueInternal(next);
    setDirty(true);
  }, []);
  const markClean = useCallback(() => setDirty(false), []);
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  return { value, setValue, dirty, markClean };
}
