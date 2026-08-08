/* ===========================================================================
   BEAT 1b — THE REVEAL (the drone rises)

   One continuous camera move, no cuts. The visitor has been staring at the
   yellow container surface (the fixed curtain from Beat 0/1). Here the
   "drone" rises: the surface shrinks away and the SAME container turns out
   to be riding on the top-down truck — the very element that then drives
   down the whole page. There is no second photograph; continuity comes from
   the fact that it is literally one fixed element from here to the flight
   handoff.

   This component is only the markup: a transparent pinned viewport
   (`#reveal-zone`) and a white backdrop (`#reveal-backdrop`) that fades in
   underneath the zoom. The timeline that drives it lives in JourneyLayers,
   because the star of the scene — the truck — belongs to it, and the pinned
   element must never contain the fixed layers (a pinned ancestor's leftover
   transform captures fixed descendants — see Beat 0).

   Until the pin engages the section is fully transparent, so the curtain
   face stays on screen right up to the moment the zoom starts. The white
   backdrop switches on under cover of `#face-zoom` (a fixed, pixel-identical
   copy of the curtain), which is what makes the handoff invisible.

   Reduced motion: nothing. There are no fixed travellers, so the story goes
   straight from the container face to the road sections.
   =========================================================================== */

import { useReducedMotion } from "@/lib/useReducedMotion";

export function Beat1bReveal() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  return (
    <section id="reveal-zone" aria-hidden="true" className="relative z-30 h-[100svh]">
      <div id="reveal-backdrop" className="invisible absolute inset-0 bg-page" />
    </section>
  );
}
