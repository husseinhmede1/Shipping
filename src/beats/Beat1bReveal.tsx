/* ===========================================================================
   BEAT 1b — THE REVEAL (the drone rises)

   The take-off, sprite edition — sharp at every altitude. The visitor has
   been staring at the container face (the fixed curtain from Beat 0/1). The
   face pushes in as the drone lifts off the wall, the frame blows out to a
   white exposure flash, and when it clears the top-down truck sprite is
   there at container-filling scale, shrinking as the camera climbs — over a
   faintly moving ground that sells the driving. The truck that lands from
   this zoom IS the fixed truck that drives the whole page: one element, no
   handoff, no seams.

   Veo footage was tried here twice and retired: its 1080px frames could
   never be sharp on desktop, its close-ups carry baked-in motion blur, and
   its concrete world clashed with the page. The sprite (590x2435 cutout) is
   crisper than the footage at every scale the zoom passes through, and the
   ground layer below — a seamless loop cut from the white-graded footage —
   restores the "wheels rolling, ground sliding" life that made video
   tempting. The still face and the sprite never share the screen: the flash
   reaches full white for the swap (a crossfade read as a double exposure).

   This component is only the markup: the white backdrop and the ground
   lane. The timeline lives in JourneyLayers, whose fixed truck is the star.
   The pinned element must never contain the fixed layers (a pinned
   ancestor's leftover transform captures fixed descendants — see Beat 0).

   Reduced motion: nothing. There are no fixed travellers, so the story goes
   straight from the container face to the road sections.
   =========================================================================== */

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
      {/* Invisible until the pin engages; revealed under cover of the white
          flash. Absolute, not fixed — absolute children ride along with the
          pinned section safely. */}
      <div id="reveal-backdrop" className="invisible absolute inset-0 bg-page">
        {/* The ground: a centred lane (the storyboard's centre lane, white
            either side) with a seamless concrete loop that JourneyLayers
            scrolls continuously — the motion under the truck that reads as
            driving. Edges fade into the page; the texture itself is cut from
            the white-graded footage so the worlds match. */}
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
      </div>
    </section>
  );
}
