import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { brand } from "@/brand/brand.config";
import { copy } from "@/content/copy";
import { Preloader } from "@/components/preloader/Preloader";
import { SiteHeader } from "@/components/SiteHeader";

import { JourneyLayers } from "@/components/JourneyLayers";

import { Beat0Hero } from "@/beats/Beat0Hero";
import { Beat1Chaos } from "@/beats/Beat1Chaos";
import { Beat1bReveal } from "@/beats/Beat1bReveal";
import { Beat2Order } from "@/beats/Beat2Order";
import { Beat3Ledger } from "@/beats/Beat3Ledger";
import { Beat4Pipeline } from "@/beats/Beat4Pipeline";
import { Beat5Journey } from "@/beats/Beat5Journey";
import { Beat6Updates } from "@/beats/Beat6Updates";
import { Beat7Features } from "@/beats/Beat7Features";
import { Beat8Cta } from "@/beats/Beat8Cta";

/**
 * The whole page, in scroll order. Each beat owns its own layout, copy import
 * and (once built) its own scroll animation plus reduced-motion fallback.
 *
 * The preloader sits above everything until loading completes. The page renders
 * underneath it the whole time, so it is fully painted by the moment the wipe
 * reveals it — no flash of half-built layout.
 */
export default function App() {
  // Gates the hero video download: nothing heavy is fetched until the
  // preloader is out of the way and the page is idle.
  const [loaded, setLoaded] = useState(false);
  useSmoothScroll();

  // CRITICAL: triggers refresh in CREATION order unless sorted, and a trigger
  // refreshing before a pinned section that sits above it on the page measures
  // its positions without that pin's spacer. JourneyLayers mounts before the
  // pipeline, so its road-b / flight-zone triggers landed ~3600px (the
  // pipeline pin's length) too early. Sorting must happen HERE: a parent's
  // effect runs after every child's, so this is the first moment all triggers
  // exist. The preloader's refresh() below then recomputes with the right
  // order.
  useEffect(() => {
    ScrollTrigger.sort();
  }, []);

  return (
    <>
      <Preloader
        onDone={() => {
          setLoaded(true);
          // Re-measure once the preloader has released its scroll lock. Any
          // ScrollTrigger created while the body was locked measured a page
          // with no scrollbar, and pinning bakes that width in as pixels.
          ScrollTrigger.refresh();
        }}
      />

      <SiteHeader />

      <a
        href="#the-chaos"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-input focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>

      <main>
        <Beat0Hero ready={loaded} />

        {/* The container curtain. Driven by the hero's timeline: descends
            over the hero at the end of its pin, then stays fixed as Beat 1's
            background. Lives here because it must not sit inside the pinned
            hero (transformed ancestors capture fixed children). z-20: above
            the hero, below Beat 1's content and the z-30 wrapper below.

            CRITICAL: the image is the reveal video's own FIRST FRAME
            (curtain-rise), rendered exactly as the video renders it (fixed
            full-viewport object-cover). When the reveal pin engages and the
            video appears, not a single pixel changes — the picture simply
            starts moving. That identity is the transition; there is no
            crossfade anywhere (an earlier dissolve between two mismatched
            container textures read as a double exposure). */}
        <div
          id="container-curtain"
          aria-hidden="true"
          className="invisible fixed inset-0 z-20 pointer-events-none"
        >
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
          {/* These two overlays are duplicated on the reveal's video stack —
              both stacks must render identically for the invisible switch. */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
          <div className="film-grain absolute inset-0" />
        </div>

        <Beat1Chaos />

        {/* The drone-rise reveal: a transparent pinned viewport. The zoom
            itself — face shrinking into the truck's container — is driven by
            JourneyLayers, whose fixed truck is the star of the scene. Sits
            OUTSIDE the opaque wrapper so the curtain face stays visible right
            up to the pin. */}
        <Beat1bReveal ready={loaded} />

        {/* Opaque wrapper above the fixed container-face curtain (z-20).
            Without it, every page-toned (transparent) section after Beat 1
            would show the curtain behind it forever. Also hosts the journey
            layers (fixed truck / field / clouds / plane) as positioned
            children, painting above the wrapper background and below the
            z-10 section content. */}
        <div className="relative z-30 bg-page">
          <JourneyLayers />

          {/* The road: one continuous drive from the reveal through Order,
              Ledger, Pipeline and Journey. Starts the moment the reveal
              unpins (the truck is already in position), ends with the truck
              shrinking away as the camera rises into the flight. */}
          <div id="road">
            <Beat2Order />
            <Beat3Ledger />
            <Beat4Pipeline />
            <Beat5Journey />
          </div>

          {/* Flight zone: fixed field + clouds behind, plane crossing.
              The plane is gone before the closing form arrives. */}
          <div id="flight-zone">
            <Beat6Updates />
            <Beat7Features />
          </div>

          <Beat8Cta />
        </div>
      </main>

      <footer className="relative z-30 border-t border-line bg-page px-5 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <p>
            <span className="font-semibold text-ink">{brand.name}</span> — {brand.tagline}
          </p>
          <p>
            &copy; {new Date().getFullYear()} {brand.name}. {copy.footer.rights}
          </p>
        </div>
      </footer>
    </>
  );
}
