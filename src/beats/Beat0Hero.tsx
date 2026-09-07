/* ===========================================================================
   BEAT 0 — HERO

   A full-bleed dock shot pinned behind the opening lines. The footage never
   plays: its frame is tied to scroll position, so it only moves when the
   visitor moves — forward or backward — and freezes the moment they stop.

   The three lines arrive in sequence as the pin advances. Line one is present
   from first paint and is never gated behind scroll; it is the LCP element.

   FOOTAGE  Not a <video>. A folder of still frames drawn on a canvas (see
   lib/frameSequence). Video seeking by scroll was unreliable — browsers
   throttle seeks, Safari refuses them until the decoder holds a frame, iOS
   Low Power Mode blocks the priming play() — and it showed as "the hero
   sometimes does not move" (owner report). Frames either decoded or did
   not; the nearest decoded one is always drawable, so the scrub can never
   freeze. The frames are cut from a 4K Topaz upscale of the original
   clip (assets-src/hero-dock-4k.mp4; owner: "super HD"), so the hero is
   sharp on 2K/4K screens too.

   Degrades on two axes:
     - prefers-reduced-motion : poster still, every line visible, no pin.
     - under 768px            : the story still runs — the section pins and the
       lines arrive in sequence exactly as on desktop. Only the frame set
       changes, to a portrait centre crop that matches what object-cover
       would show of the wide frame at a fraction of the bytes.

   EXIT  The section does not simply scroll away. Over the final stretch of the
   pin, a full-viewport yellow container face descends from the top and covers
   the hero — arriving like the container the crane has been lowering — and then
   serves as the fixed background the next section's content scrolls over. The
   curtain element lives in App (it must not be a descendant of the pinned
   element — see the note in the effect) but this scrubbed timeline drives it;
   Beat1 owns nothing but transparent content. Everything after Beat1 sits in
   an opaque z-30 wrapper (see App), so the fixed curtain is simply painted
   over once Beat 2 arrives — stacking, not event callbacks, which had a
   refresh-ordering trap.

   LOADING  The frames are NOT fetched during startup. Nothing is requested
   until the preloader's own images are cached and the browser reports idle,
   so they never compete with fonts, CSS or JavaScript for bandwidth. They
   arrive coarse-to-fine (frame 0, then every 8th, 4th, 2nd, the rest), so
   the scrub works within a second and sharpens as the rest lands. Until
   frame 0 is in, the poster carries the hero.

   ASSETS  public/media/hero/d/0001..0096.webp  2560x1440 (desktop)
           public/media/hero/m/0001..0072.webp  810x1440 portrait (<=767px)
           Regenerate with assets-src/gen-hero-frames.py.
   =========================================================================== */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { brand } from "@/brand/brand.config";
import { copy } from "@/content/copy";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsMobile } from "@/lib/useMediaQuery";
import {
  createFrameLoader,
  drawCover,
  fitCanvas,
  type FrameLoader,
  type FrameSet,
} from "@/lib/frameSequence";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_FRAMES: FrameSet = { base: "/media/hero/d", count: 96 };
const MOBILE_FRAMES: FrameSet = { base: "/media/hero/m", count: 72 };
const POSTER_SRC = "/media/hero-dock-poster.jpg";

type Beat0HeroProps = {
  /** True once the preloader has finished. Gates the frame download. */
  ready?: boolean;
};

export function Beat0Hero({ ready = false }: Beat0HeroProps) {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Only reduced motion disables the story. Screen size changes the frame
  // set and the pin length, never whether the sequence runs at all.
  const staticMode = reducedMotion;
  const frameSet = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES;

  // Null until we choose to start fetching. An empty canvas is transparent,
  // so the poster underneath shows and the hero looks finished the whole time.
  const [activeSet, setActiveSet] = useState<FrameSet | null>(null);

  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const loader = useRef<FrameLoader | null>(null);
  const progress = useRef(0);
  const eyebrow = useRef<HTMLParagraphElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const subhead = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);

  /* -- paint the frame for the current scroll position ---------------------
     Called from the scrub, from every frame arrival and from resizes. Cheap:
     one drawImage of an already-decoded bitmap.                             */
  const draw = () => {
    const el = canvas.current;
    const set = activeSet;
    const frames = loader.current;
    if (!el || !set || !frames) return;
    fitCanvas(el);
    const img = frames.nearest(progress.current * (set.count - 1));
    if (img) drawCover(el, img);
  };
  const drawRef = useRef(draw);
  drawRef.current = draw;

  /* -- on arrival: eyebrow AND headline ------------------------------------
     Both are time-based, never scroll-gated. A visitor who never scrolls must
     still get the whole proposition — an opening screen holding one small line
     of text reads as a broken page, not as restraint. The headline is also the
     largest element on screen, so keeping it out of the scroll sequence is what
     protects the LCP.                                                        */
  useEffect(() => {
    if (staticMode) return;
    const entrance = gsap.timeline({ delay: 0.15 });
    entrance
      .fromTo(
        eyebrow.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
        0,
      )
      .fromTo(
        headline.current,
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out" },
        0.12,
      );
    return () => {
      entrance.kill();
    };
  }, [staticMode]);

  /* -- start the download, but only once the page is out of the way -------- */
  useEffect(() => {
    if (staticMode || !ready) return;

    let cancelled = false;
    const begin = () => {
      if (!cancelled) setActiveSet(frameSet);
    };

    // requestIdleCallback waits for a genuine gap in the main thread. The
    // short timeout is the backstop: `ready` fires while the preloader
    // globe is still animating (images cached — see Preloader onWarm), and
    // the globe's rAF loop keeps the thread busy enough that real idle
    // rarely arrives — so in practice this IS the start delay.
    const idle = window.requestIdleCallback;
    if (typeof idle === "function") {
      const handle = idle(begin, { timeout: 400 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(handle);
      };
    }

    const timer = window.setTimeout(begin, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, staticMode, frameSet]);

  /* -- load the frames, repaint as they land, follow resizes --------------- */
  useEffect(() => {
    const el = canvas.current;
    if (!el || staticMode || !activeSet) return;

    const frames = createFrameLoader(activeSet, () => drawRef.current());
    loader.current = frames;

    const ro = new ResizeObserver(() => drawRef.current());
    ro.observe(el);

    return () => {
      ro.disconnect();
      frames.cancel();
      loader.current = null;
    };
  }, [staticMode, activeSet]);

  /* -- the pinned scroll sequence ------------------------------------------ */
  useEffect(() => {
    if (staticMode || !root.current) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          // The final ~30% of the pin is the container-curtain descent.
          end: isMobile ? "+=375%" : "+=490%",
          pin: true,
          // Exact, not lagged: the curtain must be fully down the instant
          // the pin releases (a numeric scrub let the reveal's canvas outlive
          // its pin — same trap). Lenis already smooths the scroll.
          scrub: true,
          anticipatePin: 1,
        },
      });

      // Drive a proxy value across the pin and map it onto the frames. The
      // frames may not have arrived yet (deferred download); while none are
      // in this is a no-op and the poster stays up. The text sequence never
      // depends on it.
      // The footage runs right up to the moment the curtain starts (position
      // 1.0 below), so the last frame is what the container is lowered onto.
      // (The old video scrub left this at GSAP's default 0.5 and the shot
      // froze a third of the way through the pin.)
      const playhead = { progress: 0 };
      timeline.to(
        playhead,
        {
          progress: 1,
          ease: "none",
          duration: 1.0,
          onUpdate: () => {
            progress.current = playhead.progress;
            drawRef.current();
          },
        },
        0,
      );

      // autoAlpha, not opacity. GSAP then toggles `visibility` too, which keeps
      // not-yet-revealed controls out of the keyboard tab order — otherwise
      // focus lands on invisible buttons.
      timeline
        .fromTo(
          subhead.current,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.2 },
          0.14,
        )
        .fromTo(
          actions.current,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.18 },
          0.5,
        );

      // The curtain. Starts a beat after the CTAs land so the finished hero
      // gets a moment on screen, then the container face is lowered over it.
      // The curtain lives in App, NOT inside this section. The pinned element
      // keeps a transform after release (GSAP holds it at the spacer's end),
      // and a transformed ancestor becomes the containing block for fixed
      // descendants — a curtain in here would silently turn hero-relative and
      // be clipped by overflow-hidden the moment the pin ends.
      const curtainEl = document.getElementById("container-curtain");
      if (curtainEl) {
        gsap.set(curtainEl, { yPercent: -102, autoAlpha: 1 });
        timeline.to(
          curtainEl,
          { yPercent: 0, ease: "power1.inOut", duration: 0.45 },
          1.0,
        );
      }
    }, root);

    return () => context.revert();
  }, [staticMode, isMobile]);

  return (
    <section
      ref={root}
      aria-labelledby="hero-headline"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-brand pt-[var(--header-h)]"
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
        <>
          {/* Poster underneath: shows until frame 0 is decoded, and stays
              as the safety net if the frames never arrive. */}
          <img
            src={POSTER_SRC}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <canvas
            ref={canvas}
            aria-hidden="true"
            className="absolute inset-0 -z-10 h-full w-full"
          />
        </>
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

      {/* Grain sits above the scrims but below the copy — it should texture the
          footage, not the type. */}
      <div aria-hidden="true" className="film-grain absolute inset-0 -z-10" />

      {/* ---- copy ---------------------------------------------------------- */}
      <div className="mx-auto w-full max-w-6xl px-5 py-[clamp(2rem,6vh,6rem)] sm:px-8">
        <p
          ref={eyebrow}
          className="text-on-video text-xs font-semibold tracking-[0.22em] uppercase sm:text-sm"
        >
          {copy.hero.eyebrow}
        </p>

        <h1
          ref={headline}
          id="hero-headline"
          className="text-on-video mt-[clamp(0.9rem,2vh,1.5rem)] max-w-4xl text-[clamp(2rem,6vh,4.5rem)] leading-[1.04] font-semibold tracking-tight"
        >
          {copy.hero.headline}
        </h1>

        <p
          ref={subhead}
          className="text-on-video mt-[clamp(1rem,2.4vh,1.75rem)] max-w-2xl text-[clamp(0.95rem,2vh,1.25rem)] leading-relaxed"
        >
          {copy.hero.subhead}
        </p>

        <div ref={actions}>
          <div className="mt-[clamp(1.25rem,3vh,2.5rem)] flex flex-wrap items-center gap-4">
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

          <p className="text-on-video mt-[clamp(1rem,2.6vh,2.5rem)] text-xs opacity-70 sm:text-sm">
            {copy.hero.note}
          </p>
        </div>
      </div>
    </section>
  );
}
