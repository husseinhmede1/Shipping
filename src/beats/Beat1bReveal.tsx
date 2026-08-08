/* ===========================================================================
   BEAT 1b — THE REVEAL (the drone rises — real footage)

   One continuous camera move, now with real motion. The visitor has been
   staring at the yellow container surface (the fixed curtain from Beat 0/1).
   Here a scroll-scrubbed video takes over: a true top-down drone shot that
   starts inches above the container and rises straight up, revealing the
   truck driving beneath — wheels rolling, ground sliding past. At the top of
   the rise a white wash brightens the frame and the fixed sprite truck takes
   over at the exact size the video left it, then drives the rest of the page.

   The video is a salvaged cut of a Veo take (public/media/reveal-rise-src
   .mp4): the first 5.25s are one perfect monotonic rise before the camera
   descended again, so the encode stops at the apex. Portrait on purpose —
   native fit on phones, centre-cropped by object-cover on desktop. Encoded
   like the hero: 12fps, EVERY frame a keyframe, which is what makes seeking
   smooth.

   This component owns the markup and the video loading; the timeline that
   drives everything (face crossfade, scrub, white wash, sprite handoff)
   lives in JourneyLayers, because the handoff's star is its fixed truck.

   LOADING mirrors the hero: no src until the preloader is done and the page
   is idle, so the file never competes with startup. Until then the poster
   (the video's own first frame) carries the section. A muted play/pause
   primes the decoder once data arrives — browsers refuse to seek a video
   the decoder has never seen.

   Reduced motion: nothing. There are no fixed travellers, so the story goes
   straight from the container face to the road sections.
   =========================================================================== */

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "@/lib/useReducedMotion";

const VIDEO_SRC = "/media/reveal-rise.mp4";
const POSTER_SRC = "/media/reveal-rise-poster.jpg";

type Beat1bRevealProps = {
  /** True once the preloader has finished. Gates the video download. */
  ready?: boolean;
};

export function Beat1bReveal({ ready = false }: Beat1bRevealProps) {
  const reducedMotion = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  /* -- start the download once the page is out of the way ------------------ */
  useEffect(() => {
    if (reducedMotion || !ready) return;

    let cancelled = false;
    const begin = () => {
      if (!cancelled) setActiveSrc(VIDEO_SRC);
    };

    const idle = window.requestIdleCallback;
    if (typeof idle === "function") {
      const handle = idle(begin, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(handle);
      };
    }

    const timer = window.setTimeout(begin, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, reducedMotion]);

  /* -- prime the decoder so the first scrub shows a frame ------------------- */
  useEffect(() => {
    const element = video.current;
    if (!element || reducedMotion || !activeSrc) return;

    const prime = () => {
      element
        .play()
        .then(() => element.pause())
        .catch(() => {
          /* autoplay refused — the poster stays up, which is fine */
        });
      ScrollTrigger.refresh();
    };

    if (element.readyState >= 2) prime();
    else element.addEventListener("loadeddata", prime, { once: true });

    return () => element.removeEventListener("loadeddata", prime);
  }, [reducedMotion, activeSrc]);

  if (reducedMotion) return null;

  return (
    <section
      id="reveal-zone"
      aria-hidden="true"
      className="relative z-30 h-[100svh] overflow-hidden"
    >
      {/* Invisible until the pin engages (JourneyLayers switches it on under
          cover of #face-zoom). Absolute, not fixed — absolute children ride
          along with the pinned section safely. */}
      <div id="reveal-backdrop" className="invisible absolute inset-0 bg-page">
        <video
          id="reveal-video"
          ref={video}
          key={activeSrc ?? "idle"}
          src={activeSrc ?? undefined}
          poster={POSTER_SRC}
          muted
          playsInline
          preload={activeSrc ? "auto" : "none"}
          tabIndex={-1}
          className="h-full w-full object-cover"
        />
        {/* The white wash: altitude becomes whiteness at the top of the rise,
            which is where the sprite truck takes over on the page's ground. */}
        <div id="reveal-white" className="absolute inset-0 bg-page opacity-0" />
      </div>
    </section>
  );
}
