/* ===========================================================================
   BEAT 4 — THE SOURCING PIPELINE

   First section built on a still rather than video. The container photograph
   fills the section and drifts slowly as you scroll; the copy sits in the dark
   left third, which the image was composed and graded to keep clear.

   Weight: ~106KB for the image, against 9MB for the hero video. That gap is the
   argument for using stills everywhere except the hero.

   TODO (motion): stagger the four stage cards in as the section enters, and
   stamp the shipping mark in last.
   =========================================================================== */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { copy } from "@/content/copy";
import { BackdropImage } from "@/components/BackdropImage";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function Beat4Pipeline() {
  const reducedMotion = useReducedMotion();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion || !root.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-reveal]",
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 65%" },
        },
      );
    }, root);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={root}
      id="the-pipeline"
      aria-labelledby="pipeline-heading"
      className="relative isolate flex min-h-screen items-center overflow-hidden py-28"
    >
      <BackdropImage name="bg-container-hanging" scale={1.14} />

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl">
          <p
            data-reveal
            className="text-xs font-semibold tracking-[0.22em] text-accent uppercase"
          >
            The sourcing pipeline
          </p>

          <h2
            data-reveal
            id="pipeline-heading"
            className="text-on-video mt-5 text-3xl leading-[1.08] font-semibold tracking-tight sm:text-4xl md:text-5xl"
          >
            {copy.pipeline.heading}
          </h2>

          <p data-reveal className="text-on-video mt-6 text-base leading-relaxed opacity-85 md:text-lg">
            {copy.pipeline.body}
          </p>
        </div>

        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.pipeline.stages.map((stage, index) => (
            <li
              key={stage.key}
              data-reveal
              className="rounded-card border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
            >
              <span className="text-xs font-semibold text-accent tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-on-video mt-2 text-base font-semibold">
                {stage.label}
              </h3>
              <p className="text-on-video mt-1.5 text-sm opacity-70">
                {stage.detail}
              </p>
            </li>
          ))}
        </ol>

        <p
          data-reveal
          className="text-on-video mt-10 inline-flex items-center gap-3 rounded-pill border border-white/20 px-5 py-2.5 text-sm opacity-85"
        >
          Shipping mark generated automatically
          <span className="font-mono font-semibold text-accent">
            {copy.pipeline.sampleMark}
          </span>
        </p>
      </div>
    </section>
  );
}
