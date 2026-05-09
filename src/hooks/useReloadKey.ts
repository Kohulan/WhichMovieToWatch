import { useCallback, useState } from "react";

export function useReloadKey(): [number, () => void] {
  const [key, setKey] = useState(0);
  const retry = useCallback(() => setKey((k) => k + 1), []);
  return [key, retry];
}
