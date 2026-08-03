/* ===========================================================================
   BEAT 0 — HERO
   Bold headline, subhead, primary CTA.

   TODO (motion): subtle ambient movement suggesting "things in motion" — a
   shipping mark settling in, or a dot travelling a dashed route line. Keep it
   ambient and looping; it must not delay the LCP text.
   Reduced motion: render the final composed state, no looping animation.
   =========================================================================== */

import { brand } from "@/brand/brand.config";
import { copy } from "@/content/copy";

export function Beat0Hero() {
  return (
    <header className="relative overflow-hidden bg-brand px-5 pt-28 pb-32 text-white sm:px-8 md:pt-36 md:pb-40">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          {copy.hero.eyebrow}
        </p>

        <h1 className="mt-6 max-w-4xl text-4xl leading-[1.08] font-semibold text-white sm:text-5xl md:text-6xl">
          {copy.hero.headline}
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-white/75 md:text-xl">{copy.hero.subhead}</p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={brand.cta.primary.href}
            className="rounded-input bg-cta px-6 py-3 font-semibold text-brand transition-transform duration-200 hover:-translate-y-0.5"
          >
            {brand.cta.primary.label}
          </a>
          <a
            href={brand.cta.secondary.href}
            className="rounded-input border border-white/25 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-white/10"
          >
            {brand.cta.secondary.label}
          </a>
        </div>

        <p className="mt-8 text-sm text-white/50">{copy.hero.note}</p>
      </div>
    </header>
  );
}
