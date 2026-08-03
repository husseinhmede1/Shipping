import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling, wired so GSAP/ScrollTrigger stays in sync.
 *
 * The wiring matters: Lenis animates scroll position on its own schedule, so
 * ScrollTrigger has to be told to update from Lenis rather than from native
 * scroll events, and Lenis has to be driven from GSAP's ticker so the two share
 * one clock. Without this, scrubbed animation lags behind the actual scroll by
 * a frame or two and the video visibly trails the page.
 *
 * Disabled entirely under prefers-reduced-motion — hijacking scroll is exactly
 * what that setting exists to prevent.
 */
export function useSmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);
}
