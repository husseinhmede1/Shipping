import { useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { brand } from "@/brand/brand.config";
import { copy } from "@/content/copy";
import { Preloader } from "@/components/preloader/Preloader";
import { SiteHeader } from "@/components/SiteHeader";

import { Beat0Hero } from "@/beats/Beat0Hero";
import { Beat1Chaos } from "@/beats/Beat1Chaos";
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

        {/* The container-face curtain. Driven by the hero's timeline: descends
            over the hero at the end of its pin, then stays fixed as Beat 1's
            background. Lives here because it must not sit inside the pinned
            hero (transformed ancestors capture fixed children). z-20: above
            the hero, below Beat 1's content and the z-30 wrapper below. */}
        <div
          id="container-curtain"
          aria-hidden="true"
          className="invisible fixed inset-0 z-20 pointer-events-none"
        >
          <picture>
            <source srcSet="/media/bg-container-face.webp" type="image/webp" />
            <img
              src="/media/bg-container-face.jpg"
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
          <div className="film-grain absolute inset-0" />
        </div>

        <Beat1Chaos />
        {/* Opaque wrapper above the fixed container-face curtain (z-20).
            Without it, every page-toned (transparent) section after Beat 1
            would show the curtain behind it forever. */}
        <div className="relative z-30 bg-page">
          <Beat2Order />
          <Beat3Ledger />
          <Beat4Pipeline />
          <Beat5Journey />
          <Beat6Updates />
          <Beat7Features />
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
