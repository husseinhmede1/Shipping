/**
 * Scroll progress of the reveal (0..1), written by the GSAP timeline in
 * JourneyLayers and read by the 3D scene. A tiny store rather than React
 * state: the value changes on every scrolled frame, and the scene only
 * needs to be told to re-render, not re-rendered by React.
 */
type Listener = (value: number) => void;

let value = 0;
const listeners = new Set<Listener>();

export const revealProgress = {
  get: () => value,
  set(next: number) {
    if (next === value) return;
    value = next;
    listeners.forEach((fn) => fn(next));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
