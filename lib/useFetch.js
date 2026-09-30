"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

/** Small data-loading hook: const { data, loading, error, reload } = useFetch("/path", params) */
export function useFetch(path, params) {
  const key = JSON.stringify(params || {});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      setData(await api(path, { params: JSON.parse(key) }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path, key]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}
