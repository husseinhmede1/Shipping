import { useEffect, useRef, useState } from "react";

/**
 * Loading progress for the preloader — real work, not theatre.
 *
 * While the globe is up, every below-the-fold story image is fetched and the
 * percentage tracks that genuine progress (blended with document readiness
 * and a minimum display time so a fast connection doesn't produce a 100ms
 * flash of loader). By the time the overlay dissolves, the whole journey's
 * imagery is already in cache — the page opens fully dressed.
 *
 * `imagesDone` flips as soon as the manifest has landed; App uses it to start
 * the hero video download WHILE the globe is still showing. The loader never
 * waits for the video itself: it is ~9.5MB, and holding visitors hostage to
 * it on a slow line is worse than the poster-first fallback.
 *
 * A failed image counts as done — a missing texture must never wedge the
 * whole site behind the loader.
 *
 * Append `?load=slow` to stretch the animation for review.
 */

// Everything the journey needs before first scroll, cheapest-effective set.
// Keep in sync with the assets actually referenced in beats/JourneyLayers.
const IMAGE_MANIFEST = [
  "/media/hero-dock-poster.webp",
  "/media/bg-container-face.webp",
  "/media/sprite-truck-top.webp",
  "/media/fx-ground.webp",
  "/media/bg-field.webp",
  "/media/fx-clouds.jpg",
  "/media/sprite-plane-top.webp",
];

const MIN_DURATION_MS = 1800;
const SLOW_DURATION_MS = 6000;

export function useLoadingProgress() {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [imagesDone, setImagesDone] = useState(false);
  const startedAt = useRef(performance.now());

  useEffect(() => {
    const slow = new URLSearchParams(window.location.search).get("load") === "slow";
    const minDuration = slow ? SLOW_DURATION_MS : MIN_DURATION_MS;

    let frame = 0;
    let loadedImages = 0;
    let documentReady = document.readyState === "complete";
    const onLoad = () => {
      documentReady = true;
    };
    window.addEventListener("load", onLoad);

    const images = IMAGE_MANIFEST.map((src) => {
      const img = new Image();
      const settle = () => {
        loadedImages += 1;
      };
      img.onload = settle;
      img.onerror = settle; // never let a broken texture wedge the loader
      img.src = src;
      return img;
    });

    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const imageFraction = loadedImages / IMAGE_MANIFEST.length;

      if (imageFraction >= 1) setImagesDone(true);

      // The floor rises with time so the bar always advances; the ceiling is
      // the genuine state: story images (the bulk) plus document readiness.
      const timeProgress = Math.min(elapsed / minDuration, 1);
      const realProgress = 0.8 * imageFraction + 0.2 * (documentReady ? 1 : 0);
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
      // Dropping the references lets the browser abort in-flight fetches if
      // the component unmounts (it normally never does before completion).
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  return { progress, complete, imagesDone };
}
