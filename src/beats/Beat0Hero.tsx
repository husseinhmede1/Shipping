/* ===========================================================================
   BEAT 0 — HERO

   A full-bleed dock video pinned behind the opening lines. The video never
   plays: its frame is tied to scroll position, so it only moves when the
   visitor moves — forward or backward — and freezes the moment they stop.

   The three lines arrive in sequence as the pin advances. Line one is present
   from first paint and is never gated behind scroll; it is the LCP element.

   Degrades on two axes:
     - prefers-reduced-motion : poster still, every line visible, no pin.
     - under 768px            : the story still runs — the section pins and the
       lines arrive in sequence exactly as on desktop. Only the video source
       changes, to a lighter 720p file. If a mobile browser refuses to seek it,
       the poster stays up and the story is unaffected, because the text
       sequence does not depend on the video.

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

   LOADING  The video is NOT fetched during startup. Nothing is requested until
   the preloader has finished and the browser reports idle, so the file never
   competes with fonts, CSS or JavaScript for bandwidth. Measured: the hero text
   paints in ~1s on every connection profile, while the desktop video takes 2s
   on fibre and 20s on a slow line — so it must not be in that critical window.
   Until it arrives the poster carries the hero, which is a fine outcome rather
   than a broken one.

   ASSETS  public/media/hero-dock.mp4        1920x1080, 9.0MB  (desktop)
           public/media/hero-dock-mobile.mp4 1280x720,  2.5MB  (<=767px)
   Both are 12fps with EVERY frame a keyframe. That encode is what makes
   seeking possible; a normally encoded file rebuilds from the previous
   keyframe on each seek and stutters badly.
   =========================================================================== */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { brand } from "@/brand/brand.config";
import { copy } from "@/content/copy";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsMobile } from "@/lib/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = "/media/hero-dock.mp4";
const MOBILE_VIDEO_SRC = "/media/hero-dock-mobile.mp4";
const POSTER_SRC = "/media/hero-dock-poster.jpg";

type Beat0HeroProps = {
  /** True once the preloader has finished. Gates the video download. */
  ready?: boolean;
};

export function Beat0Hero({ ready = false }: Beat0HeroProps) {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Only reduced motion disables the story. Screen size changes the video file
  // and the pin length, never whether the sequence runs at all.
  const staticMode = reducedMotion;
  const videoSrc = isMobile ? MOBILE_VIDEO_SRC : VIDEO_SRC;

  // Empty until we choose to start fetching. A <video> with no src simply shows
  // its poster, so the hero looks finished the whole time.
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const eyebrow = useRef<HTMLParagraphElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const subhead = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);

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
      if (!cancelled) setActiveSrc(videoSrc);
    };

    // requestIdleCallback waits for a genuine gap in the main thread. The
    // short timeout is the backstop: `ready` now fires while the preloader
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
  }, [ready, staticMode, videoSrc]);

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
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // Drive a proxy value across the pin and map it onto the video, rather
      // than tweening currentTime directly. Two reasons: the file may not have
      // arrived yet (deferred download), and duration is unknown until metadata
      // lands — so the tween must not bake either in at build time. While the
      // video is missing or unready this is simply a no-op and the poster
      // stays up; the text sequence is unaffected either way.
      const playhead = { progress: 0 };
      timeline.to(
        playhead,
        {
          progress: 1,
          ease: "none",
          onUpdate: () => {
            const media = video.current;
            if (!media || media.readyState < 1 || !media.duration) return;
            media.currentTime = playhead.progress * media.duration;
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

  /* -- prime the decoder ---------------------------------------------------
     Browsers will not seek a video that has never been handed to the decoder.
     A muted play/pause once metadata arrives primes it, so the first scroll
     shows a frame instead of an empty rectangle.                             */
  useEffect(() => {
    const element = video.current;
    if (!element || staticMode || !activeSrc) return;

    // A user gesture always unblocks a muted play on iOS — and scrolling IS
    // a touch — so a refused prime is retried on the first interaction and
    // the footage recovers almost immediately.
    const retry = () => {
      element
        .play()
        .then(() => element.pause())
        .catch(() => {
          /* still refused — the poster layer underneath carries the hero */
        });
    };

    const prime = () => {
      element
        .play()
        .then(() => element.pause())
        .catch(() => {
          // Autoplay refused (iOS Low Power Mode is the common cause).
          window.addEventListener("touchstart", retry, { once: true, passive: true });
          window.addEventListener("pointerdown", retry, { once: true });
        });
      ScrollTrigger.refresh();
    };

    if (element.readyState >= 2) prime();
    else element.addEventListener("loadeddata", prime, { once: true });

    return () => {
      element.removeEventListener("loadeddata", prime);
      window.removeEventListener("touchstart", retry);
      window.removeEventListener("pointerdown", retry);
    };
  }, [staticMode, activeSrc]);

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
          {/* Poster safety net. iOS drops the native poster the moment the
              scrub seeks, and if the decoder has no frame yet (Low Power
              Mode blocks even muted play()) the element paints NOTHING —
              a black hero, seen live on the deployed site. A real <img>
              under the video means "no frame yet" shows the poster. */}
          <img
            src={POSTER_SRC}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <video
            ref={video}
            key={activeSrc ?? "idle"}
          src={activeSrc ?? undefined}
          poster={POSTER_SRC}
          muted
          playsInline
          preload={activeSrc ? "auto" : "none"}
          aria-hidden="true"
          tabIndex={-1}
            className="absolute inset-0 -z-10 h-full w-full object-cover"
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
