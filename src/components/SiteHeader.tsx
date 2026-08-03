/* ===========================================================================
   SITE HEADER

   Fixed and transparent over the hero, then a blurred dark bar once the page
   scrolls past it. The two states matter because this page alternates dark and
   light sections — white type stays readable over the hero footage on its own,
   but would vanish the moment a light section scrolled under it.

   The switch is driven by an IntersectionObserver on the section that follows
   the hero, not by a scroll threshold. The hero is pinned for several viewport
   heights, so "have we scrolled 100px" tells you nothing about whether we have
   actually left it.

   REPLACE ME: the logo is a placeholder. See src/brand/LogoMark.tsx.
   =========================================================================== */

import { useEffect, useState } from "react";

import { brand } from "@/brand/brand.config";
import { copy } from "@/content/copy";
import { LogoMark } from "@/brand/LogoMark";
import { getLenis } from "@/lib/useSmoothScroll";
import { cn } from "@/lib/cn";

/** The first section after the hero. Once it reaches the bar, the bar solidifies. */
const SENTINEL_ID = "the-chaos";
const BAR_HEIGHT = 76;

export function SiteHeader() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(SENTINEL_ID);
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSolid(entry.boundingClientRect.top <= BAR_HEIGHT),
      { rootMargin: `-${BAR_HEIGHT}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  /** Anchor jumps must go through Lenis, or they fight the smooth scrolling. */
  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -BAR_HEIGHT });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        solid
          ? "border-b border-white/10 bg-brand/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-5 sm:px-8"
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(0);
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-on-video flex shrink-0 items-center gap-2.5"
          aria-label={`${brand.name} — back to top`}
        >
          <LogoMark className="h-6 w-6 text-accent sm:h-7 sm:w-7" />
          <span className="font-heading text-base font-semibold tracking-tight sm:text-lg">
            {brand.name}
          </span>
        </a>

        {/* Links are desktop-only for now — a phone menu is its own piece of
            work (overlay, focus trap, escape handling) and is not built yet. */}
        <ul className="hidden items-center gap-8 md:flex">
          {copy.nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => goTo(e, item.href)}
                className="text-on-video text-sm font-medium opacity-80 transition-opacity duration-200 hover:opacity-100"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={brand.cta.primary.href}
          onClick={(e) => goTo(e, brand.cta.primary.href)}
          className="text-on-video shrink-0 rounded-pill border border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 sm:px-5"
        >
          {brand.cta.primary.label}
        </a>
      </nav>
    </header>
  );
}
