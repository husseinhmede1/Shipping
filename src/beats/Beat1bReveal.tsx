/* ===========================================================================
   BEAT 1b — THE REVEAL (zoom out)

   The visitor has been staring at the yellow container face (the fixed curtain
   from Beat 0/1). This pinned section pulls the camera back: the face shrinks
   and fades, and underneath it the full truck-with-container appears at the
   port — the face you were looking at was the back of a truck all along.

   MECHANICS  A true zoom-out from a flat texture is impossible, so this is the
   standard crossfade-zoom: two layers scaling in sync. The shrinking face is
   NOT this section's element — it is `#face-zoom` in App, a fixed z-40 copy of
   the curtain. At pin start it renders pixel-identically to the curtain
   (same image, same viewport-filling box), so switching it on is invisible;
   scaling it down then reveals this section's port photo beneath. It lives in
   App because a fixed element inside a pinned section breaks after the pin
   releases (transformed ancestor becomes its containing block — see Beat 0).

   Until the pin engages, this section is fully transparent: the curtain shows
   through, which is what makes the Beat 1 -> reveal handoff seamless.

   Reduced motion: the port photo, static, no pin. The story still reads.
   =========================================================================== */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function Beat1bReveal() {
  const reducedMotion = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const photo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !root.current) return;

    const context = gsap.context(() => {
      const face = document.getElementById("face-zoom");

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // fromTo (not set) so scrubbing back above the pin restores the hidden
      // state — a zero-duration set at time 0 is ambiguous in reverse.
      timeline.fromTo(
        photo.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.001 },
        0,
      );

      if (face) {
        timeline.fromTo(face, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, 0);
        timeline.fromTo(
          face,
          { scale: 1, transformOrigin: "50% 50%" },
          { scale: 0.42, ease: "power1.in", duration: 0.5 },
          0.02,
        );
        timeline.to(face, { autoAlpha: 0, ease: "none", duration: 0.22 }, 0.3);
      }

      // The port photo starts framed tight on the container (its centre sits
      // at ~31% / 45% of the image) and pulls back to the full scene.
      timeline.fromTo(
        photo.current,
        { scale: 2.35, transformOrigin: "31% 45%" },
        { scale: 1, ease: "power2.out", duration: 0.9 },
        0.02,
      );

      // Hold the finished frame for a beat before the section unpins — the
      // visitor gets a moment with the whole truck before the journey starts.
      timeline.to({}, { duration: 0.3 });
    }, root);

    return () => context.revert();
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section aria-hidden="true" className="relative z-30 h-[70svh] overflow-hidden">
        <picture>
          <source srcSet="/media/bg-truck-side.webp" type="image/webp" />
          <img
            src="/media/bg-truck-side.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </picture>
      </section>
    );
  }

  return (
    <section
      ref={root}
      aria-hidden="true"
      className="relative z-30 h-[100svh] overflow-hidden"
    >
      {/* Invisible until the pin engages — the curtain face shows through the
          transparent section while it scrolls into place. */}
      <div ref={photo} className="invisible absolute inset-0">
        <picture>
          <source srcSet="/media/bg-truck-side.webp" type="image/webp" />
          <img
            src="/media/bg-truck-side.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </picture>
        <div className="film-grain absolute inset-0" />
      </div>
    </section>
  );
}
