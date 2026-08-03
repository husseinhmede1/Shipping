/* ===========================================================================
   BEAT 0 — HERO

   A full-bleed dock video pinned behind the opening lines. The video never
   plays: its frame is tied to scroll position, so it only moves when the
   visitor moves — forward or backward — and freezes the moment they stop.

   The three lines arrive in sequence as the pin advances. Line one is present
   from first paint and is never gated behind scroll; it is the LCP element.

   Degrades on two axes:
     - prefers-reduced-motion : poster still, every line visible, no pin.
     - under 768px            : poster still, no pin, lines simply visible.
       Frame-accurate seeking is unreliable on mobile browsers no matter how
       the file is encoded, so we do not attempt it.

   ASSET  public/media/hero-dock.mp4 — 1920x1080, 12fps, EVERY frame a
   keyframe. That encode is what makes seeking possible; a normally encoded
   file rebuilds from the previous keyframe on each seek and stutters badly.
   =========================================================================== */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { brand } from "@/brand/brand.config";
import { copy } from "@/content/copy";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsMobile } from "@/lib/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = "/media/hero-dock.mp4";
const POSTER_SRC = "/media/hero-dock-poster.jpg";

export function Beat0Hero() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const staticMode = reducedMotion || isMobile;

  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const eyebrow = useRef<HTMLParagraphElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const subhead = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);

  /* -- line one: entrance is time-based, never scroll-gated ---------------- */
  useEffect(() => {
    if (staticMode) return;
    gsap.fromTo(
      eyebrow.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.15 },
    );
  }, [staticMode]);

  /* -- the pinned scroll sequence ------------------------------------------ */
  useEffect(() => {
    if (staticMode || !root.current) return;

    const element = video.current;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=340%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // The video spans the whole pin. `ease: none` keeps frame position linear
      // against scroll — easing here makes the footage feel like it is fighting
      // the wheel rather than following it.
      if (element) {
        timeline.to(
          element,
          { currentTime: () => element.duration || 10, ease: "none" },
          0,
        );
      }

      timeline
        .fromTo(
          headline.current,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.18 },
          0.1,
        )
        .fromTo(
          subhead.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.18 },
          0.42,
        )
        .fromTo(
          actions.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.15 },
          0.7,
        );
    }, root);

    return () => context.revert();
  }, [staticMode]);

  /* -- prime the decoder ---------------------------------------------------
     Browsers will not seek a video that has never been handed to the decoder.
     A muted play/pause once metadata arrives primes it, so the first scroll
     shows a frame instead of an empty rectangle.                             */
  useEffect(() => {
    const element = video.current;
    if (!element || staticMode) return;

    const prime = () => {
      element
        .play()
        .then(() => element.pause())
        .catch(() => {
          /* autoplay refused — the poster stays up, which is the right fallback */
        });
      ScrollTrigger.refresh();
    };

    if (element.readyState >= 2) prime();
    else element.addEventListener("loadeddata", prime, { once: true });

    return () => element.removeEventListener("loadeddata", prime);
  }, [staticMode]);

  return (
    <section
      ref={root}
      aria-labelledby="hero-headline"
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-brand"
    >
      {/* ---- background ---------------------------------------------------- */}
      {staticMode ? (
        <img
          src={POSTER_SRC}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : (
        <video
          ref={video}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}

      {/* Scrim. The footage is already graded down, so this only has to
          guarantee contrast under the text column — hence a directional
          gradient rather than a flat wash that would kill the whole image. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/65 via-transparent to-black/35"
      />

      {/* ---- copy ---------------------------------------------------------- */}
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
        <p
          ref={eyebrow}
          className="text-on-video text-xs font-semibold tracking-[0.22em] uppercase sm:text-sm"
        >
          {copy.hero.eyebrow}
        </p>

        <h1
          ref={headline}
          id="hero-headline"
          className="text-on-video mt-6 max-w-4xl text-4xl leading-[1.06] font-semibold sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {copy.hero.headline}
        </h1>

        <p
          ref={subhead}
          className="text-on-video mt-7 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl"
        >
          {copy.hero.subhead}
        </p>

        <div ref={actions}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={brand.cta.primary.href}
              className="rounded-input bg-cta px-6 py-3 font-semibold text-brand transition-transform duration-200 hover:-translate-y-0.5"
            >
              {brand.cta.primary.label}
            </a>
            <a
              href={brand.cta.secondary.href}
              className="text-on-video rounded-input border border-white/30 px-6 py-3 font-semibold backdrop-blur-sm transition-colors duration-200 hover:bg-white/10"
            >
              {brand.cta.secondary.label}
            </a>
          </div>

          <p className="text-on-video mt-10 text-xs opacity-70 sm:text-sm">
            {copy.hero.note}
          </p>
        </div>
      </div>
    </section>
  );
}
