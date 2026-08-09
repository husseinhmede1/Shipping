/* ===========================================================================
   BEAT 1b — THE REVEAL (the drone rises — real footage)

   The take-off: the sharp face still (the curtain) pushes in, the frame
   blows out to a white exposure flash, and when it clears the real footage
   is already moving — drone rising off the driving truck, scrubbed by
   scroll. The still and the footage never share the screen (a crossfade
   between them read as a double exposure), and the footage's soft first
   second is trimmed away entirely — Veo renders extreme close-ups blurry,
   so the sharp still owns the close-up and the video owns the motion. At
   the top of the rise a white wash brightens the frame and the fixed
   sprite truck takes over at the exact size the video left it.

   The video is a salvaged cut of a Veo take (public/media/reveal-rise-src
   .mp4): t=1.2s to the apex of the rise at t=5.25s (the camera descends
   again after — trimmed). Portrait on purpose — native fit on phones,
   centre-cropped by object-cover on desktop. Encoded like the hero: 12fps,
   EVERY frame a keyframe, which is what makes seeking smooth.

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
// The video's own first frame (post-trim). Only ever seen under the white
// flash if the file hasn't arrived yet.
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
      {/* Invisible until the pin engages, and hidden under the face-zoom
          still until the flash swaps them. Absolute, not fixed — absolute
          children ride along with the pinned section safely. */}
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
        {/* Duplicates of the curtain's overlays — see App. */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="film-grain absolute inset-0" />
        {/* The white wash: altitude becomes whiteness at the top of the rise,
            which is where the sprite truck takes over on the page's ground. */}
        <div id="reveal-white" className="absolute inset-0 bg-page opacity-0" />
      </div>
    </section>
  );
}
