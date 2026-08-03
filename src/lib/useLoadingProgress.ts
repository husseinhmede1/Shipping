import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";

/**
 * Loading progress for the preloader.
 *
 * Combines three things so the number on screen is honest but never ugly:
 *   1. Real R3F asset progress from drei's `useProgress` (textures, models).
 *   2. Document readiness — so we also wait for fonts and images.
 *   3. A minimum display time, so a fast connection doesn't produce a
 *      100ms flash of loader.
 *
 * There are no 3D assets in the scene yet (the globe is generated in code), so
 * real progress completes almost immediately. Append `?load=slow` to the URL to
 * stretch it out and actually watch the animation.
 */
const MIN_DURATION_MS = 1800;
const SLOW_DURATION_MS = 6000;

export function useLoadingProgress() {
  const { progress: assetProgress, active } = useProgress();
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const startedAt = useRef(performance.now());

  useEffect(() => {
    const slow = new URLSearchParams(window.location.search).get("load") === "slow";
    const minDuration = slow ? SLOW_DURATION_MS : MIN_DURATION_MS;

    let frame = 0;
    let documentReady = document.readyState === "complete";
    const onLoad = () => {
      documentReady = true;
    };
    window.addEventListener("load", onLoad);

    const tick = () => {
      const elapsed = performance.now() - startedAt.current;

      // The floor rises with time so the bar always advances, even when the
      // real work finished instantly. The ceiling is the genuine state.
      const timeProgress = Math.min(elapsed / minDuration, 1);
      const realProgress = documentReady && !active ? 1 : assetProgress / 100;
      const next = Math.min(timeProgress, Math.max(realProgress, timeProgress * 0.85)) * 100;

      setProgress((current) => (next > current ? next : current));

      if (timeProgress >= 1 && realProgress >= 1) {
        setProgress(100);
        setComplete(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", onLoad);
    };
  }, [assetProgress, active]);

  return { progress, complete };
}
