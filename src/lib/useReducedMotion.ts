import { useEffect, useState } from "react";

/**
 * True when the visitor has asked their OS to reduce motion.
 *
 * Every animated beat must branch on this and render its FINAL state — the
 * story has to be readable with all animation disabled, not just static.
 * Updates live if the visitor changes the setting while the page is open.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
