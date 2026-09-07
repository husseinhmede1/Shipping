/* ===========================================================================
   BEAT 1b — THE REVEAL (the drone shot)

   One continuous camera move. The visitor has been staring at the container
   face (the fixed curtain from Beat 0/1). Here a real 3D scene takes over —
   see components/reveal/RevealScene — with the container as a textured box
   standing on the flat truck sprite. Scroll drives the camera: it rises off
   the wall, tilts down and swings around the cab end, so the wide horizontal
   face becomes the vertical roof of a truck seen from above, shrinking as
   the drone climbs. At the top the flat DOM sprite takes over at exactly
   the size and place the 3D truck holds, and drives the rest of the page.

   No cut, no flash, no crossfade: the scene's first frame is the curtain's
   crop of the same texture at the same scale (the switch is invisible), and
   its last frame is the DOM sprite's rectangle.

   This component is only the markup. The camera timeline lives in
   JourneyLayers, whose fixed truck is the star of the handoff. The pinned
   element must never contain the fixed layers (a pinned ancestor's leftover
   transform captures fixed descendants — see Beat 0).

   Reduced motion: nothing. There are no fixed travellers, so the story goes
   straight from the container face to the road sections.
   =========================================================================== */

import { RevealScene } from "@/components/reveal/RevealScene";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function Beat1bReveal() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  return (
    <section
      id="reveal-zone"
      aria-hidden="true"
      className="relative z-30 h-[100svh] overflow-hidden"
    >
      {/* Invisible until the pin engages. Absolute, not fixed — absolute
          children ride along with the pinned section safely. */}
      <div id="reveal-backdrop" className="invisible absolute inset-0 bg-page">
        {/* The ground: a centred lane (the storyboard's centre lane, white
            either side) with a seamless near-white speckle loop that
            JourneyLayers scrolls continuously — the motion under the truck
            that reads as driving. Edges fade into the page. The tile is
            procedural (assets-src has the generator); the concrete cut from
            footage carried a crack that read as a slanted line. */}
        <div
          id="reveal-ground"
          className="absolute top-0 left-1/2 h-full w-full -translate-x-1/2 overflow-hidden md:w-[clamp(380px,40vw,640px)] md:[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
        >
          <div id="reveal-ground-roll" className="absolute top-0 left-0 w-full">
            <picture>
              <source srcSet="/media/fx-ground.webp" type="image/webp" />
              <img
                src="/media/fx-ground.jpg"
                alt=""
                loading="lazy"
                decoding="async"
                className="block w-full"
              />
            </picture>
            {/* second copy: the roll translates by exactly one image and
                snaps back — the mirror-built tile makes the seam invisible */}
            <picture>
              <source srcSet="/media/fx-ground.webp" type="image/webp" />
              <img
                src="/media/fx-ground.jpg"
                alt=""
                loading="lazy"
                decoding="async"
                className="block w-full"
              />
            </picture>
          </div>
        </div>

        {/* The 3D drone shot, transparent over the ground. */}
        <RevealScene />

        {/* Duplicates of the curtain's overlays — both stacks must render
            identically for the pin-start switch to be invisible. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="film-grain pointer-events-none absolute inset-0" />
      </div>
    </section>
  );
}
