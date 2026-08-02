import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { brand } from "@/brand/brand.config";
import { copy } from "@/content/copy";

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
 */
export default function App() {
  useSmoothScroll();

  return (
    <>
      <a
        href="#the-chaos"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-input focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>

      <main>
        <Beat0Hero />
        <Beat1Chaos />
        <Beat2Order />
        <Beat3Ledger />
        <Beat4Pipeline />
        <Beat5Journey />
        <Beat6Updates />
        <Beat7Features />
        <Beat8Cta />
      </main>

      <footer className="border-t border-line px-5 py-10 sm:px-8">
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
