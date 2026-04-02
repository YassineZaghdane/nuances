"use client";

import { useEffect, useRef } from "react";

/**
 * Relance un callback quand l’utilisateur revient sur l’onglet / la fenêtre
 * (ex. après avoir modifié les badges dans l’ERP sur un autre onglet).
 */
export function useRefreshOnFocus(callback: () => void) {
  const cb = useRef(callback);
  cb.current = callback;

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") cb.current();
    };
    const onFocus = () => cb.current();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
}
