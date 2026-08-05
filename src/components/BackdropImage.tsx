/* ===========================================================================
   BACKDROP IMAGE

   A full-bleed still that slowly scales as the section passes through the
   viewport. That slow drift is the whole trick behind pages that feel like
   film but are actually built from a handful of photographs — the eye reads
   gradual movement as motion, so a single image does the work of a video at a
   fraction of the weight. These are ~100KB each; the hero video is 9MB.

   Ships WebP with a JPG fallback, and lazy-loads: the browser only fetches the
   image when the section is near the viewport.

   Under prefers-reduced-motion the image simply sits still.
   =========================================================================== */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

type BackdropImageProps = {
  /** Basename in /media, without extension — e.g. "bg-container-hanging". */
  name: string;
  /** Empty string: these are decorative, the copy carries the meaning. */
  alt?: string;
  /** How far it drifts across the section. 1.12 = 12% zoom, subtle on purpose. */
  scale?: number;
  className?: string;
};

export function BackdropImage({
  name,
  alt = "",
  scale = 1.12,
  className,
}: BackdropImageProps) {
  const reducedMotion = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (reducedMotion || !wrap.current || !image.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        image.current,
        { scale: 1, yPercent: -2 },
        {
          scale,
          yPercent: 2,
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    }, wrap);

    return () => context.revert();
  }, [reducedMotion, scale]);

  return (
    <div
      ref={wrap}
      aria-hidden={alt === "" ? true : undefined}
      className={cn("absolute inset-0 -z-10 overflow-hidden bg-[var(--neutral-950)]", className)}
    >
      <picture>
        <source srcSet={`/media/${name}.webp`} type="image/webp" />
        <img
          ref={image}
          src={`/media/${name}.jpg`}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={2752}
          height={1536}
          className="h-full w-full object-cover will-change-transform"
        />
      </picture>

      {/* Scrims. The left-heavy one guarantees contrast under the copy column;
          the vertical one melts the top and bottom edges into the page so the
          image reads as part of the page rather than a rectangle dropped on it. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--neutral-950)] via-[var(--neutral-950)]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--neutral-950)] via-transparent to-[var(--neutral-950)]" />

      {/* Same grain as the hero, so stills and footage share a surface. */}
      <div className="film-grain absolute inset-0" />
    </div>
  );
}
