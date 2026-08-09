/* ===========================================================================
   BEAT 1 — THE CHAOS (the problem)

   This section's background IS the yellow container face that descended over
   the hero. In normal mode the section is transparent: the face is the fixed
   curtain element owned by Beat 0, and this content simply scrolls over it —
   which is what makes the handoff seamless. Under prefers-reduced-motion there
   is no curtain, so the section renders its own copy of the face.

   Styling note: everything here sits on loud weathered yellow, so the type is
   dark ink and the chat fragments are dark chips — the inverse of every other
   section. Do not use text-on-video here.

   TODO (motion): scatter the fragments as drifting chat bubbles once the
   section enters; keep the stagger quick.
   =========================================================================== */

import { copy } from "@/content/copy";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function Beat1Chaos() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="the-chaos"
      aria-labelledby="chaos-heading"
      className="relative z-30 flex min-h-screen items-center overflow-hidden py-28"
    >
      {/* Static fallback background — the curtain does this job otherwise. */}
      {reducedMotion && (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <picture>
            <source srcSet="/media/curtain-rise.webp" type="image/webp" />
            <img
              src="/media/curtain-rise.jpg"
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl rounded-card bg-black/55 p-7 backdrop-blur-sm sm:p-9">
          <h2
            id="chaos-heading"
            className="text-3xl leading-[1.08] font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            {copy.chaos.heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/85 md:text-lg">
            {copy.chaos.body}
          </p>
        </div>

        <ul className="mt-10 flex max-w-3xl flex-wrap gap-3">
          {copy.chaos.fragments.map((fragment) => (
            <li
              key={fragment}
              className="rounded-pill bg-black/70 px-4 py-2.5 text-sm text-white/90 backdrop-blur-sm"
            >
              {fragment}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
