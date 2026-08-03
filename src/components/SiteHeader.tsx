/* ===========================================================================
   SITE HEADER

   Sits inside the hero, so it stays put for the whole pinned sequence and then
   scrolls away with it. A landing page does not need a persistent nav — the
   closing section carries the real call to action — but it absolutely needs a
   brand mark, or the visitor cannot tell whose site they are on.

   REPLACE ME: the logo is a placeholder. See src/brand/LogoMark.tsx.
   =========================================================================== */

import { brand } from "@/brand/brand.config";
import { LogoMark } from "@/brand/LogoMark";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <a
          href="#top"
          className="text-on-video flex items-center gap-2.5"
          aria-label={`${brand.name} — home`}
        >
          <LogoMark className="h-7 w-7 text-accent sm:h-8 sm:w-8" />
          <span className="font-heading text-base font-semibold tracking-tight sm:text-lg">
            {brand.name}
          </span>
        </a>

        <a
          href={brand.cta.primary.href}
          className="text-on-video rounded-pill border border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 sm:px-5"
        >
          {brand.cta.primary.label}
        </a>
      </div>
    </header>
  );
}
